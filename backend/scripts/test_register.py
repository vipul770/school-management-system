from app import routes
from app.models import UserCreate
from app.db import engine
from sqlmodel import Session

with Session(engine) as session:
    try:
        user = UserCreate(username='admin', password='adminpass', role='superadmin', full_name='Admin')
        out = routes.register(user, session)
        print('REGISTERED:', out)
    except Exception as e:
        import traceback
        traceback.print_exc()
