const amqp = require('amqplib/callback_api');
const uuid = require('uuid');

const user = 'conejos';
const password = 'conejos';
const host = 'localhost';

let channel;

console.log('Starting connection to AMQP server'); // Log inicial

// Inicializa el canal tan pronto como se cargue este módulo
amqp.connect(`amqp://${user}:${password}@${host}`, (error0, connection) => {
    if (error0) {
        console.error('Connection error:', error0);
        return;
    }
    
    console.log('Connected to AMQP server'); // Log de conexión exitosa
    
    console.log('Creando canal');  // Log antes de crear el canal
    connection.createChannel((error1, ch) => {
        if (error1) {
            console.error('Error en la creación del canal:', error1);
            return;
        }
        
        console.log('Canal creado');  // Log de canal creado
        channel = ch;
        
        console.log('Asegurando la cola queue.model.input');  // Log antes de asegurar la cola
        channel.assertQueue('queue.model.input', { durable: true });
    });
});

// ... el resto de tu código


const Sending_message = (message, correlationId, callback) => {
    if (!channel) {
        console.error('Channel not initialized');
        callback('Channel not initialized');
        return;
    }

    console.log('Función Sending_message llamada con mensaje:', message);

    const sendQueue = 'queue.model.input';
    const replyQueue = 'queue.model.output.' + correlationId;

    channel.assertQueue(replyQueue, { durable: true }, (err, q) => {
        if (err) {
            console.error('Error asegurando la cola:', err);
            callback(err);
            return;
        }

        console.log(`Asegurando la cola ${replyQueue}`);
        console.log(`Enviando mensaje a la cola: ${sendQueue}`);

        channel.sendToQueue(sendQueue, Buffer.from(message), {
            correlationId: correlationId,
            replyTo: replyQueue,
        });

        console.log(`Enviado: ${message}`);
        console.log(`Consumiendo mensajes de la cola: ${replyQueue}`);

        channel.consume(q.queue, (msg) => {
            if (msg === null) {
                console.log('Mensaje nulo recibido, ignorando.');
                return;
            }
            console.log('Mensaje recibido:', msg.content.toString());
            console.log('Correlation ID esperado:', correlationId);
            console.log('Correlation ID recibido:', msg.properties.correlationId);

            if (msg.properties.correlationId === correlationId) {
                console.log('Respuesta recibida en la cola:', msg.content.toString());
                callback(null, msg.content.toString());
            } else {
                console.log('Correlation ID no coincide, ignorando el mensaje');
            }
        }, { noAck: true });

        setTimeout(() => {
            console.log(`Eliminando la cola ${replyQueue} después de 30 minutos de inactividad`);
            channel.deleteQueue(replyQueue);
        }, 1800000);
    });
};

module.exports = Sending_message;
