import sys
import os

# Agregar el directorio actual al path para importar los modelos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

def seed_teachers():
    db = SessionLocal()
    teacher_names = ["Jime", "Flor", "Yaneiska", "Asly"]
    
    try:
        for name in teacher_names:
            # Verificar si ya existe para no duplicar
            exists = db.query(models.Docente).filter(models.Docente.nombre == name).first()
            if not exists:
                new_teacher = models.Docente(nombre=name, alias=name, activo=True)
                db.add(new_teacher)
                print(f"Docente '{name}' agregada con éxito.")
            else:
                print(f"Docente '{name}' ya existe.")
        
        db.commit()
    except Exception as e:
        print(f"Error al cargar docentes: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_teachers()
