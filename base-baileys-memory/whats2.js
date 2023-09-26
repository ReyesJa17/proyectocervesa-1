const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const uuid = require('uuid');
const Sending_message = require('./apii2.js');
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const translateText = require('./traduction.js');
const processMessage = require('./busqueda.js')
const fs = require('fs');
const path = require('path');
const { AsyncQueue } = require('./AsyncQueue');
const messageQueue = new AsyncQueue(); 

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const flowChatLoop = addKeyword(['hola'])
    .addAnswer(
        'WEY, NETA TIENES QUE CAMBIAR ESA ACTITUD',
        { capture: true },
        async (ctx, { fallBack, provider, flowDynamic }) => {
            if (!ctx.body.toLowerCase().includes('ofertas')) {
                messageQueue.add(async () => {
                    const jid = ctx.key.remoteJid;
                    const refProvider = await provider.getInstance();
                    await refProvider.presenceSubscribe(jid);
                    await delay(100);
                    await refProvider.sendPresenceUpdate('composing', jid);
                    const UserMessage = await translateText(ctx.body, "en");
                    const correlationId = uuid.v4();
                    Sending_message(UserMessage, jid, async (err, aiResponse) => {
                        if (err || !aiResponse) {
                            console.error('Error o respuesta inesperada de Sending_message:', err || aiResponse);
                            flowDynamic("No entendí, ¿podría repetir tu mensaje otra vez?");
                            return;
                        }
                        const aiMessageObj = aiResponse;
                        const aiResponse2 = aiMessageObj.ai_message ? aiMessageObj.ai_message : aiMessageObj;
                        const aiResponseTraduc = await translateText(aiResponse2, "es");
                        await fallBack(aiResponseTraduc);
                        if (aiResponse2.includes("correct?")) {
                            await processMessage(aiResponse2);
                        }
                    });
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
    });
    QRPortalWeb()
}

main().catch(console.error);
