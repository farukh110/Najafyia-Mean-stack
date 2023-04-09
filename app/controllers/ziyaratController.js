var Ziyarat = require("../models/ziyarat.js");
var ZaireenNotification = require("../models/ziyaratPerformedStatus.js");
var Logs = require("../models/logs");
var Users = require("../models/user.js");
var ObjectId = require("mongodb").ObjectID;
var emailTemplate = require("../../public/js/emailTemplates.js");
var emailTrans = require("../../public/js/emailTransporter.js");
var smsHelper = require('../utilities/smsHelper');
var logHelper = require('../utilities/logHelper');
var ziyaratService = require('../../app/services/ziyaratService');
const databaseHelper = require('../utilities/databaseHelper');
var constants = require('../constants');
const configuration = require("../../config/configuration.js");
let methodName = '';
var genericHelper = require("../../app/utilities/genericHelper");
var moment = require('moment');
var configSetting = require("../models/configSetting.js");

async function createZiarat(req, userId) {

// call fucntion of ziyarat here to get ziyaratObj 
let ziyaratDate;
let existingZiyarat = await ziyaratService.getThurdayZiyaratDate(userId);
if(existingZiyarat)
{
  ziyaratDate =  (moment(existingZiyarat.ziyaratDate).add(7, 'days')).toISOString().split('T')[0];
}
else
{
  ziyaratDate = new Date(genericHelper.CheckZiaratPerformedDate()).toISOString().split('T')[0];
}
  var ziyarat = new Ziyarat({
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    language: req.body.language,
    userId,
    date: req.body.date,
    country: req.body.country,
    isSelectedForZiyarat: false,
    isVisited: false,
    isActive: true,
    ziyaratDate: ziyaratDate
  });
  return ziyarat;
}
//add and update ziyarat
module.exports.saveZiyarat = async function (req, res) {
  methodName = 'saveZiyarat()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Saving Ziyarat Registration  `);

    let query = {
      email: req.body.email,
      isSelectedForZiyarat: false,
      isActive: true,
      isVisited: false
    };
    let doc = await databaseHelper.getSingleItem(Ziyarat, query);
    if (doc && doc._id) {
      res.status(200).json("Already Registered");
    }
    else {
      if (req.body._id) { 
        let ziyarat = await databaseHelper.getSingleItem(Ziyarat, { _id: req.body._id });
        if (ziyarat) {
          ziyarat.fullName = req.body.fullName || ziyarat.fullName;
          ziyarat.date = req.body.date || ziyarat.date;
          ziyarat.email = req.body.email || ziyarat.email;
          ziyarat.phone = req.body.phone || ziyarat.phone;
          ziyarat.language = req.body.language || ziyarat.language;
          ziyarat.userId = req.session._id;
          ziyarat.country = req.body.country || ziyarat.country;
          ziyarat.updated = Date.now();
          ziyarat.isSelectedForZiyarat = false;
          ziyarat.isVisited = req.body.isVisited || ziyarat.isVisited;
          ziyarat.ziyaratDate= new Date(genericHelper.CheckZiaratPerformedDate()).toISOString().split('T')[0] || ziyarat.ziyaratDate;
          let resp = await databaseHelper.updateItem(Ziyarat, { _id: req.body._id }, ziyarat);
          if (!resp) {
            res.status(500).send(resp);
          } else {
            res.json("Ziyarat updated Successfully!");
            let email = req.body.email || ziyarat.email;
            await sendRegistrationConfrimationEmail(email);
          }
        }
        else {
          return res.status(404).send({
            message: "Ziyarat not found!"
          });
        }

      }
      else {
        let userId = req.session._id;
        var ziyarat;
        if (!userId) {
          let usr = await databaseHelper.getSingleItem(Users, { email: req.body.email });
          userId = usr._id;
          if (usr) {
            ziyarat = await createZiarat(req, userId)
          }
        }
        else {
          ziyarat = await createZiarat(req, userId);
        }
        
        if(ziyarat && !ziyarat.phone && !ziyarat.email ){
          res.status(500).send('Email or phone not found ');
        }
        let resp = await databaseHelper.insertItem(Ziyarat, ziyarat);

        if (!resp) {
          res.status(500).send(error.message);
        }
        else {
          let email = req.body.email;
          await sendRegistrationConfrimationEmail(email, ziyarat);
          res.json(constants.Messages.ZiaratRegSuccess);

        }


      }

    }

  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    return res.status(500).send("Exception Occured");
  }


};




module.exports.saveZiyaratList = async function (req, res) {

  methodName = 'saveZiyaratList()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Saving Ziyarat consultantEmail  `);
    let zia = await databaseHelper.getSingleItem(Ziyarat, { consultantEmail: { $exists: true } });
    if (zia) {

      let updatefilter = { consultantEmail: { $exists: true } };
      let payload = { $set: { consultantEmail: req.body.consultantEmail } };

      const ziyarat = await databaseHelper.updateItem(Ziyarat, updatefilter, payload, true);
      if (ziyarat) {
        res.status(200).json("Consultant Email is saved");
      } else {
        res.status(200).json(ziyarat);
      }
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    return res.status(500).send("Exception Occured");
  }

  

};



// get ziyarat list
module.exports.getZiyaratList = async function (req, res) {
  methodName = 'getZiyaratList()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Getting Ziyarat List `);
    Ziyarat.find({}, function (err, ziyarat) {
      res.status(200).send(ziyarat);
    });
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }

};
// get all active ziyarat
module.exports.getActiveZiyaratList = async function (req, res) {
  methodName = 'getActiveZiyaratList()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Getting Active Ziyarat List `);
    let query = {
      isSelectedForZiyarat: false,
      isVisited: false,
      isActive: true
    };
    let zaireen = await databaseHelper.getManyItems(Ziyarat, query);
    if (zaireen) {
      res.status(200).send(zaireen);
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }


};
module.exports.getConsultantEmail = async function (req, res) {
  methodName = 'getConsultantEmail()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Getting Consultant Email `);

    let ziyaratConsultant = await databaseHelper.getSingleItem(Ziyarat, { consultantEmail: { $exists: true } });
    if (ziyaratConsultant) { res.status(200).send(ziyaratConsultant); }
    
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }

};
module.exports.getSelectedZiyaratList = async function (req, res) {
  methodName = 'getSelectedZiyaratList()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Getting List of zaireen selected for ziyarat `);
    let query = {
      isVisited: false,
      isActive: true,
    };
    if (!req.query.fromAdmin) {
      query.isSelectedForZiyarat = true;
      query.phone = {$exists:true};
      query.email = {$exists:true};
      let dayToday = (new Date()).getDay();
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var dayName = days[dayToday];
      if (dayName !== 'Thursday' && dayName !== 'Friday') {
        if (configuration.ziyarat.lockZaireenPage) {
          return res.status(200).send([]);
        }
      }
    }
    let zaireen = await databaseHelper.getManyItems(Ziyarat, query);
    if (zaireen) {
      res.status(200).send(zaireen);
    }
  }
  catch (ex) {
    console.log('catch',ex);
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }

};
function adminEmailZiyarah(zaireens) {
  let rows = [];
  zaireens.forEach(zayair => {
    rows.push(`<tr>
    <td>${zayair.fullName}</td>
    <td>${zayair.email}</td>
    <td>${zayair.phone}</td>
    <td>${zayair.country}</td>
    <td>${zayair.date}</td>
    <td>${zayair.emailSent}</td>
    <td>${zayair.emailResponse}</td>
    <td>${zayair.smsSent}</td>
    <td>${zayair.smsResponse}</td>
    </tr>`)
  });
  return `
  <html style='font-family: sans-serif;'>
    <body>
      <h2>List of Zaireen</h2>
      <table>
        <thead>
          <th>Full Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Country</th>
          <th>Date</th>
          <th>Email Sent</th>
          <th>Email Response</th>
          <th>Sms Sent</th>
          <th>Sms Response</th>

        </thead>
        <tbody>
          ${rows.toString().replace(/,/g, '')}
        </tbody>
      </table>
    </body>
  </html>
  `
}

async function sendRegistrationConfrimationEmail(email, ziyarat) {
  methodName = 'sendRegistrationConfrimationEmail()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Sending Ziyarat Registration Emails `);
    let userObj = await databaseHelper.getSingleItem(Users, { email: email });

    if (userObj) {
      let number = ziyarat.phone;
      if (userObj && userObj.language == "FRN") {
        if (email) {
          var html = emailTemplate
            .ziyarahConfirmFrn()
            .replace("[Name]", ziyarat.fullName).replace("[Date]",moment(ziyarat.ziyaratDate).locale(constants.Languages.French.locale).format('MMMM Do YYYY') ); 
          var options = {
            from: configuration.email.fromTextEng,
            to: email,
            subject: configuration.email.subjectPrefixEng_Frn + " | Ziyarah Inscription",
            html: html
          };
        }
      } else if (userObj && userObj.language == "ARB") {
        if (email) {
          var html = emailTemplate
            .ziyarahConfirmArb()
            .replace("[Name]", ziyarat.fullName).replace("[Date]",moment(ziyarat.ziyaratDate).locale(constants.Languages.Arabic.locale).format('dddd, MMMM Do YYYY') ); 
          var options = {
            from: configuration.email.fromTextEng,
            to: email,
            subject: "الزيارة",
            html: html
          };
        }
      } else {
        if (email) {
          var html = emailTemplate
            .ziyarahConfirmEng()
            .replace("[Name]", ziyarat.fullName).replace("[Date]",moment(ziyarat.ziyaratDate).locale(constants.Languages.English.locale).format('dddd, MMMM Do YYYY') ); 
           
          var options = {
            from: configuration.email.fromTextEng,
            to: email,
            subject: configuration.email.subjectPrefixEng_Frn + " | Ziyarah Registration",
            html: html
          };
        }
      }
      if (email) {

        
        try {


          const responseAd = await emailTrans.sendEmail(options);

          
          logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Senidng Registration confirmation email `);  
        }
        catch (exc) {
         
          logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, exc);



        }


      }
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);

  }

};

module.exports.sendEmailtoZaireen = function (req, res) {

  // not in use anymore , should we delete end point 

  methodName = 'sendEmailtoZaireen()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Sending Email to zaireen  `);
    res.send = ziyaratService.sendEmailtoZaireen();
  } catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }


};

module.exports.triggerZaireenNotificationStatus = function (req, res) {
  methodName = 'triggerZaireenNotificationStatus()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Enterting record for email job to be initiated  `);

    let respp = ziyaratService.InitiateZiyaratEmailProcess(req.body);
    return res.send(respp);
  } catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    return res.status(500).send("Exception Occured");
  }


};

module.exports.validateZaireenNotificationStatus = async function (req, res) {
  methodName = 'validateZaireenNotificationStatus()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: checking if user has already initated Process `);
    let resp = await ziyaratService.validateZaireenNotificationStatus(req.query.consultantId);
    return res.send(resp);
  } catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    return res.status(500).send("Exception Occured");
  }

};

module.exports.getZiyaratByUserId = async function (req, res) {
  methodName = 'getZiyaratByUserId()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: checking if Ziyarat already exist for user `);
    if (req.session._id) {

      let filter = {
        userId: req.session._id,
        isActive: true,
        isSelectedForZiyarat: false

      };
      var ziyarat = await databaseHelper.getManyItems(Ziyarat, filter);
      if (ziyarat && ziyarat.length) {
        res.send(true);
      } else {
        res.send(false);
      }
    } else {
      res.send(false);
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    return res.status(500).send("Exception Occured");
  }

};





module.exports.getZiyaratSetting = async function (req, res) {
  methodName = 'getZiyaratSetting()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Getting Ziyarat Settings `);
    let config = await ziyaratService.getZiyaratSetting(); 
    if (config) {
      res.status(200).send(config);
    }
    else{
      return res.status(200).send(null);
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }

};



module.exports.saveZiyaratSetting = async function (req, res) {

  
  methodName = 'saveZiyaratSetting()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Updating or Adding ZiyaratSettings Ziyarat Settings `);
    let setting = await ziyaratService.saveZiyaratSetting(req);
    if (setting) {
      res.status(200).send(setting);
    }
    else
    {
      res.status(500).send("Failed to Save");
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_CONTROLLER}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }

};