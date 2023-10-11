import pika
import json
import pandas as pd
import os
import glob



def check_invoice_total(file_name, supplier_name, given_total):
        # Open the Excel file and get the list of sheet names
        xls = pd.ExcelFile(file_name)
        sheet_names = xls.sheet_names
        
        # Select the last sheet by its name
        df = xls.parse(sheet_names[-1])

        print(df)
        
        # Find the index of the row where "La Cervecería." appears in the 'GTRULE' column
        starting_index = df[df['GTRULE'].str.contains("La Cervecería.", case=False, na=False)].index[0]
        
        # Filter the DataFrame from that index onward
        df = df[starting_index:]
        
        # Filter rows by the supplier name in the 'Unnamed: 1' column
        supplier_rows = df[df['Unnamed: 1'].str.contains(supplier_name, case=False, na=False)]
        
        # Extract the amounts related to the supplier from the 'Unnamed: 5' column
        amounts = supplier_rows['Unnamed: 5'].tolist()
        
        # Compute the total amount
        total_amount = sum(amounts)
        
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
  


# Definir cómo se manejarán los mensajes
        

def callback(ch, method, properties, body):
    try:
        msg = json.loads(body)
        print(msg)
 


        # Extracting necessary keys
        file_paths = msg.get('link', [])
        supplier_name = msg.get('name')
        given_total = float(msg.get('amount', 0))

        # Check if file_paths is empty or not a list
        if not file_paths or not isinstance(file_paths, list):
            print("El mensaje no contiene información válida (link faltante o no es una lista).")
            return

        # Iterate over each file path in the list
        for file_name in file_paths:
            # Process the information using the function
            result = check_invoice_total(file_name, supplier_name, given_total)

            # If result is None, continue with the next file
            if result is None:
                continue
            # If the total matches, break the loop and publish the result
            if result["matches_given_total"]:
                print(f"Matching amount found in file: {file_name}")
                print(result)

              
                break


            

    except Exception as e:
        print(f"Error al procesar el mensaje: {e}")

