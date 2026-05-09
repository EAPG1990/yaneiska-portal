from database import SessionLocal
import models
import auth

def seed():
    db = SessionLocal()
    try:
        # Verificar si ya existe el admin
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            print("Creando usuario administrador inicial...")
            hashed_password = auth.get_password_hash("admin123")
            new_admin = models.User(
                username="admin",
                email="admin@estudiojimena.com",
                hashed_password=hashed_password,
                role=models.UserRole.ADMIN
            )
            db.add(new_admin)
            db.commit()
            print("Usuario admin creado con éxito. User: admin, Pass: admin123")
        else:
            print("El usuario administrador ya existe.")
    except Exception as e:
        print(f"Error al crear el admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
