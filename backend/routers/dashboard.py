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
        models.AlquilerSala.anio == anio,
        models.AlquilerSala.pagado == True
    ).scalar() or 0

    # 2. Ingresos por Talleres (Calculado neto si el docente ya cobró para evitar inflación de ingresos)
    # Sumamos ganancia neta (total_ingreso - pago_facilitador) para talleres cobrados que ya pagaron al docente
    ingresos_talleres_netos = db.query(func.sum(models.Taller.total_ingreso - models.Taller.pago_facilitador)).filter(
        models.Taller.mes == mes,
        models.Taller.anio == anio,
        models.Taller.pagado == True,
        models.Taller.pago_facilitador_realizado == True
    ).scalar() or 0

    # Sumamos total_ingreso para talleres cobrados que AÚN NO han pagado al docente (el estudio tiene el bruto temporalmente)
    ingresos_talleres_brutos = db.query(func.sum(models.Taller.total_ingreso)).filter(
        models.Taller.mes == mes,
        models.Taller.anio == anio,
        models.Taller.pagado == True,
        models.Taller.pago_facilitador_realizado == False
    ).scalar() or 0

    ingresos_talleres = ingresos_talleres_netos + ingresos_talleres_brutos

    # 3. Egresos: Pagos a Facilitadores de Talleres
    # Solo cuenta como egreso separado en el dashboard si el docente fue pagado pero el taller NO ha sido cobrado aún.
    # Si el taller ya fue cobrado, el pago al docente se deduce directamente del ingreso (evitando doble cómputo).
    pagos_facilitadores = db.query(func.sum(models.Taller.pago_facilitador)).filter(
        models.Taller.mes == mes,
        models.Taller.anio == anio,
        models.Taller.pago_facilitador_realizado == True,
        models.Taller.pagado == False
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

    # 6. Ingresos por Cuotas de Alumnas (Reales de pagos_alumnas)
    ingresos_cuotas = db.query(func.sum(models.PagoAlumna.monto)).filter(
        models.PagoAlumna.mes == mes,
        models.PagoAlumna.anio == anio,
        models.PagoAlumna.pagado == True
    ).scalar() or 0

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
