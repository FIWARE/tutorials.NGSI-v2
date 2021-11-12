const createError = require('http-errors');
const express = require('express');
const Southbound = require('./controllers/iot/southbound');
const debug = require('debug')('tutorial:iot-device');
const mqtt = require('mqtt');
const iotaClient = require('@iota/client');
const logger = require('morgan');

/* global MQTT_CLIENT */
/* global IOTA_CLIENT */
const DEVICE_TRANSPORT = process.env.DUMMY_DEVICES_TRANSPORT || 'HTTP';

// The motion sensor offers no commands, hence it does not need an endpoint.

// parse everything as a stream of text
function rawBody(req, res, next) {
    req.setEncoding('utf8');
    req.body = '';
    req.on('data', function (chunk) {
        req.body += chunk;
    });
    req.on('end', function () {
        next();
    });
}

const iot = express();
iot.use(logger('dev'));
iot.use(rawBody);

const mqttBrokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://mosquitto';
global.MQTT_CLIENT = mqtt.connect(mqttBrokerUrl);

// TODO --- Add IOTA --- //
const iotaNodeUrl = process.env.IOTA_NODE || 'https://api.thin-hornet-1.h.chrysalis-devnet.iota.cafe';

/// 'https://node.tanglebay.com'

/// 'https://api.thin-hornet-1.h.chrysalis-devnet.iota.cafe'

// 'https://api.lb-0.h.chrysalis-devnet.iota.cafe:443' // https://api.lb-0.testnet.chrysalis2.com:443';
global.IOTA_CLIENT = new iotaClient.ClientBuilder().node(iotaNodeUrl).build();

// If the Ultralight Dummy Devices are configured to use the HTTP transport, then
// listen to the command endpoints using HTTP
if (DEVICE_TRANSPORT === 'HTTP') {
    debug('Listening on HTTP endpoints: /iot/bell, /iot/door, iot/lamp');

    const iotRouter = express.Router();

    // The router listening on the IoT port is responding to commands going southbound only.
    // Therefore we need a route for each actuator
    iotRouter.post('/iot/bell:id', Southbound.bellHttpCommand);
    iotRouter.post('/iot/door:id', Southbound.doorHttpCommand);
    iotRouter.post('/iot/lamp:id', Southbound.lampHttpCommand);
    iotRouter.post('/iot/robot:id', Southbound.robotHttpCommand);
    // Dummy ISOBUS/ISOXML endpoint.
    iotRouter.post('/iot/isoxml', Southbound.isobusHttpCommand);

    iot.use('/', iotRouter);
}
// If the IoT Devices are configured to use the MQTT transport, then
// subscribe to the assoicated topics for each device.
if (DEVICE_TRANSPORT === 'MQTT') {
    const apiKeys = process.env.DUMMY_DEVICES_API_KEYS || process.env.DUMMY_DEVICES_API_KEY || '1234';

    MQTT_CLIENT.on('connect', () => {
        apiKeys.split(',').forEach((apiKey) => {
            const topic = '/' + apiKey + '/#';
            debug('Subscribing to MQTT Broker: ' + mqttBrokerUrl + ' ' + topic);
            MQTT_CLIENT.subscribe(topic);
            MQTT_CLIENT.subscribe(topic + '/#');
        });
    });

    mqtt.connect(mqttBrokerUrl);

    MQTT_CLIENT.on('message', function (topic, message) {
        // message is a buffer. The IoT devices will be listening and
        // responding to commands going southbound.
        Southbound.processMqttMessage(topic.toString(), message.toString());
    });
}

// catch 404 and forward to error handler
iot.use(function (req, res) {
    res.status(404).send(new createError.NotFound());
});

console.error('xxx');

// If the IoT Devices are configured to use the IOTA tangle, then
// subscribe to the assoicated topics for each device.
if (DEVICE_TRANSPORT === 'IOTA') {
    // eslint-disable-next-line no-unused-vars
    const apiKeys = process.env.DUMMY_DEVICES_API_KEYS || process.env.DUMMY_DEVICES_API_KEY || '1234';

    IOTA_CLIENT.getInfo()
        .then(() => {
            debug('connected to IOTA Tangle');
            /*const topics = [];
            apiKeys.split(',').forEach((apiKey) => {
                const topic = 'messages/indexation/fiware/' + apiKey;
                debug('Subscribing to IOTA Node: ' + iotaNodeUrl + ' ' + topic);
                topics.push(topic);
                topics.push(topic + '/attrs');
                topics.push(topic + '/cmd');
                topics.push(topic + '/cmdExe');
            });
            console.log(topics);*/

            debug("Subscribing to 'messages/indexation/fiware'");
            IOTA_CLIENT.subscriber()
                .topics(['messages/indexation/fiware'])
                .subscribe((err, data) => {
                    //console.log(data);

                    if (data) {
                        const messageId = IOTA_CLIENT.getMessageId(data.payload);

                        IOTA_CLIENT.getMessage()
                            .data(messageId)
                            // eslint-disable-next-line camelcase
                            .then((message_data) => {
                                // eslint-disable-next-line camelcase
                                const payload = Buffer.from(message_data.message.payload.data, 'hex').toString('utf8');
                                debug('message_data received from Tangle:', payload);
                            })
                            .catch((err) => {
                                debug(err);
                            });
                    }
                });
        })
        .catch((err) => {
            console.error('yyy');
            console.error(err);
        });
    // TODO --- Add IOTA --- //
}

module.exports = iot;
