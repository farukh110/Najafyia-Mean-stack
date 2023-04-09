const constants = require('../constants');
const logHelper = require('../utilities/logHelper');
const dataService = require('../services/dataService');
const responseDTO = require('../models/custom/responseDTO');
module.exports.getItem = async function (req, res) {
    try {
        const { dataKey, dataFilter, dataFields, sortOptions } = req.body;
        if (!dataKey)
            return res.status(400).send("Parameter missing");
        let item = await dataService.getItem(dataKey, dataFilter, dataFields, sortOptions);
        responseDTO.data = item;
        responseDTO.isSuccess = true;
        return res.status(200).send(responseDTO);
    }
    catch (err) {
        responseDTO.data = null;
        responseDTO.isSuccess = false;
        responseDTO.errorMessage = err.message;
        return res.status(500).send(responseDTO);
    }
}
module.exports.getItems = async function (req, res) {
    try {
        const { dataKey, dataFilter, dataFields, sortOptions } = req.body;
        if (!dataKey)
            return res.status(400).send("Parameter missing");
        let items = await dataService.getItems(dataKey, dataFilter, dataFields, sortOptions);
        responseDTO.data = items;
        responseDTO.isSuccess = true;
        return res.status(200).send(responseDTO);
    }
    catch (err) {
        responseDTO.data = null;
        responseDTO.isSuccess = false;
        responseDTO.errorMessage = err.message;
        return res.status(500).send(responseDTO);
    }
}