from database import SessionLocal
import models

def seed_aranceles_reales():
    db = SessionLocal()
    try:
        # Limpiar combos existentes para evitar duplicados
        db.query(models.Combo).delete()
        
        print("Sembrando aranceles reales desde el Excel...")
        
        combos = [
            # 1. FORMACIONES
            models.Combo(nombre="Profesorado Danza del Vientre Básico", costo_mensual=47000, cantidad_actividades=1, descripcion="1 vez x semana + teórico mensual."),
            models.Combo(nombre="Profesorado Danza del Vientre Intensivo", costo_mensual=59000, cantidad_actividades=2, descripcion="2 veces x semana + teóricos."),
            
            # 2. CLASES REGULARES
            models.Combo(nombre="Clases Regulares - 1 vez por semana", costo_mensual=39000, cantidad_actividades=1, descripcion="Yoga, Pilates, Danza, etc (1 vez)."),
            models.Combo(nombre="Clases Regulares - 2 veces por semana", costo_mensual=49000, cantidad_actividades=2, descripcion="Yoga, Pilates, Danza, etc (2 veces)."),
            models.Combo(nombre="Clases Regulares - 3 veces por semana", costo_mensual=70000, cantidad_actividades=3, descripcion="Yoga, Pilates, Danza, etc (3 veces)."),
            
            # 3. COMBOS FORMACIONES (Prof. Básico)
            models.Combo(nombre="Prof. Básico + 1 actividad", costo_mensual=50000, cantidad_actividades=2, descripcion="Profesorado básico + 1 clase regular."),
            models.Combo(nombre="Prof. Básico + 2 actividades", costo_mensual=61000, cantidad_actividades=3, descripcion="Profesorado básico + 2 clases regulares."),
            models.Combo(nombre="Prof. Básico + 3 actividades", costo_mensual=72000, cantidad_actividades=4, descripcion="Profesorado básico + 3 clases regulares."),
            
            # 4. COMBOS FORMACIONES (Prof. Intensivo)
            models.Combo(nombre="Prof. Intensivo + 1 actividad", costo_mensual=61000, cantidad_actividades=3, descripcion="Profesorado intensivo + 1 clase regular."),
            models.Combo(nombre="Prof. Intensivo + 2 actividades", costo_mensual=72000, cantidad_actividades=4, descripcion="Profesorado intensivo + 2 clases regulares."),
            models.Combo(nombre="Prof. Intensivo + 3 actividades", costo_mensual=83000, cantidad_actividades=5, descripcion="Profesorado intensivo + 3 clases regulares."),

            # 5. OTROS
            models.Combo(nombre="Clase Particular", costo_mensual=20000, cantidad_actividades=1, descripcion="Sesión individual personalizada.")
        ]
        
        db.add_all(combos)
        db.commit()
        print("Aranceles reales sembrados con éxito.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_aranceles_reales()
