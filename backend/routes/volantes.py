from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
import shutil, os

router = APIRouter()

UPLOAD_DIR = "uploads/volantes"

@router.post("/upload")
async def upload_volante(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = f"{UPLOAD_DIR}/{file.filename}"
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"msg": "Volante subido", "path": filepath}
