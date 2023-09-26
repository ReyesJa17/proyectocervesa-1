const amqp = require('amqplib/callback_api');

const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');
const translateText = require('./traduction.js');
const processMessage = require('./busqueda.js');
const fs = require('fs');
const path = require('path');
const { AsyncQueue } = require('./AsyncQueue');
const messageQueue = new AsyncQueue();
let dirPath = __dirname;

const user = 'guest';
const password = 'guest';
const host = 'localhost';

const Sending_message = require('./apii.js');

amqp.connect(`amqp://${user}:${password}@${host}`, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel((error, channel) => {
        if (error) {
            throw error;
        }
        const queue = 'queue.model.input';
        channel.assertQueue(queue, { durable:  true });


const flowChatLoop = addKeyword(['hola'])
    .addAnswer(
        '¡Hola! ¿En qué puedo ayudarte hoy?',
        { capture: true },
        async (ctx, { fallBack, provider,flowDynamic }) => {
           

            if (!ctx.body.toLowerCase().includes('ofertas')) {
                // Process the messages in an async queue
                messageQueue.add(async () => {
                    const jid = ctx.key.remoteJid;
                    const refProvider = await provider.getInstance();
                    await refProvider.presenceSubscribe(jid);
                    function delay(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                      }
                      
                    await delay(100);
                    await refProvider.sendPresenceUpdate('composing', jid);
                    const user = ctx.from;
                    const UserMessage = await translateText(ctx.body,"en");
                    channel.publish('', 'requestQueue', Buffer.from(UserMessage));



                    const aiResponse = await Sending_message(UserMessage);
                    if (!aiResponse || !aiResponse.ai_message) {
                        console.error('Unexpected response from Sending_message:', aiResponse);
                        // Send fallback message to the user
                        await flowDynamic("No entendí, ¿podría repetir tu mensaje otra vez? ");
                        return;
                    }
                    console.log(aiResponse);
                    const aiResponse2= aiResponse.ai_message;
                    console.log(aiResponse2);
                    const aiResponseTraduc = await translateText(aiResponse2,"es");
                    await fallBack(aiResponseTraduc);
                    // Check if the translated response contains "correct?"
                    if(aiResponse.ai_message.includes("correct?")) {
                        await processMessage(aiResponse2);
                        try {
                            const archivos = await fs.promises.readdir(dirPath);
                            let archivoXML = archivos.find(archivo => path.extname(archivo).toLowerCase() === ".xml");
                
                            if (archivoXML) {
                                await flowDynamic("factura encontrada: ");
                                await flowDynamic(archivoXML);
                                // Borramos el archivo
                                fs.unlink(path.join(dirPath, archivoXML), function(err){
                                    if(err) return console.log(err);
                                    console.log('Archivo eliminado exitosamente');
                                });

                            } else {
                                await flowDynamic("Factura no encontrada");
                            }
                        } catch (err) {
                            console.error("No se pudo leer el directorio: ", err);
                            process.exit(1);
                        }
                    }

                });
            }
        }
    );


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowChatLoop])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
});
});