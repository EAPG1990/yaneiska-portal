from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth

router = APIRouter(prefix="/configuraciones", tags=["Configuraciones"])

@router.get("/")
def get_configuraciones(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    configs = db.query(models.Configuracion).all()
    return {c.clave: c.valor for c in configs}

@router.get("/base", response_model=List[schemas.ConfiguracionOut])
def get_config_base(db: Session = Depends(database.get_db)):
    return db.query(models.Configuracion).all()

@router.put("/base/{clave}")
def update_config_base(
    clave: str, 
    data: schemas.ConfiguracionUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    config = db.query(models.Configuracion).filter(models.Configuracion.clave == clave).first()
    if not config:
        # Si no existe, la creamos
        config = models.Configuracion(clave=clave, valor=data.valor)
        db.add(config)
    else:
        config.valor = data.valor
    db.commit()
    return {"detail": "Configuración actualizada"}

# Gestión de Combos (Aranceles)
@router.get("/combos", response_model=List[schemas.ComboOut])
def get_combos(db: Session = Depends(database.get_db)):
    return db.query(models.Combo).all()

@router.post("/combos", response_model=schemas.ComboOut)
def create_combo(
    combo_in: schemas.ComboCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    new_combo = models.Combo(**combo_in.dict())
    db.add(new_combo)
    db.commit()
    db.refresh(new_combo)
    return new_combo

@router.put("/combos/{id}", response_model=schemas.ComboOut)
def update_combo(
    id: int, 
    combo_in: schemas.ComboCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    combo = db.query(models.Combo).filter(models.Combo.id == id).first()
    if not combo:
        raise HTTPException(status_code=404, detail="Combo no encontrado")
    
    combo.costo_mensual = combo_in.costo_mensual
    combo.nombre = combo_in.nombre
    combo.descripcion = combo_in.descripcion
    db.commit()
    db.refresh(combo)
    return combo

@router.delete("/combos/{id}")
def delete_combo(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    combo = db.query(models.Combo).filter(models.Combo.id == id).first()
    if not combo:
        raise HTTPException(status_code=404, detail="Combo no encontrado")
    db.delete(combo)
    db.commit()
    return {"detail": "Combo eliminado"}
