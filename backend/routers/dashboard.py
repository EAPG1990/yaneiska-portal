from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, database, auth
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/resumen-mensual")
def get_resumen_mensual(
    mes: int, anio: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))
):
    # 1. Ingresos por Alquileres
    ingresos_alquileres = db.query(func.sum(models.AlquilerSala.total)).filter(
        models.AlquilerSala.mes == mes,
        models.AlquilerSala.anio == anio
    ).scalar() or 0

    # 2. Ingresos por Talleres (Total Ingreso)
    ingresos_talleres = db.query(func.sum(models.Taller.total_ingreso)).filter(
        models.Taller.mes == mes,
        models.Taller.anio == anio
    ).scalar() or 0

    # 3. Egresos: Pagos a Facilitadores de Talleres
    pagos_facilitadores = db.query(func.sum(models.Taller.pago_facilitador)).filter(
        models.Taller.mes == mes,
        models.Taller.anio == anio
    ).scalar() or 0

    # 4. Egresos: Gastos Varios
    gastos_varios = db.query(func.sum(models.Gasto.monto)).filter(
        models.Gasto.mes == mes,
        models.Gasto.anio == anio
    ).scalar() or 0

    # 5. Egresos: Pagos a Docentes (Clases)
    pagos_docentes = db.query(func.sum(models.ClaseDocente.total_pago)).filter(
        models.ClaseDocente.mes == mes,
        models.ClaseDocente.anio == anio
    ).scalar() or 0

    # 6. Ingresos por Cuotas de Alumnas (Simulado por ahora hasta conectar PagosAlumnas)
    # Por ahora tomamos la suma de lo que deberían pagar según su combo
    # En una fase futura usaremos la tabla pagos_alumnas
    ingresos_cuotas = db.query(func.sum(models.Combo.costo_mensual)).join(
        models.Alumna, models.Alumna.combo_id == models.Combo.id
    ).filter(models.Alumna.activo == True).scalar() or 0

    total_ingresos = ingresos_alquileres + ingresos_talleres + ingresos_cuotas
    total_egresos = pagos_facilitadores + gastos_varios + pagos_docentes
    balance_neto = total_ingresos - total_egresos

    return {
        "ingresos": {
            "alquileres": ingresos_alquileres,
            "talleres": ingresos_talleres,
            "cuotas": ingresos_cuotas,
            "total": total_ingresos
        },
        "egresos": {
            "facilitadores": pagos_facilitadores,
            "gastos_varios": gastos_varios,
            "docentes": pagos_docentes,
            "total": total_egresos
        },
        "balance_neto": balance_neto,
        "periodo": {"mes": mes, "anio": anio}
    }
