const HeartbeatTimer = require('./index');
const baseUrl = 'https://www.your/api/baseUrl'; //that must be replaced with your own api url
const pulse = 60; // pulse interval in sec - skips a pulse if last pulse is less than 60 sec ago
const mytimer = new HeartbeatTimer(baseUrl, 60);

const host = 'upload';
const category = 'ABC';
const type = 'XYZ';
const name = '1234';

// mytimer.pulse will send a requst to https://www.your/api/baseUrl/pulse?host=upload&category=ABC&type=XYZ&name=1234
// that creates or updates an entry in the dynamoDB table - including the query parameters and a timestamp
// there are two ways of using that function 

//frist option
mytimer.pulse(host, category, type, name);
//second option
mytimer.pulse(host, category, type, name, function (err, res) {
      if (!err) {
        console.log(res);
      } else {
        console.log(err);
      }
    });