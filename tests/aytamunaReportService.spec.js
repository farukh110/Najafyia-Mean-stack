var aytamunaReportService = require('../app/services/aytamunaReportService.js');
var logHelper = require('../app/utilities/logHelper');
/** Modules **/
var express = require('express');
var mongoose = require('mongoose');
/** Configuration **/
var app = express();
var config = require('../config/development');
mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl, config.dbConfig);

test('Testing aytamuna report service', async () => {
    console.log('************* Started Test  ************');
    const logger = logHelper.initializeLogger();
  
    var result = await aytamunaReportService.updateStatusForAytamunaReport(new Date(new Date().toUTCString()));
    console.log(result);
    expect(result).toBe(true);
    
  },90000);