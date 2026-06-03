from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

import models, schemas, auth, database

router = APIRouter(prefix="/pagos", tags=["Pagos"])

@router.get("/mensuales", response_model=List[schemas.PagoAlumnaStatusOut])
def get_pagos_mensuales(
    mes: int, anio: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    try:
        # 1. Obtener alumnas activas O de prueba O inactivas con pago registrado en este período
        alumnas = db.query(models.Alumna).outerjoin(
            models.PagoAlumna, models.Alumna.id == models.PagoAlumna.alumna_id
        ).filter(
            (models.Alumna.activo == True) |
            (models.Alumna.es_clase_prueba == True) |
            ((models.PagoAlumna.mes == mes) & (models.PagoAlumna.anio == anio) & (models.PagoAlumna.pagado == True))
        ).distinct().order_by(
            models.Alumna.nombre.asc(), models.Alumna.apellido.asc()
        ).all()
        
        # 2. Obtener todos los registros de pagos para ese mes y año
        pagos = db.query(models.PagoAlumna).filter(
            models.PagoAlumna.mes == mes,
            models.PagoAlumna.anio == anio
        ).all()
        
        # Mapear los pagos por alumna_id para búsqueda rápida
        pagos_map = {p.alumna_id: p for p in pagos}
        
        # 3. Construir la lista unificada
        result = []
        for alumna in alumnas:
            # Obtener el combo/plan de la alumna
            combo_nombre = "S/Plan"
            monto_esperado = 0.0
            if alumna.combo:
                combo_nombre = alumna.combo.nombre
                monto_esperado = alumna.combo.costo_mensual
            
            pago_reg = pagos_map.get(alumna.id)
            pagado = False
            fecha_pago = None
            pago_id = None
            monto_pagado = 0.0
            
            if pago_reg:
                pagado = pago_reg.pagado
                fecha_pago = pago_reg.fecha_pago
                pago_id = pago_reg.id
                monto_pagado = pago_reg.monto
                
            result.append(schemas.PagoAlumnaStatusOut(
                alumna_id=alumna.id,
                nombre=alumna.nombre,
                apellido=alumna.apellido,
                combo_nombre=combo_nombre,
                monto_esperado=monto_esperado,
                monto_pagado=monto_pagado,
                pagado=pagado,
                fecha_pago=fecha_pago,
                pago_id=pago_id
            ))
            
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar planilla de pagos: {str(e)}"
        )

@router.post("/registrar", response_model=schemas.PagoAlumnaOut)
def registrar_pago(
    payload: schemas.PagoAlumnaBase,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    try:
        # Buscar registro existente
        pago_existente = db.query(models.PagoAlumna).filter(
            models.PagoAlumna.alumna_id == payload.alumna_id,
            models.PagoAlumna.mes == payload.mes,
            models.PagoAlumna.anio == payload.anio
        ).first()
        
        if payload.pagado:
            # Si se marca como pagado
            if pago_existente:
                pago_existente.pagado = True
                pago_existente.monto = payload.monto if payload.monto > 0 else pago_existente.monto
                pago_existente.fecha_pago = datetime.utcnow()
                db.commit()
                db.refresh(pago_existente)
                return pago_existente
            else:
                # Si no existe, creamos uno nuevo
                # Obtener el monto esperado del combo de la alumna
                alumna = db.query(models.Alumna).filter(models.Alumna.id == payload.alumna_id).first()
                monto = payload.monto
                if (monto is None or monto <= 0) and alumna and alumna.combo:
                    monto = alumna.combo.costo_mensual
                elif monto is None:
                    monto = 0.0
                
                new_pago = models.PagoAlumna(
                    alumna_id=payload.alumna_id,
                    mes=payload.mes,
                    anio=payload.anio,
                    monto=monto,
                    pagado=True,
                    fecha_pago=datetime.utcnow()
                )
                db.add(new_pago)
                db.commit()
                db.refresh(new_pago)
                return new_pago
        else:
            # Si se marca como impago, eliminamos el registro de pago
            if pago_existente:
                pago_id = pago_existente.id
                db.delete(pago_existente)
                db.commit()
                # Devolvemos un objeto que cumpla con PagoAlumnaOut
                return models.PagoAlumna(
                    id=pago_id,
                    alumna_id=payload.alumna_id,
                    mes=payload.mes,
                    anio=payload.anio,
                    monto=0.0,
                    senado=False,
                    pagado=False,
                    fecha_pago=None
                )
            else:
                # Si no existía, devolvemos un dummy
                return models.PagoAlumna(
                    id=0,
                    alumna_id=payload.alumna_id,
                    mes=payload.mes,
                    anio=payload.anio,
                    monto=0.0,
                    senado=False,
                    pagado=False,
                    fecha_pago=None
                )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrar pago: {str(e)}"
        )
