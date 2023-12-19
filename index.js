// init project
require('dotenv').config();
const express = require('express');
const app = express();

app.set('view engine', 'pug');

// handle file uploads
const multer  = require('multer')
const upload = multer({ dest: 'public/uploads/' })
const fs = require('fs');

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
// app.use(express.static('public'));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// whoami microservice
app.get('/api/whoami', (req, res) => {
    res.render("who", {
      ipaddress: req.ip,
      language: req.get("Accept-Language"),
      software: req.get("User-Agent"),
    })
  });

// timestamp microservice
app.get("/api/:date?", (req, res) => {
    try {
      const input_date = req.params.date;
      let date;
  
      if (input_date === undefined) {
        date = new Date();
      }
      else if (!isNaN(input_date)) {
        date = new Date(parseInt(input_date));
      }
      else if (!isNaN(new Date(input_date).valueOf())) {
        date = new Date(input_date);
      }
      else {
        res.json({ error: "Invalid Date" });
        return;
      }

      res.render('time', { 
        unix: date.valueOf(),
        utc: date.toUTCString(),
      });
  
    } catch (error) {
      console.log(error);
      res.json({ error: "Invalid Date" });
    }
  });

// file metadata microservice
app.get("/metadata", (req, res) => {
  res.sendFile(__dirname + '/pages/filemetadata.html');
});

app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  const fileInfo = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  };

  // remove file from uploads folder
  const uploadsFolder = __dirname + "/public/uploads/";
  fs.readdir(uploadsFolder, (err, files) => {
    if (err) {
      console.log("Error reading directory:", err);
    } else if (files.length) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Error deleting file:", err)
      })
    }
  });
  
  res.render("metadata", fileInfo);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});