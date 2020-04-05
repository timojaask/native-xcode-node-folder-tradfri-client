var http = require("http");
const NodeTradfriClient = require("node-tradfri-client");
const { TradfriClient, Accessory, AccessoryTypes } = NodeTradfriClient;

var tradfri;
var counter = 0;
var versions_server = http.createServer((request, response) => {
  if (request.url === "/connect") {
    connect().then((connectionSuccessful) => {
      if (connectionSuccessful) {
        console.log("connect returned true");
        response.end("Connected successfully");
      } else {
        console.log("connect returned: " + connectionSuccessful);
        response.end("Error: failed to connect");
      }
    });
  } else if (request.url === "/disconnect") {
    const disconnectResponse = disconnect();
    response.end(disconnectResponse);
  } else if (request.url === "/counter") {
    counter = counter + 1;
    response.end("Counter: " + counter);
  } else {
    response.end("Unknown request");
  }
});
versions_server.listen(3000);

function disconnect() {
  if (!tradfri) {
    return "Already disconnected";
  }
  console.log("Disconnecting...");
  tradfri.destroy();
  tradfri = undefined;
  return "Disconnected";
}

function connect() {
  console.log("Discovering gateway... ");
  return NodeTradfriClient.discoverGateway()
    .then((gatewayInfo) => {
      console.log("Discover successful:");
      console.log(gatewayInfo);
      console.log("Instantiating TradfriClient... ");
      tradfri = new TradfriClient(gatewayInfo.name);
      console.log("Authenticating... ");
      const securityCode = "e8ocvLnYFlY2SqSl";
      return tradfri
        .authenticate(securityCode)
        .then((authenticationResult) => {
          console.log("Authentication successful:");
          console.log(authenticationResult);
          console.log("Connecting... ");
          const { identity, psk } = authenticationResult;
          return tradfri
            .connect(identity, psk)
            .then((connectResult) => {
              console.log("Connection successful");
              return true;
            })
            .catch((e) => {
              console.log("Aborting: Failed to connect: " + e);
              return false;
            });
        })
        .catch((e) => {
          console.log("Aborting: Failed to authenticate: " + e);
          return false;
        });
    })
    .catch((e) => {
      console.log("Aborting: Failed to get gateway info: " + e);
      return false;
    });
}
