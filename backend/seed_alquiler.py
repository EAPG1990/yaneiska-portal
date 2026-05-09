from database import SessionLocal
import models

def seed_alquiler_config():
    db = SessionLocal()
    configs = [
        {"clave": "tarifa_alquiler_es", "valor": "12000", "descripcion": "Tarifa por hora entre semana"},
        {"clave": "tarifa_alquiler_fs", "valor": "15000", "descripcion": "Tarifa por hora fin de semana"}
    ]
    
    for c in configs:
        db_config = db.query(models.Configuracion).filter(models.Configuracion.clave == c["clave"]).first()
        if not db_config:
            db.add(models.Configuracion(**c))
            print(f"Agregada config: {c['clave']}")
        else:
            print(f"Config ya existe: {c['clave']}")
            
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_alquiler_config()
