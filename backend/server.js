var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var multer = require('multer'),
  bodyParser = require('body-parser'),
  path = require('path');
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//const db = require('./config/connection');
var fs = require('fs');
var drug = require("./model/drug.js");
var user = require("./model/user.js");
var doc = require("./model/doc.js")
// Load configuration from .env file
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Load and initialize MesageBird SDK
//var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);

// Set up Appointment "Database"
var AppointmentDatabase = [];


app.use(cors());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}));

app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      })
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
})

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});

/* login api */
app.post("/login", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      user.find({ username: req.body.username }, (err, data) => {
        if (data.length > 0) {

          if (bcrypt.compareSync(data[0].password, req.body.password)) {
            checkUserAndGenerateToken(data[0], req, res);
          } else {

            res.status(400).json({
              errorMessage: 'Username or password is incorrect!',
              status: false
            });
          }

        } else {
          res.status(400).json({
            errorMessage: 'Username or password is incorrect!',
            status: false
          });
        }
      })
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

/* register api */
app.post("/register", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {

      user.find({ username: req.body.username }, (err, data) => {

        if (data.length == 0) {

          let User = new user({
            username: req.body.username,
            password: req.body.password
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
            } else {
              res.status(200).json({
                status: true,
                title: 'Registered Successfully.'
              });
            }
          });

        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.username} Already Exist!`,
            status: false
          });
        }

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.username, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true
      });
    }
  });
}

/* Api to add drug */
app.post("/add-drug", (req, res) => {
  try {
    if (req.body && req.body.drug_name && req.body.dosage && req.body.frequency && req.body.adherence) {

      let new_drug = new drug();
      new_drug.patient_name = req.body.patient_name;
      new_drug.drug_name = req.body.drug_name;
      new_drug.dosage = req.body.dosage;
      new_drug.frequency = req.body.frequency;
      new_drug.adherence = req.body.adherence;
      new_drug.reason = req.body.reason;
      new_drug.user_id = req.user.id;
      new_drug.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Drug Added successfully.'
          });
        }
      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to edit drug */
app.post("/update-drug", (req, res) => {
  try {
    if (req.body && req.body.patient_name && req.body.drug_name && req.body.dosage &&
      req.body.frequency) {

      drug.findById(req.body.id, (err, new_drug) => {

        if (req.body.patient_name) {
          new_drug.patient_name = req.body.patient_name;
        }
        if (req.body.drug_name) {
          new_drug.drug_name = req.body.drug_name;
        }
        if (req.body.dosage) {
          new_drug.dosage = req.body.dosage;
        }
        if (req.body.frequency) {
          new_drug.frequency = req.body.frequency;
        }
        if (req.body.adherence) {
          new_drug.adherence = req.body.adherence;
        }
        if (req.body.reason) {
          new_drug.reason = req.body.reason;
        }

        new_drug.save((err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              status: true,
              title: 'Drug successfully updated!'
            });
          }
        });

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to delete a drug */
app.post("/delete-drug", (req, res) => {
  try {
    if (req.body && req.body.id) {
      drug.findByIdAndUpdate(req.body.id, { is_delete: true }, { new: true }, (err, data) => {
        if (data.is_delete) {
          res.status(200).json({
            status: true,
            title: 'Product successfully deleted!'
          });
        } else {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

//run the appointment notification scheduler
//scheduler.start();



