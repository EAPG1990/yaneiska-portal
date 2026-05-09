from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/alumnas", tags=["Alumnas"])

@router.get("/", response_model=List[schemas.AlumnaOut])
def get_alumnas(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        return db.query(models.Alumna).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar alumnas: {str(e)}"
        )

@router.post("/", response_model=schemas.AlumnaOut)
def create_alumna(
    alumna: schemas.AlumnaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    try:
        new_alumna = models.Alumna(**alumna.dict())
        db.add(new_alumna)
        db.commit()
        db.refresh(new_alumna)
        return new_alumna
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error de base de datos: {str(e)}"
        )

@router.get("/{id}", response_model=schemas.AlumnaOut)
def get_alumna(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    alumna = db.query(models.Alumna).filter(models.Alumna.id == id).first()
    if not alumna:
        raise HTTPException(status_code=404, detail="Alumna no encontrada")
    return alumna

@router.delete("/{id}")
def delete_alumna(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    alumna = db.query(models.Alumna).filter(models.Alumna.id == id).first()
    if not alumna:
        raise HTTPException(status_code=404, detail="Alumna no encontrada")
    db.delete(alumna)
    db.commit()
    return {"detail": "Alumna eliminada correctamente"}

@router.put("/{id}", response_model=schemas.AlumnaOut)
def update_alumna(
    id: int,
    alumna_update: schemas.AlumnaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    db_alumna = db.query(models.Alumna).filter(models.Alumna.id == id).first()
    if not db_alumna:
        raise HTTPException(status_code=404, detail="Alumna no encontrada")
    
    for key, value in alumna_update.dict().items():
        setattr(db_alumna, key, value)
    
    db.commit()
    db.refresh(db_alumna)
    return db_alumna
