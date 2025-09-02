from fastapi import FastAPI, UploadFile, Depends
from routes import auth, volantes, print_jobs

app = FastAPI(title="Sistema de Volantes")

# Rutas principales
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(volantes.router, prefix="/volantes", tags=["Volantes"])
app.include_router(print_jobs.router, prefix="/print", tags=["PrintJobs"])
