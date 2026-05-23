#!/usr/bin/env python3
"""
Add sample classrooms for testing
"""

import sys
import os
from datetime import datetime

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.db import engine
from app.module_models import Classroom
from sqlmodel import Session

def add_sample_classrooms():
    with Session(engine) as session:
        classrooms = [
            Classroom(
                name="Grade 1A",
                grade="1",
                section="A",
                capacity=30,
                room_number="101",
                floor="1",
                building="Main",
                tenant_id=1,
                school_id=1
            ),
            Classroom(
                name="Grade 1B",
                grade="1",
                section="B",
                capacity=30,
                room_number="102",
                floor="1",
                building="Main",
                tenant_id=1,
                school_id=1
            ),
            Classroom(
                name="Grade 2A",
                grade="2",
                section="A",
                capacity=30,
                room_number="201",
                floor="2",
                building="Main",
                tenant_id=1,
                school_id=1
            )
        ]
        
        for classroom in classrooms:
            session.add(classroom)
        
        session.commit()
        print("Sample classrooms added")

if __name__ == "__main__":
    add_sample_classrooms()