const fs = require('fs');
const path = require('path');

let dirPath = __dirname; // Directorio actual

fs.readdir(dirPath, function(err, archivos) {
    if (err) {
        console.error("No se pudo leer el directorio: ", err);
        process.exit(1);
    }

    let archivoXML = archivos.find(archivo => path.extname(archivo).toLowerCase() === ".xml");

    if (archivoXML) {
        console.log("Archivo encontrado: ", archivoXML.toString());
    } else {
        console.log("Factura no encontrada");
    }
});
