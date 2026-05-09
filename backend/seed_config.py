from database import SessionLocal
import models

def seed_config():
    db = SessionLocal()
    configs = [
        {"clave": "tarifa_docente_1h", "valor": "9900", "descripcion": "Precio por clase de 1 hora"},
        {"clave": "tarifa_docente_1_5h", "valor": "14800", "descripcion": "Precio por clase de 1.5 horas"}
    ]
    
    try:
        for conf in configs:
            exists = db.query(models.Configuracion).filter(models.Configuracion.clave == conf["clave"]).first()
            if not exists:
                new_conf = models.Configuracion(**conf)
                db.add(new_conf)
                print(f"Configuracin '{conf['clave']}' agregada.")
            else:
                exists.valor = conf["valor"]
                print(f"Configuracin '{conf['clave']}' actualizada.")
        
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_config()
