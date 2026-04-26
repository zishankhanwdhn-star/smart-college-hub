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
        {"name": "Communication Skills", "code": "HU-101", "units": [
            "Grammar and Writing", "Technical Writing", "Presentation Skills",
            "Group Discussion", "Interview Skills"
        ]},
        {"name": "Engineering Graphics", "code": "ME-101", "units": [
            "Drawing Instruments and Conventions", "Orthographic Projections",
            "Isometric Views", "Sectional Views", "Auto CAD Basics"
        ]},
    ],
    2: [
        {"name": "Engineering Mathematics-II", "code": "MA-201", "units": [
            "Differential Equations", "Fourier Series", "Laplace Transforms",
            "Partial Differential Equations", "Numerical Methods"
        ]},
        {"name": "Programming in C", "code": "CS-201", "units": [
            "Introduction to C Programming", "Control Structures", "Functions and Arrays",
            "Pointers and Strings", "File Handling"
        ]},
        {"name": "Digital Electronics", "code": "EC-201", "units": [
            "Number Systems", "Boolean Algebra", "Logic Gates", "Combinational Circuits", "Sequential Circuits"
        ]},
        {"name": "Data Structures", "code": "CS-202", "units": [
            "Arrays and Linked Lists", "Stacks and Queues", "Trees",
            "Graphs", "Sorting and Searching"
        ]},
    ],
    3: [
        {"name": "Object Oriented Programming (Java)", "code": "CS-301", "units": [
            "Java Basics and OOP Concepts", "Inheritance and Polymorphism", "Exception Handling",
            "Packages and Interfaces", "Multithreading and Collections"
        ]},
        {"name": "Computer Organization & Architecture", "code": "CS-302", "units": [
            "Basic Structure of Computers", "Register Transfer and Micro-operations",
            "Processor Design", "Memory Organization", "I/O Organization"
        ]},
        {"name": "Database Management Systems", "code": "CS-303", "units": [
            "Introduction to DBMS", "Relational Model", "SQL Queries", "Normalization", "Transaction Management"
        ]},
        {"name": "Operating Systems", "code": "CS-304", "units": [
            "Process Management", "Memory Management", "File Systems",
            "Deadlocks", "I/O Systems"
        ]},
    ],
    4: [
        {"name": "Computer Networks", "code": "CS-401", "units": [
            "Network Models and Topologies", "Data Link Layer", "Network Layer",
            "Transport Layer", "Application Layer"
        ]},
        {"name": "Software Engineering", "code": "CS-402", "units": [
            "SDLC and Process Models", "Requirements Engineering", "Software Design",
            "Testing Techniques", "Project Management"
        ]},
        {"name": "Web Technologies", "code": "CS-403", "units": [
            "HTML & CSS Fundamentals", "JavaScript & DOM", "PHP and MySQL",
            "Web Frameworks", "Web Security"
        ]},
        {"name": "Theory of Computation", "code": "CS-404", "units": [
            "Finite Automata", "Regular Expressions", "Context Free Grammars",
            "Pushdown Automata", "Turing Machines"
        ]},
    ],
    5: [
        {"name": "Artificial Intelligence", "code": "CS-501", "units": [
            "Problem Solving in AI", "Search Strategies", "Knowledge Representation",
            "Machine Learning Basics", "Natural Language Processing"
        ]},
        {"name": "Advanced Java", "code": "CS-502", "units": [
            "JDBC and Servlets", "JSP and MVC", "Spring Framework Basics",
            "Hibernate ORM", "Web Services"
        ]},
        {"name": "Information Security", "code": "CS-503", "units": [
            "Cryptography Basics", "Symmetric Encryption", "Asymmetric Encryption",
            "Network Security Protocols", "Ethical Hacking Introduction"
        ]},
    ],
    6: [
        {"name": "Machine Learning", "code": "CS-601", "units": [
            "Introduction and Linear Regression", "Classification Algorithms",
            "Clustering", "Neural Networks", "Model Evaluation"
        ]},
        {"name": "Cloud Computing", "code": "CS-602", "units": [
            "Cloud Concepts and Deployment", "Virtualization", "AWS/Azure Basics",
            "Containers and Docker", "Cloud Security"
        ]},
        {"name": "Project Work", "code": "CS-603", "units": [
            "Project Planning", "Design Phase", "Development Phase",
            "Testing Phase", "Documentation & Viva"
        ]},
    ],
}


def seed():
    db = SessionLocal()
    try:
        # Admin user
        if not db.query(models.User).filter(models.User.email == os.getenv("ADMIN_EMAIL", "admin@gpcwaidhan.ac.in")).first():
            admin = models.User(
                full_name="Admin",
                email=os.getenv("ADMIN_EMAIL", "admin@gpcwaidhan.ac.in"),
                hashed_password=get_password_hash(os.getenv("ADMIN_PASSWORD", "Admin@123")),
                role=models.UserRole.admin,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print(f"[+] Admin created: {admin.email}")

        # Branches
        for branch_data in BRANCHES:
            if not db.query(models.Branch).filter(models.Branch.code == branch_data["code"]).first():
                branch = models.Branch(**branch_data)
                db.add(branch)
        db.commit()
        print("[+] Branches seeded")

        cse = db.query(models.Branch).filter(models.Branch.code == "CSE").first()

        # Semesters + Subjects + Units for CSE
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
                existing = db.query(models.Subject).filter(models.Subject.code == subj_data["code"]).first()
                if not existing:
                    subj = models.Subject(
                        name=subj_data["name"],
                        code=subj_data["code"],
                        semester_id=sem.id
                    )
                    db.add(subj)
                    db.flush()
                    for i, unit_title in enumerate(subj_data["units"], 1):
                        unit = models.Unit(number=i, title=unit_title, subject_id=subj.id)
                        db.add(unit)

        db.commit()
        print("[+] CSE semesters, subjects, units seeded")

        # Other branches: 6 semesters each (no subjects for now)
        for branch_data in BRANCHES[1:]:
            branch = db.query(models.Branch).filter(models.Branch.code == branch_data["code"]).first()
            for sem_num in range(1, 7):
                if not db.query(models.Semester).filter(
                    models.Semester.branch_id == branch.id,
                    models.Semester.number == sem_num
                ).first():
                    db.add(models.Semester(number=sem_num, branch_id=branch.id))
        db.commit()
        print("[+] All branch semesters created")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("\n✅ Database seeded successfully!")
    print(f"   Admin Email: {os.getenv('ADMIN_EMAIL', 'admin@gpcwaidhan.ac.in')}")
    print(f"   Admin Password: {os.getenv('ADMIN_PASSWORD', 'Admin@123')}")
