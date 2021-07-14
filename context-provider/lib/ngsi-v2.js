////

/* eslint-disable no-unused-vars */

const request = require('request-promise');

// The basePath must be set - this is the location of the Orion
// context broker. It is best to do this with an environment
// variable (with a fallback if necessary)
const BASE_PATH = process.env.CONTEXT_BROKER || 'http://localhost:1026/v2';
const JSON_HEADER = 'application/json';

function setHeaders(accessToken, contentType) {
    const headers = {};
    if (accessToken) {
        // If the system has been secured and we have logged in,
        // add the access token to the request to the PEP Proxy
        headers['X-Auth-Token'] = accessToken;
    }
    headers['Content-Type'] = contentType || JSON_HEADER;
    return headers;
}

// This is a promise to make an HTTP POST request to the
// /v2/entities/<entity-id>/attrs end point
function createAttribute(entityId, body, headers = {}) {
    return request({
        url: BASE_PATH + '/entities/' + entityId + '/attrs',
        method: 'POST',
        body,
        headers,
        json: true
    });
}

// This is a promise to make an HTTP POST request to the
// /v2/entities/<entity-id>/attrs end point
function readAttribute(entityId, headers = {}) {
    /*	
  return request({
    url: BASE_PATH + '/entities/' + entityId + '/attrs',
    method: 'POST',
    body,
    headers,
    json: true,
  }); */
}

// This is a promise to make an HTTP PATCH request to the
// /v2/entities/<entity-id>/attr end point
function updateAttribute(entityId, body, headers = {}) {
    return request({
        url: BASE_PATH + '/entities/' + entityId + '/attrs',
        method: 'PATCH',
        body,
        headers,
        json: true
    });
}

// This is a promise to make an HTTP DELETE request to the
// /v2/entities/<entity-id>/attrs end point
function deleteAttribute(entityId, headers = {}) {
    delete headers['Content-Type'];
    return request({
        url: BASE_PATH + '/entities/' + entityId + '/attrs',
        method: 'DELETE',
        headers,
        json: true
    });
}

// This is a promise to make an HTTP POST request to the
// /ngsi-ld/v1/entities end point
function createEntity(entityId, type, body, headers = {}) {
    /*  return request({
    url: BASE_PATH + '/entities/' + entityId + '/attrs',
    method: 'POST',
    body,
    headers,
    json: true,
  });*/
}

// This is a promise to make an HTTP PATCH request to the
// /v2/entities/<entity-id>/attr end point
function updateEntity(entityId, body, headers = {}) {
    /* return request({
    url: BASE_PATH + '/entities/' + entityId + '/attrs',
    method: 'PATCH',
    body,
    headers,
    json: true,
  });*/
}

// This is a promise to make an HTTP DELETE request to the
// /v2/entities/<entity-id> end point
function deleteEntity(entityId, headers = {}) {
    delete headers['Content-Type'];
    return request({
        url: BASE_PATH + '/entities/' + entityId,
        method: 'DELETE',
        headers,
        json: true
    });
}

// This is a promise to make an HTTP GET request to the
// /v2/entities/<entity-id> end point
function readEntity(entityId, opts, headers = {}) {
    delete headers['Content-Type'];
    return request({
        qs: opts,
        url: BASE_PATH + '/entities/' + entityId,
        method: 'GET',
        headers,
        json: true
    });
}

// This is a promise to make an HTTP GET request to the
// /v2/entities/ end point
function listEntities(opts, headers = {}) {
    delete headers['Content-Type'];
    return request({
        qs: opts,
        url: BASE_PATH + '/entities',
        method: 'GET',
        headers,
        json: true
    });
}

module.exports = {
    createAttribute,
    readAttribute,
    updateAttribute,
    deleteAttribute,
    createEntity,
    readEntity,
    updateEntity,
    deleteEntity,
    listEntities,
    setHeaders
};
