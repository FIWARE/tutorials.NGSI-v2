[![FIWARE IoT Agents](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/iot-agents.svg)](https://github.com/FIWARE/catalogue/blob/master/iot-agents/README.md)
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-5dc0cf.svg)](https://fiware-ges.github.io/orion/api/v2/stable/)
[![UltraLight 2.0](https://img.shields.io/badge/Payload-Ultralight-27ae60.svg)](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)

**Description:** This tutorial extends the connection of IoT devices connecting to FIWARE to use alternate transport.
The [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
IoT Agent created in the [previous tutorial](iot-agent.md) is reconfigured to communicate with a set of dummy IoT
devices which transfer secure messages over the [IOTA Tangle](https://www.iota.org/get-started/what-is-iota). An
additional gateway component is added to the architecture of the previous [MQTT tutorial](iot-agent.md) to allow for
secure indelible transactions across a distributed ledger network.

The tutorial is mainly concerned with the architecture of the custom components, but uses [cUrl](https://ec.haxx.se/)
commands where necessary, and is also available as
[Postman documentation](https://fiware.github.io/tutorials.IoT-over-IOTA/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/513743-68eeeb6f-30c7-4300-ae6d-a41813e13155?action=collection%2Ffork&collection-url=entityId%3D513743-68eeeb6f-30c7-4300-ae6d-a41813e13155%26entityType%3Dcollection%26workspaceId%3Db6e7fcf4-ff0c-47cb-ada4-e222ddeee5ac)

<hr class="iotagents"/>

# What is IOTA?

> “Hansel took his little sister by the hand, and followed the pebbles which shone like newly-coined silver pieces, and
> showed them the way.”
>
> ― Jacob Grimm, Grimm's Fairy Tales

The [IOTA Tangle](https://www.iota.org/get-started/what-is-iota) is a directed acyclic graph which can be used as a
distributed ledger. It is not a traditional blockchain, but works with the concept of a Tangle which contains the
current transaction history and links from parents to child transactions which provide a single source of truth in a
distributed network. Whenever information is persisted to the tangle it is replicated across all nodes so that any
client, anywhere around the world can send valid transactions to a Node.

IOTA positions itself as being an ideal distributed ledger for IoT due to its feeless nature and scalable distributed
structure. Obviously when architecting any smart system, the developer needs to compromise between various factors such
as price, speed, reliability, security and so on. The previous MQTT tutorial was fast, but contained no security
elements and was vulnerable to malicious attack. An IOTA-based IoT system will automatically include secure logging of
all events and therefore could be used to for charging customers on an event-by-event basis.

A hybrid system could also be envisaged where some frequent but low risk transactions could be made using a standard
MQTT transport (e.g. continuous tracking of the location an ARV), whereas infrequent but chargeable events could be made
using a secure system like IOTA (e.g. credit card payment for an entire trip)

The basic IOTA architecture includes the following basic components:

-   **Clients**: Users of an IOTA network (wallets, apps, etc.) that send transactions to nodes to attach to the Tangle.
-   **Nodes**: Connected devices responsible for ensuring the integrity of the Tangle. These devices form an IOTA
    network.
-   **Tangle**: An attached data structure (public ledger, main ledger), which is replicated on all nodes in an IOTA
    network.

For the purpose of this tutorial, all data from the dummy devices is being stored within the IOTA Tangle. Each device
reading will be placed in a transaction object and attached to the IOTA Tangle, once attached it cannot be changed and
is immutable. It obviously takes time for all nodes to agree that a transaction hs occurred, and therefore all
communication should be considered as asynchronous.

The IoT Agent for Ultralight currently offers three standard transport mechanisms - HTTP, MQTT and AMPQ. Whereas it
would be possible to create a new binding directly for IOTA, in this case, it makes more sense to re-use the existing
asynchronous MQTT binding and extend using a gateway solution where a separate microservice deals with the IOTA
messages. IoT Agents based on gateway solutions already exist for [OPC-UA](https://iotagent-opcua.readthedocs.io/) and
[LoRaWAN](https://fiware-lorawan.readthedocs.io/). In the case of the IoT Agent for OPC-UA for example, in its
[own Tutorial](https://iotagent-opcua.readthedocs.io/en/latest/opc_ua_agent_tutorial/index.html#step-by-step-tutorial),
device readings are passed to an OPC-UA server and the IoT Agent in turn subscribes to the OPC-UA server and transforms
messages into NGSI format. With the Gateway solution described in this tutorial effectively MQTT is now just being used
as a message bus, so we can provision our IoT devices as MQTT devices and intercept the relevant MQTT topics to
transform the data into IOTA Tangle transactions to talk to IOTA Tangle enabled devices. The payload of each message
continues to use the existing
[UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
syntax, and therefore we can continue to use the same FIWARE generic enabler to connect the devices. It is merely the
underlying **transport** which has been customized in this scenario.

<h4>Mosquitto MQTT Broker</h4>

[Mosquitto](https://mosquitto.org/) is a readily available, open source MQTT broker which will be used during this
tutorial. It is available licensed under EPL/EDL. More information can be found at `https://mosquitto.org/`

<h4>Device Monitor</h4>

For the purpose of this tutorial, a series of dummy IoT devices have been created, which will be attached to the context
broker. Details of the architecture and protocol used can be found in the
[IoT Sensors tutorial](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-v2) The state of each device can be
seen on the UltraLight device monitor web page found at: `http://localhost:3000/device/monitor`

![FIWARE Monitor](https://fiware.github.io//tutorials.IoT-over-IOTA/img/device-monitor.png)

## Architecture

This application builds on the components created in [previous tutorials](iot-agent.md). It will make use of two FIWARE
components - the [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) and the
[IoT Agent for UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/). Usage of the Orion Context Broker
is sufficient for an application to qualify as _“Powered by FIWARE”_. Both the Orion Context Broker and the IoT Agent
rely on open source [MongoDB](https://www.mongodb.com/) technology to keep persistence of the information they hold. We
will also be using the dummy IoT devices created in the [previous tutorial](iot-agent.md) Additionally we will add an
instance of the [Mosquitto](https://mosquitto.org/) MQTT broker which is open source and available under the EPL/EDL and
create a custom **MQTT-IOTA Gateway** to enable us to persist commands to the IOTA Tangle and to subscribe to topics to
receive measurements and command acknowledgements when they occur.

Therefore, the overall architecture will consist of the following elements:

-   The FIWARE [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) which will receive requests using
    [NGSI-v2](https://fiware.github.io/specifications/OpenAPI/ngsiv2)
-   The FIWARE [IoT Agent for UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) which will:
    -   receive southbound requests using [NGSI-v2](https://fiware.github.io/specifications/OpenAPI/ngsiv2) and convert
        them to
        [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
        MQTT topics for the MQTT Broker
    -   listen to the **MQTT Broker** on registered topics to send measurements northbound
-   The [Mosquitto](https://mosquitto.org/) **MQTT Broker** which acts as a central communication point, passing MQTT
    topics between the **IoT Agent** and IoT devices as necessary.
-   The underlying [MongoDB](https://www.mongodb.com/) database :
    -   Used by the **Orion Context Broker** to hold context data information such as data entities, subscriptions and
        registrations
    -   Used by the **IoT Agent** to hold device information such as device URLs and Keys
-   A webserver acting as set of [dummy IoT devices](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-v2) using
    the
    [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
    protocol running over the IOTA Tangle.
-   An MQTT-IOTA gateway which persists MQTT topic messages to the tangle and vice-vera.

Since all interactions between the elements are initiated by HTTP or MQTT requests over TCP, the entities can be
containerized and run from exposed ports.

![](https://fiware.github.io//tutorials.IoT-over-IOTA/img/architecture.png)

The necessary configuration information for wiring up the Mosquitto MQTT Broker, the IoT devices and the IoT Agent can
be seen in the services section of the associated `docker-compose.yml` file:

<h3>Mosquitto Configuration</h3>

```yaml
mosquitto:
    image: eclipse-mosquitto
    hostname: mosquitto
    container_name: mosquitto
    networks:
        - default
    expose:
        - '1883'
        - '9001'
    ports:
        - '1883:1883'
        - '9001:9001'
    volumes:
        - ./mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf
```

The `mosquitto` container is listening on two ports:

-   Port `1883` is exposed so we can post MQTT topics
-   Port `9001` is the standard port for HTTP/Websocket communications

The attached volume is a
[configuration file](https://github.com/FIWARE/tutorials.IoT-over-MQTT/blob/master/mosquitto/mosquitto.conf) used to
increase the debug level of the MQTT Message Broker.

<h3>Dummy IoT Devices Configuration</h3>

```yaml
tutorial:
    image: quay.io/fiware/tutorials.context-provider
    hostname: iot-sensors
    container_name: fiware-tutorial
    networks:
        - default
    expose:
        - '3000'
        - '3001'
    ports:
        - '3000:3000'
        - '3001:3001'
    environment:
        - 'DEBUG=tutorial:*'
        - 'WEB_APP_PORT=3000'
        - 'DUMMY_DEVICES_PORT=3001'
        - 'DUMMY_DEVICES_API_KEYS=1068318794,3020035,3314136,3089326'
        - 'DUMMY_DEVICES_TRANSPORT=IOTA'
        - 'IOTA_NODE=https://chrysalis-nodes.iota.cafe'
        - 'IOTA_MESSAGE_INDEX=fiware'
```

The `tutorial` container is listening on two ports:

-   Port `3000` is exposed, so we can see the web page displaying the Dummy IoT devices.
-   Port `3001` is exposed purely for tutorial access - so that cUrl or Postman can make UltraLight commands without
    being part of the same network.

The `tutorial` container is driven by environment variables as shown:

| Key                     | Value                               | Description                                                                                                                                |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| DEBUG                   | `tutorial:*`                        | Debug flag used for logging                                                                                                                |
| WEB_APP_PORT            | `3000`                              | Port used by web-app which displays the dummy device data                                                                                  |
| DUMMY_DEVICES_PORT      | `3001`                              | Port used by the dummy IoT devices to receive commands                                                                                     |
| DUMMY_DEVICES_API_KEYS  | `4jggokgpepnvsb2uv4s40d59ov`        | List of security key used for UltraLight interactions - used to ensure the integrity of interactions between the devices and the IoT Agent |
| DUMMY_DEVICES_TRANSPORT | `IOTA`                              | The transport protocol used by the dummy IoT devices                                                                                       |
| IOTA_NODE               | `https://chrysalis-nodes.iota.cafe` | Starting IOTA node for the Gateway to connect to                                                                                           |
| IOTA_MESSAGE_INDEX      | `fiware`                            | Message index used to persist the data devices                                                                                             |

The other `tutorial` container configuration values described in the YAML file are not used in this tutorial.

<h3>IoT Agent for UltraLight 2.0 Configuration</h3>

The [IoT Agent for UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) can be instantiated within a
Docker container. An official Docker image is available from [Docker Hub](https://hub.docker.com/r/fiware/iotagent-ul/)
tagged `fiware/iotagent-ul`. The necessary configuration can be seen below:

```yaml
iot-agent:
    image: quay.io/fiware/iotagent-ul:latest
    hostname: iot-agent
    container_name: fiware-iot-agent
    depends_on:
        - mongo-db
    networks:
        - default
    expose:
        - '4041'
    ports:
        - '4041:4041'
    environment:
        - IOTA_CB_HOST=orion
        - IOTA_CB_PORT=1026
        - IOTA_NORTH_PORT=4041
        - IOTA_REGISTRY_TYPE=mongodb
        - IOTA_LOG_LEVEL=DEBUG
        - IOTA_TIMESTAMP=true
        - IOTA_CB_NGSI_VERSION=v2
        - IOTA_AUTOCAST=true
        - IOTA_MONGO_HOST=mongo-db
        - IOTA_MONGO_PORT=27017
        - IOTA_MONGO_DB=iotagentul
        - IOTA_PROVIDER_URL=http://iot-agent:4041
        - IOTA_MQTT_HOST=mosquitto
        - IOTA_MQTT_PORT=1883
```

The `iot-agent` container relies on the presence of the Orion Context Broker and uses a MongoDB database to hold device
information such as device URLs and Keys. The container is listening on a single port:

-   Port `4041` is exposed purely for tutorial access - so that cUrl or Postman can make provisioning commands without
    being part of the same network.

The `iot-agent` container is driven by environment variables as shown:

| Key                  | Value                   | Description                                                                                                                                           |
| -------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| IOTA_CB_HOST         | `orion`                 | Hostname of the context broker to update context                                                                                                      |
| IOTA_CB_PORT         | `1026`                  | Port that context broker listens on to update context                                                                                                 |
| IOTA_NORTH_PORT      | `4041`                  | Port used for Configuring the IoT Agent and receiving context updates from the context broker                                                         |
| IOTA_REGISTRY_TYPE   | `mongodb`               | Whether to hold IoT device info in memory or in a database                                                                                            |
| IOTA_LOG_LEVEL       | `DEBUG`                 | The log level of the IoT Agent                                                                                                                        |
| IOTA_TIMESTAMP       | `true`                  | Whether to supply timestamp information with each measurement received from attached devices                                                          |
| IOTA_CB_NGSI_VERSION | `v2`                    | Whether to supply use NGSI v2 when sending updates for active attributes                                                                              |
| IOTA_AUTOCAST        | `true`                  | Ensure Ultralight number values are read as numbers not strings                                                                                       |
| IOTA_MONGO_HOST      | `context-db`            | The hostname of mongoDB - used for holding device information                                                                                         |
| IOTA_MONGO_PORT      | `27017`                 | The port mongoDB is listening on                                                                                                                      |
| IOTA_MONGO_DB        | `iotagentul`            | The name of the database used in mongoDB                                                                                                              |
| IOTA_PROVIDER_URL    | `http://iot-agent:4041` | URL passed to the Context Broker when commands are registered, used as a forwarding URL location when the Context Broker issues a command to a device |
| IOTA_MQTT_HOST       | `mosquitto`             | The hostname of the MQTT Broker                                                                                                                       |
| IOTA_MQTT_PORT       | `1883`                  | The port the MQTT Broker is listening on to receive topics                                                                                            |

As you can see, use of the MQTT transport is driven by only two environment variables `IOTA_MQTT_HOST` and
`IOTA_MQTT_PORT`

<h3>MQTT-IOTA Gateway Configuration</h3>

```yaml
iota-gateway:
    image: iota-gateway
    hostname: iota-gateway
    container_name: iota-gateway
    build:
        context: iota-gateway
        dockerfile: Dockerfile
    networks:
        - default
    environment:
        - 'DEBUG=gateway:*'
        - 'MQTT_BROKER_URL=mqtt://mosquitto'
        - 'IOTA_NODE=https://chrysalis-nodes.iota.cafe'
        - 'IOTA_MESSAGE_INDEX=fiware'
```

The `iota-gateway` container is a middleware connecting to the MQTT broker and reading and persisting transactions onto
IOTA Tangle. This middleware therefore needs to connect to both the MQTT broker and the IOTA Tangle and repeats some
parameters described above.

## Start Up

Before you start you should ensure that you have obtained or built the necessary Docker images locally. Please clone the
repository and create the necessary images by running the commands as shown:

```bash
git clone https://github.com/FIWARE/tutorials.IoT-over-IOTA.git
cd tutorials.IoT-over-IOTA
git checkout NGSI-v2

./services create
```

Thereafter, all services can be initialized from the command-line by running the
[services](https://github.com/FIWARE/tutorials.IoT-over-MQTT/blob/NGSI-v2/services) Bash script provided within the
repository:

```bash
./services start
```

> :information_source: **Note:** If you want to clean up and start over again you can do so with the following command:
>
> ```bash
> ./services stop
> ```

## Provisioning Devices

Provisioning devices is not the focus of this tutorial, and all the necessary device provisioning occurs automatically
when the tutorial is started. However, for completeness the provisioning requests are repeated here and described below.
It is not necessary to re-run these commands.

A series of service groups are created to associate classes of devices to an API Key, in the example below services have
been created for `type=Bell` and `type=Motion`. It should be noted that the `resource` attribute has been left blank and
the `transport` set to `MQTT` - this is the same as the in the previous MQTT tutorial, since the IoT Agent is merely
sending messsages to the MQTT broker and has no idea that a custom gateway component is also involved.

```bash
curl -X POST  \
  "http://localhost:4041/iot/services" \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
 "services": [
   {
     "apikey":      "1068318794",
     "cbroker":     "'"http://orion:1026"'",
     "entity_type": "Motion",
     "resource":    "",
     "protocol":    "PDI-IoTA-UltraLight",
     "transport":   "MQTT",
     "timezone":    "Europe/Berlin",
     "attributes": [
        {"object_id": "c", "name":"count", "type":"Integer"},
        {"object_id": "t", "name": "TimeInstant", "type":"DateTime"}
      ],
      "static_attributes": [
          {"name": "category", "type":"Text", "value": ["sensor"]},
          {"name": "controlledProperty", "type": "Text", "value": "motion"},
          {"name": "function", "type": "Text", "value":["sensing"]},
          {"name": "supportedProtocol", "type": "Text", "value": ["ul20"]},
          {"name": "supportedUnits", "type": "Text", "value": "C62"}
      ]
   },
   {
     "apikey":      "3020035",
     "cbroker":     "'"http://orion:1026"'",
     "entity_type": "Bell",
     "resource":    "",
     "protocol":    "PDI-IoTA-UltraLight",
     "transport":   "MQTT",
     "timezone":    "Europe/Berlin",
     "commands": [
        {
          "name": "ring",
          "type": "command"
        }
      ],
      "static_attributes": [
          {"name": "category", "type":"Text", "value": ["actuator"]},
          {"name": "controlledProperty", "type": "Text", "value": "noiseLevel"},
          {"name": "function", "type": "Text", "value":["onOff"]},
          {"name": "supportedProtocol", "type": "Text", "value": ["ul20"]}
      ]
   }
 ]
}'
```

Commands and measures defined when individual devices are provisioned. Once again the `transport` is set to MQTT.

```bash
curl -X POST \
  "http://localhost:4041/iot/devices" \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
 "devices": [
   {
     "device_id":   "motion001",
     "entity_name": "urn:ngsi-ld:Motion:001",
     "entity_type": "Motion",
     "transport":   "MQTT",
     "static_attributes": [
         {"name": "refStore", "type": "Relationship","value": "urn:ngsi-ld:Store:001"}
     ]
   },
   {
      "device_id": "bell001",
      "entity_name": "urn:ngsi-ld:Bell:001",
      "entity_type": "Bell",
      "transport":   "MQTT",
      "static_attributes": [
          {"name": "refStore", "type": "Relationship","value": "urn:ngsi-ld:Store:001"}
      ]
    }
  ]
}
'
```

<h4>Device Monitor</h4>

The device monitor can be found at: `http://localhost:3000/device/monitor` - open the web page to view the state of the
devices and view the persisted IOTA Tangle traffic.

### Display the IOTA-Gateway logs (1st Terminal)

Open a **new terminal**, and follow the `iota-gateway` Docker container as follows:

```bash
docker logs -f iota-gateway
```

The terminal will then be ready to display received messages.

#### 1st terminal - Gateway Result:

If the MQTT-IOTA Gateway is functioning correctly, the following messages should be displayed

```txt
2021-12-07T15:28:42.855Z gateway:app connected to IOTA Tangle: https://chrysalis-nodes.iota.cafe
2021-12-07T15:28:42.862Z gateway:app Subscribing to 'messages/indexation/fiware/attrs'
2021-12-07T15:28:42.872Z gateway:app Subscribing to 'messages/indexation/fiware/cmdexe'
```

The gateway needs to subscribe to the IOTA Tangle to receive measures and command acknowledgements.

### Display the Dummy Device logs (2nd Terminal)

A sensor sending northbound measurements will persist transactions to the IOTA Tangle to which will be passed on to any
subscriber than wants them. The sensor does not need to make a connection to the subscriber directly. Similarly, any
connected actuators will need to subscribe to an IOTA Tangle message topic to receive aby commands that are relevant to
them.

Open a **new terminal**, and run a `fiware-tutorial` Docker container to send a message as follows:

```bash
docker logs -f fiware-tutorial
```

The terminal will then be ready to display received messages.

#### 2nd terminal - Device Result:

If the Devices are functioning correctly, the message should be received in the other terminal:

```
2021-12-07T15:29:22.163Z tutorial:server Listening on port 3000
2021-12-07T15:29:22.166Z tutorial:server Listening on port 3001
2021-12-07T15:29:22.522Z tutorial:application MongoDB is connected.
2021-12-07T15:29:22.612Z tutorial:iot-device connected to IOTA Tangle: https://chrysalis-nodes.iota.cafe
2021-12-07T15:29:22.613Z tutorial:iot-device Subscribing to 'messages/indexation/fiware/cmd'
```

## Using the IOTA Tangle as a Transport

### Sending Commands

Since all the devices have been pre-provisioned, a bell can be rung using a standard NGSI-v2 PATCH request:

#### 1 Request:

```bash
curl -L -X PATCH 'http://localhost:1026/v2/entities/urn:ngsi-ld:Bell:001/attrs' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /' \
-H 'Content-Type: application/json' \
--data-raw '{
  "ring": {
      "type" : "command",
      "value" : ""
  }
}'
```

The NGSI request is transformed into an MQTT message (with an Ultralight payload) which is received by the MQTT-IOTA
Gateway - this message is then persisted to the IOTA Tangle as shown:

#### 1st terminal - Gateway Result:

```text
2021-12-07T15:50:54.848Z gateway:southbound Command received from MQTT bell001@ring|
2021-12-07T15:51:12.580Z gateway:southbound Command pushed to Tangle: i=bell001&k=1068318794&d=bell001@ring|  to fiware/cmd
2021-12-07T15:51:12.581Z gateway:southbound messageId: 40431e6e39ade9babe02ef342ee9267f69982fe42db8f5d3f32d57bb686120d5
```

The dummy device is also subscribing to IOTA Tangle messages, a message is received and the device is activated (in this
case the bell will ring). At this point an acknowledgement is placed onto the `fiware/cmdexe` topic:

#### 2nd terminal - Device Result:

```text
2021-12-07T15:51:12.583Z tutorial:iot-device IOTA Tangle message received:  40431e6e39ade9babe02ef342ee9267f69982fe42db8f5d3f32d57bb686120d5
2021-12-07T15:51:17.806Z tutorial:ultralight command response sent to fiware/cmdexe
2021-12-07T15:51:17.806Z tutorial:ultralight 960e8ac4a9e22e360f7e92c3a7b9ac3b71c59950fd2fba7f4be551f930342f94
2021-12-07T15:51:17.812Z tutorial:devices actuateDevice: bell001 ring
```

If you are viewing the device monitor page, you can also see the state of the bell change.

![](https://fiware.github.io//tutorials.IoT-over-IOTA/img/bell-ring.gif)

The Gateway receives the acknowledgement from the IOTA Tangle `fiware/cmdexe` topic and returns the result of the
request to the IoT Agent.

#### 1st terminal - Gateway Result:

```text
2021-12-07T15:51:18.022Z gateway:northbound Command response received from Tangle: i=bell001&k=1068318794&d=bell001@ring| ring OK
2021-12-07T15:51:18.027Z gateway:northbound Sent to MQTT topic /1068318794/bell001/cmdexe
2021-12-07T15:51:34.741Z gateway:northbound Command response received from Tangle: i=bell001&k=1068318794&d=bell001@ring| ring OK
```

The result of the command to ring the bell can be read by querying the entity within the Orion Context Broker.

#### 2 Request:

```bash
curl -L -X GET 'http://localhost:1026/v2/entities/urn:ngsi-ld:Bell:001?options=keyValues' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /'
```

#### Response:

```json
{
    "id": "urn:ngsi-ld:Bell:001",
    "type": "Bell",
    "TimeInstant": "2021-12-07T15:51:36.219Z",
    "category": ["actuator"],
    "controlledProperty": "noiseLevel",
    "function": ["onOff"],
    "refStore": "urn:ngsi-ld:Store:001",
    "ring_info": "OK",
    "ring_status": "OK",
    "supportedProtocol": ["ul20"],
    "ring": ""
}
```

The `TimeInstant` shows last the time any command associated with the entity has been invoked. The result of `ring`
command can be seen in the value of the `ring_info` attribute.

> **Note:** IOTA Transactions are not instantaneous, if the bell is queried before the transaction is complete, the
> response will leave the `ring_status` as `PENDING`
>
> ```
> {
>  "id": "urn:ngsi-ld:Bell:001",
>  "type": "Bell",
>  "TimeInstant": "2021-12-07T15:51:36.219Z",
>  "category": [ "actuator" ],
>  "controlledProperty": "noiseLevel",
>  "function": [ "onOff" ],
>  "refStore": "urn:ngsi-ld:Store:001",
>  "ring_info": "UNKNOWN",
>  "ring_status": "PENDING",
>  "supportedProtocol": [ "ul20" ],
>  "ring": ""
> }
> ```

Furthermore, all transactions can be found on the IOTA Tangle under
`https://explorer.iota.org/mainnet/message/<message_id>`, for example
`https://explorer.iota.org/mainnet/message/40431e6e39ade9babe02ef342ee9267f69982fe42db8f5d3f32d57bb686120d5` permanently
holds the following data:

![](https://fiware.github.io//tutorials.IoT-over-IOTA/img/mainnet.png)

Which indicates a request was sent to ring the bell.

### Sending Device Measures

A measure from a device can be simulated by selecting **Detect Motion** from the dropdown and clicking on send.

![](https://fiware.github.io//tutorials.IoT-over-IOTA/img/device-tangle.png)

The device persists the measure to the `fiware/attrs` topic on the IOTA Tangle Mainnet.

#### 2nd terminal - Device Result:

```text
2021-12-07T16:34:25.767Z tutorial:devices fireMotionSensor
2021-12-07T16:34:26.185Z tutorial:northbound sendIOTAMeasure: motion001
2021-12-07T16:34:26.479Z tutorial:ultralight measure sent to fiware/attrs
2021-12-07T16:34:26.479Z tutorial:ultralight da4df31054df529a3ade74befb84edabf7697ae8a3a9ee3481be08ee0aabb3e7
```

Once the transactions is settled, it is passed onto the subscribing Gateway component.

#### 1st terminal - Gateway Result:

```text
2021-12-07T16:35:25.679Z gateway:northbound Measure received from Tangle: i=motion001&k=1068318794&d=c|0|t|2021-12-07T16:34:44.891Z
2021-12-07T16:35:25.680Z gateway:northbound Sent to MQTT topic /1068318794/motion001/attrs
```

There may be a noticeable lag between reading the measure and it being received at the context broker. The payload of
the measure therefore contains a timestamp `t|2021-12-07T16:34:44.891Z` which is mapped to `TimeInstant` in the IoT
Agent to ensure that the correct metadata is associated with the measure in the context broker.

The state of the sensor can be read by querying the entity within the Orion Context Broker.

#### 3 Request:

```bash
curl -L -X GET 'http://localhost:1026/v2/entities/urn:ngsi-ld:Motion:001?options=keyValues' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /'
```

#### Response:

```json
{
    "id": "urn:ngsi-ld:Motion:001",
    "type": "Motion",
    "TimeInstant": "2021-12-07T16:34:44.891Z",
    "category": ["sensor"],
    "controlledProperty": "motion",
    "count": "0",
    "function": ["sensing"],
    "refStore": "urn:ngsi-ld:Store:001",
    "supportedProtocol": ["ul20"],
    "supportedUnits": "C62"
}
```

## MQTT-IOTA Gateway - Sample Code

The [MQTT-IOTA Gateway](https://github.com/FIWARE/tutorials.IoT-over-IOTA/tree/master/iota-gateway/app) is a simple
application written in Node.js. Its only function is passing data between the two transports. MQTT Client libraries
already exist so the application can be set up to listen to the normal MQTT topic for IoT Agent actuations.

```javascript
const mqtt = require('mqtt');
const MQTT_CLIENT = mqtt.connect('mqtt://mosquitto');
MQTT_CLIENT.on('connect', () => {
    MQTT_CLIENT.subscribe('/+/+/cmd');
});
MQTT_CLIENT.on('message', Southbound.command);
```

Similarly, there are equivalent [client libraries](https://wiki.iota.org/iota.rs/libraries/nodejs/getting_started)
available in multiple languages for persisting and listening to changes on the IOTA Tangle. The MQTT-IOTA Gateway needs
to listen on two topics - one for device measures and a second one for acknowledgements of commands:

```javascript
const iotaClient = require('@iota/client');
const IOTA_CLIENT = new iotaClient.ClientBuilder().node('https://chrysalis-nodes.iota.cafe').build();

IOTA_CLIENT.getInfo()
    .then(() => {
        IOTA_CLIENT.subscriber()
            .topic(IOTA_MESSAGE_INDEX + 'messages/indexation/fiware/attrs')
            .subscribe((err, data) => {
                const messageId = IOTA_CLIENT.getMessageId(data.payload);
                IOTA_CLIENT.getMessage()
                    .data(messageId)
                    .then((messageData) => {
                        Northbound.measure(messageData);
                    });
            });
        IOTA_CLIENT.subscriber()
            .topic(IOTA_MESSAGE_INDEX + 'messages/indexation/fiware/cmdexe')
            .subscribe((err, data) => {
                const messageId = IOTA_CLIENT.getMessageId(data.payload);
                IOTA_CLIENT.getMessage()
                    .data(messageId)
                    .then((messageData) => {
                        Northbound.commandResponse(messageData);
                    });
            });
    })
    .catch((err) => {
        debug(err);
    });
```

### MQTT-IOTA Gateway Southbound - Sample Code

For the southbound traffic, the API Key and device ID are extracted from the MQTT topic and moved into the IOTA payload.
The syntax of the IOTA payload (with `i`, `k` and `d` attributes) is based on the
[Ultralight HTTP syntax](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#http-binding). The
`message` is then persisted to the Tangle using an appropriate index:

```javascript
function command(topic = 'cmd', message) {
    const parts = topic.toString().split('/');
    const apiKey = parts[1];
    const deviceId = parts[2];
    const action = parts[3];
    forwardAsIOTATangle(apiKey, deviceId, message.toString(), action);
}

function forwardAsIOTATangle(apiKey, deviceId, state, topic) {
    const payload = 'i=' + deviceId + '&k=' + apiKey + '&d=' + state;
    IOTA_CLIENT.message()
        .index('fiware/' + topic)
        .data(payload)
        .submit()
        .then((message) => {
            debug('messageId: ' + message.messageId);
        });
}
```

### MQTT-IOTA Gateway Northbound - Sample Code

Northbound traffic is similar - the payload is received from the IOTA Tangle, unmarshalled to reveal the API Key and
device id, and the posted to an appropriate MQTT Topic.

```javascript
function unmarshall(payload) {
    const parts = payload.split('&');
    const obj = {};
    parts.forEach((elem) => {
        const keyValues = elem.split('=');
        obj[keyValues[0]] = keyValues[1];
    });
    return obj;
}

function measure(messageData) {
    const payload = Buffer.from(messageData.message.payload.data, 'hex').toString('utf8');
    const data = unmarshall(payload);
    forwardAsMQTT(data.k, data.i, data.d, 'attrs');
}

function forwardAsMQTT(apiKey, deviceId, state, topic) {
    const mqttTopic = '/' + apiKey + '/' + deviceId + '/' + topic;
    MQTT_CLIENT.publish(mqttTopic, state);
}
```

The [full code](https://github.com/FIWARE/tutorials.IoT-over-IOTA/tree/master/iota-gateway/app) of the MQTT-IOTA Gateway
includes additional error handling and asynchronous data handling to defer the execution of a function until the next
Event Loop iteration.

## IOTA Tangle Device - Sample Code

The code for a device to connect to the IOTA Tangle is repeated on the device. Actuators must listen to an agreed topic
in order to be informed of commands. `process.nextTick()` can be used to ensure commands are not missed and can be
processed when time permits.

```javascript
const iotaClient = require('@iota/client');
const IOTA_CLIENT = new iotaClient.ClientBuilder().node('https://chrysalis-nodes.iota.cafe').build();

IOTA_CLIENT.getInfo().then(() => {
    IOTA_CLIENT.subscriber()
        .topic('messages/indexation/cmd')
        .subscribe((err, data) => {
            return process.nextTick(() => {
                readFromTangle(data);
            });
        });
});

function readFromTangle(data) {
    const messageId = IOTA_CLIENT.getMessageId(payload);
    IOTA_CLIENT.getMessage()
        .data(messageId)
        .then((messageData) => {
            const payload = Buffer.from(messageData.message.payload.data, 'hex').toString('utf8');
            Southbound.processIOTAMessage(messageId, payload);
        });
}
```

### IOTA Tangle Device Command Acknowledgement

For real devices, the callback of a successful actuation should cause an acknowledgement to be sent. Acknowledgements
are queued and sent in order. If an error occurs the acknowledgement must be resent or the command will remain in a
`PENDING` state.

```javascript
function processIOTAMessage(apiKey, deviceId, message) {
    const keyValuePairs = message.split('|') || [''];
    const command = getUltralightCommand(keyValuePairs[0]);
    process.nextTick(() => {
        IoTDevices.actuateDevice(deviceId, command).then((response) => {
            queue.push({ responsePayload, deviceId, command });
        });
    });
}
```

```javascript
const async = require('async');
const queue = async.queue((data, callback) => {
    IOTA_CLIENT.message()
        .index('fiware/cmdexe')
        .data(data.responsePayload)
        .submit()
        .then((response) => {
            callback();
        })
        .catch((err) => {
            setTimeout(() => {
                queue.push(data);
            }, 1000);
            callback(err);
        }, 8);
});
```

### IOTA Tangle Device measure - Sample Code

Measures are dealt with in a similar manner. The payload is created in Ultralight syntax (including a timestamp) and
pushed to a queue. The queue sends the measure to the IOTA Tangle and reschedules any failures.

```javascript
function sendAsIOTA(deviceId, state) {
    const payload = 'i=' + deviceId + '&k=' + getAPIKey(deviceId) + '&d=' + state + '|t|' + new Date().toISOString();
    queue.push(payload);
}
```

```javascript
const async = require('async');

const queue = async.queue((payload, callback) => {
    IOTA_CLIENT.message()
        .index('fiware/attrs')
        .data(payload)
        .submit()
        .then((message) => {
            callback();
        })
        .catch((err) => {
            setTimeout(() => {
                // resending measure
                queue.push(payload);
            }, 1000);
            callback(err);
        }, 8);
});
```
