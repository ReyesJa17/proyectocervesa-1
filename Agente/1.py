#---------------------------
                correlation_id = properties.correlation_id  # ID de correlación del mensaje entrante
                print("Correlation ID:", correlation_id)
                data = {
                    'correlation_id': correlation_id,
                    'info': info
                }   
                json_13 = json.dumps(data)
                print("a need zaza", json_13)
                pdf = "queue_from_app13." 
                channel.basic_publish(
                    exchange='',
                    routing_key=json_13,
                    body=info,
                    properties=pika.BasicProperties(correlation_id=correlation_id)
                )
                
                print("Mensaje enviado a app13!!!", pdf)
               

                a= channel.get_waiting_message_count()
                print(a)
------------------------------------------------------

def send_client_info_to_whats(info_json):
    """
    Envía información del cliente a una cola de RabbitMQ.
    """
    credentials = pika.PlainCredentials('guest', 'guest')
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', credentials=credentials))
    channel = connection.channel()