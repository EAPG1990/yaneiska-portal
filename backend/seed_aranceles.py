from database import SessionLocal
import models

def seed_aranceles():
    db = SessionLocal()
    try:
        # 1. Seed Combos if empty
        if db.query(models.Combo).count() == 0:
            print("Sembrando combos...")
            combos = [
                models.Combo(nombre="1 clase por semana", costo_mensual=9900, cantidad_actividades=1, descripcion="Asistencia a una actividad semanal."),
                models.Combo(nombre="2 clases por semana", costo_mensual=14800, cantidad_actividades=2, descripcion="Asistencia a dos actividades semanales."),
                models.Combo(nombre="3 clases por semana", costo_mensual=18500, cantidad_actividades=3, descripcion="Asistencia a tres actividades semanales."),
                models.Combo(nombre="Pase Libre", costo_mensual=25000, cantidad_actividades=10, descripcion="Acceso total a todas las clases.")
            ]
            db.add_all(combos)
        
        # 2. Seed Config if missing
        configs = {
            "inscripcion_anual": "5000",
            "clase_prueba": "2500"
        }
        for clave, valor in configs.items():
            exists = db.query(models.Configuracion).filter(models.Configuracion.clave == clave).first()
            if not exists:
                print(f"Sembrando config: {clave}")
                db.add(models.Configuracion(clave=clave, valor=valor))
        
        db.commit()
        print("Datos sembrados con éxito.")
    except Exception as e:
        print(f"Error sembrando datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_aranceles()
