/*jshint
  expr: true
*/

// dependencies
const request = require("request");
const _ = require('underscore');


///////////////
// Prototype //
///////////////
/**
 * @class
 * @param {string} baseUrl - the url of your aws api without the query parameters
 * @param {number} pulse  - seconds to wait for next api call 
 */
function HeartbeatTimer(baseUrl, pulse) {

  // validate
  if (_.isUndefined(baseUrl)) return console.error('Url of heartbeat service is missing');
  if (!_.isString(baseUrl)) return console.error('BaseUrl must be a string');
  if (_.isUndefined(pulse)) pulse = 0;
  if (!_.isNumber(pulse) || _.isNaN(pulse) || pulse < 0)
    return console.error('Pulse must be positive integer');
  // init
  this._lastPulse = 0;
  // set
  this._pulse = pulse;
  this._baseUrl = baseUrl;
}


/**
 * Send a pulse to the AWS heartbeat service
 * @name HeartbeatTimer#pulse
 * @param {string} host
 * @param {string} category
 * @param {string} type
 * @param {string} name
 * @param {HeartbeatTimer~callback}[callback] - optional
 */
HeartbeatTimer.prototype.pulse = function (host, category, type, name, callback) {
    if (Date.now() - this._lastPulse < this._pulse * 1000) {
      typeof callback === 'function' ? callback(null, 'Skipped pulse: Last pulse was send less than ' + this._pulse + ' seconds ago') : console.log('Skipped pulse: Last pulse was send less than ' + this._pulse + ' seconds ago');
      } else {
      if (_.isString(host) && _.isString(category) && _.isString(type) && _.isString(name)) {
          this._lastPulse = Date.now();
          var url = `${this._baseUrl}/pulse?host=${host}&category=${category}&type=${type}&name=${name}`;
          request(url, function (err, res, body) {
            if (!err) {
              typeof callback === 'function' ? callback(null, body) : console.log(body);

            } else {
              typeof callback === 'function' ? callback(err) : console.log(err);
            }
          });

        } else {
          typeof callback === 'function' ? callback('Missing parameter') : console.log('Missing parameter');
        }
      }
    };




    module.exports = HeartbeatTimer;