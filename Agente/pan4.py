import json
import pandas as pd
import glob
import os

def find_files_in_directory():
    files = glob.glob(r'C:\Users\alexc\Desktop\appcerveceria\Agente\downloaded_files\downloaded_xlsx\*.xlsx')
    if not files:
        print("No se encontraron archivos .xlsx.")
    return files

def check_invoice_total(file_name, supplier_name, given_total):
    print(f"Procesando archivo: {file_name}")
    try:
        # Open the Excel file and get the list of sheet names
        xls = pd.ExcelFile(file_name)
        sheet_names = xls.sheet_names

        # Select the last sheet by its name
        df = xls.parse(sheet_names[-1])
        print(f"Última hoja seleccionada: {sheet_names[-1]}")
            
        xls.close()
        # Find the index of the row where "La Cervecería." appears in the 'GTRULE' column
        rows_matching_criteria = df[df['GTRULE'].str.contains("La Cervecería.", case=False, na=False)]
        
        if rows_matching_criteria.empty:
            print("No se encontró la fila con 'La Cervecería.' en la columna 'GTRULE'")
            return None
        
        starting_index = rows_matching_criteria.index[0]
        
        # Filter the DataFrame from that index onward
        df = df[starting_index:]
        
        # Filter rows by the supplier name in the 'Unnamed: 1' column
        supplier_rows = df[df['Unnamed: 1'].str.contains(supplier_name, case=False, na=False)]
        
        if supplier_rows.empty:
            print(f"No se encontraron filas con el proveedor: {supplier_name}")
            return None
        
        # Extract the amounts related to the supplier from the 'Unnamed: 5' column
        amounts = supplier_rows['Unnamed: 5'].tolist()

        # Compute the total amount
        total_amount = sum(amounts)
        print(f"Total calculado para el proveedor {supplier_name}: {total_amount}")
        
        # Compare the computed total with the given total with a small tolerance
        tolerance = 0.01
        matches_given_total = abs(round(total_amount, 2) - given_total) < tolerance

        # Construct the JSON object
        result = {
            "supplier_name": supplier_name,
            "amounts": amounts,
            "total_computed": total_amount,
            "matches_given_total": matches_given_total
        }
        
        return result
    
    except Exception as e:
        print(f"Error al procesar el archivo {file_name}: {e}")
        return None

def process_files(supplier_name, given_total):
    # Obtener la lista de rutas de archivos
    file_paths = find_files_in_directory()

    # Verificar si file_paths está vacío o no es una lista
    if not file_paths or not isinstance(file_paths, list):
        print("No se encontraron archivos Excel en la carpeta especificada.")
        return

    # Procesar la información usando la función check_invoice_total para cada archivo
    for file_path in file_paths:
        result = check_invoice_total(file_path, supplier_name, given_total)

        # Print the results
        if result and result["matches_given_total"]:
            print(f"Encontré el monto solicitado en : {file_path}")
            print(result)
            return result
            
        
        # Delete the Excel file after processing
        try:
            os.remove(file_path)
            print(f"Archivo {file_path} eliminado exitosamente.")
        except Exception as e:
            print(f"Error al eliminar el archivo {file_path}: {e}")
    