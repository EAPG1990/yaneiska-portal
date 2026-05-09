from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth

router = APIRouter(prefix="/alquileres", tags=["Alquiler de Sala"])

@router.get("/", response_model=List[schemas.AlquilerSalaOut])
def get_alquileres(
    mes: int, anio: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.AlquilerSala).filter(
        models.AlquilerSala.mes == mes,
        models.AlquilerSala.anio == anio
    ).all()

@router.post("/", response_model=schemas.AlquilerSalaOut)
def create_alquiler(
    alquiler: schemas.AlquilerSalaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    # Calcular total
    total = alquiler.horas * alquiler.tarifa_aplicada
    
    new_alquiler = models.AlquilerSala(
        **alquiler.dict(),
        total=total
    )
    db.add(new_alquiler)
    db.commit()
    db.refresh(new_alquiler)
    return new_alquiler

@router.put("/{id}/pagar", response_model=schemas.AlquilerSalaOut)
def toggle_pago_alquiler(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    alquiler = db.query(models.AlquilerSala).filter(models.AlquilerSala.id == id).first()
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")
    
    alquiler.pagado = not alquiler.pagado
    db.commit()
    db.refresh(alquiler)
    return alquiler

@router.delete("/{id}")
def delete_alquiler(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    alquiler = db.query(models.AlquilerSala).filter(models.AlquilerSala.id == id).first()
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")
    
    db.delete(alquiler)
    db.commit()
    return {"detail": "Alquiler eliminado"}
