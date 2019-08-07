const Docker = require("dockerode");
const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const chalk = require("chalk");
const ks = require('node-key-sender');
const {exec} = require('child_process');

//Get all the containers
function getContainers() {
  return new Promise((resolve, reject) => {
    docker.listContainers((err, containers) => {
      if (err) reject(err);
      this.myNetworkContainers = containers.filter(
        x => x.HostConfig.NetworkMode === "election-net"
      );
      console.log(
        chalk.red(
          `${this.myNetworkContainers.length} containers found.........`
        )
      );
      resolve(this.myNetworkContainers);
    });
  });
}

//Ensure they are running
async function loopThroughContainers() {
  try {
    this.allContainers = await getContainers();
  } catch (e) {
    return new Error(e);
  }
  exec(`echo ${this.allContainers} > containers.txt`, (err,stdout,stderr) => {
    if(err) throw err;
  })
}

loopThroughContainers();

// getContainers();

