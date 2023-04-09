(function () {

    angular.module('mainApp').controller('orphanController', OrphanContoller);

    function OrphanContoller($scope, $rootScope, $location, $translate, MetaTagsService, $filter, $compile, $window, orphanService, multipartForm, currencyService, $state,
        programTypeService, cartService, projectService, generalCareService, darAlZahraService, studentProfileService, Upload, utilService,config,eventLogsService) {

        var vm = this;
        vm.addDays = addDays;
        vm.addOrphan = addOrphan;
        vm.getOrphans = getOrphans;
        vm.getOrphanDataForUpdate = getOrphanDataForUpdate;
        vm.getCountryList = getCountryList;
        vm.updateOrphan = updateOrphan;
        vm.deleteOrphan = deleteOrphan;
        vm.saveOrphanContent = saveOrphanContent;
        vm.getActiveGeneralCares = getActiveGeneralCares;
        vm.getAllActiveDarAlZahra = getAllActiveDarAlZahra;
        vm.donationProcess = {};
        vm.selectedCategory = [];
        vm.imageUrl = "";
        vm.file = {};
        vm.programType = {};
        vm.subCategories = [];
        vm.count = [
            min = 0,
            max = 0,
            interval = 0
        ]
        vm.orphans = [];
        $scope.user = {};
        $prices = ['1000', '1500', '2000'];
        vm.orphanName = "";
        vm.contactDetails = "";
        vm.familyName = "";
        vm.fileNumber = "";
        vm.imageUrl = "";
        vm.gender = 'Male';
        vm.isSyed = 'false';
        vm.dateOfBirth = "";
        vm.fatherName = "";
        vm.motherName = "";
        vm.causeOfDeath = "";

        $scope.totalSubscriptionAmount = undefined;

        vm.isPaymentEnabled = function () {
            if ($scope.user && $scope.user.roles && $scope.selectedCount && $scope.selectedGc.donationProcess[0].isRecurring && $scope.selectedGc.donationProcess[0].isAmount) {
                return (($scope.user.roles.length > 0 && $scope.selectedCount == $scope.user.roles.length) ? true : false)
            }
            else {
                if ($scope.totalAmount > 0) {
                    return true;

                }

            }

            return false;
        }
        $scope.selectedRecurring = false;
        $scope.isAutoRenew = false;

        $scope.amountIsAmount = true;

        $scope.isRecurringPaymentPlan = false;
        $scope.selectedCategory = "gc";

        $scope.countArray = [];


        $scope.paymentMethod = $translate.instant('ONETIME');

        vm.file = {};
        vm.clearCalculator = clearCalculator;
        vm.clearOrphanCalculator = clearOrphanCalculator;

        vm.language = localStorage.getItem('lang');
        $scope.age = function (birthday) {
            if (birthday) {
                let bday = new Date(birthday);
                var ageDifMs = Date.now() - bday.getTime();
                var ageDate = new Date(ageDifMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        }
        $scope.hideShowSponsored = function () {
            $scope.showSponsored = !$scope.showSponsored;
            vm.orphans = vm.totalOrphans;
            if ($scope.showSponsored) {
                vm.orphans = vm.orphans.filter(or => or.isSponsored);
                return;
            }
            vm.orphans = vm.orphans.filter(or => !or.isSponsored);
        }
        $scope.showAll = function () {
            vm.orphans = vm.totalOrphans;
        }
        $scope.submitFiles = function () {
            if ($scope.files) {
                $scope.uploadFiles($scope.files);
            }
        };

        // for multiple files:
        $scope.uploadFiles = function (files) {
            if (files && files.length) {

                // or send them all together for HTML5 browsers:

                Upload.upload({
                    url: '/api/orphan/uploadPhotos',
                    data: { form: files }
                }).then(function (res) {
                    if (res && res.status === 200) {
                        $scope.status = res.status;
                        swal({
                            title: $translate.instant('Success'),
                            message: $translate.instant('All data uploaded successfully'),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        });
                    }
                }, function (resp) {
                }, function (evt) {
                    $scope.progressPercentage = Math.round(100.0 * evt.loaded / evt.total);
                    if ($scope.progressPercentage == 100) {
                        setTimeout(() => {
                            $scope.progressPercentage = 0;
                            $scope.files = []
                        }, 800)

                    }
                }).catch(e => {
                    swal({
                        title: 'Failed',
                        message: 'fail to upload data',
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    });
                });
            }
        }
        $scope.handleFileSelect = function () {
            let orphanKeys = ['orphanName', 'orphanId', 'gender', 'dateOfBirth', 'descent', 'city', 'country', 'causeOfDeath'];
            if (!$scope.csvFile) {
                swal({
                    title: 'File not found',
                    message: 'fail to upload data',
                    position: 'center-center',
                    type: 'error',
                    allowOutsideClick: false,
                });
                return;
            }
            $scope.processingCSV = true;
            Papa.parse($scope.csvFile, {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    if (results && results.data && results.data.length) {
                        let updatedArray = [];
                        for (var i = 0; i < results.data.length; i++) {
                            let row = results.data[i];
                            if (row && Object.keys(row).length && typeof row == 'object') {
                                for (var key in row) {
                                    if (row.hasOwnProperty(key) && row[key]) {
                                        const newKey = _.camelCase(key.trim());
                                        if (newKey === 'descent') {
                                            row[key] = row[key] === $translate.instant("SYED") ? "Syed" : "Non-Syed";
                                        }
                                        if (newKey === 'gender') {
                                            row[key] = row[key] === $translate.instant("MALE") ? "Male" : "Female";
                                        }
                                        delete Object.assign(row, { [newKey]: row[key] })[key];
                                        if (!orphanKeys.find(k => k === newKey)) {
                                            $scope.processingCSV = false;
                                            return swal({
                                                title: 'Please update your csv with valid data',
                                                position: 'center-center',
                                                type: 'error',
                                                allowOutsideClick: false,
                                            });
                                        }
                                    } else break;
                                }
                                row.language = localStorage.getItem('lang');
                                updatedArray.push(row);
                            } else {
                                swal({
                                    title: 'Empty Data Found',
                                    message: `Please update your csv with valid data`,
                                    position: 'center-center',
                                    type: 'error',
                                    allowOutsideClick: false,
                                });
                                break;
                            }
                        }
                        if (updatedArray.length !== results.data.length) return;
                        updatedArray.pop();
                        orphanService.addOrphansList(updatedArray)
                            .then((res) => {
                                if (res) {
                                    swal({
                                        title: $translate.instant('Success'),
                                        message: $translate.instant('All data uploaded successfully'),
                                        position: 'center-center',
                                        type: 'success',
                                        allowOutsideClick: false,
                                    }).then(function () {
                                        location.reload();
                                        // $state.go($state.current, {}, {reload: false});
                                    });
                                }
                            }).catch(e => {
                                swal({
                                    title: 'Failed',
                                    message: 'fail to upload data',
                                    position: 'center-center',
                                    type: 'error',
                                    allowOutsideClick: false,
                                });
                            })
                    }
                }
            });
        }
        $scope.isNumberKey = function ($event) {
            let amount = String.fromCharCode(event.which || event.keyCode)
            let pattern = /^[0-9]\d*(\.\d+)?$/;
            if (!pattern.test(amount)) {
                event.preventDefault()
            }
        }

        let myobj = JSON.parse(sessionStorage.getItem('currency'));
        $scope.prices = [1000, 1500, 2000];
        $scope.originalPrices = [1000, 1500, 2000];
        //FAST DONATION END
        for (let i = 0; i < $scope.prices.length; i++) {
            if (myobj.title != 'USD') {
                $scope.prices[i] = currencyService.currencyConversionFormula(myobj.rateExchange * $scope.prices[i]);
            } else {
                break;
            }
        }
        function getCountryList() {
            studentProfileService.getCountryList().then(function (res) {
                vm.country = res.data;
                vm.country = vm.country.map(c => {
                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;
                    }
                    return c;
                })
                vm.selectedCountry = vm.country.find(function (ctry) {
                    return ctry.name === vm.selectedCountry;
                });
            });
        }
        // Function to Add New Orphan
        function addOrphan(isValid) {

            try {

                //let res = {data:0};
               multipartForm.post('/upload', vm.file).then(function (res) {
                    var imageLink = res.data.name || '';
                    var obj = new Object();
                    obj.orphanId = vm.orphanId;
                    obj.orphanName = vm.orphanName;
                    obj.contactDetails = vm.contactDetails;
                    obj.familyName = vm.familyName;
                    obj.fileNumber = vm.fileNumber;
                    obj.startingDate = vm.startingDate;
                    obj.endingDate = vm.endingDate;
                    obj.isActive = true;
                    obj.isSyed = vm.isSyed;
                    obj.imageLink = imageLink;
                    obj.dateOfBirth = vm.dateOfBirth;
                    obj.gender = vm.gender;
                    obj.country = vm.selectedCountry;
                    obj.city = vm.city;
                    obj.fatherName = vm.fatherName;
                    obj.motherName = vm.motherName;
                    obj.causeOfDeath = vm.causeOfDeath;
                    obj.language = vm.language;
                    orphanService.addOrphan(obj).then(function (res) {

                        swal({
                            title: $translate.instant(res.data),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/orphanList";
                        });
                        return res;
                    });
                    //Image block end
               }).catch(err => console.log(`Caught by .catch ${JSON.stringify(err)}`));;


            } catch (ex) {
                console.log('caught in public js catch ',ex);

            }

        }

        $scope.selectedCurrencySymbol = JSON.parse(sessionStorage.getItem('currency')).symbol;

        // Function to get all Orphans
        function getOrphans() {
            orphanService.getOrphans().then(function (res) {
                vm.orphans = res.data;
                vm.totalOrphans = res.data;
                return res;
            });
        }

        function saveOrphanContent() {
            orphanService.addOrphanContent({ content: vm.content, _id: vm.programType._id }).then(function (res) {
                vm.orphans = res.data;
                return res;
            });
        }

        //Function to Activate/Deactivate Orphan profile
        function deleteOrphan(orphanId, status) {
            if (status == true) {
                swal({
                    title: $translate.instant('Are you sure?'),
                    text: "",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: $translate.instant('Yes, Deactivate it!'),
                    cancelButtonText: $translate.instant('No, cancel!'),
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: false
                }).then(function (result) {
                    if (result.value) {
                        orphanService.deleteOrphan(orphanId, status).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                $translate.instant('Orphan has been deactivated.'),
                                'success'
                            )
                            getOrphans();
                            return res;
                        });
                    } else if (result.dismiss === 'cancel') {
                        swal(
                            'Cancelled',
                            '',
                            'error'
                        )
                    }
                });
            }
            else {
                orphanService.deleteOrphan(orphanId, status).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        $translate.instant('Orphan has been Activated.'),
                        'success'
                    )
                    getOrphans();
                    return res;
                });
            }
        }

        //Function to Update Orphan
        function updateOrphan() {
            if (vm.file.name == undefined) {
                let orphanObject = getUpdatedOrphanData();
                orphanObject.imageLink = vm.imageLink;
                orphanService.updateOrphan(orphanObject).then(function (res) {

                    swal({
                        title: $translate.instant(res.data),
                        position: 'center-center',
                        type: 'success',
                        allowOutsideClick: false,
                    }).then(function () {
                        window.location = "#/admin/orphanList";
                    });
                    return res;
                }).catch(function (e) {
                    swal({
                        title: e.statusText,
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    })
                });
            }
            else {
                multipartForm.post('/upload', vm.file).then(function (res) {
                    let orphanObject = getUpdatedOrphanData();
                    orphanObject.imageLink = res.data.name;
                    orphanService.updateOrphan(orphanObject).then(function (res) {

                        swal({
                            title: $translate.instant(res.data),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/orphanList";
                        });
                        return res;
                    });
                });
            }
        }

        //Function to create orphan update object
        function getUpdatedOrphanData() {
            var obj = new Object();
            obj.id = vm._id;
            obj.orphanId = vm.orphanId;
            obj.orphanName = vm.orphanName;
            obj.contactDetails = vm.contactDetails;
            obj.startingDate = vm.startingDate;
            obj.endingDate = vm.endingDate;
            obj.familyName = vm.familyName;
            obj.fileNumber = vm.fileNumber;
            obj.isSyed = vm.isSyed;
            obj.imageLink = vm.imageLink;
            obj.gender = vm.gender;
            obj.country = vm.selectedCountry;
            obj.city = vm.city;
            obj.fatherName = vm.fatherName;
            obj.motherName = vm.motherName;
            obj.dateOfBirth = vm.dateOfBirth;
            obj.causeOfDeath = vm.causeOfDeath;

            return obj;
        }

        //Function to get Orphan Data for Update
        function getOrphanDataForUpdate() {
            var id = $location.search().orphanId;

            orphanService.getOrphanById(id).then(function (res) {
                let data = res.data[0];
                vm._id = data._id;
                vm.orphanId = data.orphanId;
                vm.orphanName = data.orphanName;
                vm.contactDetails = data.contactDetails;
                vm.familyName = data.familyName;
                vm.fileNumber = data.fileNumber;
                vm.startingDate = data.startingDate;
                vm.dateOfBirth = data.dateOfBirth;
                var dateOfbirth = jQuery('#txtDOB');
                dateOfbirth.datepicker();
                dateOfbirth.datepicker('setDate', vm.dateOfBirth);
                vm.endingDate = data.endingDate;
                var durationEDate = jQuery('#txtToDate');
                durationEDate.datepicker();
                durationEDate.datepicker('setDate', vm.endingDate);
                vm.isSyed = data.isSyed;
                vm.gender = data.gender;
                vm.selectedCountry = data.country;
                vm.city = data.city;
                vm.causeOfDeath = data.causeOfDeath;
                vm.fatherName = data.fatherName;
                vm.motherName = data.motherName;
                vm.imageLink = data.imageLink;

                return res;
            });
        }
        jQuery("#txtFromDate").datepicker({
            autoclose: true
        });

        //DOB
        jQuery("#txtDOB1").datepicker({
            autoclose: true,
        });
        //For Add/Update Student Profile Form DOB
        $scope.dobDateChange = function () {
            jQuery("#txtAdmissionDate").datepicker("remove");
            jQuery("#txtAdmissionDate").val('');
            //Function to Add one day to Date
            var admissionDateNew = vm.addDays(new Date(vm.dateOfBirth), 1);
            jQuery("#txtAdmissionDate").datepicker({
                autoclose: true,
                startDate: new Date(admissionDateNew),
            });
        }
        //Admission Date
        jQuery("#txtAdmissionDate").datepicker({
            autoclose: true,
        });
        //For Add/Update Student Profile Form Admission Date
        $scope.admissionDateChange = function () {
            jQuery("#txtFromDate").datepicker("remove");
            jQuery("#txtFromDate").val('');
            //Function to Add one day to Date
            var startingDateNew = vm.addDays(new Date(vm.admissionDate), 1);
            jQuery("#txtFromDate").datepicker({
                autoclose: true,
                startDate: new Date(startingDateNew),
            });
        }
        //For Add/Update Student Profile Form
        $scope.startDateChange = function () {
            jQuery("#txtToDate").datepicker("remove");
            jQuery("#txtToDate").val('');
            //Function to Add one day to Date
            var endingDateNew = vm.addDays(new Date(vm.startingDate), 1);
            jQuery("#txtToDate").datepicker({
                autoclose: true,
                startDate: new Date(endingDateNew),
            });
        }
        $scope.setPos = function () {
            var txtFromDatePos = jQuery("#txtFromDate").offset().top;
            var txtToDatePos = jQuery("#txtToDate").offset().top;

            txtFromDatePos = txtFromDatePos - 275;
            txtToDatePos = txtToDatePos - 275;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtFromDatePos) + "px" });
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtToDate) + "px" });

        }
        $scope.setPosAdmissionDate = function () {
            var txtAdmissionDatePos = jQuery("#txtAdmissionDate").offset().top;
            txtAdmissionDatePos = txtAdmissionDatePos - 270;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtAdmissionDatePos) + "px" });
        }
        $scope.setPosDOB = function () {
            var txtDOBPos = jQuery("#txtDOB1").offset().top;
            txtDOBPos = txtDOBPos - 270;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (txtDOBPos) + "px" });
        }

        function addDays(startDate, numberOfDays) {
            var returnDate = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate() + numberOfDays,
                startDate.getHours(),
                startDate.getMinutes(),
                startDate.getSeconds());
            return returnDate;
        }

        // get  Generalcare objects
        function getActiveGeneralCares() {
            if (localStorage.getItem('lang') == 'ARB') {
                generalCare = "الرعاية العامة";
            } else if (localStorage.getItem('lang') == 'FRN') {
                generalCare = 'Premières nécessités';
            } else {
                generalCare = "General Care";
            }
            programTypeService.getProgramType(generalCare).then(function (res) {
                vm.programType = res.data[0];
                var programTypeId = vm.programType._id;
                const metaData = {
                    title: 'Orphans',
                    description: vm.programType.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.programType.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/orphans/${vm.programType._id}`,
                };
                MetaTagsService.setPageMeta(metaData, vm.programType._id, 'orphans');
                generalCareService.getGeneralCare(programTypeId).then(function (res) {
                    vm.generalCares = _.filter(res.data, function (e) {
                        return e.isActive == true;
                    });
                    $scope.generalCareList = vm.generalCares;
                    return res;
                });
            }
            );
        }

        // get  Dar Al Zahra objects
        function getAllActiveDarAlZahra() {
            if (localStorage.getItem('lang') == 'ARB') {
                project = "(دار الزهراء (ع";
            } else if (localStorage.getItem('lang') == 'FRN') {
                project = "Dar-Al-Zahra";
            } else {
                project = "Dar Al Zahra";
            }
            programTypeService.getProgramType(project).then(function (res) {
                vm.programType = res.data[0];
                var programTypeId = vm.programType._id;
                vm.content = vm.programType.content;
                darAlZahraService.getDarAlZahra(programTypeId).then(function (res) {
                    vm.allDarAlZahra = _.filter(res.data, function (e) {
                        return e.isActive == true;
                    });
                    $scope.daralzahraCat = vm.allDarAlZahra;
                    return res;
                });
            }
            );
        }

        $scope.selectGcCalculator = function () {
            getGcCalculator($scope.selectedGc);

        }

        $scope.selectDzCalculator = function () {
            getDzCalculator($scope.selectedDz);
        }




        $scope.getCountValues = function () {

            if ($scope.selectedGc) {
                let min = Math.round($scope.selectedGc.donationProcess[0].countMin);
                let max = Math.round($scope.selectedGc.donationProcess[0].countMax);
                var interval = Math.round($scope.selectedGc.donationProcess[0].interval);
                console.log(min);
                let arry = [{}];
                for (let i = min; i <= max; i += interval) {
                    arry[i - 1] = i;
                }

                $scope.countArray = arry;
                // $scope.selectedCount = -1

            }
        }

        this.hero = {
            name: 'Spawn'
        };
        $scope.countChangeGc = function () {
            $scope.countChange();
        }



        $scope.countChange = function () {
            let paymentDate = new Date();
            if ($scope.orphanType == 'gc') { //$scopr.selectedRecurring
                if ($scope.selectedGc.donationProcess[0].isRecurring && ($scope.selectedRecurring || $scope.isRecurringPaymentPlan)) {
                    $scope.selectedCount = $scope.selectedCount == undefined ? 0 : $scope.selectedCount;
                    let numOfMonths = $scope.selectedGc.donationProcess[0].subscriptionDetail.duration.numOfMonths;
                    let amountPerOrphan = Math.ceil(($scope.amountValue) / numOfMonths).toFixed(2);
                    $scope.totalAmount = ($scope.selectedCount || 0) * amountPerOrphan;
                    $scope.totalSubscriptionAmount = Math.round((($scope.selectedCount || 0) * $scope.amountValue)).toFixed(2);

                    paymentDate = new Date(paymentDate.setMonth(paymentDate.getMonth() + numOfMonths));
                    let monthNumber = paymentDate.getMonth();

                    let pd = paymentDate.getDate();
                    let year = paymentDate.getFullYear();

                    let formatted_date = new Date(monthNumber + "-" + pd + "-" + year);
                    let language = localStorage.getItem('lang');



                    let messageCOmmand = $scope.selectedGc.donationProcess[0].subscriptionDetail.paymentChargeMessage.value[language];

                    $scope.paymentChargeMessage = messageCOmmand.replace("[currency]", $scope.selectedCurrencySymbol).replace("[amount]", $scope.totalAmount).replace("[date]", $filter('date')(formatted_date, "dd-MM-yyyy"));


                }
                else {
                    if ($scope.amountValue != undefined && $scope.amountValue != null && $scope.amountValue != 0) {
                        if ($scope.selectedCount != undefined && $scope.selectedCount != null && $scope.selectedCount != 0) {
                            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                        }
                        else {
                            $scope.totalAmount = $scope.amountValue;
                        }
                    }
                    else {
                        // $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValueForNonFixed).toFixed(2);
                        $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValueForNonFixed).toFixed(2);
                    }

                    $scope.totalSubscriptionAmount = $scope.totalAmount;
                }
            }
            else if ($scope.orphanType == 'dz') {
                if ($scope.selectedDz.donationProcess[0].isAmount) {
                    if ($scope.selectedRecurring) {
                        if ($scope.selectedDonationDuration && ($scope.selectedDonationDuration.donationDurationName == "Half Yearly" || $scope.selectedDonationDuration.donationDurationName == "نصف سنوي" || $scope.selectedDonationDuration.donationDurationName == "Semestriel")) {
                            $scope.totalAmountPerMonth = ((($scope.selectedCount || 0) * $scope.amountValue) / 6).toFixed(2);
                            $scope.totalAmount = Math.round((($scope.selectedCount || 0) * $scope.amountValue) / 6).toFixed(2);
                            paymentDate = new Date(paymentDate.setMonth(paymentDate.getMonth() + 6))
                            let monthNumber = paymentDate.getMonth();

                            if (!monthNumber)
                                monthNumber = paymentDate.getMonth() + 1;
                            let formatted_date = new Date(monthNumber + "-" + paymentDate.getDate() + "-" + paymentDate.getFullYear())
                            let language = localStorage.getItem('lang');
                            if (language == 'ARB') {
                                $scope.commentTxt = "يرجى ملاحظة أنه سيتم خصم " + $scope.selectedCurrencySymbol + $scope.totalAmount + " شهريًا حتى " + $filter('date')(formatted_date, "yyyy-MM-dd");
                            }
                            else if (language == 'FRN') {
                                $scope.commentTxt = "Veuillez noter que les " + $scope.selectedCurrencySymbol + $scope.totalAmount + " seront déduit mensuellement pour une période de (06) mois jusqu'au " + $filter('date')(formatted_date, "dd-MM-yyyy");;

                            } else {
                                $scope.commentTxt = "Please note that the " + $scope.selectedCurrencySymbol + $scope.totalAmount + " will be deducted monthly for a period of (06) months until " + $filter('date')(formatted_date, "dd-MM-yyyy");
                            }
                        } else {
                            $scope.totalAmountPerMonth = ((($scope.selectedCount || 0) * $scope.amountValue) / 12).toFixed(2);
                            $scope.totalAmount = Math.round((($scope.selectedCount || 0) * $scope.amountValue) / 12).toFixed(2);
                            paymentDate = new Date(paymentDate.setFullYear(paymentDate.getFullYear() + 1));
                            let monthNumber = paymentDate.getMonth();

                            if (!monthNumber)
                                monthNumber = paymentDate.getMonth() + 1;
                            let formatted_date = new Date(monthNumber + "-" + paymentDate.getDate() + "-" + paymentDate.getFullYear())
                            let language = localStorage.getItem('lang');
                            if (language == 'ARB') {
                                $scope.commentTxt = "يرجى ملاحظة أنه سيتم خصم " + $scope.selectedCurrencySymbol + $scope.totalAmount + " شهريًا حتى " + $filter('date')(formatted_date, "yyyy-MM-dd");
                            }
                            else if (language == 'FRN') {
                                $scope.commentTxt = "Veuillez noter que les " + $scope.selectedCurrencySymbol + $scope.totalAmount + " seront déduit mensuellement jusqu'au " + $filter('date')(formatted_date, "dd-MM-yyyy");;

                            } else {
                                $scope.commentTxt = "Please note that the " + $scope.selectedCurrencySymbol + $scope.totalAmount + " will be deducted monthly until " + $filter('date')(formatted_date, "dd-MM-yyyy");
                            }
                        }
                    } else {
                        if ($scope.selectedDonationDuration && $scope.selectedDonationDuration.donationDurationName == "Yearly" || $scope.selectedDonationDuration.donationDurationName == "سنوي" || $scope.selectedDonationDuration.donationDurationName == "Annuel") {
                            $scope.totalAmountPerMonth = (($scope.selectedCount || 0) * $scope.amountValue);
                            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                        } else {
                            $scope.totalAmountPerMonth = Math.round((($scope.selectedCount || 0) * $scope.amountValue) / 2).toFixed(2);
                            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                        }
                    }
                }
                // if ($scope.selectedDz.donationProcess[0].isAmount) {
                //     $scope.totalAmount = ($scope.selectedCount || 0)* $scope.amountValue;
                // } else {
                //     $scope.totalAmount = ($scope.selectedCount || 0)* $scope.amountValueForNonFixed;
                // }
            }
        }
        $scope.countChangeForNonFixed = function () {
            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValueForNonFixed).toFixed(2);
        }
        $scope.getOrphansByCount = function (orphanCount) {
            $scope.selectedDescend = 'Any';
            $scope.selectedGender = 'Any';
            //$scope.user.roles = [];
            if (($scope.selectedRecurring !== false && !$scope.selectedRecurring) || ($scope.selectedDescend !== false && !$scope.selectedDescend)) {
                let validateMsg;
                if (localStorage.getItem('lang') == 'ARB') {
                    validateMsg = "يرجى ملء الحقول الفارغة";
                } else if (localStorage.getItem('lang') == 'FRN') {
                    validateMsg = "Veuillez remplir les champs manquants";
                } else {
                    validateMsg = "Please fill the missing fields";
                }
                swal({
                    title: validateMsg,
                    position: 'center-center',
                    type: 'error',
                    allowOutsideClick: false,
                })
                return;
            }
            vm.orphans = [];
            orphanService.getOrphansByCount(orphanCount, $scope.selectedDescend, $scope.selectedGender).then(function (res) {
                vm.orphans = res.data;
                cartService.getCartDetail().then(cres => {
                    if (cres && cres.data && cres.data.items && cres.data.items.length) {
                        vm.orphans = vm.orphanCompleteList = res.data.map(item1 => {
                            if (cres.data.items.some(item2 => (item2.orphans && item2.orphans.find(i => i === item1._id) === item1._id))) {
                                item1.alreadyInCart = true;
                                return item1;
                            } else return item1;
                        });
                    } else vm.orphans = vm.orphanCompleteList = res.data;
                })
            });
        }

        $scope.getStudentsByCount = function (studentsCount) {
            $scope.user.roles = [];
            if (
                ($scope.selectedDonationDuration !== false && !$scope.selectedDonationDuration) || ($scope.selectedRecurring !== false && !$scope.selectedRecurring) || ($scope.selectedDescend !== false && !$scope.selectedDescend)
            ) {
                let validateMsg;
                if (localStorage.getItem('lang') == 'ARB') {
                    validateMsg = "يرجى ملء الحقول الفارغة";
                } else if (localStorage.getItem('lang') == 'FRN') {
                    validateMsg = "Veuillez remplir les champs manquants";
                } else {
                    validateMsg = "Please fill the missing fields";
                }
                swal({
                    title: validateMsg,
                    position: 'center-center',
                    type: 'error',
                    allowOutsideClick: false,
                })
                return;
            }
            vm.students = [];
            studentProfileService.getStudentsByCount(studentsCount, $scope.selectedDescend).then(function (res) {
                vm.students = res.data;
                cartService.getCartDetail().then(cres => {
                    if (cres && cres.data && cres.data.items && cres.data.items.length) {
                        vm.students = res.data.map(item1 => {
                            if (cres.data.items.some(item2 => (item2.students && item2.students.find(i => i === item1._id) === item1._id))) {
                                item1.alreadyInCart = true;
                                return item1;
                            } else return item1;
                        });
                    } else vm.students = res.data;
                })
            });
        }


        $scope.checkPaymentPlan = function () {

            if ($scope.selectedPaymentPlan) {

                if ($scope.selectedPaymentPlan.Name != "GIVE_ONCE") {

                    $scope.isRecurringPaymentPlan = true;
                }
                else {
                    $scope.isRecurringPaymentPlan = false;
                }
            }
            if ($scope.selectedCount > 0) {
                $scope.countChange();
            }
        }

        function getGcCalculator(projectDetail) {


            $scope.totalSubscriptionAmount = undefined;
            $scope.sponsorshipPlanText = undefined;
            $scope.amountIsAmount = true;
            $scope.amountValue = null;
            $scope.paymentPlans = [];
            $scope.autoRenewMessage = undefined;
            $scope.paymentChargeMessage = undefined;
            vm.projectCalculator = "";
            $scope.totalAmount = null;
            $scope.user.roles = [];
            let stringAutoRenew = "";
            if (projectDetail != undefined) {
                vm.subCategories = projectDetail.programSubCategory;
                if (vm.subCategories != undefined ? vm.subCategories.length > 0 : false) {
                    vm.projectCalculator += "<div class='form-group'>";
                    vm.projectCalculator += " <label >{{ 'SUB CATEGORY' | translate }}</label>";
                    vm.projectCalculator += "<select  class='form-control' ng-model='projectVM.selectedCategory' ng-change='projectVM.checkSubCategory()' ng-options='x.programSubCategoryName for x in projectVM.subCategories'>"
                    vm.projectCalculator += "</select>";
                    vm.projectCalculator += "</div>";
                }
                let donationProcess = projectDetail.donationProcess[0];
                //if Amount is Fixed
                if (donationProcess.isAmount) {
                    var obj = new Object();
                    obj.currency = JSON.parse(sessionStorage.getItem('currency'));
                    if (obj.currency.title == "USD") {
                        let fixedAmount = Math.round(donationProcess.amount).toFixed(2);
                        $scope.amountValue = fixedAmount;
                    } else {
                        let fixedAmount = Math.round(currencyService.currencyConversionFormula(obj.currency.rateExchange * donationProcess.amount)).toFixed(2);
                        $scope.amountValue = Math.round(fixedAmount).toFixed(2);
                    }
                    vm.amount = Math.round(donationProcess.amount).toFixed(2);

                    let lang = localStorage.getItem('lang');
                    if (donationProcess.subscriptionDetail) {
                        $scope.paymentPlans = donationProcess.subscriptionDetail.paymentPlan;
                        $scope.sponsorshipPlanText = utilService.getSponsorshipPlanString(donationProcess.subscriptionDetail.duration.numOfMonths, $scope.amountValue);
                        $scope.autoRenewMessage = donationProcess.subscriptionDetail.autoRenewMessage.value[lang];
                    }
                    else {
                        $scope.paymentPlans = [{
                            "Name": "GIVE_ONCE",
                            "value": {
                                "FRN": "Donner une fois",
                                "ARB": "أعط مرة واحدة",
                                "ENG": "Give Once"
                            }
                        }];
                    }
                    $scope.selectedPaymentPlan = undefined;

                    if (donationProcess.isRecurring) {




                        // if (donationProcess.processType && donationProcess.processType === "Subscription") {



                        //     stringAutoRenew += "<div class='form-group'>";
                        //     stringAutoRenew += "<input type='checkbox'  />";
                        //     stringAutoRenew += " <label><span class='commentTxt'><p>{{autoRenewMessage}}</p></span></label>";
                        //     stringAutoRenew += "</div>";



                        //     // stringAutoRenew = "<div class='form-group'>";
                        //     // stringAutoRenew += "<input type='checkbox'  class='form-control' />";
                        //     // stringAutoRenew += " <label ><span> Renew SponsorShipeveryYear</span></label>";
                        //     // stringAutoRenew +=  "</div>";





                        //     vm.projectCalculator += "<div class='form-group'>";
                        //     vm.projectCalculator += " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                        //     // vm.projectCalculator += "<select  class='form-control' ng-model='selectedRecurring' ng-change='countChange()'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>"
                        //     vm.projectCalculator += "<select class='form-control' ng-model='selectedPaymentPlan' data-ng-change='checkPaymentPlan()' data-ng-options='pp.value." + lang + " for pp in paymentPlans'>  <option value=''> {{'PLEASE SELECT' | translate}}</option>  </select>";
                        //     vm.projectCalculator += "</div>";

                        // }

                        //  else {
                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                        // // vm.projectCalculator += "<select  class='form-control' ng-model='selectedRecurring' ng-change='countChange()'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>"
                        // vm.projectCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                        // vm.projectCalculator += "</div>";
                        //    }

                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label >{{ 'DESCEND' | translate }}</label>";
                        // vm.projectCalculator += "<select class='form-control' ng-model='selectedDescend' ng-change='clearOrphans()'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='true'>{{'SYED' | translate}}</option><option ng-value='false'>{{'NONSYED' | translate}}</option>";
                        // vm.projectCalculator += "</select>";
                        // vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label >{{ 'GENDER' | translate}}</label>";
                        // vm.projectCalculator += "<select class='form-control' ng-model='selectedGender' ng-change='clearOrphans()'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option value='Male'>{{'MALE' | translate}}</option><option value='Female'>{{'FEMALE' | translate}}</option>";
                        // vm.projectCalculator += "</select>";
                        // vm.projectCalculator += "</div>";


                        // vm.projectCalculator += "<div class='form-group ng-hide' ng-show='selectedRecurring'>";
                        // vm.projectCalculator += "<label for=''>{{ 'PAYMENT DATE' | translate}}</label>";
                        // vm.projectCalculator += "<div class='input-group date'>";
                        // vm.projectCalculator += "<div class='input-group-addon'>";
                        // vm.projectCalculator += "<i class='fa fa-calendar'></i>";
                        // vm.projectCalculator += "</div>";
                        // vm.projectCalculator += "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='paymentDate'>";
                        // vm.projectCalculator += "</div>";
                        // vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "<script>";
                        // vm.projectCalculator += "jQuery('#txtFromDate').datepicker({";
                        // vm.projectCalculator += " autoclose: true";
                        // vm.projectCalculator += "});";
                        // vm.projectCalculator += "</script>";


                        // jQuery("#project-calculator").append(vm.projectCalculator);
                    }

                    // vm.projectCalculator += "<div class='form-group'>";
                    // vm.projectCalculator += " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                    // vm.projectCalculator += " <label id='fixedAmountValue' ></label>";
                    // vm.projectCalculator += "<div class='input-group'>"
                    // vm.projectCalculator += "<div class='input-icon'>"
                    // vm.projectCalculator += "<input type='text'  ng-keypress='isNumberKey($event)' min='1' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='vm.isAmount' />"
                    // vm.projectCalculator += "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>"
                    // vm.projectCalculator += "</div>";
                    // vm.projectCalculator += "</div>";
                    // vm.projectCalculator += "</div>";

                    vm.isCount = donationProcess.isCount;
                    if (donationProcess.isCount) {

                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label >{{ 'COUNT' | translate }}</label>";
                        // vm.projectCalculator += "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
                        // vm.projectCalculator += "<option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        // let min = Math.round(donationProcess.countMin);
                        // let max = Math.round(donationProcess.countMax);
                        // var interval = Math.round(donationProcess.interval);
                        // for (let i = min; i <= max; i += interval) {
                        //     vm.projectCalculator += "      <option ng-value='" + i + "'>" + i + "</option>";
                        // }
                        // vm.projectCalculator += "</select>";
                        // vm.projectCalculator += "</div>";
                    }

                    // vm.projectCalculator += "<div class='form-group'>";
                    // vm.projectCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                    // vm.projectCalculator += " <div class='input-group'>";
                    // //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                    // //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                    // //vm.projectCalculator +="</div>";
                    // vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1' data-ng-disabled='orphanVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                    // vm.projectCalculator += "</div>";
                    // vm.projectCalculator += "</div>";

                    if (donationProcess.isRecurring) {


                        // vm.projectCalculator += stringAutoRenew;




                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label><span ng-if='isRecurringProgram' class='commentTxt'>{{paymentChargeMessage}}</span></label>";
                        // vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "  <div class='form-group'>";
                        // vm.projectCalculator += "   <button class='grop-btn  grop-btn_submit' data-toggle='modal'";
                        // vm.projectCalculator += `data-target='#orphanListModal' ng-click='getOrphansByCount(selectedCount)' ng-show='(selectedDescend == undefined || selectedDescend === "") ? false : true && (selectedGender == undefined || selectedGender === "") ? false : true && selectedCount > 0 ? true : false'>{{'SELECT ORPHANS' | translate}}</button>`;
                        // vm.projectCalculator += "  </div>";


                        // vm.projectCalculator += "<div ng-show='(user.roles.length > 0 && selectedCount == user.roles.length) ? true : false'>";
                        // vm.projectCalculator += "   <div class='row'>";
                        // vm.projectCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        // vm.projectCalculator += "           <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                        // vm.projectCalculator += "       </div>";
                        // vm.projectCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        // vm.projectCalculator += "           <button class='grop-btn-donate  grop-btn_submit' data-ng-click='donate();'>{{ 'DONATE NOW' | translate }}</button>";
                        // vm.projectCalculator += "       </div>";
                        // vm.projectCalculator += "   </div>";
                        // vm.projectCalculator += "</div>";
                    }
                    else {
                        // if (projectDetail.slug == "eidiya") {

                        //     vm.projectCalculator += "<div class='form-group'>";
                        //     vm.projectCalculator += " <label><span class='commentTxt'>{{'EidhyaSponsorship' | translate}}</span></label>";
                        //     vm.projectCalculator += "</div>";
                        // }
                        // vm.projectCalculator += "<div class='row'>";
                        // vm.projectCalculator += "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        // vm.projectCalculator += "       <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                        // vm.projectCalculator += "   </div>";
                        // vm.projectCalculator += "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        // vm.projectCalculator += "       <button class='grop-btn-donate  grop-btn_submit' data-ng-click='donate();'>{{ 'DONATE NOW' | translate }}</button>";
                        // vm.projectCalculator += "   </div>";
                        // vm.projectCalculator += "</div>";
                    }
                } else {

                    $scope.amountIsAmount = false;
                    if (donationProcess.isRecurring) {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                        // vm.projectCalculator += "<select  class='form-control' ng-change='durationForRecurring()' ng-model='selectedRecurring'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>"
                        vm.projectCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                        vm.projectCalculator += "</div>";
                    }
                    if (donationProcess.isRecurring) {
                        $scope.donationDuration = donationProcess.donationDuration;
                        vm.projectCalculator += "<div class='form-group' data-ng-show='selectedRecurring==true'>";
                        vm.projectCalculator += " <label >{{ 'DURATION' | translate }}</label>";
                        vm.projectCalculator += "<select class='form-control' ng-model='selectedDonationDuration'  ng-options='x.donationDurationName for x in donationDuration'>";
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";
                        // jQuery("#project-calculator").append(vm.projectCalculator);
                    }
                    vm.isCount = donationProcess.isCount;
                    if (donationProcess.isCount) {

                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label id='amountLabel'>Amount<span class='danger'>*</span></label>";
                        // vm.projectCalculator += " <label id='fixedAmountValue' ></label>";
                        // vm.projectCalculator += "<input type='text'  id='amountTextBox' min='0' ng-keyup='countChangeForNonFixed()' ng-change='countChangeForNonFixed()' data-ng-model='amountValueForNonFixed'  class='form-control' ng-disabled='vm.isAmount' />"
                        // vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                        vm.projectCalculator += "<select  class='form-control' ng-change='countChangeForNonFixed()' ng-model='amountValueForNonFixed'>";
                        vm.projectCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        vm.projectCalculator += "<option data-ng-repeat='price in prices' ng-value='price'>{{selectedCurrencySymbol}} {{price}}</option>";
                        vm.projectCalculator += "</select></div>";
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'COUNT' | translate }}</label>";

                        vm.projectCalculator += "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeForNonFixed()'>";
                        vm.projectCalculator += "<option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        let min = Math.round(donationProcess.countMin);
                        let max = Math.round(donationProcess.countMax);
                        var interval = Math.round(donationProcess.interval);
                        for (let i = min; i <= max; i += interval) {
                            vm.projectCalculator += "      <option ng-value='" + i + "'>" + i + "</option>";
                        }
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator +="</div>";
                        vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1' data-ng-disabled='orphanVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";


                    } else {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator +="</div>";
                        vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1' data-ng-disabled='orphanVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";
                    }

                    vm.projectCalculator += "<div class='row'>";
                    vm.projectCalculator += "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                    vm.projectCalculator += "       <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                    vm.projectCalculator += "   </div>";
                    vm.projectCalculator += "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                    vm.projectCalculator += "       <button class='grop-btn-donate  grop-btn_submit' data-ng-click='donate();'>{{ 'DONATE NOW' | translate }}</button>";
                    vm.projectCalculator += "   </div>";
                    vm.projectCalculator += "</div>";
                }
            }


            //     let min = Math.round($scope.selectedGc.donationProcess[0].countMin);
            //  let max = Math.round($scope.selectedGc.donationProcess[0].countMax);
            //  var interval = Math.round($scope.selectedGc.donationProcess[0].interval);

            //  let arry = [];
            //  for(let i = min ; i <=  max ; i+= interval)
            //  {
            //     arry[i] = {"value":i};
            //  }


            //  $scope.countArray  = arry;


            let calculator = $compile(vm.projectCalculator)($scope);
            angular.element(document.getElementById("orphanCalculator")).html("").append(calculator);
            $scope.selectedRecurring = false;
            $scope.selectedCount = undefined;
            $scope.amountValueForNonFixed = undefined;
            $scope.selectedDescend = undefined;
            $scope.selectedGender = undefined;
        }


        $scope.user = {};

        projectService.getDonationDuration().then(function (res) {
            var currentMonth = new Date().getMonth() + 1;
            //var currentMonth = 7;
            if (currentMonth == 1 || currentMonth == 12) {
                var donation = []
                donation.push($filter('filter')(res.data, { 'noOfMonths': 6 })[0]);
                $scope.donationDurations = donation;
            }
            else if (currentMonth >= 7 || currentMonth <= 11) {
                var donation = []
                donation.push($filter('filter')(res.data, { 'noOfMonths': 12 })[0]);
                donation.push($filter('filter')(res.data, { 'noOfMonths': 6 })[0]);
                $scope.donationDurations = donation;
            }
        });

        function getDzCalculator(projectDetail) {
            vm.projectCalculator = "";
            $scope.totalAmount = null;
            $scope.user.roles = [];
            if (projectDetail != undefined) {
                vm.subCategories = projectDetail.programSubCategory;
                if (vm.subCategories != undefined ? vm.subCategories.length > 0 : false) {
                    vm.projectCalculator += "<div class='form-group'>";
                    vm.projectCalculator += " <label >SubCategory</label>";
                    vm.projectCalculator += "<select  class='form-control' ng-model='projectVM.selectedCategory' ng-change='projectVM.checkSubCategory()' ng-options='x.programSubCategoryName for x in projectVM.subCategories'>"
                    vm.projectCalculator += "</select>";
                    vm.projectCalculator += "</div>";
                }
                let donationProcess = projectDetail.donationProcess[0];
                //if Amount is Fixed
                if (donationProcess.isAmount) {
                    var obj = new Object();
                    obj.currency = JSON.parse(sessionStorage.getItem('currency'));
                    if (obj.currency.title == "USD") {
                        let fixedAmount = Math.round(donationProcess.amount).toFixed(2);
                        $scope.amountValue = fixedAmount;
                    } else {
                        let fixedAmount = Math.round(currencyService.currencyConversionFormula(obj.currency.rateExchange * donationProcess.amount)).toFixed(2);
                        $scope.amountValue = fixedAmount;
                    }

                    vm.amount = donationProcess.amount;
                    if (donationProcess.isRecurring) {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'DURATION' | translate }}</label>";
                        vm.projectCalculator += "<select class='form-control' ng-model='selectedDonationDuration' data-ng-change='durationForOneTimeAndRecurring()' ng-options='x.donationDurationName for x in donationDurations'>";
                        vm.projectCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                        // vm.projectCalculator += "<select  class='form-control' ng-model='selectedRecurring' ng-change='countChange()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>"
                        vm.projectCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                        vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "<div class='form-group' ng-show='selectedRecurring'>";
                        // vm.projectCalculator += "<label for=''>{{ 'PAYMENT DATE' | translate }}</label>";
                        // vm.projectCalculator += "<div class='input-group date'>";
                        // vm.projectCalculator += "<div class='input-group-addon'>";
                        // vm.projectCalculator += "<i class='fa fa-calendar'></i>";
                        // vm.projectCalculator += "</div>";
                        // vm.projectCalculator += "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='paymentDate'>";
                        // vm.projectCalculator += "</div>";
                        // vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "<script>";
                        // vm.projectCalculator += "jQuery('#txtFromDate').datepicker({";
                        // vm.projectCalculator += " autoclose: true";
                        // vm.projectCalculator += "});";
                        // vm.projectCalculator += "</script>";

                        if (donationProcess.isSyed) {
                            vm.projectCalculator += "<div class='form-group'>";
                            vm.projectCalculator += " <label >{{ 'DESCEND' | translate }}</label>";
                            vm.projectCalculator += "<select class='form-control' ng-model='selectedDescend' ng-change='clearOrphans()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='true'>{{'SYED' | translate}}</option><option ng-value='false'>{{'NONSYED' | translate}}</option>";
                            vm.projectCalculator += "</select>";
                            vm.projectCalculator += "</div>";
                        }
                        // jQuery("#project-calculator").append(vm.projectCalculator);
                    }

                    vm.projectCalculator += "<div class='form-group'>";
                    vm.projectCalculator += " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                    vm.projectCalculator += " <label id='fixedAmountValue' ></label>";
                    vm.projectCalculator += "<div class='input-group'>"
                    vm.projectCalculator += "<div class='input-icon'>"
                    vm.projectCalculator += "<input type='text'  ng-keypress='isNumberKey($event)' min='1' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='vm.isAmount' />"
                    vm.projectCalculator += "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>"
                    vm.projectCalculator += "</div>";
                    vm.projectCalculator += "</div>";
                    vm.projectCalculator += "</div>";

                    vm.isCount = donationProcess.isCount;
                    if (donationProcess.isCount) {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'COUNT' | translate }}</label>";
                        vm.projectCalculator += "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
                        vm.projectCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        let min = Math.round(donationProcess.countMin);
                        let max = Math.round(donationProcess.countMax);
                        var interval = Math.round(donationProcess.interval);
                        for (let i = min; i <= max; i += interval) {
                            vm.projectCalculator += "      <option ng-value='" + i + "'>" + i + "</option>";
                        }
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";
                    }

                    vm.projectCalculator += "<div class='form-group'>";
                    vm.projectCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                    vm.projectCalculator += " <div class='input-group'>";
                    //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                    //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                    //vm.projectCalculator +="</div>";
                    vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1' data-ng-disabled='orphanVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                    vm.projectCalculator += "</div>";
                    vm.projectCalculator += "</div>";

                    if (donationProcess.isRecurring) {

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label><span ng-if='selectedRecurring' class='commentTxt'>{{commentTxt}}</span></label>";
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "  <div class='form-group'>";
                        vm.projectCalculator += "   <button class='grop-btn  grop-btn_submit' data-toggle='modal'";
                        vm.projectCalculator += `data-target='#studentListModal' ng-click='getStudentsByCount(selectedCount)' ng-show='(selectedDescend == undefined || selectedDescend === "") ? false : true && selectedCount > 0 ? true : false'>{{'SELECT STUDENTS' | translate}}</button>`;
                        vm.projectCalculator += "  </div>";

                        //vm.projectCalculator += "<div ng-show='user.roles.length > 0 ? true : false'>";
                        vm.projectCalculator += "<div ng-show='(user.roles.length > 0 && selectedCount == user.roles.length) ? true : false'>";
                        vm.projectCalculator += "   <div class='row'>";
                        vm.projectCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        vm.projectCalculator += "           <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                        vm.projectCalculator += "       </div>";
                        vm.projectCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        vm.projectCalculator += "           <button class='grop-btn-donate  grop-btn_submit' data-ng-click='donate();'>{{ 'DONATE NOW' | translate }}</button>";
                        vm.projectCalculator += "       </div>";
                        vm.projectCalculator += "   </div>";
                        vm.projectCalculator += "</div>";
                    } else {
                        vm.projectCalculator += "   <div class='row'>";
                        vm.projectCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        vm.projectCalculator += "           <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                        vm.projectCalculator += "       </div>";
                        vm.projectCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        vm.projectCalculator += "           <button class='grop-btn-donate  grop-btn_submit' data-ng-click='donate();'>{{ 'DONATE NOW' | translate }}</button>";
                        vm.projectCalculator += "       </div>";
                        vm.projectCalculator += "   </div>";
                    }
                }
                //NOT FOR FIXED AMOUNT
                else {
                    if (donationProcess.isRecurring) {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'DURATION' | translate }}</label>";
                        vm.projectCalculator += "<select class='form-control' ng-model='selectedDonationDuration'  ng-options='x.donationDurationName for x in donationDurations'>";
                        vm.projectCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                        // vm.projectCalculator += "<select  class='form-control' ng-change='durationForRecurring()' ng-model='selectedRecurring'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>"
                        vm.projectCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                        vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "<div class='form-group' ng-show='selectedRecurring'>";
                        // vm.projectCalculator += "<label for=''>{{ 'PAYMENT DATE' | translate }}</label>";
                        // vm.projectCalculator += "<div class='input-group date'>";
                        // vm.projectCalculator += "<div class='input-group-addon'>";
                        // vm.projectCalculator += "<i class='fa fa-calendar'></i>";
                        // vm.projectCalculator += "</div>";
                        // vm.projectCalculator += "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='paymentDate'>";
                        // vm.projectCalculator += "</div>";
                        // vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "<script>";
                        // vm.projectCalculator += "jQuery('#txtFromDate').datepicker({";
                        // vm.projectCalculator += " autoclose: true";
                        // vm.projectCalculator += "});";
                        // vm.projectCalculator += "</script>";

                        if (donationProcess.isSyed) {
                            vm.projectCalculator += "<div class='form-group'>";
                            vm.projectCalculator += " <label >{{ 'DESCEND' | translate }}</label>";
                            vm.projectCalculator += "<select class='form-control' ng-model='selectedDescend' ng-change='clearOrphans()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='true'>{{'SYED' | translate}}</option><option ng-value='false'>{{'NONSYED' | translate}}</option>";
                            vm.projectCalculator += "</select>";
                            vm.projectCalculator += "</div>";
                        }
                    }

                    vm.isCount = donationProcess.isCount;
                    if (donationProcess.isCount) {

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'COUNT' | translate }}</label>";
                        vm.projectCalculator += "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
                        vm.projectCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        let min = Math.round(donationProcess.countMin);
                        let max = Math.round(donationProcess.countMax);
                        var interval = Math.round(donationProcess.interval);
                        for (let i = min; i <= max; i += interval) {
                            vm.projectCalculator += "      <option ng-value='" + i + "'>" + i + "</option>";
                        }
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <label id='fixedAmountValue' ></label>";
                        vm.projectCalculator += "<input type='text' ng-keypress='isNumberKey($event)' min='1' id='amountTextBox' min='1' ng-keyup='countChange()' ng-change='countChange()' data-ng-model='amountValueForNonFixed'  class='form-control' ng-disabled='vm.isAmount' />"
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}<span ng-show='selectedRecurring' style='color:green;font-size:10px;'>(Per Month)</span></label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator +="</div>";
                        vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1'  data-ng-disabled='orphanVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";
                    } else {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator +="</div>";
                        vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1' data-ng-disabled='orphanVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";
                    }
                    if (donationProcess.isRecurring) {
                        vm.projectCalculator += "  <div class='form-group'>";
                        vm.projectCalculator += "   <button class='grop-btn  grop-btn_submit' data-toggle='modal'";
                        vm.projectCalculator += " data-target='#studentListModal' ng-click='getStudentsByCount(selectedCount)' ng-show='selectedDescend == undefined ? false : true && selectedCount > 0 ? true : false'>{{'SELECT STUDENTS' | translate}}</button>";
                        vm.projectCalculator += "  </div>";

                        vm.projectCalculator += "<div ng-show='user.roles.length > 0 ? true : false'>";
                        vm.projectCalculator += "   <div class='row'>";
                        vm.projectCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        vm.projectCalculator += "           <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                        vm.projectCalculator += "       </div>";
                        vm.projectCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        vm.projectCalculator += "           <button class='grop-btn-donate  grop-btn_submit' data-ng-click='donate();'>{{ 'DONATE NOW' | translate }}</button>";
                        vm.projectCalculator += "       </div>";
                        vm.projectCalculator += "   </div>";
                        vm.projectCalculator += "</div>";
                    } else {
                        vm.projectCalculator += "<div class='row'>";
                        vm.projectCalculator += "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        vm.projectCalculator += "       <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                        vm.projectCalculator += "   </div>";
                        vm.projectCalculator += "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                        vm.projectCalculator += "       <button class='grop-btn-donate  grop-btn_submit' data-ng-click='donate();'>{{ 'DONATE NOW' | translate }}</button>";
                        vm.projectCalculator += "   </div>";
                        vm.projectCalculator += "</div>";
                    }

                }
            }
            let calculator = $compile(vm.projectCalculator)($scope);
            angular.element(document.getElementById("orphanCalculator")).html("").append(calculator);
            $scope.selectedRecurring = false;
            $scope.selectedCount = undefined;
            $scope.amountValueForNonFixed = undefined;
            $scope.selectedDescend = undefined;
            $scope.selectedGender = undefined;
        }


        $scope.addCartItem = function () {
            var obj = new Object();
            if (vm.clickedCart) return;
            vm.clickedCart = false;
            if ($scope.selectedGc) {
                obj.program = $scope.selectedGc;
                if (!validation($scope.selectedGc)) {
                    return vm.clickedCart = false;;
                }
            }
            else if ($scope.selectedDz) {
                obj.program = $scope.selectedDz;
                if (!validation($scope.selectedDz)) {
                    return vm.clickedCart = false;;
                }

            }

            if (obj.program.donationProcess[0].isCount) {
                obj.count = $scope.selectedCount;
            }
            if (obj.program.donationProcess[0].isMinimumAmount) {
                let minimiumAmountForDonation = obj.program.donationProcess[0].minimumAmount;
                if ($scope.totalAmount < minimiumAmountForDonation) {
                    let minAmountmsg;
                    let currency = JSON.parse(sessionStorage.getItem('currency')).symbol;
                    if (localStorage.getItem('lang') == 'ARB') {
                        minAmountmsg = currency.concat(minimiumAmountForDonation.toString()) + "الحد الأدنى للمساهمة في هذه الفئة هو";
                    } else if (localStorage.getItem('lang') == 'FRN') {
                        minAmountmsg = "Le montant minimum pour cette catégorie est " + currency.concat(minimiumAmountForDonation.toString());
                    } else {
                        minAmountmsg = "The minimum donation amount for this category is " + currency.concat(minimiumAmountForDonation.toString());
                    }
                    swal({
                        title: minAmountmsg,
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    });
                    return vm.clickedCart = false;

                }
            }
            if (obj.program.donationProcess[0].isDuration) {
                let durationEndDate = obj.program.donationProcess[0].durationEndDate;
                var newEndDate = new Date(durationEndDate);
                var todayDate = new Date();
                var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
                todayDate.setHours(0, 0, 0, 0);
                if (todayDate < startDate || newEndDate < todayDate) {
                    let validateMsg;
                    if (localStorage.getItem('lang') == 'ARB') {
                        validateMsg = ".هذه الفئة غير متوفرة حاليا";
                    } else if (localStorage.getItem('lang') == 'FRN') {
                        validateMsg = "Cette catégorie est indisponible pour le moment.";
                    } else {
                        validateMsg = "This category is currently unavailable.";
                    }
                    swal({
                        title: validateMsg,
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    });
                    return vm.clickedCart = false;
                }
            }
            obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
            obj.programSubCategory = vm.selectedCategory;

            obj.donationDuration = $scope.selectedDonationDuration;



            obj.isRecurring = $scope.selectedRecurring;
            if ($scope.selectedRecurring) {
                obj.donationDuration = $scope.selectedDonationDuration;
                var startDate = new Date();
                var endDate = new Date();
                endDate.setDate(endDate.getDate() + 365);
                obj.startDate = "" + (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear() + "";
                obj.endDate = "" + (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear() + "";
                ;
                obj.paymentDate = $scope.paymentDate;
                obj.paymentType = "Recurring";
            }
            else {
                obj.paymentType = "One Time";
            }

            obj.isRecurringProgram = $scope.selectedGc && $scope.selectedGc.isRecurringProgram;
            obj.isAutoRenew = $scope.isAutoRenew;
            obj.paymentPlan = $scope.selectedPaymentPlan;
            obj.totalSubscriptionAmount = $scope.totalSubscriptionAmount


            obj.donationDuration = $scope.selectedDonationDuration;
            if ($scope.selectedRecurring) {

                if (localStorage.getItem('lang') == 'ARB') {
                    obj.paymentType = "متكرر";
                } else if (localStorage.getItem('lang') == 'FRN') {
                    obj.paymentType = "Périodique";
                } else {
                    obj.paymentType = "Recurring";
                }
            } else {

                if (localStorage.getItem('lang') == 'ARB') {
                    obj.paymentType = "مرة واحدة";
                } else if (localStorage.getItem('lang') == 'FRN') {
                    obj.paymentType = "Une fois";
                } else {
                    obj.paymentType = "One Time";
                }
            }

            if ($scope.user.roles.length > 0 && $scope.orphanType == 'gc') {
                obj.students = [];
                obj.orphans = $scope.user.roles;
            }
            else if ($scope.user.roles.length > 0 && $scope.orphanType == 'dz') {
                obj.orphans = [];
                obj.students = $scope.user.roles;
            }

            //$scope.totalAmount = '';

            obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            if (obj.program && obj.program.slug === "home-renovation") {
                const index = $scope.prices.findIndex(i => i == $scope.amountValueForNonFixed);
                obj.currency.hajjAmount = $scope.originalPrices[index];
            }



            let addToCart = true;
            cartService.getCartDetail().then(function (result) {
                if (obj.isRecurringProgram) {
                    if (result && result.data.items.length > 0) {
                        const found = result.data.items.some(item => item.isRecurringProgram);
                        if (found) {
                            addToCart = false;
                            vm.clickedCart = false;

                              let eventObj = utilService.getEventObjMultipleSubscription(config.EventConstants.EventTypes.AddOrphan);
                               eventLogsService.addEventLog(eventObj);

                            swal({
                                title: $translate.instant('MULTIPLE_RECURRING_ITEM_ALERT'),
                                position: 'center-center',
                                type: 'error',
                                allowOutsideClick: false,
                                html: utilService.createProgramListForErrorMessage(obj, result),
                                confirmButtonText: $translate.instant("Yes")
                            });
                        }
                    }
                }
                if (addToCart) {
                    cartService.addCartItem(obj).then(function (res) {
                        vm.clearCalculator();
                        $rootScope.$broadcast('getCartCounter');
                        var note = new Noty({
                            text: $translate.instant('Items added successfully')
                        })
                        note.setTimeout(2600);
                        note.show();
                        vm.clickedCart = false;
                    });

                    if (obj.orphans) {
                        // update blocking date in in orphan table 
                        orphanService.updateSelectedOrphan(obj.orphans).then(function (resp) {
                        });
                    }
                }

            });







        }

        projectService.getDonationDuration().then(function (res) {
            $scope.donationDurationsYaerly = $filter('filter')(res.data, { 'noOfMonths': 12 })[0]
        });

        function showError() {
            let durationMsg;
            if (localStorage.getItem('lang') == 'ARB') {
                durationMsg = "يرجى ملء الحقول الفارغة";
            } else if (localStorage.getItem('lang') == 'FRN') {
                durationMsg = "Veuillez remplir les champs manquants";
            } else {
                durationMsg = "Please fill the missing fields";
            }
            swal({
                title: durationMsg,
                position: 'center-center',
                type: 'error',
                allowOutsideClick: false,
            }).then(function () {
                //window.location = "#/projects";
            });
            return false;
        }
        function validation(program) {

            if (program) {

                //In case of Dar ul zehra it will check duration anyhow.
                if ($scope.orphanType == 'dz' && $scope.selectedDz.slug !== 'general-fund-daz') {
                    if (!$scope.selectedDonationDuration) {
                        return showError();
                    }
                    if (!$scope.totalAmount) return showError();
                }

                if (program.donationProcess[0].isRecurring) {
                    if ($scope.selectedRecurring !== false && !$scope.selectedRecurring) {
                        return showError();
                    }
                }

                if (program.donationProcess[0].donationDuration.length > 0) {
                    if (!vm.selectedDonationDuration) {
                        return showError();
                    }
                }

                if (program.programSubCategory.length > 0) {
                    if (vm.selectedCategory != null) {
                        if (!vm.selectedCategory.isFixedAmount) {
                            if (!$scope.amountValueForNonFixed) {
                                return showError();
                            }
                        }
                    }
                }
                else {
                    if (!program.donationProcess[0].isAmount) {
                        if (!$scope.totalAmount && !$scope.amountValueForNonFixed) {
                            return showError();
                        }
                    }
                }
                if (program.donationProcess[0].isCount) {
                    if (!$scope.selectedCount) {
                        return showError();
                    }
                }
                return true;
            }
        }


        function clearOrphanCalculator() {
            clearCalculator();
        }

        function clearCalculator() {

            $scope.totalSubscriptionAmount = undefined;
            $scope.selectedGc = undefined;
            $scope.selectedDz = undefined;
            $scope.selectedDonationDuration = undefined;
            $scope.user.roles = [];
            vm.projectCalculator = "";
            $scope.isAutoRenew = false;
            $scope.selectedCount = undefined;

            $scope.sponsorshipPlanText = undefined;

            $scope.selectedPaymentPlan = undefined;
            $scope.selectedDescend = undefined;
            $scope.selectedGender = undefined;
            $scope.amountValue = undefined;
            $scope.totalAmount = undefined;

            $scope.autoRenewMessage = undefined;
            $scope.paymentChargeMessage = undefined;
            $scope.paymentPlans = [];





            // let calculator = $compile(vm.projectCalculator)($scope);
            // angular.element(document.getElementById("orphanCalculator")).html("").append(calculator);
        }

        $scope.donate = function () {
            var obj = new Object();
            if (vm.clickedDonate) return;
            vm.clickedDonate = true;
            if ($scope.selectedGc) {
                obj.program = $scope.selectedGc;
                if (!validation($scope.selectedGc)) {
                    vm.clickedDonate = false;
                    return;
                }
            }
            else if ($scope.selectedDz) {
                obj.program = $scope.selectedDz;
                if (!validation($scope.selectedDz)) {
                    vm.clickedDonate = false;
                    return;
                }
            }
            if (obj.program.donationProcess[0].isCount) {
                obj.count = $scope.selectedCount;
            }

            if (obj.program.donationProcess[0].isMinimumAmount) {
                let minimiumAmountForDonation = obj.program.donationProcess[0].minimumAmount;
                if ($scope.totalAmount < minimiumAmountForDonation) {
                    let minAmountmsg;
                    let currency = JSON.parse(sessionStorage.getItem('currency')).symbol;
                    if (localStorage.getItem('lang') == 'ARB') {
                        minAmountmsg = currency.concat(minimiumAmountForDonation.toString()) + "الحد الأدنى للمساهمة في هذه الفئة هو";
                    } else if (localStorage.getItem('lang') == 'FRN') {
                        minAmountmsg = "Le montant minimum pour cette catégorie est " + currency.concat(minimiumAmountForDonation.toString());
                    } else {
                        minAmountmsg = "The minimum donation amount for this category is " + currency.concat(minimiumAmountForDonation.toString());
                    }
                    swal({
                        title: minAmountmsg,
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    });
                    return vm.clickedDonate = false;

                }
            }
            if (obj.program.donationProcess[0].isDuration) {
                let durationEndDate = obj.program.donationProcess[0].durationEndDate;
                var newEndDate = new Date(durationEndDate);
                var todayDate = new Date();
                var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
                todayDate.setHours(0, 0, 0, 0);
                if (todayDate < startDate || newEndDate < todayDate) {
                    let validateMsg;
                    if (localStorage.getItem('lang') == 'ARB') {
                        validateMsg = ".هذه الفئة غير متوفرة حاليا";
                    } else if (localStorage.getItem('lang') == 'FRN') {
                        validateMsg = "Cette catégorie est indisponible pour le moment.";
                    } else {
                        validateMsg = "This category is currently unavailable.";
                    }
                    swal({
                        title: validateMsg,
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    });
                    return vm.clickedDonate = false;
                }
            }
            obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
            obj.programSubCategory = vm.selectedCategory;
            obj.isRecurring = $scope.selectedRecurring;
            if ($scope.selectedRecurring) {
                obj.donationDuration = $scope.selectedDonationDuration;
                var startDate = new Date();
                var endDate = new Date();

                if ($scope.selectedGc == undefined) {
                    endDate.setMonth(endDate.getMonth() + obj.donationDuration.noOfMonths)
                }
                else {
                    endDate.setDate(endDate.getDate() + 365);
                }
                obj.startDate = "" + ((startDate.getMonth() + 1) < 10 ? '0' : '') + (startDate.getMonth() + 1) +
                    "/" + (startDate.getDate() < 10 ? '0' : '') + startDate.getDate() +
                    "/" + startDate.getFullYear() + "";

                obj.endDate = "" + ((endDate.getMonth() + 1) < 10 ? '0' : '') + (endDate.getMonth() + 1) +
                    "/" + (endDate.getDate() < 10 ? '0' : '') + endDate.getDate() +
                    "/" + endDate.getFullYear() + "";

                obj.paymentDate = $scope.paymentDate;
            }

            if ($scope.selectedRecurring) {
                obj.donationDuration = $scope.selectedDonationDuration;

                if (localStorage.getItem('lang') == 'ARB') {
                    obj.paymentType = "متكرر";
                } else if (localStorage.getItem('lang') == 'FRN') {
                    obj.paymentType = "Périodique";
                } else {
                    obj.paymentType = "Recurring";
                }
            } else {

                if (localStorage.getItem('lang') == 'ARB') {
                    obj.paymentType = "مرة واحدة";
                } else if (localStorage.getItem('lang') == 'FRN') {
                    obj.paymentType = "Une fois";
                } else {
                    obj.paymentType = "One Time";
                }
            }


            obj.isRecurringProgram = $scope.selectedGc && $scope.selectedGc.isRecurringProgram;
            obj.isAutoRenew = $scope.isAutoRenew;
            obj.paymentPlan = $scope.selectedPaymentPlan;
            obj.totalSubscriptionAmount = $scope.totalSubscriptionAmount

            if ($scope.user.roles.length > 0 && $scope.orphanType == 'gc') {
                obj.students = [];
                obj.orphans = $scope.user.roles;
            }
            else if ($scope.user.roles.length > 0 && $scope.orphanType == 'dz') {
                obj.orphans = [];
                obj.students = $scope.user.roles;
            }




            // obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            // localStorage.setItem("cart", null);
            // localStorage.setItem("cart", JSON.stringify(obj));
            // if ($rootScope.isLogin) {
            //     $window.location.href = "/#/checkout";
            // } else {
            //     const myGC = $scope.selectedGc;
            //     jQuery('#globalLoginModal').modal('show');
            //     $scope.selectedGc = myGC;
            // }
            obj.currency = JSON.parse(sessionStorage.getItem("currency"));
            if (obj.program && obj.program.slug === "home-renovation") {
                obj.currency.hajjAmount = vm.amount;
            }



            let addToCart = true;
            cartService.getCartDetail().then(function (result) {

                if (obj.isRecurringProgram) {
                    if (result && result.data.items.length > 0) {
                        const found = result.data.items.some(item => item.isRecurringProgram);
                        if (found) {
                            addToCart = false;
                            vm.clickedDonate = false;
                            let eventObj = utilService.getEventObjMultipleSubscription(config.EventConstants.EventTypes.AddOrphan);
                               eventLogsService.addEventLog(eventObj);
                            swal({
                                title: $translate.instant('MULTIPLE_RECURRING_ITEM_ALERT'),
                                position: 'center-center',
                                type: 'error',
                                allowOutsideClick: false,
                                html: utilService.createProgramListForErrorMessage(obj, result),
                                confirmButtonText: $translate.instant("Yes")
                            });
                        }
                    }
                }

                if (addToCart) {
                    cartService.addCartItem(obj).then(function () {
                        //   if ($rootScope.isLogin) {
                        vm.clearCalculator();
                        $rootScope.$broadcast("getCartCounter");
                        $state.go("cart");
                        vm.clickedDonate = false;
                        //   } else {
                        //     jQuery("#globalLoginModal").modal("show");
                        //   }
                    });


                    if (obj.orphans) {
                        // update blocking date in in orphan table 
                        orphanService.updateSelectedOrphan(obj.orphans).then(function (resp) {
                        });
                    }



                }

            });

            // cartService.addCartItem(obj).then(function (res) {
            //     $rootScope.$broadcast('getCartCounter');
            //     if ($rootScope.isLogin) {
            //         $window.location.href = "/#/checkout";
            //     } else {
            //         jQuery('#globalLoginModal').modal('show');
            //     }
            // });
        }
        $scope.clearOrphans = function () {
            //$scope.user.roles = [];
            vm.orphans = orphanService.filterOrphanPopupItems($scope.selectedGender, $scope.selectedDescend, vm.orphanCompleteList);
        }

        $scope.durationForOneTimeAndRecurring = function () {

            var obj = new Object();
            obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            if ($scope.selectedDonationDuration.donationDurationName == $translate.instant("YEARLY")) {
                $scope.DurationName = 'Yearly';
                if (obj.currency.title == "USD") {
                    $scope.amountValue = vm.amount;
                } else {
                    $scope.amountValue = currencyService.currencyConversionFormula(obj.currency.rateExchange * vm.amount);
                }
            }
            if ($scope.selectedDonationDuration.donationDurationName == $translate.instant("HALF YEARLY")) {
                $scope.DurationName = "Half Yearly"
                if (obj.currency.title == "USD") {
                    $scope.amountValue = Math.round($scope.amountValue / 2).toFixed(2);
                } else {
                    $scope.amountValue = Math.round(currencyService.currencyConversionFormula(obj.currency.rateExchange * vm.amount) / 2).toFixed(2);
                }
            }
            $scope.amountValue = pageVM.amount;

            $scope.countChange();
        }

    }

})()