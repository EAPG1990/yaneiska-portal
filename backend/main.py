from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth as auth_router, alumnas, docentes, operaciones, configuraciones, alquileres, talleres, gastos, dashboard

app = FastAPI(title="Estudio Jimena González API")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth_router.router)
app.include_router(alumnas.router)
app.include_router(docentes.router)
app.include_router(operaciones.router)
app.include_router(configuraciones.router)
app.include_router(alquileres.router)
app.include_router(talleres.router)
app.include_router(gastos.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "API del Estudio Jimena Gonzalez funcionando correctamente"}
