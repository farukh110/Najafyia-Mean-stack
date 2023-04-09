var Ziyarat = require("../models/ziyarat.js");
var ZaireenNotification = require("../models/ziyaratPerformedStatus.js");
var Logs = require("../models/logs");
var Users = require("../models/user.js");
var ObjectId = require("mongodb").ObjectID;
var emailTemplate = require("../../public/js/emailTemplates.js");
var emailTrans = require("../../public/js/emailTransporter.js");
var smsHelper = require('../utilities/smsHelper');
var logHelper = require('../utilities/logHelper');

const databaseHelper = require('../utilities/databaseHelper');
const { anySeries } = require("async");
var genericHelper = require("../utilities/genericHelper");
var configuration = require('../../config/configuration');
var configSetting = require("../models/configSetting.js");
var count = 0;

var moment = require('moment');
var constants = require('../constants');
let methodName = '';



module.exports.validateZaireenNotificationStatus = async function (consultantId) {
  methodName = 'validateZaireenNotificationStatus()';
  try {

    let responseData = {
      isValid: false,
      data: {}
    };
    let validateUser = false;
    if (consultantId != ('' || undefined)) {
      //var consulid = consultantId;
      let query = {
        key: configuration.ziyarat.ziyaratSettingKey
      };
      const config = await databaseHelper.getSingleItem(configSetting, query);
      var consultants =config.value.consultants;//  get consultants here 
      if (consultants.some(con => con.queryString === consultantId)
        || configuration.ziyarat.botUser.queryString == consultantId) {
        validateUser = true;
      }


    }
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Checking if user has already initiated process `);

    if (validateUser) {
      /** Date code to be Refactored or make a generic method */
      var resDate = await this.getThurdayZiyaratDate();
      /** Date code to be Refactored or make a generic method */
      let filter = {
        ziaratDate: resDate.ziyaratDate // get thursday date 
      };
      if (consultantId != ('' || undefined)) {
        if (consultantId != configuration.ziyarat.botUser.queryString) {
          filter.consultantId = consultantId;
        }
        else {
          filter.status = configuration.ziyarat.ziyaratQueStatuses.notStarted;
        }

      }
      const ziyarate = await databaseHelper.getSingleItem(ZaireenNotification, filter);
      if (ziyarate) {

        responseData.isValid = true;
        responseData.data = ziyarate;
        return responseData;

      } else {
       
        responseData.isValid = true;
        responseData.data = {};
        return responseData;
      }
    }
    else {
      responseData.isValid = false;
      responseData.data = {};
      return responseData;

      
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
  }
};
module.exports.startEmailandSmsProcess = async function () {

  methodName = 'startEmailandSmsProcess()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Starting the process to update job status and send out email and sms to zaireen `);


    var model = ZaireenNotification;
    let uId = configuration.ziyarat.botUser.queryString;
    var response = await this.validateZaireenNotificationStatus(uId);
    if (response != 'User could not be validated' && response) {
      model = response.data;
      count = model.totalZaireen;
      let filter = {
        _id: model._id
      };
      const zaireen1 = await databaseHelper.updateItem(ZaireenNotification, filter, { status:configuration.ziyarat.ziyaratQueStatuses.inProgress });
      if (zaireen1) {
        var responseEmailComplete = await this.sendEmailtoZaireen();
        
        if (responseEmailComplete == "Email and SMS has been sent successfully!") {
          const UpdateZaireen = await databaseHelper.updateItem(ZaireenNotification, filter, { status: configuration.ziyarat.ziyaratQueStatuses.processCompleted });
          if (UpdateZaireen) {
            return 'request processed succesfully';
          }
        } else {
          return 'request Prcossed with error';
        }
      }
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
  }

};

module.exports.sendEmailtoZaireen = async function () {

  methodName = 'sendEmailtoZaireen()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Getting Zaireen and sending email to admin on completion `);

    

    let filter = {
      isSelectedForZiyarat: true,
      isVisited: false,
      isActive: true
    };
    var zaireen = await databaseHelper.getManyItems(Ziyarat, filter,{},{ ziyaratDate : -1  }); // need to add sorting here 




    
    try {
      if (zaireen && zaireen.length) {
        var i = 0;

        for (j = 0; j < zaireen.length; j++) {
          zaireen[j] = await sendNotificationToZair(zaireen[j]);
        }
        let query = {
          key: configuration.ziyarat.ziyaratSettingKey
        };
        const config = await databaseHelper.getSingleItem(configSetting, query);
        var Emails = config.value.adminEmails;     
        let email = Emails;
        var html = adminEmailZiyarah(zaireen);
        var optionsss = {
          from: configuration.email.fromTextEng,
          to: email,
          subject: "Ziyarah Email sent to all zaireen (Total Count : " + count + ")",
          html: html
        };
        var responseEmailAdmin = '';
        try {
          const responseAd = await emailTrans.sendEmail(optionsss);
          responseEmailAdmin = responseAd;
          logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Email sent to ${email}`, responseEmailAdmin); 
         

          
        }
        catch (exc) {
          logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Request error`, exc);
          responseEmailAdmin = exc;
          
        }
        if (responseEmailAdmin.response == '250 Great success') {
          logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Email sent to ${email}`, responseEmailAdmin.response);
        }
        else {
          logHelper.logError(`Ziyarat Service Backend: Sending email to admin : Request error`, responseEmailAdmin.response);
        }

       
        return "Email and SMS has been sent successfully!";
      } else {
        
        return "Failed to send Email";
        

      }
    } catch (e) {
      
      logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error after getting zaireen list `, e);
      return "Failed to send Email";
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
  }

};

async function sendNotificationToZair(zair) {
  methodName = 'sendNotificationToZair()';
  try {

    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Notifying each Zayir with SMS and Email `);
    if (zair.userId) {
      let filter1 = { _id: ObjectId(zair.userId) };
      var user = await databaseHelper.getManyItems(Users, filter1);
      let sms = false, email = false, smsResponse = '', emailResponse = '';
      if (zair && zair.email) {
        if (user && user.length && user[0].language) {
          var msg = '';
          var options = {};
          if (user[0].language == "FRN") {
            msg = "Salamun Alaykum,\nNous tenons à vous informer que la Ziyarah de l'Imam Hussain (as) a bien été accomplie en votre nom.\nQu'Allah accepte vos actions,\nNajafyia Foundation";
            
            if (zair.email) {
              var html = emailTemplate
                .ziyarahPerformedFrn()
                .replace("[Name]", zair.fullName).replace("[Date]",moment(zair.ziyaratDate).locale(constants.Languages.French.locale).format('dddd, MMMM Do YYYY'));
             
              options = {
                from: configuration.email.fromTextEng,
                to: zair.email,
                subject: configuration.email.subjectPrefixEng_Frn + " | Accomplissement de Ziyarah",
                html: html
              };
            }
          } else if (user[0].language == "ARB") {
            msg ="السلام عليكم ورحمة الله وبركاته \nيسرنا إبلاغكم بأنه تمت زيارة الإمام الحسين(ع) بالنيابة عنكم.\nتقبل الله أعمالكم بأحسن القبول.\n مؤسسة الأنوار النجفية\n";
             
            if (zair.email) {
              var html = emailTemplate
                .ziyarahPerformedArb()
                .replace("[Name]", zair.fullName).replace("[Date]",moment(zair.ziyaratDate).locale(constants.Languages.Arabic.locale).format('dddd, MMMM Do YYYY'));
              
              options = {
                from: configuration.email.fromTextEng,
                to: zair.email,
                subject: "أداء الزيارة",
                html: html
              };
            }
          } else {
            msg =
              "Salamun Alaykum, This is to notify that the Ziyarah of Imam Hussain (as) has been performed on your behalf. May Allah accept your deeds. Najafyia Foundation";
            
            if (zair.email) {
              var html = emailTemplate
                .ziyarahPerformedEng()
                .replace("[Name]", zair.fullName).replace("[Date]",moment(zair.ziyaratDate).locale(constants.Languages.English.locale).format('dddd, MMMM Do YYYY'));
                
               
              options = {
                from: configuration.email.fromTextEng,
                to: zair.email,
                subject: configuration.email.subjectPrefixEng_Frn + " | Ziyarah Performed",
                html: html
              };
            }
          }
          if (zair.phone && zair.phone.length > 4 && zair.phone.indexOf("undefined") < 0) {
            var rSms = '';
            try {
              const responseSMS = await smsHelper.sendSmsAsync(zair.phone, msg);
              rSms = responseSMS;
            }
            catch (exc) {
              rSms = exc;
            }
            if (rSms.statusCode == '200') {
              sms = true;
              smsResponse = ` SMS sent successfully with Response Message :  ${rSms.statusMessage} `;
            }
            else {
              sms = false;
              smsResponse = `SMS Failed to sent , Response Message :`, rSms;
            }
          }
          var responseEmail = '';
          try {
            const response = await emailTrans.sendEmail(options);
            responseEmail = response;
          }
          catch (exc) {
            responseEmail = exc;
          }
          if (responseEmail.response == '250 Great success') {
            email = true;
            emailResponse = `Sent Succefully  Response received : ${responseEmail.response}`;
          }
          else {
            email = false;
            emailResponse = responseEmail.response;
          }
          zair.emailSent = email;
          zair.smsSent = sms;
          zair.emailResponse = emailResponse;
          zair.smsResponse = smsResponse;
          var payloAd = {
            updated: Date.now(),
            isVisited: true,
            isActive: false,
            emailSent: email,
            smsSent: sms,
            emailResponse: emailResponse,
            smsResponse: smsResponse
          };
          var ziyarat = await databaseHelper.updateItem(Ziyarat, { _id: zair._id }, payloAd);
          if (!ziyarat) {
            Logs.create({
              action: `Updating Ziareen`,
              error: {
                ...err,
                zair
              }
            });
          }

        }
      }
    }
    return zair;
  }
  catch (ex) {
    
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
  }
};

function adminEmailZiyarah(zaireens) {
  methodName = 'adminEmailZiyarah()';
  try {

    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Preparing Ziyarat email list for admin `);
    let rows = [];
    let serial = 1;
    zaireens.forEach(zayair => {
      rows.push(`<tr>
    <td>${serial++}</td>
    <td>${zayair.fullName}</td>
    <td>${zayair.email}</td>
    <td>${zayair.phone}</td>
    <td>${zayair.country}</td>
    <td>${new Date(zayair.date).toLocaleString('en-US', { hour12: true })}</td>
    <td>${zayair.emailSent ? 'YES' : 'NO'}</td>
    <td>${zayair.emailResponse}</td>
    <td>${zayair.smsSent ? 'YES' : 'NO'}</td>
    <td>${zayair.smsResponse}</td>
    </tr>`)
    });
    return `
  <html style='font-family: sans-serif;'>
    <body>
    <h5>Salamun Alaykum,</h5>
    <p> Following zaireen were selected and attempted to be notified for their ziyarat performed on <b> ${moment(zaireens[0].ziyaratDate).locale(constants.Languages.English.locale).format('dddd, MMMM Do YYYY')}.</b> </p>
      <h5>List of Zaireen</h5>
      <table style="border-collapse:collapse" border="1" >
        <thead>
          <th>Serial #</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Country</th>
          <th>Date</th>
          <th>Email Sent</th>
          <th>Email Response</th>
          <th>SMS Sent</th>
          <th>SMS Response</th>

        </thead>
        <tbody>
          ${rows.toString().replace(/,/g, '')}
        </tbody>
      </table>
    </body>
  </html>
  `

  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
  }

}

module.exports.InitiateZiyaratEmailProcess = async function (req) {
  methodName = 'InitiateZiyaratEmailProcess()';
  try {

    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Creating an entry for job send email/sms job to  be performed `);
    var status = configuration.ziyarat.ziyaratQueStatuses.notStarted;
    const notificationReqItem = await databaseHelper.getSingleItem(ZaireenNotification, { ziaratDate: req.ziaratDate });
    if (notificationReqItem) {
      status = configuration.ziyarat.ziyaratQueStatuses.ignore;
    }
    let query = {
      key: configuration.ziyarat.ziyaratSettingKey
    };
    const config = await databaseHelper.getSingleItem(configSetting, query);
     
    var consultants =config.value.consultants ;//  get consultants here 

    if (!(status === configuration.ziyarat.ziyaratQueStatuses.ignore && req.consultantId === configuration.ziyarat.botUser.queryString)) {
      const consultantObj = req.consultantId === configuration.ziyarat.botUser.queryString ?
        configuration.ziyarat.botUser :
        consultants.find(function (c) {  // get consultants here from DB
          return c.queryString == req.consultantId;
        });
      let query = {
        consultantId: req.consultantId,
        ziaratDate: req.ziaratDate
      };
      let payload = {
        consultantId: req.consultantId,
        ziaratDate: req.ziaratDate,
        totalZaireen: req.totalZaireen,
        status: status,
        consultant: consultantObj
      };
      const result = await databaseHelper.updateItem(ZaireenNotification, query, payload, true);
      if (result) {
        return result;
      }
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
  }
};

module.exports.sendZaireenList = async function () {
  methodName = 'sendZaireenList()';
  try {
    
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Emailing List to consultants `);
    


    
    let query = {
      key: configuration.ziyarat.ziyaratSettingKey
    };
    const config = await databaseHelper.getSingleItem(configSetting, query);
   
     
    let consultants =config.value.consultants;
    




    if (consultants) {
      let zaireen = await databaseHelper.getManyItems(Ziyarat, { isSelectedForZiyarat: false, isVisited: false });
      if (zaireen != ('' || undefined)) {
        try {
          if (zaireen.length > 0) {
            for (let i = 0; i < zaireen.length; i++) {
              const ziyarat = await databaseHelper.updateItem(Ziyarat, { _id: zaireen[i]._id }, { $set: { isSelectedForZiyarat: true } });
              if (ziyarat) {
                ziyarat.updated = Date.now();
              }
            }
            for (k = 0; k < consultants.length; k++) {
              var websiteURL = process.env.SERVER_URL + "/#/ziyaratPerformNotification?Uid=" + consultants[k].queryString;    
              var options = {
                from: configuration.email.fromTextEng,
                to: consultants[k].email,
                subject: "Zaireen List for Ziyarat e Imam Hussain",
                html: "<p>Zaireen has been selected for this 'Thursday Ziyarat'. Once Ziyarat has been performed, please send notification to selected zaireen using the link below:</p>  <a href='" + websiteURL + "' target='_blank'>Zaireen List</a> <p> JazakAllah </P>"
              };
              try {
                await emailTrans.sendEmail(options);
              }
              catch (exce) {
                logHelper.logError(`${constants.LogLiterals.Schedule_CONTROLLER}: ${methodName}: Error sending email to consultant  ${consultants[k].email} `, exce);

              }
              try {
                await smsHelper.sendSmsAsync(consultants[k].phone, `Zaireen has been selected for this "Thursday Ziyarat". Once Ziyarat has been performed, please send notification to zaireen using the link emailed to you.`);
              }
              catch (exc) {
                logHelper.logError(`${constants.LogLiterals.Schedule_CONTROLLER}: ${methodName}: Error sending sms to consultant ${consultants[k].name} having phone number  ${consultants[k].phone} `, exc);
              }
            }
          } else {
            for (k = 0; k < consultants.length; k++) {
              var options = {
                from: configuration.email.fromTextEng,
                to: consultants[k].email,
                subject: "Zaireen List for Ziyarat e Imam Hussain",
                html: "<p>Zaireen not Found for today's Ziyarat</p>"
              };
              try {
                await emailTrans.sendEmail(options);
              }
              catch (exce) {
                logHelper.logError(`${constants.LogLiterals.Schedule_CONTROLLER}: ${methodName}: Error sending email to consultant  ${consultants[k].email} `, exce);
              }
              try {
                await smsHelper.sendSmsAsync(consultants[k].phone, `Zaireen not Found for today's Ziyarat`);
              }
              catch (exc) {
                logHelper.logError(`${constants.LogLiterals.Schedule_CONTROLLER}: ${methodName}: Error sending sms to consultant ${consultants[k].name} having phone number  ${consultants[k].phone} `, exc);
              }
            }
          }
        } catch (e) {
          
          logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error after getting zaireen list `, e);
        }
      }

    }

  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error processing zaireen list to consultants  `, ex);

  }

};


module.exports.getZiyaratSetting = async function (req, res) {
  methodName = 'getZiyaratSetting()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Getting Ziyarat Settings `);

    let query = {
      key: configuration.ziyarat.ziyaratSettingKey
    };
    let config = await databaseHelper.getSingleItem(configSetting, query);
    if (config) {
      return config.value;
    }
    else{
      return null ;
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }

};

module.exports.saveZiyaratSetting = async function (req, res) {

  methodName = 'saveZiyaratSetting()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Updating or Adding Ziyarat Settings Ziyarat Settings `);
let value = req.body;
let consultants = value.consultants;
for (const obj of consultants) {
  if (obj.queryString === undefined || obj.queryString === null || obj.queryString === ''  )  {
    obj.queryString =  genericHelper.getRandomString(20);
  }
}
    let query = {
      key: configuration.ziyarat.ziyaratSettingKey
    };
    let payload ={
      key : configuration.ziyarat.ziyaratSettingKey,
      value : value
    };
    let setting = await databaseHelper.updateItem(configSetting, query,payload,true);
    if (setting) {
      return setting ;
    }
    else
    {
      return null;
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }

};


module.exports.getThurdayZiyaratDate = async function (userId)
{
  methodName = 'getThurdayZiyaratDate()';
  try {
    logHelper.logInfo(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: checking and returning ziyarat model for specific user `);
  
    let query = {
      isSelectedForZiyarat: true,
      isActive: true,
      isVisited: false
    };
    if(userId)
    {
      query.userId = userId;
    }
    let ziyaratExist = await databaseHelper.getSingleItem(Ziyarat, query,{},  {sort:{ ziyaratDate : -1  }});
    if (ziyaratExist) {
      return ziyaratExist ;
    }
    else
    {
      return null;
    }
  }
  catch (ex) {
    logHelper.logError(`${constants.LogLiterals.ZIYARAT_SERVICE}: ${methodName}: Error`, ex);
    res.status(500).send("Exception Occured");
  }

};

