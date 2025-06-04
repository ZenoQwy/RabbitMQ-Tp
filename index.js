const amqp = require('amqplib');
const handleMission = require('./missionHandler');

const RESP_QUEUE = process.env.RESP_QUEUE || 'responses';

async function start() {
    const conn = await amqp.connect('amqp://135.125.89.160');
    const ch = await conn.createChannel();

    await ch.assertExchange('amq.fanout', 'fanout');
    const q = await ch.assertQueue('Thomasss', { exclusive: true });
    await ch.bindQueue(q.queue, 'amq.fanout', '');
    await ch.assertQueue(RESP_QUEUE, { durable: true });

    console.log('Agent prêt, en attente de mission...');

    ch.consume(q.queue, msg => { 
        const raw = msg.content.toString();

        try {
            const mission = JSON.parse(raw);

            if ((mission.agent || '').toLowerCase() !== 'thomas') {
                console.log('Mission de', mission.agent, 'ignorée.');
                return;
            }

            console.log('Mission reçue :', raw);

            if (mission.value && !mission.payload) {
                mission.payload = mission.value;
                delete mission.value;
            }

            mission.agent = 'Thomas';
            const report = handleMission(mission);
            ch.sendToQueue(RESP_QUEUE, Buffer.from(report));


        } catch (err) {
            console.error('Erreur JSON :', err.message);
        }

        ch.ack(msg);
    });

}

start().catch(console.error);
