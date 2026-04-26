"""Seed initial data: branches, semesters, subjects, units, admin user"""

from database import SessionLocal, engine
import models
from auth import get_password_hash
import os
from dotenv import load_dotenv

load_dotenv()
models.Base.metadata.create_all(bind=engine)


BRANCHES = [
    {"name": "Computer Science Engineering", "code": "CSE", "description": "B.E. in Computer Science & Engineering"},
    {"name": "Mechanical Engineering", "code": "ME", "description": "B.E. in Mechanical Engineering"},
    {"name": "Electrical Engineering", "code": "EE", "description": "B.E. in Electrical Engineering"},
    {"name": "Civil Engineering", "code": "CE", "description": "B.E. in Civil Engineering"},
    {"name": "Electronics & Communication", "code": "EC", "description": "B.E. in Electronics & Communication Engineering"},
    {"name": "Information Technology", "code": "IT", "description": "B.E. in Information Technology"},
]


CSE_SUBJECTS = {
    1: [
        {"name": "Engineering Mathematics-I", "code": "MA-101", "units": [
            "Matrices and Linear Algebra", "Differential Calculus", "Integral Calculus",
            "Vector Calculus", "Complex Numbers"
        ]},
        {"name": "Engineering Physics", "code": "PH-101", "units": [
            "Mechanics", "Waves and Oscillations", "Optics", "Thermodynamics", "Modern Physics"
        ]},
    ],
}


def seed():
    db = SessionLocal()
    try:
        # ✅ Admin user
        if not db.query(models.User).filter(
            models.User.email == os.getenv("ADMIN_EMAIL", "admin@gpcwaidhan.ac.in")
        ).first():

            admin_password = os.getenv("ADMIN_PASSWORD") or "Admin@123"
            admin_password = admin_password[:72]

            admin = models.User(
                full_name="Admin",
                email=os.getenv("ADMIN_EMAIL", "admin@gpcwaidhan.ac.in"),
                hashed_password=get_password_hash(admin_password),
                role=models.UserRole.admin,
                is_active=True,
            )

            db.add(admin)
            db.commit()
            print(f"[+] Admin created: {admin.email}")

        # ✅ Branches
        for branch_data in BRANCHES:
            if not db.query(models.Branch).filter(
                models.Branch.code == branch_data["code"]
            ).first():
                db.add(models.Branch(**branch_data))

        db.commit()
        print("[+] Branches seeded")

        cse = db.query(models.Branch).filter(models.Branch.code == "CSE").first()

        # ✅ Semesters + Subjects + Units
        for sem_num, subjects in CSE_SUBJECTS.items():
            sem = db.query(models.Semester).filter(
                models.Semester.branch_id == cse.id,
                models.Semester.number == sem_num
            ).first()

            if not sem:
                sem = models.Semester(number=sem_num, branch_id=cse.id)
                db.add(sem)
                db.flush()

            for subj_data in subjects:
                existing = db.query(models.Subject).filter(
                    models.Subject.code == subj_data["code"]
                ).first()

                if not existing:
                    subj = models.Subject(
                        name=subj_data["name"],
                        code=subj_data["code"],
                        semester_id=sem.id
                    )
                    db.add(subj)
                    db.flush()

                    for i, unit_title in enumerate(subj_data["units"], 1):
                        db.add(models.Unit(
                            number=i,
                            title=unit_title,
                            subject_id=subj.id
                        ))

        db.commit()
        print("[+] CSE data seeded")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("\n✅ Database seeded successfully!")