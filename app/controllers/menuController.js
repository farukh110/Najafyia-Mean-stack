var Menu = require('../models/menu.js');
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');
const cacheHelper = require('../utilities/cacheHelper');
const constants = require('../constants');
const logHelper = require('../utilities/logHelper');
const MAIN_MENU_LIST = "mainMenuList";

//Create menu
module.exports.addRootMenu = function (req, res) {
    let methodName = 'addRootMenu()';
    try {
        const cacheKey = `${MAIN_MENU_LIST}${req.body.language || 'ENG'}`
        let menu = new Menu({
            menuName: req.body.menuName,
            link: req.body.menuLink,
            isRoot: true,
            language: req.body.language || 'ENG',
            priority: req.body.priority,
            isActive: true,
        })
        menu.save(function (error) {
            if (error) {
                throw error;
            } else {
                cacheHelper.deleteCache(cacheKey);
                res.json('Menu created Successfully');
            }
        })
    }
    catch (exc) {
        logHelper.logError(`${constants.LogLiterals.MENU_CONTROLLER}: ${methodName}: error`, exc);
    }
}

module.exports.searchPage = function (req, res) {
    Menu.find({});
}

//save menu on edit
// update menu
module.exports.editMenu = function (req, res) {
    let methodName = 'editMenu()';
    try {
        Menu.findOne({ _id: req.body.id }).exec((err, menu) => {
            if (err) {
                res.status(500).send(err);
            } else {
                menu.menuName = req.body.menuName;
                menu.priority = req.body.priority;
                menu.language = req.body.language;
                menu.save(function (err, menu) {
                    const cacheKey = `${MAIN_MENU_LIST}${req.body.language || 'ENG'}`
                    cacheHelper.deleteCache(cacheKey);
                    res.status(201).send("Menu Item updated successfully");
                });
            }
        });
    }
    catch (exc) {
        logHelper.logError(`${constants.LogLiterals.MENU_CONTROLLER}: ${methodName}: error`, exc);
    }


}
// update menu
module.exports.addSubMenu = function (req, res) {
    let methodName = 'addSubMenu()';
    try {
        Menu.findOne({ _id: req.body.rootMenu._id }).populate("subMenu").exec((err, menu) => {
            if (err) {
                res.status(500).send(err);
            }
            else {
                var submenu = new Menu();

                submenu.menuName = req.body.subMenu.menuName;
                submenu.link = req.body.subMenu.menuLink;
                submenu.priority = req.body.subMenu.priority;
                submenu.isActive = true;
                submenu.language = req.body.language;
                submenu.isRoot = false;
                // menu.menuLink = "#";
                submenu.save(function (err) {
                    if (err) {
                        res.status(500).send("issue has occurred");
                    }
                });
                menu.subMenu.push(submenu);

                menu.save((err, menu) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    const cacheKey = `${MAIN_MENU_LIST}${req.body.language || 'ENG'}`
                    cacheHelper.deleteCache(cacheKey);
                    res.json('menu updated Successfully');
                });
            }

        });
    }
    catch (exc) {
        logHelper.logError(`${constants.LogLiterals.MENU_CONTROLLER}: ${methodName}: error`, exc);
    }
}
// Delete menu
module.exports.deleteMenu = function (req, res) {
    let methodName = 'deleteMenu()';
    try {
        Menu.findByIdAndRemove(req.params.id, function (err, menu) {
            if (menu && menu.subMenu.length > 0) {
                menu.subMenu.forEach(function (e) {
                    var id = e.toString(); //mongoose.Types.ObjectId(e);
                    Menu.findByIdAndRemove(id, function (err) {
                        if (err) {

                        }
                    });
                }, this);

                let response = {
                    message: "menu Deleted Successfully",
                };
                res.status(200).send(response);
            } else {
                let response = {
                    message: "unable to Delete Menu"
                };
                res.status(200).send(response);
            }
            const cacheKey = `${MAIN_MENU_LIST}${menu.language || 'ENG'}`
            cacheHelper.deleteCache(cacheKey);
        });
    }
    catch (exc) {
        logHelper.logError(`${constants.LogLiterals.MENU_CONTROLLER}: ${methodName}: error`, exc);
    }
}

// Delete Root menu
module.exports.deleteRootMenu = function (req, res) {
    let methodName = 'deleteRootMenu()';

    try {
        Menu.findByIdAndRemove(req.params.id, function (err, menu) {
            menu.subMenu.forEach(function (e) {
                var id = e.toString(); //mongoose.Types.ObjectId(e);
                Menu.findByIdAndRemove(id, function (err) {
                    if (err) {
                    }
                });
            }, this);
            let response = {
                message: "menu Deleted Successfully",
                id: menu._id
            };

            const cacheKey = `${MAIN_MENU_LIST}${menu.language || 'ENG'}`
            cacheHelper.deleteCache(cacheKey);
            res.status(200).send(response);
        });

    }
    catch (exc) {
        logHelper.logError(`${constants.LogLiterals.MENU_CONTROLLER}: ${methodName}: error`, exc);
    }
}

//select all menus
module.exports.menuList = function (req, res) {
    Menu.find({ isRoot: true, language: req.params.userLang }, function (err, menus) {
        res.status(200).send(menus);
    });
}

//select all sub menus level 1
module.exports.subMenuList = function (req, res) {
    Menu.find({ isRoot: false, isActive: true, language: req.params.userLang }, function (err, menus) {
        res.status(200).send(menus);
    });
}


//select all menus
module.exports.mainMenuList = function (req, res) {
    let methodName = 'mainMenuList()';
    try {
        const cacheKey = `${MAIN_MENU_LIST}${req.params.userLang}`;
        let cachedValue = cacheHelper.getCache(cacheKey);        
        if (cachedValue == undefined) {
            Menu.find({
                isRoot: true, language: req.params.userLang
            }).populate({
                path: "subMenu",
                populate: {
                    path: "subMenu",
                    match: { isActive: true }
                },
                match: { isActive: true }
            }).exec(function (err, menus) {
                cacheHelper.setCache(cacheKey, menus);
                res.status(200).send(menus);
            });
        }
        else {
            res.status(200).send(cachedValue);
        }
    }
    catch (ex) {
        logHelper.logError(`${constants.LogLiterals.MENU_CONTROLLER}: ${methodName}: error`, ex);
    }
}

//select menu by id
module.exports.menuById = function (req, res) {
    Menu.findOne({ _id: req.params.menuId, language: req.params.lang }).populate(
        {
            path: "subMenu",
            match: { isActive: true }
        }
    ).exec(function (err, menu) {
        res.status(200).send(menu);
    });
}