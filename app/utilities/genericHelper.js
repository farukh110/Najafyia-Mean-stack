var configuration = require('../../config/configuration');
const constants = require('../constants');

module.exports.convertUnixDateToISOfomrat = function (unixDateStamp) {
  let datetimeUnixMiliseconds;
  let datetime;
  try {
    datetimeUnixMiliseconds = unixDateStamp * 1000;     // convert into miliseconds thatswhy multiply with 1000
    datetime = new Date(datetimeUnixMiliseconds).toISOString();
    console.log(datetime)

    //the following code is working fine. Right now not using moment library.
    // var dateString = moment.unix(req.body.data.object.created).toISOString();
  }
  catch (e) {
    console.log(e);
  }
  return datetime;
};

module.exports.GetDateForZiaratThursday = function () {
  var resDate;
  try {
    /** Date code to be Refactored or make a generic method */
    var date = new Date();
    var dayOfWeek = 4;
    var resultDate = new Date(date.getTime());
    if (date.getDay() < 5) {
      resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    }
    else if (date.getDay() == 5) {
      var check = date.getDate();
      check = check - 1;
      resultDate.setDate(date.getDate() + (8 - dayOfWeek - date.getDay()) % 7);
    }
    resDate = resultDate.toISOString().split('T')[0];//resultDate;
  }
  catch (e) {
    console.log(e);
  }
  return resDate;
};


module.exports.CheckZiaratPerformedDate = function () {


  try {
    let time = configuration.ziyarat.ziyaratCutOffTime.zaireenSelection;
    let timetoUse = time.split(' ');
    var date = new Date();
    var dayOfWeek = 4;
    var resultDate = new Date();

    if (timetoUse[2] == ('*' || undefined || '')) {
      timetoUse[2] = 14;
    }
    if (date.getDay() == 4) {
      if (timetoUse[2] != ('*' || undefined || '')) {
        if (date.getHours() < timetoUse[2]) {
          resultDate = (resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7));
          return resultDate;
        } else {
          resultDate = (resultDate.setDate((date.getDate() + 1) + (7 + dayOfWeek - (date.getDay() + 1)) % 7));
          return resultDate;
        }
      }
      else {
        return undefined;
      }

    } else {
      resultDate = (resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7));

      return resultDate;
    }

  }
  catch (ex) {
    return undefined;
  }

};


module.exports.getRandomString = function (length) {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

module.exports.setDynamicValuesInHtmlBody = function (html, dynamicFields) {
  if (dynamicFields != undefined || dynamicFields != null) {
    for (let index = 0; index < dynamicFields.length; index++) {
      html = html.replace(new RegExp("\\[" + dynamicFields[index].field + "]", "g"), dynamicFields[index].value);
    }
  }
  return html;
}

module.exports.sleep = function(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 


function round  (x, mul) {
  return (Math.ceil(x / mul) * mul);
}

module.exports.currencyConversionFormula = function (num) {
  if (num <= 2) {
      num = Math.round(num);
  } else if (num <= 25) {
      num = round(num, 1);
  } else if (num <= 500) {
      num = round(num, 5);
  } else if (num <= 1000) {
      num = round(num, 10)
  } else if (num <= 10000) {
      num = round(num, 50)
  } else if (num <= 50000) {
      num = round(num, -100)
  } else if (100000 > num) {
      num = round(num, 1000)
  }
  return num;
}

