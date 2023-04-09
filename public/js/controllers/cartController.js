(function () {

    angular.module('mainApp').controller('cartController', cartController);

    function cartController($scope, $compile, $rootScope, $translate, $state, $location, $window, SessionService, cartService, currencyService, countryService, userService, donarService, donationService, paymentService, logsService, orphanService, utilService, config,eventLogsService) {

        var vm = this;

        vm.countryCodeList = [];
        vm.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        vm.years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];


        vm.getCartDetail = getCartDetail;
        vm.checkout = checkout;
        vm.addCartItem = addCartItem;
        vm.updateCartItem = updateCartItem;
        vm.removeCartItem = removeCartItem;
        vm.cartCheckOut = cartCheckOut;
        vm.getCountryCode = getCountryCode;
        vm.getCountries = getCountries;
        vm.accountDetailPopup = accountDetailPopup;
        vm.getDonar = getDonar;
        vm.addDonarAccountDetail = addDonarAccountDetail;
        vm.registerDonorAndCheckout = registerDonorAndCheckout;
        vm.donationSuccessful = donationSuccessful;
        vm.leadZeroNotAllowed = leadZeroNotAllowed;
        vm.userLanguage = localStorage.getItem('lang');
        let CART_CONTROLLER = 'cartController.js';
        let methodName = '';

        $rootScope.$on('userDetail', function (event, data) {
            if (data) {
                $scope.userEmail = data && data.email;
                vm.donarEmail = $scope.userEmail;
            }
        })

        function checkout() {
            vm.updateCartItem();
        }


        vm.totalAmount = 0;
        $scope.currency = JSON.parse(sessionStorage.getItem('currency'));
        $scope.showMessage = function (message) {
            let mesg = message.replace(/%20/g, " ");
            let email = mesg.split(" ");
            let symbol = '';
            symbol = email[3];
            email = email[email.length - 1];
            let currency = mesg.match(/\d+/g)[0];
            if (mesg.match(/USD/)) {
                symbol = 'USD';
            } else if (mesg.match(/GBP/)) {
                symbol = 'GBP';
            } else if (mesg.match(/EUR/)) { symbol = 'EUR' }
            if (localStorage.getItem('lang') == 'ARB') {
                mesg = `تم التبرع بمبلع ${currency} ${symbol}  بنجاح، وتم إرسال الإيصال الى البريد الألكتروني ${email}`;
            } else if (localStorage.getItem('lang') == 'FRN') {
                mesg = `Votre don de ${currency} ${symbol}  a été traité avec succès. Un reçu vous a été envoyé par mail à  ${email}`;
            } else {
                mesg = `Your donation of ${symbol} ${currency} has been successfully processed. An email receipt has been sent to ${email}`
            }
            return mesg;
        }

        function donationSuccessful() {
            var url = $location.url();
            var arr = url.split("/");
            var name = arr[arr.length - 1];
            vm.message = $scope.showMessage(name);
            setTimeout(() => {
                $state.go('home');
            }, 5 * 1000);
        }

        function addDonarAccountDetail() {
            let obj = new Object();
            $rootScope.userDetail;
            obj = vm.donarDetail;
            let accountDetail = {};
            accountDetail.accountHolderName = $rootScope.userDetail.fullName || obj.donarName || vm.accountHolderName;
            accountDetail.cardNumber = vm.creditCardNumber;
            accountDetail.expiryMonth = vm.expiryMonth;
            accountDetail.expiryYear = vm.expiryYear;
            accountDetail.CVC = vm.CVC;
            obj.accountDetail = accountDetail;
            obj.donarEmailWithoutLogin = vm.donarEmail;
            donarService.addAccountDetail(obj).then(function (res) {
                swal({
                    title: $translate.instant('added successfully'),
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false
                });
                jQuery('#rootModal').modal('hide');
                emptyCardDetails();
                getDonar();
            });
            let userDetail = {
                _id: vm.donarDetail.user[0],
                email: vm.donarEmail,
                mobile: vm.donarPhone,
                country: vm.selectedCountry
            }
            userService.updateUser(userDetail).then(function (res) {
                clearUserDetails();
            });
        }

        function emptyCardDetails() {
            vm.accountHolderName = null;
            vm.cardNumber = null;
            vm.expiryMonth = null;
            vm.expiryYear = null;
            vm.CVC = null;
        }

        //Function to Get Donor
        function getDonar() {
            let userId = $rootScope.userId;
            if (userId != undefined) {
                donarService.getDonarById(userId).then(function (res) {
                    if (res.data == "") {
                        vm.donarDetail = {};
                        vm.DonarDetailForm = true;
                        // $rootScope.isLogin = false;
                    } else {
                        vm.donarDetail = res.data || {};
                        vm.accountDetails = vm.donarDetail.accountDetails;
                        if (vm.accountDetails && !vm.accountDetails.length) {
                            vm.DonarDetailForm = true;
                        } else vm.DonarDetailForm = false;
                    }
                });
            } else vm.DonarDetailForm = true;
        }

        function accountDetailPopup() {
            jQuery('#rootModal').modal('show');
        }

        var stripe = Stripe(config.Stripe.PublishKey);
        //Function To register User 
        function registerDonorAndCheckout() {
            methodName = 'registerDonorAndCheckout()';
            let obj = getUserobject();

            try {
                logMessage(`${methodName}: Step:1 getUserobject`, obj ? obj : '');

                vm.processing = true;
                if (!$rootScope.isLogin) {
                    logMessage(`${methodName}: Step:2 registerGuestUser`, obj ? obj : '');

                    userService.registerGuestUser(obj).then(function (res) {
                        // if already a guest user found then res will be donor
                        if (res.status == 409) {
                            logMessage(`${methodName}: Step:3 registerGuestUser: guest user already exists`, obj ? obj : '');

                            vm.donarDetail = res.data;
                            cartCheckOut();
                        } else if (res.status == 200) {
                            obj.user = res.data.user;
                            logMessage(`${methodName}: Step:3 registerGuestUser: registerDonar`, obj ? obj : '');

                            // obj.accountDetail = accountDetail;
                            donarService.registerDonar(obj).then(function (res) {
                                if (res.status == 409) {

                                    swal({
                                        title: $translate.instant(res.data),
                                        position: 'center-center',
                                        type: 'error',
                                        allowOutsideClick: false,
                                    }).then(function () {
                                        window.location = "#/checkout";
                                    });
                                } else {
                                    vm.donarDetail = res.data;
                                    cartCheckOut();
                                }
                            });
                        } else {
                            logMessage(`${methodName}: registerGuestUser: error`, obj ? obj : '', true);

                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'error',
                                allowOutsideClick: false,
                            })
                        }
                    });
                } else {
                    obj.user = $rootScope.userDetail;
                    logMessage(`${methodName}: Step:2 registerDonar`, obj ? obj : '');

                    donarService.registerDonar(obj).then(function (res) {
                        vm.donarDetail = res.data;
                        vm.user = vm.donarDetail && vm.donarDetail.user;
                        cartCheckOut();
                    });
                }
            }
            catch (e) {
                logMessage(`${methodName}: Error`, e, true);
            }
        }

        //Get User
        function getUserobject() {
            var obj = {};
            vm.donarName = ($rootScope.userDetail && $rootScope.userDetail.fullName) || vm.cardHolderName || vm.donarName;
            obj.userName = vm.donorDetails.username;
            obj.fullName = vm.donorDetails.donarName;
            obj.role = "donar";
            obj.password = generatePassword();
            obj.email = vm.donorDetails.username;
            obj.mobile = vm.selectedCountryCode + vm.donarPhone;
            obj.gender = vm.gender;
            obj.countryOfResidence = vm.donorDetails.selectedCountry && vm.donorDetails.selectedCountry.name;
            obj.userLang = localStorage.getItem('lang');
            return obj;
        }

        function generatePassword() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        //Get User
        function clearUserDetails() {
            vm.donarName = null;
            vm.donarEmail = null;
            vm.donarPhone = null;
            vm.gender = null;
            vm.selectedCountry = null;
        }

        //Get Country Code List
        function getCountryCode() {
            countryService.getCountryCode().then(function (res) {
                vm.countryCodeList = res;
                vm.countryCodeList = vm.countryCodeList.map(c => {
                    c.dialCode = c.dialCode.replace(/\s/g, '');
                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;
                    }
                    return c;
                })
                vm.countryCodeList = vm.countryCodeList.sort((a, b) => a.dialCode - b.dialCode)


            });
        }
        $scope.selectCountryCode = function (data) {
            if (data && vm.countryCodeList && vm.countryCodeList.length) {
                vm.selectedCountryCode = vm.countryCodeList.find(obj => obj.name == (data.name || data)).dialCode;
            }
        }
        //Get Country List
        function getCountries() {
            countryService.getCountryList().then(function (res) {
                vm.countries = res.data;
                vm.countries = vm.countries.map(c => {
                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;
                    }
                    return c;
                })
            });
        }
        //Checkout
        function cartCheckOut() {
            methodName = 'cartCheckOut()';
            logMessage(`${methodName}: Step:1 Set stripe key`, vm ? vm : '');

            var stripe = Stripe(cartService.stripePublishKey);
            vm.processing = true;
            logMessage(`${methodName}: Step:2 getCartDetail()`, vm ? vm : '');

            cartService.getCartDetail().then(function (result) {
                vm.donarEmail = $scope.userEmail;

                $scope.currencyObj = JSON.parse(sessionStorage.getItem('currency'));
                var itemList = [];
                var totalPrice = 0;
                var itemCount = 0;
                result.data.items.forEach(function (item) {
                    var amount = 1;

                    if (item.hasOwnProperty('programSubCategory') && item.programSubCategory != null && item.programSubCategory.constructor === Array) {
                        if (item.programSubCategory.length < 1) {
                            amount = item.program.donationProcess[0].amount;
                        } else {
                            amount = item.programSubCategory.fixedAmount;
                        }
                    } else {
                        if (!item.programSubCategory) {
                            amount = item.program.donationProcess[0].amount;
                        } else {
                            amount = item.programSubCategory.fixedAmount;
                        }
                    }


                    itemCount = item.totalAmount / amount;
                    if (item.program && (item.program.slug !== 'sadaqah-a-day' && item.program.slug !== 'sadaqah-for-holy-personalities')) item.currency.dollarAmount = item.currency.hajjAmount || amount;
                    if (item.currency.symbol != $scope.currencyObj.symbol) {
                        if (item.program && (item.program.slug !== 'sadaqah-a-day' && item.program.slug !== 'sadaqah-for-holy-personalities')) {
                            item.totalAmount = convertCurrencyToDollar(item);
                            let packageAmount = currencyService.currencyConversionFormula(item.totalAmount * $scope.currencyObj.rateExchange);
                            item = checkAndSetRecurrings(item);
                            item.totalAmount = packageAmount * (item.count || 1);
                            item.totalSubscriptionAmount = item.totalAmount;
                            // handling amount for recurring items on currency change
                            if (item.isRecurringProgram) {
                                if (item.paymentPlan && item.paymentPlan.Name != "GIVE_ONCE") {
                                    let duration = item.program.donationProcess[0].subscriptionDetail.duration.numOfMonths;
                                    let amountPerOrphan = Math.ceil(packageAmount / duration);
                                    item.totalAmount = (item.count || 1) * amountPerOrphan;
                                }
                            }
                        };
                        item.currency = $scope.currencyObj;
                    }
                    item.itemCount = itemCount;
                    itemList.push(item);
                    totalPrice += parseInt(item.totalAmount);
                    itemCount = 0;
                });
                result.data.items = itemList;

                vm.cartDetail = result.data;
                $rootScope.cartItems = vm.cartDetail && vm.cartDetail.items || [];
                vm.totalAmount = totalPrice;
                if (!vm.totalAmount) {
                    swal({
                        title: $translate.instant("Amount Cannot be 0"),
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    });
                    vm.processing = false;
                    return;
                }
                let obj = new Object();
                obj.amount = vm.totalAmount;
                obj.donar = vm.donarDetail;
                obj.donarEmail = vm.donarEmail || vm.donarDetail.email;
                obj.selectedLang = $rootScope.loggedInUserDetails && $rootScope.loggedInUserDetails.language || localStorage.getItem('lang');
                obj.items = vm.cartDetail.items;
                obj.paymentCurrency = JSON.parse(sessionStorage.getItem('currency')).symbol;
                obj.paymentTitle = JSON.parse(sessionStorage.getItem('currency')).title;
                obj.country = vm.donorDetails.selectedCountry;

                //-------------------------------------------------            
                logMessage(`${methodName}: Step:3 stripeCheckout()`, vm ? vm : '');
                //-------------------------------------------------
                cartService.stripeCheckout(obj).then(resp => {
                    if (resp && resp.data && resp.data.session) {
                        stripe.redirectToCheckout({
                            sessionId: resp.data.session.id
                        })
                    } else if (resp.data.checkoutPageUrl) {
                        $window.location.href = resp.data.checkoutPageUrl;
                    } else {
                        logMessage(`${methodName}: Unable to process stripeCheckout request`, vm ? vm : '');

                        swal({
                            title: $translate.instant("Unable to process request, Please try again"),
                            position: 'center-center',
                            type: 'error',
                            allowOutsideClick: false,
                        });
                    }
                });
            });

        }

        function convertCurrencyToDollar(item) {
            if (item && item.currency && item.currency.dollarAmount) {
                return item.currency.dollarAmount;
            }
            if (item && item.currency) {
                let symbol = item.currency.symbol;
                switch (symbol) {
                    case '€':
                        item.totalAmount = item.totalAmount * 1.1575;
                        break;
                    case '£':
                        item.totalAmount = item.totalAmount * 1.32222;
                        break;
                    default:
                        break;
                }
            }

            return item.totalAmount;
        }

        function checkAndSetRecurrings(item) {
            if (item.program && item.program.slug == 'sadaqah-a-day') return item;
            if (item.isRecurring) {
                if (item.donationDuration && item.donationDuration.donationDurationName === $translate.instant('HALF YEARLY')) {
                    item.totalAmount = Math.round(item.totalAmount / 12).toFixed(2);
                } else if (item.donationDuration && item.donationDuration.donationDurationName === $translate.instant('YEARLY')) {
                    item.totalAmount = Math.round(item.totalAmount / 12).toFixed(2);
                } else if (item.donationDuration && item.donationDuration.donationDurationName === $translate.instant('QUARTERLY')) {
                    item.totalAmount = Math.round(item.totalAmount / 3).toFixed(2);
                } else if (item.isRecurring && item.programSubCategory && item.programSubCategory.slug === 'phd') {
                    item.totalAmount = Math.round(item.totalAmount / 5).toFixed(2);
                } else if (item.isRecurring && item.programSubCategory && item.programSubCategory.slug === 'masters') {
                    item.totalAmount = Math.round(item.totalAmount / 4).toFixed(2);
                } else if (item.isRecurring) {
                    item.totalAmount = Math.round(item.totalAmount / 12).toFixed(2);
                }
            } else {
                if (item.paymentType === $translate.instant('ONE TIME') && item.donationDuration && item.donationDuration.donationDurationName === $translate.instant('HALF YEARLY')) {
                    item.totalAmount = Math.round(item.totalAmount / 2).toFixed(2);
                }
            }

            return item;
        }

        function leadZeroNotAllowed(event) {
            if (!vm.donarPhone || (vm.donarPhone && vm.donarPhone.length < 1)) {
                let amount = String.fromCharCode(event.which || event.keyCode);
                let pattern = /^[1-9][0-9]*$/;
                if (!pattern.test(amount)) {
                    event.preventDefault();
                }
            }
        }
        //Get Cart Details
        function getCartDetail() {
            var url = $location.url();
            var arr = url.split("/");
            var cart = arr[arr.length - 1];
            if (localStorage.getItem('cart') != null && localStorage.getItem('cart') != "null" && localStorage.getItem('cart') != undefined && cart != 'cart') {
                {
                    var items = [];
                    items.push(JSON.parse(localStorage.getItem('cart')));
                    $scope.currencyObj = JSON.parse(sessionStorage.getItem('currency'));
                    var itemList = [];
                    var totalPrice = 0;
                    var itemCount = 0;
                    items.forEach(function (item) {
                        var amount = 1;

                        if (item.hasOwnProperty('programSubCategory') && item.programSubCategory != null && item.programSubCategory.constructor === Array) {
                            if (item.programSubCategory.length < 1) {
                                amount = item.program.donationProcess[0].amount;
                            } else {
                                amount = item.programSubCategory.fixedAmount;
                            }
                        } else {
                            if (!item.programSubCategory) {
                                amount = item.program.donationProcess[0].amount;
                            } else {
                                amount = item.programSubCategory.fixedAmount;
                            }
                        }
                        itemCount = item.totalAmount / amount;
                        if (item.program && (item.program.slug !== 'sadaqah-a-day' && item.program.slug !== 'sadaqah-for-holy-personalities')) item.currency.dollarAmount = item.currency.hajjAmount || amount;
                        if (item.currency.symbol != $scope.currencyObj.symbol) {
                            if (item.program && (item.program.slug !== 'sadaqah-a-day' && item.program.slug !== 'sadaqah-for-holy-personalities')) {
                                item.totalAmount = convertCurrencyToDollar(item);
                                let packageAmount = currencyService.currencyConversionFormula(item.totalAmount * $scope.currencyObj.rateExchange);
                                item = checkAndSetRecurrings(item);
                                item.totalAmount = packageAmount * (item.count || 1);
                                item.totalSubscriptionAmount = item.totalAmount;
                                // handling amount for recurring items on currency change
                                if (item.isRecurringProgram) {
                                    if (item.paymentPlan && item.paymentPlan.Name != "GIVE_ONCE") {
                                        let duration = item.program.donationProcess[0].subscriptionDetail.duration.numOfMonths;
                                        let amountPerOrphan = Math.ceil(packageAmount / duration);
                                        item.totalAmount = (item.count || 1) * amountPerOrphan;
                                    }
                                }
                            };
                            item.currency = $scope.currencyObj;

                        }
                        // item.itemCount = itemCount;
                        // itemList.push(item);
                        totalPrice += parseInt(item.totalAmount);
                        //itemCount = 0;
                    });
                    // result.data.items = itemList;

                    vm.cartDetail = {};
                    vm.cartDetail.items = [];
                    vm.cartDetail.items = items;
                    vm.totalAmount = totalPrice;
                    vm.donarEmail = $scope.userEmail;

                }
            } else {
                cartService.getCartDetail().then(function (result) {
                    vm.donarEmail = $scope.userEmail;

                    $scope.currencyObj = JSON.parse(sessionStorage.getItem('currency'));
                    var itemList = [];
                    var totalPrice = 0;
                    var itemCount = 0;
                    result.data.items.forEach(function (item) {
                        var amount = 1;

                        if (item.hasOwnProperty('programSubCategory') && item.programSubCategory != null && item.programSubCategory.constructor === Array) {
                            if (item.programSubCategory.length < 1) {
                                amount = item.program.donationProcess[0].amount;
                            } else {
                                amount = item.programSubCategory.fixedAmount;
                            }
                        } else {
                            if (!item.programSubCategory) {
                                amount = item.program.donationProcess[0].amount;
                            } else {
                                amount = item.programSubCategory.fixedAmount;
                            }
                        }


                        itemCount = item.totalAmount / amount;
                        if (item.program && (item.program.slug !== 'sadaqah-a-day' && item.program.slug !== 'sadaqah-for-holy-personalities')) item.currency.dollarAmount = item.currency.hajjAmount || amount;
                        if (item.currency.symbol != $scope.currencyObj.symbol) {
                            if (item.program && (item.program.slug !== 'sadaqah-a-day' && item.program.slug !== 'sadaqah-for-holy-personalities')) {
                                item.totalAmount = convertCurrencyToDollar(item);
                                let packageAmount = currencyService.currencyConversionFormula(item.totalAmount * $scope.currencyObj.rateExchange);
                                item = checkAndSetRecurrings(item);
                                item.totalAmount = packageAmount * (item.count || 1);
                                item.totalSubscriptionAmount = item.totalAmount;
                                // handling amount for recurring items on currency change
                                if (item.isRecurringProgram) {
                                    if (item.paymentPlan && item.paymentPlan.Name != "GIVE_ONCE") {
                                        let duration = item.program.donationProcess[0].subscriptionDetail.duration.numOfMonths;
                                        let amountPerOrphan = Math.ceil(packageAmount / duration);
                                        item.totalAmount = (item.count || 1) * amountPerOrphan;
                                    }
                                }

                            };
                            item.currency = $scope.currencyObj;
                        }
                        item.itemCount = itemCount;
                        itemList.push(item);
                        totalPrice += parseInt(item.totalAmount);
                        itemCount = 0;
                    });
                    result.data.items = itemList;

                    vm.cartDetail = result.data;
                    $rootScope.cartItems = vm.cartDetail && vm.cartDetail.items || [];
                    vm.totalAmount = totalPrice;
                });
            }
        }

        //function to add cart Item
        function addCartItem() {
            cartService.addCartItem(createCartObject()).then(function (res) { });
        }

        async function updateCartItems() {
            await cartService.updateCartItem(vm.cartDetail.items);
        }
        function getQurbaniPopUpText() {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            let dateInWords = utilService.stringToDate(updatedItemsQurbani[0].calendarForSacrifice, 'dd/mm/yyyy', '/')
            if (vm.userLanguage == 'ARB') {
                dateInWords = dateInWords.toLocaleDateString('ar-AE', options);
            }
            else if (vm.userLanguage == 'FRN') {
                dateInWords = dateInWords.toLocaleDateString('fr', options);
            }
            else {
                dateInWords = dateInWords.toLocaleDateString('en-US', options);
            }
            let progName = '';
            for (let j = 0; j < updatedItemsQurbani.length; j++) {
                if (j != updatedItemsQurbani.length - 1)
                    progName += updatedItemsQurbani[j].programSubCategory.programSubCategoryName + ' | ';
                else
                    progName += updatedItemsQurbani[j].programSubCategory.programSubCategoryName + '  ';
            }
            let popUpText = $translate.instant("SACRIFICE_QURBANI_TEXT").replace("[UPDATED_DATE]", dateInWords).replace("[PRODUCTS]", progName);
            return popUpText;
        }
        async function updateCartItem(toNavigate) {
            methodName = 'updateCartItem()';
            // check orphan here if still available or not 
            getCartDetail();
            let orphanReselection = await performOrphanReselection();
            let multipleRecurringPrograms = await checkForMultipleRecurringProgram();
            let programCalendarCheck = await validateQurbaniDate();
            if (orphanReselection) {
                proceedToOrphanReselection();
            }
            else {
                if (!multipleRecurringPrograms) {
                    if (programCalendarCheck) {
                        await proceedToCheckout();
                    }
                    else {
                        // Swal Multi button alert to take user consent if he wants to move forward or not 
                        //"continue to checkout with modifications?",
                        // "Some cart items that require 48 hours have been updated to the date (today +2) , Do you want to proceed to checkout ?"
                        swal({
                            title: $translate.instant("SACRIFICE_QURBANI_TITLE"),
                            html: getQurbaniPopUpText(),
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            confirmButtonText: $translate.instant("Yes"),
                            cancelButtonText: $translate.instant("No"),
                            allowOutsideClick: false
                        }).then((result) => { // <--
                            if (result.value) { // <-- if confirmed
                                for (let i = 0; i < updatedItemsQurbani.length; i++) {
                                    vm.cartDetail.items[updatedItemsQurbani[i].index] = updatedItemsQurbani[i];
                                }
                                updateCartItems();
                                proceedToCheckout();
                            }
                            else if (result.dismiss == 'cancel') {
                                removeCartItem(updatedItemsQurbani);
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        swal({
                                            title: $translate.instant("CONFLICTING_DATE_ITEM_NOTICE"),
                                            position: 'center-center',
                                            type: 'warning',
                                            timer: 5000
                                            // allowOutsideClick: false,
                                        });
                                        getCartDetail();
                                    });
                                }, 500);
                            }
                        });
                    }
                }
                else {
                      let eventObj = utilService.getEventObjMultipleSubscription(config.EventConstants.EventTypes.Checkout);
                       eventLogsService.addEventLog(eventObj);
                    swal({
                        title: $translate.instant("MULTIPLE_RECURRING_ITEM_ALERT"),
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                        html: createProgramListForErrorMessage(),
                        confirmButtonText: $translate.instant("Yes")
                    });
                }
            }
        }

        async function proceedToCheckout() {
            try {
                logMessage(`${methodName}: Step:1 Cart Checkout clicked`, '');

                let userId = $rootScope.userId;
                if (!userId) {
                    logMessage(`${methodName}: Step:2 userId check, userId not found`, '');
                    jQuery('#globalLoginModal').modal('show');
                    return;
                }
                let obj = new Object();
                obj.amount = vm.totalAmount;
                vm.donarDetail = await donarService.getDonarById(userId)
                logMessage(`${methodName}: Step:2 get DonarDetail By Id done`, vm.donarDetail ? vm.donarDetail : '');

                obj.donar = vm.donarDetail.data;
                obj.donarEmail = vm.donarEmail || vm.donarDetail.email;
                obj.selectedLang = $rootScope.loggedInUserDetails && $rootScope.loggedInUserDetails.language || localStorage.getItem('lang');
                obj.items = vm.cartDetail.items;
                obj.paymentCurrency = JSON.parse(sessionStorage.getItem('currency')).symbol;
                obj.paymentTitle = JSON.parse(sessionStorage.getItem('currency')).title;
                obj.country = vm.selectedCountry || $rootScope.loggedInUserDetails.country;

                logMessage(`${methodName}: Step:3a stripeCheckout() calling`, obj);
                console.log("bbbbbbbbbbbbbb")
                cartService.stripeCheckout(obj).then(resp => {
                    if (resp && resp.data && resp.data.session) {
                        logMessage(`${methodName}: Step:3b stripeCheckout() done`, resp);

                        stripe.redirectToCheckout({
                            sessionId: resp.data.session.id
                        })
                    } else if (resp.data.checkoutPageUrl) {
                        console.log(resp.checkoutPageUrl);
                        $window.location.href = resp.data.checkoutPageUrl;
                    } else {
                        logMessage(`${methodName}: Unable to process stripeCheckout request`, vm ? vm : '');

                        swal({
                            title: $translate.instant("Unable to process request, Please try again"),
                            position: 'center-center',
                            type: 'error',
                            allowOutsideClick: false,
                        });
                    }
                }).catch(function (exc) {
                    logMessage(`${methodName}: Error stripeCheckout`, exc, true);
                });
                return;

            } catch (error) {
                logMessage(`${methodName}: Error`, error, true);
            }
        }

        function proceedToOrphanReselection() {
            swal({
                title: $translate.instant("ORPHAN_UNAVAILABLE"),
                position: 'center-center',
                type: 'error',
                allowOutsideClick: false,
            });

            let orphanSponshorshipItem = vm.cartDetail.items.filter(item => item.program.slug == 'orphan-sponsorship');
            if (orphanSponshorshipItem.length == 1) {
                let index = vm.cartDetail.items.findIndex(item => item.program.slug == 'orphan-sponsorship');
                removeCartItem(orphanSponshorshipItem[0], index);


                $window.location.href = "/#/generalcaredetails/orphan-sponsorship?noOfOrphan=" + orphanSponshorshipItem[0].orphans.length + "&PP=" + orphanSponshorshipItem[0].paymentPlan.Name + "&autoRenew=" + orphanSponshorshipItem[0].isAutoRenew;
            }
        }

        async function performOrphanReselection() {
            let reselection = false;
            if (vm.cartDetail && vm.cartDetail.items.length > 0) {
                let orphanSponshorshipItem = vm.cartDetail.items.filter(item => item.program.slug == 'orphan-sponsorship');
                for (let i = 0; i < orphanSponshorshipItem.length; i++) {
                    let orphans = await orphanService.getSelectedOrphansStatus(orphanSponshorshipItem[i].orphans);
                    if (orphans && orphans.data.length != 0) {
                        reselection = true;
                    }
                }
            }

            return reselection;
        }

        async function checkForMultipleRecurringProgram() {
            let hasMultipleRecurringItems = false;
            if (vm.cartDetail && vm.cartDetail.items.length > 0) {
                console.log('recurring items', vm.cartDetail.items);
                let recurringItems = vm.cartDetail.items.filter(item => item.program.isRecurringProgram == true);
                if (recurringItems.length > 1) {
                    hasMultipleRecurringItems = true;
                }
            }
            return hasMultipleRecurringItems;
        }

        //-------------------- start Qurbani Sacrifice ------------------------


        let updatedItemsQurbani = [];

        async function assignIndex() {
            if (vm.cartDetail && vm.cartDetail.items.length > 0) {
                for (let i = 0; i < vm.cartDetail.items.length; i++) {
                    vm.cartDetail.items[i]['index'] = i;
                }

            }

        }


        async function validateQurbaniDate() {

            // loop through cart item and check if 'calendarForSacrifice'  property exist in cart item 
            // if exist , check if it is of 2 days ahead or not 
            try {
                await assignIndex();
                updatedItemsQurbani = [];
                let proceedForCheckout = true;
                if (vm.cartDetail && vm.cartDetail.items.length > 0) {
                    let calendarForSacrificeItem = vm.cartDetail.items.filter(item => item.calendarForSacrifice != undefined);
                    for (let i = 0; i < calendarForSacrificeItem.length; i++) {

                        let itemSacrificeDate = calendarForSacrificeItem[i].calendarForSacrifice;
                        let currentSacrificeDate = new Intl.DateTimeFormat('en-GB').format(new Date());
                        currentSacrificeDate = utilService.stringToDate(currentSacrificeDate, 'dd/mm/yyyy', '/');
                        let noOfDays = utilService.getNumberOfDays(currentSacrificeDate, utilService.stringToDate(itemSacrificeDate, 'dd/mm/yyyy', '/'));
                        // check above date with current date , if diffrece less than 2 ? update item date and notify user 
                        if (noOfDays < 2) {
                            proceedForCheckout = false;
                            let currentQurbaniDate = new Date(currentSacrificeDate.setDate(currentSacrificeDate.getDate() + 2));
                            calendarForSacrificeItem[i].calendarForSacrifice = new Intl.DateTimeFormat('en-GB').format(currentQurbaniDate);
                            updatedItemsQurbani.push(calendarForSacrificeItem[i]);
                        }
                    }
                }
                return proceedForCheckout;
            }
            catch (ex) {
                return true;
            }

        }



        //-------------------- end Qurbani Sacrifice ------------------------

        //Function to Remove Cart Item
        function removeCartItem(cartItem, index) {
            if (!Array.isArray(cartItem)) {
                cartItem = {
                    "cartItem": cartItem,
                    "index": index
                }
            }
            cartService.removeCartItem(cartItem).then(function (res) {
                $rootScope.$broadcast('getCartCounter');
                getCartDetail();
            })
        }

        function createCartObject() {
            let obj = new Object();
            return obj;
        }


        $scope.setCreditCard = function (cardNumber) {
            $scope.imgsrc = GetCardType(cardNumber);
        }

        function GetCardType(number) {
            if (number == undefined || number == null || number == "")
                return "../images/credit_card-01.png";

            var re = new RegExp("^4");
            if (number.match(re) != null)
                return "../images/visa.png";

            re = new RegExp("^(34|37)");
            if (number.match(re) != null)
                return "../images/american%20express.png";

            re = new RegExp("^5[1-5]");
            if (number.match(re) != null)
                return "../images/mastercard.png";

            re = new RegExp("^6011");
            if (number.match(re) != null)
                return "../images/discover.png";

            return "../images/credit_card-01.png";
        }

        $scope.clearLocal = function () {
            localStorage.setItem('cart', null);
        }

        function logMessage(message, _data, isError) {
            try {
                let msg = `${CART_CONTROLLER}: ${message}`;
                isError ? logsService.insert({
                    action: msg,
                    error: {
                        type: 'Error',
                        data: _data
                    }
                }).then(function (res) { })
                    :
                    logsService.insert({
                        action: msg,
                        error: {
                            type: 'Info',
                            data: _data
                        }
                    }).then(function (res) { });
            }
            catch (exc) {
                console.log('Error in logMessage() front end: ' + exc.message);
            }
        }

        jQuery(".showHelp").hide();
        jQuery("#showHideBtn").hover(function () {
            jQuery(".showHelp").slideToggle(200);
        }, function () {
            jQuery(".showHelp").slideToggle(200);
        });

        function createProgramListForErrorMessage() {
            let programList = [];
            let recurringItems;
            let lang = localStorage.getItem('lang');
            var htmlString = `<ul class="program-names-list ${lang}">`;

            if (vm.cartDetail && vm.cartDetail.items.length > 0) {
                recurringItems = vm.cartDetail.items.filter(item => item.program.isRecurringProgram == true);
            }

            for (let index = 0; index < recurringItems.length; index++) {
                if (!programList.find(function (item) {
                    return (item === recurringItems[index].program.programName);
                })) {
                    programList.push(recurringItems[index].program.programName);
                    htmlString += '<li>' + recurringItems[index].program.programName + '</li>';
                }
            }
            htmlString += '</ul>'
            return htmlString;
        }

    }
})()