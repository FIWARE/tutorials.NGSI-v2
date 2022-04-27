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
const MQTT_TOPIC_PROTOCOL = process.env.MQTT_TOPIC_PROTOCOL || 'ul';

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://mosquitto';
global.MQTT_CLIENT = mqtt.connect(MQTT_BROKER_URL);
const IOTA_NODE_URL = process.env.IOTA_NODE || 'https://api.thin-hornet-1.h.chrysalis-devnet.iota.cafe';
const IOTA_MESSAGE_INDEX = 'messages/indexation/' + (process.env.IOTA_MESSAGE_INDEX || 'fiware');
global.IOTA_CLIENT = new iotaClient.ClientBuilder().node(IOTA_NODE_URL).build();

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
            debug('Subscribing to MQTT Broker: ' + MQTT_BROKER_URL + ' ' + topic);
            MQTT_CLIENT.subscribe(topic);
            MQTT_CLIENT.subscribe(topic + '/#');
            if (process.env.MQTT_TOPIC_PROTOCOL !== '') {
                MQTT_CLIENT.subscribe('/' + MQTT_TOPIC_PROTOCOL + topic);
                MQTT_CLIENT.subscribe('/#' + MQTT_TOPIC_PROTOCOL + topic + '/#');
            }
        });
    });

    mqtt.connect(MQTT_BROKER_URL);

    MQTT_CLIENT.on('message', function (topic, message) {
        // message is a buffer. The IoT devices will be listening and
        // responding to commands going southbound.
        debug('MQTT message received on', topic.toString());
        Southbound.processMqttMessage(topic.toString(), message.toString());
    });
}

// catch 404 and forward to error handler
iot.use(function (req, res) {
    res.status(404).send(new createError.NotFound());
});

// If the IoT Devices are configured to use the IOTA tangle, then
// subscribe to the assoicated topics for each device.
if (DEVICE_TRANSPORT === 'IOTA') {
    // IOTA node(s) provides a Message Queuing Telemetry Transport (MQTT) layer, if enabled, which
    // provides information about events that is being triggered by the IOTA network.
    //
    // see https://wiki.iota.org/iota.rs/libraries/nodejs/examples#listening-to-mqtt
    IOTA_CLIENT.getInfo()
        .then(() => {
            debug('connected to IOTA Tangle: ' + IOTA_NODE_URL);
            debug("Subscribing to '" + IOTA_MESSAGE_INDEX + "/cmd'");
            IOTA_CLIENT.subscriber()
                .topic(IOTA_MESSAGE_INDEX + '/cmd')
                .subscribe((err, data) => {
                    if (err) {
                        return debug('IOTA Tangle Subscription Error', err);
                    }
                    return process.nextTick(() => {
                        readFromTangle(data);
                    });
                });
        })
        .catch((err) => {
            debug('IOTA Tangle Connection Error' + err);
        });
}

// Recursive function to ensure that a IOTA Tangle messageId is received.
// It will repeat on failure.
function getMessageId(payload) {
    let messageId = null;
    try {
        messageId = IOTA_CLIENT.getMessageId(payload);
    } catch (e) {
        messageId = getMessageId(payload);
    }
    return messageId;
}

// An IOTA message is the encapsulating data structure that is being actually broadcasted
// across the network. It is an atomic unit that is accepted/rejected as a whole.
//
// see https://wiki.iota.org/iota.rs/libraries/nodejs/examples#messages
function readFromTangle(data) {
    const messageId = getMessageId(data.payload);
    debug('IOTA Tangle message received: ', messageId);
    IOTA_CLIENT.getMessage()
        .data(messageId)
        .then((messageData) => {
            const payload = Buffer.from(messageData.message.payload.data, 'hex').toString('utf8');
            Southbound.processIOTAMessage(messageId, payload);
        })
        .catch((err) => {
            debug('Command error from Tangle: ', err);
        });
}

module.exports = iot;
