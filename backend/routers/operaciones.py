from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(tags=["Operaciones"])

# Alquiler de Sala
@router.post("/alquiler-sala/", response_model=schemas.AlquilerSalaOut)
def create_alquiler(
    alquiler: schemas.AlquilerSalaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    new_alquiler = models.AlquilerSala(**alquiler.dict())
    db.add(new_alquiler)
    db.commit()
    db.refresh(new_alquiler)
    return new_alquiler

@router.get("/alquiler-sala/", response_model=List[schemas.AlquilerSalaOut])
def get_alquileres(
    mes: int, anio: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.AlquilerSala).filter(
        models.AlquilerSala.mes == mes,
        models.AlquilerSala.anio == anio
    ).all()

# Gastos
@router.post("/gastos/", response_model=schemas.GastoOut)
def create_gasto(
    gasto: schemas.GastoCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    new_gasto = models.Gasto(**gasto.dict())
    db.add(new_gasto)
    db.commit()
    db.refresh(new_gasto)
    return new_gasto

@router.get("/gastos/", response_model=List[schemas.GastoOut])
def get_gastos(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Gasto).all()

# Talleres
@router.post("/talleres/", response_model=schemas.TallerOut)
def create_taller(
    taller: schemas.TallerCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    new_taller = models.Taller(**taller.dict())
    db.add(new_taller)
    db.commit()
    db.refresh(new_taller)
    return new_taller

# Publicidad
@router.post("/publicidad/", response_model=schemas.PublicidadOut)
def create_publicidad(
    publicidad: schemas.PublicidadCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    new_pub = models.Publicidad(**publicidad.dict())
    db.add(new_pub)
    db.commit()
    db.refresh(new_pub)
    return new_pub
