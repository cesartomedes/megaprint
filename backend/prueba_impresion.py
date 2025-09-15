import os
import win32api
import win32print

# Ruta del archivo que quieres imprimir
file_path = "test.txt"

# Nombre de la impresora (tal como aparece en printers)
printer_name = "HPI21F282"

if not os.path.exists(file_path):
    print(f"❌ El archivo {file_path} no existe")
else:
    try:
        win32api.ShellExecute(
            0,
            "print",
            file_path,
            f'/d:"{printer_name}"',
            ".",
            0
        )
        print(f"✅ Archivo {file_path} enviado a {printer_name}")
    except Exception as e:
        print(f"❌ Error al imprimir: {e}")
