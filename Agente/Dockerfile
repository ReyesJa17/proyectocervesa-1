# Usar una imagen oficial de Python
FROM python:3.9

# Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar el archivo de requerimientos
COPY requirements.txt ./

# Instalar las dependencias

RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de los archivos del proyecto
COPY . .

# Comando para ejecutar la aplicación
CMD ["python", "app3.py"]
