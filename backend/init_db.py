from database import engine
import models

def init_db():
    print("Sincronizando tablas...")
    models.Base.metadata.create_all(bind=engine)
    print("Sincronización completada.")

if __name__ == "__main__":
    init_db()
