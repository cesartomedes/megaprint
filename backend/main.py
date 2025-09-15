from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.routing import APIRoute
import os

# Routers
from routes import auth, volantes, vendedoras, categorias, pagos, catalogos, dashboard, admin, impresiones, deudas, notificaciones
from routes.config_helper import router as config_router

# Base de datos
from database import Base, engine

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Volantes")


UPLOAD_DIR = "uploads/comprobantes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads/comprobantes", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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
    allow_headers=["*"],
)

# Routers principales
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

app.include_router(impresiones.router, prefix="/impresiones", tags=["Impresiones"])
app.include_router(vendedoras.router, prefix="/vendedoras", tags=["Vendedoras"])
app.include_router(categorias.router, prefix="/categorias", tags=["Categorias"])
app.include_router(pagos.router, prefix="/pagos", tags=["Pagos"])
app.include_router(catalogos.router, prefix="/catalogos", tags=["Catalogos"])
app.include_router(config_router)  # Eliminado prefijo duplicado
app.include_router(deudas.router, prefix="/deudas", tags=["Deudas"])
app.include_router(dashboard.router)
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(volantes.router, prefix="/volantes")
app.include_router(notificaciones.router, prefix="/notificaciones", tags=["Notificaciones"])


# Montaje de PDFs
app.mount("/catalogos/files", StaticFiles(directory="uploads/catalogos/pdf"), name="catalogos_files")


# Imprimir rutas para debug
for route in app.routes:
    if isinstance(route, APIRoute):
        print("ROUTE:", route.path, route.methods)
