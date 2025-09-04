from flask import Flask, jsonify, request
from flask_cors import CORS
import win32print
import win32api
import os

app = Flask(__name__)
CORS(app)

# ---------------------------
# Listar impresoras disponibles
# ---------------------------
@app.route("/api/printers", methods=["GET"])
def get_printers():
    printers = win32print.EnumPrinters(
        win32print.PRINTER_ENUM_LOCAL |
        win32print.PRINTER_ENUM_CONNECTIONS |
        win32print.PRINTER_ENUM_NETWORK
    )
    result = [{"name": p[2]} for p in printers]
    return jsonify(result)

# ---------------------------
# Enviar archivo a imprimir
# ---------------------------
@app.route("/api/print", methods=["POST"])
def print_file():
    data = request.json
    printer_name = data.get("printer")
    file_path = data.get("file_path")

    if not printer_name or not file_path or not os.path.isfile(file_path):
        return jsonify({"status": "error", "message": "Impresora o archivo inválido"}), 400

    try:
        win32print.SetDefaultPrinter(printer_name)
        win32api.ShellExecute(
            0,
            "print",
            file_path,
            None,
            ".",
            0
        )
        return jsonify({"status": "enviado", "printer": printer_name})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ---------------------------
# Listar trabajos en cola
# ---------------------------
@app.route("/api/jobs", methods=["GET"])
def list_jobs():
    jobs_list = []
    printers = win32print.EnumPrinters(
        win32print.PRINTER_ENUM_LOCAL |
        win32print.PRINTER_ENUM_CONNECTIONS |
        win32print.PRINTER_ENUM_NETWORK
    )
    for p in printers:
        printer_name = p[2]
        try:
            handle = win32print.OpenPrinter(printer_name)
            jobs = win32print.EnumJobs(handle, 0, -1, 1)
            for job in jobs:
                jobs_list.append({
                    "id": job["JobId"],
                    "printer": printer_name,
                    "title": job["pDocument"],
                    "status": job["Status"],
                    "submitted_by": job["pUserName"]
                })
            win32print.ClosePrinter(handle)
        except:
            continue
    return jsonify(jobs_list)

# ---------------------------
# Cancelar un trabajo
# ---------------------------
@app.route("/api/cancel/<int:job_id>", methods=["POST"])
def cancel_job(job_id):
    printers = win32print.EnumPrinters(
        win32print.PRINTER_ENUM_LOCAL |
        win32print.PRINTER_ENUM_CONNECTIONS |
        win32print.PRINTER_ENUM_NETWORK
    )
    for p in printers:
        printer_name = p[2]
        try:
            handle = win32print.OpenPrinter(printer_name)
            win32print.SetJob(handle, job_id, 0, None, win32print.JOB_CONTROL_CANCEL)
            win32print.ClosePrinter(handle)
            return jsonify({"status": "cancelled", "job_id": job_id})
        except:
            continue
    return jsonify({"status": "error", "message": "Job not found"}), 404

if __name__ == "__main__":
    print(app.url_map)  # Ver rutas activas
    app.run(debug=True, port=5000)
# --- DEBUG: listar impresoras en Windows ---
printers = win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS)
print("Impresoras detectadas en Windows:")
for p in printers:
    print(p[2])