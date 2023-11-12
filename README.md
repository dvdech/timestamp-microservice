# Timestamp Microservice
making a request to /api/:date? witha  valid date will return a JSOn object with unix and utc key value pairs. 
ex. { unix: 1451001600000, utc: "Fri, 25 Dec 2015 00:00:00 GMT" }
proper date format is yyyy-mm-dd
ex. endpoint requests
[project url]/api/2015-12-25
[project url]/api/1451001600000