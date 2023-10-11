import requests
import io
from googleapiclient.http import MediaIoBaseDownload

from io import BytesIO
from googleapiclient.http import MediaIoBaseDownload
from pdfminer.high_level import extract_text
import re
import pika
import asyncio
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv
import os

# Specify the path to the .env file
dotenv_path = './base-baileys-memory/.env'

# Load the .env file
load_dotenv(dotenv_path=dotenv_path)

# Get the variables
client_email = os.getenv('CLIENT_EMAIL')
private_key = os.getenv('PRIVATE_KEY')

# Print the variables to verify they're loaded
# Construct the credentials dictionary  
# Construct the credentials dictionary


CREDENTIALS = {
    "type": "service_account",
    "project_id": "calendario-386204",
    "private_key_id": "74498e8e32a8888f9c16c07f5ef35aec01d568f5",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxSnxF57yzVFj0\nH5vrz9w9Vim+lk/u+LMYKinuOZXU2rvaqlsMRbbqAPFsJSgghAtSIcNRxnDfmZE2\nSRnokXIpE+M8UTLZoGaplfG0/DBt5y921Ea2VLAIQuo+ahTl9VQsJdLVTpM/VFTz\nSMODddQbbDY/XBRyrNo4DNfsG5Hhx79/thGZZf/BUx9iC77TqyC09be4RZ1wC/oP\nVTsGdL00RjbYc8AJCDibA71LpKGyPb0IWhdcvqJNmw2D++gkCkktgDFq11QTRpTw\nGYBm6gFx+dDK57H8gHkfFcgZ4wUGZtoEf+DTcmap32jVwQhYt6P+7McnQ1U69jd5\nyXZFubyjAgMBAAECggEAAcsHW6c65Ll2ECkdeffYXqrO4ehtIfFj1rkqm+ix5zaH\nVEkbgf+FupKS/dsGOhsazIiJrjUPJoPzNTjTdRT0kCU+LGdgE+1KnNhe8kZwmlbk\nqAeyI6zyBfloV1AjP3YSHQTOA8gWsXck/vghvpMwc6JYnakgdBoiEv6UYb6QC/S7\nuSS1Nm9yLDLtJOgS0K/JFOwYDueOIiCwE07CeaZrLgqDlkS7Tq+7WaiJd1cTsRL1\nHmKJyoIi7bUHGqPbLdOucA6x8ryDHfDQzK/KmGx2Xepwozq3TKBQ6tDvKTI9+2pe\n5noTZyGF4gHdpyPO8fc50EoPHGBIZ9Nb460bcT4NuQKBgQDp6HF8S7X1zxnj4ti5\nJh+MxwNGx5BmVo+zlxam41xfmVRA1FV98Zi9tK0B9eDvrmeWgPn4W7lAM6ExUMeg\n6hW9qmkg+v5f5Xm9B57O0bVsqhuM1NC75GvjQ3Wc/soMwsa60uAanp8FKyPMqgTW\nZvTK1jctQ+Ww8EykmhrszTZGeQKBgQDCCR/ZVILtVU6hRMGCNrbzukJRg8e8R8eC\nuflm9cM8vIz4DQkzB2RaIv/77ujX6cGLCCDx32FnaVCV2aWfTzxa/vUzTGivomQl\nkeb30v6rX+kSKt+wRZ9HR/K4DxtaLJ+F49UsxYnzD//Krl5ylBU3EqImryn+4Op7\nnKA2dH7E+wKBgQCoqx66fHXXrOGEfJ2+1QjHIPLx5RHxWdYBsJ969FQ184DXxsVn\nLgHwOgrPcRgkfWThGFwohSvOaeyAfTmWhXXr8KgiShuH1xe0AXy4smva0cdQBF4I\nPyy1En4LGYdlMEbRjSJgz6TnuzXzbV5TpKY8ZcAf+ef1cTIzN5TW0RukMQKBgGGp\naghfSw7dsxfknWlG1MrT4vFYXL3dewPHS0qRRFVbqbBoD0tJ2y6rEyDg3P1fwHSU\nAND81+/OyCrEQ2Jt5Tj/vra1LLPKDpICX7g40Mm9Gnh0b+YvBL5B7l7J68B1WU1w\noSlJu+dFFEAVh6Av/IWdsVO7Mm4BEsRozxLZi7zlAoGBANqrctjH93psoDeCyzWm\nHXr0uc8xNvLHTrXKCfkPR2jF9O/YHUEewhQ7Z/xQY8SWYzyoirfCruVvnVpAutQJ\ntpxoUc08e1BFSiCdO94xWW9f1kteNVABPt1aWlB+ocpWcrHt8fhUW4RC8RDYdJEc\nLTX5GJfSiA+Kb3pyrjGowYWn\n-----END PRIVATE KEY-----\n",
    "client_email": "provedorescerveceria@probedores-cerveceria.iam.gserviceaccount.com",
    "client_id": "109764280521264021966",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/traduccion%40calendario-386204.iam.gserviceaccount.com"
}

# Use credentials to establish a session
credentials = service_account.Credentials.from_service_account_info(
    CREDENTIALS,
    scopes=['https://www.googleapis.com/auth/drive']
)

# Build the Google Drive API client
drive = build('drive', 'v3', credentials=credentials)

print("Google Drive API client created successfully.")
print(drive)




def find_folder(drive, query, parent_id=None):
    query_str = f"{query} and '{parent_id}' in parents" if parent_id else query
    res = drive.files().list(q=query_str, fields='files(id, name)', spaces='drive').execute()
    return res.get('files', [])

def download_pdf(drive, file_id):
    # Define the folder where the PDF files will be saved
    folder_path = os.path.join(os.path.dirname(__file__), 'downloaded_pdfs')

    # Define the full path of the downloaded PDF
    file_path = os.path.join(folder_path, f"{file_id}.pdf")

    # Ensure the folder exists, if not, create it
    os.makedirs(folder_path, exist_ok=True)

    # Use Google Drive API to get the file
    request = drive.files().get_media(fileId=file_id)
    
    # Use io to stream data to a local file
    fh = io.FileIO(file_path, 'wb')
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while done is False:
        status, done = downloader.next_chunk()
        print(f"Downloaded {int(status.progress() * 100)}%.")

    print("PDF downloaded successfully.")
   
    

    return file_path



# Step 2 and 3: Process Each Local PDF and Delete Non-matching Ones
# [This remains the same as in the previous code snippet]


#////EXCELES/////////////////////////////////////////////////////////////////////////////////////
def download_file(drive, shareable_link):
    # Extract the file ID from the shareable link
    file_id = shareable_link.split('/d/')[1].split('/edit')[0]

    # Define the folder where the files will be saved
    folder_path = os.path.join(os.path.dirname(__file__), 'downloaded_files', 'downloaded_xlsx')

    # Define the full path of the downloaded file
    file_path = os.path.join(folder_path, f"{file_id}.xlsx")

    # Ensure the folder exists, if not, create it
    os.makedirs(folder_path, exist_ok=True)

    # Use Google Drive API to get the file
    request = drive.files().get_media(fileId=file_id)
    
    # Use io to stream data to a local file
    fh = io.FileIO(file_path, 'wb')
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while done is False:
        status, done = downloader.next_chunk()
        print(f"Downloaded {int(status.progress() * 100)}%.")

    print("File downloaded successfully.")
    return file_path

def find_folder_for_date(fecha):
    # Initialize Google Drive API client ////EXCELES

    

    try:
        # Search for the 'Facturas' folder
        facturas_folder =  find_folder(drive, "mimeType='application/vnd.google-apps.folder' and name='Facturas'")
        if not facturas_folder:
            print('No se encontró la carpeta "Facturas".')
            return
        facturas_folder_id = facturas_folder[0]['id']

        # Split the date into day, month, and year
        day_number, month_number, year = fecha.split('.')
        month_names = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        month = month_names[int(month_number) - 1]
        month_past = month_names[int(month_number) - 2]

        # Search for the year folder
        year_folder = find_folder(drive, f"mimeType='application/vnd.google-apps.folder' and name='{year}'", facturas_folder_id)
        if not year_folder:
            print(f'No se encontró la carpeta del año {year}.')
            return
        year_folder_id = year_folder[0]['id']
        file_path = f'Facturas/{year}/'

        # Determine the month folder based on the day number
        month_folder_id = None
        if int(day_number) - 19 <= 0:
            print("mes pasado")
            month_folder_past = find_folder(drive, f"mimeType='application/vnd.google-apps.folder' and name='{month_past}'", year_folder_id)
            if not month_folder_past:
                print(f'No se encontró la carpeta del mes {month_past}.')
                return
            month_folder_id = month_folder_past[0]['id']
            file_path += month_past + '/'
        else:
            print("mes actual")
            month_folder = find_folder(drive, f"mimeType='application/vnd.google-apps.folder' and name='{month}'", year_folder_id)
            if not month_folder:
                print(f'No se encontró la carpeta del mes {month}.')
                return
            month_folder_id = month_folder[0]['id']
            file_path += month + '/'
            print(f'Se encontró la carpeta del mes {month} con ID: {month_folder_id}')
        
        # Get all day folders
        all_day_folders =  find_folder(drive, "mimeType='application/vnd.google-apps.folder'", month_folder_id)
        print(f'Se encontraron {len(all_day_folders)} carpetas en la carpeta del mes.')
        
        # Select the target folder
        target_folder = all_day_folders[0]
        if not target_folder:
            print('No se encontró una carpeta válida para la fecha proporcionada.')
            return
        file_path += target_folder['name'] + '/'
        print(f'La carpeta seleccionada para la fecha {fecha} es: {target_folder["name"]}')
        
        # Search for Excel files in the day folder
        res_excel_files = drive.files().list(
            q=f"'{target_folder['id']}' in parents and mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'",
            fields='files(id, name)',
            spaces='drive'
        ).execute()
        excel_files = res_excel_files.get('files', [])
        if not excel_files:
            print('No se encontraron archivos .xlsx en la carpeta seleccionada.')
            return
        
        print(f'Found {len(excel_files)} Excel files.')
        downloaded_file_paths = []

        for excel_file in excel_files:
            current_file_path = file_path + excel_file['name']
            print(f'Processing file: {current_file_path}')

            # Create permissions for the Excel file
            drive.permissions().create(
                fileId=excel_file['id'],
                body={'role': 'reader', 'type': 'anyone'}
            ).execute()

            # Get the shareable link of the file
            file_metadata = drive.files().get(
                fileId=excel_file['id'],
                fields='webViewLink'
            ).execute()
            shareable_link = file_metadata['webViewLink']
            print(f'El enlace compartible del archivo es: {shareable_link}')
            
            # Download the file based on the shareable link and store the filepath
            filepath =  download_file(drive, shareable_link)
            downloaded_file_paths.append(filepath)


        # Return all the downloaded filepaths
        
        return downloaded_file_paths

    except Exception as err:
        print('Error:', err)


#FIN DE EXTRAER EXCELES/////////////////////////////////////////////////////////////////////////////////////



import re
from pdfminer.high_level import extract_text

def extract_first_date_from_pdf(pdf_content):
    try:
        # Convert the BytesIO object to a string for processing with pdfminer
        text = extract_text(pdf_content)
        
        # Adjusted date pattern to match DD/MM/YY format
        date_pattern = r'\d{2}/\d{2}/\d{4}'
        match = re.search(date_pattern, text)
        if match:
            # Convert date from format DD/MM/YYYY to DD.MM.YYYY
            date_with_slashes = match.group()
            date_with_dots = date_with_slashes.replace('/', '.')
            return date_with_dots
    except Exception as e:
        print(f"Error extracting date from PDF: {e}")
    return None




def find_comprobante_folder_for_date(fecha):
    # ... (Previous logic up to PDF file retrieval)
    file_path = 'Comprobantes/'
    
    # Initialize the Google Drive API client
    try:
        # Locate "Comprobantes" folder
        comprobantes_folder =  find_folder(drive, "mimeType='application/vnd.google-apps.folder' and name='Comprobantes'")
        if not comprobantes_folder:
            print('No se encontró la carpeta "Comprobantes".')
            return
        comprobantes_folder_id = comprobantes_folder[0]['id']
        
        # Decompose the date string
        day, month_number, year = fecha.split('.')
        month_names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        month = month_names[int(month_number) - 1]
        
        # Locate year subfolder
        year_folder = find_folder(drive, f"mimeType='application/vnd.google-apps.folder' and name='{year}'", comprobantes_folder_id)
        if not year_folder:
            print(f'No se encontró la carpeta del año {year}.')
            return
        year_folder_id = year_folder[0]['id']
        
        # Locate month subfolder
        month_folder =  find_folder(drive, f"mimeType='application/vnd.google-apps.folder' and name='{month}'", year_folder_id)
        if not month_folder:
            print(f'No se encontró la carpeta del mes {month}.')
            return
        month_folder_id = month_folder[0]['id']
        file_path += f'{month}/'
        
        print(f'Se encontró la carpeta del mes {month} con ID: {month_folder_id}')
        
        # List all PDF files in the month folder
        res_pdf_files = drive.files().list(
            q=f"'{month_folder_id}' in parents and mimeType='application/pdf'",
            fields='files(id, name)',
            spaces='drive'
        ).execute()
        
        pdf_files = res_pdf_files.get('files', [])
        print(f'Se encontraron {len(pdf_files)} archivos PDF en la carpeta del mes.')

        matching_files = []

        for pdf_file in pdf_files:
            print(f'Procesando archivo: {pdf_file["name"]}')

            # Download the PDF using the file ID
            local_pdf_path = download_pdf(drive, pdf_file['id'])
            print(f'Archivo descargado en: {local_pdf_path}')

            # Extract the date from the local PDF
            date = extract_first_date_from_pdf(local_pdf_path)
            if date:
                print(f'La fecha extraída del archivo es: {date}')
                if date == fecha:
                    print(f'La fecha extraída del archivo coincide con la fecha proporcionada.')
                    matching_files.append(pdf_file)
                else:
                    print(f'La fecha extraída del archivo no coincide con la fecha proporcionada.')
                    # Delete the local copy
                    os.remove(local_pdf_path)
                    print(f'Archivo {pdf_file["name"]} eliminado localmente.')
            else:
                print('No se pudo extraer la fecha del archivo.')
    except Exception as e:
        print('Error is :', str(e))

    # Replace the following line with actual logic to retrieve PDF files



