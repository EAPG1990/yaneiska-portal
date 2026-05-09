from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, Enum, Text, DateTime
from sqlalchemy.orm import relationship, declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DOCENTE = "docente"
    ALUMNA = "alumna"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.DOCENTE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Docente(Base):
    __tablename__ = "docentes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    alias = Column(String)
    activo = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    user = relationship("User")
    clases = relationship("ClaseDocente", back_populates="docente")
    alumnas = relationship("Alumna", back_populates="docente")

class Actividad(Base):
    __tablename__ = "actividades"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo = Column(String) # danza, pilates, yoga, etc.

class Nivel(Base):
    __tablename__ = "niveles"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False) # Principiante, Intermedio, etc.

class Combo(Base):
    __tablename__ = "combos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text)
    costo_mensual = Column(Float, default=0.0)
    cantidad_actividades = Column(Integer, default=1)

class Alumna(Base):
    __tablename__ = "alumnas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    edad = Column(Integer)
    direccion = Column(String)
    email = Column(String)
    telefono = Column(String)
    actividades = Column(String) # Danza Arabe, Chinchines, etc.
    
    combo_id = Column(Integer, ForeignKey("combos.id"), nullable=True)
    nivel = Column(String) # Principiante, Intermedio, etc.
    nivel_id = Column(Integer, ForeignKey("niveles.id"), nullable=True)
    docente_id = Column(Integer, ForeignKey("docentes.id"), nullable=True)
    
    es_clase_prueba = Column(Boolean, default=False)
    continuo_despues_prueba = Column(Boolean, default=True)
    activo = Column(Boolean, default=True)
    fecha_ingreso = Column(Date, default=datetime.utcnow().date())

    combo = relationship("Combo")
    nivel_obj = relationship("Nivel")
    docente = relationship("Docente", back_populates="alumnas")
    pagos = relationship("PagoAlumna", back_populates="alumna")

class PagoAlumna(Base):
    __tablename__ = "pagos_alumnas"
    id = Column(Integer, primary_key=True, index=True)
    alumna_id = Column(Integer, ForeignKey("alumnas.id"))
    mes = Column(Integer, nullable=False) # 1-12
    anio = Column(Integer, nullable=False)
    monto = Column(Float, default=0.0)
    senado = Column(Boolean, default=False)
    pagado = Column(Boolean, default=False)
    fecha_pago = Column(DateTime, default=datetime.utcnow)

    alumna = relationship("Alumna", back_populates="pagos")

class ClaseDocente(Base):
    __tablename__ = "clases_docentes"
    id = Column(Integer, primary_key=True, index=True)
    docente_id = Column(Integer, ForeignKey("docentes.id"))
    mes = Column(Integer)
    anio = Column(Integer)
    cantidad_clases = Column(Integer, default=1)
    duracion = Column(Float, default=1.0)
    horas_ejecutadas = Column(Float)
    tarifa_hora = Column(Float)
    total_pago = Column(Float)
    tipo = Column(String)

    docente = relationship("Docente", back_populates="clases")

class AlquilerSala(Base):
    __tablename__ = "alquileres_sala"
    id = Column(Integer, primary_key=True, index=True)
    nombre_cliente = Column(String, nullable=False)
    tipo = Column(String) # ES (Entre Semana) / FS (Fin de Semana)
    horas = Column(Float, default=0.0)
    tarifa_aplicada = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    fecha = Column(Date)
    mes = Column(Integer)
    anio = Column(Integer)
    pagado = Column(Boolean, default=False)

class Configuracion(Base):
    __tablename__ = "configuraciones"
    id = Column(Integer, primary_key=True, index=True)
    clave = Column(String, unique=True, index=True)
    valor = Column(String)
    descripcion = Column(String, nullable=True)

class Gasto(Base):
    __tablename__ = "gastos"
    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String)
    descripcion = Column(String)
    monto = Column(Float, default=0.0)
    fecha = Column(Date)
    mes = Column(Integer)
    anio = Column(Integer)
    ticket = Column(String) # Referencia o nro de ticket

class Taller(Base):
    __tablename__ = "talleres"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    facilitador = Column(String)
    fecha = Column(Date)
    ganancia_estudio = Column(Float, default=0.0)
    pago_facilitador = Column(Float, default=0.0)
    total_ingreso = Column(Float, default=0.0)
    mes = Column(Integer)
    anio = Column(Integer)
    pago_facilitador_realizado = Column(Boolean, default=False)

class Publicidad(Base):
    __tablename__ = "publicidad"
    id = Column(Integer, primary_key=True, index=True)
    plataforma = Column(String) # Facebook, Instagram, etc.
    descripcion = Column(String)
    monto_ars = Column(Float, default=0.0)
    fecha = Column(Date)
