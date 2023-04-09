var pdf = require('html-pdf');
var logHelper = require('../utilities/logHelper');
module.exports = {
    createPDFBufferFromHTML:async function(html,options) {
        try 
        {
            return new Promise((resolve, reject) => {
                pdf.create(html,options).toBuffer((err, buffer) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(buffer);
                  }
                });
              });
        }
        catch (ex) {
            logHelper.logError("Error in creating in memeory buffer of PDF file : ", ex);
        }
    }
};