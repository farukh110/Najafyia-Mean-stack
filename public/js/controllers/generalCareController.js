(function () {

    "use strict";
    angular.module('mainApp').controller('generalCareController', generalCareController);

    function generalCareController($scope, $rootScope, $window, $translate, MetaTagsService, $filter, $location, $compile, projectService, generalCareService, utilService, programTypeService, $state, donationProcessService, multipartForm, orphanService, donationService, cartService, currencyService, config, eventLogsService) {

        var vm = this;
        var generalCareVM = this;

        vm.addGeneralCareCategory = addGeneralCareCategory;
        vm.getGeneralCares = getGeneralCares;
        vm.printContent = printContent;
        vm.getActiveGeneralCares = getActiveGeneralCares;
        vm.deleteGeneralCare = deleteGeneralCare;
        vm.updateGeneralCare = updateGeneralCare;
        vm.getGeneralCareForUpdate = getGeneralCareForUpdate;
        vm.getGeneralCareDetail = getGeneralCareDetail;
        vm.previewImage = previewImage;
        vm.donationProcess = {};
        vm.generalCareCategoryName = "";
        vm.categoryDescription = "";
        vm.addGeneralCare = addGeneralCare;
        vm.saveBasicContent = saveBasicContent;
        vm.generalCareCategories = [];
        vm.getCategories = getCategories;


        vm.clearOrphanCalculator = clearOrphanCalculator;
        vm.selectedCategory = [];
        vm.imageUrl = "";
        vm.file = {};
        vm.programType = {};
        vm.subCategories = [];
        vm.count = [
            { min: 0 },
            { max: 0 },
            { interval: 0 }
        ];
        $scope.selectedRecurring = false;
        $scope.paymentMethod = $translate.instant('ONETIME');



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

        $scope.orphanType = "gc"
        $scope.amountIsAmount = true;
        $scope.isAutoRenew = false;

        vm.orphanIds = [];

        vm.language = localStorage.getItem('lang');

        vm.orphanRenewal = false;
        vm.oprhanGift = false;

        $scope.totalSubscriptionAmount = undefined;

        vm.validCounter = true;
        vm.getProgramType = getProgramType;
        vm.addSubCategoryToList = addSubCategoryToList;
        vm.addOrRemoveSubcategory = addOrRemoveSubcategory;
        vm.orphans = [];
        vm.orphanCompleteList = [];
        vm.clearCalculator = clearCalculator;
        $scope.isDetail = false;
        vm.description = {
            para1: '',
            para2: ''
        };
        $scope.age = function (birthday) {
            if (birthday) {
                let bday = new Date(birthday);
                var ageDifMs = Date.now() - bday.getTime();
                var ageDate = new Date(ageDifMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        }
        // for arabic header in print view
        let lang = localStorage.getItem('lang');
        if (lang == 'ARB') {
            vm.printArb = true
        } else if (lang == 'FRN' || lang == 'ENG') {
            vm.printArb = false
        }

        let myobj = JSON.parse(sessionStorage.getItem('currency'));
        $scope.prices = [1000, 1500, 2000];
        $scope.originalPrices = [1000, 1500, 2000];

        $scope.isNumberKey = function ($event) {
            let amount = String.fromCharCode(event.which || event.keyCode)
            let pattern = /^[0-9]\d*(\.\d+)?$/;
            if (!pattern.test(amount)) {
                event.preventDefault()
            }
        }

        $scope.sendMail = function () {
            const mail = utilService.sendEmail(vm.generalCareDetail.programName, vm.generalCareDetail.programDescription, `generalcaredetails/${vm.generalCareDetail.slug}`, vm.generalCareDetail.imageLink)
            $window.open(mail);
        }

        //FAST DONATION END
        for (let i = 0; i < $scope.prices.length; i++) {
            if (myobj.title != 'USD') {
                $scope.prices[i] = currencyService.currencyConversionFormula(myobj.rateExchange * $scope.prices[i]);
            } else {
                break;
            }
        }
        $scope.selectedCurrencySymbol = JSON.parse(sessionStorage.getItem('currency')).symbol;

        function addOrRemoveSubcategory(x) {
            var exist = _.find(vm.selectedCategory, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedCategory, exist);
            } else {
                if (vm.selectedCategory == null) {
                    vm.selectedCategory = [];
                }
                vm.selectedCategory.push(x);
            }
        }

        function addSubCategoryToList() {
            if (vm.subCategories.indexOf(vm.subCategoryValue) != -1) {
            } else {
                vm.subCategories.push(vm.subCategoryValue);
                vm.subCategoryValue = "";
            }
        }

        function previewImage() {
            var image = vm.file;
        }

        function saveBasicContent() {
            let gcTxt = document.getElementById("gcTxt").value;
            if (gcTxt == "") {
                document.getElementById("showError").innerText = $translate.instant("PLEASE FILL THE MISSING FIELD");
                document.getElementById("gcTxt").focus();
            }
            else {
                generalCareService.addGeneralCareContent({ content: vm.content, _id: vm.programType._id }).then(function (res) {
                    vm.GeneralCareCategories = res.data;
                    return res;
                }, location.reload());
            }
        }

        //load type GeneralCare in program type
        function getProgramType() {
            let generalCare = '';
            if (localStorage.getItem('lang') == 'ARB') {
                generalCare = "الرعاية العامة";
            } else if (localStorage.getItem('lang') == 'FRN') {
                generalCare = 'Premières nécessités';
            } else {
                generalCare = "General Care";
            }
            programTypeService.getProgramType(generalCare).then(function (res) {
                vm.programType = res.data[0];
                generalCareService.getCategoriesByProgramType(vm.programType._id).then(function (res) {
                    vm.generalCareCategories = res.data;
                    return res;
                });
                return res.data[0];
            }
            );
        }

        //Create GeneralCare category
        function addGeneralCareCategory() {
            generalCareService.addGeneralCareCategory(getCategoryData()).then(function (res) {
                swal({
                    position: 'center-center',
                    type: 'success',
                    title: $translate.instant(res.data),
                    showConfirmButton: false,
                    timer: 2000
                });
                return res;
            });
        }

        // create category object
        function getCategoryData() {
            var obj = new Object();
            obj.categoryName = vm.GeneralCareCategoryName;
            obj.categoryDescription = vm.categoryDescription;
            return obj;
        }

        // get categories
        function getCategories() {
            generalCareService.getCategories().then(function (res) {
                vm.GeneralCareCategories = res.data;
                return res;
            });
        }

        // add new GeneralCare
        function addGeneralCare(isValid) {
            if (vm.isCount) {
                vm.validCounter = utilService.countValidator(vm.count.min, vm.count.max, vm.count.interval)
                if (!vm.validCounter) {
                    swal({
                        title: Math.round(vm.count.min) == 0 ? 'Min Value must be greater than 0'
                            : Math.round(vm.count.min) > Math.round(vm.count.max) ? 'Min Value must be less than Max Value'
                                : Math.round(vm.count.interval) > Math.round(vm.count.max) / 2
                                    ? 'Interval value must not be greater than half of Max value'
                                    : 'Please Insert Correct Values for Min, Max and Interval',
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    })
                }
                //check if min and max are equal
                let minInt = Math.round(vm.count.min);
                let maxInt = Math.round(vm.count.max);
                if (minInt == maxInt) {
                    vm.validCounter = false;
                    swal({
                        title: 'Min and Max values cannot be equal',
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    })
                }
            } else {
                vm.validCounter = true;
            }
            if (isValid && vm.validCounter) {
                //add Donation Process
                multipartForm.post('/upload', vm.file).then(function (res) {
                    var imageLink = res.data.name;
                    donationProcessService.addDonationProcess(getDonationProcessObject()).then(function (res) {
                        vm.donationProcess = res.data;
                        let GeneralCareObj = getGeneralCareData();
                        GeneralCareObj.imageLink = imageLink;
                        GeneralCareObj.donationProcess = vm.donationProcess;
                        GeneralCareObj.programType = vm.programType;
                        GeneralCareObj.subCategories = vm.selectedCategory;
                        GeneralCareObj.userLang = localStorage.getItem('lang');
                        generalCareService.addGeneralCare(GeneralCareObj).then(function (res) {
                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/generalCareList";
                            });
                            return res;
                        });
                    });
                    //Image block end
                }).catch((err) => {
                    swal(
                        'Error',
                        err.data,
                        'error'
                    )
                });
            }
        }

        //get donation process object
        function getDonationProcessObject() {
            var obj = new Object();
            obj.isRecurring = vm.isRecurring;
            obj.isDuration = vm.isDuration;
            obj.isYearAround = vm.isYearAround;
            obj.isCount = vm.isCount;
            obj.isSyed = vm.isSyed;
            obj.isAmount = vm.isAmount;
            obj.isMinimumAmount = vm.isMinimumAmount;
            if (vm.isDuration) {
                obj.durationStartDate = vm.StartDate;
                obj.durationEndDate = vm.EndDate;
            }
            if (vm.isCount) {
                obj.countMin = vm.count.min;
                obj.countMax = vm.count.max;
                obj.interval = vm.count.interval;
            }
            if (vm.isAmount) {
                obj.amount = Math.round(vm.amount).toFixed(2);
            }
            if (vm.isMinimumAmount) {
                obj.minimumAmount = Math.round(vm.minimumAmount).toFixed(2);
            }
            return obj;
        }

        function printContent(divName) {
            window.print();
        }
        //creat GeneralCare object
        function getGeneralCareData() {
            var obj = new Object();
            obj.programName = vm.generalCareName;
            obj.programPriority = vm.programPriority;
            obj.slug = vm.generalCareSlug;
            obj.programDescription = jQuery('#addgeneralcare .froala-view').html();
            return obj;
        }

        //update GeneralCare
        function updateGeneralCare(isValid) {
            if (vm.isCount) {
                vm.validCounter = utilService.countValidator(vm.count.min, vm.count.max, vm.count.interval)
                if (!vm.validCounter) {
                    swal({
                        title: Math.round(vm.count.min) == 0 ? 'Min Value must be greater than 0'
                            : Math.round(vm.count.min) > Math.round(vm.count.max) ? 'Min Value must be less than Max Value'
                                : Math.round(vm.count.interval) > Math.round(vm.count.max) / 2
                                    ? 'Interval value must not be greater than half of Max value'
                                    : 'Please Insert Correct Values for Min, Max and Interval',
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    })
                }
                //check if min and max are equal
                let minInt = Math.round(vm.count.min);
                let maxInt = Math.round(vm.count.max);
                if (minInt == maxInt) {
                    vm.validCounter = false;
                    swal({
                        title: 'Min and Max values cannot be equal',
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                    })
                } else {
                    vm.validCounter = true;
                }
            }
            if (isValid && vm.validCounter) {
                if (vm.file.name == undefined) {
                    let GeneralCareObj = getUpdatedGeneralCareData();
                    GeneralCareObj.imageLink = vm.imageLink;
                    generalCareService.updateGeneralCare(GeneralCareObj).then(function (res) {
                        swal({
                            title: $translate.instant(res.data),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/generalCareList";
                        });
                        return res;
                    });
                } else {
                    multipartForm.post('/upload', vm.file).then(function (res) {
                        let GeneralCareObj = getUpdatedGeneralCareData();
                        GeneralCareObj.imageLink = res.data.name;
                        generalCareService.updateGeneralCare(GeneralCareObj).then(function (res) {

                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/generalCareList";
                            });
                            return res;
                        });
                    });
                }
            }
        }

        //get data for GeneralCare update
        function getGeneralCareForUpdate() {
            var id = $location.search().generalCareId;
            generalCareService.getGeneralCareById(id).then(function (res) {
                let data = res.data[0];
                vm.programTypeId = data.programType[0];
                generalCareService.getCategoriesByProgramType(vm.programTypeId).then(function (res) {
                    vm.generalCareCategories = res.data;
                    vm.selectedCategory = data.programSubCategory;
                    if (vm.selectedCategory.length > 0) {
                        vm.hasCategories = true;
                    }
                    vm.generalCareCategories.forEach(function (element) {
                        if (_.find(vm.selectedCategory, element)) {
                            element.selected = true;
                        }
                        else {
                            element.selected = false;
                        }
                    }, this);
                    return res;
                });
                vm.generalCareId = data._id;
                vm.generalCareName = data.programName;
                vm.programPriority = data.programPriority;
                vm.generalCareDescription = data.programDescription;
                vm.generalCareSlug = data.slug;
                vm.imageLink = data.imageLink;
                let donationProcess = data.donationProcess[0];
                vm.isRecurring = donationProcess.isRecurring;
                vm.isYearAround = donationProcess.isYearAround;
                vm.isSyed = donationProcess.isSyed;
                vm.isDuration = donationProcess.isDuration;
                vm.isAmount = donationProcess.isAmount;
                if (vm.isAmount) {
                    vm.amount = Math.round(donationProcess.amount).toFixed(2);
                }
                if (vm.isDuration) {
                    vm.StartDate = donationProcess.durationStartDate;
                    var durationSDate = jQuery('#txtFromDate');
                    durationSDate.datepicker();
                    durationSDate.datepicker('setDate', vm.StartDate);
                    vm.EndDate = donationProcess.durationEndDate;
                    var durationEDate = jQuery('#txtToDate');
                    durationEDate.datepicker();
                    durationEDate.datepicker('setDate', vm.EndDate);
                }
                vm.isCount = donationProcess.isCount;
                if (vm.isCount) {
                    vm.count.min = donationProcess.countMin;
                    vm.count.max = donationProcess.countMax;
                    vm.count.interval = donationProcess.interval;
                }
                vm.isMinimumAmount = donationProcess.isMinimumAmount;
                if (vm.isMinimumAmount) {
                    vm.minimumAmount = Math.round(donationProcess.minimumAmount).toFixed(2);
                }
                vm.projectDescription = data.programDescription;
                jQuery("#projectDescription .froala-view").html(vm.projectDescription);
                return res;
            });
        }

        //create update GeneralCare object
        function getUpdatedGeneralCareData() {
            var obj = new Object();
            obj.id = vm.generalCareId;
            obj.programName = vm.generalCareName;
            obj.programPriority = vm.programPriority;
            obj.programDescription = vm.generalCareDescription;
            obj.slug = vm.generalCareSlug;
            obj.programDescription = jQuery('#projectDescription .froala-view').html();

            var donationProcess = new Object();
            donationProcess.isRecurring = vm.isRecurring;
            donationProcess.isYearAround = vm.isYearAround;
            donationProcess.isSyed = vm.isSyed;
            donationProcess.isAmount = vm.isAmount;
            donationProcess.isMinimumAmount = vm.isMinimumAmount;
            if (donationProcess.isAmount) {
                obj.currency = JSON.parse(sessionStorage.getItem('currency'));
                if (obj.currency.title == "USD") {
                    donationProcess.amount = Math.round(vm.amount).toFixed(2);
                } else {
                    donationProcess.amount = Math.round(obj.currency.rateExchange * vm.amount).toFixed(2);
                }
            }
            donationProcess.isDuration = vm.isDuration;
            if (donationProcess.isDuration) {
                donationProcess.durationStartDate = vm.StartDate;
                donationProcess.durationEndDate = vm.EndDate;
            }
            donationProcess.isCount = vm.isCount;
            if (donationProcess.isCount) {
                donationProcess.countMin = vm.count.min;
                donationProcess.countMax = vm.count.max;
                donationProcess.interval = vm.count.interval;
            }
            if (donationProcess.isMinimumAmount) {
                donationProcess.minimumAmount = Math.round(vm.minimumAmount).toFixed(2);
            }
            obj.donationProcess = donationProcess;
            obj.programSubCategory = vm.selectedCategory;
            return obj;
        }

        // get all GeneralCares
        function getGeneralCares() {
            var generalCare = '';
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
                vm.content = vm.programType.content;
                generalCareService.getGeneralCare(programTypeId).then(function (res) {
                    vm.generalCares = res.data;
                    return res;
                });
            }
            );
        }

        function getActiveGeneralCares() {
            var generalCare = '';
            if (localStorage.getItem('lang') == 'ARB') {
                generalCare = "الرعاية العامة";
            } else if (localStorage.getItem('lang') == 'FRN') {
                generalCare = 'Premières nécessités';
            } else {
                generalCare = "General Care";
            }
            programTypeService.getProgramType(generalCare).then(function (res) {
                vm.programType = res.data[0];
                const metaData = {
                    title: 'Basic Care',
                    description: vm.programType.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.programType.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/generalcares/${vm.programType._id}`,
                };
                MetaTagsService.setPageMeta(metaData, vm.programType._id, 'generalcares');
                var programTypeId = vm.programType._id;
                vm.content = vm.programType.content;
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

        //get general care details
        function getGeneralCareDetail() {

            if ($location.path() == '/generalcaredetails/sponsorship-renewal') {
                vm.orphanRenewal = true;
            }

            if ($location.path() == '/generalcaredetails/orphan-gift') {
                vm.oprhanGift = true;
            }

            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            generalCareService.getGeneralCareById(id).then(function (res) {
                vm.generalCareDetail = res.data[0];
                const metaData = {
                    title: vm.generalCareDetail.programName,
                    description: vm.generalCareDetail.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.generalCareDetail.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/generalcaredetails/${vm.generalCareDetail._id}`,
                };
                MetaTagsService.setPageMeta(metaData, vm.generalCareDetail._id, 'generalcaredetails');
                if (vm.generalCareDetail.programDescription.length > 1) {
                    let description = vm.generalCareDetail.programDescription.split(' ');
                    // let range1 = description.length;
                    // let range2 = description.length / 3;
                    // if (range2 % 1 > 0) {
                    //     range2 = Math.ceil(range2);
                    // }
                    // for (let i = 0; i <= range2; i++) {
                    //     vm.description.para1 = vm.description.para1 + ' ' + description[i];
                    // }

                    // for (let i = range2 + 1; i <= range1; i++) {
                    //     vm.description.para2 = vm.description.para2 + ' ' + description[i];
                    // }
                }
                $scope.selectedGc = vm.generalCareDetail;
                $scope.selectGcCalculator();
                $scope.isDetail = true;
                $scope.getCountValues();
                setDefaultValues();
            });
        }

        function setDefaultValues() {

            if ($location.search().noOfOrphan) {
                $scope.selectedCount = Number($location.search().noOfOrphan);
                let plan = $scope.paymentPlans.filter(item => item.Name == $location.search().PP);
                $scope.selectedPaymentPlan = plan[0];
                $scope.isAutoRenew = $location.search().autoRenew == 'true' ? true : false;
                $scope.checkPaymentPlan();
                jQuery("#orphanListModal").modal("show");
                $scope.getOrphansByCount($scope.selectedCount);
                //bug fix for keep showing modal window - clean URL params after pre-selecting once - without page reload
                var currURL = window.location.href;
                var url = (currURL.split(window.location.host)[1]).split("?")[0];
                window.history.pushState({}, document.title, url);
            }


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


            }
        }

        //Function to Activate/Deactiave General Care
        function deleteGeneralCare(generalCareId, status) {
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
                        generalCareService.deleteGeneralCare(generalCareId).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                'General Care has been deactivated.',
                                'success'
                            )
                            getGeneralCares();
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
                generalCareService.deleteGeneralCare(generalCareId).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        'General Care has been Activated.',
                        'success'
                    )
                    getGeneralCares();
                    return res;
                });
            }
        }

        jQuery("#txtFromDate").datepicker({
            autoclose: true
        });
        //For Add/Update General Care Form
        $scope.startDateChange = function () {
            jQuery("#txtToDate").datepicker("remove");
            jQuery("#txtToDate").val('');
            jQuery("#txtToDate").datepicker({
                autoclose: true,
                startDate: new Date(vm.StartDate),
            });
        }
        $scope.setPosFromDate = function () {
            var position = jQuery("#txtFromDate").offset().top;
            position = position - 300;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (position) + "px" });
        }
        $scope.setPosToDate = function () {
            var position = jQuery("#txtToDate").offset().top;
            position = position - 300;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: "" + (position) + "px" });
        }
        $scope.getOrphansByCount = function (orphanCount) {
            $scope.selectedDescend = 'Any';
            $scope.selectedGender = 'Any';
            //$scope.user.roles = [];
            if ($scope.selectedRecurring === undefined || $scope.selectedRecurring === "" || $scope.selectedDescend === undefined || $scope.selectedDescend === "" || $scope.selectedGender === undefined || $scope.selectedGender === "") {
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
        $scope.user = {};
        $scope.addSelectedOrphan = function () {
        }
        // $scope.donate = function () {
        //     generalCareVM.seletedOrphan = $scope.user;
        //     donationService.addDonation(generalCareVM).then(function (res) {
        //     });
        // }
        $scope.selectGcCalculator = function () {
            getCalculator($scope.selectedGc);
        }

        function clearOrphanCalculator() {
            clearCalculator();
        }

        $scope.countChangeGc = function () {
            $scope.countChange();
        }
        $scope.countChange = function () {
            let paymentDate = new Date();
            if ($scope.selectedRecurring === false) $scope.commentTxt = undefined;
            if ($scope.selectedGc.donationProcess[0].isRecurring && ($scope.selectedRecurring || $scope.isRecurringPaymentPlan)) {
                $scope.selectedCount = !$scope.selectedCount ? 0 : $scope.selectedCount;
                let numOfMonths = $scope.selectedGc.donationProcess[0].subscriptionDetail.duration.numOfMonths;
                let amountPerOrphan = Math.ceil(($scope.amountValue) / numOfMonths).toFixed(2);
                $scope.totalAmount = ($scope.selectedCount || 0) * amountPerOrphan;
                console.log($scope.amountValue);
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
                // $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                $scope.totalSubscriptionAmount = $scope.totalAmount;
            }
        }
        $scope.countChangeForNonFixed = function () {
            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValueForNonFixed).toFixed(2);
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

        function getCalculator(projectDetail) {
            vm.projectCalculator = "";

            $scope.totalSubscriptionAmount = undefined;
            $scope.sponsorshipPlanText = undefined;
            $scope.amountIsAmount = true;
            $scope.amountValue = null;
            $scope.paymentPlans = [];
            $scope.autoRenewMessage = undefined;
            $scope.paymentChargeMessage = undefined;
            $scope.totalAmount = null;

            $scope.user.roles = [];
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
                        let fixedAmount = obj.currency.rateExchange * donationProcess.amount;
                        $scope.amountValue = currencyService.currencyConversionFormula(fixedAmount).toFixed(2);
                    }


                    vm.amount = Math.round(donationProcess.amount).toFixed(2);
                    let lang = localStorage.getItem('lang');

                    if (donationProcess.subscriptionDetail) {
                        $scope.paymentPlans = donationProcess.subscriptionDetail.paymentPlan;
                        $scope.sponsorshipPlanText = utilService.getSponsorshipPlanString(donationProcess.subscriptionDetail.duration.numOfMonths, $scope.amountValue);
                        $scope.autoRenewMessage = donationProcess.subscriptionDetail.autoRenewMessage.value[lang];




                        // if (donationProcess.processType && donationProcess.processType === "Subscription") {


                        // }

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
                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                        // // vm.projectCalculator += "<select  class='form-control' ng-model='selectedRecurring' ng-change='countChange()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>"
                        // vm.projectCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                        // vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label >{{ 'DESCEND' | translate }}</label>";
                        // vm.projectCalculator += "<select class='form-control' ng-model='selectedDescend'ng-change='clearOrphans()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='true'>{{'SYED' | translate}}</option><option ng-value='false'>{{'NONSYED' | translate}}</option>";
                        // vm.projectCalculator += "</select>";
                        // vm.projectCalculator += "</div>";

                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label >{{ 'GENDER' | translate }}</label>";
                        // vm.projectCalculator += "<select class='form-control' ng-model='selectedGender' ng-change='clearOrphans()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option value='Male'>{{'MALE' | translate}}</option><option value='Female'>{{'FEMALE' | translate}}</option>";
                        // vm.projectCalculator += "</select>";
                        // vm.projectCalculator += "</div>";


                        // vm.projectCalculator += "<div class='form-group ng-hide' ng-show='selectedRecurring'>";
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
                    }

                    // vm.projectCalculator += "<div class='form-group'>";
                    // vm.projectCalculator += " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                    // vm.projectCalculator += " <label id='fixedAmountValue' ></label>";
                    // vm.projectCalculator += "<div class='input-group'>"
                    // vm.projectCalculator += "<div class='input-icon'>"
                    // vm.projectCalculator += "<input type='text'  ng-keypress='isNumberKey($event)' min='1' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='projectVM.isAmount' />"
                    // vm.projectCalculator += "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>"
                    // vm.projectCalculator += "</div>";
                    // vm.projectCalculator += "</div>";
                    // vm.projectCalculator += "</div>";

                    vm.isCount = donationProcess.isCount;
                    if (donationProcess.isCount) {

                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label >{{ 'COUNT' | translate }} </label>";
                        // vm.projectCalculator += "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
                        // vm.projectCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
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
                    // vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1'  data-ng-disabled='generalCareVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                    // vm.projectCalculator += "</div>";
                    // vm.projectCalculator += "</div>";

                    // vm.projectCalculator += "<div class='form-group' ng-if='selectedRecurring'>";
                    // vm.projectCalculator += " <label><span class='commentTxt'>{{commentTxt}}</span></label>";
                    // vm.projectCalculator += "</div>";

                    if (donationProcess.isRecurring) {

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
                    } else {
                        // if(projectDetail.slug == "eidiya") {

                        // vm.projectCalculator += "<div class='form-group'>";
                        // vm.projectCalculator += " <label><span class='commentTxt'>{{'EidhyaSponsorship' | translate}}</span></label>";
                        // vm.projectCalculator += "</div>";
                        // }
                        // vm.projectCalculator += "<div>";
                        // vm.projectCalculator += "   <div class='row'>";
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
                        // vm.projectCalculator += "<select  class='form-control' ng-change='durationForRecurring()' ng-model='selectedRecurring'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>"
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
                        // vm.projectCalculator += "<input type='text'  id='amountTextBox' min='0' ng-keyup='countChangeForNonFixed()' ng-change='countChangeForNonFixed()' data-ng-model='amountValueForNonFixed'  class='form-control' ng-disabled='projectVM.isAmount' />"
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
                        vm.projectCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator +="</div>";
                        vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1'  data-ng-disabled='generalCareVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";


                    } else {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator +="</div>";
                        vm.projectCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='1'  data-ng-disabled='generalCareVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
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
            let calculator = $compile(vm.projectCalculator)($scope);
            angular.element(document.getElementById("gcCalculator")).html("").append(calculator);
            $scope.selectedRecurring = false;
            $scope.selectedCount = undefined;
            $scope.amountValueForNonFixed = undefined;
            $scope.selectedDescend = undefined;
            $scope.selectedGender = undefined;
        }

        $scope.addCartItem = function () {
            var obj = new Object();
            if (vm.clickedCart) return;
            vm.clickedCart = true;
            if ($scope.selectedGc) {
                obj.program = $scope.selectedGc;
                if (!validation($scope.selectedGc)) {
                    vm.clickedCart = false;
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
            obj.isRecurring = $scope.selectedRecurring;

            if (vm.orphanRenewal && $scope.selectedCount > 0 && $scope.selectedCount <= 5) {
                if (vm.orphanIds.length > 0) {
                    let arrayLength = checkAllIndexesValue();
                    let found = vm.orphanIds.some(item => item == undefined);
                    if (!found && $scope.selectedCount == vm.orphanIds.length && arrayLength) {
                        obj.orphanIds = vm.orphanIds;
                    }
                    else {
                        validateMissingField();
                        return vm.clickedCart = false;
                    }
                }
                else {
                    validateMissingField();
                    return vm.clickedCart = false;
                }
            }

            if (vm.orphanGiftDescription) {
                obj.orphanGiftDescription = vm.orphanGiftDescription;
            }

            obj.isRecurringProgram = $scope.selectedGc && $scope.selectedGc.isRecurringProgram;
            obj.isAutoRenew = $scope.isAutoRenew;
            obj.paymentPlan = $scope.selectedPaymentPlan;
            obj.totalSubscriptionAmount = $scope.totalSubscriptionAmount


            if ($scope.selectedRecurring) {
                obj.donationDuration = $scope.donationDurationsYaerly;
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

            if ($scope.selectedRecurring) {
                obj.donationDuration = $scope.donationDurationsYaerly;

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
            if ($scope.user.roles.length > 0) {
                obj.orphans = $scope.user.roles;
            }
            //  $scope.totalAmount = ''
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

                    vm.orphanIds = [];
                    vm.orphanGiftDescription = null;

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



        function checkAllIndexesValue() {
            let exists = true;
            for (let i = 0; i < vm.orphanIds.length; i++) {
                if (!vm.orphanIds[i]) {
                    exists = false;
                }
            }
            return exists;
        }

        function clearCalculator() {
            if ($scope.isDetail) {
                getGeneralCareDetail();
            }
            else {

                $scope.selectedPaymentPlan = undefined;
                $scope.selectedDescend = undefined;
                $scope.selectedGender = undefined;
                $scope.amountValue = undefined;
                $scope.totalAmount = undefined;
                $scope.isAutoRenew = false;
                $scope.autoRenewMessage = undefined;
                $scope.paymentChargeMessage = undefined;
                $scope.paymentPlans = [];
                $scope.totalSubscriptionAmount = undefined;

                $scope.amountValueForNonFixed = undefined;
                $scope.selectedCount = undefined;
                $scope.selectedGc = undefined;
                vm.projectCalculator = "";
                $scope.user.roles = [];
                let calculator = $compile(vm.projectCalculator)($scope);
                angular.element(document.getElementById("gcCalculator")).html("").append(calculator);
            }
        }

        $scope.donate = function () {
            var obj = new Object();
            if (vm.clickedCart) return;
            vm.clickedCart = false;
            if ($scope.selectedGc) {
                obj.program = $scope.selectedGc;
                if (!validation($scope.selectedGc)) {
                    return vm.clickedCart = false;
                }
            }
            // obj.userId = vm.user.userId;
            // obj.userName = vm.user.username;
            if (obj.program.donationProcess[0].isCount) {
                obj.count = $scope.selectedCount;
            }

            obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
            obj.programSubCategory = vm.selectedCategory;
            obj.isRecurring = $scope.selectedRecurring;
            if ($scope.selectedRecurring) {
                obj.donationDuration = $scope.donationDurationsYaerly;
                var startDate = new Date();
                var endDate = new Date();
                endDate.setDate(endDate.getDate() + 365);

                obj.startDate = "" + ((startDate.getMonth() + 1) < 10 ? '0' : '') + (startDate.getMonth() + 1) +
                    "/" + (startDate.getDate() < 10 ? '0' : '') + startDate.getDate() +
                    "/" + startDate.getFullYear() + "";

                obj.endDate = "" + ((endDate.getMonth() + 1) < 10 ? '0' : '') + (endDate.getMonth() + 1) +
                    "/" + (endDate.getDate() < 10 ? '0' : '') + endDate.getDate() +
                    "/" + endDate.getFullYear() + "";

                obj.paymentDate = $scope.paymentDate;
            }
            if ($scope.selectedRecurring) {
                obj.donationDuration = $scope.donationDurationsYaerly;

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

            if (vm.orphanRenewal && $scope.selectedCount > 0 && $scope.selectedCount <= 5) {
                if (vm.orphanIds.length > 0) {
                    let arrayLength = checkAllIndexesValue();
                    let found = vm.orphanIds.some(item => item == undefined || item == '');
                    if (!found && $scope.selectedCount == vm.orphanIds.length && arrayLength) {
                        obj.orphanIds = vm.orphanIds;
                    }
                    else {
                        validateMissingField();
                        return vm.clickedCart = false;
                    }
                }
                else {
                    validateMissingField();
                    return vm.clickedCart = false;
                }
            }

            if (vm.orphanGiftDescription) {
                obj.orphanGiftDescription = vm.orphanGiftDescription;
            }

            obj.isRecurringProgram = $scope.selectedGc && $scope.selectedGc.isRecurringProgram;
            obj.isAutoRenew = $scope.isAutoRenew;
            obj.paymentPlan = $scope.selectedPaymentPlan;
            obj.totalSubscriptionAmount = $scope.totalSubscriptionAmount

            if ($scope.user.roles.length > 0) {
                obj.orphans = $scope.user.roles;
            }
            if (obj.program.donationProcess[0].isMinimumAmount) {
                let minimiumAmountForDonation = obj.program.donationProcess[0].minimumAmount;
                if ($scope.totalAmount < minimiumAmountForDonation) {
                    let minAmountmsg;
                    let currency = JSON.parse(sessionStorage.getItem('currency')).symbol;
                    if (localStorage.getItem('lang') == 'ARB') {
                        minAmountmsg = currency.concat(minimiumAmountForDonation.toString()) + "الحد الأدنى للمساهمة في هذه الفئة هو";
                    } else if (localStorage.getItem('lang') == 'FRN') {
                        minAmountmsg = "Le montant minimum pour cette catégorie est " + currency.concat(minimiumAmountForDonation.toString())
                    } else {
                        minAmountmsg = "The minimum donation amount for this category is " + currency.concat(minimiumAmountForDonation.toString())
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
            // obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            // cartService.addCartItem(obj).then(function (res) {
            // $rootScope.$broadcast('getCartCounter');
            // if ($rootScope.isLogin) {
            //     obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            //     localStorage.setItem("cart", null);
            //     localStorage.setItem("cart", JSON.stringify(obj));
            //     $window.location.href = "/#/checkout";
            // } else {
            //     obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            //     localStorage.setItem("cart", null);
            //     localStorage.setItem("cart", JSON.stringify(obj));
            //     jQuery('#globalLoginModal').modal('show');
            // }
            // });
            obj.currency = JSON.parse(sessionStorage.getItem("currency"));
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
                    cartService.addCartItem(obj).then(function () {
                        //   if ($rootScope.isLogin) {
                        $rootScope.$broadcast("getCartCounter");
                        $state.go("cart");
                        vm.clickedCart = false;
                        //   } else {
                        //     jQuery("#globalLoginModal").modal("show");
                        //   }
                    });
                    vm.orphanIds = [];
                    vm.orphanGiftDescription = null;

                    if (obj.orphans) {
                        // update blocking date in in orphan table 
                        orphanService.updateSelectedOrphan(obj.orphans).then(function (resp) {
                        });
                    }

                }

            });
        }



        function validateMissingField() {
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

        }

        $scope.clearOrphans = function () {
            //$scope.user.roles = [];
            vm.orphans = orphanService.filterOrphanPopupItems($scope.selectedGender, $scope.selectedDescend, vm.orphanCompleteList);
        }

        function validation(program) {

            if (program.donationProcess[0].isRecurring) {
                //for fixed amount.
                if ($scope.selectedRecurring === undefined || $scope.selectedRecurring === "") {
                    validateMissingField();
                    return;
                }
                //return true;
            }
            if (program.donationProcess[0].isSyed) {
                if ($scope.selectedDescend !== false && !$scope.selectedDescend) {
                    validateMissingField();
                    return;
                }
                //return true;
            }

            if (program.programSubCategory.length > 0) {
                if (vm.selectedCategory != null) {
                    if (!vm.selectedCategory.isFixedAmount) {
                        if (!$scope.amountValueForNonFixed) {
                            validateMissingField();
                            return;
                        }
                    }
                }
            }
            else {
                if (!program.donationProcess[0].isAmount) {
                    if (!$scope.totalAmount && !$scope.amountValueForNonFixed) {
                        validateMissingField();
                        return;
                    }
                }
            }

            if (program.donationProcess[0].isCount) {
                if (!$scope.selectedCount) {
                    validateMissingField();
                    return false;
                }
                //return true;
            }




            // if (!program.donationProcess[0].isAmount) {
            //     if (!$scope.amountValueForNonFixed) {
            //         swal({
            //             title: "Amount is required",
            //             position: 'center-center',
            //             type: 'error',
            //             allowOutsideClick: false,
            //         }).then(function () {
            //         });
            //         return false;
            //     }
            // }
            // if (!program.donationProcess[0].isAmount) {
            //     if (!$scope.totalAmount) {
            //         swal({
            //             title: "Kindly enter amount",
            //             position: 'center-center',
            //             type: 'error',
            //             allowOutsideClick: false,
            //         }).then(function () {
            //             //window.location = "#/orphans";
            //         });
            //         return false;
            //     }
            //     //return true;
            // }
            return true;
        }
    }
})()