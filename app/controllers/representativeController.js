var Representative = require('../models/representative.js');
var ObjectID = require('mongodb').ObjectID;

//add and update representative
module.exports.saveRepresentative = function (req, res) {
    if (req.body._id) {
        Representative.findById(req.body._id, (err, representative) => {
            if (representative) {
                representative.name = req.body.name || null;
                representative.designation = req.body.designation || null;
                representative.description = req.body.description || null;
                representative.email = req.body.email || null;
                representative.phone = req.body.phone || null;
                representative.country = req.body.country || null;
                representative.city = req.body.city || null;
                representative.currency = req.body.currency || null;
                representative.amount = req.body.amount || null;
                representative.image = req.body.image || null;
                representative.socialMedia = req.body.socialMedia || null;
                representative.language = req.body.language || 'ENG',
                    representative.updated = Date.now();
                representative.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    } else {
                        res.json('Representative updated Successfully!');
                    }
                });
            }
            else {
                return res.status(404).send({
                    message: 'Representative not found!'
                })
            }
        });
    } else {
        Representative.findById(req.body._id, (err, representative) => {
            if (representative) {
                return res.status(409).send({
                    message: 'Representative already exist!'
                });
            }
            else {
                var representative = new Representative({
                    name: req.body.name,
                    designation: req.body.designation || null,
                    description: req.body.description || null,
                    email: req.body.email || null,
                    phone: req.body.phone || null,
                    country: req.body.country || null,
                    city: req.body.city || null,
                    currency: req.body.currency || null,
                    amount: req.body.amount || null,
                    image: req.body.image || null,
                    socialMedia: req.body.socialMedia || [],
                    language: req.body.language || 'ENG',
                    isActive: true
                })
                representative.save(function (error) {
                    if (error) {
                        res.status(500).send(error.message);
                    }
                    else {
                        res.json('Representative saved Successfully!');
                    }
                })
            }
        });
    }
}
// delete representative
module.exports.deleteRepresentative = function (req, res) {
    try {
        Representative.findByIdAndRemove(req.params.Id, function (err, representative) {
            if (representative) {
                res.json("Representative deleted Successfully!");
            } else {
                res.status(500).send("Representative does not exist!");
            }
        });
    }
    catch (ex) {
        res.send(ex);
    }

}
// get representative by ID
module.exports.getRepresentativeById = function (req, res) {
    Representative.findOne({ _id: req.params.Id, language: req.headers.language }, function (err, representative) {
        res.status(200).send(representative);
    });
}
// get representative list
module.exports.getRepresentativesList = function (req, res) {
    const showActiveOnly = req.params.isActive;

    let filters = { language: req.headers.language, "name": { $ne: '-' } };
    //filters.isActive = false;
    if (showActiveOnly == 'true') {
        filters.isActive = true;
    }
    Representative.find(filters, function (err, representative) {
        res.status(200).send(representative);
    });
}

// change rep Status 
module.exports.changeRepresentativeStat = function (req, res) {
    try {
        let repStat = 'true';
        let strResult = 'Active';
        Representative.findOne({ _id: req.params.Id }, function (err, representative) {

            if (representative.isActive == false) {
                repStat = 'true';
                strResult = 'Active';
            }
            else {
                repStat = 'false';
                strResult = 'In Active';

            }

            Representative.updateOne({ _id: req.params.Id }, { $set: { "isActive": repStat } }, function (err, representative) {
                if (representative) {
                    res.json(`Representative status has been changed successfully to '${strResult}'`);
                } else {
                    res.status(500).send("Representative does not exist!");
                }
            });
        });
    }
    catch (ex) {
        res.send(ex);
    }
}