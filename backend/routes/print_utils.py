# routes/print_utils.py
import os
import win32print
import win32ui
from PIL import Image, ImageWin
import win32api

def print_file(file_path: str, printer_name: str = "HPI21F282"):
    """
    Imprime un archivo directamente:
    - Si es PDF → usa ShellExecute (aplicación predeterminada de Windows).
    - Si es imagen (JPG/PNG) → la envía directo a la impresora.
    """
    if not os.path.exists(file_path):
        print(f"❌ El archivo {file_path} no existe")
        return

    ext = os.path.splitext(file_path)[1].lower()

    try:
        # Verificar impresoras disponibles
        printer_list = [p[2] for p in win32print.EnumPrinters(2)]
        if printer_name not in printer_list:
            print(f"❌ Impresora {printer_name} no encontrada. Impresoras disponibles: {printer_list}")
            return

        if ext == ".pdf":
            # Imprimir PDF con aplicación predeterminada
            win32api.ShellExecute(0, "print", file_path, f'/d:"{printer_name}"', ".", 0)
            print(f"✅ PDF {file_path} enviado a impresora {printer_name}")
        else:
            # Imprimir imagen directamente
            hprinter = win32print.OpenPrinter(printer_name)
            hdc = win32ui.CreateDC()
            hdc.CreatePrinterDC(printer_name)

            hdc.StartDoc(file_path)
            hdc.StartPage()

            img = Image.open(file_path)
            dib = ImageWin.Dib(img)

            # Ajustar imagen al tamaño de la página de la impresora
            width = hdc.GetDeviceCaps(8)   # HORZRES
            height = hdc.GetDeviceCaps(10) # VERTRES
            dib.draw(hdc.GetHandleOutput(), (0, 0, width, height))

            hdc.EndPage()
            hdc.EndDoc()
            hdc.DeleteDC()
            win32print.ClosePrinter(hprinter)

            print(f"✅ Imagen {file_path} enviada a impresora {printer_name}")

    except Exception as e:
        print(f"❌ Error al imprimir {file_path}: {e}") 
