// // mqttPublisher.ts

// import * as mqtt from 'mqtt';

// const brokerUrl = 'f941ed4e113845d7bcf69c98945f25aa.s2.eu.hivemq.cloud'; // Replace with your MQTT broker URL
// const topic = 'hell'; // Replace with your desired topic

// export default function publishMessage(): void {
//     const client = mqtt.connect(brokerUrl);

//     client.on('connect', () => {
//         console.log('Connected to MQTT broker');

//         // Example message
//         const message = 'Hello, MQTT!';

//         // Publish the message to the specified topic
//         client.publish(topic, message, (err) => {
//             if (err) {
//                 console.error('Error publishing message:', err);
//             } else {
//                 console.log('Message published successfully');
//             }

//             // Close the MQTT connection
//             client.end();
//         });
//     });

//     client.on('error', (err) => {
//         console.error('MQTT connection error:', err);
//     });
// }
