from __future__ import annotations
from typing import List, Dict, Any, Optional, Union
from datetime import date
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import (
    get_current_user,
    get_user_mine_ids,
    require_role,
)
from app.models.compliance import (
    Compliance,
    ComplianceCategory,
    ComplianceStatus,
)
from app.models.contractor import (
    Contractor,
    ContractorComplianceStatus,
)
from app.models.corrective_action import CorrectiveAction, CorrectiveActionStatus
from app.models.inspection import Inspection
from app.models.mine import Mine
from app.models.observation import (
    Observation,
    ObservationSeverity,
    ObservationStatus,
)
from app.models.risk_score import RiskScore
from app.models.user import User, UserRole
from app.schemas.report import (
    ComplianceReportItem,
    ComplianceReportResponse,
    ContractorReportResponse,
    ExecutiveSummaryResponse,
    SafetyReportResponse,
)

router = APIRouter()


@router.get("/compliance", response_model=ComplianceReportResponse)
async def get_compliance_report(
    mine_id: UUID | None = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Generate compliance report."""
    query = select(Compliance)

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Compliance.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Compliance.mine_id == str(mine_id))
    if from_date:
        query = query.where(Compliance.due_date >= from_date)
    if to_date:
        query = query.where(Compliance.due_date <= to_date)

    result = await db.execute(query)
    items = result.scalars().all()

    mine_name = None
    if mine_id:
        mine_stmt = select(Mine.name).where(Mine.id == str(mine_id))
        mine_name = (await db.execute(mine_stmt)).scalar_one_or_none()

    categories = list(ComplianceCategory)
    by_category = []

    for cat in categories:
        cat_items = [i for i in items if i.category == cat]
        total = len(cat_items)
        completed = sum(1 for i in cat_items if i.status == ComplianceStatus.completed)
        overdue = sum(1 for i in cat_items if i.status == ComplianceStatus.overdue or (i.status != ComplianceStatus.completed and i.due_date < date.today()))
        pending = sum(1 for i in cat_items if i.status in [ComplianceStatus.pending, ComplianceStatus.in_progress])
        rate = round((completed / total * 100), 1) if total > 0 else 100.0

        by_category.append(
            ComplianceReportItem(
                category=cat.value,
                total=total,
                completed=completed,
                overdue=overdue,
                pending=pending,
                compliance_rate=rate,
            )
        )

    total_all = len(items)
    completed_all = sum(1 for i in items if i.status == ComplianceStatus.completed)
    overall_rate = round((completed_all / total_all * 100), 1) if total_all > 0 else 100.0

    return {
        "mine_id": mine_id,
        "mine_name": mine_name,
        "from_date": from_date,
        "to_date": to_date,
        "summary": {
            "total": total_all,
            "completed": completed_all,
            "overall_rate": overall_rate,
        },
        "by_category": by_category,
    }


@router.get("/safety", response_model=SafetyReportResponse)
async def get_safety_report(
    mine_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Generate safety and inspection report."""
    insp_query = select(func.count(Inspection.id))
    obs_query = select(Observation)
    actions_query = select(CorrectiveAction)

    if mine_id:
        insp_query = insp_query.where(Inspection.mine_id == str(mine_id))
        obs_query = obs_query.join(Inspection, Observation.inspection_id == Inspection.id).where(Inspection.mine_id == str(mine_id))
        actions_query = (
            actions_query.join(Observation, CorrectiveAction.observation_id == Observation.id)
            .join(Inspection, Observation.inspection_id == Inspection.id)
            .where(Inspection.mine_id == str(mine_id))
        )

    total_inspections = (await db.execute(insp_query)).scalar_one()

    obs_result = await db.execute(obs_query)
    observations = obs_result.scalars().all()

    actions_result = await db.execute(actions_query)
    actions = actions_result.scalars().all()

    severity_counts = {
        "low": sum(1 for o in observations if o.severity == ObservationSeverity.low),
        "medium": sum(1 for o in observations if o.severity == ObservationSeverity.medium),
        "high": sum(1 for o in observations if o.severity == ObservationSeverity.high),
        "critical": sum(1 for o in observations if o.severity == ObservationSeverity.critical),
    }

    resolved_actions = sum(1 for a in actions if a.status in [CorrectiveActionStatus.completed, CorrectiveActionStatus.verified])

    return {
        "mine_id": mine_id,
        "total_inspections": total_inspections,
        "total_observations": len(observations),
        "observations_by_severity": severity_counts,
        "corrective_actions_total": len(actions),
        "corrective_actions_resolved": resolved_actions,
    }


@router.get("/contractor", response_model=ContractorReportResponse)
async def get_contractor_report(
    mine_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Generate contractor compliance report."""
    query = select(Contractor).where(Contractor.is_active == True)  # noqa: E712
    if mine_id:
        query = query.where(Contractor.mine_id == str(mine_id))

    result = await db.execute(query)
    contractors = result.scalars().all()

    total = len(contractors)
    compliant = sum(1 for c in contractors if c.compliance_status == ContractorComplianceStatus.compliant)
    non_compliant = sum(1 for c in contractors if c.compliance_status == ContractorComplianceStatus.non_compliant)
    under_review = sum(1 for c in contractors if c.compliance_status == ContractorComplianceStatus.under_review)
    total_workers = sum(c.worker_count for c in contractors)

    return {
        "mine_id": mine_id,
        "total_contractors": total,
        "compliant_count": compliant,
        "non_compliant_count": non_compliant,
        "under_review_count": under_review,
        "total_workers": total_workers,
    }


@router.get("/executive-summary", response_model=ExecutiveSummaryResponse)
async def get_executive_summary(
    current_user: User = Depends(require_role(UserRole.admin, UserRole.corporate, UserRole.regulatory)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Multi-mine executive summary (Corporate, Admin, Regulatory only)."""
    mines_stmt = select(Mine).where(Mine.is_active == True)  # noqa: E712
    mines = (await db.execute(mines_stmt)).scalars().all()

    total_mines = len(mines)
    mines_overview = []
    total_comp_all = 0
    completed_comp_all = 0
    total_violations = 0
    high_risk_count = 0

    for mine in mines:
        # Compliance
        comp_stmt = select(Compliance).where(Compliance.mine_id == str(mine.id))
        comps = (await db.execute(comp_stmt)).scalars().all()
        mine_total_comp = len(comps)
        mine_completed_comp = sum(1 for c in comps if c.status == ComplianceStatus.completed)
        mine_comp_rate = round((mine_completed_comp / mine_total_comp * 100), 1) if mine_total_comp > 0 else 100.0

        total_comp_all += mine_total_comp
        completed_comp_all += mine_completed_comp

        # Open observations
        obs_stmt = (
            select(func.count(Observation.id))
            .join(Inspection, Observation.inspection_id == Inspection.id)
            .where(
                Inspection.mine_id == str(mine.id),
                Observation.status.in_([ObservationStatus.open, ObservationStatus.in_progress, ObservationStatus.action_assigned]),
            )
        )
        open_obs = (await db.execute(obs_stmt)).scalar_one()
        total_violations += open_obs

        # Risk score
        risk_stmt = (
            select(RiskScore)
            .where(RiskScore.mine_id == str(mine.id))
            .order_by(RiskScore.calculated_at.desc())
            .limit(1)
        )
        risk = (await db.execute(risk_stmt)).scalars().first()
        score = float(risk.overall_score) if risk else 15.0
        risk_level = risk.risk_level.value if risk and risk.risk_level else "low"

        if score >= 60:
            high_risk_count += 1

        mines_overview.append({
            "mine_id": str(mine.id),
            "name": mine.name,
            "state": mine.state,
            "compliance_rate": mine_comp_rate,
            "open_observations": open_obs,
            "risk_score": score,
            "risk_level": risk_level,
        })

    overall_comp_rate = round((completed_comp_all / total_comp_all * 100), 1) if total_comp_all > 0 else 100.0

    return {
        "total_mines": total_mines,
        "overall_compliance_rate": overall_comp_rate,
        "total_open_violations": total_violations,
        "high_risk_mines_count": high_risk_count,
        "mines_overview": mines_overview,
    }
