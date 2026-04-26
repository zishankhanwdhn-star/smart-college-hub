# Alembic Database Migration Guide
# Run these commands inside the backend/ directory

# Step 1: Install alembic (already in requirements.txt)
# pip install alembic

# Step 2: Initialize alembic (only needed ONCE)
# alembic init migrations

# Step 3: Edit migrations/env.py — add these lines after "from alembic import context":
#   import sys, os
#   sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
#   from database import Base
#   from models import *   # noqa
#   target_metadata = Base.metadata

# Step 4: Generate a migration
# alembic revision --autogenerate -m "initial schema"

# Step 5: Apply migrations
# alembic upgrade head

# Step 6: For subsequent changes to models.py:
# alembic revision --autogenerate -m "add new field"
# alembic upgrade head

# Step 7: Rollback
# alembic downgrade -1

# ─── Quick setup for development ─────────────────────────────────────────────
# For SQLite (development), just run:
#   python seed_data.py
# It calls Base.metadata.create_all() which creates all tables automatically.

# For PostgreSQL (production), use Alembic migrations for safe schema changes.
