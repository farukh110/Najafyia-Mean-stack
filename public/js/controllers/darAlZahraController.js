(function () {

    angular.module('mainApp').controller('darAlZahraController', darAlZahraController);

    function darAlZahraController($scope, $translate, $rootScope, $filter, MetaTagsService, $window, $compile, $location, projectService, darAlZahraService, utilService, programTypeService, $state, donationProcessService, multipartForm, studentProfileService, cartService, currencyService) {

        var vm = this;

        vm.addDarAlZahra = addDarAlZahra;
        vm.getAllDarAlZahra = getAllDarAlZahra;
        vm.deleteDarAlZahra = deleteDarAlZahra;
        vm.printContent = printContent;
        vm.getDarAlZahraDataForUpdate = getDarAlZahraDataForUpdate;
        vm.updateDarAlZahra = updateDarAlZahra;
        vm.previewImage = previewImage;
        vm.getAllActiveDarAlZahra = getAllActiveDarAlZahra;
        vm.saveDazContent = saveDazContent;
        vm.donationProcess = {};
        vm.darAlZahraCategories = [];
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
        vm.validCounter = true;
        vm.getProgramType = getProgramType;
        vm.addSubCategoryToList = addSubCategoryToList;
        vm.addOrRemoveSubcategory = addOrRemoveSubcategory;
        vm.clearCalculator = clearCalculator;
        vm.description = {
            para1: '',
            para2: ''
        };
        $scope.selectedRecurring = false;
        $scope.paymentMethod = $translate.instant('ONETIME');
        $scope.selectedCurrencySymbol = JSON.parse(sessionStorage.getItem('currency')).symbol;
        $scope.age = function (birthday) {
            if (birthday) {
                let bday = new Date(birthday);
                var ageDifMs = Date.now() - bday.getTime();
                var ageDate = new Date(ageDifMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        }
        $scope.isNumberKey = function ($event) {
            let amount = String.fromCharCode(event.which || event.keyCode)
            let pattern = /^[0-9]\d*(\.\d+)?$/;
            if (!pattern.test(amount)) {
                event.preventDefault()
            }
        }
        // for arabic header in print view
        let lang = localStorage.getItem('lang');
        if (lang == 'ARB') {
            vm.printArb = true
        } else if (lang == 'FRN' || lang == 'ENG') {
            vm.printArb = false
        }

        $scope.message = {} // contact info goes here

        $scope.sendMail = function () {
            const mail = utilService.sendEmail(vm.daralzahraDetail.programName, vm.daralzahraDetail.programDescription, `daralzahradetails/${vm.daralzahraDetail.slug}`, vm.daralzahraDetail.imageLink)
            $window.open(mail);
        }

        //Function to Add or Remove Sub Category from Check Box List
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

        //Function to Add Subcategory
        function addSubCategoryToList() {
            if (vm.subCategories.indexOf(vm.subCategoryValue) != -1) {
            } else {
                vm.subCategories.push(vm.subCategoryValue);
                vm.subCategoryValue = "";
            }
        }

        function saveDazContent() {
            let dazTxt = document.getElementById("dazTxt").value;
            if (dazTxt == "") {
                document.getElementById("showError").innerText = $translate.instant("PLEASE FILL THE MISSING FIELD");
                document.getElementById("dazTxt").focus();
            }
            else {
                darAlZahraService.addDarAlZahraContent({ content: vm.content, _id: vm.programType._id }).then(function (res) {
                    vm.allDarAlZahra = res.data;
                    return res;
                }, location.reload());
            }
        }

        function previewImage() {
            var image = vm.file;
        }

        //load type Dar Al Zahra in program type
        function getProgramType() {
            if (localStorage.getItem('lang') == 'ARB') {
                project = "(دار الزهراء (ع";
            } else if (localStorage.getItem('lang') == 'FRN') {
                project = "Dar-Al-Zahra";
            } else {
                project = "Dar Al Zahra";
            }
            programTypeService.getProgramType(project).then(function (res) {
                vm.programType = res.data[0];
                darAlZahraService.getCategoriesByProgramType(vm.programType._id).then(function (res) {
                    vm.darAlZahraCategories = res.data;
                    return res;
                });
                return res.data[0];
            }
            );
        }

        function printContent(divName) {
            window.print();
        }

        // add new Dar Al Zahra
        function addDarAlZahra(isValid) {
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
                        let darAlZahraObj = getDarAlZahraData();
                        darAlZahraObj.imageLink = imageLink;
                        darAlZahraObj.donationProcess = vm.donationProcess;
                        darAlZahraObj.programType = vm.programType;
                        darAlZahraObj.subCategories = vm.selectedCategory;
                        darAlZahraObj.userLang = localStorage.getItem('lang');
                        darAlZahraService.addDarAlZahra(darAlZahraObj).then(function (res) {
                            swal({
                                title: $translate.instant('Dar Al Zahra Module created successfully'),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/darAlZahraList";
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
            obj.isAmount = vm.isAmount
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

        //creat Dar Al Zahra object
        function getDarAlZahraData() {
            var obj = new Object();
            obj.programName = vm.darAlZahraName;
            obj.programPriority = vm.programPriority;
            obj.slug = vm.darAlZahraSlug;
            obj.programDescription = jQuery('#adddaralzahra .froala-view').html();
            return obj;
        }

        // get  Dar Al Zahra objects
        function getAllDarAlZahra() {
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
                    vm.allDarAlZahra = res.data;
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
                const metaData = {
                    title: 'Dar Al Zahra',
                    description: vm.programType.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.programType.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/generalcares/${vm.programType._id}`,
                };
                MetaTagsService.setPageMeta(metaData, vm.programType._id, 'generalcares');
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

        //Function to Activate/Deactiave Dar Al Zahra
        function deleteDarAlZahra(darAlZahraId, status) {
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
                        darAlZahraService.deleteDarAlZahra(darAlZahraId).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                $translate.instant('Dar Al Zahra Module has been deactivated.'),
                                'success'
                            )
                            getAllDarAlZahra();
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
                darAlZahraService.deleteDarAlZahra(darAlZahraId).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        $translate.instant('Dar Al Zahra Module has been Activated.'),
                        'success'
                    )
                    getAllDarAlZahra();
                    return res;
                });
            }
        }

        //get data for Dar Al Zahra update
        function getDarAlZahraDataForUpdate() {
            var id = $location.search().darAlZahraId;
            darAlZahraService.getDarAlZahraById(id).then(function (res) {
                let data = res.data[0];
                if (data.programType && data.programType.length) {
                    vm.programTypeId = data.programType[0];
                    darAlZahraService.getCategoriesByProgramType(vm.programTypeId).then(function (res) {
                        vm.darAlZahraCategories = res.data;
                        vm.selectedCategory = data.programSubCategory;
                        if (vm.selectedCategory.length > 0) {
                            vm.hasCategories = true;
                        }
                        vm.darAlZahraCategories.forEach(function (element) {
                            if (_.find(vm.selectedCategory, element)) {
                                element.selected = true;
                            }
                            else {
                                element.selected = false;
                            }
                        }, this);
                        return res;
                    });
                }

                vm.darAlZahraId = data._id;
                vm.darAlZahraName = data.programName;
                vm.programPriority = data.programPriority;
                vm.darAlZahraDescription = data.programDescription;
                vm.imageLink = data.imageLink;
                vm.darAlZahraSlug = data.slug;
                let donationProcess = data.donationProcess[0];
                vm.isRecurring = donationProcess.isRecurring;
                vm.isYearAround = donationProcess.isYearAround;
                vm.isSyed = donationProcess.isSyed;
                vm.isDuration = donationProcess.isDuration;
                vm.isAmount =donationProcess.isAmount
                vm.isMinimumAmount = donationProcess.isMinimumAmount;
                if (vm.isAmount) {
                    vm.amount = Math.round(donationProcess.amount).toFixed(2);
                }
                if (vm.isMinimumAmount) {
                    vm.minimumAmount = Math.round(donationProcess.minimumAmount).toFixed(2);
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
                vm.updaralsadqa = data.programDescription;
                jQuery("#updaralsadqa .froala-view").html(vm.updaralsadqa);
                return res;
            });
        }

        //update Dar Al Zahra Module
        function updateDarAlZahra(isValid) {
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
                if (vm.file.name == undefined) {
                    let darAlZahraObj = getUpdatedDarAlZahraObject();
                    darAlZahraObj.imageLink = vm.imageLink;
                    darAlZahraService.updateDarAlZahra(darAlZahraObj).then(function (res) {
                        swal({
                            title: $translate.instant('Dar Al Zahra Module updated successfully'),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/darAlZahraList";
                        });
                        return res;
                    });
                } else {
                    multipartForm.post('/upload', vm.file).then(function (res) {
                        let darAlZahraObj = getUpdatedDarAlZahraObject();
                        darAlZahraObj.imageLink = res.data.name;
                        darAlZahraService.updateDarAlZahra(darAlZahraObj).then(function (res) {
                            swal({
                                title: $translate.instant('Dar Al Zahra Module updated successfully'),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/darAlZahraList";
                            });
                            return res;
                        });
                    });
                }
            }
        }

        //create update Dar Al Zahra object
        function getUpdatedDarAlZahraObject() {
            var obj = new Object();
            obj.id = vm.darAlZahraId;
            obj.programName = vm.darAlZahraName;
            obj.programPriority = vm.programPriority;
            obj.slug = vm.darAlZahraSlug;
            obj.programDescription = jQuery('#updaralsadqa .froala-view').html();
            //obj.programDescription = vm.darAlZahraDescription;
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
                    donationProcess.amount = Math.round(currencyService.currencyConversionFormula(obj.currency.rateExchange * vm.amount)).toFixed(2);
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

        jQuery("#txtFromDate").datepicker({
            autoclose: true
        });
        //For Add/Update Project Form
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
        //GET DARAL-ZAHRA DETAIL
        $scope.getDaralZahraDetail = function () {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            darAlZahraService.getDarAlZahraById(id).then(function (res) {
                vm.daralzahraDetail = res.data[0];
                const metaData = {
                    title: vm.daralzahraDetail.programName,
                    description: vm.daralzahraDetail.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.daralzahraDetail.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/daralzahradetails/${vm.daralzahraDetail._id}`,

                };
                MetaTagsService.setPageMeta(metaData, vm.daralzahraDetail._id, 'daralzahradetails');
                if (vm.daralzahraDetail.programDescription.length > 1) {
                    var description = vm.daralzahraDetail.programDescription.split(' ');
                    let range1 = description.length;
                    let range2 = description.length / 3;
                    if (range2 % 1 > 0) {
                        range2 = Math.ceil(range2);
                    }
                    for (let i = 0; i <= range2; i++) {
                        vm.description.para1 = vm.description.para1 + ' ' + description[i];
                    }

                    for (let i = range2 + 1; i <= range1; i++) {
                        vm.description.para2 = vm.description.para2 + ' ' + description[i];
                    }
                }
                $scope.selectedDz = vm.daralzahraDetail;
                $scope.selectDzCalculator();
            });
        }
        $scope.countChange = function () {
            let paymentDate = new Date();
            if ($scope.selectedDz && $scope.selectedDz.donationProcess && $scope.selectedDz.donationProcess.length && $scope.selectedDz.donationProcess[0].isAmount) {
                if ($scope.selectedRecurring) {
                    if ($scope.selectedDonationDuration && ($scope.selectedDonationDuration.donationDurationName == "Half Yearly" || $scope.selectedDonationDuration.donationDurationName == "نصف سنوي" || $scope.selectedDonationDuration.donationDurationName == "Semestriel")) {
                        $scope.totalAmountPerMonth = Math.round((($scope.selectedCount || 1) * $scope.amountValue) / 6).toFixed(2);
                        $scope.totalAmount = Math.round((($scope.selectedCount || 1) * $scope.amountValue) / 6).toFixed(2);
                        paymentDate = new Date(paymentDate.setMonth(paymentDate.getMonth() + 6));

                        let monthNumber = paymentDate.getMonth();

                        if (!monthNumber)
                            monthNumber = paymentDate.getMonth() + 1;
                        let formatted_date = new Date(monthNumber + "-" + paymentDate.getDate() + "-" + paymentDate.getFullYear())
                        let language = localStorage.getItem('lang');
                        if (language == 'ARB') {
                            $scope.commentTxt = "يرجى ملاحظة أنه سيتم خصم " + $scope.selectedCurrencySymbol + $scope.totalAmount + " شهريًا حتى " + $filter('date')(formatted_date, "yyyy-MM-dd");
                        }
                        else if (language == 'FRN') {
                            $scope.commentTxt = "Veuillez noter que les " + $scope.selectedCurrencySymbol + $scope.totalAmount + " seront déduit mensuellement pour une période de (06) mois jusqu'au " + $filter('date')(formatted_date, "dd-MM-yyyy");

                        } else {
                            $scope.commentTxt = "Please note that the " + $scope.selectedCurrencySymbol + $scope.totalAmount + " will be deducted monthly for a period of (06) months until " + $filter('date')(formatted_date, "dd-MM-yyyy");
                        }
                    } else {
                        $scope.totalAmountPerMonth = Math.round((($scope.selectedCount || 1) * $scope.amountValue) / 12).toFixed(2);
                        $scope.totalAmount = Math.round((($scope.selectedCount || 1) * $scope.amountValue) / 12).toFixed(2);
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
                            $scope.commentTxt = "Veuillez noter que les " + $scope.selectedCurrencySymbol + $scope.totalAmount + " seront déduit mensuellement jusqu'au " + $filter('date')(formatted_date, "dd-MM-yyyy");

                        } else {
                            $scope.commentTxt = "Please note that the " + $scope.selectedCurrencySymbol + $scope.totalAmount + " will be deducted monthly until " + $filter('date')(formatted_date, "dd-MM-yyyy");
                        }


                    }
                } else {
                    if ($scope.selectedDonationDuration == "Yearly" || $scope.selectedDonationDuration == "سنوي" || $scope.selectedDonationDuration == "Annuel") {
                        $scope.totalAmountPerMonth = (($scope.selectedCount || 1) * $scope.amountValue);
                        $scope.totalAmount = Math.round($scope.selectedCount || 1) * $scope.amountValue.toFixed(2);
                    } else {
                        $scope.totalAmountPerMonth = Math.round((($scope.selectedCount || 1) * $scope.amountValue) / 2).toFixed(2);
                        $scope.totalAmount = Math.round(($scope.selectedCount || 1) * $scope.amountValue).toFixed(2);
                    }
                }
            } else {
                $scope.totalAmount = Math.round(($scope.selectedCount || 1) * $scope.amountValueForNonFixed).toFixed(2);
            }
            // if ($scope.selectedDz.donationProcess[0].isAmount) {
            //     $scope.totalAmount = $scope.selectedCount * $scope.amountValue;
            // } else {
            //     $scope.totalAmount = $scope.selectedCount * $scope.amountValueForNonFixed;
            // }
        }
        $scope.getStudentsByCount = function (studentsCount) {
            $scope.user.roles = [];
            if (
                ($scope.selectedRecurring !== false && !$scope.selectedRecurring) ||
                ($scope.selectedDescend !== false && !$scope.selectedDescend) ||
                !$scope.amountValue || !$scope.selectedCount || !$scope.selectedDonationDuration) {
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
            studentProfileService.getStudentsByCount(studentsCount, $scope.selectedDescend).then(function (res) {
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
        $scope.selectDzCalculator = function () {
            getCalculator($scope.selectedDz);
        }
        $scope.user = {};

        function getCalculator(projectDetail) {
            vm.projectCalculator = "";
            $scope.totalAmount = null;

            $scope.user.roles = [];
            if (projectDetail != undefined) {
                vm.subCategories = projectDetail.programSubCategory;
                if (vm.subCategories != undefined ? vm.subCategories.length > 0 : false) {
                    vm.projectCalculator += "<div class='form-group'>";
                    vm.projectCalculator += " <label >SubCategory</label>";
                    vm.projectCalculator += "<select  class='form-control' ng-model='daralzehraVM.selectedCategory' ng-change='daralzehraVM.checkSubCategory()' ng-options='x.programSubCategoryName for x in daralzehraVM.subCategories'>"
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
                    if (donationProcess.isRecurring) {
                        vm.hasDonationDuration = true;
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
                    vm.projectCalculator += "<input type='text'  ng-keypress='isNumberKey($event)' min='1' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='projectVM.isAmount' />"
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
                    vm.projectCalculator += "<div class='input-icon'><input type='text'  data-ng-disabled='daralzehraVM.isCount' ng-keypress='isNumberKey($event)' class='form-control' ng-model='totalAmount' /><i>{{selectedCurrencySymbol}} </i></div>"
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
                        vm.projectCalculator += "<input type='text'  id='amountTextBox' min='0' ng-keyup='countChange()' ng-change='countChange()' data-ng-model='amountValueForNonFixed'  class='form-control' ng-disabled='daralzehraVM.isAmount' />"
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}<span ng-show='selectedRecurring' style='color:green;font-size:10px;'>(Per Month)</span></label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator +="</div>";
                        vm.projectCalculator += "<div class='input-icon'><input type='text' data-ng-disabled='daralzehraVM.isCount' ng-keypress='isNumberKey($event)' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";
                    } else {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator += " <label >{{ 'AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator +="</div>";
                        vm.projectCalculator += "<div class='input-icon'><input type='text' data-ng-disabled='daralzehraVM.isCount' ng-keypress='isNumberKey($event)' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";
                    }
                    if (donationProcess.isRecurring) {
                        vm.projectCalculator += "  <div class='form-group'>";
                        vm.projectCalculator += "   <button class='grop-btn  grop-btn_submit' data-toggle='modal'";
                        vm.projectCalculator += `data-target='#studentListModal' ng-click='getStudentsByCount(selectedCount)' ng-show='(selectedDescend == undefined || selectedDescend === "") ? false : true && selectedCount > 0 ? true : false'>{{'SELECT STUDENTS' | translate}}</button>`;
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
            angular.element(document.getElementById("dzCalculator")).html("").append(calculator);
            $scope.selectedRecurring = false;
            $scope.selectedCount = undefined;
            $scope.amountValueForNonFixed = undefined;
            $scope.selectedDescend = undefined;
            $scope.selectedGender = undefined;
        }

        $scope.validation = function () {
            var obj = $scope.selectedDz;
            var msg = '';
            if (obj.programSubCategory != undefined ? obj.programSubCategory > 0 : false) {
                if (vm.selectedCategory == null || vm.selectedCategory == undefined || vm.selectedCategory == '') {
                    msg += 'Sub Category, ';
                }
            }
            if (obj.donationProcess[0].isRecurring) {
                if ($scope.selectedDonationDuration == null || $scope.selectedDonationDuration == undefined || $scope.selectedDonationDuration == '') {
                    msg += 'Duration, ';
                }

                if (!($scope.selectedRecurring == undefined)) {
                    if ($scope.selectedRecurring.toString() == null || $scope.selectedRecurring.toString() == '') {
                        msg += 'Payment Method, ';
                    }
                    // else if ($scope.selectedRecurring) {
                    //     if ($scope.paymentDate == null || $scope.paymentDate == undefined || $scope.paymentDate == '') {
                    //         msg += 'Payment Date, ';
                    //     }
                    // }
                }
                else {
                    msg += 'Payment Method, ';
                }
                if (obj.donationProcess[0].isSyed) {
                    if ($scope.selectedDescend.toString() == null || $scope.selectedDescend.toString() == undefined || $scope.selectedDescend.toString() == '') {
                        msg += 'Descend, ';
                    }
                }// END-IS SYED
            }// END-RECURRING
            if (obj.donationProcess[0].isCount) {
                if ($scope.selectedCount == null || $scope.selectedCount == undefined || $scope.selectedCount == '') {
                    msg += 'Count, ';
                }
                if (!$scope.totalAmount) {
                    msg += 'Total Amount, ';
                }
            }
            else {
                if (!$scope.totalAmount) {
                    msg += 'Total Amount, ';
                }
            }
            //FIXED AMOUNT
            if (obj.donationProcess[0].isAmount) {
                if (!$scope.amountValue) {
                    msg += 'Fixed Amount.';
                }
            }// END-FIXED AMOUNT
            //NON FIXED AMOUNT
            else {
                if (!$scope.amountValueForNonFixed) {
                    msg += 'Amount.';
                }
            }//END-NON FIXED AMOUNT
            return msg.trim().replace(/,$/, " ");
        }
        $scope.addCartItem = function () {
            if (($scope.totalAmount != 0 && !$scope.totalAmount) && !$scope.selectedDz) {
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
            var obj = new Object();
            if ($scope.selectedDz) {
                obj.program = $scope.selectedDz;
                if (!validation($scope.selectedDz)) {
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
                    return;
                }
            }
            obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
            obj.programSubCategory = vm.selectedCategory;
            obj.isRecurring = $scope.selectedRecurring;
            obj.donationDuration = $scope.selectedDonationDuration;

            if ($scope.selectedRecurring) {
                var startDate = new Date();
                var endDate = new Date();
                endDate.setMonth(endDate.getMonth() + obj.donationDuration.noOfMonths)

                obj.startDate = "" + (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear() + "";
                obj.endDate = "" + (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear() + "";
                ;
                obj.paymentDate = $scope.paymentDate;
                obj.paymentType = "Recurring";
            } else {
                obj.paymentType = "One Time";
            }
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
            if ($scope.user.roles.length > 0) {
                obj.students = $scope.user.roles;
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
                    return;
                }
            }
            obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            cartService.addCartItem(obj).then(function (res) {
                vm.clearCalculator();
                $rootScope.$broadcast('getCartCounter');
                var note = new Noty({
                    text: $translate.instant('Items added successfully')
                })
                note.setTimeout(2600);
                note.show();
            });
        }

        function clearCalculator() {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[2]; //arr.length - 1;
            if (id != "" && id != null && id != undefined) {
                $scope.getDaralZahraDetail();
            }
            $scope.selectedDz = undefined;
            $scope.selectedDonationDuration = undefined;
            $scope.totalAmount = undefined;
            $scope.user.roles = [];
            vm.projectCalculator = "";
            let calculator = $compile(vm.projectCalculator)($scope);
            angular.element(document.getElementById("dzCalculator")).html("").append(calculator);
        }

        $scope.donate = function () {
            // var validationMsg = $scope.validation();
            // if (validationMsg == '') {
            var obj = new Object();
            if (($scope.totalAmount != 0 && !$scope.totalAmount) && !$scope.selectedDz) {
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
            if ($scope.selectedDz) {
                obj.program = $scope.selectedDz;
                if (!validation($scope.selectedDz)) {
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
                    return;
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
                    return;
                }
            }
            obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
            obj.programSubCategory = vm.selectedCategory;
            obj.isRecurring = $scope.selectedRecurring;
            obj.donationDuration = $scope.selectedDonationDuration;
            if ($scope.selectedRecurring) {
                var startDate = new Date();
                var endDate = new Date();
                endDate.setMonth(endDate.getMonth() + obj.donationDuration.noOfMonths)

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

            if ($scope.user.roles.length > 0) {
                obj.students = $scope.user.roles;
            }
            // obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            // localStorage.setItem("cart", null);
            // localStorage.setItem("cart", JSON.stringify(obj));
            // // cartService.addCartItem(obj).then(function (res) {
            // // $rootScope.$broadcast('getCartCounter');
            // if ($rootScope.isLogin) {
            //     $window.location.href = "/#/checkout";
            // } else {
            //     jQuery('#globalLoginModal').modal('show');
            // }
            // // });
            // // }
            obj.currency = JSON.parse(sessionStorage.getItem("currency"));
            cartService.addCartItem(obj).then(function () {
                //   if ($rootScope.isLogin) {
                vm.clearCalculator();
                $rootScope.$broadcast("getCartCounter");
                $state.go("cart");
                //   } else {
                //     jQuery("#globalLoginModal").modal("show");
                //   }
            });

        }

        $scope.clearOrphans = function () {
            $scope.user.roles = [];
        }

        function validation(program) {

            if (program.donationProcess[0].isRecurring) {
                //for fixed amount.
                if ($scope.selectedRecurring === undefined || $scope.selectedRecurring === "") {
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
                //return true;
            }
            if (vm.hasDonationDuration && !$scope.selectedDonationDuration) {
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
            if (program.donationProcess[0].isSyed) {
                if ($scope.selectedDescend.toString() == null || $scope.selectedDescend.toString() == undefined || $scope.selectedDescend.toString() == '') {
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
                //return true;
            }
            if (program.donationProcess[0].isCount) {
                if (!$scope.selectedCount) {
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
                    }).then(function () {
                        //window.location = "#/orphans";
                    });
                    return false;
                }
                //return true;
            }
            if (!program.donationProcess[0].isAmount) {
                if (!$scope.totalAmount) {
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
                //return true;
            }
            return true;
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
                //$scope.amountValue = pageVM.amount;
            }
            if ($scope.selectedDonationDuration.donationDurationName == $translate.instant("HALF YEARLY")) {
                $scope.DurationName = "Half Yearly"
                if (obj.currency.title == "USD") {
                    $scope.amountValue = Math.round(vm.amount / 2).toFixed(2);
                } else {
                    $scope.amountValue = Math.round(obj.currency.rateExchange * vm.amount / 2).toFixed(2);
                }
            }

            $scope.countChange();
        }
    }
})()