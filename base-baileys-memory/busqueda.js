const findFolderForDate = require('./app13.js');
// Requiring the findFolderForDate function from the external module

async function processMessage1(message) {
  let nameRegex = /Name:\s*'([^']*)'/im;
  let dateRegex = /Date:\s*'([^']*)'/im;
  let uuidRegex = /UUID:\s*'([^']*)'/im;

  let nameMatch = message.match(nameRegex);
  let dateMatch = message.match(dateRegex);
  let uuidMatch = message.match(uuidRegex);

  let name = nameMatch ? nameMatch[1] : null;
  let date = dateMatch ? dateMatch[1] : null;
  let uuid = uuidMatch ? uuidMatch[1] : null;

  // Transform date from "mm/dd/yyyy" to "dd.mm.yyyy"
  if (date) {
    let dateParts = date.split("/");
    date = `${dateParts[1]}.${dateParts[0]}.${dateParts[2]}`;  // Adjusted for the date format "mm/dd/yyyy"
  }

  // Call the function with retry logic
  if (name && date && uuid) {
    let attempts = 3;
    while (attempts > 0) {
      try {
        const fileName2 = await findFolderForDate(date, name, uuid);
        console.log(fileName2);
        break;  // If the function call is successful, break the loop
      } catch (error) {
        console.error(`Error al buscar la carpeta por la fecha: ${error}`);
        attempts--;
        if (attempts > 0) {
          console.log("Intentando de nuevo en 2 segundos...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log("Se han agotado los intentos para buscar la carpeta");
        }
      }
    }
  } else {
    throw new Error("Could not parse the message correctly in processMessage1");
  }
}
async function processMessage2(message) {
  let nameRegex = /Name:\s*([^,]*),/im;
  let dateRegex = /Date:\s*([^,]*),/im;
  let uuidRegex = /UUID:\s*([^,]*)(,|\?)/im;

  let nameMatch = message.match(nameRegex);
  let dateMatch = message.match(dateRegex);
  let uuidMatch = message.match(uuidRegex);

  let name = nameMatch ? nameMatch[1].trim() : null;
  let date = dateMatch ? dateMatch[1].trim() : null;
  let uuid = uuidMatch ? uuidMatch[1].trim() : null;

  // Transform date from "dd/mm/yyyy" to "dd.mm.yyyy"
  if (date) {
    let dateParts = date.split("/");
    date = `${dateParts[0]}.${dateParts[1]}.${dateParts[2]}`;
  }

  // Call the function with retry logic
  if (name && date && uuid) {
    console.log(`Transformed date: ${date}`); // Printing the transformed date for debugging purposes
    let attempts = 3;
    while (attempts > 0) {
      try {
        const fileName2 = await findFolderForDate(date, name, uuid);
        console.log(fileName2);
        break;  // If the function call is successful, break the loop
      } catch (error) {
        console.error(`Error al buscar la carpeta por la fecha: ${error}`);
        attempts--;
        if (attempts > 0) {
          console.log("Intentando de nuevo en 2 segundos...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log("Se han agotado los intentos para buscar la carpeta");
        }
      }
    }
  } else {
    throw new Error("Could not parse the message correctly in processMessage2");
  }
}


async function processMessage(message) {
  // First, we try with the first processing method
  try {
    await processMessage1(message);
  } catch (error) {
    console.error(`Error with the first processing method: ${error}. Trying with the second method...`);
    // If the first method fails, we try with the second one
    try {
      await processMessage2(message);
    } catch (error) {
      console.error(`Error with the second processing method: ${error}.`);
    }
  }
}

module.exports = processMessage;