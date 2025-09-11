from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.routing import APIRoute

# Routers
from routes import auth, volantes, vendedoras, categorias, pagos, catalogos, dashboard, admin, impresiones, deudas

# Base de datos
from database import Base, engine

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Volantes")

# Configuración CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
     allow_origins=["*"],  # para test rápido
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],       # headers permitidos # Headers permitidos
)

# Routers principales
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(volantes.router, prefix="/volantes", tags=["Volantes"])
app.include_router(impresiones.router, prefix="", tags=["Impresiones"])
app.include_router(vendedoras.router, prefix="/vendedoras", tags=["Vendedoras"])  # solo aprobadas
app.include_router(categorias.router, prefix="/categorias", tags=["Categorias"])
app.include_router(pagos.router, prefix="/pagos", tags=["Pagos"])
app.include_router(catalogos.router, prefix="/catalogos", tags=["Catalogos"])
app.include_router(deudas.router)

app.include_router(dashboard.router)

app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(volantes.router, prefix="/volantes")

# Montaje de PDFs
app.mount("/catalogos/files", StaticFiles(directory="uploads/catalogos/pdf"), name="catalogos_files")



for route in app.routes:
    if isinstance(route, APIRoute):
        print("ROUTE:", route.path, route.methods)

