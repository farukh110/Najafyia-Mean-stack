const cacheHelper = require('../utilities/cacheHelper');

module.exports.test = function (req, res) {  
    res.json('Test Success!')
}


module.exports.getAllCacheKeyValues = function (req, res) {
    //res.status(200).send(cachedValue);
    res.json(cacheHelper.listAllCache());
}

module.exports.clearAllCacheKeyValues = function (req, res) {
    //res.status(200).send(cachedValue);
    res.json(cacheHelper.clearAllCache());
}