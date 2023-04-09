var nodemailer = require("nodemailer");
var contactSchema = require("../models/contactUs");
var WebSettings = require("../models/webSettings.js");
var User = require("../models/user.js");
var GuestUser = require("../models/guestUser.js");
var path = require("path");
var emailTemplate = require("../../public/js/emailTemplates.js");
var emailTrans = require("../../public/js/emailTransporter.js");
var configuration = require('../../config/configuration');
// var smtpTransport = require('nodemailer-smtp-transport');
// var transporter = nodemailer.createTransport({
//   host: "mail.binaryvibes.com",
//   secure: false,
//   port: 587,
//   auth: {
//     user: "test@binaryvibes.com",
//     pass: "8(H2lwKBGsSK"
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });

//Send Email
module.exports.sendEmail = function (req, res) {
  req.session.donarEmailWithoutLogin =
    req.body.donarEmailWithoutLogin || req.body.donarEmail;
  var options = {
    from: configuration.email.fromTextEng,
    to: req.body.donarEmailWithoutLogin || req.body.donarEmail,
    subject: req.body.subject || "",
    html: JSON.parse(req.body.html)
  };
  emailTrans.trans().sendMail(options, function (err, suc) {
    if (suc) {
      console.log(suc);
      res.end("sent");
    } else {
      console.log("Message not sent: " + err);
      res.end("error");
    }
  });
};

//Send Email To Admin From Contact Us Form
module.exports.sendEmailContactUs = function (req, res) {
  User.findOne({ contactEmailAddress: { $exists: true } }, function (err, user) {
    if (user) {
      let optionsAdmin = {
        from: req.body.email,
        to: user.email,
        subject: req.body.subject || "",
        html: JSON.parse(req.body.html)
      };
      emailTrans.trans().sendMail(optionsAdmin, function (err, suc) {
        if (suc) {
          console.log("Query auto response to given email. Admin");
          res.end("sent");
          let html;
          let subject;

          if (req.body.language == "FRN") {
            subject = configuration.email.subjectPrefixEng_Frn+" | Acknowledgement FRN";
            html = emailTemplate
              .contactUsFrn()
              .replace("[Name]", req.body.email);
          } else if (req.body.language == "ARB") {
            subject = "اتصل بنا";
            html = emailTemplate
              .contactUsArb()
              .replace("[Name]", req.body.email);
          } else {
            subject = configuration.email.subjectPrefixEng_Frn+" | Acknowledgement";
            html = emailTemplate
              .contactUsEng()
              .replace("[Name]", req.body.email);
          }
          let options = {
            from: configuration.email.fromTextEng,
            to: req.body.email,
            subject: subject || "",
            html: html
          };

          emailTrans.trans().sendMail(options, function (err, suc) {
            if (suc) {
              const newContact = new contactSchema({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                subject: req.body.subject === 'other' ? req.body.other : 'Query From Al-Najafiya',
                contactMessage: req.body.message
              });
              newContact.save((cErr, cRes) => {
                if (!cErr) {
                  console.log("Query auto response to given email.");
                  console.log("Contact Form Saved.");
                  res.end("sent");
                }
              });
            } else {
              console.log("Message error: " + err);
              res.end("error");
            }
          });
        } else {
          console.log("Message error: " + err);
          res.end("error");
        }
      });
    } else {
      res.json({ success: false, message: "Admin not found." });
    }
  });
};

//Send Email Receipt
module.exports.sendReceiptEmail = async function (req, res) {
  let options = {
    from: "invoice@najafyia.org",
    to: req.body.donorEmail
  }
  let user = {};
  user = await User.findOne({ email: req.body.donorEmail });
  if (!user) user = await GuestUser.findOne({ email: req.body.donorEmail });
  if (req.body.receiptType == "khums") {
    if (user.language == 'ARB') {
      options.subject = "الخمس";
      options.html = JSON.parse(emailTemplate.khumsArb().replace("[Name]", req.body.donorName));
    }
    else if (user.language == 'FRN') {
      options.subject = configuration.email.subjectPrefixEng_Frn+" | Khums";
      options.html = JSON.parse(emailTemplate.khumsFrn().replace("[Name]", req.body.donorName));
    }
    else {
      options.subject = configuration.email.subjectPrefixEng_Frn+" | Khums";
      options.html = JSON.parse(emailTemplate.khumsEng().replace("[Name]", req.body.donorName));
    }
    options.attachments = [{ path: req.body.path, filename: req.body.path && req.body.path.split('\\').pop() }]
  }
  else {
    if (req.body.userLang == 'ARB') {
      options.subject = "إيصال";
      options.html = JSON.parse(emailTemplate.standardRecArb().replace("[DonarName]", req.body.donorName)
        .replace('[DSP]', 'none'));
    }
    else if (req.body.userLang == 'FRN') {
      options.subject = configuration.email.subjectPrefixEng_Frn+" | Reçu de donation";
      options.html = JSON.parse(emailTemplate.standardRecFrn().replace("[DonarName]", req.body.donorName)
        .replace('[DSP]', 'none'));
    }
    else {
      options.subject = configuration.email.subjectPrefixEng_Frn+" | Donation receipt";
      options.html = JSON.parse(emailTemplate.standardRecEng().replace("[DonarName]", req.body.donorName)
        .replace('[DSP]', 'none'));
    }
    let filePath = req.body.path.split('/').join('\\')
    options.attachments = [{ path: filePath, filename: req.body.path.split('\\').pop() }]
  }
  emailTrans.trans().sendMail(options, function (err, suc) {
    if (!err) {
      res.status(200).send("email send")
    } else {
      res.status(500).send("email not send")
    }
  })
}

// //Send Email Receipt
module.exports.sendEmailWithReciept = function (req, res) {
  //     req.session.donarEmailWithoutLogin = req.body.donarEmailWithoutLogin || req.body.donarEmail;
  //     savedFileName = 'DonarReciept.pdf';
  //     var receipt = createPDFFile(engReceipt, savedFileName);
  //     var options = {
  //         from: 'test@binaryvibes.com',
  //         to: req.body.donarEmailWithoutLogin || req.body.donarEmail,
  //         subject: req.body.subject || '',
  //         html: JSON.parse(req.body.html),
  //         attachments: [{ path: receipt, filename: savedFileName }]
  //     };
  //     transporter.sendMail(options, (err, suc) => {
  //         if (err) {
  //             res.status(500).send('error')
  //         } else {
  //             res.status(200).send('Sent')
  //         }
  //     });
};

// /**
//  * Create PDF from HTML and send the URL of PDF.
//  * You can add Header/Footer in your PDF also
//  */
// var pdf = require('html-pdf');  // npm install html-pdf — save
// global.createPDFFile = function (htmlString, fileName) {
//     var options = {
//         format: 'Letter',
//         header: {
//             "height": "15mm",
//             "contents": "<img alt='Clintek logo' height='100' width='100'src='http://www.google.com'>"
//         },
//         "timeout": 600000,
//         "footer": {
//             "height": "15mm",
//             "contents": {
//                 first: engReceipt,
//                 default: '<div><span>Appointment Report</span></div>', // fallback value
//                 last: '<div><span>Last Page</span></div>',
//             }
//         }
//     };
//     /**
//      * It will create PDF of that HTML into given folder.
//      */
//     pdf.create(htmlString, options).toFile('./public/pdf/' + fileName, function (err, data) {
//         if (err) return console.log(err);
//         return data.filename;
//     });
// }

// var engReceipt = "<style>";
// engReceipt += "    .emailtemp table {font-family: arial, sans-serif; border-collapse: collapse; width: 100%; margin: 0px; border: none !important;}";
// engReceipt += "    .emailtemp th {border: 1px solid #dddddd; background: #f0c84c !important; text-align: center !important; color: #000 !important; padding: 8px; }";
// engReceipt += "    .emailtemp td{text-align: center !important;}";
// engReceipt += "</style>";
// engReceipt += "<div class='container emailtemp'>";
// engReceipt += "	<div class='row'>";
// engReceipt += "		<div class='col-md-7' style='margin: 0 auto; float: none;'>";
// engReceipt += "			<div class='col-md-12'>";
// engReceipt += "				<img src='images/email-template/header-email.jpg' alt='#'/>";
// engReceipt += "			</div>";
// engReceipt += "			<div class='col-md-12'>";
// engReceipt += "				<img src='images/email-template/header-bar.jpg' alt='#'/>";
// engReceipt += "			</div>";
// engReceipt += "			<div class='col-md-6' style='margin: 20px 0px; padding: 0px;text-align: left;'>";
// engReceipt += "				<div class='col-md-12' style='color: #000; font-size: 21px; font-weight: bold;'>Donor Name</div>";
// engReceipt += "				<div class='col-md-12'>";
// engReceipt += "					<span style='color: #939598; font-size: 21px; font-weight: bold;'>Syed Talha Hashmi</span>";
// engReceipt += "				</div>";
// engReceipt += "			</div>";
// engReceipt += "			<div class='col-md-6' style='margin: 20px 0px; text-align: right;'>";
// engReceipt += "				<div class='col-md-12'>";
// engReceipt += "					<span style='color: #000; font-size: 21px; font-weight: bold;'>Date :</span>";
// engReceipt += "					<span style='color: #939598; font-size: 21px; font-weight: bold;'>17-12-2018</span>";
// engReceipt += "				</div>";
// engReceipt += "				<div class='col-md-12'>";
// engReceipt += "					<span style='color: #000; font-size: 21px; font-weight: bold;'>Serial # :</span>";
// engReceipt += "					<span style='color: #939598; font-size: 21px; font-weight: bold;'>A00045</span>";
// engReceipt += "				</div>";
// engReceipt += "			</div>";
// engReceipt += "			<div class='col-md-12'>";
// engReceipt += "				<table>";
// engReceipt += "					<tr>";
// engReceipt += "						<th>S.No</th>";
// engReceipt += "						<th>Description</th>";
// engReceipt += "						<th>Quantity</th>";
// engReceipt += "						<th>Amount</th>";
// engReceipt += "					</tr>";
// engReceipt += "					<tr>";
// engReceipt += "						<td>08</td>";
// engReceipt += "						<td>Lorem Lipsum</td>";
// engReceipt += "						<td>0</td>";
// engReceipt += "						<td>$ 1,050</td>";
// engReceipt += "					</tr>";
// engReceipt += "				</table>";
// engReceipt += "			</div>";
// engReceipt += "			<div class='col-md-12'>";
// engReceipt += "				<div class='col-md-5' style='background: #f0c84c; float: right; color: #000; font-size: 21px; font-weight: bold; margin: 15px 0px; padding: 10px 0px; text-align: center'> ";
// engReceipt += "Total Amount : $22,900/=</div>";
// engReceipt += "			</div>";
// engReceipt += "			<div class='col-md-12' style='text-align: center; line-height: 40px;'>";
// engReceipt += "                There is an electronically generated receipt, therefore no signature required.";
// engReceipt += "            </div>";
// engReceipt += "			<div class='col-md-12' style='float: left; border: 3px solid #f0c84c; height: 5px;'></div>";
// engReceipt += "			<div class='col-md-12'>";
// engReceipt += "				<table>";
// engReceipt += "					<tr>";
// engReceipt += "						<td style=' border: 0 !important;'>Najafiya Foundation</td>";
// engReceipt += "						<td style=' border: 0 !important;'>";
// engReceipt += "							<a href='https://najafiya.com' target='_blank'> www.najafiya.org</a>";
// engReceipt += "						</td>";
// engReceipt += "						<td style=' border: 0 !important;'>";
// engReceipt += "							<a href='mailto:invoice@najafiya.com'>invoice@najafiya.com</a>";
// engReceipt += "						</td>";
// engReceipt += "					</tr>";
// engReceipt += "				</table>";
// engReceipt += "			</div>";
// engReceipt += "			<div class='col-md-12'>";
// engReceipt += "				<table>";
// engReceipt += "					<tr>";
// engReceipt += "						<td style='width: 100%; border: 0 !important;'>";
// engReceipt += "							<a href='https://www.facebook.com/NajafyiaFoundation/' target='_blank'>";
// engReceipt += "								<img src='images/icons/fb.png'>";
// engReceipt += "								</a>";
// engReceipt += "								<a href='https://twitter.com/' target='_blank'>";
// engReceipt += "									<img src='images/icons/twitter.png'>";
// engReceipt += "									</a>";
// engReceipt += "									<a href='https://www.instagram.com/?hl=en' target='_blank'>";
// engReceipt += "										<img src='images/icons/insta.png'>";
// engReceipt += "										</a>";
// engReceipt += "									</td>";
// engReceipt += "								</tr>";
// engReceipt += "							</table>";
// engReceipt += "						</div>";
// engReceipt += "					</div>";
// engReceipt += "				</div>";
// engReceipt += "			</div>";

