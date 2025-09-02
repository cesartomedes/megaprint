from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa tus routers
from routes import auth, volantes, print_jobs

app = FastAPI(title="Sistema de Volantes")

# Permitir CORS
origins = [
    "http://localhost:3000",  # tu frontend
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas principales
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(volantes.router, prefix="/volantes", tags=["Volantes"])
app.include_router(print_jobs.router, prefix="/print", tags=["PrintJobs"])
