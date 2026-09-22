import asyncio
from datetime import datetime, timedelta, date, timezone
import uuid

from sqlalchemy import select

from app.database import async_session
from app.models import (
    User, UserRole, Mine, MineType, MineAssignment, Compliance, ComplianceCategory, ComplianceStatus, RiskLevel,
    Inspection, InspectionType, InspectionStatus, Observation, ObservationSeverity, ObservationCategory, ObservationStatus,
    CorrectiveAction, CorrectiveActionStatus, Alert, AlertType, AlertSeverity, RiskScore
)

async def seed():
    async with async_session() as session:
        # Check if users already exist
        result = await session.execute(select(User))
        if result.scalars().first():
            print("Database already contains data. Adding more demo data on top...")
        
        # Create Users
        u_admin = User(id=uuid.uuid4(), supabase_uid=str(uuid.uuid4()), email="admin@coalguard.in", full_name="System Admin", role=UserRole.admin)
        u_official = User(id=uuid.uuid4(), supabase_uid=str(uuid.uuid4()), email="manager@jharia.in", full_name="Rajesh Kumar", role=UserRole.mine_official)
        u_reg = User(id=uuid.uuid4(), supabase_uid=str(uuid.uuid4()), email="inspector@dgms.gov.in", full_name="Arun Singh", role=UserRole.inspector)
        session.add_all([u_admin, u_official, u_reg])
        
        # Create Mines
        m1 = Mine(id=uuid.uuid4(), name="Jharia Project 1", state="Jharkhand", district="Dhanbad", latitude=23.75, longitude=86.42, mine_type=MineType.underground)
        m2 = Mine(id=uuid.uuid4(), name="Talcher Open Cast", state="Odisha", district="Angul", latitude=20.95, longitude=85.22, mine_type=MineType.opencast)
        m3 = Mine(id=uuid.uuid4(), name="Godavari Highwall", state="Telangana", district="Bhadradri", latitude=17.5, longitude=80.3, mine_type=MineType.mixed)
        session.add_all([m1, m2, m3])
        
        # Assignments
        a1 = MineAssignment(id=uuid.uuid4(), user_id=u_official.id, mine_id=m1.id)
        a2 = MineAssignment(id=uuid.uuid4(), user_id=u_official.id, mine_id=m2.id)
        session.add_all([a1, a2])
        
        # Compliance
        c1 = Compliance(id=uuid.uuid4(), mine_id=m1.id, requirement="DGMS Regulation 141 - Ventilation limits", category=ComplianceCategory.safety, status=ComplianceStatus.completed, due_date=date.today() + timedelta(days=30), risk_level=RiskLevel.low)
        c2 = Compliance(id=uuid.uuid4(), mine_id=m1.id, requirement="Methane Concentration monitoring (< 0.75%)", category=ComplianceCategory.safety, status=ComplianceStatus.overdue, due_date=date.today() - timedelta(days=2), risk_level=RiskLevel.critical)
        c3 = Compliance(id=uuid.uuid4(), mine_id=m2.id, requirement="Slope Stability Factor Assessment", category=ComplianceCategory.statutory, status=ComplianceStatus.pending, due_date=date.today() + timedelta(days=5), risk_level=RiskLevel.medium)
        session.add_all([c1, c2, c3])
        
        # Alerts
        al1 = Alert(id=uuid.uuid4(), mine_id=m1.id, type=AlertType.ai_anomaly, severity=AlertSeverity.critical, title="Methane Anomaly Detected", message="Methane levels reached 0.8% at Panel 3.", is_resolved=False)
        al2 = Alert(id=uuid.uuid4(), mine_id=m2.id, type=AlertType.high_risk_observation, severity=AlertSeverity.warning, title="Hydraulic Pressure Warning", message="Excavator EX-04 hydraulic pressure drop.", is_resolved=False)
        al3 = Alert(id=uuid.uuid4(), mine_id=m1.id, type=AlertType.compliance_overdue, severity=AlertSeverity.critical, title="Critical Fan Failure", message="Main fan airflow dropped by 15%.", is_resolved=False)
        session.add_all([al1, al2, al3])
        
        # Inspections
        i1 = Inspection(id=uuid.uuid4(), mine_id=m1.id, inspector_id=u_reg.id, inspection_type=InspectionType.routine, status=InspectionStatus.completed, date=datetime.now(timezone.utc) - timedelta(days=9))
        session.add(i1)
        
        # Observations
        ob1 = Observation(id=uuid.uuid4(), inspection_id=i1.id, description="Roof bolting pattern deviated in gallery 4.", severity=ObservationSeverity.high, category=ObservationCategory.structural, status=ObservationStatus.open)
        session.add(ob1)
        
        # Corrective Actions
        ca1 = CorrectiveAction(id=uuid.uuid4(), observation_id=ob1.id, description="Reinforce gallery 4 with additional 2m bolts.", assigned_to=u_official.id, assigned_by=u_reg.id, deadline=datetime.now(timezone.utc) + timedelta(days=2), status=CorrectiveActionStatus.in_progress)
        session.add(ca1)
        
        # Risk Scores
        rs1 = RiskScore(id=uuid.uuid4(), mine_id=m1.id, overall_score=62.5, calculated_at=datetime.now(timezone.utc) - timedelta(days=2))
        rs2 = RiskScore(id=uuid.uuid4(), mine_id=m1.id, overall_score=68.0, calculated_at=datetime.now(timezone.utc) - timedelta(days=1))
        rs3 = RiskScore(id=uuid.uuid4(), mine_id=m1.id, overall_score=74.5, calculated_at=datetime.now(timezone.utc))
        session.add_all([rs1, rs2, rs3])
        
        await session.commit()
        print("Demo data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
