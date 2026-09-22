import asyncio
import sqlite3
from datetime import date, datetime
from uuid import uuid4

# 10 Real Indian Mining Contractors & Designated Persons Dataset
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

def seed():
    conn = sqlite3.connect("coalguard.db")
    cursor = conn.cursor()

    # Fetch mines
    cursor.execute("SELECT id, name FROM mines")
    mines = cursor.fetchall()
    print(f"Found {len(mines)} mines: {mines}")

    if not mines:
        # Create a default mine if none exist
        default_mine_id = str(uuid4()).replace("-", "")
        cursor.execute(
            "INSERT INTO mines (id, name, state, latitude, longitude, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (default_mine_id, "Jharia Coalfield Block-A", "Jharkhand", 23.75, 86.42, 1, datetime.utcnow(), datetime.utcnow())
        )
        mines = [(default_mine_id, "Jharia Coalfield Block-A")]

    # Remove old contractor records to ensure clean 10-record dataset
    cursor.execute("DELETE FROM contractors")
    print("Cleared existing contractor records.")

    now = datetime.utcnow().isoformat()

    # Assign each of the 10 unique contractors to a mine without duplication
    primary_mine_id = mines[0][0]
    secondary_mine_id = mines[1][0] if len(mines) > 1 else primary_mine_id

    print("\nSeeding 10 unique, non-duplicated contractors with distinct Contract IDs:")
    for idx, item in enumerate(REAL_CONTRACTORS):
        contractor_id = str(uuid4()).replace("-", "")
        display_name = f"{item['company_name']} ({item['name']})"
        doc_json = f'{{"company_name": "{item["company_name"]}", "contact_person": "{item["name"]}", "safety_score": {item["safety_score"]}, "license_number": "{item["license_number"]}", "contract_id": "{item["contract_id"]}"}}'

        # Even-indexed to primary mine, odd-indexed to secondary mine, or all accessible
        assigned_mine_id = primary_mine_id if idx % 2 == 0 else secondary_mine_id

        cursor.execute(
            """
            INSERT INTO contractors (
                id, name, mine_id, contract_number, contract_start, contract_end,
                scope_of_work, worker_count, compliance_status, documents, is_active,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                contractor_id,
                display_name,
                assigned_mine_id,
                item["contract_id"],
                item["start_date"],
                item["expiry_date"],
                item["scope_of_work"],
                item["worker_count"],
                item["compliance_status"],
                doc_json,
                1,
                now,
                now
            )
        )
        print(f"  [{idx+1}/10] {item['contract_id']} | {item['company_name']} ({item['name']}) -> Mine: {assigned_mine_id[:8]}... | Expires: {item['expiry_date']}")

    conn.commit()
    conn.close()
    print("\n✓ Clean 10 unique contractors seeded successfully with no duplicates!")

if __name__ == "__main__":
    seed()
