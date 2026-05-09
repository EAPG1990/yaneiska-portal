from database import SessionLocal
import models

def fix_nulls():
    db = SessionLocal()
    try:
        # Buscar clases con nulos
        clases = db.query(models.ClaseDocente).filter(
            (models.ClaseDocente.cantidad_clases == None) | 
            (models.ClaseDocente.duracion == None)
        ).all()
        
        for c in clases:
            if c.cantidad_clases is None: c.cantidad_clases = 1
            if c.duracion is None: c.duracion = 1.0
            print(f"Corregida clase ID {c.id}")
            
        db.commit()
        print("Limpieza completada.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_nulls()
