var emailService = require('../app/services/emailService.js');
var receiptBase = require('../app/emails/templates/receipts');
var logHelper = require('../app/utilities/logHelper');
var pdfHelper = require('../app/utilities/pdfHelper');
var paymentService = require('../app/services/paymentService.js');
/** Modules **/
var express = require('express');
var mongoose = require('mongoose');
/** Configuration **/
var app = express();
var config = require('../config/development');
mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl, config.dbConfig);


// test('Testing pdf generation and email service', async () => {
//   console.log('************* Started Test  ************');
//   const logger = logHelper.initializeLogger();
//   var keyValue = 
//   [{
//     keyName : 'DonarName',
//       value : 'Jaffer'
//   },{
//     keyName : 'DSP',
//       value : 'none'
//   }];
//   var name = 'ENG-generalDonation';


//   var html =  receiptBase.receiptEng();
//   var buffer = await pdfHelper.createPDFBufferFromHTML(html,{});

//   var files = [{
//     buffer: buffer,
//     fileName : 'test.pdf'
//   }];

//   const result = await emailService.sendEmailByTemplate(name,keyValue,files);
//   expect(result).toBe(true);
  
// },90000);

test('Testing payment service', async () => {
  console.log('************* Started Test  ************');
  const logger = logHelper.initializeLogger();

  var result = await paymentService.sendEmailWithReciept('60c0bc8b20df846e14384fbd','AA4686',new Date(),{ _id : '60c0c4e748980f49807cd1f3'},1,12,'SUCCESSFUL_PAYMENT_EMAIL_ENG',new Date());
  console.log(result);
  expect(result).toBe(undefined);
  
},90000);

