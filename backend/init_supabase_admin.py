import sys
import os
from sqlalchemy.orm import Session

# Añadir path para imports
sys.path.append(os.getcwd())

import models, auth, database

def create_first_admin():
    # URL de Supabase sin pgbouncer para el script directo
    db_url = "postgresql://postgres.ivyhapyzfuskbnfmikrd:bailar24++danza@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"
    
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar si ya existe
        exists = db.query(models.User).filter(models.User.username == "admin").first()
        if exists:
            print("El usuario admin ya existe.")
            return

        # Crear el admin
        hashed_password = auth.get_password_hash("admin123")
        new_admin = models.User(
            username="admin",
            email="admin@yaneiska.com",
            hashed_password=hashed_password,
            role=models.UserRole.ADMIN,
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print("¡USUARIO ADMIN CREADO EXITOSAMENTE EN SUPABASE!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_first_admin()
