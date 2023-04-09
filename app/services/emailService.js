//Models
var emailTemplateModel = require('../models/emailTemplate.js');

//Utilities
const databaseHelper = require('../utilities/databaseHelper');
var emailTrans = require("../../public/js/emailTransporter.js");
var logHelper = require('../utilities/logHelper');

//Config
var configuration = require('../../config/configuration');
var constants = require('../constants');
var tokenData = require('../tokenData');
var emailTemplates = require('../../public/js/emailTemplates.js');

//Constants
const emailSucessMesage = '250 Great success';

//Params detail:
//templateName: Name of the template in emailTemplates table of database
//dynamicFields: Array list of json objects consist of two fields with name 'keyName' and 'value' which needs to be replaced in email html body
//attachmentFiles: Array list of json objects consist of two fields with name 'fileName' and 'buffer' which need to be send in email
module.exports.sendEmailByTemplate = async function (templateName, dynamicFields, attachmentFiles,recipientEmail) {
    const methodName = 'sendEmailByTemplate';
    try{
        var email = await getTemplateByName(templateName);

        if(email){
    
            //var htmlBody = await setDynamicValuesInEmailBody(email, dynamicFields);
            var objEmail = await setDynamicValuesInEmail(email, dynamicFields);
    
            //Create custom list of files need to be send in email attachment
            var fileAttachment = await createAttachmentlist(attachmentFiles);
            var response = await sendEmail(objEmail.body, email, fileAttachment, recipientEmail);
        
            return response;
        }
        else
        {
            logHelper.logInfo(`${constants.LogLiterals.EMAIL_SERVICE}: ${methodName}: Email template not found in database with name ${templateName} `);
        }
    }
    catch(err)
    {
        console.log('caught in email service ',err);
        logHelper.logError(`${constants.LogLiterals.EMAIL_SERVICE}: ${methodName}: Error while sending email using template from database : `, err);
    }
    return false;
}

async function getTemplateByName(templateName){
    const methodName = 'getTemplateByName';
    try{
        var result = await databaseHelper.getSingleItem(emailTemplateModel, { name : templateName  });
        return result;
    }
    catch(err)
    {
        logHelper.logError(`${constants.LogLiterals.EMAIL_SERVICE}: ${methodName}: Error while retriving email Template from database : `, err);
    }

}

async function setDynamicValuesInEmail(email,dynamicFields)
{
    var html = email.body;
    var sub = email.subject;
    if(dynamicFields != undefined || dynamicFields != null)
    {
        for(let index = 0; index < dynamicFields.length; index++)
        {
            var keyName = dynamicFields[index].keyName;
            if(keyName.includes(tokenData.common.ISVISIBLE,0))
            {
                var value = dynamicFields[index].value;
                if(value)
                {
                    html = html.replace(new RegExp("\\<" + dynamicFields[index].keyName + ">", "g"), "");
                    html = html.replace(new RegExp("\\</" + dynamicFields[index].keyName + ">", "g"), "");
                }
                else
                {
                    var startTag = "<" + dynamicFields[index].keyName + ">";
                    var startIndex = html.indexOf(startTag,0);
                    var endIndex = html.indexOf("</" + dynamicFields[index].keyName + ">",0);
                    if(startIndex != -1 && endIndex != -1)
                    {
                        // html = html.replace(new RegExp("\\" + html.substring(startIndex, endIndex), "g"), "");
                        html = html.replace(html.substring(startIndex, endIndex), "");
                        html = html.replace(new RegExp("\\</" + dynamicFields[index].keyName + ">", "g"), "");
                    }
                    
                }
            }
            else
            {
                html = html.replace(new RegExp("\\[" + dynamicFields[index].keyName + "]", "g"), dynamicFields[index].value);
                sub = sub.replace(new RegExp("\\[" + dynamicFields[index].keyName + "]", "g"), dynamicFields[index].value);
            }
        }
    }
    email.body = html;
    email.subject = sub;
    return email
    //return html;
}

async function sendEmail(htmlBody,email,fileAttachment,recipientEmail){
    const methodName = 'sendEmail';
    var receiverEmail = email.to && email.to.length > 0 ? `${recipientEmail},${email.to}` : `${recipientEmail}`;
    var senderEmail = email.from && email.from.length > 0 ? email.from : configuration.email.fromTextEng;
    let responseEmail;
    options = {
        from: senderEmail,
        to: receiverEmail,
        cc : email.CC,
        bcc : email.BCC,
        subject: email.subject,
        html: htmlBody,
        attachments: fileAttachment
      };

          try {             
                responseEmail = await emailTrans.sendEmail(options);
                if (responseEmail.response == emailSucessMesage) {
                    logHelper.logInfo(`${constants.LogLiterals.EMAIL_SERVICE}: ${methodName}: Sent email succefully : Response received : ${responseEmail.response}`);
                  }
                  else
                  {
                    logHelper.logInfo(`${constants.LogLiterals.EMAIL_SERVICE}: ${methodName}: Not succefully sent email : Response received : ${responseEmail.response}`);
                  }
          }
          catch(err)
          {
            logHelper.logError(`${constants.LogLiterals.EMAIL_SERVICE}: ${methodName}: Error : Error occured while sending email`,
            err);
          }

          return responseEmail;
}

async function createAttachmentlist(attachmentFiles)
{
    var filelist = [];
    if(attachmentFiles != undefined || attachmentFiles != null )
    {
        for(let index = 0; index< attachmentFiles.length; index++)
        {
            let fileObject = {
                filename: attachmentFiles[index].fileName,
                content: attachmentFiles[index].buffer         
            }
            filelist.push(fileObject);
        }
    }
    return filelist;
}