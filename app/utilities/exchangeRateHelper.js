const cheerio = require('cheerio');
var logHelper = require('../utilities/logHelper');
const apiHelper = require('../utilities/apiRequestHelper');
var constants = require('../constants');
var configuration = require('../../config/configuration');
const currencyController = require('../controllers/currencyController.js');
const currencyService = require('../services/currencyService.js');

module.exports = {
    getCurrencyRates: async (date) => {
        let rates = [];
        try {
  
            let currencyList = await currencyService.getAllAvailableCurrency();  
            currencyList = currencyList.value;
            //databaseHelper.getItem(constants.Database.Collections.CONFIG_SETTING.dataKey,{key:'CurrencyMapping'},{value:1});

            const response = await apiHelper.sendRequest(`${configuration.exchangeRate.apiUrl}?from=${constants.Currencies.UnitedStateDollar}&amount=1&date=${date}`, apiHelper.HTTPMethods.GET, null, null);

            let $ = cheerio.load(response);

            try{
            $("tbody > tr",$("table.tablesorter").first()).each((index, element) => {
                var rate = {};
                
              let currentObj = currencyList.filter(currency => currency.name.toLowerCase() == $(element.children[1]).text().toLowerCase() );

              if(currentObj)
              {

                currentObj = currentObj[0];

                rate.currencyCode = currentObj.code;
                rate.amount = $(element.children[3]).text(),         //euro equivalent of 1 USD
                rate.amountInverse = $(element.children[5]).text(); // dollar equivalent of 1 euro
                rates.push(rate);
              }

                // if ($(element.children[1]).text() == currencyNames.EUR) 
                // {
                //     rate.currencyCode = constants.Currencies.Euro;
                //     rate.amount = $(element.children[3]).text(),//euro equivalent of 1 USD
                //     rate.amountInverse = $(element.children[5]).text();// dollar equivalent of 1 euro

                //     rates.push(rate);
                // }
                // else if ($(element.children[1]).text() == currencyNames.GBP) 
                // {
                //     rate.currencyCode = constants.Currencies.BritishPound;
                //     rate.amount = $(element.children[3]).text(),//euro equivalent of 1 USD
                //     rate.amountInverse = $(element.children[5]).text();// dollar equivalent of 1 euro

                //     rates.push(rate);
                // }
            });
        }
        catch(ex)
        {
            logHelper.logError("Error in traversing rate table", ex);
        }

            return rates;

        } catch (err) {
            // Handle Error Here
            logHelper.logError("Error in exchange rate Helper", err);
            console.error(err);
            return rates;

        }
    }
}
