# AWS Heartbeat (Client)

> Easy Heartbeat service based on AWS Lambda &amp; DynamoDB

For server see: https://github.com/parcelLab/aws-heartbeat-server


# What does this package do?

Sends a heartbeat to the aws-heartbeat-server, which you have to set up before.

# Usage

Install directly from Github using `npm i parcelLab/aws-heartbeat-client --save`.

```
const Heartbeat = require('aws-heartbeat-client');

const baseUrl = 'https://www.your/api/baseUrl';
const pulse = 60; // pulse interval in sec - heartbeat max once per pulse interval
const heartbeat = new HeartbeatTimer(baseUrl, pulse);

const host = 'upload';
const category = 'ABC';
const type = 'XYZ';
const name = '1234';
```

`heartbeat.pulse()` will send a requst to `https://www.your/api/baseUrl/pulse?host=upload&category=ABC&type=XYZ&name=1234`. Hence, you need to know your base url. The base URL is simply the URL you installed your [aws-heartbeat-server](https://github.com/parcelLab/aws-heartbeat-server) to.

That upserts (updates, or creates if it didn't exist before) an entry in DynamoDB with the query parameters and a timestamp. There are two ways of using that function:

```
// without callback (fire & forget)
heartbeat.pulse(host, category, type, name);

// with callback (to check success)
heartbeat.pulse(host, category, type, name, function (err, res) {
  if (err) console.error(err);
  else console.log('Heartbeat sent');
});
```
