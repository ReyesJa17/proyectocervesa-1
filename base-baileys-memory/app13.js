const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
require('dotenv').config();

const privatekey = {
  client_email: process.env.CLIENT_EMAIL,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
};

const jwtClient = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ['https://www.googleapis.com/auth/drive'],
);

const data = fs.readFileSync('Proveedores.json', 'utf8');
const proveedorPrefixes = JSON.parse(data);

const findFolder = async (drive, query, parentId = null) => {
  const queryStr = parentId ? `${query} and '${parentId}' in parents` : query;
  const res = await drive.files.list({
    q: queryStr,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  return res.data.files;
};
//_____________________________________________________________
const findFolderForDate = async (fecha) => {
  // Inicializa la variable filePath para almacenar la ruta del archivo
  let filePath = 'Facturas/';

  try {
    await jwtClient.authorize();
    console.log('Successfully connected!');
  } catch (err) {
    console.error('Failed to connect:', err);
    return;
  }

  const drive = google.drive({ version: 'v3', auth: jwtClient });

  try {
    // Busca la carpeta de Facturas
    const facturasFolder = await findFolder(drive, `mimeType='application/vnd.google-apps.folder' and name='Facturas'`);
    if (facturasFolder.length === 0) {
      console.log('No se encontró la carpeta "Facturas".');
      return;
    }
    const facturasFolderId = facturasFolder[0].id;

    // Divide la fecha en día, mes y año
    const [day, monthNumber, year] = fecha.split('.');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = monthNames[parseInt(monthNumber) - 1];

    // Busca la carpeta del año
    const yearFolder = await findFolder(drive, `mimeType='application/vnd.google-apps.folder' and name='${year}'`, facturasFolderId);
    if (yearFolder.length === 0) {
      console.log(`No se encontró la carpeta del año ${year}.`);
      return;
    }
    const yearFolderId = yearFolder[0].id;
    filePath += year + '/';  // Actualiza la ruta del archivo

    // Busca la carpeta del mes
    const monthFolder = await findFolder(drive, `mimeType='application/vnd.google-apps.folder' and name='${month}'`, yearFolderId);
    if (monthFolder.length === 0) {
      console.log(`No se encontró la carpeta del mes ${month}.`);
      return;
    }
    const monthFolderId = monthFolder[0].id;
    filePath += month + '/';  // Actualiza la ruta del archivo

    // Obtiene todas las carpetas del día
    const allDayFolders = await findFolder(drive, `mimeType='application/vnd.google-apps.folder'`, monthFolderId);

    // Filtra y ordena las carpetas del día válidas
    const validDayFolders = allDayFolders.filter(folder => {
      const folderDate = folder.name;
      return new Date(folderDate.split('.').reverse().join('-')) <= new Date(fecha.split('.').reverse().join('-'));
    }).sort((a, b) => {
      const aDate = new Date(a.name.split('.').reverse().join('-'));
      const bDate = new Date(b.name.split('.').reverse().join('-'));
      return bDate - aDate;
    });

    // Selecciona la carpeta del día objetivo
    let targetFolder = validDayFolders[0];
    if (!targetFolder) {
      console.log('No se encontró una carpeta válida para la fecha proporcionada.');
      return;
    }

    filePath += targetFolder.name + '/';  // Actualiza la ruta del archivo
    console.log(`La carpeta seleccionada para la fecha ${fecha} es: ${targetFolder.name}`);

    // Busca archivos Excel en la carpeta del día
    const resExcelFiles = await drive.files.list({
      q: `'${targetFolder.id}' in parents and mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const excelFiles = resExcelFiles.data.files;
    if (excelFiles.length === 0) {
      console.log('No se encontraron archivos .xlsx en la carpeta seleccionada.');
      return;
    }

    const firstExcelFile = excelFiles[0];
    filePath += firstExcelFile.name;  // Actualiza la ruta del archivo
    console.log(`The path of the file is: ${filePath}`);

    // Crea permisos para el archivo Excel
    await drive.permissions.create({
      fileId: firstExcelFile.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Obtiene el enlace compartible del archivo
    const fileMetadata = await drive.files.get({
      fileId: firstExcelFile.id,
      fields: 'webViewLink',
    });

    const shareableLink = fileMetadata.data.webViewLink;
    console.log(`El enlace compartible del archivo es: ${shareableLink}`);
  } catch (err) {
    console.error('Error:', err);
  }
};

//checar que tan rapido es sino cambiar por path en lugar de link







//______________________________________________________________________________________________________________

// Función para encontrar la carpeta "Comprobantes" y navegar hasta el mes proporcionado
const findComprobanteFolderForDate = async (fecha, targetDate) => {
  // Inicializa la variable filePath para almacenar la ruta del archivo
  let filePath = 'Comprobantes/';
  try {
    await jwtClient.authorize();
    console.log('Successfully connected!');
  } catch (err) {
    console.error('Failed to connect:', err);
    return;
  }

  const drive = google.drive({version: 'v3', auth: jwtClient});

  try {
    // Buscar la carpeta "Comprobantes"
    const comprobantesFolder = await findFolder(drive, `mimeType='application/vnd.google-apps.folder' and name='Comprobantes'`);
    if (comprobantesFolder.length === 0) {
      console.log('No se encontró la carpeta "Comprobantes".');
      return;
    }
    const comprobantesFolderId = comprobantesFolder[0].id;

    // Descomponer la fecha
    const [day, monthNumber, year] = fecha.split('.');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = monthNames[parseInt(monthNumber) - 1];

    // Buscar la subcarpeta del año
    const yearFolder = await findFolder(drive, `mimeType='application/vnd.google-apps.folder' and name='${year}'`, comprobantesFolderId);
    if (yearFolder.length === 0) {
      console.log(`No se encontró la carpeta del año ${year}.`);
      return;
    }
    const yearFolderId = yearFolder[0].id;

    // Buscar la subcarpeta del mes
    const monthFolder = await findFolder(drive, `mimeType='application/vnd.google-apps.folder' and name='${month}'`, yearFolderId);
    
    
    if (monthFolder.length === 0) {
      console.log(`No se encontró la carpeta del mes ${month}.`);
      return;
    }
    const monthFolderId = monthFolder[0].id;
    filePath += month + '/';



    console.log(`Se encontró la carpeta del mes ${month} con ID: ${monthFolderId}`);

    // Listar todos los archivos PDF en la carpeta del mes
    const resPdfFiles = await drive.files.list({
      q: `'${monthFolderId}' in parents and mimeType='application/pdf'`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const pdfFiles = resPdfFiles.data.files;

    
  if (pdfFiles.length === 0) {
    console.log('No se encontraron archivos PDF en la carpeta seleccionada.');
    return;
  }

  // Extraer fechas de los nombres de los archivos y ordenarlas
  const pdfFileDates = pdfFiles.map(file => parseInt(file.name.split(' ')[0].replace(/\./g, ''))).sort((a, b) => a - b);

  // Quitar los puntos de la fecha objetivo y convertirla a un entero
  const targetDateNoDots = parseInt(fecha.replace(/\./g, ''));

  // Encontrar el archivo PDF con la fecha más cercana anterior o igual a la fecha proporcionada
  let closestDate = null;
  for (const date of pdfFileDates) {
    if (date <= targetDateNoDots) {
      closestDate = date;
    } else {
      break;
    }
  }

  if (closestDate === null) {
    console.log(`No se encontraron archivos PDF con una fecha anterior o igual a ${targetDateNoDots}.`);
    return;
  }

  // Filtrar el archivo PDF que coincide con la fecha más cercana
  const closestFile = pdfFiles.filter(file => file.name.startsWith(closestDate.toString()));

  // Imprimir el archivo PDF coincidente
  console.log('Archivo PDF más cercano:', closestFile.map(file => file.name));
  // Descargar los archivos PDF seleccionados
  for (const file of closestFile) {
    const fileId = file.id;
    const fileName = file.name;

    const destPath = `./downloaded_files/${fileName}`;
    const dest = fs.createWriteStream(destPath);

    await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    ).then(res => {
      return new Promise((resolve, reject) => {
        res.data
          .on('end', () => {
            console.log(`Archivo ${fileName} descargado.`);
            resolve();
          })
          .on('error', err => {
            console.error(`Error al descargar el archivo ${fileName}:`, err);
            reject(err);
          })
          .pipe(dest);
      });
    });
  }


  } catch (err) {
    console.error('Error:', err);
  }
};


//_________________________________________
const fecha = '29.05.2023';
const proveedor = 'karina zenon gonzalez';



// Llamar a la función
findComprobanteFolderForDate(fecha).catch(err => console.error(err));
findFolderForDate(fecha).catch(err => console.error(err));



module.exports = findFolderForDate;
