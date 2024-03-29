/*jshint
  expr: true
*/

// dependencies
var request = require('request');
var _ = require('underscore');

///////////////
// Prototype //
///////////////
/**
 * @class
 * @param {string} baseUrl - the url of your aws api without the query parameters
 * @param {number} pulse  - seconds to wait for next api call 
 */
function Heartbeat(baseUrl, pulse = 60) {

  // validate
  if (_.isUndefined(baseUrl)) return console.error('Url of heartbeat service is missing');
  if (!_.isNumber(pulse) || _.isNaN(pulse) || pulse < 0) return console.error('Pulse must be positive integer');

  // init
  this._lastPulse = {};

  // set pulse to every 30 mins, way more than enough. Ignore function setting
  this._pulse = 1800;
  this._baseUrl = baseUrl;
}

/**
 * Send a pulse to Zelda through AWS Gateway redirection 
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

  // only pulse in production mode
  if (process.env.PRODUCTION === undefined
    || !(/^(?:yes|true|1|on)$/i).test(process.env.PRODUCTION.toString())) {
    console.log('<aws-heartbeat-client> [NOTICE] supressing heartbeat pulse outside of production mode');
    if (typeof callback === 'function') callback(null, { result: 'aborted' });
    return false;
  }

  var beatId = host + '-' + category + '-' + type + '-' + name;
  var lastPulse = _.has(this._lastPulse, beatId) ? this._lastPulse[beatId] : 0;

  if (Date.now() - lastPulse < this._pulse * 1000) {
    if (typeof callback === 'function') callback(null, { result: 'skipped' });

  } else {

    this._lastPulse[beatId] = Date.now();
    var slash = /\/$/.test(this._baseUrl) ? '' : '/';
    var url = this._baseUrl + slash + 'pulse?host=' + host + '&category=' + category + '&type=' + type + '&name=' + name;
    if (threshold && typeof threshold !== 'function') url += '&threshold=' + threshold;
    request(url, function (err, res, body) {
      if (err) (typeof callback === 'function') ? callback(err) : console.error(err);
      else if (res && res.statusCode >= 400) (typeof callback === 'function') ? callback(new Error(res.statusCode + ' ' + res.statusMessage)) : console.log(res.statusMessage);
      else (typeof callback === 'function') ? callback(null, body) : console.log(body);
    });

  }
};

module.exports = Heartbeat;
