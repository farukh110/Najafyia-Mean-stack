var genericHelper = require("../../app/utilities/genericHelper");



var engReceipt = `
<html>
<head>
<style>

#item tr:nth-child(8n) {
  margin-bottom: 340px;
  display: block;
  float:right;
  margin-right:-584px;
  
}

#item tr:nth-child(8n) td{
  border:none !important;
  color:#000 !important;
  padding:15px 0;
  font-size:18px;
}

</style>
</head>
<body style="margin:0;margin-top:-3%">


<table style="width:86.3%; margin:240px auto 0;" cellspacing="0" cellpadding="5">
<tbody style="color:grey;" id="item">
	[ITEMS]
</tbody>

</table>

<table style="margin-top: 7%; background: #F4C64E; float: right; border-radius: 2px;font-family:helvetica;width:40%">
	<tbody>
		<tr>
			<td style="padding: 15px 20px;font-size:22px;font-style:bold">
            	Total Amount: <span style="font-style: italic;">[CURRENCY] [TOTALAMOUNT]</span>
			</td>
        </tr>
	</tbody>
</table>

</body>
</html>
`;


var frnReceipt = `
<html>
<head>
<style>

#item tr:nth-child(8n) {
  margin-bottom: 385px;
  display: block;
  float:right;
  margin-right:-584px;
  
}

#item tr:nth-child(8n) td{
  border:none !important;
  color:#000 !important;
  padding:15px 0;
  font-size:18px;
}

</style>
</head>
<body style="margin:0;margin-top:-3%">


<table style="width:86.3%; margin:240px auto 0;" cellspacing="0" cellpadding="5">
<tbody style="color:grey;" id="item">
	[ITEMS]
</tbody>

</table>

<table style="margin-top: 7%; background: #F4C64E; float: right; border-radius: 2px;font-family:helvetica;width:45%">
	<tbody>
		<tr>
			<td style="padding: 15px 40px;font-size:22px;font-style:bold">
        Montant total: <span style="font-style: italic;">[CURRENCY] [TOTALAMOUNT]</span>
			</td>
        </tr>
	</tbody>
</table>

</body>
</html>
`;

var arbReceipt = `
<html>
<head>
<style>

#item tr:nth-child(8n) {
  margin-bottom: 385px;
  display: block;
  
}

#item tr:nth-child(8n) td{
  border:none !important;
  color:#000 !important;
  padding:15px 0;
  font-size:18px;
}

</style>
</head>
<body style="margin:0;margin-top:-3%">


<table style="width:86.3%; margin:240px auto 0;" cellspacing="0" cellpadding="5">
<tbody style="color:grey;" id="item">
	[ITEMS]
</tbody>

</table>

<table style="margin-top: 7%; background: #F4C64E; border-radius: 2px;font-family:helvetica;width:40%">
	<tbody>
		<tr>
			<td style="padding: 15px 40px;font-size:22px;font-style:bold; text-align:right;">
      <span style="font-style: italic;">[CURRENCY] [TOTALAMOUNT]</span> : المبلغ الإجمالي
			</td>
        </tr>
	</tbody>
</table>

</body>
</html>
`;


var standardReceiptEng = "<html style='font-family: sans-serif;'>";
standardReceiptEng += "<body>";
standardReceiptEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
standardReceiptEng += "    <p>Dear [DonarName]</p>";
standardReceiptEng += "    <p>Salamun Alaykum,</p>";
standardReceiptEng += "    <p>We are very grateful for your recent donation.";
standardReceiptEng +=
  "        <br>Kindly find the attached receipt of your generosity.";
standardReceiptEng +=
  "        <br>Thank you for your continued and faithful support.</p>";
standardReceiptEng += "    <p>May Allah accept your deeds.";
standardReceiptEng += "        <br>Najafyia Foundation</p>";
standardReceiptEng += "<p style='display:[DSP]'>Disclaimer: We are just an intermediary. We will be delivering the funds to the office of the respective Marja. Note that an original receipt will be provided from the office of the Marja within 15 working days.</p>";
standardReceiptEng += "<p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
standardReceiptEng += "</body>";
standardReceiptEng += "</html>";

var standardReceiptFrn = "<html style='font-family: sans-serif;'>";
standardReceiptFrn += "<body>";
standardReceiptFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
standardReceiptFrn += "    <p>A [DonarName]</p>";
standardReceiptFrn += "    <p>Salamun Alaykum,</p>";
standardReceiptFrn +=
  "    <p>Nous tenons à vous exprimer toute notre reconnaissance en ce qui concerne votre récent don.";
standardReceiptFrn +=
  "   <br>Veuillez trouver ci-joint un reçu en échange de votre générosité.";
standardReceiptFrn +=
  "   <br>Merci pour votre soutien continu et généreux.</p>";
standardReceiptFrn += "    <p>Qu'Allah accepte vos actions,";
standardReceiptFrn += "    <br>Najafyia Foundation</p>";
standardReceiptFrn += "<p style='display:[DSP]'>A titre indicatif : Nous ne sommes qu'un intermédiaire. Nous allons livrer les fonds fournis par vos soins au bureau du Marja respectif. Notez qu'un reçu original sera édité par le bureau du Marja dans les 15 jours ouvrables.</p>";
standardReceiptFrn += "<p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
standardReceiptFrn += "</body>";
standardReceiptFrn += "</html>";

var standardReceiptArb = "<html style='font-family: sans-serif;'>";
standardReceiptArb += "<head>";
standardReceiptArb += `<style>p{direction:rtl}</style>`;
standardReceiptArb += "</head>";
standardReceiptArb += "<body>";
standardReceiptArb += "    <p>[DonarName] الفاضل/ـة</p>";
standardReceiptArb += "    <p>السلام عليكم  ورحمة الله وبركاته</p>";
standardReceiptArb +=
  "    <p>نشكر لكم أياديكم الكريمة. مرفق مع الرسالة ايصال عن المبلغ الذي تبرعتم به </p>";
standardReceiptArb += "    <p>جعله الله في ميزان حسناتكم و زادكم توفيقا </p>";
standardReceiptArb += "    <p>مؤسسة الأنوار النجفية</p>";
standardReceiptArb += "<p style='display:[DSP]'>إخلاء طرف: نحن مجرد وسيط. سنقوم بتسليم الأموال إلى مكتب المرجع .و سيتم تقديم إيصال من مكتب المرجع خلال 15 يوم عمل.</p>";
standardReceiptArb += "<p style='font-size:12px;'> :ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على<a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
standardReceiptArb += "</body>";
standardReceiptArb += "</html>";

var signUpContentEng = "<html style='font-family: sans-serif;'>";
signUpContentEng += "<body>";
signUpContentEng +=
  "    <p>Thanks for registering at Najafyia Foundation Website! </p>";
signUpContentEng +=
  "    <p>To log in when visiting our site just click [LOGIN] ( link to login page) at the top of every page, and then enter your email address and password.</p>";
signUpContentEng +=
  "    <p>Use the following email address when prompted to log in:</p>";
signUpContentEng += "    <p>Email: [UserEmail]";
signUpContentEng +=
  "        <br>When you log in to your account, you will be able to do the following:</p>";
signUpContentEng +=
  "    <p>Donate to various causes and give Sadaqah more easily";
signUpContentEng += "    <br>View past donations and Sadaqahs";
signUpContentEng += "    <br>Make changes to your account information";
signUpContentEng += "    <br>Change your account password</p>";
signUpContentEng += "<p>If you have any questions, please feel free to contact us <a href='mailto:info@najafyia.org'>info@najafyia.org</a></p>";


signUpContentEng += "</body>";
signUpContentEng += "</html>";

var signUpContentFrn = "<html style='font-family: sans-serif;'>";
signUpContentFrn += "<body>";
signUpContentFrn +=
  "    <p>Félicitations, vous venez de créer votre compte sur le site web de la Najafyia Foundation ! </p>";
signUpContentFrn +=
  "    <p>Pour vous connecter sur le site web cliquez sur Se connecter [LOGIN] en haut de chaque page, puis tapez votre adresse mail et votre mot de passe.</p>";
signUpContentFrn += "    <p>Utilisez cette adresse pour vous connecter:</p>";
signUpContentFrn += "    <p>Email: [UserEmail]";
signUpContentFrn +=
  "        <br>En vous connectant à votre compte vous pourrez:</p>";
signUpContentFrn += "<ul>";
signUpContentFrn +=
  "    <li>Faire des dons pour differentes causes et donner le Sadaqah plus facilement.</li>";
signUpContentFrn +=
  "    <li>Voir vos donations précedentes et vos Sadaqahs passés.</li>";
signUpContentFrn +=
  "    <li>Faire des changements à vos informations de compte.</li>";
signUpContentFrn += "    <li>Changez votre mot de passe.</li>";
signUpContentFrn += "</ul>";
signUpContentFrn +=
  "    <p>Si vous avez d’autres questions n’hesitez pas à nous contacter sur <a href='mailto:info@najafyia.org'>info@najafyia.org</a></p>";
signUpContentFrn += "<p>Najafyia Foundation</p>";
signUpContentFrn += "</body>";
signUpContentFrn += "</html>";

var signUpContentArb = "<html style='font-family: sans-serif;'>";
signUpContentArb += "<head>";
signUpContentArb += `<style>p{direction:rtl}</style>`;
signUpContentArb += "</head>";
signUpContentArb += "<body>";
signUpContentArb += "    <p>شكرا لتسجيلكم في موقع المؤسسة</p>";
signUpContentArb +=
  "    <p>لتسجيل الدخول عند زيارتك لموقعنا انقر على الرابط الموجود أعلى الصفحة ثم أدخِل اسم المستخدم (بريدك الإلكتروني) وكلمة المرور [LOGIN]</p>";
signUpContentArb +=
  "    <p>عند تسجيل الدخول استخدم عنوان بريدك الإلكتروني المسجل (مثال: [UserEmail])</p>";
signUpContentArb += "    <p>عند تسجيل الدخول سيكون بإمكانك القيام بما يلي:</p>";
signUpContentArb +=
  "    <p>التبرع لإختيار متنوع من الأعمال الخيرية وإعطاء الصدقات";
signUpContentArb += "    <br>عرض تبرعاتك وصدقاتك السابقة";
signUpContentArb += "    <br>تحديث بيانات حسابك";
signUpContentArb += "    <br>تغيير كلمة المرور</p>";
signUpContentArb +=
  "    <p>للاستفسار والتواصل معنا راسلنا عبر بريدنا الإلكتروني: <a href='mailto:info@najafyia.org'>info@najafyia.org</a></p>";
signUpContentArb += "</body>";
signUpContentArb += "</html>";

var recPayGoneThroughEng = "<html style='font-family: sans-serif;'>";
recPayGoneThroughEng += "<body>";
recPayGoneThroughEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
recPayGoneThroughEng += "    <p>Dear [Name]</p>";
recPayGoneThroughEng += "    <p>Salamun Alaykum,</p>";
recPayGoneThroughEng +=
  "    <p>We would like to inform you that your recurring payment of [CURRSYM][AMOUNT] has been processed successfully.";
recPayGoneThroughEng +=
  "        <br>Kindly find the attached receipt of your generosity.";
recPayGoneThroughEng +=
  "        <br>Thank you for your continued and faithful support.</p>";
recPayGoneThroughEng += "    <p>May Allah accept your deeds.";
recPayGoneThroughEng += "    <br>Najafyia Foundation</p>";
recPayGoneThroughEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
recPayGoneThroughEng += "</body>";
recPayGoneThroughEng += "</html>";

var recPayGoneThroughFrn = "<html style='font-family: sans-serif;'>";
recPayGoneThroughFrn += "<body>";
recPayGoneThroughFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
recPayGoneThroughFrn += "    <p>A [Name]</p>";
recPayGoneThroughFrn += "    <p>Salamun Alaykum,</p>";
recPayGoneThroughFrn +=
  "    <p>Nous tenons à vous informer que votre paiement périodique de [CURRSYM][AMOUNT] a été traité avec succès.";
recPayGoneThroughFrn +=
  "    <br>Veuillez trouver ci-joint un reçu en échange de votre générosité.";
recPayGoneThroughFrn +=
  "    <br>Merci pour votre soutien continu et généreux.</p>";
recPayGoneThroughFrn += "    <p>Qu'Allah accepte vos actions,";
recPayGoneThroughFrn += "    <br>Najafyia Foundation</p>";
recPayGoneThroughFrn +=
  "    <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
recPayGoneThroughFrn += "</body>";
recPayGoneThroughFrn += "</html>";

var recPayGoneThroughArb = "<html style='font-family: sans-serif;'>";
recPayGoneThroughArb += "<head>";
recPayGoneThroughArb += `<style>p{direction:rtl}</style>`;
recPayGoneThroughArb += "</head>";
recPayGoneThroughArb += "<body>";
recPayGoneThroughArb += "    <p>[Name] الفاضل/ـة</p>";
recPayGoneThroughArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
recPayGoneThroughArb +=
  "    <p>نشكر لكم أياديكم الكريمة. مرفق مع الرسالة ايصال عن المبلغ الذي تبرعتم به</p>";
recPayGoneThroughArb += "    <p>جعله الله في ميزان حسناتكم و زادكم توفيقا</p>";
recPayGoneThroughArb += "    <p>مؤسسة الأنوار النجفية</p>";
recPayGoneThroughArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
recPayGoneThroughArb += "</body>";
recPayGoneThroughArb += "</html>";

var reminderPayDeducEng = "<html style='font-family: sans-serif;'>";
reminderPayDeducEng += "<body>";
reminderPayDeducEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
reminderPayDeducEng += "    <p>Dear [Name]</p>";
reminderPayDeducEng += "    <p>Salamun Alaykum,</p>";
reminderPayDeducEng +=
  "    <p>This is a humble reminder that your recurring payment of [CURRSYM][AMOUNT] is due. ";
reminderPayDeducEng +=
  "        <br>It will be deducted from your account in the next 48 hours. ";
reminderPayDeducEng +=
  "        <br>We would like to emphasize how grateful we are for your constant and sincere support.</p>";
reminderPayDeducEng += "    <p>May Allah accept your deeds.";
reminderPayDeducEng += "    <br>Najafyia Foundation</p>";
reminderPayDeducEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
reminderPayDeducEng += "</body>";
reminderPayDeducEng += "</html>";

var reminderPayDeducFrn = "<html style='font-family: sans-serif;'>";
reminderPayDeducFrn += "<body>";
reminderPayDeducFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
reminderPayDeducFrn += "    <p>A [Name]</p>";
reminderPayDeducFrn += "    <p>Salamun Alaykum,</p>";
reminderPayDeducFrn +=
  "    <p>Ceci est un humble rappel afin de vous informer que votre paiement périodique de [CURRSYM][AMOUNT] est dû.";
reminderPayDeducFrn +=
  "    <br>Il sera déduit de votre compte dans les prochaines 48 heures.";
reminderPayDeducFrn +=
  "    <br>Nous tenons à vous exprimer à quel point nous sommes reconnaissants de votre soutien constant et sincère.</p>";
reminderPayDeducFrn += "    <p>Qu'Allah accepte vos actions,";
reminderPayDeducFrn += "    <br>Najafyia Foundation</p>";
reminderPayDeducFrn +=
  "    <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
reminderPayDeducFrn += "</body>";
reminderPayDeducFrn += "</html>";

var reminderPayDeducArb = "<html style='font-family: sans-serif;'>";
reminderPayDeducArb += "<head>";
reminderPayDeducArb += `<style>p{direction:rtl}</style>`;
reminderPayDeducArb += "</head>";
reminderPayDeducArb += "<body>";
reminderPayDeducArb += "    <p>[Name] الفاضل / ـة </p>";
reminderPayDeducArb +=
  "    <p>نذكرك بأن موعد دفعتك المتكررة  [CURRSYM][AMOUNT] قد حان </p>";
reminderPayDeducArb +=
  "    <p>و سيتم خصمها من حسابك خلال الـ 48 ساعة القادمة.</p>";
reminderPayDeducArb += "    <p>السلام عليكم  ورحمة الله وبركاته</p>";
reminderPayDeducArb += "    <p>جعله الله في ميزان حسناتكم</p>";
reminderPayDeducArb += "    <p>وزادكم توفيقا</p>";
reminderPayDeducArb += "    <p>نعبر لك عن امتناننا لدعمك المتواصل</p>";
reminderPayDeducArb += "    <p>مؤسسة الأنوار النجفية</p>";
reminderPayDeducArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
reminderPayDeducArb += "</body>";
reminderPayDeducArb += "</html>";

var errRecPayEng = "<html style='font-family: sans-serif;'>";
errRecPayEng += "<body>";
errRecPayEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
errRecPayEng += "    <p>Dear [Name]</p>";
errRecPayEng += "    <p>Salamun Alaykum,</p>";
errRecPayEng +=
  "    <p>We regret to inform you that there has been an error processing your recurring payment.";
errRecPayEng +=
  "    <br>We would appreciate if this matter could be resolved at its earliest.";
errRecPayEng +=
  "    <br>We would like to emphasize how grateful we are for your constant and sincere support.</p>";
errRecPayEng +=
  "    <br>It is due to your generous support that we are able to help those in need.</p>";
errRecPayEng +=
  "    <br>Please do not hesitate to contact us (<a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>) for further assistance regarding this matter.</p>";
errRecPayEng += "    <p>May Allah accept your deeds.";
errRecPayEng += "    <br>Najafyia Foundation</p>";
errRecPayEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
errRecPayEng += "</body>";
errRecPayEng += "</html>";

var errRecPayFrn = "<html style='font-family: sans-serif;'>";
errRecPayFrn += "<body>";
errRecPayFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux";
errRecPayFrn += "    <p>A [Name]</p>";
errRecPayFrn += "    <p>Salamun Alaykum,</p>";
errRecPayFrn +=
  "    <p>Nous avons le regret de vous informer qu'une erreur s'est produite lors du traitement de votre paiement périodique.";
errRecPayFrn +=
  "        <br>Nous apprécierons que cette question puisse être résolue au plus tôt.";
errRecPayFrn +=
  "        <br>C'est grâce à votre généreux soutien que nous sommes dans la possibilité d'aider les personnes dans le besoin.";
errRecPayFrn +=
  "        <br>N'hésitez pas à nous contacter (<a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>) pour obtenir une aide supplémentaire à ce sujet.";
errRecPayFrn += "    </p>";
errRecPayFrn += "    <p>Qu'Allah accepte vos actions,";
errRecPayFrn += "    <br>Najafyia Foundation</p>";
errRecPayFrn +=
  "    <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
errRecPayFrn += "</body>";
errRecPayFrn += "</html>";

var errRecPayArb = "<html style='font-family: sans-serif;'>";
errRecPayArb += "<head>";
errRecPayArb += `<style>p{direction:rtl}</style>`;
errRecPayArb += "</head>";
errRecPayArb += "<body>";
errRecPayArb += "    <p>[Name] الفاضل / ـة</p>";
errRecPayArb += "    <p>السلام عليكم  ورحمة الله وبركاته</p>";
errRecPayArb +=
  "    <p>.نعلمكم بأن الدفع المتكرر من حسابكم قد تم رفضه، نرجو أن يتم حل الإشكال بأقرب وقت ممكن</p>";
errRecPayArb +=
  "    <p>ايايكم الكريمة و دعمكم لنا يعيننا على مساعدة المحتاجين</p>";
errRecPayArb +=
  "    <p>لا تتردد في التواصل معنا عبر invoice@najafyia.org للمزيد من المساعدة بخصوص هذا الأمر.";
errRecPayArb += "    <brزادكم الله توفيقا </p>";
errRecPayArb += "    <br.مؤسسة الأنوار النجيفية</p>";
errRecPayArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
errRecPayArb += "</body>";
errRecPayArb += "</html>";

var recNonPayAfter30Eng = "<html style='font-family: sans-serif;'>";
recNonPayAfter30Eng += "<body>";
recNonPayAfter30Eng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
recNonPayAfter30Eng += "    <p>Dear [Name]</p>";
recNonPayAfter30Eng += "    <p>Salamun Alaykum,</p>";
recNonPayAfter30Eng +=
  "    <p>We regret to inform you that your last recurring payment is still due.";
recNonPayAfter30Eng +=
  "    <br>Under unfortunate circumstances, we will have to cancel your sponsorship if the payment is not renewed within 48 hours.";
recNonPayAfter30Eng +=
  "    <br>We are happy to work with you in order to keep this sponsorship. If you are interested in continuing or would like to set up a new sponsorship, please do not hesitate to contact us for further assistance at <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>. </p>";
recNonPayAfter30Eng += "    <p>May Allah accept your deeds.";
recNonPayAfter30Eng += "    <br>Najafyia Foundation</p>";
recNonPayAfter30Eng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
recNonPayAfter30Eng += "</body>";
recNonPayAfter30Eng += "</html>";

var recNonPayAfter30Frn = "<html style='font-family: sans-serif;'>";
recNonPayAfter30Frn += "<body>";
recNonPayAfter30Frn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
recNonPayAfter30Frn += "    <p>A [Name]</p>";
recNonPayAfter30Frn += "    <p>Salamun Alaykum,</p>";
recNonPayAfter30Frn +=
  "    <p>Nous avons le regret de vous informer que votre dernier paiement périodique est toujours dû.";
recNonPayAfter30Frn +=
  "        <br>En raison de malheureuses circonstances, nous allons devoir annuler votre parrainage si le paiement n'est pas réglé dans les 48 heures. ";
recNonPayAfter30Frn +=
  "        <br>Nous sommes heureux de travailler avec vous afin de conserver ce parrainage. Si vous souhaiter poursuivre ou si vous souhaitez créer un nouveau parrainage, n'hésitez pas à nous contacter pour une assistance supplémentaire (<a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>)</p>";
recNonPayAfter30Frn += "    <p>Qu'Allah accepte vos actions,";
recNonPayAfter30Frn += "        <br>Najafyia Foundation</p>";
recNonPayAfter30Frn +=
  "    <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
recNonPayAfter30Frn += "</body>";
recNonPayAfter30Frn += "</html>";

var recNonPayAfter30Arb = "<html style='font-family: sans-serif;'>";
recNonPayAfter30Arb += "<head>";
recNonPayAfter30Arb += `<style>p{direction:rtl}</style>`;
recNonPayAfter30Arb += "</head>";
recNonPayAfter30Arb += "<body>";
recNonPayAfter30Arb +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
recNonPayAfter30Arb += "    <p>[Name] إلى: الفاضل / ـة</p>";
recNonPayAfter30Arb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
recNonPayAfter30Arb +=
  "    <p>يؤسفنا ابلاغك أن دفعتك المتكررة ما زالت لم تدفع، وفي حال عدم التسديد في في غضون 48 ساعة سوف ";
recNonPayAfter30Arb += "        <br>.يتم إلغاء كفالتك";
recNonPayAfter30Arb +=
  "        <br>يسعدنا التعاون معك للعمل على استمرار الكفالة. في حال رغبتك بالاستمرار أو البدء بكفالة جديدة لا تتردد </p>";
recNonPayAfter30Arb += "    <p>في التواصل معنا على  invoice@najafyia.org";
recNonPayAfter30Arb += "    <br>زادكم الله توفيقا</p>";
recNonPayAfter30Arb += "        <br>.مؤسسة الأنوارالنجيفية</p>";
recNonPayAfter30Arb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
recNonPayAfter30Arb += "</body>";
recNonPayAfter30Arb += "</html>";

var assignOrp2AnotherDnrEng = "<html style='font-family: sans-serif;'>";
assignOrp2AnotherDnrEng += "<body>";
assignOrp2AnotherDnrEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
assignOrp2AnotherDnrEng += "    <p>Dear [Name]</p>";
assignOrp2AnotherDnrEng += "    <p>Salamun Alaykum,</p>";
assignOrp2AnotherDnrEng +=
  "    <p>We have previously notified you regarding non-payment of your basic care orphan sponsorship, and since there has been no resolution regarding this matter we will have to assign your orphan to another donor.";
assignOrp2AnotherDnrEng +=
  "        <br>However, it is due to your financial support that we are able to bring smiles on these orphans’ faces. Therefore if you wish to sponsor another orphan, kindly visit [link]";
assignOrp2AnotherDnrEng += "        </p>";
assignOrp2AnotherDnrEng += "    <p>May Allah accept your deeds.";
assignOrp2AnotherDnrEng += "        <br>Najafyia Foundation</p>";
assignOrp2AnotherDnrEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
assignOrp2AnotherDnrEng += "</body>";
assignOrp2AnotherDnrEng += "</html>";

var assignOrp2AnotherDnrFrn = "<html style='font-family: sans-serif;'>";
assignOrp2AnotherDnrFrn += "<body>";
assignOrp2AnotherDnrFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
assignOrp2AnotherDnrFrn += "    <p>A [Name]</p>";
assignOrp2AnotherDnrFrn += "    <p>Salamun Alaykum,</p>";
assignOrp2AnotherDnrFrn +=
  "    <p>Nous vous avons précédemment informé du non-paiement de votre parrainage concernant votre orphelin Basic Care et en l'absence de solution à ce problème, nous allons devoir affecter votre orphelin à un autre donateur.";
assignOrp2AnotherDnrFrn +=
  "        <br>Toutefois, c'est grâce à votre soutien financier que nous sommes en mesure de faire sourire des orphelins. Ainsi, si vous souhaitez parrainer un autre orphelin, nous vous invitons à visiter ce lien [lien]";
assignOrp2AnotherDnrFrn += "        </p>";
assignOrp2AnotherDnrFrn += "    <p>Qu'Allah accepte vos actions,";
assignOrp2AnotherDnrFrn += "        <br>Najafyia Foundation</p>";
assignOrp2AnotherDnrFrn +=
  "<p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
assignOrp2AnotherDnrFrn += "</body>";
assignOrp2AnotherDnrFrn += "</html>";

var assignOrp2AnotherDnrArb = "<html style='font-family: sans-serif;'>";
assignOrp2AnotherDnrArb += "<head>";
assignOrp2AnotherDnrArb += `<style>p{direction:rtl}</style>`;
assignOrp2AnotherDnrArb += "</head>";
assignOrp2AnotherDnrArb += "<body>";
assignOrp2AnotherDnrArb += "    <p>[Name] إلى: الفاضل / ـة</p>";
assignOrp2AnotherDnrArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
assignOrp2AnotherDnrArb +=
  "    <p>كما أعلمناكم سابقا بخصوص عدم الدفع لكفالة اليتيم (الأساسية). ولأنه لم يتم حل الإشكال بخصوص هذا ";
assignOrp2AnotherDnrArb +=
  "        <br>.الموضوع فإن اليتيم الذي كان على كفالتكم سيعين له كفيل آخر";
assignOrp2AnotherDnrArb +=
  "        <br>أياديكم الكريمة تجلب السعادة لهؤلاء الأيتام. في حال رغبت في كفالة يتيم أخر يرجى زيارة (رابط)</p>";
assignOrp2AnotherDnrArb += "    <p>زادكم الله توفيقا";
assignOrp2AnotherDnrArb += "        <br>مؤسسة الأنوار النجيفية</p>";
assignOrp2AnotherDnrArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
assignOrp2AnotherDnrArb += "</body>";
assignOrp2AnotherDnrArb += "</html>";

var autoRenew48ReminderEng = "<html style='font-family: sans-serif;'>";
autoRenew48ReminderEng += "<body>";
autoRenew48ReminderEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
autoRenew48ReminderEng += "    <p>Dear [Name]</p>";
autoRenew48ReminderEng += "    <p>Salamun Alaykum,</p>";
autoRenew48ReminderEng +=
  "    <p>We would like to inform you that your auto-renewal payment will be processed.";
autoRenew48ReminderEng +=
  "    <br>It will be deducted from your account in the next 48 hours.";
autoRenew48ReminderEng +=
  "    <br>We would like to emphasize how grateful we are for your continuous and faithful support.</p>";
autoRenew48ReminderEng += "    <p>May Allah accept your deeds.";
autoRenew48ReminderEng += "    <br>Najafyia Foundation</p>";
autoRenew48ReminderEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
autoRenew48ReminderEng += "</body>";
autoRenew48ReminderEng += "</html>";

var autoRenew48ReminderFrn = "<html style='font-family: sans-serif;'>";
autoRenew48ReminderFrn += "<body>";
autoRenew48ReminderFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
autoRenew48ReminderFrn += "    <p>A [Name]</p>";
autoRenew48ReminderFrn += "    <p>Salamun Alaykum,</p>";
autoRenew48ReminderFrn +=
  "    <p>Nous tenons à vous informer que votre paiement de renouvellement automatique sera traité.";
autoRenew48ReminderFrn +=
  "        <br>Il sera déduit de votre compte dans les prochaines 48 heures.";
autoRenew48ReminderFrn +=
  "        <br>Nous souhaitons vous exprimer toute notre reconnaissance face à votre soutien continu et fidèle.</p>";
autoRenew48ReminderFrn += "    <p>Qu'Allah accepte vos actions,";
autoRenew48ReminderFrn += "         <br>Najafyia Foundation</p>";
autoRenew48ReminderFrn +=
  "     <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
autoRenew48ReminderFrn += "</body>";
autoRenew48ReminderFrn += "</html>";

var autoRenew48ReminderArb = "<html style='font-family: sans-serif;'>";
autoRenew48ReminderArb += "<head>";
autoRenew48ReminderArb += `<style>p{direction:rtl}</style>`;
autoRenew48ReminderArb += "</head>";
autoRenew48ReminderArb += "<body>";
autoRenew48ReminderArb += "    <p>إلى: الفاضل / ـة</p>";
autoRenew48ReminderArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
autoRenew48ReminderArb +=
  "    <p> هذا لنعلمكم أن موعد التجديد التلقائي قد حان و سوف يقتطع المبلغ المخصص من حسابك خلال 48 ساعة ";
autoRenew48ReminderArb += "        <br>.القادمة";
autoRenew48ReminderArb += "        <br>نشكر لكم أياديكم الكريمة</p>";
autoRenew48ReminderArb += "    <p>زادكم الله توفيقا";
autoRenew48ReminderArb += "        <br>مؤسسة الأنوار النجفية </p>";
autoRenew48ReminderArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
autoRenew48ReminderArb += "</body>";
autoRenew48ReminderArb += "</html>";

var autoRenewThroughEng = "<html style='font-family: sans-serif;'>";
autoRenewThroughEng += "<body>";
autoRenewThroughEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
autoRenewThroughEng += "    <p>Dear [Name]</p>";
autoRenewThroughEng += "    <p>Salamun Alaykum,</p>";
autoRenewThroughEng +=
  "    <p>We would like to inform you that payment of [CURRSYM][AMOUNT] has been processed successfully. ";
autoRenewThroughEng +=
  "    <br>Kindly find the attached receipt of generosity.";
autoRenewThroughEng +=
  "    <br>Thank you for your continued and faithful support.</p>";
autoRenewThroughEng += "    <p>May Allah accept your deeds.";
autoRenewThroughEng += "    <br>Najafyia Foundation</p>";
autoRenewThroughEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
autoRenewThroughEng += "</body>";
autoRenewThroughEng += "</html>";

var autoRenewThroughFrn = "<html style='font-family: sans-serif;'>";
autoRenewThroughFrn += "<body>";
autoRenewThroughFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
autoRenewThroughFrn += "    <p>A [Name]</p>";
autoRenewThroughFrn += "    <p>Salamun Alaykum,</p>";
autoRenewThroughFrn +=
  "    <p>Nous tenons à vous informer que le paiement de [CURRSYM][AMOUNT] a été traité avec succès.";
autoRenewThroughFrn +=
  "        <br>Veuillez trouver ci-joint un reçu en échange votre générosité.";
autoRenewThroughFrn +=
  "        <br>Merci pour votre soutien continu et fidèle.</p>";
autoRenewThroughFrn += "    <p>Qu'Allah accepte vos actions,";
autoRenewThroughFrn += "        <br>Najafyia Foundation</p>";
autoRenewThroughFrn +=
  "     <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
autoRenewThroughFrn += "</body>";
autoRenewThroughFrn += "</html>";

var autoRenewThroughArb = "<html style='font-family: sans-serif;'>";
autoRenewThroughArb += "<head>";
autoRenewThroughArb += `<style>p{direction:rtl}</style>`;
autoRenewThroughArb += "</head>";
autoRenewThroughArb += "<body>";
autoRenewThroughArb += "    <p>إلى: الفاضل / ـة</p>";
autoRenewThroughArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
autoRenewThroughArb += "    <p>.مرفق مع الرسالة إيصال عن المبلغ الذي تبرعتم به";
autoRenewThroughArb +=
  "    <p>هذا لنعلمكم أن التجديد التلقائي لـ [CURRSYM][AMOUNT] قد تم بنجاح";
autoRenewThroughArb += "        <br>نشكر لكم أياديكم الكريمة";
autoRenewThroughArb += "        <br>زادكم الله توفيقا </p>";
autoRenewThroughArb += "        <p>مؤسسة الأنوار النجيفية</p>";
autoRenewThroughArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
autoRenewThroughArb += "</body>";
autoRenewThroughArb += "</html>";

var autoRenewPayNotThroughEng = "<html style='font-family: sans-serif;'>";
autoRenewPayNotThroughEng += "<body>";
autoRenewPayNotThroughEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
autoRenewPayNotThroughEng += "    <p>Dear [Name]</p>";
autoRenewPayNotThroughEng += "    <p>Salamun Alaykum,</p>";
autoRenewPayNotThroughEng +=
  "    <p>We would like to inform you that there has been an error processing your auto renewal.";
autoRenewPayNotThroughEng +=
  "    <br>We would appreciate if this matter could be resolved at its earliest. ";
autoRenewPayNotThroughEng +=
  "    <br>It is due to your generous support that we are able to help those in need.";
autoRenewPayNotThroughEng +=
  "    <br>Please do not hesitate to contact us at <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a> for further assistance regarding this matter.</p>";
autoRenewPayNotThroughEng += "    <p>May Allah accept your deeds.";
autoRenewPayNotThroughEng += "    <br>Najafyia Foundation</p>";
autoRenewPayNotThroughEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
autoRenewPayNotThroughEng += "</body>";
autoRenewPayNotThroughEng += "</html>";

var autoRenewPayNotThroughFrn = "<html style='font-family: sans-serif;'>";
autoRenewPayNotThroughFrn += "<body>";
autoRenewPayNotThroughFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
autoRenewPayNotThroughFrn += "    <p>A [Name]</p>";
autoRenewPayNotThroughFrn += "    <p>Salamun Alaykum,</p>";
autoRenewPayNotThroughFrn +=
  "    <p>Nous souhaitons vous informer qu'une erreur s'est produite lors du traitement de votre renouvellement automatique.";
autoRenewPayNotThroughFrn +=
  "        <br>Nous apprécierons que cette question puisse être résolue au plus tôt.";
autoRenewPayNotThroughFrn +=
  "        <br>C'est grâce à votre généreux soutien que nous pouvons venir en aide aux personnes dans le besoin.";
autoRenewPayNotThroughFrn +=
  "        <br>N'hésitez pas à nous contacter (<a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>) pour obtenir une aide supplémentaire à ce sujet.";
autoRenewPayNotThroughFrn += "     </p>";
autoRenewPayNotThroughFrn += "    <p>Qu'Allah accepte vos actions,";
autoRenewPayNotThroughFrn += "        <br>Najafyia Foundation</p>";
autoRenewPayNotThroughFrn +=
  "     <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
autoRenewPayNotThroughFrn += "</body>";
autoRenewPayNotThroughFrn += "</html>";

var autoRenewPayNotThroughArb = "<html style='font-family: sans-serif;'>";
autoRenewPayNotThroughArb += "<head>";
autoRenewPayNotThroughArb += `<style>p{direction:rtl}</style>`;
autoRenewPayNotThroughArb += "</head>";
autoRenewPayNotThroughArb += "<body>";
autoRenewPayNotThroughArb += "    <p>إلى: الفاضل / ـة</p>";
autoRenewPayNotThroughArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
autoRenewPayNotThroughArb +=
  "    <p>.نعلمكم بأن التجديد التلقائي من حسابكم قد تم رفضه، نرجو أن يتم حل الإشكال بأقرب وقت ممكن";
autoRenewPayNotThroughArb +=
  "        <br>ايايكم الكريمة و دعمكم لنا يعيننا على مساعدة المحتاجين";
autoRenewPayNotThroughArb +=
  "        <br>لا تتردد في التواصل معنا عبر invoice@najafyia.org للمزيد من المساعدة بخصوص هذا الأمر.</p>";
autoRenewPayNotThroughArb += "    <p>Mزادكم الله توفيقا";
autoRenewPayNotThroughArb += "        <br>مؤسسة الأنوار النجيفية</p>";
autoRenewPayNotThroughArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
autoRenewPayNotThroughArb += "</body>";
autoRenewPayNotThroughArb += "</html>";

var orpAssign2OtherOrpDazEng = "<html style='font-family: sans-serif;'>";
orpAssign2OtherOrpDazEng += "<body>";
orpAssign2OtherOrpDazEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
orpAssign2OtherOrpDazEng += "    <p>Dear [Name]</p>";
orpAssign2OtherOrpDazEng += "    <p>Salamun Alaykum,</p>";
orpAssign2OtherOrpDazEng +=
  "    <p>We have previously notified you regarding non-payment of your education sponsorship and since there has been no resolution regarding this matter, we will have to assign your orphan to another donor.";
orpAssign2OtherOrpDazEng +=
  "    <br>However, it is due to your financial support that we are able to bring smiles on these orphans’ faces. Therefore if you wish to sponsor another orphan, kindly visit [link]";
orpAssign2OtherOrpDazEng += "    </p>";
orpAssign2OtherOrpDazEng += "    <p>May Allah accept your deeds.";
orpAssign2OtherOrpDazEng += "    <br>Najafyia Foundation</p>";
orpAssign2OtherOrpDazEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
orpAssign2OtherOrpDazEng += "</body>";
orpAssign2OtherOrpDazEng += "</html>";

var orpAssign2OtherOrpDazFrn = "<html style='font-family: sans-serif;'>";
orpAssign2OtherOrpDazFrn += "<body>";
orpAssign2OtherOrpDazFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
orpAssign2OtherOrpDazFrn += "    <p>A [Name]</p>";
orpAssign2OtherOrpDazFrn += "    <p>Salamun Alaykum,</p>";
orpAssign2OtherOrpDazFrn +=
  "    <p>Nous vous avons précédemment informé du non-paiement de votre parrainage pour l'éducation et, en l'absence de solution face à ce problème, nous allons devoir affecter votre orphelin à un autre donnateur.";
orpAssign2OtherOrpDazFrn +=
  "        <br>C'est toutefois grâce à votre soutien financier que nous sommes dans la possibilité de faire sourire des orphelins. Ainsi, si vous souhaitez parrainer un autre orphelin, nous vous invitons à visiter le site [lien].";
orpAssign2OtherOrpDazFrn += "    </p>";
orpAssign2OtherOrpDazFrn += "    <p>Qu'Allah accepte vos actions,";
orpAssign2OtherOrpDazFrn += "        <br>Najafyia Foundation</p>";
orpAssign2OtherOrpDazFrn +=
  "    <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
orpAssign2OtherOrpDazFrn += "</body>";
orpAssign2OtherOrpDazFrn += "</html>";

var orpAssign2OtherOrpDazArb = "<html style='font-family: sans-serif;'>";
orpAssign2OtherOrpDazArb += "<head>";
orpAssign2OtherOrpDazArb += `<style>p{direction:rtl}</style>`;
orpAssign2OtherOrpDazArb += "</head>";
orpAssign2OtherOrpDazArb += "<body>";
orpAssign2OtherOrpDazArb += "    <p>إلى: الفاضل / ـة</p>";
orpAssign2OtherOrpDazArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
orpAssign2OtherOrpDazArb +=
  "    <p>كما أعلمناكم سابقا بخصوص عدم الدفع لكفالة اليتيم (التعليمية). ولأنه لم يتم حل الإشكال بخصوص هذا ";
orpAssign2OtherOrpDazArb +=
  "        <br>الموضوع فإن اليتيم الذي كان على كفالتكم سيعين له كفيل آخر";
orpAssign2OtherOrpDazArb +=
  "        <br>أياديكم الكريمة تجلب السعادة لهؤلاء الأيتام. في حال رغبت في كفالة يتيم أخر يرجى زيارة (رابط)</p>";
orpAssign2OtherOrpDazArb += "    <p>زادكم الله توفيقا";
orpAssign2OtherOrpDazArb += "        <br>مؤسسة الأنوار النجيفية</p>";
orpAssign2OtherOrpDazArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
orpAssign2OtherOrpDazArb += "</body>";
orpAssign2OtherOrpDazArb += "</html>";

var recPay48NoticeEng = "<html style='font-family: sans-serif;'>";
recPay48NoticeEng += "<body>";
recPay48NoticeEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
recPay48NoticeEng += "    <p>Dear [Name]</p>";
recPay48NoticeEng += "    <p>Salamun Alaykum,</p>";
recPay48NoticeEng +=
  "    <p>We wish to inform you that your last recurring payment is still due. Under unfortunate circumstances, we will need to cancel your sponsorship if action is not taken within 48 hours.";
recPay48NoticeEng +=
  "    <br>It is due to your generous support that we are able to help those in need and we are happy to work with you in order to keep this sponsorship.";
recPay48NoticeEng +=
  "    <br>If you are interested in continuing or would like to set up another sponsorship, please do not hesitate to contact us for further assistance or queries.</p>";
recPay48NoticeEng += "    <p>May Allah accept your deeds.";
recPay48NoticeEng += "    <br>Najafyia Foundation</p>";
recPay48NoticeEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
recPay48NoticeEng += "</body>";
recPay48NoticeEng += "</html>";

var recPay48NoticeFrn = "<html style='font-family: sans-serif;'>";
recPay48NoticeFrn += "<body>";
recPay48NoticeFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
recPay48NoticeFrn += "    <p>A [Name]</p>";
recPay48NoticeFrn += "    <p>Salamun Alaykum,</p>";
recPay48NoticeFrn +=
  "    <p>Nous avons le regret de vous informer que votre dernier paiement périodique est toujours dû.";
recPay48NoticeFrn +=
  "        <br>En raison de malheureuses circonstances, nous allons devoir annuler votre parrainage si le paiement n'est pas réglé dans les 48 heures. ";
recPay48NoticeFrn +=
  "        <br>C’est grâce à votre généreux soutien que nous avons la possibilité d’aider les personnes dans le besoin et nous sommes heureux de travailler avec vous pour conserver ce parrainage.";
recPay48NoticeFrn +=
  "        <br>Si vous souhaiter poursuivre ou si vous souhaitez créer un nouveau parrainage, n'hésitez pas à nous contacter pour une assistance supplémentaire (<a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>)";
recPay48NoticeFrn += "        </p>";
recPay48NoticeFrn += "    <p>Qu'Allah accepte vos actions,";
recPay48NoticeFrn += "        <br>Najafyia Foundation</p>";
recPay48NoticeFrn +=
  "    <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
recPay48NoticeFrn += "</body>";
recPay48NoticeFrn += "</html>";

var recPay48NoticeArb = "<html style='font-family: sans-serif;'>";
recPay48NoticeArb += "<head>";
recPay48NoticeArb += `<style>p{direction:rtl}</style>`;
recPay48NoticeArb += "</head>";
recPay48NoticeArb += "<body>";
recPay48NoticeArb += "    <p>إلى: الفاضل / ـة</p>";
recPay48NoticeArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
recPay48NoticeArb +=
  "    <p>يؤسفنا ابلاغك أن دفعتك المتكررة ما زالت لم تدفع، وفي حال عدم التسديد في في غضون 48 ساعة سوف ";
recPay48NoticeArb += "        <br>.يتم إلغاء كفالتك";
recPay48NoticeArb +=
  "        <br>يسعدنا التعاون معك للعمل على استمرار الكفالة. في حال رغبتك بالاستمرار أو البدء بكفالة جديدة لا تتردد </p>";
recPay48NoticeArb += "    <p>في التواصل معنا على  invoice@najafyia.org</p>";
recPay48NoticeArb +=
  "        <p>زادكم الله توفيقا<br>مؤسسة الأنوارالنجيفية</p>";
recPay48NoticeArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
recPay48NoticeArb += "</body>";
recPay48NoticeArb += "</html>";

var autoRenewCorrectEng = "<html style='font-family: sans-serif;'>";
autoRenewCorrectEng += "<body>";
autoRenewCorrectEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
autoRenewCorrectEng += "    <p>Dear [Name]</p>";
autoRenewCorrectEng += "    <p>Salamun Alaykum,</p>";
autoRenewCorrectEng +=
  "    <p>We wish to inform you that there has been an error processing your Auto-renewal payment.";
autoRenewCorrectEng +=
  "    <br>We would appreciate if this matter could be resolved at its earliest.";
autoRenewCorrectEng +=
  "    <br>It is due to your generous support that we are able to help those in need.";
autoRenewCorrectEng +=
  "    <br>We are happy to work with you in order to resolve this problem. Please do not hesitate to contact us for further assistance regarding this matter.</p>";
autoRenewCorrectEng += "    <p>May Allah accept your deeds.";
autoRenewCorrectEng += "    <br>Najafyia Foundation</p>";
autoRenewCorrectEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
autoRenewCorrectEng += "</body>";
autoRenewCorrectEng += "</html>";

var autoRenewCorrectFrn = "<html style='font-family: sans-serif;'>";
autoRenewCorrectFrn += "<body>";
autoRenewCorrectFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
autoRenewCorrectFrn += "    <p>A [Name]</p>";
autoRenewCorrectFrn += "    <p>Salamun Alaykum,</p>";
autoRenewCorrectFrn +=
  "    <p>Nous souhaitons vous informer qu'une erreur s'est produite lors du traitement de votre paiement de renouvellement automatique. Nous apprécierons que cette question puisse être résolue au plus tôt.";
autoRenewCorrectFrn +=
  "        <br>C'est grâce à votre généreux soutien que nous sommes dans la possibilité d'aider les personnes dans le besoin.";
autoRenewCorrectFrn +=
  "        <br>Nous sommes heureux de travailler avec vous afin de résoudre ce problème. S'il vous plaît, n'hésitez pas à nous contacter pour toute assistance supplémentaire à ce sujet.</p>";
autoRenewCorrectFrn += "    <p>Qu'Allah accepte vos actions,";
autoRenewCorrectFrn += "        <br>Najafyia Foundation</p>";
autoRenewCorrectFrn +=
  "    <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
autoRenewCorrectFrn += "</body>";
autoRenewCorrectFrn += "</html>";

var autoRenewCorrectArb = "<html style='font-family: sans-serif;'>";
autoRenewCorrectArb += "<head>";
autoRenewCorrectArb += `<style>p{direction:rtl}</style>`;
autoRenewCorrectArb += "</head>";
autoRenewCorrectArb += "<body>";
autoRenewCorrectArb += "    <p>إلى: الفاضل / ـة</p>";
autoRenewCorrectArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
autoRenewCorrectArb +=
  "    <p.نعلمكم بأن التجديد التلقائي من حسابكم قد تم رفضه، نرجو أن يتم حل الإشكال بأقرب وقت ممكن";
autoRenewCorrectArb +=
  "        <br>ايايكم الكريمة و دعمكم لنا يعيننا على مساعدة المحتاجين";
autoRenewCorrectArb +=
  "        <br>لا تتردد في التواصل معنا عبر invoice@najafyia.org للمزيد من المساعدة بخصوص هذا الأمر.</p>";
autoRenewCorrectArb += "    <p>زادكم الله توفيقا";
autoRenewCorrectArb += "        <br>مؤسسة الأنوار النجيفية</p>";
autoRenewCorrectArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
autoRenewCorrectArb += "</body>";
autoRenewCorrectArb += "</html>";

var hawzaStuAutoRenewEng = "<html style='font-family: sans-serif;'>";
hawzaStuAutoRenewEng += "<body>";
hawzaStuAutoRenewEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
hawzaStuAutoRenewEng += "    <p>Dear [Name]</p>";
hawzaStuAutoRenewEng += "    <p>Salamun Alaykum,</p>";
hawzaStuAutoRenewEng +=
  "    <p>We would like to inform you that payment of [CURRSYM][AMOUNT] has gone through successfully. We would like to thank you for the auto-renewal for the <i>Hawzah</i> student. ";
hawzaStuAutoRenewEng +=
  "    <br>Your financial support helps us thrive in our mission and we are forever indebted to you for your support.";
hawzaStuAutoRenewEng +=
  "    <br>Kindly find the attached receipt of your generosity.";
hawzaStuAutoRenewEng +=
  "    <br>If you have any further queries or require any clarification, we will be happy to assist.</p>";
hawzaStuAutoRenewEng += "    <p>May Allah accept your deeds.";
hawzaStuAutoRenewEng += "    <br>Najafyia Foundation</p>";
hawzaStuAutoRenewEng +=
  "    <p style='font-size:12px;'>Note: This is an auto generated email. Do not reply to this email. If you have any queries contact <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
hawzaStuAutoRenewEng += "</body>";
hawzaStuAutoRenewEng += "</html>";

var hawzaStuAutoRenewFrn = "<html style='font-family: sans-serif;'>";
hawzaStuAutoRenewFrn += "<body>";
hawzaStuAutoRenewFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
hawzaStuAutoRenewFrn += "    <p>A [Name]</p>";
hawzaStuAutoRenewFrn += "    <p>Salamun Alaykum,</p>";
hawzaStuAutoRenewFrn +=
  "    <p>Nous tenons à vous informer que le paiement de [CURRSYM][AMOUNT] a été effectué avec succès. Nous aimerions vous remercier pour le renouvellement automatique concernant les étudiants du Hawza.";
hawzaStuAutoRenewFrn +=
  "        <br>Votre soutien financier nous aide à poursuivre notre mission et nous vous en sommes toujours redevables.";
hawzaStuAutoRenewFrn +=
  "        <br>Veuillez trouver ci-joint un reçu en échange de votre générosité.";
hawzaStuAutoRenewFrn +=
  "        <br>Si vous avez d'autres questions ou si vous avez besoin de précisions, nous nous ferons un plaisir de vous aider.</p>";
hawzaStuAutoRenewFrn += "    <p>Qu'Allah accepte vos actions,";
hawzaStuAutoRenewFrn += "        <br>Najafyia Foundation</p>";
hawzaStuAutoRenewFrn +=
  "    <p style='font-size:12px;'>Note : Ceci est un email généré automatiquement. Ne répondez pas à cet email. SI vous avez des questions, contactez : <a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a></p>";
hawzaStuAutoRenewFrn += "</body>";
hawzaStuAutoRenewFrn += "</html>";

var hawzaStuAutoRenewArb = "<html style='font-family: sans-serif;'>";
hawzaStuAutoRenewArb += "<head>";
hawzaStuAutoRenewArb += `<style>p{direction:rtl}</style>`;
hawzaStuAutoRenewArb += "</head>";
hawzaStuAutoRenewArb += "<body>";
hawzaStuAutoRenewArb += "    <p>إلى: الفاضل / ـة</p>";
hawzaStuAutoRenewArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
hawzaStuAutoRenewArb +=
  "    <pهذا لنعلمكم أن التجديد التلقائي لـ [CURRSYM][AMOUNT] قد تم بنجاح. ";
hawzaStuAutoRenewArb +=
  "        <br>.مرفق مع الرسالة إيصال عن المبلغ الذي تبرعتم به";
hawzaStuAutoRenewArb += "        <br>نشكر كفالتكم لطالب الحوزة</p>";
hawzaStuAutoRenewArb += "    <pزادكم الله توفيقا ";
hawzaStuAutoRenewArb += "        <br>مؤسسة الأنوار النجيفية</p>";
hawzaStuAutoRenewArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
hawzaStuAutoRenewArb += "</body>";
hawzaStuAutoRenewArb += "</html>";

var days30ByeByeEng = "<html style='font-family: sans-serif;'>";
days30ByeByeEng += "<body>";
days30ByeByeEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
days30ByeByeEng += "    <p>Dear [Name]</p>";
days30ByeByeEng +=
  "    <p>Unfortunately, we would like to inform you that since it has been 30 days and your payment is still outstanding, we are now cancelling your <i>Hawzah</i> Student Sponsorship due to the missed payment.";
days30ByeByeEng +=
  "    <br>However, it is due to your generous support that we are able to help these students so if you would like to sponsor another <i>hawzah</i> student, kindly visit the link below:";
days30ByeByeEng +=
  "    <br>If there are any queries, please feel free to contact us.";
days30ByeByeEng += "    </p>";
days30ByeByeEng += "    <p>May Allah accept your deeds.";
days30ByeByeEng += "    <br>Najafyia Foundation</p>";
days30ByeByeEng += "</body>";
days30ByeByeEng += "</html>";

var days30ByeByeFrn = "<html style='font-family: sans-serif;'>";
days30ByeByeFrn += "<body>";
days30ByeByeFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
days30ByeByeFrn += "    <p>A [Name]</p>";
days30ByeByeFrn +=
  "    <p>Nous voudrions malheureusement vous informer que comme cela fait 30 jours que votre paiement n'a pas été réglé, nous devons donc annuler votre parrainage concernant les étudiants en Hawza en raison de non-paiement.";
days30ByeByeFrn +=
  "    <br>Nous tenons tout de même à vous informer que c'est grâce à votre généreux soutien que nous sommes en mesure d'aider ces étudiants. SI vous souhaitez parrainer un autre étudiant de Hawza, veuillez visiter le lien ci-dessous : ";
days30ByeByeFrn +=
  "    <br>Si vous avez des questions, n'hésitez pas à nous contacter.";
days30ByeByeFrn += "    </p>";
days30ByeByeFrn += "    <p>Qu'Allah accepte vos actions,";
days30ByeByeFrn += "    <br>Najafyia Fondation.</p>";
days30ByeByeFrn += "</body>";
days30ByeByeFrn += "</html>";

var days30ByeByeArb = "<html style='font-family: sans-serif;'>";
days30ByeByeArb += "<head>";
days30ByeByeArb += `<style>p{direction:rtl}</style>`;
days30ByeByeArb += "</head>";
days30ByeByeArb += "<body>";
days30ByeByeArb += "    <p>[Name] :الفاضل/ـة</p>";
days30ByeByeArb += "    <p>السلام عليكم ورحمة الله وبركاته";
days30ByeByeArb +=
  "    <br>يؤسفنا إبلاغك بأنه قد انقضت 30 يوما و لم نستلم المبلغ من جانبكم و عليه سنقوم بإلغاء كفالة طالب الحوزة";
days30ByeByeArb +=
  "    <br>أياديكم الكريمة خير معين لهؤلاء الطلاب. اذا كنت ترغب في كفالة طالب آخر في الحوزة العلمية يرجى زيارة الرابط التالي</p>";
days30ByeByeArb += "    <p>زادكم الله توفيقا";
days30ByeByeArb += "    <br>مؤسسة الأنوار النجفية</p>";
days30ByeByeArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
days30ByeByeArb += "</body>";
days30ByeByeArb += "</html>";

var oneMonthAutoRenewEng = "<html style='font-family: sans-serif;'>";
oneMonthAutoRenewEng += "<body>";
oneMonthAutoRenewEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
oneMonthAutoRenewEng += "    <p>Dear [Name]</p>";
oneMonthAutoRenewEng +=
  "    <p>We would like to thank you for your continued and faithful support.";
oneMonthAutoRenewEng +=
  "    <br>Also, we would like to inform you that your subscription will be automatically renewed after one month.";
oneMonthAutoRenewEng +=
  "    <br>If you have any further queries or require any clarification, we will be happy to assist.";
oneMonthAutoRenewEng += "    </p>";
oneMonthAutoRenewEng += "    <p>May Allah accept your deeds.";
oneMonthAutoRenewEng += "    <br>Najafyia Foundation</p>";
oneMonthAutoRenewEng += "</body>";
oneMonthAutoRenewEng += "</html>";

var oneMonthAutoRenewFrn = "<html style='font-family: sans-serif;'>";
oneMonthAutoRenewFrn += "<body>";
oneMonthAutoRenewFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
oneMonthAutoRenewFrn += "    <p>A [Name]</p>";
oneMonthAutoRenewFrn +=
  "    <p>Nous tenons à vous remercier pour votre soutien continu et fidèle.";
oneMonthAutoRenewFrn +=
  "    <br>Nous vous informons également que votre abonnement sera automatiquement renouvelé après un mois.";
oneMonthAutoRenewFrn +=
  "    <br>Si vous avez d'autres questions ou si vous avez besoin de précisions, nous nous ferons un plaisir de vous aider.";
oneMonthAutoRenewFrn += "    </p>";
oneMonthAutoRenewFrn += "    <p>Qu'Allah accepte vos actions,";
oneMonthAutoRenewFrn += "    <br>Najafyia Foundation</p>";
oneMonthAutoRenewFrn += "</body>";
oneMonthAutoRenewFrn += "</html>";

var oneMonthAutoRenewArb = "<html style='font-family: sans-serif;'>";
oneMonthAutoRenewArb += "<head>";
oneMonthAutoRenewArb += `<style>p{direction:rtl}</style>`;
oneMonthAutoRenewArb += "</head>";
oneMonthAutoRenewArb += "<body>";
oneMonthAutoRenewArb += "    <p>[Name] الفاضل/ـة</p>";
oneMonthAutoRenewArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
oneMonthAutoRenewArb +=
  "    <p>نشكر لكم أياديكم الكريمة و دعمكم المتواصل، كما نود أعلامكم بأن اشتراككم سوف يتجدد تلقائيا بعد ";
oneMonthAutoRenewArb += "    </p>";
oneMonthAutoRenewArb += "    <p>زادكم الله توفيقا";
oneMonthAutoRenewArb += "    <br>مؤسسة الأنوار النجفية</p>";
oneMonthAutoRenewArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
oneMonthAutoRenewArb += "</body>";
oneMonthAutoRenewArb += "</html>";

var orpSponInvoiceingEng = "<html style='font-family: sans-serif;'>";
orpSponInvoiceingEng += "<body>";
orpSponInvoiceingEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
orpSponInvoiceingEng += "    <p>Dear [Name]</p>";
orpSponInvoiceingEng +=
  "    <p>We are very grateful for your support. Your generosity will make an immense difference in the life of an orphan.";
orpSponInvoiceingEng +=
  "    <br>We would like to inform you that your kind donation of [CURRSYM][AMOUNT] will be automatically deducted from your account every 6 months.";
orpSponInvoiceingEng +=
  "    <br>If you have any further queries or require any clarification, we will be happy to assist.";
orpSponInvoiceingEng += "    </p>";
orpSponInvoiceingEng += "    <p>May Allah accept your deeds.";
orpSponInvoiceingEng += "    <br>Najafyia Foundation</p>";
orpSponInvoiceingEng += "</body>";
orpSponInvoiceingEng += "</html>";

var orpSponInvoiceingFrn = "<html style='font-family: sans-serif;'>";
orpSponInvoiceingFrn += "<body>";
orpSponInvoiceingFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
orpSponInvoiceingFrn += "    <p>A [Name]</p>";
orpSponInvoiceingFrn +=
  "    <p>Nous sommes très reconnaissant pour votre soutien. Votre générosité fera une différence immense dans la vie d'un orphelin.";
orpSponInvoiceingFrn +=
  "    <br>Nous tenons à vous informer que votre généreux don de [CURRSYM][AMOUNT] sera automatiquement créé à partir de votre compte tous les 6 mois.";
orpSponInvoiceingFrn +=
  "    <br>Si vous avez d'autres questions ou si vous avez besoin de précisions, nous nous ferons un plaisir de vous aider.";
orpSponInvoiceingFrn += "    </p>";
orpSponInvoiceingFrn += "    <p>Qu'Allah accepte vos actions,";
orpSponInvoiceingFrn += "    <br>Najafyia Foundation</p>";
orpSponInvoiceingFrn += "</body>";
orpSponInvoiceingFrn += "</html>";

var orpSponInvoiceingArb = "<html style='font-family: sans-serif;'>";
orpSponInvoiceingArb += "<head>";
orpSponInvoiceingArb += `<style>p{direction:rtl}</style>`;
orpSponInvoiceingArb += "</head>";
orpSponInvoiceingArb += "<body>";
orpSponInvoiceingArb += "    <p>[Name] الفاضل/ـة  </p>";
orpSponInvoiceingArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
orpSponInvoiceingArb +=
  "    <p>.نود أن نعلمك أن [CURRSYM][AMOUNT] سيتم اقتطاعه من تلقائيا من حسابك كل ستة أشهر</p>";
orpSponInvoiceingArb += "    <p>نشكر لكم أياديكم الكريمة";
orpSponInvoiceingArb +=
  "    <br>زادكم الله توفيقا<br>مؤسسة الأنوار النجفية </p>";
orpSponInvoiceingArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
orpSponInvoiceingArb += "</body>";
orpSponInvoiceingArb += "</html>";

var dazRecNonPayEng = "<html style='font-family: sans-serif;'>";
dazRecNonPayEng += "<body>";
dazRecNonPayEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
dazRecNonPayEng += "    <p>Dear [Name]</p>";
dazRecNonPayEng +=
  "    <p>This is to inform you that your last recurring payment is overdue and due to the non-payment, we are cancelling your Education Sponsorship.";
dazRecNonPayEng +=
  "    <br>We would like you to know that your donations are very important for us to make lives better for these orphans. Therefore, if you wish to sponsor the education of another orphan, kindly visit the link below.";
dazRecNonPayEng +=
  "    <br>If you have any further queries or require any clarification, we will be happy to assist.";
dazRecNonPayEng += "    </p>";
dazRecNonPayEng += "    <p>May Allah accept your deeds.";
dazRecNonPayEng += "    <br>Najafyia Foundation</p>";
dazRecNonPayEng += "</body>";
dazRecNonPayEng += "</html>";

var dazRecNonPayFrn = "<html style='font-family: sans-serif;'>";
dazRecNonPayFrn += "<body>";
dazRecNonPayFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
dazRecNonPayFrn += "    <p>A [Name]</p>";
dazRecNonPayFrn +=
  "    <p>Nous vous informons que votre dernier paiement périodique reste impayé et qu'en raison d'un non-paiement, nous allons devoir annuler votre parrainage pour l'éducation.";
dazRecNonPayFrn +=
  "    <br>Nous tenons à vous informer que vos dons sont essentiels pour améliorer la vie de ces orphelins. Ainsi, si vous souhaitez parrainer l'éducation d'un autre orphelin, veuillez visiter le lien ci-dessous :";
dazRecNonPayFrn +=
  "    <br>Si vous avez d'autres questions ou si vous avez besoin de précisions, nous nous ferons un plaisir de vous aider.";
dazRecNonPayFrn += "    </p>";
dazRecNonPayFrn += "    <p>Qu'Allah accepte vos actions,";
dazRecNonPayFrn += "    <br>Najafyia Foundation</p>";
dazRecNonPayFrn += "</body>";
dazRecNonPayFrn += "</html>";

var dazRecNonPayArb = "<html style='font-family: sans-serif;'>";
dazRecNonPayArb += "<head>";
dazRecNonPayArb += `<style>p{direction:rtl}</style>`;
dazRecNonPayArb += "</head>";
dazRecNonPayArb += "<body>";
dazRecNonPayArb += "    <p>[Name] : الفاضل/ـة</p>";
dazRecNonPayArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
dazRecNonPayArb +=
  "    <p>يؤسفنا إبلاغكم أن الدفع التلقائي من حسابكم قد رفض و مستحقات الكفالة التعليمية لم تصلنا بعد وعليه سنقوم بإلغاء الكفالة";
dazRecNonPayArb +=
  "    <br>أياديكم الكريمة هي خير معين لهؤلاء الأيتام. في حال رغبتم بكفالة تعليم يتيم آخر يرجى زيارة الرابط التالي </p>";
dazRecNonPayArb += "    <p>زادكم الله توفيقا";
dazRecNonPayArb += "    <br>مؤسسة الأنوار النجفية</p>";
dazRecNonPayArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
dazRecNonPayArb += "</body>";
dazRecNonPayArb += "</html>";

var dazEduSponRevisedEng = "<html style='font-family: sans-serif;'>";
dazEduSponRevisedEng += "<body>";
dazEduSponRevisedEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
dazEduSponRevisedEng += "    <p>Dear [Name]</p>";
dazEduSponRevisedEng +=
  "    <p>This is to inform you that your last recurring payment is overdue and due to non-payment, we are cancelling your Orphan’s Education Sponsorship.";
dazEduSponRevisedEng +=
  "    <br>We would like to inform you that your donations are very important for us to make lives better for these orphans. Therefore, if you wish to sponsor the education of another orphan, kindly visit the link below.";
dazEduSponRevisedEng +=
  "    <br>If you have any further queries or require any clarification, we will be happy to assist.";
dazEduSponRevisedEng += "    </p>";
dazEduSponRevisedEng += "    <p>May Allah accept your deeds.";
dazEduSponRevisedEng += "    <br>Najafyia Foundation</p>";
dazEduSponRevisedEng += "</body>";
dazEduSponRevisedEng += "</html>";

var dazEduSponRevisedFrn = "<html style='font-family: sans-serif;'>";
dazEduSponRevisedFrn += "<body>";
dazEduSponRevisedFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
dazEduSponRevisedFrn += "    <p>A [Name]</p>";
dazEduSponRevisedFrn +=
  "    <p>Nous vous informons que votre dernier paiement périodique n'a pas été réglé et qu'en raison d'un non-paiement, nous allons devoir annuler votre parrainage d'éducation pour les orphelins.";
dazEduSponRevisedFrn +=
  "    <br>Nous tenons à vous informer que vos dons sont essentiels pour améliorer la vie de ces orphelins. Ainsi, si vous souhaitez parrainer l'éducation d'un autre orphelin, veuillez visiter le lien ci-dessous : ";
dazEduSponRevisedFrn +=
  "    <br>Si vous avez d'autres questions ou si vous avez besoin de précisions, nous nous ferons un plaisir de vous aider.";
dazEduSponRevisedFrn += "    </p>";
dazEduSponRevisedFrn += "    <p>Qu'Allah accepte vos actions,";
dazEduSponRevisedFrn += "    <br>Najafyia Foundation</p>";
dazEduSponRevisedFrn += "</body>";
dazEduSponRevisedFrn += "</html>";

var dazEduSponRevisedArb = "<html style='font-family: sans-serif;'>";
dazEduSponRevisedArb += "<head>";
dazEduSponRevisedArb += `<style>p{direction:rtl}</style>`;
dazEduSponRevisedArb += "</head>";
dazEduSponRevisedArb += "<body>";
dazEduSponRevisedArb += "    <p>[Name] الفاضل/ـة</p>";
dazEduSponRevisedArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
dazEduSponRevisedArb +=
  "    <p>.يؤسفنا إبلاغكم أن الدفع التلقائي من حسابكم قد رفض و مستحقات الكفالة التعليمية لم تصلنا بعد وعليه سنقوم بإلغاء الكفالة";
dazEduSponRevisedArb +=
  "    <br>:أياديكم الكريمة هي خير معين لهؤلاء الأيتام. في حال رغبتم بكفالة تعليم يتيم آخر يرجى زيارة الرابط التالي";
dazEduSponRevisedArb += "    </p>";
dazEduSponRevisedArb += "    <p>زادكم الله توفيقا";
dazEduSponRevisedArb += "    <br>مؤسسة الأنوار النجفية</p>";
dazEduSponRevisedArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
dazEduSponRevisedArb += "</body>";
dazEduSponRevisedArb += "</html>";

var khumsEng = "<html style='font-family: sans-serif;'>";
khumsEng += "<body>";
khumsEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
khumsEng += "    <p>Dear [Name]</p>";
khumsEng +=
  "    <p>We would like to thank you for your generous donation. It is due to your continued and faithful donations that we are able to better the lives of those in need.";
khumsEng +=
  "    <br>If you have any further queries, we would be happy to assist.";
khumsEng += "    </p>";
khumsEng += "    <p>May Allah accept your deeds.";
khumsEng += "    <br>Najafyia Foundation</p>";
khumsEng += "    <p>Disclaimer: We act as an intermediary by collecting funds from you and delivering them to your respective marjae. The original receipt of your khums will be provided to you within (15) working days. For further inquiries, please contact:Email:  <a href='mailto:info@najafyia.org'>info@najafyia.org</a></p>";
khumsEng += "</body>";
khumsEng += "</html>";

var khumsFrn = "<html style='font-family: sans-serif;'>";
khumsFrn += "<body>";
khumsFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
khumsFrn += "    <p>A [Name]</p>";
khumsFrn += "<p>Salamun Alaykum,</p>";
khumsFrn +=
  "    <p>Nous tenons à vous remercier pour votre généreux don. C'est grâce à votre don continu et fidèle que nous avons la possibilité d'améliorer la vie de ceux qui en ont besoin.";
khumsFrn +=
  "    <br>Si vous avez d'autres questions ou si vous avez besoin de précisions, nous nous ferons un plaisir de vous aider.";
khumsFrn += "    </p>";
khumsFrn += "    <p>Qu'Allah accepte vos actions,";
khumsFrn += "    <br>Najafyia Foundation</p>";
khumsFrn += "    <p>A titre indicatif : Nous ne sommes qu'un intermédiaire. Nous allons livrer les fonds fournis par vos soins au bureau du Marja respectif. Notez qu'un reçu original sera édité par le bureau du Marja dans les 15 jours ouvrables. Pour de plus amples informations, veuillez contacter :Email: <a href='mailto:info@najafyia.org'>info@najafyia.org</a></p>";
khumsFrn += "</body>";
khumsFrn += "</html>";

var khumsArb = "<html style='font-family: sans-serif;'>";
khumsArb += "<head>";
khumsArb += `<style>p{direction:rtl}</style>`;
khumsArb += "</head>";
khumsArb += "<body>";

khumsArb += "    <p>[Name]  الفاضل/ـة</p>";
khumsArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
khumsArb +=
  "    <p>.وصلنا مبلغ الخمس الذي ارسلتموه، جعله الله في ميزان حسناتكم";
khumsArb += "    <br>نشكر لكم أياديكم الكريمة";
khumsArb += "    </p>";
khumsArb += "    <p>زادكم الله توفيقا";
khumsArb += "    <br>مؤسسة الأنوار النجفية</p>";
khumsArb += "<p>إخلاء طرف: نحن مجرد وسيط نقوم بإيصال المبالغو استلام الأيصال من مكتب المرجع المعين. هذه العملية قد تستغرق 15 يوما. لمزيد من التفاصيل يمكنكم التواصل معنا.</p>";
khumsArb += "<p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
khumsArb += "</body>";
khumsArb += "</html>";

var sadaqaAdayEng = "<html style='font-family: sans-serif;'>";
sadaqaAdayEng += "<body>";
sadaqaAdayEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
sadaqaAdayEng += "    <p>Dear [Name]</p>";
sadaqaAdayEng +=
  "    <p>This is to inform you that your last recurring payment is overdue and due to non-payment, we are cancelling your <i>Sadaqah</i> a Day.";
sadaqaAdayEng +=
  "    <br>We would like you to know that your donations are very important for us to ensure better lives of Shia communities. Therefore, if you wish to sign up again for <i>Sadaqah</i> a Day, kindly visit the link below.";
sadaqaAdayEng +=
  "    <br>If you have any further queries or require any clarification, we will be happy to assist.";
sadaqaAdayEng += "    </p>";
sadaqaAdayEng += "    <p>May Allah accept your deeds.";
sadaqaAdayEng += "    <br>Najafyia Foundation</p>";
sadaqaAdayEng += "</body>";
sadaqaAdayEng += "</html>";

var sadaqaAdayFrn = "<html style='font-family: sans-serif;'>";
sadaqaAdayFrn += "<body>";
sadaqaAdayFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
sadaqaAdayFrn += "    <p>A [Name]</p>";
sadaqaAdayFrn +=
  "    <p>Nous tenons à vous informer que votre dernier paiement périodique n'a pas été réglé et en raison d'un non-paiement, nous allons devoir annuler votre Sadaqa du jour.";
sadaqaAdayFrn +=
  "    <br>Nous tenons à vous informer que vos dons sont très importants pour vous afin d'améliorer la vie d'autrui. Ainsi, si vous souhaitez vous inscrire à un nouveau Sadaqa du jour, veuillez visiter le lien ci-dessous : ";
sadaqaAdayFrn +=
  "    <br>Si vous avez d'autres questions ou si vous avez besoin de précisions, nous nous ferons un plaisir de vous aider.";
sadaqaAdayFrn += "    </p>";
sadaqaAdayFrn += "    <p>Qu'Allah accepte vos actions,";
sadaqaAdayFrn += "    <br>Najafyia Foundation</p>";
sadaqaAdayFrn += "</body>";
sadaqaAdayFrn += "</html>";

var sadaqaAdayArb = "<html style='font-family: sans-serif;'>";
sadaqaAdayArb += "<head>";
sadaqaAdayArb += `<style>p{direction:rtl}</style>`;
sadaqaAdayArb += "</head>";
sadaqaAdayArb += "<body>";
sadaqaAdayArb += "    <p>[Name] الفاضل/ـة</p>";
sadaqaAdayArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
sadaqaAdayArb +=
  "    <p>'هذا لإبلاغكم بأن الدفعة المتكررة من حسابكم لم تصلنا و عليه سوف يتم إلغاء اشتراككم في 'الصدقة اليومية";
sadaqaAdayArb +=
  "    <br>:أياديكم الكريمة لها أكبر الأثر في تحسين حياة الكثير من المحتاجين، إذا كنت ترغب في الإشتراك مجددافي 'الصدقة اليومية' يرجى زيارة الرابط التالي";
sadaqaAdayArb += "    </p>";
sadaqaAdayArb += "    <p>زادكم الله توفيفا ";
sadaqaAdayArb += "    <br>مؤسسة الأنوار النجفية</p>";
sadaqaAdayArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
sadaqaAdayArb += "</body>";
sadaqaAdayArb += "</html>";

var passResetEng = "<html style='font-family: sans-serif;'>";
passResetEng += "<body>";
passResetEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
passResetEng += "    <p>Dear [Name]</p>";
passResetEng +=
  "    <p>Congratulations! You have successfully reset your password.";
passResetEng +=
  "    <br>If you have any further queries or require any clarification, we will be happy to assist.";
passResetEng += "    </p>";
passResetEng += "    <p>May Allah accept your deeds.";
passResetEng += "    <br>Najafyia Foundation</p>";
passResetEng += "</body>";
passResetEng += "</html>";

var passResetFrn = "<html style='font-family: sans-serif;'>";
passResetFrn += "<body>";
passResetFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
passResetFrn += "    <p>A [Name]</p>";
passResetFrn += "    <p>Salamun Alaykum,</p>";
passResetFrn +=
  "    <p>Bravo ! Vous avez réinitialisé votre mot de passe avec succès.";
passResetFrn +=
  "    <br>Si vous avez d'autres questions ou si vous avez besoin de précisions, nous nous ferons un plaisir de vous aider.";
passResetFrn += "    </p>";
passResetFrn += "    <p>Qu'Allah accepte vos actions,";
passResetFrn += "    <br>Najafyia Foundation</p>";
passResetFrn += "</body>";
passResetFrn += "</html>";

var passResetArb = "<html style='font-family: sans-serif;'>";
passResetArb += "<head>";
passResetArb += `<style>p{direction:rtl}</style>`;
passResetArb += "</head>";
passResetArb += "<body>";
passResetArb += "    <p>[Name] الفاضل/ـة</p>";
passResetArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
passResetArb += "    <p>نهنك لقد تم إعادة تعين كلمة المرور الخاصة بك بنجاح";
passResetArb += "    </p>";
passResetArb += "    <p>زادكم الله توفيقا";
passResetArb += "    <br>مؤسسة الأنوار النجفية</p>";
passResetArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
passResetArb += "</body>";
passResetArb += "</html>";

var newsLetterSubsEng = "<html style='font-family: sans-serif;'>";
newsLetterSubsEng += "<body>";
newsLetterSubsEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
newsLetterSubsEng += "    <p>Dear [Name]</p>";
newsLetterSubsEng +=
  "    <p>Congratulations! You have successfully subscribed to our newsletters.";
newsLetterSubsEng +=
  "    <br>We look forward to sending you regular updates and making you a part of this journey.";
newsLetterSubsEng +=
  "    <br>If you wish to unsubscribe or have any further queries, we will be happy to assist.";
newsLetterSubsEng += "    </p>";
newsLetterSubsEng += "    <p>May Allah accept your deeds.";
newsLetterSubsEng += "    <br>Najafyia Foundation</p>";
newsLetterSubsEng += "</body>";
newsLetterSubsEng += "</html>";

var newsLetterSubsFrn = "<html style='font-family: sans-serif;'>";
newsLetterSubsFrn += "<body>";
newsLetterSubsFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
newsLetterSubsFrn += "    <p>A [Name]</p>";
newsLetterSubsFrn += "    <p>Salamun Alaykum,</p>";
newsLetterSubsFrn +=
  "    <p>Bravo ! Vous vous êtes inscrit avec succès à notre newsletter.";
newsLetterSubsFrn +=
  "    <br>Nous sommes impatients de vous envoyer les mises à jour régulières et de vous embarquer pour ce voyage ! ";
newsLetterSubsFrn +=
  "    <br>Si vous souhaitez vous désabonner ou si vous avez d'autres questions, nous nous ferons un plaisir de vous aider. ";
newsLetterSubsFrn += "    </p>";
newsLetterSubsFrn += "    <p>Qu'Allah accepte vos actions,";
newsLetterSubsFrn += "    <br>Najafyia Foundation</p>";
newsLetterSubsFrn += "</body>";
newsLetterSubsFrn += "</html>";

var newsLetterSubsArb = "<html style='font-family: sans-serif;'>";
newsLetterSubsArb += "<head>";
newsLetterSubsArb += `<style>p{direction:rtl}</style>`;
newsLetterSubsArb += "</head>";
newsLetterSubsArb += "<body>";
newsLetterSubsArb += "    <p>[Name] الفاضل/ـة</p>";
newsLetterSubsArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
newsLetterSubsArb +=
  "    <p>نهنئك! لقد اشتركت بنجاح في قائمة المتلقين لرسائلنا الاخبارية";
newsLetterSubsArb +=
  "    <br>نحن سعداء ببقائك على تواصل معنا، ونتوق ! إعلامك بكل جديد و نجعلك جزءا من هذه الرحلة!";
newsLetterSubsArb +=
  "    <br>.في حال رغبت بإلغاء الإشتراك أو كانت لديك اية استفسارات فنحن على أتم الإستعداد لتقديم المساعدة";
newsLetterSubsArb += "    </p>";
newsLetterSubsArb += "    <pزادكم الله توفيقا";
newsLetterSubsArb += "    <br>مؤسسة الأنوار النجفية</p>";
newsLetterSubsArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
newsLetterSubsArb += "</body>";
newsLetterSubsArb += "</html>";

var ocaGreetingsEng = "<html style='font-family: sans-serif;'>";
ocaGreetingsEng += "<body>";
ocaGreetingsEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful";
ocaGreetingsEng +=
  '    <br><br><strong>The Holy Prophet (pbuh) said: "People are the dependents of Allah for sustenance, so the most beloved one of people with Him is the one who is helpful to the dependents Allah and makes the family members of a house happy." [Al-Kafi, vol. 2, p. 164]</strong><br><br>';
ocaGreetingsEng += "    </p>";
ocaGreetingsEng += "    <p>Dear [Name]</p>";
ocaGreetingsEng +=
  "    <p>We would like to congratulate you on the auspicious occasion of <i>Eid al Ghadeer</i>. May Allah (swt) and the Ahlul Bayt (as) shower their blessings upon you and your family.";
ocaGreetingsEng += "    </p>";
ocaGreetingsEng += "    <p>May Allah accept your deeds.";
ocaGreetingsEng += "    <br>Najafyia Foundation</p>";
ocaGreetingsEng += "</body>";
ocaGreetingsEng += "</html>";

var ocaGreetingsFrn = "<html style='font-family: sans-serif;'>";
ocaGreetingsFrn += "<body>";
ocaGreetingsFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
ocaGreetingsFrn += "    <p>Quand vous donnez l'aumône à quelqu'un,</p>";
ocaGreetingsFrn += "    <p>Soyez reconnaissant envers eux,</p>";
ocaGreetingsFrn += "    <p>Car vous lui donnez une meilleure dunya,</p>";
ocaGreetingsFrn += "    <p>Mais ils vous donnent une meilleure aakhirah</p>";
ocaGreetingsFrn += "    <p>A [Name]</p>";
ocaGreetingsFrn += "    <p>Salamun Alaykum,";
ocaGreetingsFrn +=
  "    <br>Nous tenons à vous féliciter à cette occasion propice d'Eid e Ghadder. Puissent Allah (swt) et les Ahlulbayt déversent leurs bénédictions sur vous et votre famille.";
ocaGreetingsFrn += "    </p>";
ocaGreetingsFrn += "    <br>Najafyia Foundation</p>";
ocaGreetingsFrn += "</body>";
ocaGreetingsFrn += "</html>";

var ocaGreetingsArb = "<html style='font-family: sans-serif;'>";
ocaGreetingsArb += "<body>";
ocaGreetingsArb +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
ocaGreetingsArb += "    <p>Dear [Name]</p>";
ocaGreetingsArb +=
  "    <p>This is to inform you that your last recurring payment is overdue and due to the non-payment, we are cancelling your Education Sponsorship.";
ocaGreetingsArb +=
  "    <br>We would like you to know that your donations are very important for us to make lives better for these orphans. Therefore, if you wish to sponsor the education of another orphan, kindly visit the link below.";
ocaGreetingsArb +=
  "    <br>If you have any further queries or require any clarification, we will be happy to assist.";
ocaGreetingsArb += "    </p>";
ocaGreetingsArb += "    <p>May Allah accept your deeds.";
ocaGreetingsArb += "    <br>Najafyia Foundation</p>";
ocaGreetingsArb += "</body>";
ocaGreetingsArb += "</html>";

var contactUsEng = "<html style='font-family: sans-serif;'>";
contactUsEng += "<body>";
contactUsEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
contactUsEng += "    <p>Dear [Name]</p>";
contactUsEng +=
  "    <p>Thank you for your email. All your queries and comments are important to us.";
contactUsEng +=
  "    <br>Due to large volume of emails, we make take up to 48 hours to respond.";
contactUsEng += "    </p>";
contactUsEng += "    <p>May Allah accept your deeds.";
contactUsEng += "    <br>Najafyia Foundation</p>";
contactUsEng += "</body>";
contactUsEng += "</html>";

var contactUsFrn = "<html style='font-family: sans-serif;'>";
contactUsFrn += "<body>";
contactUsFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
contactUsFrn += "    <p>A [Name]</p>";
contactUsFrn += "    <p>Salamun Alaykum,";
contactUsFrn +=
  "    <br>Merci pour votre email. Toutes vos questions et commentaires sont importants pour nous.";
contactUsFrn +=
  "    <br>En raison d'un flux important d'emails, nous vous répondrons d'ici 48 heures.";
contactUsFrn += "    </p>";
contactUsFrn += "    <p>Qu'Allah accepte vos actions,";
contactUsFrn += "    <br>Najafyia Foundation</p>";
contactUsFrn += "</body>";
contactUsFrn += "</html>";

var contactUsArb = "<html style='font-family: sans-serif;'>";
contactUsArb += "<head>";
contactUsArb += `<style>p{direction:rtl}</style>`;
contactUsArb += "</head>";
contactUsArb += "<body>";
contactUsArb += "    <p>[Name]  الفاضل/ـة</p>";
contactUsArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
contactUsArb +=
  "    <p>نشكرك على التواصل معنا، كل استفسارتك و تعليقاتك مهمة لنا، ولكن بسبب كمية الرسائل الكبيرة التي تصلنا قد يستغرق الرد 48 ساعة";
contactUsArb += "    <br>نشكر لكم تعاونكم معنا";
contactUsArb += "    </p>";
contactUsArb += "    <p>زادكم الله توفيقا";
contactUsArb += "    <br>مؤسسة الأنوار التجفية</p>";
contactUsArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
contactUsArb += "</body>";
contactUsArb += "</html>";

var ziyarahPerformedEng = "<html style='font-family: sans-serif;'>";
ziyarahPerformedEng += "<body>";
ziyarahPerformedEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
ziyarahPerformedEng += "    <p>Dear [Name]</p>";
ziyarahPerformedEng +=
  "    <p>We would like you to know that  <i>ziyarah</i> for  <b>[Date]</b> has been performed on your behalf in the <i>Haram</i> of <b>Imam Hussain (as).</b> ";
ziyarahPerformedEng +=
  "    <br>To register for the upcoming Thursday <i>ziyarah</i>, please click on the link below:";
ziyarahPerformedEng += "    <a href='https://najafyia.org'>Register for Ziyarah</a>";
ziyarahPerformedEng += "    </p>";
ziyarahPerformedEng += "    <p>May Allah accept your deeds.";
ziyarahPerformedEng += "    <br>Najafyia Foundation</p>";
ziyarahPerformedEng += "</body>";
ziyarahPerformedEng += "</html>";

var ziyarahPerformedFrn = "<html style='font-family: sans-serif;'>";
ziyarahPerformedFrn += "<body>";
ziyarahPerformedFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
ziyarahPerformedFrn += "    <p>A [Name]</p>";
ziyarahPerformedFrn += "    <p>Nous tenons à vous informer que la Ziyarah de <b>l'Imam Hussain (as)</b> du jeudi soir a bien été accomplie en votre nom au Haram de l'Imam (as) à Karbala, ce <b>[Date]</b>." 
ziyarahPerformedFrn +=
  "    <br>Pour vous inscrire à une ziyarah à votre nom qui aura lieu jeudi prochain, veuillez cliquer sur le lien suivant:  <a href='https://najafyia.org/#/home/FRN'> S'inscrire au ziyarat </a> ";

ziyarahPerformedFrn += "    </p>";
ziyarahPerformedFrn += "    <p>Qu'Allah accepte vos actions,";
ziyarahPerformedFrn += "    <br>Najafyia Foundation</p>";
ziyarahPerformedFrn += "</body>";
ziyarahPerformedFrn += "</html>";

var ziyarahPerformedArb = "<html style='font-family: sans-serif;'>";
ziyarahPerformedArb += "<head>";
ziyarahPerformedArb += `<style>p{direction:rtl}</style>`;
ziyarahPerformedArb += "</head>";
ziyarahPerformedArb += "<body>";
ziyarahPerformedArb += "    <p>[Name] الفاضل/ـة</p>";
ziyarahPerformedArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
ziyarahPerformedArb += "    <p>.نود إعلامكم بأنه قد تمت زيارة <b>الإمام الحسين (ع)</b> ليلة الجمعة نيابة عنك";
ziyarahPerformedArb += "    <br>   لتسجيل لزيارة النيابية لليلة الجمعة القادمة أرجو النقر على الرابط التالي";
ziyarahPerformedArb += "  :  <a href='https://najafyia.org/#/home/ARB'>  التسجيل في زيارات  </a>  ";
ziyarahPerformedArb += "    <br> تقبل الله منكم صالح الأعمال وزادكم توفيقا ,<b>[Date]</b> ";

ziyarahPerformedArb += "    <br>مؤسسة الأنوار النجفية</p>";
ziyarahPerformedArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>";
ziyarahPerformedArb += "</body>";
ziyarahPerformedArb += "</html>";




var ziyarahConfirmEng = "<html style='font-family: sans-serif;'>";
ziyarahConfirmEng += "<body>";
ziyarahConfirmEng +=
  "    <p>In the name of Allah (swt), the most Beneficent the most Merciful</p>";
ziyarahConfirmEng += "    <p>Dear [Name]</p>";
ziyarahConfirmEng +=
  "    <p>Your request to perform Ziyarah of <b>Imam Hussain (as)</b> has been received and it will be performed on your behalf this <b>[Date]</b>. Don’t forget to register every Thursday before 12 PM GMT.";
ziyarahConfirmEng += "    </p>";
ziyarahConfirmEng += "    <p>May Allah accept your deeds.";
ziyarahConfirmEng += "    <br>Najafyia Foundation</p>";
ziyarahConfirmEng += "</body>";
ziyarahConfirmEng += "</html>";



var ziyarahConfirmFrn = "<html style='font-family: sans-serif;'>";
ziyarahConfirmFrn += "<body>";
ziyarahConfirmFrn +=
  "    <p>Au nom d'Allah, Le plus Clément, Le plus Miséricordieux</p>";
ziyarahConfirmFrn += "    <p>A [Name]</p>";
ziyarahConfirmFrn += "    <p>Salamun Alaykum,";

ziyarahConfirmFrn +=
  "<br>Votre demande de Ziyarah de <b>l'Imam Hussain (as)</b> a bien été reçue et elle sera effectuée en votre nom ce jeudi soir, <b>[Date]</b> N'oubliez pas de vous inscrire tous les jeudis avant Midi GMT.";


ziyarahConfirmFrn += "    </p>";
ziyarahConfirmFrn += "    <p>Qu'Allah (swt) accepte vos actions,";
ziyarahConfirmFrn += "    <br>Najafyia Foundation</p>";
ziyarahConfirmFrn += "</body>";
ziyarahConfirmFrn += "</html>";

var ziyarahConfirmArb = "<html style='font-family: sans-serif;'>";
ziyarahConfirmArb += "<head>";
ziyarahConfirmArb += `<style>p{direction:rtl}</style>`;
ziyarahConfirmArb += "</head>";
ziyarahConfirmArb += "<body>";
ziyarahConfirmArb += "    <p>[Name] الفاضل/ـة</p>";
ziyarahConfirmArb += "    <p>السلام عليكم ورحمة الله وبركاته</p>";
ziyarahConfirmArb +="  <p>.نشكر لكم أياديكم الكريمة ونعلمكم بأنه قد تم التسجيل لزيارة <b>الإمام الحسين (ع)</b> ليلة الجمعة نيابة عنك";
ziyarahConfirmArb += "    <br>  تقبل الله منكم صالح الأعمال وزادكم توفيقا ";
ziyarahConfirmArb += " <br>  <b>[Date]</b>"

ziyarahConfirmArb += "    <p>مؤسسة الأنوار النجفية</p>";
ziyarahConfirmArb +=
  "     <p style='font-size:12px;'><a href='mailto:invoice@najafyia.org'>invoice@najafyia.org</a>: ملاحظة: هذا رد تلقائي لا ترد عليه و في حال كانت لديك أية استفسارات تواصل معنا على</p>"; //'</b> الإمام الحسين (ع) <b>'
ziyarahConfirmArb += "</body>";
ziyarahConfirmArb += "</html>";

module.exports = {
  ziyarahConfirmArb: function () {
    return ziyarahConfirmArb;
  },
  signUpContentEng: function () {
    return signUpContentEng;
  },
  signUpContentArb: function () {
    return signUpContentArb;
  },
  signUpContentFrn: function () {
    return signUpContentFrn;
  },
  forgotPwdARB: function (req, token) {
    return `<html>
<body><p style="text-align: right;">السلام عليكم ورحمة الله وبركاته <br />انت تستلم هذا البريد لانك انت ( او شخص اخر ) طلب تغير كلمة السر لحسابك. <br />: الرجاء اضغط على الرابط التالي، او ثبته في متصفحك لغرض إكمال الخطوات المطلوبة&nbsp;</p>
<p style="text-align: right;"><a href="https://${req.headers.host}/#/reset/${token}">https://${req.headers.host}/#/reset/${token}</a></p>
<p style="text-align: right;"><br />إذا لم تكن انت من طلب هذا، الرجاء تجاهل هذا البريد الأكتروني وكلمة السر سوف تبقى نفسها بغير تغيير. مؤسسة الأنوار النجفية</p></body>
</html>`;
  },
  ziyarahConfirmFrn: function () {
    return ziyarahConfirmFrn;
  },
  ziyarahConfirmEng: function () {
    return ziyarahConfirmEng;
  },
  ziyarahPerformedArb: function () {
    return ziyarahPerformedArb;
  },
  ziyarahPerformedFrn: function () {
    return ziyarahPerformedFrn;
  },
  ziyarahPerformedEng: function () {
    return ziyarahPerformedEng;
  },
  contactUsArb: function () {
    return contactUsArb;
  },
  contactUsFrn: function () {
    return contactUsFrn;
  },
  contactUsEng: function () {
    return JSON.stringify(contactUsEng);
  },
  ocaGreetingsArb: function () {
    return JSON.stringify(ocaGreetingsArb);
  },
  ocaGreetingsFrn: function () {
    return JSON.stringify(ocaGreetingsFrn);
  },
  ocaGreetingsEng: function () {
    return JSON.stringify(ocaGreetingsEng);
  },
  newsLetterSubsArb: function () {
    return JSON.stringify(newsLetterSubsArb);
  },
  newsLetterSubsFrn: function () {
    return JSON.stringify(newsLetterSubsFrn);
  },
  newsLetterSubsEng: function () {
    return JSON.stringify(newsLetterSubsEng);
  },
  passResetArb: function () {
    return JSON.stringify(passResetArb);
  },
  passResetFrn: function () {
    return JSON.stringify(passResetFrn);
  },
  passResetEng: function () {
    return JSON.stringify(passResetEng);
  },
  sadaqaAdayArb: function () {
    return JSON.stringify(sadaqaAdayArb);
  },
  sadaqaAdayFrn: function () {
    return JSON.stringify(sadaqaAdayFrn);
  },
  sadaqaAdayEng: function () {
    return JSON.stringify(sadaqaAdayEng);
  },
  khumsArb: function () {
    return JSON.stringify(khumsArb);
  },
  khumsFrn: function () {
    return JSON.stringify(khumsFrn);
  },
  khumsEng: function () {
    return JSON.stringify(khumsEng);
  },
  dazEduSponRevisedArb: function () {
    return JSON.stringify(dazEduSponRevisedArb);
  },
  dazEduSponRevisedFrn: function () {
    return JSON.stringify(dazEduSponRevisedFrn);
  },
  dazEduSponRevisedEng: function () {
    return JSON.stringify(dazEduSponRevisedEng);
  },
  dazRecNonPayArb: function () {
    return JSON.stringify(dazRecNonPayArb);
  },
  dazRecNonPayFrn: function () {
    return JSON.stringify(dazRecNonPayFrn);
  },
  dazRecNonPayEng: function () {
    return JSON.stringify(dazRecNonPayEng);
  },
  orpSponInvoiceingArb: function () {
    return JSON.stringify(orpSponInvoiceingArb);
  },
  orpSponInvoiceingFrn: function () {
    return JSON.stringify(orpSponInvoiceingFrn);
  },
  orpSponInvoiceingEng: function () {
    return JSON.stringify(orpSponInvoiceingEng);
  },
  oneMonthAutoRenewArb: function () {
    return JSON.stringify(oneMonthAutoRenewArb);
  },
  oneMonthAutoRenewFrn: function () {
    return JSON.stringify(oneMonthAutoRenewFrn);
  },
  oneMonthAutoRenewEng: function () {
    return JSON.stringify(oneMonthAutoRenewEng);
  },
  days30ByeByeArb: function () {
    return JSON.stringify(days30ByeByeArb);
  },
  days30ByeByeFrn: function () {
    return JSON.stringify(days30ByeByeFrn);
  },
  days30ByeByeEng: function () {
    return JSON.stringify(days30ByeByeEng);
  },
  hawzaStuAutoRenewArb: function () {
    return JSON.stringify(hawzaStuAutoRenewArb);
  },
  hawzaStuAutoRenewFrn: function () {
    return JSON.stringify(hawzaStuAutoRenewFrn);
  },
  hawzaStuAutoRenewEng: function () {
    return JSON.stringify(hawzaStuAutoRenewEng);
  },
  autoRenewCorrectArb: function () {
    return JSON.stringify(autoRenewCorrectArb);
  },
  autoRenewCorrectFrn: function () {
    return JSON.stringify(autoRenewCorrectFrn);
  },
  autoRenewCorrectEng: function () {
    return JSON.stringify(autoRenewCorrectEng);
  },
  recPay48NoticeArb: function () {
    return JSON.stringify(recPay48NoticeArb);
  },
  recPay48NoticeFrn: function () {
    return JSON.stringify(recPay48NoticeFrn);
  },
  recPay48NoticeEng: function () {
    return JSON.stringify(recPay48NoticeEng);
  },
  orpAssign2OtherOrpDazArb: function () {
    return JSON.stringify(orpAssign2OtherOrpDazArb);
  },
  orpAssign2OtherOrpDazFrn: function () {
    return JSON.stringify(orpAssign2OtherOrpDazFrn);
  },
  orpAssign2OtherOrpDazEng: function () {
    return JSON.stringify(orpAssign2OtherOrpDazEng);
  },
  autoRenewPayNotThroughArb: function () {
    return JSON.stringify(autoRenewPayNotThroughArb);
  },
  autoRenewPayNotThroughFrn: function () {
    return JSON.stringify(autoRenewPayNotThroughFrn);
  },
  autoRenewPayNotThroughEng: function () {
    return JSON.stringify(autoRenewPayNotThroughEng);
  },
  autoRenewThroughArb: function () {
    return JSON.stringify(autoRenewThroughArb);
  },
  autoRenewThroughFrn: function () {
    return JSON.stringify(autoRenewThroughFrn);
  },
  autoRenewThroughEng: function () {
    return JSON.stringify(autoRenewThroughEng);
  },
  autoRenew48ReminderArb: function () {
    return JSON.stringify(autoRenew48ReminderArb);
  },
  autoRenew48ReminderFrn: function () {
    return JSON.stringify(autoRenew48ReminderFrn);
  },
  autoRenew48ReminderEng: function () {
    return JSON.stringify(autoRenew48ReminderEng);
  },
  assignOrp2AnotherDnrArb: function () {
    return JSON.stringify(assignOrp2AnotherDnrArb);
  },
  assignOrp2AnotherDnrFrn: function () {
    return JSON.stringify(assignOrp2AnotherDnrFrn);
  },
  assignOrp2AnotherDnrEng: function () {
    return JSON.stringify(assignOrp2AnotherDnrEng);
  },
  recNonPayAfter30Arb: function () {
    return JSON.stringify(recNonPayAfter30Arb);
  },
  recNonPayAfter30Frn: function () {
    return JSON.stringify(recNonPayAfter30Frn);
  },
  recNonPayAfter30Eng: function () {
    return JSON.stringify(recNonPayAfter30Eng);
  },
  errRecPayArb: function () {
    return JSON.stringify(errRecPayArb);
  },
  errRecPayFrn: function () {
    return JSON.stringify(errRecPayFrn);
  },
  errRecPayEng: function () {
    return JSON.stringify(errRecPayEng);
  },
  reminderPayDeducArb: function () {
    return JSON.stringify(reminderPayDeducArb);
  },
  reminderPayDeducFrn: function () {
    return JSON.stringify(reminderPayDeducFrn);
  },
  reminderPayDeducEng: function () {
    return JSON.stringify(reminderPayDeducEng);
  },
  recPayGoneThroughArb: function () {
    return JSON.stringify(recPayGoneThroughArb);
  },
  recPayGoneThroughFrn: function () {
    return JSON.stringify(recPayGoneThroughFrn);
  },
  recPayGoneThroughEng: function () {
    return JSON.stringify(recPayGoneThroughEng);
  },
  standardRecArb: function () {
    return JSON.stringify(standardReceiptArb);
  },
  standardRecFrn: function () {
    return JSON.stringify(standardReceiptFrn);
  },
  standardRecEng: function () {
    return JSON.stringify(standardReceiptEng);
  },
  FRN: function () {
    return frnReceipt;
  },
  ARB: function () {
    return arbReceipt;
  },
  ENG: function () {
    return engReceipt;
  }
};
