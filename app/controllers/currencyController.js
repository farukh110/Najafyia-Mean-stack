var Currency = require('../models/currency.js');
var projectTarget = require('../models/projectTarget.js');
var ObjectID = require('mongodb').ObjectID;
const databaseHelper = require('../utilities/databaseHelper');
const constants = require('../constants');
const logHelper = require('../utilities/logHelper.js');
 const currencyService = require('../services/currencyService.js');

module.exports.addCurrency = function (req, res) {

    var currency = new Currency({
        name: req.body.name,
        rate: req.body.rate,
        symbol: req.body.symbol,
        displayOrder:req.body.displayOrder,
        translatedTitle:req.body.translatedTitle
    })
    currency.save(function (error) {
        if (error) {
            res.send(error);
        }
        else {
            res.json('Currency Rate Saved Successfully');
        }
    });

};
module.exports.addAchievementRates = function (req, res) {
 
    projectTarget.find({_id: req.body.id},  (err, data)=> {
        if (err) {
            res.send(error);
        }
        else {
            let obj={
                target: req.body.target,
                achieved: req.body.achieved,
                currencyTitle: req.body.currencyTitle
            }
            if(!data.length){
                var targetRate = new projectTarget(obj)
                targetRate.save(obj, (er, data)=>{
                    if(!er){
                        res.status(200).json(data);
                    }else{
                        res.send(er);
                    }
                })
            }
            else{
                projectTarget.update({_id: req.body.id}, obj, (er, succ)=>{
                    if(!er){
                        obj._id = req.body.id;
                        res.status(200).json(obj);
                        }
                        else{
                            res.send(er);
                        }
                    })
            }
        }
    });

};

module.exports.getAchievementRates = function(req, res){
    projectTarget.find({currencyTitle: req.params.currency},  (err, data)=> {
        if(err) {
            res.send(err);
        }
        else {
            if(data.length){
                let obj={
                    percent:`${(data[0].achieved/data[0].target)*100}%`,
                    achieved:data[0].achieved,
                    target:data[0].target,
                    id:data[0]._id
                }
                res.status(200).json(obj);
            }else{
                res.status(200).send();
            }
            }
        });
}


module.exports.updateCurrency = function (req, res) {

    Currency.findById(req.body.id, (err, currency) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            currency.name = req.body.name;
            currency.rate = req.body.rate;
            currency.symbol = req.body.symbol;
            currency.displayOrder = req.body.displayOrder;
            currency.translatedTitle = req.body.translatedTitle;

            currency.save((err, currency) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('currency updated Sucessfully');
            });
        }
    });
};


module.exports.getCurrencyList = function (req, res) {

    let filter ={};
    if(req.query.state && req.query.state != 'undefined' )
    {
       // filter.isActive = req.query.state;
        filter = {$or: [{ isActive: { $exists: false } }, { isActive: req.query.state }]}
    }
    Currency.find(filter, function (err, currency) {
        res.status(200).send(currency);
    }).sort({ displayOrder: 1 });
}


module.exports.getCurrencyByName = function (req, res) {
    Currency.find({
        name: req.params.name
    }, function (err, currency) {
        res.status(200).send(currency);
    });
}

module.exports.getCurrencyByNameRenew = async function (currencyName) {

    let currency = await databaseHelper.getItem(constants.Database.Collections.CURNCY.dataKey,{name: currencyName},{name:1,rate:1,symbol:1});
    return currency;
    
}



module.exports.getAllAvailableCurrency = async function(req, res){
    const methodName = "getAllAvailableCurrency";
    try {        
        let allCurrencies = await currencyService.getAllAvailableCurrency();
        res.status(200).send(allCurrencies.value);
    }
    catch(ex)
    { 
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error in getting All Static Currency  `, ex);
        res.status(500).send(ex);;
    }
}

module.exports.changeCurrencyStatus = async function(req, res){
    const methodName = "changeCurrencyStatus";
    try {        
    
       let name =  req.body.name ? req.body.name : '';
       let stat = req.body.status ? req.body.status : false;
       if(name != '' )
       {
           await databaseHelper.updateItem(constants.Database.Collections.CURNCY.dataKey,{name: name},{isActive : !stat});
           res.status(200).send();
       }
    }
    catch(ex)
    {
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error in changing currency status  `, ex);
        res.status(500).send(ex);;
    }
}

