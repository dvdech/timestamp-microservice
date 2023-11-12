// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();
let mongoose = require('mongoose');

var logger = function(req, res, next) {

  console.log(req.method + " " + req.path + " - " + req.ip);
  next();

}

app.use("/", logger)

// connect to cluster_0 db db 'testdata'
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const timestampSchema = mongoose.Schema({ unix: { type: String }, utc: { type: String } }, { collection: 'timestamps' });

const errorSchema = mongoose.Schema({ errorMsg: { type: String }, trace: { type: String } }, { collection: 'errors' })

let Timestamp = mongoose.model('Timestamp', timestampSchema);
let Error = mongoose.model('Error', errorSchema)

const createAndSaveTimestamp = function(_unix, _utc) {

  const ts = new Timestamp({ unix: _unix, utc: _utc });

  ts.save();

}

const createAndSaveError = function(_errorMsg, _trace) {

  const er = new Error({ errorMsg: _errorMsg, trace: _trace });

  er.save();

}


// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
// var cors = require('cors');
// app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
// serve static dir /public so we can access style.css in index.html in /views
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// create get call for blank date request
app.get("/api/", function(req, res) {

  let unixDateNow = Date.now();
  unixDateNow = Number(unixDateNow)
  let utcDate = new Date(unixDateNow).toUTCString();
  return res.json({ 'unix': unixDateNow, 'utc': utcDate })
})

// your first API endpoint... 
app.get("/api/:date", function(req, res) {

  if (!req.params) {

    console.log("empty req.params")
    let unixDateNow = Date.now();
    unixDateNow = Number(unixDateNow)
    let utcDate = new Date(unixDateNow).toUTCString();
    return res.json({ 'unix': unixDateNow, 'utc': utcDate, "extra": "req.params - empty" })

  }

  // get date
  let date = req.params.date;
  var checkDate = new Date(date);

  // normal date
  if (checkDate != 'Invalid Date') {

    // get utc format for a Date object
    let utcDate = checkDate.toUTCString();

    // use getTime to get unix ts in mili
    let unixDate = Math.floor(checkDate.getTime())


    unixDate = Number(unixDate);

    createAndSaveTimestamp(unixDate, utcDate);
    return res.json({ 'unix': unixDate, 'utc': utcDate });

  } else {

    let onlyNums = /^\d+$/.test(date);

    if (onlyNums) {

      var dateLength = date.length;
      date = Number(date);

      if (dateLength == 10) {
        date = date * 1000;
      } else if (dateLength == 16) {
        date = date / 1000;
      }

      let nDate = new Date(date);
      var dateInUtc = nDate.toUTCString();

      // unix ts date
      if (nDate != 'Invalid Date') {

        createAndSaveTimestamp(date, dateInUtc);
        return res.json({ 'unix': date, 'utc': dateInUtc })

      } else {

        // error
        createAndSaveError("Invalid Date", req.method + " " + req.path + " - " + req.ip)
        return res.json({ 'error': 'Invalid Date' });
      }



    } else {

      // cant be valid date - error
      createAndSaveError("Invalid Date", req.method + " " + req.path + " - " + req.ip)
      return res.json({ 'error': 'Invalid Date' });
    }
  }
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


