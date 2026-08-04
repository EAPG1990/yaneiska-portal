from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth

router = APIRouter(prefix="/talleres", tags=["Talleres"])

@router.get("/", response_model=List[schemas.TallerOut])
def get_talleres(
    mes: int, anio: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Taller).filter(
        models.Taller.mes == mes,
        models.Taller.anio == anio
    ).all()

@router.post("/", response_model=schemas.TallerOut)
def create_taller(
    taller_in: schemas.TallerCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    # Forzar cálculo limpio
    income = float(taller_in.total_ingreso)
    payment = float(taller_in.pago_facilitador)
    ganancia = income - payment
    
    mes = taller_in.fecha.month if taller_in.fecha else taller_in.mes
    anio = taller_in.fecha.year if taller_in.fecha else taller_in.anio

    new_taller = models.Taller(
        nombre=taller_in.nombre,
        facilitador=taller_in.facilitador,
        fecha=taller_in.fecha,
        total_ingreso=income,
        pago_facilitador=payment,
        mes=mes,
        anio=anio,
        pago_facilitador_realizado=taller_in.pago_facilitador_realizado,
        pagado=taller_in.pagado,
        ganancia_estudio=ganancia
    )
    db.add(new_taller)
    db.commit()
    db.refresh(new_taller)
    return new_taller

@router.put("/{id}/pago-facilitador", response_model=schemas.TallerOut)
def toggle_pago_facilitador(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    taller = db.query(models.Taller).filter(models.Taller.id == id).first()
    if not taller:
        raise HTTPException(status_code=404, detail="Taller no encontrado")
    
    taller.pago_facilitador_realizado = not taller.pago_facilitador_realizado
    db.commit()
    db.refresh(taller)
    return taller

@router.put("/{id}/pagar", response_model=schemas.TallerOut)
def toggle_pago_taller(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    taller = db.query(models.Taller).filter(models.Taller.id == id).first()
    if not taller:
        raise HTTPException(status_code=404, detail="Taller no encontrado")
    
    taller.pagado = not taller.pagado
    db.commit()
    db.refresh(taller)
    return taller

@router.delete("/{id}")
def delete_taller(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    taller = db.query(models.Taller).filter(models.Taller.id == id).first()
    if not taller:
        raise HTTPException(status_code=404, detail="Taller no encontrado")
    
    db.delete(taller)
    db.commit()
    return {"detail": "Taller eliminado"}
