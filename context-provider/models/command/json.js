// Connect to an IoT Agent and use fallback values if necessary

const IoTDevices = require('../devices');
const DEVICE_API_KEY = process.env.DUMMY_DEVICES_API_KEY || '1234';
const IOTA_CMD_EXE_TOPIC = (process.env.IOTA_MESSAGE_INDEX || 'fiware') + '/cmdexe';
const debug = require('debug')('tutorial:json');
const async = require('async');

// A series of constants used by our set of devices
const OK = 'OK';
const NOT_OK = 'NOT OK';

// Queue used for command acknowledgements in the form of IOTA messages.
// An IOTA message is the encapsulating data structure that is being actually broadcasted
// across the network. It is an atomic unit that is accepted/rejected as a whole.
// Queuing ensures that responses are not lost.
//
// see https://wiki.iota.org/iota.rs/libraries/nodejs/examples#messages
const queue = async.queue((data, callback) => {
    IOTA_CLIENT.message()
        .index(IOTA_CMD_EXE_TOPIC)
        .data(data.responsePayload)
        .submit()
        .then((response) => {
            SOCKET_IO.emit('IOTA-tangle', '<b>' + response.messageId + '</b> ' + data.responsePayload);
            debug('command response sent to ' + IOTA_CMD_EXE_TOPIC);
            debug(response.messageId);
            setImmediate(() => {
                // In a real device actuation would be completed before the command acknowledgement is sent.
                // The simulator switches this round to ensure the commandExe is received
                // before any status update is sent.
                IoTDevices.actuateDevice(data.deviceId, data.command);
            });
            callback();
        })
        .catch((err) => {
            debug(err);
            setTimeout(() => {
                debug('resending command response to ' + IOTA_CMD_EXE_TOPIC);
                queue.push(data);
            }, 1000);
            callback(err);
        }, 8);
});

/* global IOTA_CLIENT */
/* global MQTT_CLIENT */
/* global SOCKET_IO */

//
// Splits the deviceId from the command sent.
//
function getJSONCommand(string) {
    const obj = JSON.parse(string);
    return Object.keys(obj)[0];
}

function getResult(cmd, status) {
    const result = {};
    result[cmd] = status;
    return JSON.stringify(result);
}

// This processor sends JSON payload northbound to
// the southport of the IoT Agent and sends measures
// for the motion sensor, door and lamp.

// A device can report new measures to the IoT Platform using an HTTP GET request to the /iot/d path with the following query parameters:
//
//  i (device ID): Device ID (unique for the API Key).
//  k (API Key): API Key for the service the device is registered on.
//  t (timestamp): Timestamp of the measure. Will override the automatic IoTAgent timestamp (optional).
//  d (Data): JSON payload.
//
// At the moment the API key and timestamp are unused by the simulator.

class JSONCommand {
    // The HTTP bell will respond to the "ring" command.
    // this will briefly set the bell to on.
    // The bell  is not a sensor - it will not report state northbound
    actuateBell(req, res) {
        const command = getJSONCommand(req.body);
        const deviceId = 'bell' + req.params.id;

        if (IoTDevices.notFound(deviceId)) {
            return res.status(404).send(getResult(command, NOT_OK));
        } else if (IoTDevices.isUnknownCommand('bell', command)) {
            return res.status(422).send(getResult(command, NOT_OK));
        }

        // Update device state and respond to the HTTP command
        IoTDevices.actuateDevice(deviceId, command);
        return res.status(200).send(getResult(command, OK));
    }

    // The HTTP door responds to "open", "close", "lock" and "unlock" commands
    // Each command alters the state of the door. When the door is unlocked
    // it can be opened and shut by external events.
    actuateDoor(req, res) {
        const command = getJSONCommand(req.body);
        const deviceId = 'door' + req.params.id;

        if (IoTDevices.notFound(deviceId)) {
            return res.status(404).send(getResult(command, NOT_OK));
        } else if (IoTDevices.isUnknownCommand('door', command)) {
            return res.status(422).send(getResult(command, NOT_OK));
        }

        // Update device state and respond to the HTTP command
        IoTDevices.actuateDevice(deviceId, command);
        return res.status(200).send(getResult(command, OK));
    }

    // The HTTP lamp can be "on" or "off" - it also registers luminosity.
    // It will slowly dim as time passes (provided no movement is detected)
    actuateLamp(req, res) {
        const command = getJSONCommand(req.body);
        const deviceId = 'lamp' + req.params.id;

        if (IoTDevices.notFound(deviceId)) {
            return res.status(404).send(getResult(command, NOT_OK));
        } else if (IoTDevices.isUnknownCommand('lamp', command)) {
            return res.status(422).send(getResult(command, NOT_OK));
        }

        // Update device state  and respond to the HTTP command
        IoTDevices.actuateDevice(deviceId, command);
        return res.status(200).send(getResult(command, OK));
    }

    // The robot can be directed to move from A to B.
    // The box can also  be unlocked on command.
    actuateRobot(req, res) {
        const command = getJSONCommand(req.body);
        const deviceId = 'robot' + req.params.id;

        if (IoTDevices.notFound(deviceId)) {
            return res.status(404).send(getResult(command, NOT_OK));
        } else if (IoTDevices.isUnknownCommand('lamp', command)) {
            return res.status(422).send(getResult(command, NOT_OK));
        }
        // Update device state and respond to the HTTP command
        IoTDevices.actuateDevice(deviceId, command);
        return res.status(200).send(getResult(command, OK));
    }

    // For the MQTT transport, cmd topics are consumed by the actuators (bell, lamp and door)
    processMqttMessage(topic, message) {
        const path = topic.split('/');
        if (path.pop() === 'cmd') {
            const command = getJSONCommand(message);
            const deviceId = path.pop();

            if (!IoTDevices.notFound(deviceId)) {
                // Respond to the IOTA Tangle command with an acknowledgement. In a real device
                // this asynchronous response would be the callback after the actuation has completed
                const topic = '/' + DEVICE_API_KEY + '/' + deviceId + '/cmdexe';
                MQTT_CLIENT.publish(topic, getResult(command, OK));
                IoTDevices.actuateDevice(deviceId, command);
            }
        }
    }

    // For the IOTA Tangle transport, cmd topics are consumed by the actuators (bell, lamp and door)
    processIOTAMessage(apiKey, deviceId, message) {
        const command = getJSONCommand(message);

        if (!IoTDevices.notFound(deviceId)) {
            // Respond to the IOTA Tangle command with an acknowledgement. In a real device
            // this asynchronous response would be the callback after the actuation has completed
            const responsePayload = 'i=' + deviceId + '&k=' + apiKey + '&d=' + getResult(command, OK);
            process.nextTick(() => {
                debug('sending command response to ' + IOTA_CMD_EXE_TOPIC);
                queue.push({ responsePayload, deviceId, command });
            });
        }
    }
}

module.exports = JSONCommand;
