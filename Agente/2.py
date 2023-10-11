from busqueda import *
from pan4 import *

fecha = '06.05.2023'
find_comprobante_folder_for_date(fecha)

print('-------------------')

find_folder_for_date(fecha)


print('-------------------')


supplier_name = "ECOINMOBILITEK"
given_total = 2754.00

process_files(supplier_name, given_total)
