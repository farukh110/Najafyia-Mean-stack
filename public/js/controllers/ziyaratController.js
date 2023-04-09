(function () {

    angular.module('mainApp').controller('ziyaratController', ZiyaratController);

    function ZiyaratController($scope, $rootScope, $state, $location, $stateParams, ziyaratService, countryService, $translate, config) {

        var ziyaratVM = this;
        ziyaratVM.details = {};
        ziyaratVM.ziyaratList = [];
        ziyaratVM.countryList = [];
        ziyaratVM.selectedZiyaratList = [];
        ziyaratVM.registeredForZiyarat = false;

        ziyaratVM.getZiyaratList = getZiyaratList;
        ziyaratVM.getActiveZiyaratList = getActiveZiyaratList;
        ziyaratVM.getSelectedZiyaratList = getSelectedZiyaratList;
        ziyaratVM.getZiyaratByUserId = getZiyaratByUserId;
        ziyaratVM.registerForZiyarat = registerForZiyarat;
        ziyaratVM.sendEmailtoZaireen = sendEmailtoZaireen;
        ziyaratVM.saveZiyaratList = saveZiyaratList;
        ziyaratVM.resetForm = resetForm;
        ziyaratVM.getConsultantEmail = getConsultantEmail;
       // ziyaratVM.getNextDayOfWeek = getNextDayOfWeek;
        ziyaratVM.isValidUser = false;
        ziyaratVM.triggerZaireenNotificationStatus = triggerZaireenNotificationStatus;
        ziyaratVM.showSendEmailButton = true;
        ziyaratVM.ButtonText = "Yes It has been Performed, Update Zaireen!";
        ziyaratVM.resDate = new Date();
        ziyaratVM.getZiyaratSetting = getZiyaratSetting;
        ziyaratVM.saveZiyaratSetting = saveZiyaratSetting; 
        ziyaratVM.AddNewRow = AddNewRow;
        ziyaratVM.deleteConsultantofThisRow = deleteConsultantofThisRow;

        const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];


        ziyaratVM.ziyaratSetting = {
            ziyaratProcessAutomate : false ,
            adminEmails: '', 
            consultants : [{
                name: '',
                email: '',
                queryString: '',
                phone: ''
            }]
        };
        

        //ziyaratVM.today = new Date();
        $scope.today = new Date();
        countryService.getCountryList().then(function (response) {
            ziyaratVM.countryList = response.data || [];
            ziyaratVM.countryList = ziyaratVM.countryList.map(c => {
                if (localStorage.getItem('lang') === 'FRN') {
                    c.name = c.nameFRN;
                } else if (localStorage.getItem('lang') === 'ARB') {
                    c.name = c.nameARB;
                }
                return c;
            })
        });

        
        function validateQueryString() {
            let consultantId = $location.search().Uid;

            ziyaratService.validateZaireenNotificationStatus(consultantId).then(function (response) {
                if (response.data && response.data.isValid) {
                    ziyaratVM.isValidUser = true;
                    if ( ! (Object.keys(response.data.data).length === 0 && (response.data.data).constructor === Object)   ) {
                        ziyaratVM.ButtonText = "We have already received request for sending notifications to Zaireen from you.";
                        ziyaratVM.showSendEmailButton = false;
                    }
                    else {
                        ziyaratVM.ButtonText = `Has Ziayarat for this Thursday ${$scope.today} been performed?`;
                        ziyaratVM.showSendEmailButton = true;
                    }
                }
                else {
                    ziyaratVM.isValidUser = false;
                    $state.go('home');
                }
            });
        }

        function getConsultantEmail() {
            ziyaratService.getConsultantEmail()
                .then(function (data) {
                    ziyaratVM.details.consultantEmail = data.data.consultantEmail;
                }).catch()
        }
        $scope.disableClick = function (isDisabled) {
            $scope.isDisabled = !isDisabled;
        }

        function getActiveZiyaratList() {
            ziyaratService.getActiveZiyaratList().then(function (response) {
                ziyaratVM.ziyaratList = response.data || [];
            });
        }

        function getZiyaratList() {
            ziyaratService.getZiyaratList().then(function (response) {
                ziyaratVM.ziyaratList = response.data || [];
            });
        }

        function getSelectedZiyaratList(fromAdmin) {
            ziyaratService.getSelectedZiyaratList(fromAdmin).then(function (response) {
                ziyaratVM.selectedZiyaratList = response.data || [];
                let resultDate  =  response.data ? new Date( response.data[0].ziyaratDate) : '';
                ziyaratVM.resDate =resultDate.toISOString().split('T')[0]; 
                let  str = resultDate.getDate() + ' ' + monthNames[resultDate.getMonth()] + ' ' + resultDate.getFullYear();
                $scope.today = str;
                if(fromAdmin != 'admin')
                {
                validateQueryString();
                }

            });
        }


        function getZiyaratSetting() {
            // make endpoint in ziyarat service 
            ziyaratService.getZiyaratSetting().then(function (response) {
                ziyaratVM.ziyaratSetting = response.data  ?  response.data :  ziyaratVM.ziyaratSetting;
            });
        }

function AddNewRow (){

    ziyaratVM.ziyaratSetting.consultants.push({
    name: '',
    email: '',
    queryString: '',
    phone: ''});
    

}


function deleteConsultantofThisRow(index)
{
    ziyaratVM.ziyaratSetting.consultants.splice(index, 1);
       
}

        function saveZiyaratSetting() {

            ziyaratService.saveZiyaratSetting(ziyaratVM.ziyaratSetting).then(function (response) {
                if (response) {
                    swal({
                        title: 'Saved',
                        position: 'center-center',
                        type: 'success',
                        allowOutsideClick: false
                    });
                } else {
                    swal({
                        title: $translate.instant('Failed to save'),
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false
                    });
                }
            });
        }



        function getZiyaratByUserId() {
            ziyaratService.getZiyaratByUserId().then(function (response) {
                ziyaratVM.registeredForZiyarat = response.data;
            });
        }

        $scope.sendMailConsultant = function () {
            ziyaratService.sendMailConsultant().then(() => {
                swal(
                    $translate.instant('Success!'),
                    'Email Sent to consultant',
                    'success'
                );
            }).catch(() => {
                swal(
                    $translate.instant('Success!'),
                    'Error Sending Email',
                    'success'
                );
            })
        }
        function registerForZiyarat() {
            if (!ziyaratVM.processing) {
                ziyaratVM.processing = true;
                var obj = {
                    fullName: $rootScope.loggedInUserDetails.fullName,
                    email: $rootScope.loggedInUserDetails.email,
                    phone: $rootScope.loggedInUserDetails.mobile,
                    language: $rootScope.loggedInUserDetails.language,
                    date: new Date(),
                    country: $rootScope.loggedInUserDetails.country
                }
                ziyaratService.registerForZiyarat(obj).then(function (response) {
                    if (response.status == 200) {
                        ziyaratVM.getZiyaratList();
                        ziyaratVM.getZiyaratByUserId();
                        if (response.data == config.Messages.ZiaratRegSuccess) {
                            let toastMsg;
                            if (localStorage.getItem('lang') == 'ARB') {
                                toastMsg = "تم تسجيلك للزيارة";
                            } else if (localStorage.getItem('lang') == 'FRN') {
                                toastMsg = "Ziyarah enregistré!";
                            } else {
                                toastMsg = res.data;
                            }
                            swal(
                                $translate.instant('Success!'),
                                toastMsg,
                                'success'
                            );
                        }
                    } else {
                        ziyaratVM.processing = false;
                        swal(
                            'Failed!',
                            'Failed to save',
                            'error'
                        )
                    }
                });
            }
        }

        function sendEmailtoZaireen() {
            ziyaratService.sendEmailtoZaireen().then(function (response) {
                if (response.status == 200) {
                    $state.go('home');
                    swal(
                        $translate.instant('Success!'),
                        response.data,
                        'success'
                    );
                } else {
                    $state.go('home');
                    swal(
                        'Failed!',
                        'Failed to save',
                        'error'
                    )
                }
            });
        }

        function triggerZaireenNotificationStatus() {
            var obj = {
                consultantId: $location.search().Uid,
                totalZaireen: ziyaratVM.selectedZiyaratList.length,
                ziaratDate: ziyaratVM.resDate
            };
            ziyaratService.triggerZaireenNotificationStatus(obj).then(function (response) {
                if (response.status == 200) {
                    $state.go('home');
                    swal(
                        $translate.instant('Success!'),
                        'Zaireens will be notified shortly',
                        'success'
                    );
                } else {
                    $state.go('home');
                    swal(
                        'Failed!',
                        'Failed to save',
                        'error'
                    )
                }
            });


        }


        function saveZiyaratList() {
            ziyaratService.saveZiyaratList(ziyaratVM.details).then(function (response) {
                if (response) {
                    swal({
                        title: 'Saved',
                        position: 'center-center',
                        type: 'success',
                        allowOutsideClick: false
                    });
                } else {
                    swal({
                        title: $translate.instant('Failed to save'),
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false
                    });
                }
            });
        }

        function resetForm() {
            ziyaratVM.details = {};
            ziyaratVM.file = {};
            ziyaratVM.imegeURL = null;
        }

        jQuery("#txtFromDate").datepicker({
            autoclose: true
        });

        $scope.setPosFromDate = function () {
            var position = jQuery("#txtFromDate").offset().top;
            position = position - 300;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (position) + "px" });
        }
    }
})()