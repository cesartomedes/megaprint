from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import shutil, os

router = APIRouter()

UPLOAD_DIR = "uploads/volantes"

# POST para subir volante
@router.post("/upload")
async def upload_volante(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = f"{UPLOAD_DIR}/{file.filename}"
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"msg": "Volante subido", "path": filepath}

# GET para listar volantes
@router.get("/")
async def listar_volantes():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    archivos = os.listdir(UPLOAD_DIR)
    volantes = []
    for idx, nombre_archivo in enumerate(archivos, start=1):
        volantes.append({
            "id": idx,
            "nombre": nombre_archivo,
            "url": f"/{UPLOAD_DIR}/{nombre_archivo}"
        })
    return volantes
