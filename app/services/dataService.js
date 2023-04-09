/* Import constants and helper functions */
var logHelper = require('../utilities/logHelper');
var databaseHelper = require('../utilities/databaseHelper');
var FILE_NAME = "DATA_SERVICE";
const constants = require('../constants');
async function getItem(modelKey, query, dataFields, sortOptions) {
    let data = null;
    try {
        data = await databaseHelper.getItem(modelKey, query, dataFields, sortOptions);
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: getItem: Error in getting item`, collectionName, query, err);
        throw new Error(err.message);
    }
    return data;
}
async function getItems(modelKey, query, dataFields, sortOptions) {
    let data = null;
    try {
        data = await databaseHelper.getItems(modelKey, query, dataFields, sortOptions);
    }
    catch (err) {
        logHelper.logError(`${FILE_NAME}: getItem: Error in getting item`, collectionName, query, err);
        throw new Error(err.message);
    }
    return data;
}

async function getConfigSettings (keyToMatch) {
    const methodName = 'getConfigSettings()';
    try {
  
      logHelper.logInfo(`${FILE_NAME}: ${methodName}: Method is starting from generic helper`);
      
      var query_CONFIG_SETTING = {
        key: keyToMatch
      }
  
      var payload_CONFIG_SETTING = {
        value: 1, key: 1
      }
  
      var configurationData = await databaseHelper.getItem(constants.Database.Collections.CONFIG_SETTING.dataKey, query_CONFIG_SETTING, payload_CONFIG_SETTING);
  
    }
    catch (err) {
        console.log('Error...', err)
      logHelper.logError(`${FILE_NAME}: ${methodName}: Error.`, err);
    }
  
    return configurationData;
  };
  
  
module.exports = {
    getItem,
    getItems,
    getConfigSettings
};
