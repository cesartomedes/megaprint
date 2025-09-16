import sqlite3

# Ruta a la base de datos que usa FastAPI
DB_PATH = "megaprint.db"

def agregar_catalogo_column():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Obtener columnas actuales
    cursor.execute("PRAGMA table_info(impresiones);")
    columns = [col[1] for col in cursor.fetchall()]
    print("Columnas actuales en 'impresiones':", columns)

    # Verificar si catalogo_id ya existe
    if "catalogo_id" not in columns:
        print("Columna 'catalogo_id' no encontrada. Agregando columna...")
        cursor.execute("ALTER TABLE impresiones ADD COLUMN catalogo_id INTEGER;")
        conn.commit()
        print("Columna 'catalogo_id' agregada correctamente ✅")
    else:
        print("La columna 'catalogo_id' ya existe. Nada que hacer ✅")

    conn.close()

if __name__ == "__main__":
    agregar_catalogo_column()
