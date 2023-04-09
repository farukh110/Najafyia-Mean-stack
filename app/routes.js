module.exports = function (app) {
    var menuController = require('./controllers/menuController');
    var testController = require('./controllers/testController');
    var loginController = require('./controllers/loginController');
    var userController = require('./controllers/user.controller');
    var donarController = require('./controllers/donarController');
    var pageController = require('./controllers/pageController');
    var pageContentController = require('./controllers/pageContentController');
    var newslettersController = require('./controllers/newslettersController');
    var representativeController = require('./controllers/representativeController');
    var webSettingsController = require('./controllers/webSettingsController');
    var campaignController = require('./controllers/campaignController');
    var postController = require('./controllers/postController');
    var programTypeController = require('./controllers/programTypeController');
    var programController = require('./controllers/programController');
    var programSubCategoryController = require('./controllers/programSubCategoryController');
    var donationProcessController = require('./controllers/donationProcessController');
    var donationDurationController = require('./controllers/donationDurationController');
    var orphanController = require('./controllers/orphanController.js');
    var studentProfileController = require('./controllers/studentProfileController.js');
    var currencyController = require('./controllers/currencyController');
    var studentSponsorshipController = require('./controllers/studentSponsorshipController');
    var countryController = require('./controllers/countryController.js');
    var sdozController = require('./controllers/sdozController.js');
    var fitrahsubtypeController = require('./controllers/fitrahsubtypeController.js');
    var sahmController = require('./controllers/sahmController.js');
    var languagesController = require('./controllers/languageController.js');
    var cartController = require('./controllers/cartController.js');
    var donationController = require('./controllers/donationController.js');
    var accountDetailController = require('./controllers/accountDetailController.js');
    var emailController = require('./controllers/emailController.js');
    var ScheduleController = require('./controllers/scheduleController.js');
    var SuggestedDonationsController = require('./controllers/suggestedDonationsController');
    var orphanScholarshipController = require('./controllers/orphanScholarshipController');
    var sponsorshipController = require('./controllers/sponsorshipsController')
    var ZiyaratController = require('./controllers/ziyaratController');
    var VolunteerController = require('./controllers/volunteerController')
    var occasionController = require('./controllers/occasionController');
    var duaController = require('./controllers/duaController');
    var dynamicPageContentController = require('./controllers/dynamicPageContentController');
    var manageOrphanController = require('./controllers/manageOrphanController');
    var manageStudentController = require('./controllers/manageStudentController');
    var utilsController = require('./controllers/utilsController');
    var ReportsController = require('./controllers/reportController');
    var paymentController = require('./controllers/paymentController');
    var translateController = require('./controllers/translate.controller');
    var logsController = require('./controllers/logsController')
    var schedule = require('node-schedule');
    var _ = require('lodash/core');
    var CartItem = require('./models/cartItem.js');
    var Cart = require('./models/cart.js');
    var sadaqahController = require('./controllers/sadaqahController');
    var donorProgramController = require('./controllers/donorProgramController');
    var configuration = require('../config/configuration');
    var dataController = require('./controllers/dataController');
    var donorProgramService = require('./services/donorProgramService.js');
    var emailNotificationController = require ('./controllers/emailNotificationController');
    var evenLogsController = require('./controllers/eventLogsController');
    var options = {
        successRedirect: '/#/social',
        failureRedirect: '/#/login'
    };
    var multer = require('multer');

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {

            cb(null, './public/uploads')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
    var uploadMulti = multer({ storage: storage });

    //check user authentication
    function isAuthenticated(req, res, next) {
        let keyAuthorization = req.headers.authorizationkey && configuration.authorization.key ? req.headers.authorizationkey == configuration.authorization.key : false;


        if (req.session.user || (req.headers.bypassauth && configuration.app.byPassAPIAuth) || keyAuthorization)
            return next();
        res.status(401).json({ message: 'not allowed!' });
    }

    function guestAccess(req, res, next) {
        let defaultAuthentication = req.session.user || (req.headers.bypassauth && configuration.app.byPassAPIAuth);
        let adminAuthentication = (req.session.user && req.session.role && (req.session.role.indexOf('admin') || req.session.role.indexOf('super admin')))
            || (req.headers.bypassauth && configuration.app.byPassAPIAuth);
        let guestAuthentication = req.session.isGuestUser;

        let keyAuthorization = req.headers.authorizationkey && configuration.authorization.key ? req.headers.authorizationkey == configuration.authorization.key : false;
        if (defaultAuthentication || adminAuthentication || guestAuthentication || keyAuthorization) {
            return next();
        }
        else {
            res.status(401).json({ message: 'not allowed!' });
        }
    }


    app.get('/getsession', function (req, res) {
        let obj = new Object();
        obj.username = req.session.user;
        obj.id = req.session._id;
        obj.role = req.session.role;
        res.status(200).send(obj || {});
    });

    //for allowing cross origin requests
    // app.use(function (req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });

    app.get('/health-check', function (req, res) {
        res.send('OK')
    });

    app.get('/api/test', isAuthenticated, testController.test);
    app.post('/api/logs/insert', logsController.insert);

    app.post('/api/user/login', loginController.login);

    app.post('/api/user/logout', loginController.logout);
    app.post('/api/user/socialLoginAuthentication', loginController.socialLogin);
    //cart
    app.post('/api/add-to-cart', cartController.addToCart);
    app.post('/api/update-to-cart', cartController.updateCart);
    app.post('/api/remove-cart-item', cartController.removeCartItem);
    app.post('/api/remove-multiple-cart-items', cartController.removeMutipleCartItem);
    app.get('/api/get-cart', cartController.getCart);
    app.get('/clear-cart', cartController.clearCart);

    app.get('/api/sendSadaqahRenewalSponsorshipNotification',  emailNotificationController.sendSadaqahRenewalSponsorshipNotification);
    // app.get('*', function (req, res) {
    //     res.sendfile('./public/index.html');
    // });

    /** Menu Management  **/
    /** User Management API**/
    app.post('/api/menu/add', isAuthenticated, menuController.addRootMenu);
    app.put('/api/menu/submenu/add', isAuthenticated, menuController.addSubMenu);
    app.get('/api/menu/list/:userLang', isAuthenticated, menuController.menuList);
    app.get('/api/menu/subMenuList/:userLang', isAuthenticated, menuController.subMenuList);
    app.get('/api/menu/root/list/:userLang', menuController.mainMenuList);
    app.get('/api/menu/:menuId/:lang', isAuthenticated, menuController.menuById);
    app.delete('/api/menu/delete/:id', isAuthenticated, menuController.deleteMenu);
    app.delete('/api/menu/delete/root/:id', isAuthenticated, menuController.deleteRootMenu);
    app.put('/api/menu/edit', isAuthenticated, menuController.editMenu);


    /** Donar Management */
    app.post('/api/donar/add', donarController.addDonar);
    app.post('/api/donar/update', donarController.updateDonar);
    app.get('/api/donar/:id', donarController.donarById);
    /** Account Details  */
    app.post('/api/accountDetail/add', accountDetailController.addAccountDetail);
    /** User Management API**/
    app.post('/api/user/add', userController.addUser);
    app.post('/api/user/addGuest', userController.addGuestUser);
    app.get('/api/user/list', userController.getUserList)

    app.get('/api/user/getTodaysCampaigns', userController.getTodaysCampaign);
    app.get('/api/user/getRecurringDonations', userController.getRecurringDonations);
    app.get('/api/user/getDonarFromUser', userController.getDonarFromUser);
    app.get('/api/user/getSpecificUser/:userId', userController.getSpecificUser);
    app.get('/api/user/getGuestUserByDonorId/:userId', userController.getGuestUserByDonorId);
    app.put('/api/user/update', isAuthenticated, userController.updateUser);
    app.delete('/api/user/delete/:userId', isAuthenticated, userController.deleteUser);
    app.get('/api/user/getUserName', userController.getUser);
    app.get('/api/reset/:token', userController.passwordConfirmation);
    app.put('/api/user/updatePassword', userController.updatePassword);
    app.get('/api/user/getLoggedInUserDetails', isAuthenticated, userController.getLoggedInUserDetails);

    /** Page content **/
    app.post('/api/page/add', isAuthenticated, pageController.addPage);
    app.put('/api/page/update', isAuthenticated, pageController.updatePage);
    app.delete('/api/page/delete/:Id', isAuthenticated, pageController.deletePage);
    app.get('/api/page/list', isAuthenticated, pageController.pageList);
    app.get('/api/page/:Id', isAuthenticated, pageController.pageById);
    app.get('/api/page/byname/:pageName', isAuthenticated, pageController.pageByName);
    app.get('/api/content/:pageName', pageController.pageByName);

    app.post('/api/insert-eventLogs',  evenLogsController.addEventLog);
    /** Post content **/
    app.post('/api/post/add', isAuthenticated, postController.addPost);
    app.put('/api/post/update', isAuthenticated, postController.updatePost);
    app.delete('/api/post/delete/:Id', isAuthenticated, postController.deletePost);
    app.get('/api/post/list', isAuthenticated, postController.postList);
    app.get('/api/post/:Id', isAuthenticated, postController.postById);
    app.post('/api/post/related/list/', isAuthenticated, postController.relatedPostList);
    /**  Program Type content content **/

    // dynamic root content
    app.post('/api/program/addContent', isAuthenticated, programTypeController.addProgramContent);

    app.post('/api/programtype/add', isAuthenticated, programTypeController.addProgramType);
    // app.get('/api/programtype/list/:userLang', isAuthenticated, programTypeController.ProgramTypeList);
    app.get('/api/programtype/list/:userLang', programTypeController.ProgramTypeList);
    app.put('/api/programtype/update', isAuthenticated, programTypeController.updateProgramType);
    app.get('/api/programtype/:name/:userLang', programTypeController.ProgramTypeByName);
    app.delete('/api/programtype/delete/:Id', isAuthenticated, programTypeController.deleteProgramType);

    /**  Program content content **/

    // app.post('/api/program/add', programController.addProgram);
    // app.put('/api/program/update', programController.updateProgram);
    // app.delete('/api/program/delete/:Id', programController.deleteProgram);
    // app.get('/api/program/item/:Id', programController.ProgramById);
    // app.get('/api/program/list/:programTypeId', programController.ProgramList);

    
    

    app.get('/api/getPaymentMethod', guestAccess, sponsorshipController.retrieveStripeSubscription);

    app.get('/api/getCustomerDefaultPaymentMethod', isAuthenticated, sponsorshipController.getCustomerDefaultPaymentMethod);
    
    


    app.post('/api/program/add', isAuthenticated, programController.addProgram);
    app.put('/api/program/update', isAuthenticated, programController.updateProgram);
    app.delete('/api/program/delete/:Id', isAuthenticated, programController.deleteProgram);
    app.get('/api/program/item/:Id', programController.ProgramById);
    app.get('/api/program/list/:programTypeId/:userLang', programController.ProgramList);
    app.get('/api/programs', programController.ProgramList);
    app.get('/api/programsByLang/:userLang', programController.programListByLang);
    app.get('/api/programs/getCategoryBySub/:subCategoryId', programController.ProgramOfSubCategories);



    app.post('/api/program/related/list/', programController.RelatedProgramList);
    app.get('/api/program/itemlist/:programName/:userLang', programController.KhumsSubProgramList);
    app.get('/api/program/item/:Id/:userLang', programController.ProgramByIdAndLang);


    //program subcategory
    app.post('/api/program/subcategory/add', isAuthenticated, programSubCategoryController.addProgramSubCategory);
    app.get('/api/program/subcategory/list/:programTypeID/:userLang', isAuthenticated, programSubCategoryController.ProgramSubCategoryList);
    app.get('/api/program/subcategory/listWithAll/:programTypeID/:userLang', isAuthenticated, programSubCategoryController.ProgramSubCategoryWithInActiveList);

    //Occasion
    app.post('/api/ocassion/add', isAuthenticated, occasionController.addOccasion);
    app.get('/api/ocassion/list/:lang', isAuthenticated, occasionController.OccasionList);
    app.get('/api/ocassion/bySubCategory/:subCategoryId', occasionController.OccasionBySubCategory);
    app.get('/api/ocassion/activeOccasionsList', isAuthenticated, occasionController.ActiveOccasionsList);
    app.delete('/api/ocassion/delete/:Id', isAuthenticated, occasionController.deleteOccasion);
    app.get('/api/ocassion/item/:Id', isAuthenticated, occasionController.OccasionById);
    app.put('/api/ocassion/update', isAuthenticated, occasionController.updateOccasion);
    app.get('/api/ocassion/getBySubCat/:Id', occasionController.getBySubCat);

    // Search Api
    app.get('/api/searchPage/', pageController.searchPage);

    //Dua
    app.post('/api/dua/add', isAuthenticated, duaController.addDua);
    app.get('/api/dua/list/:lang', duaController.DuaList);
    app.delete('/api/dua/delete/:Id', isAuthenticated, duaController.deleteDua);
    app.get('/api/dua/item/:Id', isAuthenticated, duaController.DuaById);
    app.put('/api/dua/update', isAuthenticated, duaController.updateDua);
    app.get('/api/dua/getByOcassion/:Id', duaController.getByOcassion);

    app.put('/api/program/subcategory/update', isAuthenticated, programSubCategoryController.updateProgramSubCategory);
    app.get('/api/program/subcategory/item/:Id', programSubCategoryController.ProgramSubCategoryById);
    app.get('/api/program/subcategory/get/:userLang', programSubCategoryController.ProgramSubCategory);
    app.delete('/api/program/subcategory/delete/:Id', isAuthenticated, programSubCategoryController.deleteProgramSubCategory);


    //receipts
    app.get('/api/donation/receiptsDetails', donationController.getReceiptData);
    app.get('/api/donation/khumsReceipts', donationController.getKhumsReceipts);


    //donation Process
    app.post('/api/donationProcess/add', isAuthenticated, donationProcessController.addDonationProcess);

    /**  Orphan Content **/
    app.post('/api/orphan/add', isAuthenticated, orphanController.addOrphan);
    app.post('/api/orphan/addList', isAuthenticated, orphanController.addOrphanList);
    app.post('/api/orphan/uploadPhotos', isAuthenticated, uploadMulti.any(), orphanController.uploadPhotos);
    app.get('/api/orphan/list', isAuthenticated, orphanController.OrphanList);
    app.get('/api/orphan/orphanCount/:Id/:Syed/:Gender', orphanController.OrphanListByCount);
    app.get('/api/orphan/item/:Id', isAuthenticated, orphanController.OrphanById);
    app.delete('/api/orphan/delete/:Id', isAuthenticated, orphanController.deleteOrphan);
    app.put('/api/orphan/update', isAuthenticated, orphanController.updateOrphan);
    app.get('/api/orphan/OrphanListWithPriority', isAuthenticated, orphanController.OrphanListWithPriority);
    app.get('/api/orphan/OrphanListWithNoPriority', isAuthenticated, orphanController.OrphanListWithNoPriority);
    app.put('/api/orphan/updateSelectedOrphan',  orphanController.updateSelectedOrphan);
    app.get('/api/orphan/getSelectedOrphansStatus',  orphanController.getSelectedOrphansStatus);

    /** Currency */
    app.post('/api/currency/save', currencyController.addCurrency);
    app.post('/api/achievementRate/add', currencyController.addAchievementRates);
    app.get('/api/achievementRate/fetch/:currency', currencyController.getAchievementRates);
    app.post('/api/currency/update', currencyController.updateCurrency);
    app.get('/api/currency/get', currencyController.getCurrencyList);
    app.get('/api/currency/getByName/:name', currencyController.getCurrencyByName);
    app.get('/api/currency/getAllAvailableCurrency', currencyController.getAllAvailableCurrency);
    app.put('/api/currency/changeStatus',isAdmin,currencyController.changeCurrencyStatus);
    /** Currency */


    /** Donation Duration */
    app.get('/api/donationduration/list/:userLang', donationDurationController.DonationDurationList);
    app.get('/api/donation/total', donationController.donationTotal)
    app.get('/api/donation/getAutoRenewTotal', donationController.getAutoRenewTotal)
    /** Student Profile **/
    app.post('/api/studentProfile/add', isAuthenticated, studentProfileController.addStudentProfile);
    app.get('/api/studentProfile/list', studentProfileController.StudentsList);
    app.post('/api/studentProfile/addList', studentProfileController.addStudentList);
    app.get('/api/country/list', countryController.CountryList);
    app.get('/api/country/getCitiesByCountry/', countryController.getCitiesByCountry);
    app.get('/api/sdoz/list', sdozController.sdozList);
    app.get('/api/fitrahsubtype/list', fitrahsubtypeController.fitrahsubtypeList);
    app.get('/api/sahms/list', sahmController.sahmsList);
    app.get('/api/languages/list', isAuthenticated, languagesController.LanguagesList);
    app.delete('/api/studentProfile/delete/:Id/:isActive', isAuthenticated, studentProfileController.deleteStudent);
    app.get('/api/studentProfile/item/:Id', isAuthenticated, studentProfileController.StudentById);
    app.put('/api/studentProfile/update', isAuthenticated, studentProfileController.updateStudent);
    app.get('/api/studentProfile/studentsCount/:Id/:Syed', studentProfileController.StudentListByCount);
    app.get('/api/studentProfile/StudentListWithPriority', isAuthenticated, studentProfileController.StudentListWithPriority);
    app.get('/api/studentProfile/StudentListWithNoPriority', isAuthenticated, studentProfileController.StudentListWithNoPriority);

    /**Photo Api */
    app.post('/api/studentProfile/uploadPhotos', utilsController.uploadPhotos)
    /** Donation Api */
    app.post('/api/donation/add', donationController.addDonation);
    app.post('/api/donation/insert-donation-manual', donationController.insertDonationInDB);
    app.post('/api/donation/addDirectDonation', donationController.addDonationDirect);
    app.post('/api/create/customer', donationController.createCustomer);
    app.post('/api/checkout', donationController.checkOut);
    app.post('/api/stripe-checkout', donationController.stripeCheckout);
    app.post('/api/sendEmail', emailController.sendEmail);
    app.post('/api/sendReceiptEmail', emailController.sendReceiptEmail);
    app.post('/api/sendEmailWithReceipt', emailController.sendEmailWithReciept);
    app.post('/api/donation/reccurring-by-user-id', isAuthenticated, donationController.getActiveRecurringDonationsByUserID);
    app.post('/api/donation/updateDonationWithDocument', donationController.updateDonationWithDocument)
    app.get('/api/perform-donation', donationController.performDonation);
    app.get('/api/donation/reccurring-by-user-id', isAuthenticated, donationController.getActiveRecurringDonationsByUserID);
    app.get('/api/donation/getDonationListByUser', isAuthenticated, donationController.DonationById);
    app.get('/api/donation/getDonationDetailsListByUser', isAuthenticated, donationController.donationDetailsByUserId);
    app.get('/api/donation/reccurring-for-menu-visibility', isAuthenticated, donationController.getRecurringDonationsForMenuVisibility);
    

    /** Page content for Web**/
    app.post('/api/pageContent/save', isAuthenticated, pageContentController.savePageContent);
    app.post('/api/pageContent/update', isAuthenticated, pageContentController.updatePageContent);
    app.post('/api/pageContent/delete/:Id', isAuthenticated, pageContentController.deletePageContent);
    app.get('/api/pageContent/get/:pageName', pageContentController.getPageContentByName);
    app.get('/api/pageContent/all/:language', pageContentController.getAllPageContent);

    /** Dynamic Page content for Web**/
    app.post('/api/dynamicPageContent/save', isAuthenticated, dynamicPageContentController.savePageContent);
    app.post('/api/dynamicPageContent/delete/:Id', isAuthenticated, dynamicPageContentController.deletePage);
    app.get('/api/dynamicPageContent/getByTitle/:title', dynamicPageContentController.getPageContentByTitle);
    app.get('/api/dynamicPageContent/getById/:Id', dynamicPageContentController.getPageContentById);
    app.get('/api/dynamicPageContent/getPagesListByTitle/:title', dynamicPageContentController.getPagesListByName);
    app.get('/api/dynamicPageContent/getPagesListById/:Id', dynamicPageContentController.getPagesListById);
    app.get('/api/dynamicPageContent/getAllPagesList', dynamicPageContentController.getAllPagesList);


    // get page id by pageName
    app.get('/api/getPageIdByName/:name/:lang', dynamicPageContentController.getPageIdByName);

    /** NewsLetter Subscription**/
    app.post('/api/newsletterSubscription/subscribe', newslettersController.addSubscription);
    app.post('/api/newsletterSubscription/unSubscribe', newslettersController.deactivateSubscription);
    app.get('/api/newsletterSubscription/list', isAuthenticated, newslettersController.getSubscribesList);






    /** Representative**/
    app.post('/api/representative/save', isAuthenticated, representativeController.saveRepresentative);
    app.post('/api/representative/delete/:Id', isAuthenticated, representativeController.deleteRepresentative);
    app.get('/api/representative/get/:Id', isAuthenticated, representativeController.getRepresentativeById);
    app.get('/api/representative/list/:isActive', representativeController.getRepresentativesList);
    app.post('/api/representative/changeStat/:Id', isAuthenticated, representativeController.changeRepresentativeStat);

    /** Web Settings**/
    app.post('/api/webSettings/saveUpdate', isAuthenticated, webSettingsController.saveWebSettings);
    app.get('/api/webSettings/get', webSettingsController.getWebSettings);

    /** Campaign**/
    app.post('/api/campaign/save', isAuthenticated, campaignController.saveCampaign);
    app.post('/api/campaign/deActivate/', isAuthenticated, campaignController.deActivateCampaign);
    app.post('/api/campaign/delete/:Id', isAuthenticated, campaignController.deleteCampaign);
    app.get('/api/campaign/get/:Id', isAuthenticated, campaignController.getCampaignById);
    app.get('/api/campaign/list', campaignController.getCampaignList);
    app.get('/api/campaign/activeList', campaignController.getActiveCampaignList);

    /** Student Sponsorship **/
    app.get('/api/studentSponsorship-by-user-id/list', isAuthenticated, studentSponsorshipController.getStudentsListByDonarId);

    /** Orphan Sponsorship **/
    app.get('/api/orphanSponsorship-by-user-id/list', isAuthenticated, orphanScholarshipController.getOrphanListByDonarId);

    /** Sponsorship **/
    app.get('/api/expiringSponsorship-by-user-id/list', isAuthenticated, sponsorshipController.getExpiredSponsorshipsByDonarId);
    app.post('/api/renewSponsorships', isAuthenticated, sponsorshipController.renewExpiredSponsorships);
    app.post('/api/renewOrphanSponsorshipsWithoutPayment', isAdmin, sponsorshipController.renewOrphanSponsorshipsWithoutPayment);
    app.get('/renewOrphanSponsorships', sponsorshipController.renewOrphanSponsorships);
    app.get('/payFailedInvoice', paymentController.payFailedInvoice);
    app.get('/renewOrphanSponsorshipSubscription', sponsorshipController.renewOrphanSponsorhsipInGracePeriod);
    
    app.get('/api/program/configSetting',translateController.getNoteBasedOnSlug );

    app.get('/api/renewal/sadaqah',sadaqahController.renewSadaqah );

    app.post('/correctSubsequentPaymentMissingData',isAdmin, paymentController.correctSubsequentPaymentMissingData);

    /** Suggested Donations**/
    app.post('/api/suggestedDonations/save', isAuthenticated, SuggestedDonationsController.saveSuggestedDonation);
    app.get('/api/suggestedDonations/get/:language', isAuthenticated, SuggestedDonationsController.getSuggestedDonations);
    app.post('/api/suggestedDonations/delete/:Id', isAuthenticated, SuggestedDonationsController.deleteSuggestedDonation);

    /** Ziyarat**/
    app.post('/api/ziyarat/save', ZiyaratController.saveZiyarat);
    app.post('/api/ziyarat/saveZiyaratList', ZiyaratController.saveZiyaratList);
    app.get('/api/ziyarat/getConsultantEmail', ZiyaratController.getConsultantEmail);
    app.get('/api/ziyarat/get', isAuthenticated, ZiyaratController.getZiyaratList);
    app.get('/api/ziyarat/getActive', isAuthenticated, ZiyaratController.getActiveZiyaratList);
    app.get('/api/ziyarat/getSelectedZiyaratList', ZiyaratController.getSelectedZiyaratList);
    app.post('/api/ziyarat/sendEmailtoZaireen', ZiyaratController.sendEmailtoZaireen);
    app.get('/api/ziyarat/getZiyaratByUserId', ZiyaratController.getZiyaratByUserId);
    app.get('/api/ziyarat/getZiyaratSetting', ZiyaratController.getZiyaratSetting);
    app.post('/api/ziyarat/saveZiyaratSetting', ZiyaratController.saveZiyaratSetting);



    app.post('/api/ziyarat/triggerZaireenNotificationStatus', ZiyaratController.triggerZaireenNotificationStatus);
    app.get('/api/ziyarat/validateZaireenNotificationStatus', ZiyaratController.validateZaireenNotificationStatus);
    /** Reports **/
    function isAdmin(req, res, next) {
        let keyAuthorization = req.headers.authorizationkey && configuration.authorization.key ? req.headers.authorizationkey == configuration.authorization.key : false;

        if ((req.session.user && req.session.role && (req.session.role.indexOf('admin') || req.session.role.indexOf('super admin')))
            || (req.headers.bypassauth && configuration.app.byPassAPIAuth) || keyAuthorization)
            return next();
        res.status(401).json({ message: 'not allowed!' });
    }
    // Reports Requests for Admin Only
    app.get('/api/report/donarWiseReport', isAdmin, ReportsController.getDonarWiseReport);
    app.get('/api/report/projectionReport', isAdmin, ReportsController.getProjectionReport);
    app.get('/api/report/khumsReport', isAdmin, ReportsController.getKhumsReport);
    app.get('/api/report/profileReport', isAdmin, ReportsController.getProfileReport);
    app.get('/api/report/sponsorshipReportOrphan', isAdmin, ReportsController.getOrphansScholarship);
    app.get('/api/report/sponsorshipReportStudent', isAdmin, ReportsController.getStudentSponsorship);
    app.get('/api/report/getDonations', isAdmin, ReportsController.getDonations);
    app.get('/api/report/getRecurringDonations', isAdmin, ReportsController.getRecurringDonations);


    /** Volunteer**/
    app.post('/api/volunteer/save', VolunteerController.saveVolunteer);
    app.get('/api/volunteer/get', isAuthenticated, VolunteerController.getAllVolunteerList);


    /** Manage Orphans**/
    app.get('/api/manageOrp/getOrphansRecurring', isAuthenticated, manageOrphanController.getOrphansRecurring);
    app.post('/api/manageOrp/changeOrphan', isAuthenticated, manageOrphanController.changeOrphan);
    app.post('/api/manageOrp/cancelOrphan', isAuthenticated, manageOrphanController.cancelOrphan);
    app.post('/api/manageOrp/updateSponsorship', isAuthenticated, manageOrphanController.updateSponsorship);

    /** Manage Student**/
    app.get('/api/manageStu/getStudentsRecurring', isAuthenticated, manageStudentController.getStudentsRecurring);
    app.post('/api/manageStu/changeStudent', isAuthenticated, manageStudentController.changeStudent);
    app.post('/api/manageStu/cancelStudent', isAuthenticated, manageStudentController.cancelStudent);

    /** Send Email to Admin From Contact Us**/
    app.post('/api/sendEmailContactUs', emailController.sendEmailContactUs);
    app.get('/api/getContactUsList', pageController.getContactUsList)

    /**Payment API */
    app.post('/api/payment-stripe', donationController.performDonation);
    app.get('/api/get-donation-status', donationController.getDonationStatus);
    app.get('/api/payment/', paymentController.getPayment);
    app.get('/api/payment/donationPaymentSave', paymentController.donationPaymentSave);
    app.get('/api/sendZaireenList', ScheduleController.sendZaireenList);

    //Stripe webhook events handler
    app.post('/api/stripeWebhookHandler', paymentController.stripeWebhookHandler);

    // checksponsorship
    app.post('/api/checkSponsorships', cartController.checkSponsorships);
    // READ JSON FOR TRANSLATION 
    app.get('/api/translation/:language', translateController.readJSON);
    /** Manage Students**/
    // app.post('/api/volunteer/save', VolunteerController.saveVolunteer);
    // app.get('/api/volunteer/get', isAuthenticated, VolunteerController.getAllVolunteerList);

    // start 

    // schedule.scheduleJob('0 0 3 * * *', function () {
    // ScheduleController.donateRecurringByDonars();
    // });
    // schedule.scheduleJob('0 0 3 * * *', function () {
    // ScheduleController.reminderEmailBefore48Autorenewal();
    // });

    // schedule.scheduleJob('0 0 5 * * *', function () {
    // ScheduleController.reminderEmailAfter30DaysnonPayment();
    // });

    // schedule.scheduleJob('0 0 3 * * *', function () {
    // ScheduleController.reminderEmailAfter30DaysnonPaymentHawzah();
    // });
    // schedule.scheduleJob('0 0 3 * * *', function () {
    // ScheduleController.donateRecurringByDonars();
    // });

    // schedule.scheduleJob('0 0 3 * * *', function () {
    // ScheduleController.reminderEmailAfter30DaysNonPaymentDAZ();
    // });

    //    // schedule.scheduleJob('0 0 3 * * *', function () {
    //     ScheduleController.reminderEmailSadaqahADay();
    // // });

    // End

    /** send Zaireen list to consultant on EVERY Thursday 3PM for PRODUCTION**/
    /*  schedule.scheduleJob('0 0 15 * * 4', function () {
        ScheduleController.sendZaireenList();
     });*/

    /** send Zaireen list to consultant everyday at 3PM for TESTING **/
    // schedule.scheduleJob('0 0 15 * * *', function () {
    //     ScheduleController.sendZaireenList();
    // });

    app.get('/api/clear-all-cache', isAdmin, testController.clearAllCacheKeyValues);
    app.get('/api/get-all-cache', isAdmin, testController.getAllCacheKeyValues);

    //Saqadah api
    app.post('/api/sadaqah/insertSadaqahDetails', isAdmin, sadaqahController.insertSadaqahDetails);
    app.post('/api/sadaqah/getSadaqahDetailsReport', isAdmin, sadaqahController.getSadaqahDetailsReport);
    app.post('/api/sadaqah/calculateSadaqah', isAdmin, sadaqahController.calculateSadaqah);
    app.post('/api/sadaqah/performSadaqahSubscriptionEndedWork', isAdmin, sadaqahController.performSadaqahSubscriptionEndedWork);

    //subscription api
    app.get('/api/donorProgram/getdonorProgramsListByUser/:language', isAuthenticated, donorProgramController.getdonorProgramsListByUser);
    app.post('/api/donorProgram/cancelSubscription/:stripeSubscriptionId', isAuthenticated, donorProgramController.cancelSubscription);
    app.post('/api/donorProgram/toggleAutoRenewal/:donorProgramID/:autoRenewFlag', isAuthenticated, donorProgramController.toggleAutoRenewal);
    app.post('/api/handlePayment', guestAccess, paymentController.handlePayment);
    app.post('/api/donorProgram/getDonorProgramDetails/:Id', isAuthenticated, donorProgramController.getDonorProgramDetailByDonorProgramID);

    app.post('/api/handleFailedPaymentRecharge', paymentController.handleFailedPaymentRecharge);

    app.get('/api/getSponsorshipPlanRatesCurrencyWise',isAdmin, donorProgramService.getSponsorshipPlanRatesCurrencyWise);


    //generic get item from collection
    app.post('/api/getitem', guestAccess, dataController.getItem); // make guest acess here again
    app.post('/api/getitems', isAuthenticated, dataController.getItems);

    //Aytamuna Report
    app.post('/api/aytamunaReport/performStatusUpdate', isAdmin, ReportsController.updateStatusForAytamunaReport);


    
    app.get('/api/sendOrphanSponsorshipNotification', emailNotificationController.sendOrphanSponsorshipNotification);
};