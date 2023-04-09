/** Modules **/
var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var multer = require('multer');
var session = require('express-session');
var passport = require('passport');
var cors = require('cors');
/** Configuration **/
var app = express();
var social = require('./app/passport/passport')(app, passport);
var MongoStore = require('connect-mongo')(session);
var config = require('./config/development');
mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl, config.dbConfig);
var Logs = require('./app/models/logs');
var configuration = require('./config/configuration');
var logHelper = require('./app/utilities/logHelper');
var audit = require('express-requests-logger');
var compression = require('compression');
var minify = require('express-minify');
var helmet = require("helmet");

var ziaratPerformNotificationJob = require('./app/cron-jobs/ziaratPerformNotificationJob');
var sadaqahCalculationJob = require('./app/cron-jobs/sadaqahCalculationJob');
var aytamunaReportJob = require('./app/cron-jobs/aytamunaReportJob');
var emailNotificationJob = require('./app/cron-jobs/emailNotificationJob');
var sadaqahEndedJob = require('./app/cron-jobs/sadaqahEndedJob'); 
/** SSL CERTIFICATION */
const cert = fs.readFileSync('./config/ssl/335654964repl_1.crt', 'utf8');
const ca = fs.readFileSync('./config/ssl/335654964repl_1.ca-bundle', 'utf8');
const key = fs.readFileSync('./config/ssl/private-key.key', 'utf8');

let options = {
    ca,
    key,
    cert
};
//----------------------------------------------------------------------------- 

process.env.SERVER_URL = process.env.SERVER_URL ? process.env.SERVER_URL : 'https://najafyia.org';
process.env.StripeKey = configuration.payment.stripeSecretKey;
//-----------------------------------------------------------------------------

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

// app.use((req, res, next) => {
//     if (req.protocol === 'http') {
//         res.redirect(301, `https://${req.headers.host}${req.url}`);
//     }
//     next();
// });
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
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(methodOverride('X-HTTP-Method-Override'));
const originsWhitelist = [
    'http://localhost:4200', //this is my front-end url for development
    'https://localhost',
    'http://localhost:3000',
    'https://najafyia.org',
    'http://ec2-34-207-188-21.compute-1.amazonaws.com/',
    'http://ec2-18-220-113-144.us-east-2.compute.amazonaws.com/'
];
const corsOptions = {
    origin: function (origin, callback) {
        const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
};
//here is the magic
app.use(cors(corsOptions));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    // rolling: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    },
    store: new MongoStore({
        url: configuration.database.mongoUrl,
        ttl: configuration.database.ttl
    }),
}))

//-------------------------------minify here:
app.use(compression());
app.use(express.static(__dirname + '/public'));

//-------------------------------secure Express apps by setting various HTTP headers:
app.use(helmet());


var mystorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }

});
var receiptStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.originalname.split('.').shift() + '-' + datetimestamp + '.' + file.originalname.split('.').pop());
    }

});

var upload = multer({
    dest: './public/uploads/',
    storage: mystorage
});
var uploadReceipt = multer({
    storage: receiptStorage
});
app.post('/upload', upload.single('file'), uploadImage);

function uploadImage(req, res) {

    let file = req.file;
    res.send({
        message: "success",
        name: file.filename
    });
}
// Multiple Image Upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var uploadMulti = multer({
    storage: storage
});
app.post('/admin/studentList', uploadMulti.any(), (req, res, next) => {
    const files = req.files
    if (!files) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }
    var studentprofile = require('./app/models/studentProfile');
    try {
        files.forEach(f => {
            let studentId = f.filename.split(".").shift();
            let doc = studentId.split("-");
            let modifier = {
                $set: {}
            };
            if (doc instanceof Array && doc.length > 1) {
                var link = doc[1] === "result" ? "result" : "medical";
                studentId = studentId.split("-").shift();
                if (link === "result") {
                    modifier.$set.resultLink = f.filename;
                }
                if (link === "medical") {
                    modifier.$set.medicalLink = f.filename;
                }
            } else {
                modifier.$set.imageLink = f.filename;
            }
            studentprofile.update({
                studentId: studentId
            }, modifier, {
                multi: true
            }, (e, r) => {
                if (e) throw e;

            })

        })
    } catch (error) {
        res.status(500).send("Error Updating User Data");
    }
    res.status(200).send("Successfully Saved")


})

app.post('/donation/uploadFilSendEmail', uploadReceipt.any(), (req, res, next) => {
    const files = req.files
    if (!files) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }
    try {
        res.status(200).json({
            message: "upload Successfully",
            path: files[0].path
        });
    } catch (error) {
        res.status(500).send("can't upload");
    }


})
if (configuration.app.mode === "JOB") {
    //Initialize ziarat cron job
    app.get('/health-check', function (req, res) {
        res.status(200).send("It is running...");
    })
    ziaratPerformNotificationJob.initializeJob();
    sadaqahCalculationJob.initializeJob();
    aytamunaReportJob.initializeJob();
    emailNotificationJob.initializeJob();
    sadaqahEndedJob.initializeJob();
}
else {
    require('./app/routes')(app);
}
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
httpsServer.listen(configuration.app.sslport, () => {
    console.log(`HTTPS SERVER started on port: ${configuration.app.sslport}`)
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