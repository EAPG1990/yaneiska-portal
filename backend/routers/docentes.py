from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, database

router = APIRouter(prefix="/docentes", tags=["Docentes"])

# CRUD Docentes
@router.get("/", response_model=List[schemas.DocenteOut])
def get_docentes(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Docente).all()

@router.post("/", response_model=schemas.DocenteOut)
def create_docente(
    docente: schemas.DocenteCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    new_docente = models.Docente(**docente.dict())
    db.add(new_docente)
    db.commit()
    db.refresh(new_docente)
    return new_docente

@router.put("/{id}", response_model=schemas.DocenteOut)
def update_docente(
    id: int,
    docente_update: schemas.DocenteCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    db_docente = db.query(models.Docente).filter(models.Docente.id == id).first()
    if not db_docente:
        raise HTTPException(status_code=404, detail="Docente no encontrado")
    
    for key, value in docente_update.dict().items():
        setattr(db_docente, key, value)
    
    db.commit()
    db.refresh(db_docente)
    return db_docente

@router.delete("/{id}")
def delete_docente(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    db_docente = db.query(models.Docente).filter(models.Docente.id == id).first()
    if not db_docente:
        raise HTTPException(status_code=404, detail="Docente no encontrado")
    
    # Baja lógica
    db_docente.activo = False
    db.commit()
    return {"detail": "Docente desactivado correctamente"}

# Horas/Clases Docentes
@router.get("/clases/", response_model=List[schemas.ClaseDocenteOut])
def get_clases_docentes(
    mes: int, anio: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.ClaseDocente).filter(
        models.ClaseDocente.mes == mes,
        models.ClaseDocente.anio == anio
    )
    
    # Privacidad: Si es docente, solo ve sus clases
    if current_user.role == models.UserRole.DOCENTE:
        docente = db.query(models.Docente).filter(models.Docente.user_id == current_user.id).first()
        if not docente:
            return [] # No tiene perfil docente vinculado
        query = query.filter(models.ClaseDocente.docente_id == docente.id)
        
    return query.all()

@router.post("/clases/", response_model=schemas.ClaseDocenteOut)
def register_clase_docente(
    clase: schemas.ClaseDocenteCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Privacidad en carga: Si es docente, forzar que el docente_id sea el suyo
    if current_user.role == models.UserRole.DOCENTE:
        docente = db.query(models.Docente).filter(models.Docente.user_id == current_user.id).first()
        if not docente or clase.docente_id != docente.id:
            raise HTTPException(status_code=403, detail="No tienes permiso para cargar clases a otro docente")

    # La tarifa enviada desde el frontend ya es el precio por clase
    total_pago = clase.cantidad_clases * clase.tarifa_hora
    
    new_clase = models.ClaseDocente(
        **clase.dict(),
        total_pago=total_pago
    )
    db.add(new_clase)
    db.commit()
    db.refresh(new_clase)
    return new_clase
