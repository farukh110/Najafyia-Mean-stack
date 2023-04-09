var Volunteer = require('../models/volunteer.js');
var ObjectID = require('mongodb').ObjectID;

//add and update volunteer
module.exports.saveVolunteer = function (req, res) {
    if (req.body._id) {
        Volunteer.findById(req.body._id, (err, volunteer) => {
            if (volunteer) {
                volunteer.name = req.body.name || volunteer.name;
                volunteer.from = req.body.from || volunteer.from;
                volunteer.to = req.body.to || volunteer.to;
                volunteer.email = req.body.email || volunteer.email;
                volunteer.phone = req.body.phone || volunteer.phone;
                volunteer.age = req.body.age || volunteer.age;
                volunteer.country = req.body.country || volunteer.country;
                volunteer.nationality = req.body.nationality || volunteer.nationality;
                volunteer.language = req.body.language || volunteer.language;
                volunteer.photo = req.body.photo || volunteer.photo;
                volunteer.cv = req.body.cv || volunteer.cv;
                volunteer.updated = Date.now();
                volunteer.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.json('Your form has been submitted. Thank You for extending your help');
                });
            }
            else {
                return res.status(404).send({
                    message: 'volunteer not found!'
                })
            }
        });
    } else {
        Volunteer.findById(req.body._id, (err, volunteer) => {
            if (volunteer) {
                return res.status(409).send({
                    message: 'volunteer already exist!'
                });
            }
            else {
                var volunteer = new Volunteer({
                    name: req.body.name,
                    from: req.body.from || null,
                    to: req.body.to || null,
                    email: req.body.email || null,
                    phone: req.body.phone || null,
                    age: req.body.age || null,
                    country: req.body.country || null,
                    nationality: req.body.nationality || null,
                    language: req.body.language || null,
                    photo: req.body.photo || null,
                    cv: req.body.cv || null,
                    isActive: true
                })
                volunteer.save(function (error) {
                    if (error) {
                        res.status(500).send(error.message);
                    }
                    else {
                        res.json('Your form has been submitted. Thank You for extending your help');
                    }
                })
            }
        });
    }
}


//get all volunteer list
module.exports.getAllVolunteerList = function (req, res) {
    Volunteer.find({}, function (err, volunteer) {
        res.status(200).send(volunteer);
    });
}







