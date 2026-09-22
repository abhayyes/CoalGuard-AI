import asyncio
from datetime import datetime, date, timezone
import uuid
import json

from sqlalchemy import select, delete

from app.database import async_session
from app.models import Mine
from app.models.contractor import Contractor, ContractorComplianceStatus

REAL_CONTRACTORS = [
    {
        "contract_id": "C001",
        "name": "Rajesh Sharma",
        "company_name": "ABC Mining Services Pvt Ltd",
        "expiry_date": "2026-09-28",
        "start_date": "2025-09-28",
        "worker_count": 145,
        "safety_score": 94,
        "compliance_status": "compliant",
        "scope_of_work": "Heavy Earthmoving Machinery (HEMM) & Dragline Pit Excavation",
        "license_number": "DGMS/EZ/HEMM/2025/C001"
    },
    {
        "contract_id": "C002",
        "name": "Anil Verma",
        "company_name": "XYZ Mining & Infra Solutions",
        "expiry_date": "2026-10-20",
        "start_date": "2025-10-20",
        "worker_count": 85,
        "safety_score": 88,
        "compliance_status": "compliant",
        "scope_of_work": "Dumper Fleet Haulage & Overburden Dump Bench Stabilization",
        "license_number": "DGMS/SZ/HAUL/2025/C002"
    },
    {
        "contract_id": "C003",
        "name": "Vikram Singh",
        "company_name": "Singhania Earthmovers & Drilling",
        "expiry_date": "2026-11-15",
        "start_date": "2025-11-15",
        "worker_count": 110,
        "safety_score": 96,
        "compliance_status": "compliant",
        "scope_of_work": "Controlled Precision Blasting & Continuous Vibration Monitoring",
        "license_number": "DGMS/WZ/BLAST/2025/C003"
    },
    {
        "contract_id": "C004",
        "name": "Suresh Reddy",
        "company_name": "Deccan Mining & Safety Consortium",
        "expiry_date": "2026-12-05",
        "start_date": "2025-12-05",
        "worker_count": 45,
        "safety_score": 82,
        "compliance_status": "partially_compliant",
        "scope_of_work": "Underground Face Auxiliary Ventilation & Multi-Gas Sensing",
        "license_number": "DGMS/NZ/VENT/2025/C004"
    },
    {
        "contract_id": "C005",
        "name": "Priya Nair",
        "company_name": "Bharat Deep Coal Miners Ltd",
        "expiry_date": "2027-01-18",
        "start_date": "2026-01-18",
        "worker_count": 160,
        "safety_score": 95,
        "compliance_status": "compliant",
        "scope_of_work": "Shaft Sinking, High-Tension Incline Conveyors & Roof Bolting",
        "license_number": "DGMS/CZ/SHAFT/2026/C005"
    },
    {
        "contract_id": "C006",
        "name": "Manoj Mahapatra",
        "company_name": "Kalinga Mineral Beneficiation Works",
        "expiry_date": "2027-02-24",
        "start_date": "2026-02-24",
        "worker_count": 70,
        "safety_score": 91,
        "compliance_status": "compliant",
        "scope_of_work": "Coal Handling Plant (CHP) Operations & Washery Deshaling",
        "license_number": "DGMS/EZ/CHP/2026/C006"
    },
    {
        "contract_id": "C007",
        "name": "Arjun Mukherjee",
        "company_name": "Damodar Infra Logistics & Siding",
        "expiry_date": "2027-03-30",
        "start_date": "2026-03-30",
        "worker_count": 125,
        "safety_score": 92,
        "compliance_status": "compliant",
        "scope_of_work": "Railway Siding Automated Wagon Loading & Dispatch Logistics",
        "license_number": "DGMS/EZ/RAIL/2026/C007"
    },
    {
        "contract_id": "C008",
        "name": "Sunil Soren",
        "company_name": "Chhota Nagpur Safety Equipment & Works",
        "expiry_date": "2027-04-14",
        "start_date": "2026-04-14",
        "worker_count": 35,
        "safety_score": 89,
        "compliance_status": "compliant",
        "scope_of_work": "Environmental Dust Suppression Misters & Protective Berm Works",
        "license_number": "DGMS/EZ/ENV/2026/C008"
    },
    {
        "contract_id": "C009",
        "name": "Neha Sengupta",
        "company_name": "Bengal Coal Transport Corp",
        "expiry_date": "2027-05-22",
        "start_date": "2026-05-22",
        "worker_count": 65,
        "safety_score": 87,
        "compliance_status": "compliant",
        "scope_of_work": "Secondary In-Pit Crushing & Surface Drainage Pump Maintenance",
        "license_number": "DGMS/EZ/CRUSH/2026/C009"
    },
    {
        "contract_id": "C010",
        "name": "Harpreet Singh Grewal",
        "company_name": "Vidarbha Heavy Mining Machinery Corp",
        "expiry_date": "2027-06-19",
        "start_date": "2026-06-19",
        "worker_count": 130,
        "safety_score": 94,
        "compliance_status": "compliant",
        "scope_of_work": "Continuous Miner Section Face Support & Hydraulic Maintenance",
        "license_number": "DGMS/WZ/MINE/2026/C010"
    }
]

async def seed():
    async with async_session() as session:
        # Fetch mines
        result = await session.execute(select(Mine))
        mines = result.scalars().all()
        
        if not mines:
            print("No mines found. Please run seed_demo_data.py first.")
            return
            
        print(f"Found {len(mines)} mines.")
        
        # Remove old contractor records to ensure clean 10-record dataset
        await session.execute(delete(Contractor))
        
        primary_mine_id = mines[0].id
        secondary_mine_id = mines[1].id if len(mines) > 1 else primary_mine_id
        
        print("\nSeeding 10 unique, non-duplicated contractors with distinct Contract IDs:")
        
        contractors_to_add = []
        for idx, item in enumerate(REAL_CONTRACTORS):
            display_name = f"{item['company_name']} ({item['name']})"
            doc_dict = {
                "company_name": item["company_name"],
                "contact_person": item["name"],
                "safety_score": item["safety_score"],
                "license_number": item["license_number"],
                "contract_id": item["contract_id"]
            }
            
            assigned_mine_id = primary_mine_id if idx % 2 == 0 else secondary_mine_id
            
            c = Contractor(
                id=uuid.uuid4(),
                name=display_name,
                mine_id=assigned_mine_id,
                contract_number=item["contract_id"],
                contract_start=date.fromisoformat(item["start_date"]),
                contract_end=date.fromisoformat(item["expiry_date"]),
                scope_of_work=item["scope_of_work"],
                worker_count=item["worker_count"],
                compliance_status=ContractorComplianceStatus(item["compliance_status"]),
                documents=doc_dict,
                is_active=True
            )
            contractors_to_add.append(c)
            print(f"  [{idx+1}/10] {item['contract_id']} | {item['company_name']} ({item['name']}) -> Mine: {assigned_mine_id}")
            
        session.add_all(contractors_to_add)
        await session.commit()
        print("\n? Clean 10 unique contractors seeded successfully with no duplicates!")

if __name__ == "__main__":
    asyncio.run(seed())
