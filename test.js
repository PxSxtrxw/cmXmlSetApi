const setApiModule = require('facturacionelectronicapy-setapi');
const setApi = setApiModule.default;

const env = 'test';
const cert_path = 'ruta al certificado.p12';
const key = 'contraseña del certificado.p12';

// Función para enviar documento de forma síncrona
async function enviarDocumento(id, xmlSigned) {
    try {
        const xml = await setApi.recibe(id, xmlSigned, env, cert_path, key);
        if (xml['ns2:rRetEnviDe'] && xml['ns2:rRetEnviDe']['ns2:rProtDe'] && xml['ns2:rRetEnviDe']['ns2:rProtDe']['ns2:dEstRes'] === 'Rechazado') {
            console.error("Error al enviar documento: Rechazado");
            console.error("Detalles:", JSON.stringify(xml, null, 2));
        } else {
            console.log("XML con QR:", JSON.stringify(xml, null, 2));
        }
    } catch (error) {
        console.error("Error al enviar documento:", error);
    }
}

// Función para enviar documento de forma asíncrona (por lotes)
async function enviarDocumentoLote(id, xmlSignedArray) {
    try {
        const xml = await setApi.recibeLote(id, xmlSignedArray, env, cert_path, key);
        if (xml['ns2:rRetEnviDe'] && xml['ns2:rRetEnviDe']['ns2:rProtDe'] && xml['ns2:rRetEnviDe']['ns2:rProtDe']['ns2:dEstRes'] === 'Rechazado') {
            console.error("Error al enviar documento por lotes: Rechazado");
            console.error("Detalles:", JSON.stringify(xml, null, 2));
        } else {
            console.log("XML con QR:", JSON.stringify(xml, null, 2));
        }
    } catch (error) {
        console.error("Error al enviar documento por lotes:", error);
    }
}

// Función para enviar evento a la SET
async function enviarEvento(id, xmlSigned) {
    try {
        const xml = await setApi.evento(id, xmlSigned, env, cert_path, key);
        if (xml['ns2:rRetEnviDe'] && xml['ns2:rRetEnviDe']['ns2:rProtDe'] && xml['ns2:rRetEnviDe']['ns2:rProtDe']['ns2:dEstRes'] === 'Rechazado') {
            console.error("Error al enviar evento: Rechazado");
            console.error("Detalles:", JSON.stringify(xml, null, 2));
        } else {
            console.log("XML con QR:", JSON.stringify(xml, null, 2));
        }
    } catch (error) {
        console.error("Error al enviar evento:", error);
    }
}

// Función para consultar documentos electrónicos desde la SET
async function consultarDocumento(id, cdc) {
    try {
        const xml = await setApi.consulta(id, cdc, env, cert_path, key);
        console.log("XML con QR:", JSON.stringify(xml, null, 2));
    } catch (error) {
        console.error("Error al consultar documento:", error);
    }
}

// Función para consultar RUC
async function consultarRuc(id, ruc) {
    try {
        const xml = await setApi.consultaRUC(id, ruc, env, cert_path, key);
        console.log("XML con QR:", JSON.stringify(xml, null, 2));
    } catch (error) {
        console.error("Error al consultar RUC:", error);
    }
}

// Función para consultar lote
async function consultarLote(id, numeroLote) {
    try {
        const xml = await setApi.consultaLote(id, numeroLote, env, cert_path, key);
        console.log("XML con QR:", JSON.stringify(xml, null, 2));
    } catch (error) {
        console.error("Error al consultar lote:", error);
    }
}

// Ejecución de las funciones con datos de ejemplo
const id = 'campo id';
const xmlSigned = 'ruta al archivo xml';
const xmlSignedArray = [xmlSigned];
const cdc = 'campo cdc';
const ruc = 'campo ruc';
const numeroLote = 'numero de lote';


//Ejemplo de uso de las funciones

//enviarDocumento(id, xmlSigned);
//enviarDocumentoLote(id, xmlSignedArray);
//enviarEvento(id, xmlSigned);
//consultarDocumento(id, cdc);
//consultarRuc(id, ruc);
//consultarLote(id, numeroLote);
