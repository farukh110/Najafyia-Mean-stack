(function () {

    angular.module('mainApp').controller('loginController', LoginController);


    function LoginController($scope, $state, $stateParams, $compile, $rootScope, $location, $window, $translate, loginService, cartService, SessionService, donarService, smsAPIService, countryService, ziyaratService, config) {

        var vm = this;
        vm.loginDetails = {};
        vm.registrationDetails = {
            firstName: null,
            lastName: null,
            userName: null,
            password: null,
            language: null,
            countryOfResidence: null,
            gender: null
        };

        vm.countries = [];
        $scope.showNotification = false;
        $scope.showLogin = true;

        vm.donateWithOutLogin = donateWithOutLogin;
        vm.ziyaratSignUp = ziyaratSignUp;
        vm.signUp = signUp;
        vm.donateLogin = donateLogin;

        vm.showHideLogin = showHideLogin;
        vm.loginFunc = loginFunc;
        vm.logout = logout;
        const list = null;
        vm.registration = registration;
        vm.getCountries = getCountries;
        vm.getPopup = getPopup;
        vm.getCartCount = getCartCount;
        vm.selectCountryCode = selectCountryCode;
        vm.clearData = clearData;

        $scope.inputType = 'password';
        vm.browserLanguage = localStorage.getItem('lang');
        // Hide & show password function
        $scope.hideShowPassword = function () {
            if ($scope.inputType == 'password')
                $scope.inputType = 'text';
            else
                $scope.inputType = 'password';
        };
        vm.isNumberKey = function ($event) {
            let amount = String.fromCharCode(event.which || event.keyCode)
            let pattern = /^[0-9]\d*(\.\d+)?$/;
            if (!pattern.test(amount)) {
                event.preventDefault()
            }
        }
        vm.isMobile = false;
        if (window.innerWidth < 600) {
            vm.isMobile = true;
        }

        function populateNotifications() {
            if (localStorage.getItem('donarId') != null && localStorage.getItem('donarId') != "null") {
                loginService.getRecurringDonations(localStorage.getItem("donarId"))
                    .then(function (result) {
                        localStorage.setItem("donarRecurringList", JSON.stringify(result.data));
                        if (localStorage.getItem('donarRecurringList') != null && localStorage.getItem('donarRecurringList') != undefined && localStorage.getItem('donarRecurringList') != "")
                            $scope.donationReoccuringList = JSON.parse(localStorage.getItem('donarRecurringList'));
                        if ($scope.donationReoccuringList != undefined && $scope.donationReoccuringList != null && $scope.donationReoccuringList != "") {
                            // $scope.programList = $scope.donationReoccuringList[0].program
                            $scope.programList = [];
                            angular.forEach($scope.donationReoccuringList, function (value, key) {
                                $scope.programList.push(value.program[0]);
                            });
                        }
                    }).catch(function (error) {
                        return error
                    });
                loginService.getTodaysCampaigns()
                    .then(function (result) {
                        localStorage.setItem("campaigns", result.length);
                        localStorage.setItem("campaignsData", JSON.stringify(result));
                        if ($stateParams.campaignCount != null && $stateParams.campaignCount != undefined)
                            $scope.campaignCount = $stateParams.campaignCount;
                        if (localStorage.getItem('campaigns') != null || localStorage.getItem('campaigns') != undefined)
                            $scope.campaignCount = localStorage.getItem('campaigns');
                        if (localStorage.getItem('campaignsData') != null || localStorage.getItem('campaignsData') != undefined)
                            $scope.campaignsList = JSON.parse(localStorage.getItem('campaignsData'));
                    }).catch(function (error) {
                        return error
                    });
            }
        }

        populateNotifications();

        function getPopup() {
            // let content = jQuery('#popup').html();
            // let compiledContent = $compile(content)($scope);
            // jQuery('[data-toggle="popover"]').popover({
            //     placement: 'bottom',
            //     title: '',
            //     html: true,
            //     content: compiledContent
            // });
        }

        function donateWithOutLogin() {
            var stripe = Stripe(cartService.stripePublishKey);
            jQuery('#globalLoginModal').modal('hide');
            jQuery('body').removeClass('modal-open');
            jQuery('.modal-backdrop').remove();
            if ($state.current.name == 'cart') {
                cartService.stripeCheckout({ items: $rootScope.cartItems }).then(resp => {
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
            } else {
                $state.go('cart');
            }
        }

        function ziyaratSignUp() {
            jQuery('#globalLoginModal').modal('hide');
            jQuery('body').removeClass('modal-open');
            jQuery('.modal-backdrop').remove();
            $state.go('ziyaratRegistration');
        }

        function signUp() {
            jQuery('#globalLoginModal').modal('hide');
            jQuery('body').removeClass('modal-open');
            jQuery('.modal-backdrop').remove();
            $state.go('registration');
        }

        function donateLogin(isValid, doLoginOnly) {
            if (!(vm.username || vm.loginDetails.username) && !vm.loginDetails.password) {
                return showError();
            }

            loginService.login({
                username: vm.username || vm.loginDetails.username,
                password: vm.loginDetails.password
            }).then(function (result) {
                if (result.status == 200) {
                    let user = result.data.user;
                    localStorage.setItem('lang', user.language || 'ENG');
                    let isAuthenticated = user.userName == undefined ? false : true;
                    $rootScope.isLogin = isAuthenticated;
                    if (isAuthenticated) {
                        loginService.getLoggedInUserDetails().then(function (res) {
                            $rootScope.loggedInUserDetails = {
                                userName: res.userName,
                                file: res.file,
                                fullName: res.fullName,
                                email: res.email,
                                gender: res.gender,
                                mobile: res.mobile,
                                country: res.countryOfResidence,
                                role: res.role
                            }
                        });
                    }
                    if (user) {
                        localStorage.setItem('userRole', user.role)
                    }

                    $rootScope.username = user.userName;
                    $rootScope.userId = user.id;

                    loginService.getDonarFromUser(result.data.user._id)
                        .then(function (result) {
                            localStorage.setItem("donarId", result.data._id);
                        }).catch(function (error) {
                            return error
                        });
                    $rootScope.userConfig = {
                        lang: (localStorage.getItem('lang') || 'ENG')
                    };

                    if (!sessionStorage.getItem('currency')) {
                        sessionStorage.setItem('currency', JSON.stringify({
                            'title': 'USD',
                            'symbol': '$', 'currencyName': 'United States Dollar', 'rateExchange': 1
                        }));
                    } else {
                        $rootScope.userConfig.currency = JSON.parse(sessionStorage.getItem('currency'));
                    }
                    jQuery('#globalLoginModal').modal('hide');
                    jQuery('#ziyaratLoginModal').modal('hide');
                    jQuery('body').removeClass('modal-open');
                    jQuery('.modal-backdrop').remove();


                    jQuery("#headerLoginPopup").removeClass('open');
                    vm.loginDetails.password = null;
                    vm.registrationDetails = {
                        firstName: null,
                        lastName: null,
                        userName: null,
                        password: null,
                        language: null,
                        countryOfResidence: null,
                        gender: null
                    };
                    $rootScope.$broadcast('$locationChangeStart');
                    $rootScope.$broadcast('$getZiyaratByUserId');

                    if (user.role && (typeof user.role == 'string' && user.role.toUpperCase() == 'ADMIN') || (user.role.length && user.role[0].toUpperCase() === "ADMIN")) {
                        $state.go("dashboard");
                        location.reload();
                    } else {
                        if (!doLoginOnly && loginService.requestForZiyarah) {
                            ziyaratService.getZiyaratByUserId().then(function (response) {
                                vm.registeredForZiyarat = response.data;
                                if (vm.registeredForZiyarat) {
                                    let validateMsg;
                                    validateMsg = $translate.instant('ALREADY REGISTERED FOR ZIYARAT')
                                    swal({
                                        title: validateMsg,
                                        position: "center-center",
                                        type: "error",
                                        allowOutsideClick: false
                                    });
                                } else {
                                    var obj = {
                                        fullName: $rootScope.loggedInUserDetails.fullName,
                                        email: $rootScope.loggedInUserDetails.email,
                                        phone: $rootScope.loggedInUserDetails.mobile,
                                        language: $rootScope.loggedInUserDetails.language,
                                        date: new Date(),
                                        country: $rootScope.loggedInUserDetails.country,
                                        hasAssigned: true,
                                    };
                                    ziyaratService.registerForZiyarat(obj).then(function (response) {
                                        if (response.status == 200) {
                                            if (response.data == config.Messages.ZiaratRegSuccess) {
                                                let toastMsg;
                                                if (localStorage.getItem('lang') == "ARB") {
                                                    toastMsg = 'تم حفظ الزيارة بنجاح';
                                                } else if (localStorage.getItem('lang') == "FRN") {
                                                    toastMsg = "Vous êtes inscrits pour la Ziyarah d'Imam Hussain (as) ce jeudi soir!";
                                                } else {
                                                    toastMsg = response.data;
                                                }
                                                swal($translate.instant('Success!'), toastMsg, "success");
                                            }
                                        } else {
                                            swal("Failed!", "Failed to save", "error");
                                        }
                                    });
                                }
                            });

                        } else {
                            location.reload();
                        }
                        // if (!dontRefresh) location.reload();

                        // else {
                        //     setTimeout(() => {
                        //         $state.go("cart");
                        //     }, 500);
                        // }
                    }
                } else {
                    let validateMsg;
                    if (localStorage.getItem('lang') == 'ARB') {
                        validateMsg = ".تسجيل الدخول غير صحيح! حاول مرة اخرى";
                    } else if (localStorage.getItem('lang') == 'FRN') {
                        validateMsg = "Login échoué. Réessayez.";
                    } else {
                        validateMsg = "Login failed! Please try again.";
                    }
                    swal({
                        title: validateMsg,
                        position: 'center-center',
                        type: 'error',
                        timer: 1000,
                        showConfirmButton: false,
                    });
                    vm.loginDetails.password = null;
                }
            });

        }

        function showHideLogin(name) {
            event.stopPropagation();
            jQuery("#headerLoginPopup").addClass('open');
            clearData();
            if (name === 'LOGIN') {
                $scope.showLogin = true;
            } else {
                $scope.showLogin = false;
            }

        }

        function loginFunc(isValid) {
            if (isValid) {
                var params = {
                    username: $scope.username,
                    password: $scope.password
                }
                loginService.login(params).then(function (result) {
                    if (result.status == 200) {
                        localStorage.setItem('lang', result.data.user.language);
                        loginService.getDonarFromUser(result.data.user._id)
                            .then(function (result) {
                                localStorage.setItem("donarId", result.data._id);
                            }).catch(function (error) {
                                return error
                            });
                        if (result.data.user.role == "donor") {
                            $window.location.href = "/#/home";
                            toastr.success("Welcome " + result.data.user.fullName);
                            $state.go("donarDashboard", {
                                'campaignCount': $scope.campaignCount,
                                'userId': result.data.user._id
                            });
                        }
                        if (result.data.user.role == "consultant") {
                            $window.location.href = "/#/zaireenList";
                            toastr.success("Welcome " + result.data.user.fullName);
                            $state.go("zaireenList");
                        } else {
                            $window.location.href = "/#/admin/dashboard";
                        }
                        $rootScope.userConfig = {
                            lang: (localStorage.getItem('lang') || 'ENG')
                        };

                        if (!sessionStorage.getItem('currency')) {
                            //currency default setting
                            sessionStorage.setItem('currency', JSON.stringify({
                                'title': 'USD',
                                'symbol': '$', 'currencyName': 'United States Dollar', 'rateExchange': 1
                            }));
                        } else {
                            $rootScope.userConfig.currency = JSON.parse(sessionStorage.getItem('currency'));
                        }
                    } else {
                        swal(
                            'unAtuhenticated login try again',
                            '',
                            'error'
                        )
                    }
                });
            }
        }

        function logout() {
            loginService.logout().then(function (result) {
                localStorage.setItem("donarRecurringList", undefined);
                localStorage.setItem("donarId", undefined);
                localStorage.setItem("campaignsData", undefined);
                localStorage.setItem("campaigns", undefined);

                /*sessionStorage.setItem("lang", undefined);
                sessionStorage.setItem("currency",undefined);*/
                $rootScope.$broadcast('$locationChangeStart');
                $rootScope.$broadcast('$getZiyaratByUserId');
                // sessionStorage.setItem('currency', JSON.stringify({
                //     rateExchange: 1,
                //     symbol: "$",
                //     title: "USD"
                // }));
                // sessionStorage.setItem('rateExchange', 1);
                if (!result.isValid) $state.go('home');
                location.href = '/';
                $scope.badgeShow = false;
                localStorage.removeItem('userRole');
            });
        }

        $scope.faceBookLogin = function () {
            loginService.faceBookLoginService().then(function (result) { });
        }

        function showError() {
            let validateMsg;
            if (vm.browserLanguage == "ARB") {
                validateMsg = "يرجى ملء الحقول الفارغة";
            } else if (vm.browserLanguage == "FRN") {
                validateMsg = "Veuillez remplir les champs manquants";
            } else {
                validateMsg = "Please fill the missing fields";
            }
            swal({
                title: validateMsg,
                position: "center-center",
                type: "error",
                allowOutsideClick: false
            });
            return false;
        }

        function registration(isValid) {
            if (vm.registrationDetails.mobile && vm.registrationDetails.mobile[0] === '0') {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: $translate.instant('Number cannot begin with 0'),
                    showConfirmButton: false,
                    timer: 2000
                });
                return;
            }

            var checkEmail = config.EmailRegex;
            // var checkPhone = /\d/;

            if ((vm.registrationDetails.userName && !checkEmail.test(vm.registrationDetails.userName)) ||
                (vm.registrationDetails.email && !checkEmail.test(vm.registrationDetails.email))) {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: $translate.instant('Email format is not correct'),
                    showConfirmButton: false,
                    timer: 2000
                });
                return
            }

            var user = {
                userName: (vm.registrationDetails.userName) ? vm.registrationDetails.userName : null,
                fullName: vm.registrationDetails.firstName + ' ' + vm.registrationDetails.lastName,
                firstName: vm.registrationDetails.firstName,
                lastName: vm.registrationDetails.lastName,
                email: checkEmail.test(vm.registrationDetails.email) ? vm.registrationDetails.email : vm.registrationDetails.userName,
                countryCode: vm.registrationDetails.selectedCountryCode || null,
                mobile: vm.registrationDetails.selectedCountryCode + vm.registrationDetails.mobile || null,
                password: vm.registrationDetails.password,
                gender: vm.registrationDetails.gender,
                language: vm.registrationDetails.language,
                countryOfResidence: vm.registrationDetails.countryOfResidence
            };
            if (!(user.password && user.language && user.countryOfResidence && user.userName && user.gender)) {
                return showError();
            }
            loginService.registration(user).then(function (res) {
                if (res.status == 200) {
                    if (res.status == 409) {
                        swal({
                            position: 'center-center',
                            type: 'error',
                            title: $translate.instant(res.data),
                            showConfirmButton: false,
                            timer: 2000
                        });
                    } else {
                        if (vm.selectedRole == undefined || vm.selectedRole == "donor") {
                            user.user = res.data;
                            donarService.registerDonar(user).then(function (res) {
                                if (res.status == 200) {
                                    clearData();
                                    jQuery("#headerLoginPopup").removeClass('open');
                                    swal({
                                        position: 'center-center',
                                        type: 'success',
                                        title: $translate.instant("User registered successfully"),
                                        showConfirmButton: false,
                                        timer: 2000
                                    });
                                    vm.loginDetails = {
                                        password: user.password,
                                        username: user.userName
                                    },
                                        vm.username = user.userName;
                                    vm.registrationDetails = {};
                                    vm.donateLogin(true);
                                }
                                else {
                                    swal("Failed!", $translate.instant("Something went wrong"), "error");
                                }

                            });
                        }
                    }
                } else {
                    swal({
                        position: 'center-center',
                        type: 'error',
                        title: res.status !== 409 ? $translate.instant("User is not registered please try again") : $translate.instant("Sorry, this user already exists"),
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            });

        }
        vm.getCountryCode = getCountryCode;
        vm.leadZeroNotAllowed = leadZeroNotAllowed;

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
                });
                vm.countryCodeList = vm.countryCodeList.sort((a, b) => a.dialCode - b.dialCode)

            });
        }

        function leadZeroNotAllowed(event) {
            if (!vm.registrationDetails.mobile || (vm.registrationDetails.mobile && vm.registrationDetails.mobile.length < 1)) {
                let amount = String.fromCharCode(event.which || event.keyCode);
                let pattern = /^[1-9][0-9]*$/;
                if (!pattern.test(amount)) {
                    event.preventDefault();
                }
            }
        }

        function selectCountryCode(data) {
            if (data && vm.countryCodeList && vm.countryCodeList.length) {
                vm.registrationDetails.selectedCountryCode = vm.countryCodeList.find(obj => obj.name == (data.name || data)).dialCode;
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

        $scope.initial = function () {

            $scope.resetPasswordToken = $location.search().token;
        }
        $scope.forgotPassword = function () {

            var params = {
                username: $scope.username
            };
            loginService.forgotPassword(params).then(function (result) {
                if (result.message) {
                    // var message = result.message;
                    let lang = localStorage.getItem('lang');
                    let validateMsg;
                    if (lang == 'ARB') {
                        validateMsg = "قد تم إرسال كلمة السر الجديدة إلى بريدك الألكتروني";
                    } else if (lang == 'FRN') {
                        validateMsg = "Le lien de réinitialisation du mot de passe a été envoyé sur votre email";
                    } else {
                        validateMsg = "Password reset link has been sent to your email";
                    }
                    swal({
                        title: validateMsg,
                        position: 'center-center',
                        type: 'success',
                        allowOutsideClick: false,
                    }).then(() => {
                        $state.go('home');
                        // var landingUrl = "http://" + $window.location.host + "#/home";
                        // $window.location.href = landingUrl;
                    });
                } else {
                    var validateMsg = 'user does not exist enter valid user';
                    swal({
                        title: validateMsg,
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    })
                }

            });
        };
        $scope.resetpassword = function (isValid) {
            if (isValid) {
                var user = {
                    password: $scope.user.password,
                    resetPasswordToken: $scope.resetPasswordToken
                }
                loginService.resetpassword(user).then(function (result) {
                    if (result) {
                        swal({
                            position: 'center-center',
                            type: 'success',
                            title: result.message,
                            showConfirmButton: false,
                            timer: 2000
                        });
                        $state.go('home')
                        // var landingUrl = "http://" + $window.location.host + "/#/home";
                        // $window.location.href = landingUrl;
                        // // $window.location.href = "/#/login";
                        // // var message = result.message;
                    } else {
                        var message = "error"
                    }
                });
            }
        };

        //menu and slider setting for Home page
        var url = $location.url();
        var arr = url.split("/");
        var pageUrl = arr[arr.length - 1];
        if (pageUrl == 'home') {
            jQuery(".grop-header_area").css({
                "position": "absolute",
                "top": "-45px"
            });
            jQuery(".customSlider").css("margin-top", "45px");
            jQuery(".grop-header_navigations.grop-header_sticky").css("background", "none");
            jQuery("#grop-mainmenu").addClass('whiteMenu');
        } else {
            jQuery("#grop-mainmenu").removeClass('whiteMenu');
        }

        function getCartCount() {

            if ($location.path().toLowerCase() != '/success-checkout/') {
                cartService.getCartDetail().then(function (result) {
                    $scope.itemsCount = result.data.items && result.data.items.length;
                    if ($scope.itemsCount > 0) {
                        $scope.badgeShow = true;
                    } else {
                        $scope.badgeShow = false;
                    }
                });
            }
        }

        $scope.$on('getCartCounter', function (event, args) {
            vm.getCartCount();
        })
        async function registerDonorAndCheckout(status) {
            if (!status) return showError;
            try {

            } catch (error) {

            }
        }
        function clearData() {
            vm.loginDetails.password = null;
            vm.registrationDetails = {
                firstName: null,
                lastName: null,
                userName: null,
                password: null,
                language: null,
                countryOfResidence: null,
                gender: null
            };
        }

        jQuery('.inputPlaceholder').click(function () {
            jQuery(this).siblings('input').focus();
        });
        jQuery('.form-control').focus(function () {
            jQuery(this).siblings('.inputPlaceholder').hide();
        });
        jQuery('.form-control').blur(function () {
            var $this = jQuery(this);
            if ($this.val() && $this.val().length == 0)
                jQuery(this).siblings('.inputPlaceholder').show();
        });
        jQuery('.form-control').blur();
    }
})();