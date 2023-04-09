
const logHelper = require('../utilities/logHelper');
var constants = require('../constants');
const databaseHelper = require('../utilities/databaseHelper');



module.exports = {
    getAllCurrencies,
    getAllAvailableCurrency
}



async function getAllAvailableCurrency (){
    const methodName = "getAllAvailableCurrency";
    try {        

        let allCurrencies = await databaseHelper.getItem(constants.Database.Collections.CONFIG_SETTING.dataKey,{key:'CurrencyMapping'},{value:1});
        return allCurrencies;
    }
    catch(ex)
    { 
        logHelper.logError(`currencyService: ${methodName}: Error in getting currencies  `, ex);
        return null;
    }

}

 async function getAllCurrencies (){
    const methodName = "getAllCurrencies";
    try {        let currencies = await databaseHelper.getItems(constants.Database.Collections.CURNCY.dataKey, {}, { name: 1, rate: 1, symbol: 1 });
        if(currencies && currencies.length > 0)
        {
            //currencies.unshift({ name: 'USD', rate: '1', symbol: '$' });
            return currencies;
        }
        return null;
    }
    catch(ex)
    { 
        logHelper.logError(`currencyService : ${methodName}: Error in getting currencies  `, ex);
        return null;
    }

}