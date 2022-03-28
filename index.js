/*jshint
  expr: true
*/

// dependencies
var _ = require('underscore');

const { GraphQLClient, gql } = require('graphql-request')
const graphQlUri = 'https://zelda.parcellab.com/graphql-next'
const graphQLClient = new GraphQLClient(graphQlUri, {
  headers: {
    Authorization: 'Token ' + "2ef0cbdc1402c844ca70092826a3186c16e504a1"
  }
})

///////////////
// Prototype //
///////////////
/**
 * @class
 * @param {string} baseUrl - the url of your aws api without the query parameters
 * @param {number} pulse  - seconds to wait for next api call 
 */
function Heartbeat(baseUrl, pulse = 60) {
  this._lastPulse = {};

  // Set pulse timer to 15 mins and ignore pulse and baseUrl from function call. These are only used for legacy compatibility and are otherwise unneeded
  this._pulse = 900;
  this._baseUrl = baseUrl;
}

/**
 * Send a pulse to the AWS heartbeat service
 * @name HeartbeatTimer#pulse
 * @param {string} host
 * @param {string} category
 * @param {string} type
 * @param {string} name
 * @param {string} threshold
 * @param {HeartbeatTimer~callback}[callback] - optional
 */
Heartbeat.prototype.pulse = function (host, category, type, name, threshold, callback) {

  if (typeof threshold === 'function') callback = threshold;


  var beatId = host + '-' + category + '-' + type + '-' + name;
  var lastPulse = _.has(this._lastPulse, beatId) ? this._lastPulse[beatId] : 0;
  var thresholdHrs = 25

  // set threshold to 0 for heartbeats, which are raised actively, instead of always pulsing
  if (category === "manfred") {
    thresholdHrs = 0
  }
  // only pulse in production mode
  if (process.env.PRODUCTION === undefined
    || !(/^(?:yes|true|1|on)$/i).test(process.env.PRODUCTION.toString())) {
    console.log('<aws-heartbeat-client> [NOTICE] supressing heartbeat pulse outside of production mode');
    if (typeof callback === 'function') callback(null, { result: 'aborted' });
    return false;
  }
  if (Date.now() - lastPulse < this._pulse * 1000) {
    if (typeof callback === 'function') callback(null, { result: 'skipped' });

  } else {

    this._lastPulse[beatId] = Date.now();
    const query = gql`
          mutation createHeartbeat($name: String!, $category: String!, $host: String!, $type: String!,$lastSuccessAt: DateTime!, $thresholdHrs: Int!, $status: AlertStatus!){
            updateCreateHeartbeat(input: { hostName: $host, category: $category, type: $type, name: $name ,lastSuccessAt: $lastSuccessAt, thresholdHrs: $thresholdHrs, status: $status}) {
          ... on LegacyHeartbeatType {
                id
                hostName
                category
                type
                name
                lastSuccessAt
                thresholdHrs
                status
              }
            }
          }
          `
    const variables = {
      name: name,
      category: category,
      host: host,
      type: type,
      lastSuccessAt: new Date(Date.now()),
      thresholdHrs: thresholdHrs,
      status: "CLOSED"
    }
    graphQLClient.request(query, variables)
      .then((data) => {
        (typeof callback === 'function') ? callback(null, { statusCode: 200, body: "Successful Heartbeat pulse" }) : console.log("Successful Heartbeat pulse")
      })
      .catch((err) => {
        (typeof callback === 'function') ? callback({ statusCode: err.statusCode, body: 'error' + `${err}` }) : console.log(`${err}`)
      })
  }
};

module.exports = Heartbeat;
