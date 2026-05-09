import sys
import os

# Añadir el path del backend para importar los modelos
sys.path.append(os.getcwd())

from database import engine
from sqlalchemy import inspect

def check_db():
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('alumnas')]
    print(f"Columnas en 'alumnas': {columns}")
    
    # Verificar si faltan columnas clave
    required = ['actividades', 'nivel', 'combo_id', 'docente_id']
    missing = [r for r in required if r not in columns]
    
    if missing:
        print(f"FALTAN COLUMNAS: {missing}")
    else:
        print("Todas las columnas necesarias están presentes.")

if __name__ == "__main__":
    try:
        check_db()
    except Exception as e:
        print(f"Error al inspeccionar DB: {e}")
