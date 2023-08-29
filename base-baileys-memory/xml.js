const xml2js = require('xml2js');
const PDFDocument = require('pdfkit');

let xml = "<?xml version="1.0" encoding="utf-8"?><cfdi:Comprobante xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" Version="3.3" Serie="A" Folio="7060" Fecha="2023-01-11T11:40:26" Sello="Tffj8SVZdRbzH8QUGlpjjCygUxDFg+wQehYPwyQzYRkG/qmNCYSEukXGRCKT5IXxJ4UTZ7hk+jHWlWpc0bl+YFuhnwkK9da9ER881zTfWvoa8DJbwCG0Sl98+lXjFOMs6rYEOTPARGpWIwaK4rNo1P1xEkEXGV8CqpAT4E2Q79xhSFbVep5hYlTPYHgokTaYN1Q9AQ1E4wBwUf3Z0+nUVJjjoIGCzJvNctDTN5x2bI/Ep+3LomzEUu7TanpbeHdDNzlegLCabQmr5iRtSf3jvJC9FL1w03L20JaUMqjEmwh4VtlzL9/afKURVsJf+2QQuXm8DVyYxW6tvQFTLMfVYw==" FormaPago="03" NoCertificado="00001000000503359566" Certificado="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" CondicionesDePago="DIFERIDO" SubTotal="2939.34" Moneda="MXN" Total="2939.34" TipoDeComprobante="I" MetodoPago="PPD" LugarExpedicion="55063" xmlns:cfdi="http://www.sat.gob.mx/cfd/3"><cfdi:Emisor Rfc="TOAS901028HT0" Nombre="SERGIO ALAN TORRES ALVAREZ" RegimenFiscal="612" /><cfdi:Receptor Rfc="ODC090525BF4" Nombre="OPERADORA DURANGO 192 S.A. DE C.V." UsoCFDI="P01" /><cfdi:Conceptos><cfdi:Concepto ClaveUnidad="53" ClaveProdServ="50121539" NoIdentificacion="2.1" Cantidad="15.1" Unidad="KG" Descripcion="LOMO DE PESCADO FRESCO EMPACADO AL ALTO VACIO" ValorUnitario="189" Importe="2853.9" /><cfdi:Concepto ClaveUnidad="53" ClaveProdServ="50121539" NoIdentificacion="2.1" Cantidad="1.78" Unidad="KG" Descripcion="HUESO DE PESCADO FRESCO EMPACADO AL ALTO VACIO" ValorUnitario="48" Importe="85.44" /></cfdi:Conceptos><cfdi:Complemento><tfd:TimbreFiscalDigital Version="1.1" RfcProvCertif="STA0903206B9" UUID="4BC7DEE3-F2CB-4D3A-AF13-53BF0C8781E2" FechaTimbrado="2023-01-11T11:52:27" SelloCFD="Tffj8SVZdRbzH8QUGlpjjCygUxDFg+wQehYPwyQzYRkG/qmNCYSEukXGRCKT5IXxJ4UTZ7hk+jHWlWpc0bl+YFuhnwkK9da9ER881zTfWvoa8DJbwCG0Sl98+lXjFOMs6rYEOTPARGpWIwaK4rNo1P1xEkEXGV8CqpAT4E2Q79xhSFbVep5hYlTPYHgokTaYN1Q9AQ1E4wBwUf3Z0+nUVJjjoIGCzJvNctDTN5x2bI/Ep+3LomzEUu7TanpbeHdDNzlegLCabQmr5iRtSf3jvJC9FL1w03L20JaUMqjEmwh4VtlzL9/afKURVsJf+2QQuXm8DVyYxW6tvQFTLMfVYw==" NoCertificadoSAT="00001000000506204896" SelloSAT="ZoXEgjNCBcZV84HtpkIoiUBwue6HLGuW8vRpXZIeja9faR68JyFNFVi55Q/79DK3r/RiBjf8wTy080N9QQeHRuyhR8/hEtkpR++q6sfz4ktWwrGSCzwMVUYcBT2YT0iwCsty8EQTNiMVTdYWbd3jVSNUeAT9cxRIM9fO7T0npGoXNWqxTRIOcOSDWGj10oXYQiNhThJRmlSYyZTY0OeJilfWrStB8HGfihCqM2s+SIWEFBn9+FjD6yU7+KmdzPIu8qeDnydz9GAuyN4Ig2ssCiKMIkNqR3M+W0yrbNHFMfSGqeyDny5EXaGwtEMIeI+anWP+LafR9qVWW0b72tprzw==" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" /></cfdi:Complemento></cfdi:Comprobante> ;"

// Convertir el XML en objeto JavaScript
xml2js.parseString(xml, (err, result) => {
    if (err) {
        throw err;
    }

    // Crear el documento PDF
    const doc = new PDFDocument();

    // Pipe su contenido de PDF a un archivo
    doc.pipe(fs.createWriteStream('output.pdf'));

    // Agregar contenido al PDF
    doc
        .fontSize(25)
        .text('Factura CFDI', 50, 50);

    doc
        .fontSize(10)
        .text(`Fecha: ${result['cfdi:Comprobante']['$'].Fecha}`, 100, 100);

    // Finalizar el PDF
    doc.end();
});
