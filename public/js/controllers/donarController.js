(function () {
    // Donar Controller starts here
    angular.module('mainApp').controller('donarController', DonarController);

    function DonarController($scope, $rootScope, $state, $location, $translate, multipartForm, donarService, loginService, countryService) {

        var donarVM = this;
        donarVM.details = null;
        donarVM.imegeURL = null;
        donarVM.file = {};

        donarVM.getUserDetails = getUserDetails;
        donarVM.updateProfile = updateProfile;
        donarVM.resetForm = resetForm;
        donarVM.selectCountryCode = selectCountryCode;
        donarVM.getCountryCode = getCountryCode;
        donarVM.leadZeroNotAllowed = leadZeroNotAllowed;
        function getCountryCode() {
            countryService.getCountryCode().then(function (res) {
                donarVM.countryCodeList = res;
                donarVM.countryCodeList = donarVM.countryCodeList.map(c => {
                    c.dialCode = c.dialCode.replace(/\s/g, '');

                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;
                    }
                    return c;
                })
                donarVM.countryCodeList = donarVM.countryCodeList.sort((a,b)=>a.dialCode-b.dialCode)


            });
        }
        function selectCountryCode(data) {
            if (data) {
                donarVM.details.countryCode = donarVM.countryCodeList.find(obj => obj.name == (data.name || data)).dialCode;
            }
        }
        function getUserDetails() {
            loginService.getLoggedInUserDetails().then(function (res) {
                if (res) {
                    // res.mobile = res.mobile.split(res.countryCode)[1] ? res.mobile.split(res.countryCode)[1] : res.mobile;
                    donarVM.details = res;
                }
            });
        }
        function leadZeroNotAllowed(event) {
            if (!donarVM.details.mobile || (donarVM.details.mobile && donarVM.details.mobile.length < 1)) {
                let amount = String.fromCharCode(event.which || event.keyCode);
                let pattern = /^[1-9][0-9]*$/;
                if (!pattern.test(amount)) {
                    event.preventDefault();
                }
            }
        }
        function userUpdatedObject() {

            const userObj = { ...donarVM.details };
            // userObj.mobile = donarVM.details.countryCode + donarVM.details.mobile;
            return userObj;
        }
        function updateProfile(isValid) {
            if (donarVM.details.mobile && donarVM.details.mobile[0] === '0') {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: $translate.instant('Number cannot begin with 0'),
                    showConfirmButton: false,
                    timer: 2000
                });
                return;
            }
            if (isValid) {
                const userObj = userUpdatedObject();
                if (donarVM.file.name == undefined) {
                    donarService.updateProfile(userObj).then(function (response) {
                        if (response.status == 200) {
                            let msg;
                            if (response.data == "User updated successfully!") {
                                if (localStorage.getItem('lang') == 'ARB') {
                                    msg = "!تم تحديث معلومات المستخدم بنجاح";
                                } else if (localStorage.getItem('lang') == 'FRN') {
                                    msg = "Informations enregistrées avec succès";
                                } else {
                                    msg = "User information successfully updated!";
                                }
                            }
                            donarVM.getUserDetails;
                            swal(
                                $translate.instant('Success!'),
                                msg,
                                'success'
                            );
                        } else {
                            swal(
                                'Failed!',
                                'Failed to update',
                                'error'
                            )
                        }
                    });
                } else {
                    //upload image than save
                    multipartForm.post('/upload', donarVM.file).then(function (res) {
                        donarVM.details.file = res.data.name;
                        donarService.updateProfile(userObj).then(function (response) {
                            if (response.status == 200) {
                                donarVM.getUserDetails;
                                let msg;
                                if (response.data == "User updated successfully!") {
                                    if (localStorage.getItem('lang') == 'ARB') {
                                        msg = "!تم تحديث صورة الملف الشخصي بنجاح";
                                    } else if (localStorage.getItem('lang') == 'FRN') {
                                        msg = "Photo de profil enregistrée!";
                                    } else {
                                        msg = "Profile picture updated successfully!";
                                    }
                                }
                                swal(
                                    $translate.instant('Success!'),
                                    msg,
                                    'success'
                                );
                            } else {
                                swal(
                                    'Failed!',
                                    'Failed to update',
                                    'error'
                                )
                            }
                        });
                    });
                }
            }
        }
        function resetForm() {
            donarVM.details = null;
            donarVM.imegeURL = null;
            donarVM.file = {};
        }
    }
})()