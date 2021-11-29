// Connect to an IoT Agent and use fallback values if necessary

/* global IOTA_CLIENT */
/* global MQTT_CLIENT */
/* global SOCKET_IO */

const IoTDevices = require('../devices');
const DEVICE_API_KEY = process.env.DUMMY_DEVICES_API_KEY || '1234';
const IOTA_CMD_EXE_TOPIC = (process.env.IOTA_MESSAGE_INDEX || 'fiware') + '/cmdexe';
const debug = require('debug')('tutorial:ultralight');
const async = require('async');
// A series of constants used by our set of devices
const OK = ' OK';
const NOT_OK = ' NOT OK';

const queue = async.queue((data, callback) => {
    debug('sending command response to ' + IOTA_CMD_EXE_TOPIC);
    IOTA_CLIENT.message()
        .index(IOTA_CMD_EXE_TOPIC)
        .data(data.responsePayload)
        .submit()
        .then((response) => {
            SOCKET_IO.emit('IOTA-tangle', '<b>' + response.messageId + '</b> ' + data.responsePayload);
            debug('command response sent to ' + IOTA_CMD_EXE_TOPIC);
            debug(response.messageId);
            setImmediate(() => {
                IoTDevices.actuateDevice(data.deviceId, data.command);
            });
            callback();
        })
        .catch((err) => {
            debug(err);
            callback(err);
        }, 8);
}, 1);

//
// Splits the deviceId from the command sent.
//
function getUltralightCommand(string) {
    const command = string.split('@');
    if (command.length === 1) {
        command.push('');
    }
    return command[1];
}

// This processor sends ultralight payload northbound to
// the southport of the IoT Agent and sends measures
// for the motion sensor, door and lamp.

// Ultralight 2.0 is a lightweight text based protocol aimed to constrained
// devices and communications
// where the bandwidth and device memory may be limited resources.
//
// A device can report new measures to the IoT Platform using an HTTP GET request to the /iot/d path with the following query parameters:
//
//  i (device ID): Device ID (unique for the API Key).
//  k (API Key): API Key for the service the device is registered on.
//  t (timestamp): Timestamp of the measure. Will override the automatic IoTAgent timestamp (optional).
//  d (Data): Ultralight 2.0 payload.
//
// At the moment the API key and timestamp are unused by the simulator.

class UltralightCommand {
    // The bell will respond to the "ring" command.
    // this will briefly set the bell to on.
    // The bell  is not a sensor - it will not report state northbound
    actuateBell(req, res) {
        const keyValuePairs = req.body.split('|') || [''];
        const command = getUltralightCommand(keyValuePairs[0]);
        const deviceId = 'bell' + req.params.id;
        const result = keyValuePairs[0] + '| ' + command;

        if (IoTDevices.notFound(deviceId)) {
            return res.status(404).send(result + NOT_OK);
        } else if (IoTDevices.isUnknownCommand('bell', command)) {
            return res.status(422).send(result + NOT_OK);
        }

        // Update device state
        IoTDevices.actuateDevice(deviceId, command);
        return res.status(200).send(result + OK);
    }

    // The door responds to "open", "close", "lock" and "unlock" commands
    // Each command alters the state of the door. When the door is unlocked
    // it can be opened and shut by external events.
    actuateDoor(req, res) {
        const keyValuePairs = req.body.split('|') || [''];
        const command = getUltralightCommand(keyValuePairs[0]);
        const deviceId = 'door' + req.params.id;
        const result = keyValuePairs[0] + '| ' + command;

        if (IoTDevices.notFound(deviceId)) {
            return res.status(404).send(result + NOT_OK);
        } else if (IoTDevices.isUnknownCommand('door', command)) {
            return res.status(422).send(result + NOT_OK);
        }

        // Update device state
        IoTDevices.actuateDevice(deviceId, command);
        return res.status(200).send(result + OK);
    }

    // The lamp can be "on" or "off" - it also registers luminosity.
    // It will slowly dim as time passes (provided no movement is detected)
    actuateLamp(req, res) {
        const keyValuePairs = req.body.split('|') || [''];
        const command = getUltralightCommand(keyValuePairs[0]);
        const deviceId = 'lamp' + req.params.id;
        const result = keyValuePairs[0] + '| ' + command;

        if (IoTDevices.notFound(deviceId)) {
            return res.status(404).send(result + NOT_OK);
        } else if (IoTDevices.isUnknownCommand('lamp', command)) {
            return res.status(422).send(result + NOT_OK);
        }

        // Update device state
        IoTDevices.actuateDevice(deviceId, command);
        return res.status(200).send(result + OK);
    }

    // The robot can be directed to move from A to B.
    // The box can also  be unlocked on command.
    actuateRobot(req, res) {
        const keyValuePairs = req.body.split('|') || [''];
        const command = getUltralightCommand(keyValuePairs[0]);
        const deviceId = 'robot' + req.params.id;
        const result = keyValuePairs[0] + '| ' + command;
        let param1;
        let param2;

        if (keyValuePairs.length > 1) {
            param1 = keyValuePairs[1];
        }
        if (keyValuePairs.length > 2) {
            param2 = keyValuePairs[2];
        }

        if (IoTDevices.notFound(deviceId)) {
            return res.status(404).send(result + NOT_OK);
        } else if (IoTDevices.isUnknownCommand('robot', command)) {
            return res.status(422).send(result + NOT_OK);
        }
        // Update device state
        const success = IoTDevices.addRobotGoal(deviceId, command, param1, param2);
        return res.status(200).send(result + (success ? OK : NOT_OK));
    }

    // cmd topics are consumed by the actuators (bell, lamp and door)
    processMqttMessage(topic, message) {
        const path = topic.split('/');
        if (path.pop() === 'cmd') {
            const keyValuePairs = message.split('|') || [''];
            const command = getUltralightCommand(keyValuePairs[0]);
            const deviceId = path.pop();
            const result = keyValuePairs[0] + '| ' + command;

            if (!IoTDevices.notFound(deviceId)) {
                const topic = '/' + DEVICE_API_KEY + '/' + deviceId + '/cmdexe';
                MQTT_CLIENT.publish(topic, result + OK);
                IoTDevices.actuateDevice(deviceId, command);
            }
        }
    }

    processIOTAMessage(apiKey, deviceId, message) {
        const keyValuePairs = message.split('|') || [''];
        const command = getUltralightCommand(keyValuePairs[0]);
        const result = keyValuePairs[0] + '| ' + command;

        if (!IoTDevices.notFound(deviceId)) {
            const responsePayload = 'i=' + deviceId + '&k=' + apiKey + '&d=' + result + OK;
            queue.push({ responsePayload, deviceId, command });
        }
    }
}

module.exports = UltralightCommand;
