const logHelper = require('../utilities/logHelper');
const constants = require('../constants');
const configuration = require('../../config/configuration');
const nodeCache = require('node-cache');
const nfCache = new nodeCache();
let methodName = '';

module.exports.setCache = (key, value) => {
    methodName = constants.LogLiterals.SET_CACHE;
    let isSuccess = false;

    try {
        isSuccess = (configuration.caching.enabled) ? nfCache.set(key, value) : false;
    }
    catch (e) {
        logHelper.logError(`${constants.LogLiterals.CACHE_HELPER}: ${methodName}:  key: ${key} error`, e);
    }
    finally {
        return isSuccess;
    }
}

module.exports.getCache = (key) => {
    methodName = constants.LogLiterals.GET_CACHE;
    let cachedValue;

    try {
        cachedValue = nfCache.get(key);
    }
    catch (e) {
        logHelper.logError(`${constants.LogLiterals.CACHE_HELPER}: ${methodName}: key: ${key} error`, e);
    }
    finally {
        return cachedValue;
    }
}

module.exports.deleteCache = (key) => {
    methodName = constants.LogLiterals.DELETE_CACHE;
    let delCount = 0;

    try {
        delCount = nfCache.del(key);
    }
    catch (e) {
        logHelper.logError(`${constants.LogLiterals.CACHE_HELPER}: ${methodName}: key: ${key} error`, e);
    }
    finally {
        return delCount;
    }
}

module.exports.clearAllCache = () => {
    methodName = constants.LogLiterals.CLEAR_ALL_CACHE;
    let delCount = 0;

    try {
        let allkeys = nfCache.keys();
        delCount = nfCache.del(allkeys);
    }
    catch (e) {
        logHelper.logError(`${constants.LogLiterals.CACHE_HELPER}: ${methodName}: key: ${key} error`, e);
    }
    finally {
        return delCount;
    }
}

module.exports.listAllCache = () => {
    methodName = constants.LogLiterals.LIST_ALL_CACHE;
    let cachedValue;

    try {
        let allkeys = nfCache.keys();
        cachedValue = nfCache.mget(allkeys);
    }
    catch (e) {
        logHelper.logError(`${constants.LogLiterals.CACHE_HELPER}: ${methodName}: key: ${key} error`, e);
    }
    finally {
        return cachedValue;
    }
}