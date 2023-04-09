var Page = require('../models/pages.js');
var contact = require('../models/contactUs');
var ObjectID = require('mongodb').ObjectID;
// var DynamicPageContent = require('../models/dynamicPageContent');
// var Programs = require('../models/program');
// var ProgramTypes = require('../models/programType');
//generating hash using for password encryption
var Menu = require('../models/menu');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var _ = require('lodash');

//Create User
module.exports.addPage = function (req, res) {
    var page = new Page({
        pageName: req.body.title,
        slug: req.body.slug && req.body.slug.split(" ").join("-").toLowerCase(),
        pageContent: req.body.content,
        pageLink: req.body.link,
        language: req.body.language,
        slug: req.body.slug,
        isActive: true
    })
    page.save(function (error) {
        if (error) {
            throw error;
        }
        else {
            res.json('Page created Sucessfully');
        }
    })
}
// update page
module.exports.updatePage = function (req, res) {
    Page.findById(req.body.id, (err, page) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            page.pageName = req.body.title || page.pageName;
            page.slug = (req.body.slug && req.body.slug.split(" ").join("-").toLowerCase()) || page.slug;
            page.pageContent = req.body.content || page.pageContent;
            page.updated = Date.now();
            page.save((err, user) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('page updated Sucessfully');
            });
        }
    });
}
// Delete Page
module.exports.deletePage = function (req, res) {
    try {
        Page.findByIdAndRemove(req.params.Id, function (err, page) {
            let response = {
                message: "Page Deleted Sucessfully",
                id: page._id
            };
            res.status(200).send(response);
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
//select all pages
module.exports.pageList = function (req, res) {
    // const language =;
    Page.find({language: req.query.language || "ENG"}, function (err, pages) {
        res.status(200).send(pages);

    });
}

module.exports.getContactUsList = function (req, res) {

    contact.find({}, function (err, contactList) {
        if(!err)res.status(200).send(contactList);
        else res.status(400).send('err fetching contact list')

    });
}
function noPageFound(res) {
    res.status(404).send("No Page Found");
}
//select all pages
module.exports.searchPage = function (req, res) {
    Menu.findOne({ menuName: { $regex: '.*' + req.query.search + '.*', $options: "i" }, language: req.query.lang }, function (err, menu) {
        if (err) res.status(400).send("Bad Request");
        if (menu) {
            res.status(200).send(menu.link);
        }
        else if (!menu) {
            let mesg;
            if (req.query.lang  == "ARB") mesg = "لم يتم العثور على الصفحة";
            if (req.query.lang  == "FRN") mesg = "Page non trouvée";
            if (req.query.lang  == "ENG") mesg = "No Page Found";
            res.status(400).send(mesg);
            };
    });
    // Page.find({ pageName: { $regex: '.*' + req.query.search + '.*', $options: "i" } }, function (err, page) {
    //     if (!(page && page.length)) {
    //         // If page is not Found on Static Pages
    //         return DynamicPageContent.find({ title: { $regex: '.*' + req.query.search + '.*', $options: "i" } }, function (e, dynamicPage) {
    //             if (e) noPageFound(res);
    //             // If Page is not Found in Dynamic Pages
    //             else if (!dynamicPage.length) {
    //                 return Programs.find({ programName: { $regex: '.*' + req.query.search + '.*', $options: "i" }, language: req.query.lang }, (pErr, program) => {
    //                     if (pErr) noPageFound(res);
    //                     // Finding Program Type Name
    //                     if (program && program.length) {
    //                         return ProgramTypes.findOne({ _id: program[0].programType, language: req.query.lang }, (ptErr, programType) => {
    //                             if (programType) {
    //                                 if (programType.programTypeName === 'Projects' || programType.programTypeName === 'Projets' || programType.programTypeName === 'مشروع')
    //                                     res.status(200).send({ name: 'projectdetails', id: program[0].id });
    //                                 else if (programType.programTypeName === 'Dar Al Zahra' || programType.programTypeName === 'Dar-Al-Zahra' || programType.programTypeName === '(دار الزهراء (ع')
    //                                     res.status(200).send({ name: 'daralzahradetails', id: program[0].id });
    //                                 else if (programType.programTypeName === 'General Care' || programType.programTypeName === 'Projets')
    //                                     res.status(200).send({ name: 'generalcaredetails', id: program[0].id });
    //                                 else if (programType.programTypeName === 'Religious Payments' || programType.programTypeName === 'Paiements religieux' || programType.programTypeName === 'المدفوعات الدينية')
    //                                     res.status(200).send({ name: 'religiouspayment_subcategories', id: program[0].id });
    //                                 else if (programType.programTypeName === 'Sadaqah' || programType.programTypeName === 'Sadaqa' || programType.programTypeName === 'الصدقة')
    //                                     res.status(200).send({ name: 'sadaqadetails', id: program[0].id });
    //                                 else res.status(200).send({name: _.camelCase(req.query.search)});
    //                             } else noPageFound(res);
    //                         })
    //                     }
    //                 //    else res.status(200).send({name:  _.camelCase(req.query.search)})
    //                 else noPageFound(res);
    //                 });
    //             }
    //             else if (dynamicPage && dynamicPage.length) {
    //                 res.status(200).send({ name: 'pages', id: dynamicPage[0].id });
    //             }
    //             else noPageFound(res);
    //         })
    //     }
    //     else res.status(200).send({ name:  _.camelCase(page && page.length && page[0].pageName)});
    // });
}
//select page by id
module.exports.pageById = function (req, res) {

    Page.findById(req.params.Id, function (err, pages) {
        res.status(200).send(pages);

    });
}
//select page by page Name
module.exports.pageByName = function (req, res) {
    Page.find({ pageName: req.params.pageName }, function (err, pages) {
        res.status(200).send(pages[0]);

    });
}