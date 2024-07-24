// Importar módulos necesarios
import http from 'http';
import fs from 'fs';
import setApiModule from 'facturacionelectronicapy-setapi'; // Importar el módulo de setApi

// Obtener la instancia del módulo
const setApi = setApiModule.default;

// Puerto donde el servidor escuchará
const PORT = 3005;

// Función para ajustar el XML para que solo contenga el encabezado en la primera línea
function adjustXmlHeader(xmlContent) {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const xmlLines = xmlContent.split('\n');
    if (xmlLines.length > 1) {
        xmlLines[0] = xmlHeader;
    } else {
        xmlLines.push(xmlHeader);
    }
    return xmlLines.join('\n');
}

// Función para ajustar un array de XMLs para que cada uno solo contenga el encabezado en la primera línea
function adjustXmlHeaders(xmlContents) {
    return xmlContents.map(xmlContent => adjustXmlHeader(xmlContent));
}

// Función para manejar las solicitudes HTTP
const requestHandler = (req, res) => {
    // Verificar que sea una solicitud POST con contenido JSON
    if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
        let body = '';

        // Recibir los datos del cuerpo de la solicitud
        req.on('data', chunk => {
            body += chunk.toString();
        });

        // Procesar los datos cuando se complete la recepción
        req.on('end', async () => {
            try {
                // Parsear el cuerpo JSON recibido
                const requestData = JSON.parse(body);

                // Guardar los campos en variables
                const id = requestData.id;
                const env = requestData.env;
                const cert_path = requestData.cert_path;
                const key = requestData.key;
                const xmlFilePaths = requestData.xmlSigned; // Esto es un array de rutas de archivos
                const cdc = requestData.cdc;
                const ruc = requestData.ruc;
                const numeroLote = requestData.numeroLote;

                if (!Array.isArray(xmlFilePaths) || xmlFilePaths.length === 0) {
                    throw new Error('El campo xmlSigned debe ser un array no vacío de rutas de archivos XML.');
                }

                // Leer el contenido del archivo XML
                const xmlSignedPromises = xmlFilePaths.map(filePath => {
                    return fs.promises.readFile(filePath, 'utf8');
                });

                // Leer todos los archivos XML en paralelo
                const xmlSignedArray = await Promise.all(xmlSignedPromises);

                // Ajustar el XML para que solo contenga el encabezado en la primera línea
                const adjustedXmlArray = adjustXmlHeaders(xmlSignedArray);

                // Mostrar los campos en la consola
                console.log('ID:', id);
                console.log('Environment:', env);
                console.log('Certificate Path:', cert_path);
                console.log('Key:', key);
                console.log('Adjusted XML Signed:', adjustedXmlArray);

                // Verificar las funciones disponibles en setApi
                console.log('Funciones disponibles en setApi:', Object.keys(setApi));

                // Ejecutar la función `recibeLote` con los datos extraídos
                if (typeof setApi.recibeLote === 'function') {
                    try {
                        const xml = await setApi.recibeLote(id, adjustedXmlArray, env, cert_path, key);
                        console.log("XML con QR:", JSON.stringify(xml, null, 2));

                        // Extraer detalles del XML
                        const response = xml['ns2:rRetEnviDe'];
                        if (response) {
                            const protDe = response['ns2:rProtDe'];
                            if (protDe) {
                                const fecProc = protDe['ns2:dFecProc'];
                                const estRes = protDe['ns2:dEstRes'];
                                const gResProc = protDe['ns2:gResProc'];

                                console.log("Fecha de Proceso:", fecProc);
                                console.log("Estado de Resultado:", estRes);

                                if (estRes === 'Rechazado') {
                                    console.log("Resultado del Proceso:", gResProc);
                                    if (gResProc) {
                                        console.log("Código de Respuesta:", gResProc['ns2:dCodRes']);
                                        console.log("Mensaje de Respuesta:", gResProc['ns2:dMsgRes']);
                                    }
                                } else {
                                    console.log("El documento fue procesado exitosamente.");
                                }
                            } else {
                                console.log("No se encontraron detalles del proceso.");
                            }
                        } else {
                            console.log("No se encontró la respuesta de la SET.");
                        }

                        // Responder con un mensaje de éxito
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Datos recibidos correctamente' }));
                    } catch (error) {
                        console.error("Error al procesar con setApi:", error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error al procesar con setApi' }));
                    }
                } else {
                    throw new Error('La función "recibeLote" no está disponible en el módulo setApi.');
                }
            } catch (error) {
                console.error('Error al procesar la solicitud:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al procesar la solicitud' }));
            }
        });
    } else {
        // Responder con un mensaje de error si la solicitud no es POST o no tiene JSON
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Solo se aceptan solicitudes POST con contenido JSON' }));
    }
};

// Crear el servidor HTTP
const server = http.createServer(requestHandler);

// Iniciar el servidor
server.listen(PORT, (err) => {
    if (err) {
        console.error('Error al iniciar el servidor:', err);
        return;
    }
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
