const amqp = require("amqplib/callback_api");
const cron = require("node-cron");
const { spawn } = require("child_process");
const os = require("os");

//Run heartbeat check every 10 seconds
const sendContainerIdToOthers = () => {
  console.log(`My id is ${os.hostname()}`);
  amqp.connect("amqp://guest:guest@172.22.0.2", (error0, connection) => {
    if (error0) throw error0;
    connection.createChannel((error1, channel) => {
      if (error1) throw error1;
      const queue = "containerIds";
      const msg = `My id is ${os.hostname()}`;

      channel.assertExchange('logs','fanout', { durable: false });

      channel.publish('logs', '', Buffer.from(msg));

      channel.assertQueue('', {exclusive: true});

      channel.bindQueue('', 'logs', '');
    });
  });
};

const sendElectionRequest = () => {};

amqp.connect('amqp://guest:guest@172.22.0.2',(error0, connection) => {
    if(error0) throw error0;
    connection.createChannel((error1, channel) => {
        if(error1) throw error1;
        const exchange = 'logs';
        channel.assertExchange(exchange, 'fanout', {durable: false});

        channel.assertQueue('containerIds', {exclusive: true}, (error2, q) => {
            if(error2) throw error2;
            console.log(`Waiting for messages in ${q.queue}`);
            channel.bindQueue(q.queue,exchange,'');
            channel.consume(q.queue, (msg) => {
                if(msg.content) console.log(`received: ${msg.content.toString()}`);
            },{
                noAck: true
            });
        });
    });
});

cron.schedule('10 * * * * *', () => sendContainerIdToOthers());