const amqp = require("amqplib/callback_api");
const cron = require("node-cron");
const os = require("os");

//Connect to the IP address of the rabbitmq container
const url = "amqp://guest:guest@172.22.0.2";

 
const sendContainerIdToOthers = () => {
  /**
   * method for sending containerId to other nodes
   * @param {null} 
   * @returns {null}
   * 
*/
  console.log(`My id is ${os.hostname()}`);
  amqp.connect(url, (error0, connection) => {
    if (error0) throw error0;
    connection.createChannel((error1, channel) => {
      if (error1) throw error1;
      const exchange = "logs";
      const msg = `My id is ${os.hostname()}`;

      channel.assertExchange(exchange, "fanout", { durable: false });

      channel.publish(exchange, "", Buffer.from(msg));
    });
  });
};


amqp.connect(url, (error0, connection) => {
  if (error0) throw error0;
  connection.createChannel((error1, channel) => {
    if (error1) throw error1;
    const exchange = "logs";
    channel.assertExchange(exchange, "fanout", { durable: false });

    channel.assertQueue("", { exclusive: true }, (error2, q) => {
      if (error2) throw error2;
      console.log(`Waiting for messages in ${q.queue}`);
      channel.bindQueue(q.queue, exchange, "");
      let resultSet = new Set();
      //Clear the set every 15 seconds
      setInterval(()=>{resultSet = new Set()}, 15000);
      channel.consume(
        q.queue,
        msg => {
          if (msg.content) {
            console.log(`received: ${msg.content.toString()}`);
            const id = msg.content
              .toString()
              .split("is")[1]
              .trim();
            resultSet.add(id);
            console.log("Container id's", resultSet);
            const findMaster = Array.from(resultSet).sort();
            console.log(`Our Master Node is ${findMaster[0]}`);
          }
        },
        {
          noAck: true
        }
      );
    });
  });
});

//Send message every 10 seconds
cron.schedule("10 * * * * *", () => sendContainerIdToOthers());
