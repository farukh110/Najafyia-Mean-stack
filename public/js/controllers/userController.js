(function () {

    angular.module('mainApp').controller('userController', userController);

    function userController($state, $rootScope, $scope, $stateParams, $location, userService, donarService, $window, $translate, smsAPIService, countryService, loginService, ziyaratService,config) {

        var vm = this;
        $scope.ratedObj = {};
        getTarget()
        var userData = [];
        vm.result = "";
        vm.UserId = "";
        vm.registerUser = registerUser;
        vm.updateUser = updateUser;
        vm.getUsers = getUsers;
        vm.editUser = editUser;
        vm.deleteUser = deleteUser;
        vm.getUserForUpdate = getUserForUpdate;
        vm.Users = [];
        vm.selectedRoles = [];
        vm.countries = [];
        vm.roles = [{
            selectedRole: false,
            role: 'admin'
        },
        {
            selectedRole: false,
            role: 'Content Editor'
        },
        {
            selectedRole: false,
            role: 'Accountant/Finance'
        },
        {
            selectedRole: false,
            role: 'Currency Editor'
        }
        ]
        if ($stateParams.id) {
            vm.isUpdate = true;
            vm.getUserForUpdate($stateParams.id);
        }
        vm.getCountryCode = getCountryCode;
        vm.leadZeroNotAllowed = leadZeroNotAllowed;
        vm.browserLanguage = localStorage.getItem('lang');

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

        function leadZeroNotAllowed(event) {
            if (!vm.mobile || (vm.mobile && vm.mobile.length < 1)) {
                let amount = String.fromCharCode(event.which || event.keyCode);
                let pattern = /^[1-9][0-9]*$/;
                if (!pattern.test(amount)) {
                    event.preventDefault();
                }
            }
        }
        $scope.selectCountryCode = function (data) {
            if (data && vm.countryCodeList && vm.countryCodeList.length) {
                vm.selectedCountryCode = vm.countryCodeList.find(obj => obj.name == (data.name || data)).dialCode;
            }
        }
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
        $rootScope.$on('userDetail', function (event, data) {
            $rootScope.userDetail = data;
        });
        $scope.selectRole = function (role) {
            let index = vm.selectedRoles.findIndex(obj => obj === role);
            if (index < 0) {
                if (role == 'admin') {
                    vm.selectedRoles = []
                    vm.selectedRoles.push(role)
                    vm.roles.forEach(obj => {
                        if (obj.role != 'admin') {
                            obj.selectedRole = false
                        }
                    });
                    return;
                }
                vm.selectedRoles.push(role)
            } else {
                vm.selectedRoles.splice(index, 1);
            }
        }
        $scope.isNumberKey = function ($event) {
            let amount = String.fromCharCode(event.which || event.keyCode)
            let pattern = /^[0-9]\d*(\.\d+)?$/;
            if (!pattern.test(amount)) {
                event.preventDefault()
            }
        }

        function donateLogin(isValid, userObj) {
            if (isValid) {
                vm.disable = true;
                loginService.login({
                    username: userObj.userName,
                    password: userObj.password
                })
                    .then(function (result) {
                        if (result.status == 200) {
                            let user = result.data.user;
                            localStorage.setItem('lang', user.language || 'ENG');
                            let isAuthenticated = user.userName == undefined ? false : true;
                            $rootScope.isLogin = isAuthenticated;
                            if (isAuthenticated) {
                                loginService.getLoggedInUserDetails()
                                    .then(function (res) {
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
                                    }).catch(__ => vm.disable = false);
                            }
                            if (user) {
                                localStorage.setItem('userRole', user.role)
                            }

                            $rootScope.username = user.userName;
                            $rootScope.userId = user.id;

                            loginService.getDonarFromUser(result.data.user._id)
                                .then(function (result) {
                                    localStorage.setItem("donarId", result.data.user._id);
                                    var obj = {
                                        fullName: $rootScope.loggedInUserDetails.fullName,
                                        email: $rootScope.loggedInUserDetails.email,
                                        phone: $rootScope.loggedInUserDetails.mobile,
                                        language: $rootScope.loggedInUserDetails.language,
                                        date: new Date(),
                                        country: $rootScope.loggedInUserDetails.country,
                                        hasAssigned: true,
                                    };
                                    if (vm.onlyLogin) {
                                        $window.location.href = '/#/home';
                                    } else {
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
                                                    var landingUrl = "http://" + $window.location.host + "#/home";
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
                                                    $rootScope.$broadcast('$locationChangeStart');
                                                    $rootScope.$broadcast('$getZiyaratByUserId');
                                                    $window.location.href = landingUrl;
                                                }
                                            } else {
                                                swal("Failed!", "Failed to save", "error");
                                                $window.location.href = '/#/home';
                                            }
                                        });
                                    }
                                }).catch(function (error) {
                                    vm.disable = false;
                                    return error
                                });



                        } else {
                            vm.disable = false;
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
                        }
                    }).catch(__ => vm.disable = false);
            }
        }
        //This function adds new User
        function registerUser() {
            if (vm.mobile && vm.mobile[0] === '0') {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: $translate.instant('Number cannot begin with 0'),
                    showConfirmButton: false,
                    timer: 2000
                });
                return
            }
            var obj = getUserobject();
            userService.registerUser(obj).then(function (res) {
                if (res.status == 200) {
                    if (vm.selectedRole == undefined || vm.selectedRole == "donar") {
                        obj.user = res.data;
                        donarService.registerDonar(obj).then(function (res) {                     
                            if (res) {
                                donateLogin(true, obj);
                            }

                        });
                        /*  smsAPIService.sendSms("Welcome user to AlNajafiya", obj.mobile).then(function (res) {
                              console.log(res)
                          });
                          donarService.sentEmailToDonor(obj).then(function (res) {
                          });*/

                    }

                } else if (res.status == 409) {
                    swal({
                        position: 'center-center',
                        type: 'error',
                        title: $translate.instant("Sorry, this user already exists"),
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    swal({
                        position: 'center-center',
                        type: 'error',
                        title: $translate.instant("Something went wrong"),
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            });
            // return res;
        }

        $scope.addTarget = function () {
            $scope.ratedObj.target = vm.target;
            $scope.ratedObj.achieved = vm.achieved;
            // holding user to input greater value then target
            if ($scope.ratedObj.achieved <= $scope.ratedObj.target) {
                $scope.ratedObj.currencyTitle = JSON.parse(sessionStorage.getItem('currency')).title
                userService.achievementRates($scope.ratedObj).then(function (res) {
                    if (res.status == 200) {
                        $scope.ratedObj.id = res.data._id
                        swal({
                            position: 'center-center',
                            type: 'success',
                            title: $translate.instant("Achievement rates added successfully"),
                            showConfirmButton: false,
                            timer: 2000
                        })

                    }
                });
            } else {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: "Achievement cannot be greater than target",
                    showConfirmButton: false,
                    timer: 2000
                })
            }
        }

        function getTarget() {
            let currency = JSON.parse(sessionStorage.getItem('currency')).title;
            userService.getAchievementRates(currency).then(function (res) {
                if (res.status == 200 && res.data) {
                    vm.target = res.data.target;
                    vm.achieved = res.data.achieved;
                    $scope.ratedObj.id = res.data.id
                    $scope.ratedObj.target = vm.target;
                    $scope.ratedObj.achieved = vm.achieved;
                }
            });
        }

        $scope.createRoleUser = function () {
            var checkEmail = config.EmailRegex;
            var checkPhone = /\d/;
            let swalMsg;
            let obj = {};
            if (vm.password != vm.confirmPassword) {
                swalMsg = "Password does not match"
            } else if (!vm.selectedRoles || !vm.selectedRoles.length) {
                swalMsg = "Please Select atleast 1 role"
            } else if (!checkEmail.test(vm.email)) {
                swalMsg = "Email format is not correct"
            }

            if (swalMsg && swalMsg.length) {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: swalMsg,
                    showConfirmButton: false,
                });
                return;
            }
            obj.userName = vm.userName;
            obj.fullName = vm.fullName;
            obj.email = vm.email;
            obj.mobile = checkPhone.test(vm.mobile) ? vm.mobile : null;
            obj.roles = vm.selectedRoles;
            obj.password = vm.password;
            obj.gender = vm.gender;
            obj.userLang = vm.language;
            obj.countryOfResidence = vm.countryOfResidence;

            if (!vm.isUpdate) {
                userService.registerUser(obj).then(function (res) {
                    if (res.status == 200) {
                        obj = {};
                        vm.selectedRoles = [];
                        vm.userName = vm.fullName = vm.email = vm.mobile = vm.password = vm.gender = vm.language = vm.countryOfResidence = null;
                        vm.roles.forEach(obj => {
                            obj.selectedRole = false
                        });
                        swal({
                            position: 'center-center',
                            type: 'success',
                            title: $translate.instant("User registered successfully"),
                            showConfirmButton: false,
                            timer: 2000
                        }).then(function () {
                            $state.go('userlist')
                        });

                    } else {
                        swal({
                            position: 'center-center',
                            type: 'error',
                            title: res.status == 409 ? "User already exist" : "User is not registered please try again",
                            showConfirmButton: false,
                            timer: 2000
                        });
                    }
                });
            } else {
                obj._id = $stateParams.id;
                vm.updateUser(obj)
            }
        }



        function updateUser(obj) {
            userService.updateUser(obj).then(function (res) {
                if (res.status == 200) {
                    swal({
                        title: 'Congratulation',
                        text: "User updated Successfully",
                        type: 'success',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Ok',
                        confirmButtonClass: 'btn btn-success',
                        buttonsStyling: false
                    })
                        .then(function () {
                            $state.go('userlist')
                        });
                }
            });
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
        //create User object
        function getUserobject() {
            if (!(vm.password && vm.language && vm.countryOfResidence && vm.userName && vm.gender)) {
                return showError();
            }
            var checkEmail = config.EmailRegex;
            var checkPhone = /\d/;
            var obj = {};
            obj.userName = vm.userName;
            obj.fullName = vm.firstName + ' ' + vm.lastName;
            obj.firstName = vm.firstName;
            obj.lastName = vm.lastName;
            obj.email = checkEmail.test(vm.userName) ? vm.userName : null;
            obj.mobile = vm.selectedCountryCode + vm.mobile || null;
            obj.countryCode = vm.selectedCountryCode;
            obj.role = vm.selectedRole;
            obj.password = vm.password;
            obj.gender = vm.gender;
            obj.userLang = vm.language;
            obj.language = vm.language;
            obj.countryOfResidence = vm.countryOfResidence;
            return obj;
        }

        function getUpdatedUserobject() {
            var obj = {};
            var val = vm.UserTitle;
            obj.title = vm.UserTitle;
            obj.content = jQuery('#edit .froala-view').html();
            obj.id = vm.UserId;
            return obj;
        }

        // gets all Users
        function getUsers() {
            userService.getUsers().then(function (res) {
                vm.Users = res.data.reverse();
                return res;

            });
        }

        function editUser(userID) {
            $state.go('updateUser', {
                id: userID
            })
        }

        //get User data for update
        function getUserForUpdate(id) {
            userService.getUserById(id).then(function (res) {
                vm.Users = res.data;
                vm.userName = vm.Users.userName;
                vm.fullName = vm.Users.fullName;
                vm.email = vm.Users.email;
                vm.mobile = vm.Users.mobile;
                vm.gender = vm.Users.gender;
                vm.language = vm.Users.language;
                vm.countryOfResidence = vm.Users.countryOfResidence;
                vm.selectedRoles = vm.Users.role;
                if (vm.selectedRoles && vm.selectedRoles.length) {
                    for (let i = 0; i < vm.selectedRoles.length; i++) {
                        for (let j = 0; j < vm.roles.length; j++) {
                            if (vm.selectedRoles[i] == vm.roles[j].role) {
                                vm.roles[j].selectedRole = true;
                            }

                        }
                    }
                }

            });
        }

        // Delete User by Id
        function deleteUser(UserId, index) {
            swal({
                title: $translate.instant('Are you sure?'),
                text: $translate.instant("You won't be able to revert this!"),
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: $translate.instant('Yes, delete it!'),
                cancelButtonText: $translate.instant('No, cancel!'),
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
            }).then(function (result) {
                if (result.value) {
                    userService.deleteUser(UserId).then(function (res) {
                        if (res.status == 200) {
                            vm.result = res.data;
                            vm.Users.splice(index, 1)
                            swal({
                                position: 'center-center',
                                type: 'success',
                                title: "User has been deleted.",
                                showConfirmButton: false,
                                timer: 2000
                            })
                        }
                    });
                }
            });

        }

    }
})()