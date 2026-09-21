import re
from datetime import datetime
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, get_user_mine_ids, check_mine_access
from app.models.user import User, UserRole
from app.models.mine import Mine
from app.models.compliance import Compliance, ComplianceStatus, RiskLevel
from app.models.observation import Observation, ObservationSeverity, ObservationStatus
from app.models.inspection import Inspection
from app.models.contractor import Contractor
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse, QueryQuickAction

router = APIRouter()


def is_hindi(text: str) -> bool:
    """Detect if text contains Devanagari Unicode characters."""
    return any('ऀ' <= char <= 'ॿ' for char in text)


@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(
    request: AssistantChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AssistantChatResponse:
    """
    Multilingual conversational assistant for CoalGuard AI (Section 15 PRD).
    Understands English and Hindi queries to provide real-time DB analytics,
    compliance status, high-risk safety observations, and quick actions.
    """
    query = request.message.strip().lower()
    user_lang = request.language
    if user_lang == "auto" or not user_lang:
        user_lang = "hi" if is_hindi(request.message) else "en"

    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    is_admin_or_corp = current_user.role in [UserRole.admin, UserRole.corporate, UserRole.regulatory]

    # Target specific mine or user mines
    filter_mine_id = request.mine_id
    if filter_mine_id and not is_admin_or_corp and filter_mine_id not in user_mine_ids:
        filter_mine_id = user_mine_ids[0] if user_mine_ids else None

    # Retrieve basic context
    mines_stmt = select(Mine)
    if not is_admin_or_corp and user_mine_ids:
        mines_stmt = mines_stmt.where(Mine.id.in_(user_mine_ids))
    mines_res = await db.execute(mines_stmt)
    accessible_mines = mines_res.scalars().all()
    mine_map = {m.id: m.name for m in accessible_mines}

    quick_actions: List[QueryQuickAction] = []
    data_context: dict[str, Any] = {}

    # Query Intent Detection
    # 1. OVERDUE COMPLIANCE ITEMS
    if any(k in query for k in ["overdue", "due", "विलंबित", "बकाया", "deadline", "समय सीमा", "अनुपालन"]):
        comp_stmt = select(Compliance).where(
            Compliance.status == ComplianceStatus.overdue
        )
        if filter_mine_id:
            comp_stmt = comp_stmt.where(Compliance.mine_id == filter_mine_id)
        elif not is_admin_or_corp and user_mine_ids:
            comp_stmt = comp_stmt.where(Compliance.mine_id.in_(user_mine_ids))

        comp_res = await db.execute(comp_stmt)
        overdue_items = comp_res.scalars().all()

        data_context["overdue_count"] = len(overdue_items)
        data_context["items"] = [
            {
                "id": item.id,
                "mine": mine_map.get(item.mine_id, "Mine"),
                "requirement": item.requirement,
                "category": item.category,
                "due_date": item.due_date.isoformat() if item.due_date else None,
                "risk_level": item.risk_level.value if hasattr(item.risk_level, 'value') else item.risk_level
            }
            for item in overdue_items[:5]
        ]

        quick_actions.append(QueryQuickAction(label="Open Compliance Register", action_type="navigate", payload="/mine/compliance"))
        quick_actions.append(QueryQuickAction(label="Check Overdue Items", action_type="filter", payload="overdue"))

        if user_lang == "hi":
            if not overdue_items:
                reply = "✅ बहुत बढ़िया! आपके अधिकार क्षेत्र में कोई भी वैधानिक अनुपालन (Compliance) लंबित या विलंबित नहीं है।"
            else:
                reply = f"⚠️ कुल **{len(overdue_items)}** वैधानिक अनुपालन (Compliance) समय सीमा पार कर चुके हैं:\n\n"
                for idx, itm in enumerate(overdue_items[:4], 1):
                    m_name = mine_map.get(itm.mine_id, "खदान")
                    reply += f"{idx}. **[{m_name}]** {itm.requirement} (श्रेणी: *{itm.category}*)\n"
                if len(overdue_items) > 4:
                    reply += f"\n...और {len(overdue_items) - 4} अन्य रिकॉर्ड। विवरण देखने के लिए रजिस्टर खोलें।"
        else:
            if not overdue_items:
                reply = "✅ Great news! There are currently **no overdue compliance items** across your assigned coal leases."
            else:
                reply = f"⚠️ Found **{len(overdue_items)} overdue compliance obligations** requiring immediate attention:\n\n"
                for idx, itm in enumerate(overdue_items[:4], 1):
                    m_name = mine_map.get(itm.mine_id, "Mine")
                    reply += f"{idx}. **[{m_name}]** {itm.requirement} — *Category: {itm.category}*\n"
                if len(overdue_items) > 4:
                    reply += f"\n...and {len(overdue_items) - 4} more items. You can view all in the Compliance Register."

        return AssistantChatResponse(reply=reply, language=user_lang, data_context=data_context, quick_actions=quick_actions)

    # 2. HIGH RISK OBSERVATIONS / HAZARDS
    if any(k in query for k in ["high risk", "critical", "hazard", "observation", "जोखिम", "आपत्ति", "खतरा", "गंभीर"]):
        obs_stmt = select(Observation).where(
            Observation.severity.in_([ObservationSeverity.critical, ObservationSeverity.high]),
            Observation.status.in_([ObservationStatus.open, ObservationStatus.in_progress])
        )
        obs_res = await db.execute(obs_stmt)
        high_risk_obs = obs_res.scalars().all()

        data_context["high_risk_count"] = len(high_risk_obs)
        data_context["observations"] = [
            {
                "id": o.id,
                "description": o.description,
                "severity": o.severity.value if hasattr(o.severity, 'value') else o.severity,
                "status": o.status.value if hasattr(o.status, 'value') else o.status,
            }
            for o in high_risk_obs[:5]
        ]

        quick_actions.append(QueryQuickAction(label="View Hazard Log", action_type="navigate", payload="/mine/observations"))
        quick_actions.append(QueryQuickAction(label="Open Risk Map", action_type="navigate", payload="/map"))

        if user_lang == "hi":
            if not high_risk_obs:
                reply = "🛡️ बहुत अच्छा! इस समय कोई भी खुला उच्च-जोखिम (High/Critical) सुरक्षा खतरा दर्ज नहीं है।"
            else:
                reply = f"🚨 वर्तमान में **{len(high_risk_obs)} उच्च-जोखिम (High/Critical) सुरक्षा आपत्तियां** सक्रिय हैं:\n\n"
                for idx, o in enumerate(high_risk_obs[:4], 1):
                    reply += f"{idx}. **[{o.severity.upper()}]** {o.description} (स्थिति: *{o.status}*)\n"
                reply += "\nतत्काल सुधारात्मक कार्रवाई (Corrective Action) शुरू करने की सलाह दी जाती है।"
        else:
            if not high_risk_obs:
                reply = "🛡️ Excellent! There are currently **no open high-risk or critical safety hazards** logged."
            else:
                reply = f"🚨 There are **{len(high_risk_obs)} active high-risk / critical safety observations** requiring intervention:\n\n"
                for idx, o in enumerate(high_risk_obs[:4], 1):
                    reply += f"{idx}. **[{o.severity.upper()}]** {o.description} (*Status: {o.status}*)\n"
                reply += "\nPlease inspect the Hazard Tracking log to assign corrective actions."

        return AssistantChatResponse(reply=reply, language=user_lang, data_context=data_context, quick_actions=quick_actions)

    # 3. INSPECTION SUMMARY / RECENT AUDITS
    if any(k in query for k in ["inspection", "audit", "निरीक्षण", "ऑडिट", "जांच"]):
        insp_stmt = select(Inspection).order_by(Inspection.date.desc()).limit(5)
        if filter_mine_id:
            insp_stmt = insp_stmt.where(Inspection.mine_id == filter_mine_id)
        insp_res = await db.execute(insp_stmt)
        inspections = insp_res.scalars().all()

        quick_actions.append(QueryQuickAction(label="New Field Inspection", action_type="navigate", payload="/mine/inspections/new"))
        quick_actions.append(QueryQuickAction(label="All Inspections", action_type="navigate", payload="/mine/inspections"))

        if user_lang == "hi":
            reply = f"📋 हाल ही में संपन्न हुए **{len(inspections)} वैधानिक निरीक्षण (Inspections)** का विवरण:\n\n"
            for idx, insp in enumerate(inspections, 1):
                m_name = mine_map.get(insp.mine_id, "खदान")
                reply += f"{idx}. **[{m_name}]** {insp.inspection_type.capitalize()} ऑडिट — दिनांक: {insp.date.strftime('%d %b %Y')} ({insp.status})\n"
        else:
            reply = f"📋 Here are the **{len(inspections)} most recent statutory field inspections**:\n\n"
            for idx, insp in enumerate(inspections, 1):
                m_name = mine_map.get(insp.mine_id, "Mine")
                reply += f"{idx}. **[{m_name}]** {insp.inspection_type.capitalize()} Audit — Date: {insp.date.strftime('%d %b %Y')} (*Status: {insp.status}*)\n"

        return AssistantChatResponse(reply=reply, language=user_lang, data_context=data_context, quick_actions=quick_actions)

    # 4. MINE STATUS SUMMARY & GENERAL KPI
    if any(k in query for k in ["summary", "status", "mine", "खदान", "स्थिति", "डैशबोर्ड", "dashboard", "report"]):
        total_mines = len(accessible_mines)
        comp_count_res = await db.execute(select(func.count(Compliance.id)))
        total_comp = comp_count_res.scalar() or 0
        obs_count_res = await db.execute(select(func.count(Observation.id)))
        total_obs = obs_count_res.scalar() or 0

        quick_actions.append(QueryQuickAction(label="Corporate Dashboard", action_type="navigate", payload="/corporate"))
        quick_actions.append(QueryQuickAction(label="Mine Overview", action_type="navigate", payload="/mine/dashboard"))

        if user_lang == "hi":
            reply = f"🏢 **कोल-गार्ड AI प्रणाली स्थिति सारांश:**\n\n"
            reply += f"• 📍 **सक्रिय खदानें:** {total_mines}\n"
            reply += f"• 📑 **कुल वैधानिक अनुपालन रिकॉर्ड:** {total_comp}\n"
            reply += f"• ⚠️ **कुल दर्ज सुरक्षा आपत्तियां:** {total_obs}\n\n"
            reply += "आप मुझसे लंबित अनुपालन, उच्च-जोखिम खतरों, या हाल के निरीक्षणों के बारे में पूछ सकते हैं।"
        else:
            reply = f"🏢 **CoalGuard AI Operational Governance Summary:**\n\n"
            reply += f"• 📍 **Active Coal Leases / Mines:** {total_mines}\n"
            reply += f"• 📑 **Total Statutory Compliance Records:** {total_comp}\n"
            reply += f"• ⚠️ **Total Recorded Safety Observations:** {total_obs}\n\n"
            reply += "You can ask me to filter overdue compliance, show critical hazards, or review recent DGMS inspections."

        return AssistantChatResponse(reply=reply, language=user_lang, data_context=data_context, quick_actions=quick_actions)

    # DEFAULT / FALLBACK
    quick_actions = [
        QueryQuickAction(label="Show Overdue Compliance", action_type="query", payload="Show overdue compliance items"),
        QueryQuickAction(label="High Risk Observations", action_type="query", payload="Which mines have high-risk observations?"),
        QueryQuickAction(label="Recent Inspections", action_type="query", payload="Show recent inspections"),
    ]

    if user_lang == "hi":
        reply = "नमस्ते! मैं **CoalGuard AI** का बहुभाषी सहायक हूँ। आप मुझसे खदान अनुपालन, सुरक्षा निरीक्षण, या उच्च-जोखिम वाले खतरों के बारे में अंग्रेजी या हिंदी में पूछ सकते हैं।"
    else:
        reply = "Hello! I am the **CoalGuard AI** Smart Assistant. I can help you monitor statutory compliance, safety hazards, audit checklists, and DGMS regulations. Try clicking one of the suggested actions below:"

    return AssistantChatResponse(reply=reply, language=user_lang, data_context=data_context, quick_actions=quick_actions)
