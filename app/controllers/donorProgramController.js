const donorProgramService = require('../services/donorProgramService');
let responseDTO = require('../models/custom/responseDTO');
const constants = require('../constants');
const logHelper = require('../utilities/logHelper');

module.exports.getdonorProgramsListByUser = async function (req, res) {
    const methodName = "getdonorProgramsListByUser()";
    const userId = req.session._id;
    const language = req.params.language;
    console.log("userId", userId);
    console.log(req.session);
    try {

        let objdonorProgramService = await donorProgramService.getdonorProgramsListByUser(userId,language)
        if (objdonorProgramService) {


            res.status(200).json(objdonorProgramService);

            // responseDTO.isSuccess = true;
            // responseDTO.data = objdonorProgramService
            // res.status(200).send(responseDTO);
        }

        //  console.log("objdonorProgramService", objdonorProgramService)

    }
    catch (ex) {

        console.log("ex", ex)
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_CONTROLLER}: ${methodName}: Error`, ex);

        // responseDTO.isSuccess = false;
        // responseDTO.data = null;
        // responseDTO.errorMessage = constants.Messages.ErrorMessage;
        // res.status(500).send(responseDTO);
    }
};

module.exports.cancelSubscription = async function (req, res) {
    const methodName = "cancelSubscription()";
    try {
        let isSubscriptionCanceled = await donorProgramService.cancelSubscription(req, res);
        res.status(200).json(isSubscriptionCanceled);
        
    }
    catch (ex) {
        console.log("ex", ex)
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_CONTROLLER}: ${methodName}: Error`, ex);
    }
};

module.exports.toggleAutoRenewal = async function (req, res) {
    const methodName = "toggleAutoRenewal()";
    try {
        console.log(req.params);
        let donorProgramObject =  donorProgramService.toggleAutoRenewal(req, res);
        if(donorProgramObject)
        {
            res.status(200).json(donorProgramObject);
        }
    }
    catch (ex) {
        console.log("ex", ex)
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_CONTROLLER}: ${methodName}: Error`, ex);
    }
};

module.exports.insertDonorProgram = async function (req, res) {
    const methodName = "insertDonorProgram() in donorProgramController.js";
    console.log(methodName)
    try {
        await donorProgramService.insertDonorProgram(req, res);
    }
    catch (ex) {
        console.log("ex", ex)
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_CONTROLLER}: ${methodName}: Error`, ex);
    }
};

module.exports.getDonorProgramDetailByDonorProgramID = async function (req, res) {
    const methodName = "getDonorProgramDetailByDonorProgramID() in donorProgramController.js";
    console.log(methodName)
    try {
        let donorProgramDetailList = await donorProgramService.getDonorProgramDetail(req.params.Id)
        if (donorProgramDetailList) {


            res.status(200).json(donorProgramDetailList);

        }
    }
    catch (ex) {
        console.log("ex", ex)
        logHelper.logError(`${constants.LogLiterals.DONOR_PROGRAM_CONTROLLER}: ${methodName}: Error`, ex);
    }
};