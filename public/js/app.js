//import { payment } from './../../config/config.js';

var mainApp = angular.module('mainApp', ['ui.router', 'ui.carousel', 'appRoutes', 'ngIdle',
    'validation.match', 'ngPassword', 'ngSanitize', 'filters', 'chart.js', 'angular.filter',
    'ngFileUpload', "hm.readmore", 'checklist-model', 'pascalprecht.translate', 'chieffancypants.loadingBar', 'dt-hamburger-menu', 'datatables']).constant('config', {
        Messages: {
            ZiaratRegSuccess: "You have successfully registered for Ziyarah of Imam Hussain (as) to be performed on your behalf on this Thursday!"
        },
        Stripe: {
            PublishKey: "pk_test_51IizH6FEetBmjoewN4k643sOGmCzxFQkM8VA7UDOK0qlVIt9zemnuHDWwqZRXLeKWhFNtxOeu57LBE8yAkvAMuQW00Em6POwB0"
        },
        SecuredRoutes:["/donar/Program","/editProfile","/donar/donations","/donar/DAZSchool","/donar/dashboard"],
        // country : [
        //     { ENG: 'Qom', ARB: 'قم', FRN: 'Qom' }, { ENG: 'Iraq', ARB: 'العراق', FRN: 'IRAK' }, { ENG: 'Shaam', ARB: 'شام', FRN: 'Shaam' }
        //   ]
        SecuredRoutes: ["/donar/Program", "/editProfile", "/donar/donations", "/donar/DAZSchool", "/donar/dashboard"],
        EmailRegex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ,
        EventConstants:{
            EventNames:{
                MultipleRecurringProgram:'MultipleRecurringProgram'
            },
            EventTypes:{
                AddOrphan:'AddingOrphan',
                AddingSadaqah:'AddingSadaqah',
                Checkout:'CheckoutClicked'
            },
            TriggeredBy:{
                Guest:'Guest'
            },
            Levels:{
                Tracking:'Tracking'
            },
            Sources :{
                FDC:'FastDonationCalculator',
                INSIDE_PAGE:'InnerPage',
                CART_PAGE:'Cart',
            }

        }
    });


mainApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
mainApp.directive('ngFileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            var isMultiple = attrs.multiple;
            var modelSetter = model.assign;
            element.bind('change', function () {
                var values = [];
                angular.forEach(element[0].files, function (item) {
                    var value = {
                        // File Name 
                        name: item.name,
                        //File Size 
                        size: item.size,
                        //File URL to view 
                        url: URL.createObjectURL(item),
                        // File Input Value 
                        _file: item
                    };
                    values.push(value);
                });
                scope.$apply(function () {
                    if (isMultiple) {
                        modelSetter(scope, values);
                    } else {
                        modelSetter(scope, values[0]);
                    }
                });
            });
        }
    };
}]);
mainApp.filter('startFrom', function () {
    return (input, start) => {
        start = +start; //parse to int
        return input.slice(start);
    }
});

mainApp.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }

            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

mainApp.directive('decimalOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var old = ngModelCtrl.$modelValue;
                    var f = parseFloat(text);
                    if (RegExp(/^[0-9]+\.?[0-9]*$/).test(text)) {
                        return text;
                    } else {
                        ngModelCtrl.$setViewValue(old);
                        ngModelCtrl.$render();
                    }
                    return old;
                }
                return undefined;
            }

            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});


mainApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function (file, uploadUrl) {
        var fd = new FormData();
        fd.append('file', file);

        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        })

            .success(function () {
            })

            .error(function () {
            });
    }
}]);

mainApp.config(['$translateProvider', '$httpProvider', 'KeepaliveProvider', 'IdleProvider', 'cfpLoadingBarProvider',
    function ($translateProvider, $httpProvider, KeepaliveProvider, IdleProvider, cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = true;
        $translateProvider.useStaticFilesLoader({
            prefix: 'js/i18n/',
            suffix: '.json'
        })
            .preferredLanguage('ENG')
            // .useMissingTranslationHandlerLog()
            .useSanitizeValueStrategy(null);

        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        IdleProvider.idle(900); //time in seconds
        IdleProvider.timeout(10);
        KeepaliveProvider.interval(10);
    }]);

mainApp.directive('showMore',
    function () {
        return {
            template: `<span>
            <div ng-style='showLessStyle' ng-hide='expanded' ng-transclude>
            </div>
            <div ng-show='expanded' ng-transclude>
            </div>
            <a style='float:right;' ng-hide='expanded || !expandable' ng-click='expanded = !expanded' localize>show more</a>
            <a style='float:right;' ng-show='expanded && expandable' ng-click='expanded = !expanded'>show less</a>
        </span>`,
            restrict: 'A',
            transclude: true,
            scope: {
                'showMoreHeight': '@'
            },
            controller: ['$scope', '$element', '$interval', function ($scope, $element, $interval) {

                $scope.expanded = false;

                $interval(function () {
                    renderStyles();
                }, 300);

                $scope.expandable = false;
                function renderStyles() {
                    if ($element.height() >= $scope.showMoreHeight && $scope.expanded === false) {
                        $scope.expandable = true;
                    }
                }

                $scope.showLessStyle = {
                    'max-height': $scope.showMoreHeight + 'px',
                    'overflow': 'hidden'
                };

            }]
        };
    });
// loader on every request
/*mainApp.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q) {
            return {
                'request': function (config) {
                    //jQuery('#processing').show();
                    return config;
                },
                'response': function (response) {
                    // jQuery('#processing').hide();
                    return response;
                },
                'responseError': function (rejection) {
                    //jQuery('#processing').hide();
                    throw rejection;
                }
            };
        });
    }]);*/


mainApp.run(['Carousel', '$rootScope', '$http', '$state', '$window', '$location', 'Idle', 'loginService', 'SessionService', '$translate', '$transitions', 'MetaTagsService', '$stateParams',
    function (Carousel, $rootScope, $http, $state, $window, $location, Idle, loginService, SessionService, $translate, $transitions, MetaTagsService, $stateParams) {
        let lang = localStorage.getItem('lang') || 'ENG';

        const url = $location.url();
        const arr = url.split("/");
        if (arr[1] === 'home' && arr[2]) {
            lang = arr[2];
            lang = lang.toUpperCase();
        }
        $rootScope.userConfig = {
            lang,
            currency: { 'title': 'USD', 'symbol': '$', 'currencyName': 'United States Dollar', 'rateExchange': 1 }
        };
        if (lang) {
            $translate.use(lang);
            localStorage.setItem('lang', lang);
        } else {
            $translate.use('ENG');
            $rootScope.userConfig.lang = 'ENG';
            localStorage.setItem('lang', 'ENG');

        }

        if (!sessionStorage.getItem('currency')) {
            //currency default setting
            sessionStorage.setItem('currency', JSON.stringify({ 'title': 'USD', 'symbol': '$', 'currencyName': 'United States Dollar', 'rateExchange': 1 }));
        } else {
            $rootScope.userConfig.currency = JSON.parse(sessionStorage.getItem('currency'));
        }

        MetaTagsService.setDefaultTags({
            // General SEO
            'title': 'Najafyia Foundation',
            'author': 'Aun Rizvi',
            'description': 'Najafyia Foundation is Registered by the Charity Commission of UK (1127754) and in Special Consultative Status with the Economic and Social Council (ECOSOC) of the United Nations.',
            // Indexing / Spiders
            'googlebot': 'all',
            'bingbot': 'all',
            'robots': 'all',
            // OpenGraph
            'og:site_name': 'Najafyia',
            // Twitter
            'twitter:site': '@Najafyia',
        });

        $transitions.onSuccess({ to: 'home' }, function ($transition) {
            MetaTagsService.setTags({});
        });
        Carousel.setOptions({
            arrows: true,
            autoplay: true,
            autoplaySpeed: 3000,
            cssEase: 'ease',
            dots: false,

            easing: 'linear',
            fade: false,
            infinite: true,
            initialSlide: 0,

            slidesToShow: 4,
            slidesToScroll: 4,
            speed: 500,
        });
        //watch if user is Idle
        Idle.watch();
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            //    menuService.getmenus().then(function(res){
            //    })

            // chat will only show on Home and Contact page
            var url = $location.url();
            var arr = url.split("/");
            var pageUrl = arr[arr.length - 1];
            var element = jQuery("#tawkchat-minified-wrapper");
            if (element) {
                if (pageUrl == "home" || pageUrl == "contactUs") {
                    jQuery("#tawkchat-minified-wrapper").removeClass('hideDiv');
                } else {
                    jQuery("#tawkchat-minified-wrapper").addClass('hideDiv');

                }
            }
            var pageUrl2 = arr[arr.length - 2] + "/" + arr[arr.length - 1];
            if (pageUrl2 === "donar/dashboard") {
                $rootScope.isDonarProfilePage = true;
            } else {
                $rootScope.isDonarProfilePage = false;
            }

            loginService.getSession().then(function (res) {
                let user = res.data;
                let isAuthenticated = user.username == undefined ? false : true;
                $rootScope.isLogin = isAuthenticated;
                if (isAuthenticated) {
                    loginService.getLoggedInUserDetails().then(function (res) {
                        if (res) {
                            $rootScope.userDetail = res;
                            $rootScope.$broadcast('userDetail', $rootScope.userDetail)
                            $rootScope.loggedInUserDetails = {
                                userName: res.userName,
                                file: res.file,
                                fullName: res.fullName,
                                email: res.email,
                                gender: res.gender,
                                mobile: res.mobile,
                                country: res.countryOfResidence,
                                language: res.language,
                                role: res.role,
                                id: res._id
                            }
                        }
                    });
                }
                $rootScope.username = user.username;
                $rootScope.userId = user.id;
                // var pagesWithSecurity = ['/admin/dashboard', '/admin/addpage', '/admin/updatepage', '/admin/pagelist', '/admin/addproject', '/admin/updateproject', '/admin/projectlist',
                //     '/admin/addpost', '/admin/updatepost', '/admin/postlist', '/admin/addReligiousPayment', '/admin/religiousPaymentslist', '/admin/updatereligiousPayment', '/admin/addsadaqa',
                //     '/admin/sadaqalist', '/admin/orphanlist', '/admin/addsubcategory', '/admin/addPageContent', '/admin/addDynamicPageContent', '/admin/adduser', '/admin/userlist',
                //     '/admin/addDynamicPageContent', '/admin/addRepresentative', '/admin/representativeList', '/admin/addGeneralCare', '/admin/generalCareList', '/admin/addOrphan',
                //     '/admin/orphanList', '/admin/addDarAlZahraModule', '/admin/darAlZahraList', '/admin/addStudent', '/admin/studentList', '/admin/addCampaign', '/admin/campaignList',
                //     '/admin/subcategorylist', '/admin/addOccasion', '/admin/currencySetup', '/admin/occasionList', '/admin/addDua', '/admin/duaList', '/admin/manageorphans', '/admin/managestudents',
                //     '/admin/webSettings', '/admin/suggestedDonations', '/admin/setmenu', '/admin/receipts', '/admin/khumsreceipts', '/admin/ziyaratList', '/admin/sendNotification',
                //     '/admin/consolidatedReport', '/admin/donarWiseReport', '/admin/donarDetailReport', '/admin/hajjZiyarahReport', '/admin/islamicPaymentsReport', '/admin/khumsReport',
                //     '/admin/projectionReport', '/admin/profileReport', '/admin/sponsorshipRenewalReport', '/admin/manageorphans', '/admin/managestudents']
                // for (let i = 0; i < pagesWithSecurity.length; i++) {
                //     pagesWithSecurity[i] = "/admin" + pagesWithSecurity[i];
                // }

                var pagesWithSecurity = ['admin'];

                if ((jQuery.inArray($location.path().split("/")[1], pagesWithSecurity) !== -1)) {
                    if (!user.username || isAuthenticated == false) {
                        $state.go('home');

                    }
                    else if (isAuthenticated && user.role && ((typeof user.role == 'string' && user.role.toUpperCase() == 'DONOR') || (user.role.length && user.role[0].toUpperCase() === "DONOR"))) {
                        $state.go('home');

                    } else if (isAuthenticated && user.role && ((typeof user.role == 'string' && user.role.toUpperCase() == 'EDITOR') || (user.role.length && user.role[0].toUpperCase() === "EDITOR"))) {
                        var restrictedPage = jQuery.inArray($location.path().split("/")[1], '/admin/addproject', '/admin/addpage', '/admin/setmenu', '/admin/addsadaqa', '/admin/addorphan') !== -1;
                        if (restrictedPage) {
                            $state.go('home');

                        }
                    }
                }
                else if ((jQuery.inArray($location.path().split("/")[1], pagesWithSecurity) == -1)) {
                    if (isAuthenticated && user.role && ((typeof user.role == 'string' && user.role.toUpperCase() !== 'DONOR') || (user.role.length && user.role[0].toUpperCase() !== "DONOR"))) {
                        sessionStorage.setItem('currency', JSON.stringify({
                            rateExchange: 1,
                            symbol: "$",
                            title: "USD",
                            currencyName: 'United States Dollar'
                        }));
                        sessionStorage.setItem('rateExchange', 1)
                        $state.go('dashboard');
                    }
                }
                else {
                    $state.go('home');
                }

            });
            // var loggedIn = $rootScope.globals.currentUser;
        });

        //move to top onStateLoad
        $rootScope.$on('$locationChangeStart', function () {
            jQuery("html, body").animate({ scrollTop: 0 }, 'fast');
            var url = $location.url();
            var arr = url.split("/");
            var pageUrl = arr[arr.length - 1];
            if (pageUrl == 'home') {
                jQuery(".grop-header_area").css({ "position": "absolute", "top": "-45px" });
                jQuery(".customSlider").css("margin-top", "45px");
                jQuery(".grop-header_navigations.grop-header_sticky").css("background", "none");
                jQuery("#grop-mainmenu").addClass('whiteMenu');
            } else {
                jQuery("#grop-mainmenu").removeClass('whiteMenu');
            }
        });

        //idle check
        $rootScope.$on('IdleTimeout', function () {
            var url = $location.absUrl().split('?')[0];
            console.log("session timeout");
            // loginService.logout().then(function (result) {
            //     $rootScope.$broadcast('$locationChangeStart');
            //     var landingUrl = "http://" + $window.location.host + "#/home";
            //     $window.location.href = landingUrl;
            // });
        });


    }]);
