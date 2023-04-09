/** Modules **/

var express = require('express');
var fs = require('fs');
var http = require('http');

var mongoose = require('mongoose');

/** Configuration **/
var app = express();
var config = require('./config/development');
mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl, config.dbConfig);
var configuration = require('./config/configuration');
var logHelper = require('./app/utilities/logHelper');
var audit = require('express-requests-logger');

//var ziaratPerformNotificationJob = require('./app/cron-jobs/ziaratPerformNotificationJob');







process.env.SERVER_URL = process.env.SERVER_URL ? process.env.SERVER_URL : 'https://najafyia.org';
//-----------------------------------------------------------------------------

const httpServer = http.createServer(app);
//const httpsServer = https.createServer(options, app);

function initializeLoggingMiddleware() {
    try {
        const logger = logHelper.initializeLogger();
        app.use(audit({
            logger: logger, // Existing bunyan logger
            excludeURLs: ['health', '.js', '.jpg', '.png', '.svg', '.css', '.map', '.html', '/plugins/', '/assets/'], // Exclude paths which enclude 'health' & 'metrics'
            request: {
                maskBody: ['password'], // Mask 'password' field in incoming requests
                excludeHeaders: ['authorization'], // Exclude 'authorization' header from requests
                excludeBody: ['creditCard'], // Exclude 'creditCard' field from requests body
                //maskHeaders: [‘header1’], // Mask 'header1' header in incoming requests
                maxBodyLength: 50 // limit length to 50 chars + '...'
            },
            response: {
                maskBody: ['session_token'], // Mask 'session_token' field in response body
                //excludeHeaders: ['*'], // Exclude all headers from responses,
                //excludeBody: ['*'], // Exclude all body from responses
                //maskHeaders: ['header1'], // Mask 'header1' header in incoming requests
                maxBodyLength: 550 // limit length to 50 chars + '...'
            }
        }));
    }
    catch (err) {
        console.log("Error", err);
    }
}
initializeLoggingMiddleware();

//Initialize ziarat cron job
app.get('/health-check', function (req, res) {
    res.status(200).send("It is running...");
})

fs
.readdirSync(`./app/cron-jobs/`)
.filter(file => (file.slice(-3) === '.js'))
.forEach((file) => {
  var importJob =  require(`./app/cron-jobs/${file}`)
  importJob.initializeJob();

});
//ziaratPerformNotificationJob.initializeJob();

app.use(function (err, req, res, next) {
    if (err) {
        logHelper.logError('ErrorLog', err);
    } else {
        logHelper.logError('404 Error Log')
    }
});
httpServer.listen(configuration.app.port, () => {
    console.log(`Application started on port: ${configuration.app.port}`);
    logHelper.logInfo('**** Server Restarted ****')
});
process.on('unhandledRejection', err => {
    try {
        logHelper.logErrorToFile("unhandledRejection", err)
        console.log(err.name, err.message);
        let date = new Date();
        date = date.toISOString().split(':').join('-').split('.').join('-');
        fs.writeFile(`./errors/error-${date}`, err, (Ferr) => {
            if (!Ferr) console.log("Error log successfully");
        })
    }
    catch (err) {
        logHelper.logErrorToFile("Error in unhandledRejection", err)
    }
});




//add dynamic insertion of job initalizations