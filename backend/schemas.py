from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from models import UserRole

# Schemas de Usuario
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Schemas de Alumna
class AlumnaBase(BaseModel):
    nombre: str
    apellido: str
    edad: Optional[int] = None
    direccion: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    actividades: Optional[str] = None
    nivel: Optional[str] = None
    combo_id: Optional[int] = None
    nivel_id: Optional[int] = None
    docente_id: Optional[int] = None
    es_clase_prueba: bool = False
    activo: bool = True

class AlumnaCreate(AlumnaBase):
    pass

class AlumnaOut(AlumnaBase):
    id: int
    fecha_ingreso: date
    activo: bool
    class Config:
        from_attributes = True

# Schemas de Docente
class DocenteBase(BaseModel):
    nombre: str
    alias: Optional[str] = None
    activo: bool = True
    user_id: Optional[int] = None

class DocenteCreate(DocenteBase):
    pass

class DocenteOut(DocenteBase):
    id: int
    class Config:
        from_attributes = True

# Schemas de Combo
class ComboBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    costo_mensual: float
    cantidad_actividades: int

class ComboCreate(ComboBase):
    pass

class ComboOut(ComboBase):
    id: int
    class Config:
        from_attributes = True

# Schemas de ClaseDocente
class ClaseDocenteBase(BaseModel):
    docente_id: int
    mes: int
    anio: int
    horas_ejecutadas: Optional[float] = 0
    cantidad_clases: int = 1
    duracion: float = 1.0
    tarifa_hora: float
    tipo: Optional[str] = "Normal"

class ClaseDocenteCreate(ClaseDocenteBase):
    pass

class ClaseDocenteOut(ClaseDocenteBase):
    id: int
    total_pago: float
    class Config:
        from_attributes = True

# Schemas de AlquilerSala
class AlquilerSalaBase(BaseModel):
    nombre_cliente: str
    tipo: str
    horas: float
    tarifa_aplicada: float
    fecha: date
    mes: int
    anio: int
    pagado: bool = False

class AlquilerSalaCreate(AlquilerSalaBase):
    pass

class AlquilerSalaOut(AlquilerSalaBase):
    id: int
    total: float
    class Config:
        from_attributes = True

# Schemas de Gasto
class GastoBase(BaseModel):
    categoria: str
    descripcion: str
    monto: float
    fecha: date
    mes: int
    anio: int
    ticket: Optional[str] = None

class GastoCreate(GastoBase):
    pass

class GastoOut(GastoBase):
    id: int
    class Config:
        from_attributes = True

# Schemas de Taller
class TallerBase(BaseModel):
    nombre: str
    facilitador: Optional[str] = None
    fecha: date
    total_ingreso: float
    pago_facilitador: float
    mes: int
    anio: int
    pago_facilitador_realizado: bool = False

class TallerCreate(TallerBase):
    pass

class TallerOut(TallerBase):
    id: int
    ganancia_estudio: float
    class Config:
        from_attributes = True

# Schemas de Configuracion
class ConfiguracionBase(BaseModel):
    clave: str
    valor: str

class ConfiguracionUpdate(BaseModel):
    valor: str

class ConfiguracionOut(ConfiguracionBase):
    id: int
    class Config:
        from_attributes = True

# Schemas de Publicidad
class PublicidadBase(BaseModel):
    plataforma: str
    descripcion: str
    monto_ars: float
    fecha: date

class PublicidadCreate(PublicidadBase):
    pass

class PublicidadOut(PublicidadBase):
    id: int
    class Config:
        from_attributes = True
