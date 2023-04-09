var Logs = require('../models/logs');

module.exports.insert = async function (req, res) {
    try {
        res.status(200)
            .send(await Logs.create(req.body));

    } catch (error) {
        res.status(400).send(error);
    }
}