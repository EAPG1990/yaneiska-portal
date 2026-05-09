from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth

router = APIRouter(prefix="/gastos", tags=["Gastos"])

@router.get("/", response_model=List[schemas.GastoOut])
def get_gastos(
    mes: int, anio: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Gasto).filter(
        models.Gasto.mes == mes,
        models.Gasto.anio == anio
    ).all()

@router.post("/", response_model=schemas.GastoOut)
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

@router.delete("/{id}")
def delete_gasto(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    gasto = db.query(models.Gasto).filter(models.Gasto.id == id).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    
    db.delete(gasto)
    db.commit()
    return {"detail": "Gasto eliminado"}
