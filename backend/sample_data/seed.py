from __future__ import annotations
import asyncio
from datetime import date, datetime, timedelta
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session, engine, Base
from app.models.alert import Alert, AlertSeverity, AlertType
from app.models.compliance import (
    Compliance,
    ComplianceCategory,
    ComplianceStatus,
    RiskLevel,
)
from app.models.contractor import Contractor, ContractorComplianceStatus
from app.models.corrective_action import (
    CorrectiveAction,
    CorrectiveActionStatus,
)
from app.models.document import Document, OCRStatus
from app.models.inspection import (
    Inspection,
    InspectionStatus,
    InspectionType,
)
from app.models.mine import Mine, MineType
from app.models.mine_assignment import MineAssignment
from app.models.observation import (
    Observation,
    ObservationCategory,
    ObservationSeverity,
    ObservationStatus,
)
from app.models.risk_score import RiskScore
from app.models.user import User, UserRole


async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Check if already seeded
        from sqlalchemy import select, func
        count = (await session.execute(select(func.count(User.id)))).scalar_one()
        if count > 0:
            print("Database already has data. Skipping seed.")
            return

        print("Seeding database...")

        # 1. Users
        admin_user = User(
            id=str(uuid4()),
            supabase_uid=str(uuid4()),
            email="admin@coalguard.gov.in",
            full_name="Rajesh Sharma (Admin)",
            role=UserRole.admin,
            department="HQ IT & Governance",
            phone="+91-9876543210",
            is_active=True,
        )
        mine_mgr = User(
            id=str(uuid4()),
            supabase_uid=str(uuid4()),
            email="manager@dhanbad.coal.in",
            full_name="Amitabh Sen",
            role=UserRole.mine_official,
            department="Mine Operations",
            phone="+91-9876543211",
            is_active=True,
        )
        safety_officer = User(
            id=str(uuid4()),
            supabase_uid=str(uuid4()),
            email="safety@dhanbad.coal.in",
            full_name="Sunil Kumar Verma",
            role=UserRole.safety_officer,
            department="Safety & Health",
            phone="+91-9876543212",
            is_active=True,
        )
        inspector = User(
            id=str(uuid4()),
            supabase_uid=str(uuid4()),
            email="inspector.dgms@gov.in",
            full_name="Dr. Priya Murthy",
            role=UserRole.inspector,
            department="DGMS Inspection Directorate",
            phone="+91-9876543213",
            is_active=True,
        )
        corp_user = User(
            id=str(uuid4()),
            supabase_uid=str(uuid4()),
            email="director@coalindia.in",
            full_name="Vikramaditya Roy",
            role=UserRole.corporate,
            department="Executive Board",
            phone="+91-9876543214",
            is_active=True,
        )

        session.add_all([admin_user, mine_mgr, safety_officer, inspector, corp_user])
        await session.flush()

        # 2. Mines
        mine1 = Mine(
            id=str(uuid4()),
            name="Jharia Coalfield Block-A",
            code="JHR-001",
            subsidiary="Bharat Coking Coal Limited (BCCL)",
            state="Jharkhand",
            district="Dhanbad",
            location_description="Main opencast pit adjacent to sector 4",
            latitude=23.7441000,
            longitude=86.4131000,
            boundary_geojson={
                "type": "Polygon",
                "coordinates": [
                    [
                        [86.410, 23.740],
                        [86.420, 23.740],
                        [86.420, 23.750],
                        [86.410, 23.750],
                        [86.410, 23.740],
                    ]
                ],
            },
            mine_type=MineType.opencast,
            is_active=True,
        )

        mine2 = Mine(
            id=str(uuid4()),
            name="Korba West Underground Pit",
            code="KRB-004",
            subsidiary="South Eastern Coalfields Limited (SECL)",
            state="Chhattisgarh",
            district="Korba",
            location_description="Underground incline shaft 3",
            latitude=22.3595000,
            longitude=82.7501000,
            mine_type=MineType.underground,
            is_active=True,
        )

        session.add_all([mine1, mine2])
        await session.flush()

        # 3. Mine Assignments
        assign1 = MineAssignment(user_id=mine_mgr.id, mine_id=mine1.id)
        assign2 = MineAssignment(user_id=safety_officer.id, mine_id=mine1.id)
        assign3 = MineAssignment(user_id=inspector.id, mine_id=mine1.id)
        assign4 = MineAssignment(user_id=inspector.id, mine_id=mine2.id)

        session.add_all([assign1, assign2, assign3, assign4])

        # 4. Compliance Items
        c1 = Compliance(
            id=str(uuid4()),
            mine_id=mine1.id,
            requirement="Annual DGMS Safety Return Form IV Filing",
            category=ComplianceCategory.statutory,
            sub_category="Safety Returns",
            due_date=date.today() + timedelta(days=12),
            responsible_user_id=safety_officer.id,
            status=ComplianceStatus.in_progress,
            risk_level=RiskLevel.high,
            created_by=admin_user.id,
        )
        c2 = Compliance(
            id=str(uuid4()),
            mine_id=mine1.id,
            requirement="Quarterly Ambient Air Quality Monitoring & Submission to SPCB",
            category=ComplianceCategory.environmental,
            sub_category="Pollution Control",
            due_date=date.today() - timedelta(days=3),
            responsible_user_id=safety_officer.id,
            status=ComplianceStatus.overdue,
            risk_level=RiskLevel.critical,
            created_by=admin_user.id,
        )
        c3 = Compliance(
            id=str(uuid4()),
            mine_id=mine1.id,
            requirement="Conveyor Belt Emergency Trip Wire Testing and Audit",
            category=ComplianceCategory.safety,
            sub_category="Equipment Safety",
            due_date=date.today() + timedelta(days=45),
            responsible_user_id=safety_officer.id,
            status=ComplianceStatus.completed,
            completion_date=date.today() - timedelta(days=2),
            completion_notes="Tested all 14 conveyor lines, pull-cords fully operational.",
            risk_level=RiskLevel.medium,
            created_by=admin_user.id,
        )
        session.add_all([c1, c2, c3])

        # 5. Inspection
        insp1 = Inspection(
            id=str(uuid4()),
            mine_id=mine1.id,
            inspector_id=inspector.id,
            inspection_type=InspectionType.safety,
            date=date.today() - timedelta(days=5),
            latitude=23.7450000,
            longitude=86.4140000,
            checklist_data={"bench_height": "pass", "haul_road_berms": "fail", "dust_suppression": "pass"},
            summary="Routine safety audit of opencast haul road and overburden dump area.",
            status=InspectionStatus.completed,
        )
        session.add(insp1)
        await session.flush()

        # 6. Observations
        obs1 = Observation(
            id=str(uuid4()),
            inspection_id=insp1.id,
            description="Inadequate berm height (<1.5m) observed along the haul road curve near Dump-2.",
            severity=ObservationSeverity.high,
            category=ObservationCategory.safety,
            latitude=23.7452000,
            longitude=86.4145000,
            status=ObservationStatus.action_assigned,
        )
        session.add(obs1)
        await session.flush()

        # 7. Corrective Action
        ca1 = CorrectiveAction(
            id=str(uuid4()),
            observation_id=obs1.id,
            description="Erect earthen safety berm of minimum 2.0m height along 250m curved section.",
            assigned_to=safety_officer.id,
            assigned_by=inspector.id,
            deadline=date.today() + timedelta(days=7),
            status=CorrectiveActionStatus.in_progress,
        )
        session.add(ca1)

        # 8. Contractor
        cont1 = Contractor(
            id=str(uuid4()),
            name="Eastern Earthmovers & Mining Infra Ltd",
            mine_id=mine1.id,
            contract_number="BCCL/CONTR/2025/089",
            contract_start=date.today() - timedelta(days=180),
            contract_end=date.today() + timedelta(days=185),
            scope_of_work="Overburden removal and heavy equipment operation at Pit 3",
            worker_count=145,
            compliance_status=ContractorComplianceStatus.compliant,
            is_active=True,
        )
        session.add(cont1)

        # 9. Alerts
        alert1 = Alert(
            id=str(uuid4()),
            mine_id=mine1.id,
            type=AlertType.compliance_overdue,
            severity=AlertSeverity.critical,
            title="SPCB Air Quality Report Overdue",
            message="Quarterly Ambient Air Quality Monitoring submission to SPCB is 3 days overdue.",
            related_entity_type="compliance",
            related_entity_id=c2.id,
            is_read=False,
            is_resolved=False,
            escalation_level=1,
        )
        alert2 = Alert(
            id=str(uuid4()),
            mine_id=mine1.id,
            type=AlertType.high_risk_observation,
            severity=AlertSeverity.warning,
            title="High Severity Berm Deficiency",
            message="Haul road berm deficiency reported near Dump-2. Corrective action deadline in 7 days.",
            related_entity_type="observation",
            related_entity_id=obs1.id,
            is_read=False,
            is_resolved=False,
            escalation_level=0,
        )
        session.add_all([alert1, alert2])

        # 10. Risk Score
        risk1 = RiskScore(
            id=str(uuid4()),
            mine_id=mine1.id,
            overall_score=42.50,
            compliance_risk=55.00,
            safety_risk=48.00,
            environmental_risk=65.00,
            historical_risk=20.00,
            operational_risk=25.00,
            risk_level=RiskLevel.medium,
            anomalies=[{"factor": "Air Quality Compliance Delay", "impact": "+15 pts"}],
            recommendations=["Expedite SPCB Air Quality report submission immediately", "Verify completed haul road berm repairs"],
        )
        session.add(risk1)

        await session.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
