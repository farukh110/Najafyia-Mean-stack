(function () {
    angular.module("mainApp").controller("projectController", ProjectController);

    function ProjectController(
        $scope,
        $filter,
        $rootScope,
        $window,
        $sce,
        $state,
        $compile,
        $location,
        utilService,
        $translate,
        projectService,
        programTypeService,
        donationProcessService,
        multipartForm,
        loginService,
        cartService,
        currencyService,
        MetaTagsService
    ) {
        var vm = this;
        vm.getProjects = getProjects;
        vm.deleteProject = deleteProject;
        vm.saveContent = saveContent;
        vm.printContent = printContent;
        vm.validation = validation;
        vm.updateProject = updateProject;
        vm.getProjectForUpdate = getProjectForUpdate;
        // vm.previewImage = previewImage;
        vm.getProjectDetail = getProjectDetail;
        vm.donationProcess = {};
        vm.projectCategoryName = "";
        vm.categoryDescription = "";
        vm.addProject = addProject;
        vm.projectCategories = [];
        vm.donationDurations = [];
        vm.getCategories = getCategories;
        vm.selectedCategory = [];
        vm.selectedDonationDurations = [];
        vm.imageUrl = "";
        vm.file = {};
        vm.programType = {};
        vm.subCategories = [];

        vm.getCalculator = getCalculator;
        vm.getActiveProjects = getActiveProjects;
        vm.count = [(min = 0), (max = 0), (interval = 0)];
        vm.validCounter = true;
        vm.getProgramType = getProgramType;
        vm.addSubCategoryToList = addSubCategoryToList;
        vm.addOrRemoveSubcategory = addOrRemoveSubcategory;
        vm.addorRemoveDonationDuration = addorRemoveDonationDuration;
        vm.selectCalculator = selectCalculator;
        vm.addCartItem = addCartItem;
        vm.donate = donate;
        vm.checkSubCategory = checkSubCategory;
        vm.healthCareWithWheelChair = false;
        vm.healthCareWithGeneralFund = false;
        vm.clearCalculator = clearCalculator;
        $scope.isDetail = false;
        vm.showComments = showComments;
        vm.description = {
            para1: "",
            para2: ""
        };
        $scope.paymentMethod = $translate.instant('ONETIME');
        vm.isRecurring = false;
        vm.selectedRecurring = false;
        // for arabic header in print view
        let lang = localStorage.getItem('lang');
        if (lang == 'ARB') {
            vm.printArb = true
        } else if (lang == 'FRN' || lang == 'ENG') {
            vm.printArb = false
        }

        vm.MobileDevice = false;
        $scope.disableHigherEducation = function () {
            return vm.projectName == $translate.instant("HIGHER EDUCATION LOANS");
        };
        $scope.readmoreText = function (text, lines) {
            return utilService.readmoreText(text, lines);
        };
        if (window.innerWidth < 600) {
            vm.MobileDevice = true;
            // vm.projectDescription.length == 200
        }
        SocialShareKit.init({
            reinitialize: true,
            selector: ".custom-parent .ssk",
            url: "https://www.google.com",
            text: "Share text default"
        });
        // intialize meta tags
        $scope.selectedCurrencySymbol = JSON.parse(
            sessionStorage.getItem("currency")
        ).symbol;

        $scope.isNumberKey = function ($event) {
            let amount = String.fromCharCode(event.which || event.keyCode);
            let pattern = /^[0-9]\d*(\.\d+)?$/;
            if (!pattern.test(amount)) {
                event.preventDefault();
            }
        };

        $scope.message = {}; // contact info goes here

        $scope.sendMail = function () {
            const mail = utilService.sendEmail(
                vm.projectDetail.programName,
                vm.projectDetail.programDescription,
                `projectdetails/${vm.projectDetail.slug}`,
                vm.projectDetail.imageLink
            );
            $window.open(mail);
        };

        //Function to check whether payment is one time or recurring
        function checkSubCategory() {
            vm.isAmount = undefined;
            $scope.amountValueForNonFixed = null;
            if (vm.selectedCategory == null) {
                let calculator = $compile(subCategoryCalculator)($scope);
                angular
                    .element(document.getElementById("subCatCalculator"))
                    .html("")
                    .append("");
                return;
            }
            let selectedCategoryOnChange = vm.selectedCategory;
            $scope.subCategoryName = vm.selectedCategory.programSubCategoryName;
            if (
                selectedCategoryOnChange.programSubCategoryName == "Wheel Chair" ||
                selectedCategoryOnChange.programSubCategoryName == "كرسي متحرك"
            ) {
                jQuery("#amountTextBox").attr("readonly", true);
                jQuery("#amountTextBox").val(vm.amount);
                healthCareWithWheelChair = true;
                $scope.amountValue = vm.amount;
            } else if (
                selectedCategoryOnChange.programSubCategoryName == "General Fund" ||
                selectedCategoryOnChange.programSubCategoryName == "الصندوق العام"
            ) {
                // document.getElementById("amountLabel").innerHTML = "Amount *";
                // document.getElementById("amountTextBox").removeAttribute("readonly");
                // document.getElementById("amountTextBox").value = 0;
                healthCareWithGeneralFund = true;
                $scope.amountValue = "0";
            } else {
                healthCareWithWheelChair = false;
                healthCareWithGeneralFund = false;
            }
            //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% -- Start SubCategory Amount -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            let projectDetail = $scope.selectedProjectName;
            let donationProcess = projectDetail.donationProcess[0];
            var subCategoryCalculator = "";
            //if Amount is Fixed
            if (vm.selectedCategory.isFixedAmount) {
                var obj = new Object();
                obj.currency = JSON.parse(sessionStorage.getItem("currency"));
                if (obj.currency.title == "USD") {
                    let fixedAmount = Math.round(vm.selectedCategory.fixedAmount).toFixed(2);
                    $scope.amountValue = fixedAmount;
                } else {
                    let fixedAmount =
                        obj.currency.rateExchange * vm.selectedCategory.fixedAmount;
                    $scope.amountValue = currencyService.currencyConversionFormula(
                        fixedAmount
                    );
                }

                vm.isAmount = donationProcess.isAmount;
                if (donationProcess.isRecurring) {
                    subCategoryCalculator += "<div class='form-group'>";
                    subCategoryCalculator +=
                        " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                    // subCategoryCalculator +=
                    //     "<select  class='form-control'  ng-model='projectVM.selectedRecurring' data-ng-change='checkPaymentMethod(projectVM.selectedRecurring);countChange();'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
                    subCategoryCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                    subCategoryCalculator += "</div>";
                }
                if (
                    donationProcess.isRecurring &&
                    projectDetail.programName !=
                    $translate.instant("Higher Education Loans".toUpperCase())
                ) {
                    vm.donationDuration = donationProcess.donationDuration;
                    subCategoryCalculator += "<div class='form-group' >";
                    subCategoryCalculator +=
                        " <label >{{ 'DURATION' | translate }}</label>";
                    subCategoryCalculator +=
                        "<select class='form-control' data-ng-change='durationForOneTimeAndRecurring();' ng-model='projectVM.selectedDonationDuration'  ng-options='x.donationDurationName for x in projectVM.donationDuration'>";
                    subCategoryCalculator += "</select>";
                    subCategoryCalculator += "</div>";
                    // jQuery("#project-calculator").append(vm.projectCalculator);
                }

                subCategoryCalculator += "<div class='form-group'>";
                subCategoryCalculator +=
                    " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                subCategoryCalculator += " <label id='fixedAmountValue' ></label>";
                subCategoryCalculator += "<div class='input-group'>";
                subCategoryCalculator += "<div class='input-icon'>";
                subCategoryCalculator +=
                    "<input type='text' min='0' ng-keypress='isNumberKey($event)'  id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' class='form-control' ng-disabled='projectVM.isAmount' />";
                subCategoryCalculator +=
                    "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
                subCategoryCalculator += "</div>";
                subCategoryCalculator += "</div>";
                subCategoryCalculator += "</div>";

                vm.isCount = donationProcess.isCount;
                if (donationProcess.isCount) {
                    subCategoryCalculator += "<div class='form-group'>";
                    subCategoryCalculator += " <label >{{ 'COUNT' | translate }}</label>";

                    subCategoryCalculator +=
                        "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
                    subCategoryCalculator +=
                        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                    let min = Math.round(donationProcess.countMin);
                    let max = Math.round(donationProcess.countMax);
                    var interval = Math.round(donationProcess.interval);
                    for (let i = min; i <= max; i += interval) {
                        subCategoryCalculator +=
                            "      <option ng-value='" + i + "'>" + i + "</option>";
                    }
                    subCategoryCalculator += "</select>";
                    subCategoryCalculator += "</div>";
                }

                subCategoryCalculator += "<div class='form-group'>";
                // subCategoryCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}</br><span style='color: limegreen ; font-size: 16px;' ng-show='projectVM.selectedRecurring && totalAmount > 0'>  {{totalAmountPerMonth}} / {{(projectVM.selectedProject.programName == 'Higher Education Loans' || projectVM.selectedProject.programName == 'Études supérieures' || projectVM.selectedProject.programName == 'الدراست العليا') ? 'Semester' : ''}}{{ 'MONTH' | translate }}</span></label>";
                subCategoryCalculator +=
                    " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                subCategoryCalculator += " <div class='input-group'>";
                //subCategoryCalculator += "<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                //subCategoryCalculator += " <i class=''>{{selectedCurrencySymbol}}</i>";
                //subCategoryCalculator += "</div>";
                subCategoryCalculator +=
                    " <div class='input-icon'><input type='text' min='0' ng-keypress='isNumberKey($event)' data-ng-disabled='projectVM.isCount' class='form-control addsign' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>";
                subCategoryCalculator += "</div>";
                subCategoryCalculator += "</div>";

                // subCategoryCalculator += "<div class='form-group'>";
                // subCategoryCalculator += "<span style='color: green ; font-size: 16px;' ng-show='projectVM.selectedRecurring && totalAmount > 0'>{{vm.selectedDonationDuration.donationDurationName == \"Half Yearly\" ? totalAmount/6 : totalAmount/12}}/per month</span>"
                // subCategoryCalculator += "</div>";
                // subCategoryCalculator += "<span ng-show='donationProcess.isRecurring'>{{$scope.amountValue}}</span>";

                subCategoryCalculator +=
                    "<div class='form-group' ng-show='showComment'>";
                subCategoryCalculator +=
                    " <label><span class='commentTxt'>{{projectComment}}</span></label>";
                subCategoryCalculator += "</div>";

                subCategoryCalculator += "<div class='row'>";
                subCategoryCalculator +=
                    "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                subCategoryCalculator +=
                    "       <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='projectVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                subCategoryCalculator += "   </div>";
                subCategoryCalculator +=
                    "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                subCategoryCalculator +=
                    "       <button class='grop-btn-donate  grop-btn_submit' data-ng-click='projectVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
                subCategoryCalculator += "   </div>";
                subCategoryCalculator += "</div>";
            } else {
                if (donationProcess.isRecurring) {
                    subCategoryCalculator += "<div class='form-group'>";
                    subCategoryCalculator +=
                        " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                    // subCategoryCalculator +=
                    //     "<select  class='form-control' ng-change='durationForRecurring();countChange();' ng-model='projectVM.selectedRecurring'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{ 'ONETIME' | translate }}</option><option ng-value='true'>{{ 'RECURRING' | translate }}</option></select>";
                    subCategoryCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                    subCategoryCalculator += "</div>";
                }
                if (donationProcess.isRecurring) {
                    subCategoryCalculator = donationProcess.donationDuration;
                    subCategoryCalculator +=
                        "<div class='form-group' data-ng-show='projectVM.selectedRecurring==true'>";
                    subCategoryCalculator +=
                        " <label >{{ 'DURATION' | translate }}</label>";
                    subCategoryCalculator +=
                        "<select class='form-control' ng-model='projectVM.selectedDonationDuration'  ng-options='x.donationDurationName for x in projectVM.donationDuration'>";
                    subCategoryCalculator += "</select>";
                    subCategoryCalculator += "</div>";
                    // jQuery("#project-calculator").append(vm.projectCalculator);
                }
                vm.isCount = donationProcess.isCount;
                if (donationProcess.isCount) {
                    subCategoryCalculator += "<div class='form-group'>";
                    subCategoryCalculator +=
                        " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                    subCategoryCalculator += " <label id='fixedAmountValue' ></label>";
                    subCategoryCalculator +=
                        "<input type='text' min='0' ng-keypress='isNumberKey($event)' autocomplete='off'  id='amountTextBox' ng-keyup='countChangeForNonFixed()' data-ng-model='amountValueForNonFixed'  numbers-only class='form-control' ng-disabled='projectVM.isAmount' />";
                    subCategoryCalculator += "</div>";

                    subCategoryCalculator += "<div class='form-group'>";
                    subCategoryCalculator += " <label >{{ 'COUNT' | translate }}</label>";

                    subCategoryCalculator +=
                        "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeForNonFixed()'>";
                    subCategoryCalculator +=
                        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                    let min = Math.round(donationProcess.countMin);
                    let max = Math.round(donationProcess.countMax);
                    var interval = Math.round(donationProcess.interval);
                    for (let i = min; i <= max; i += interval) {
                        subCategoryCalculator +=
                            "      <option ng-value='" + i + "'>" + i + "</option>";
                    }
                    subCategoryCalculator += "</select>";
                    subCategoryCalculator += "</div>";

                    subCategoryCalculator += "<div class='form-group'>";
                    subCategoryCalculator +=
                        " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                    subCategoryCalculator += "<div class='input-group'>";
                    //subCategoryCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                    //subCategoryCalculator +="<i class=''>{{selectedCurrencySymbol}}</i>";
                    //subCategoryCalculator +=" </div>";
                    subCategoryCalculator +=
                        "<div class='input-icon'><input type='text'min='0' ng-keypress='isNumberKey($event)' data-ng-disabled='projectVM.isCount' class='form-control addsign' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>";
                    subCategoryCalculator += "</div>";
                    subCategoryCalculator += "</div>";
                } else {
                    subCategoryCalculator += "<div class='form-group'>";
                    subCategoryCalculator +=
                        " <label >{{ 'AMOUNT' | translate }}</label>";
                    subCategoryCalculator += "<div class='input-group'>";
                    //subCategoryCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                    //subCategoryCalculator +="<i class=''>{{selectedCurrencySymbol}}</i>";
                    //subCategoryCalculator +=" </div>";
                    subCategoryCalculator +=
                        "<div class='input-icon'><input type='text' min='0' ng-keypress='isNumberKey($event)' data-ng-disabled='projectVM.isCount' class='form-control addsign' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>";
                    subCategoryCalculator += "</div>";
                    subCategoryCalculator += "</div>";
                }

                subCategoryCalculator +=
                    "<div class='form-group' ng-show='showComment'>";
                subCategoryCalculator +=
                    " <label><span class='commentTxt'>{{projectComment}}</span></label>";
                subCategoryCalculator += "</div>";

                subCategoryCalculator += "<div class='row'>";
                subCategoryCalculator +=
                    "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                subCategoryCalculator +=
                    "       <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='projectVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                subCategoryCalculator += "   </div>";
                subCategoryCalculator +=
                    "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                subCategoryCalculator +=
                    "       <button class='grop-btn-donate  grop-btn_submit' data-ng-click='projectVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
                subCategoryCalculator += "   </div>";
                subCategoryCalculator += "</div>";
            }

            //vm.projectCalculator += subCategoryCalculator;
            let calculator = $compile(subCategoryCalculator)($scope);
            angular
                .element(document.getElementById("subCatCalculator"))
                .html("")
                .append(calculator);

            //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% -- End SubCategory Amount -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        }

        $scope.checkPaymentMethod = function (paymentMethod) {
            if (
                paymentMethod === "" ||
                paymentMethod === undefined ||
                paymentMethod === null
            ) {
                $scope.paymentMethod = undefined;
                return;
            }
            if (!paymentMethod) {
                if (localStorage.getItem("lang") == "ARB") {
                    $scope.paymentMethod = "مرة واحدة";
                } else if (localStorage.getItem("lang") == "FRN") {
                    $scope.paymentMethod = "Une fois";
                } else if (localStorage.getItem("lang") == "ENG") {
                    $scope.paymentMethod = "One Time";
                }
            } else if (paymentMethod) {
                if (localStorage.getItem("lang") == "ARB") {
                    $scope.paymentMethod = "متكرر";
                } else if (localStorage.getItem("lang") == "FRN") {
                    $scope.paymentMethod = "Périodique";
                } else if (localStorage.getItem("lang") == "ENG") {
                    $scope.paymentMethod = "Recurring";
                }
            }
        };

        function showComments() {
            var obj = new Object();
            var currencySymbol = JSON.parse(sessionStorage.getItem("currency"))
                .symbol;
            if (vm.projectDetail) {
                obj.program = vm.projectDetail;
            } else {
                obj.program = vm.selectedProject;
            }
            $scope.totalAmountPerMonth = isNaN($scope.totalAmountPerMonth)
                ? "0.00"
                : $scope.totalAmountPerMonth;
            if (
                obj.program &&
                obj.program.programName &&
                obj.program.programName ==
                $translate.instant("Higher Education Loans".toUpperCase())
            ) {
                if (
                    $scope.paymentMethod == "Recurring" ||
                    $scope.paymentMethod == "Périodique" ||
                    $scope.paymentMethod == "متكرر"
                ) {
                    $scope.showComment = true;
                    $scope.masterPaymentDate = new Date(new Date().setMonth(new Date().getMonth() + 18))
                    $scope.phdPaymentDate = new Date(new Date().setMonth(new Date().getMonth() + 24))

                    if (
                        $scope.subCategoryName == "Masters (2 Years)" ||
                        $scope.subCategoryName == "الماجستير (2 سنوات)" ||
                        $scope.subCategoryName == "Maîtrise (2 Ans)"
                    ) {
                        let language = localStorage.getItem("lang");

                        if (language == "ARB") {
                            // if($scope.halfYearlyDate.getDate() <=9 && ($scope.halfYearlyDate.getMonth())<=9){
                            //     var getDate = '0'+$scope.halfYearlyDate.getDate();
                            //     var getMonth = '0'+($scope.halfYearlyDate.getMonth())
                            // }
                            $scope.projectComment =
                                " يرجى ملاحظة أنه سيتم خصم " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                "  كل ستة أشهرحتى " +
                                $filter("date")($scope.masterPaymentDate, "yyyy-MM-dd");
                            // + '-' + getMonth
                            // + '-' + getDate
                        } else if (language == "FRN") {
                            $scope.projectComment =
                                "Veuillez noter que les " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                " seront déduit tous les (06) mois jusqu'au " +
                                $filter("date")($scope.masterPaymentDate, "dd-MM-yyyy");
                            +".";
                        } else {
                            $scope.projectComment =
                                "Please note that " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                "  will be deducted every (06) months until " +
                                $filter("date")($scope.masterPaymentDate, "dd-MM-yyyy") +
                                ".";
                        }
                    } else if (
                        $scope.subCategoryName == "PhD (2.5 Years)" ||
                        $scope.subCategoryName == "الدكتوراه (2.5 سنة)" ||
                        $scope.subCategoryName == "Doctorat (2.5 Ans)"
                    ) {
                        let language = localStorage.getItem("lang");

                        if (language == "ARB") {
                            // if($scope.halfYearlyDate.getDate() <=9 && ($scope.halfYearlyDate.getMonth())<=9){
                            //     var getDate = '0'+$scope.halfYearlyDate.getDate();
                            //     var getMonth = '0'+($scope.halfYearlyDate.getMonth())
                            // }
                            $scope.projectComment =
                                " يرجى ملاحظة أنه سيتم خصم " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                "  كل ستة أشهرحتى " +
                                $filter("date")($scope.phdPaymentDate, "yyyy-MM-dd");
                            // + '-' + getMonth
                            // + '-' + getDate
                        } else if (language == "FRN") {
                            $scope.projectComment =
                                "Veuillez noter que les " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                " seront déduit tous les (06) mois jusqu'au " +
                                $filter("date")($scope.phdPaymentDate, "dd-MM-yyyy") +
                                ".";
                        } else {
                            $scope.projectComment =
                                "Please note that " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                "  will be deducted every (06) months until " +
                                $filter("date")($scope.phdPaymentDate, "dd-MM-yyyy") +
                                ".";
                        }
                    }
                } else {
                    $scope.projectComment = "";
                }
            } else if (
                obj.program &&
                obj.program.programName &&
                (obj.program.programName == "Hawzah Students" ||
                    obj.program.programName == "طلاب الحوزة" ||
                    obj.program.programName == "Étudiants hawza")
            ) {
                if (
                    $scope.paymentMethod == "Recurring" ||
                    $scope.paymentMethod == "Périodique" ||
                    $scope.paymentMethod == "متكرر"
                ) {
                    $scope.showComment = true;
                    $scope.halfYearlyDate = new Date(new Date().setMonth(new Date().getMonth() + 5));
                    $scope.yearlyDate = new Date(new Date().setMonth(new Date().getMonth() + 11));

                    if (
                        $scope.DurationName == "Half Yearly" ||
                        $scope.DurationName == "نصف سنوي" ||
                        $scope.DurationName == "Semestriel"
                    ) {
                        let language = localStorage.getItem("lang");

                        if (language == "ARB") {
                            $scope.projectComment =
                                " يرجى ملاحظة أنه سيتم خصم " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                "  شهريًا حتى " +
                                $filter("date")($scope.halfYearlyDate, "yyyy-MM-dd");
                            // + '-' + ($scope.halfYearlyDate.getMonth())
                            // + '-' + $scope.halfYearlyDate.getDate()
                        } else if (language == "FRN") {
                            $scope.projectComment =
                                "Veuillez noter que le paiement de " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                " sera déduit mensuellement jusqu'au " +
                                $filter("date")($scope.halfYearlyDate, "dd-MM-yyyy") +
                                ".";
                        } else {
                            $scope.projectComment =
                                "Please note that " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                " will be deducted monthly until " +
                                $filter("date")($scope.halfYearlyDate, "dd-MM-yyyy") +
                                ".";
                        }
                    } else if (
                        $scope.DurationName == "Yearly" ||
                        $scope.DurationName == "سنوي" ||
                        $scope.DurationName == "Annuel"
                    ) {
                        let language = localStorage.getItem("lang");
                        //   if($scope.yearlyDate.getMonth() <= 9 && $scope.yearlyDate.getDate()){
                        //     var getMonth = '0'+$scope.yearlyDate.getMonth();
                        //     var getDate = '0'+$scope.yearlyDate.getDate()
                        //   }
                        if (language == "ARB") {
                            $scope.projectComment =
                                " يرجى ملاحظة أنه سيتم خصم " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                "  شهريًا حتى " +
                                $filter("date")($scope.yearlyDate, "yyyy-MM-dd");
                            // + '-' + ($scope.yearlyDate.getMonth())
                            // + '-' + $scope.yearlyDate.getDate()
                        } else if (language == "FRN") {
                            $scope.projectComment =
                                "Veuillez noter que le paiement de " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                " sera déduit mensuellement jusqu'au " +
                                $filter("date")($scope.yearlyDate, "dd-MM-yyyy") +
                                ".";
                        } else {
                            $scope.projectComment =
                                "Please note that " +
                                currencySymbol +
                                $scope.totalAmountPerMonth +
                                " will be deducted monthly until " +
                                $filter("date")($scope.yearlyDate, "dd-MM-yyyy") +
                                ".";
                        }
                    }
                } else {
                    $scope.projectComment = "";
                }
            }

            if (
                $scope.projectComment == "" ||
                $scope.projectComment == null ||
                $scope.projectComment == undefined
            ) {
                $scope.showComment = false;
            } else {
                $scope.showComment = true;
            }
        }

        function addCartItem() {
            if (vm.clickedCart) return;
            vm.clickedCart = true;
            var obj = new Object();
            if (vm.projectDetail) {
                obj.program = vm.projectDetail;
                if (!validation(vm.projectDetail)) {
                    return vm.clickedCart = false;
                }
            } else {
                obj.program = vm.selectedProject;
                if (!validation(vm.selectedProject)) {
                    return vm.clickedCart = false;
                }
            }
            if (obj.program.donationProcess[0].isCount) {
                obj.count = $scope.selectedCount;
            }
            if (obj.program.donationProcess[0].isMinimumAmount) {
                let minimiumAmountForDonation =
                    obj.program.donationProcess[0].minimumAmount;
                if ($scope.totalAmount < minimiumAmountForDonation) {
                    let minAmountmsg;
                    let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
                    if (localStorage.getItem("lang") == "ARB") {
                        minAmountmsg =
                            currency.concat(minimiumAmountForDonation.toString()) +
                            "الحد الأدنى للمساهمة في هذه الفئة هو";
                    } else if (localStorage.getItem("lang") == "FRN") {
                        minAmountmsg =
                            "Le montant minimum pour cette catégorie est " +
                            currency.concat(minimiumAmountForDonation.toString());
                    } else {
                        minAmountmsg =
                            "The minimum donation amount for this category is " +
                            currency.concat(minimiumAmountForDonation.toString());
                    }
                    swal({
                        title: minAmountmsg,
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
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
                    if (localStorage.getItem("lang") == "ARB") {
                        validateMsg = ".هذه الفئة غير متوفرة حاليا";
                    } else if (localStorage.getItem("lang") == "FRN") {
                        validateMsg = "Cette catégorie est indisponible pour le moment.";
                    } else {
                        validateMsg = "This category is currently unavailable.";
                    }
                    swal({
                        title: validateMsg,
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
                    });
                    return vm.clickedCart = false;
                }
                let durationStartDate =
                    obj.program.donationProcess[0].durationStartDate;
                var newStartDate = new Date(durationStartDate);
                if (newStartDate > todayDate) {
                    let validateMsg = "";
                    if (localStorage.getItem('lang') == 'ARB') {
                        validateMsg = ".هذه الفئة غير متوفرة حاليا";
                    } else if (localStorage.getItem('lang') == 'FRN') {
                        validateMsg = "Cette catégorie est indisponible pour le moment.";
                    } else {
                        validateMsg = "This category is currently unavailable.";
                    }
                    swal({
                        title: validateMsg,
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
                    });
                    return vm.clickedCart = false;
                }
            }
            obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
            obj.programSubCategory = vm.selectedCategory;
            obj.isRecurring = vm.selectedRecurring;
            obj.donationDuration = vm.selectedDonationDuration || $scope.selectedDonationDuration;
            vm.browserLanguage = localStorage.getItem('lang');
            if (vm.selectedRecurring == true) {
                if (vm.browserLanguage == "ARB") {
                    obj.paymentType = "متكرر";
                } else if (vm.browserLanguage == "FRN") {
                    obj.paymentType = "Périodique";
                } else {
                    obj.paymentType = "Recurring";
                }
            } else {
                if (vm.browserLanguage == "ARB") {
                    obj.paymentType = "مرة واحدة";
                } else if (vm.browserLanguage == "FRN") {
                    obj.paymentType = "Une fois";
                } else {
                    obj.paymentType = "One Time";
                }
            }
            obj.currency = JSON.parse(sessionStorage.getItem("currency"));
            if (obj.program && obj.program.slug === "home-renovation") {
                obj.currency.hajjAmount = pageVM.amount;
            }

            cartService.addCartItem(obj).then(function (res) {
                vm.clearCalculator();
                $rootScope.$broadcast("getCartCounter");
                var note = new Noty({
                    text: $translate.instant("Items added successfully")
                });
                note.setTimeout(2600);
                note.show();
                vm.clickedCart = false
            });
        }

        function validation(program) {
            if (program) {
                $scope.totalAmount = Math.round($scope.totalAmount);
                if (!$scope.totalAmount && !$scope.amount) return showError();
                if (program.donationProcess[0].isRecurring) {
                    if (
                        !$scope.paymentMethod &&
                        ((vm.selectedRecurring !== false && !vm.selectedRecurring) ||
                            ($scope.selectedRecurringType !== false &&
                                !$scope.selectedRecurringType))
                    ) {
                        return showError();
                    }
                }
                if (
                    program.donationProcess[0].isMarhomeenName &&
                    !$scope.marhomeenName
                ) {
                    return showError();
                }
                if (
                    $scope.ocassionList &&
                    $scope.ocassionList.length > 0 &&
                    !$scope.selectedOccasion
                ) {
                    return showError();
                }
                if (
                    $scope.ocassionList &&
                    $scope.ocassionList.length > 0 &&
                    !$scope.selectedDua
                ) {
                    return showError();
                }
                if (
                    program.donationProcess[0].isCalendar &&
                    !$scope.calendarForSacrifice
                ) {
                    return showError();
                }
                if (
                    $scope.selectedCategory &&
                    $scope.selectedCategory.programSubCategoryName ===
                    $translate.instant("Zakah") &&
                    $scope.selectedDescend !== false &&
                    !$scope.selectedDescend
                ) {
                    return showError();
                }
                if (
                    $scope.selectedCategory &&
                    $scope.selectedCategory.programSubCategoryName ===
                    $translate.instant("Zakat Al Fitr")
                ) {
                    let zakatAlfitr =
                        program.programSubCategory &&
                        program.programSubCategory.length &&
                        program.programSubCategory.find(
                            p =>
                                p.programSubCategoryName === $translate.instant("Zakat Al Fitr")
                        );
                    if (zakatAlfitr && !$scope.selectedCountryOfResidence) {
                        return showError();
                    }
                    if (
                        zakatAlfitr &&
                        $scope.selectedDescend !== false &&
                        !$scope.selectedDescend
                    ) {
                        return showError();
                    }
                }

                if (
                    program.programName === $translate.instant("KHUMS") &&
                    !$scope.selectedSahm
                ) {
                    return showError();
                }
                if (program.donationProcess[0].donationDuration.length) {
                    if (
                        program.programName !=
                        $translate.instant("Higher Education Loans".toUpperCase()) &&
                        program.programName !==
                        $translate.instant("Sadaqah a Day".toUpperCase())
                    )
                        if (!vm.selectedDonationDuration && !vm.StartDate) {
                            return showError();
                        }
                }
                if (program.donationProcess[0].donationDuration.length) {
                    let sadaqaADay = $translate.instant("Sadaqah a Day".toUpperCase());
                    if (
                        program.programName !=
                        $translate.instant("Higher Education Loans".toUpperCase()) &&
                        program.programName !== sadaqaADay
                    )
                        if (!vm.selectedDonationDuration && !vm.StartDate) {
                            return showError();
                        }
                }

                if (program.programSubCategory.length) {
                    if (vm.selectedCategory != null) {
                        if (!vm.selectedCategory.isFixedAmount) {
                            if (!$scope.amountValueForNonFixed) {
                                return showError();
                            }
                        }
                    }
                } else {
                    if (!program.donationProcess[0].isAmount) {
                        var amount = undefined;
                        var calc = jQuery("#projectCalculator input");
                        if (
                            calc &&
                            calc.length &&
                            calc[0].dataset.ngModel == "totalAmount"
                        ) {
                            amount = Math.round($scope.totalAmount || $scope.amount).toFixed(2);
                        } else {
                            amount =
                                $scope.amountValueForNonFixed ||
                                $scope.amount ||
                                $scope.totalAmount;
                        }
                        if (!amount) {
                            return showError();
                        }
                    }
                }
                if (program.donationProcess[0].isCount) {
                    if (
                        $scope.selectedCategory &&
                        $scope.selectedCategory.programSubCategoryName !==
                        $translate.instant("Zakah")
                    )
                        if (!$scope.selectedCount) {
                            return showError();
                        }
                }
                return true;
            } else showError();
        }

        function printContent(printableArea) {
            window.print();
        }

        function clearCalculator() {
            $scope.totalAmount = undefined;
            $scope.amountValueForNonFixed = undefined;
            vm.isRecurring = false;
            if ($scope.isDetail) {
                getProjectDetail();
            } else {
                vm.selectedProject = undefined;
                vm.projectCalculator = "";
                let calculator = $compile(vm.projectCalculator)($scope);
                angular
                    .element(document.getElementById("projectCalculator"))
                    .html("")
                    .append(calculator);
            }
        }
        function showError() {
            let validateMsg;
            if (localStorage.getItem("lang") == "ARB") {
                validateMsg = "يرجى ملء الحقول الفارغة";
            } else if (localStorage.getItem("lang") == "FRN") {
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
        }
        function donate() {
            if (vm.clickedDonate) return;
            vm.clickedDonate = true;
            var obj = new Object();
            if (vm.projectDetail) {
                obj.program = vm.projectDetail;
                if (!validation(vm.projectDetail)) {
                    return vm.clickedDonate = false;
                }
            } else {
                obj.program = vm.selectedProject;
                if (!validation(obj.program)) {
                    return vm.clickedDonate = false;
                }
            }
            if (obj.program.donationProcess[0].isCount) {
                obj.count = $scope.selectedCount;
            }
            // obj.userId = vm.user.userId;
            // obj.userName = vm.user.username;
            if (obj.program.donationProcess[0].isMinimumAmount) {
                let minimiumAmountForDonation =
                    obj.program.donationProcess[0].minimumAmount;
                if ($scope.totalAmount < minimiumAmountForDonation) {
                    let minAmountmsg;
                    let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
                    if (localStorage.getItem("lang") == "ARB") {
                        minAmountmsg =
                            currency.concat(minimiumAmountForDonation.toString()) +
                            "الحد الأدنى للمساهمة في هذه الفئة هو";
                    } else if (localStorage.getItem("lang") == "FRN") {
                        minAmountmsg =
                            "Le montant minimum pour cette catégorie est " +
                            currency.concat(minimiumAmountForDonation.toString());
                    } else {
                        minAmountmsg =
                            "The minimum donation amount for this category is " +
                            currency.concat(minimiumAmountForDonation.toString());
                    }
                    swal({
                        title: minAmountmsg,
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
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
                    let lang = localStorage.getItem("lang");
                    if (lang == "ARB") {
                        validateMsg = ".هذه الفئة غير متوفرة حاليا";
                    } else if (lang == "FRN") {
                        validateMsg = "Cette catégorie est indisponible pour le moment.";
                    } else {
                        validateMsg = "This category is currently unavailable.";
                    }
                    swal({
                        title: validateMsg,
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
                    });
                    return vm.clickedDonate = false;
                }
            }
            obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
            obj.programSubCategory = vm.selectedCategory;
            obj.isRecurring = vm.selectedRecurring;
            $scope.recurringOrOneTime = vm.selectedRecurring;
            obj.donationDuration = vm.selectedDonationDuration || $scope.selectedDonationDuration;
            if (vm.selectedRecurring == true) {
                if (vm.browserLanguage == "ARB") {
                    obj.paymentType = "متكرر";
                } else if (vm.browserLanguage == "FRN") {
                    obj.paymentType = "Périodique";
                } else {
                    obj.paymentType = "Recurring";
                }
            } else {
                if (vm.browserLanguage == "ARB") {
                    obj.paymentType = "مرة واحدة";
                } else if (vm.browserLanguage == "FRN") {
                    obj.paymentType = "Une fois";
                } else {
                    obj.paymentType = "One Time";
                }
            }
            // obj.currency = JSON.parse(sessionStorage.getItem("currency"));
            // localStorage.setItem("cart", null);
            // localStorage.setItem("cart", JSON.stringify(obj));
            // if ($rootScope.isLogin) {
            //     $window.location.href = "/#/checkout";
            // } else {
            //     jQuery("#globalLoginModal").modal("show");
            // }

            obj.currency = JSON.parse(sessionStorage.getItem("currency"));
            if (obj.program && obj.program.slug === "home-renovation") {
                obj.currency.hajjAmount = pageVM.amount;
            }
            cartService.addCartItem(obj).then(function () {
                //   if ($rootScope.isLogin) {
                $rootScope.$broadcast("getCartCounter");
                $state.go("cart");
                vm.clickedDonate = false;
                //   } else {
                //     jQuery("#globalLoginModal").modal("show");
                //   }
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

        function selectCalculator() {
            $scope.showComment = false;
            $scope.projectComment = "";
            $scope.totalAmount = undefined;
            $scope.amountValue = null;
            vm.isRecurring = undefined;
            vm.selectedDonationDuration = null;
            let selectedProject = vm.selectedProject;
            $scope.selectedProjectName = selectedProject;
            $scope.hideDummy = true;
            getCalculator(selectedProject);
        }

        $scope.countChange = function () {
            var obj = new Object();
            if (vm.projectDetail) {
                obj.program = vm.projectDetail;
            } else {
                obj.program = vm.selectedProject;
            }
            //$scope.selectedCount = ($scope.selectedCount);
            if (
                obj.program &&
                obj.program.programName &&
                obj.program.programName ==
                $translate.instant("Higher Education Loans".toUpperCase())
            ) {
                if (
                    $scope.subCategoryName == "Masters (2 Years)" ||
                    $scope.subCategoryName == "الماجستير (2 سنوات)" ||
                    $scope.subCategoryName == "Maîtrise (2 Ans)"
                ) {
                    if (
                        $scope.paymentMethod == "Recurring" ||
                        $scope.paymentMethod == "Périodique" ||
                        $scope.paymentMethod == "متكرر"
                    ) {
                        $scope.totalAmountPerMonth = Math.round(
                            (($scope.selectedCount || 0) * $scope.amountValue) /
                            4
                        ).toFixed(2);
                        $scope.totalAmount = Math.round(
                            (($scope.selectedCount || 0) * $scope.amountValue) /
                            4
                        ).toFixed(2);
                    }
                    if (
                        $scope.paymentMethod == "One Time" ||
                        $scope.paymentMethod == "Une fois" ||
                        $scope.paymentMethod == "مرة واحدة"
                    ) {
                        $scope.totalAmountPerMonth =
                            ($scope.selectedCount || 0) * $scope.amountValue;
                        $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                    }
                }
                if (
                    $scope.subCategoryName == "PhD (2.5 Years)" ||
                    $scope.subCategoryName == "الدكتوراه (2.5 سنة)" ||
                    $scope.subCategoryName == "Doctorat (2.5 Ans)"
                ) {
                    if (
                        $scope.paymentMethod == "Recurring" ||
                        $scope.paymentMethod == "Périodique" ||
                        $scope.paymentMethod == "متكرر"
                    ) {
                        $scope.totalAmountPerMonth = Math.round(
                            (($scope.selectedCount || 0) * $scope.amountValue) /
                            5
                        ).toFixed(2);
                        $scope.totalAmount = Math.round(
                            (($scope.selectedCount || 0) * $scope.amountValue) /
                            5
                        ).toFixed(2);
                    }
                    if (
                        $scope.paymentMethod == "One Time" ||
                        $scope.paymentMethod == "Une fois" ||
                        $scope.paymentMethod == "مرة واحدة"
                    ) {
                        $scope.totalAmountPerMonth =
                            Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                        $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                    }
                }
            } else if (
                obj.program &&
                obj.program.programName &&
                (obj.program.programName == "Hawzah Students" ||
                    obj.program.programName == "طلاب الحوزة" ||
                    obj.program.programName == "Étudiants hawza")
            ) {
                if (
                    ($scope.paymentMethod == "Recurring" ||
                        $scope.paymentMethod == "Périodique" ||
                        $scope.paymentMethod == "متكرر") &&
                    ($scope.DurationName == "Half Yearly" ||
                        $scope.DurationName == "نصف سنوي" ||
                        $scope.DurationName == "Semestriel")
                ) {
                    $scope.totalAmountPerMonth = Math.round(
                        (($scope.selectedCount || 0) * $scope.amountValue) /
                        6
                    ).toFixed(2);
                    $scope.totalAmount = Math.round(
                        (($scope.selectedCount || 0) * $scope.amountValue) /
                        6
                    ).toFixed(2);
                }
                if (
                    ($scope.paymentMethod == "One Time" ||
                        $scope.paymentMethod == "Une fois" ||
                        $scope.paymentMethod == "مرة واحدة") &&
                    ($scope.DurationName == "Half Yearly" ||
                        $scope.DurationName == "نصف سنوي" ||
                        $scope.DurationName == "Semestriel")
                ) {
                    $scope.totalAmountPerMonth = (
                        (($scope.selectedCount || 0) * $scope.amountValue) /
                        2
                    ).toFixed(2);
                    $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                }
                if (
                    ($scope.paymentMethod == "One Time" ||
                        $scope.paymentMethod == "Une fois" ||
                        $scope.paymentMethod == "مرة واحدة") &&
                    ($scope.DurationName == "Yearly" ||
                        $scope.DurationName == "سنوي" ||
                        $scope.DurationName == "Annuel")
                ) {
                    $scope.totalAmountPerMonth =
                        Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                    $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
                }
                if (
                    ($scope.paymentMethod == "Recurring" ||
                        $scope.paymentMethod == "Périodique" ||
                        $scope.paymentMethod == "متكرر") &&
                    ($scope.DurationName == "Yearly" ||
                        $scope.DurationName == "سنوي" ||
                        $scope.DurationName == "Annuel")
                ) {
                    $scope.totalAmountPerMonth = Math.round(
                        (($scope.selectedCount || 0) * $scope.amountValue) /
                        12
                    ).toFixed(2);
                    $scope.totalAmount = Math.round(
                        (($scope.selectedCount || 0) * $scope.amountValue) /
                        12
                    ).toFixed(2);
                }
            } else {
                $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
            }
            $scope.totalAmountPerMonth = isNaN($scope.totalAmountPerMonth)
                ? "0.00"
                : $scope.totalAmountPerMonth;
            $scope.totalAmount = isNaN($scope.totalAmount) ? "0.00" : $scope.totalAmount;

            vm.showComments();
        };
        $scope.countChangeForNonFixed = function () {
            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValueForNonFixed).toFixed(2);
        };
        $scope.durationForRecurring = function () {
            if (vm.selectedRecurring == true) {
                $scope.amountValue = 6 * $scope.amountValue;
            } else {
                $scope.amountValue = vm.amount;
            }
        };
        $scope.durationForOneTimeAndRecurring = function () {
            if (
                vm.selectedDonationDuration &&
                (vm.selectedDonationDuration.donationDurationName == "Yearly" ||
                    vm.selectedDonationDuration.donationDurationName == "سنوي" ||
                    vm.selectedDonationDuration.donationDurationName == "Annuel")
            ) {
                if (localStorage.getItem("lang") == "ARB") {
                    $scope.DurationName = "سنوي";
                } else if (localStorage.getItem("lang") == "FRN") {
                    $scope.DurationName = "Annuel";
                } else {
                    $scope.DurationName = "Yearly";
                }
                $scope.amountValue = vm.amount;
            }
            if (
                vm.selectedDonationDuration &&
                (vm.selectedDonationDuration.donationDurationName == "Half Yearly" ||
                    vm.selectedDonationDuration.donationDurationName == "نصف سنوي" ||
                    vm.selectedDonationDuration.donationDurationName == "Semestriel")
            ) {
                if (localStorage.getItem("lang") == "ARB") {
                    $scope.DurationName = "نصف سنوي";
                } else if (localStorage.getItem("lang") == "FRN") {
                    $scope.DurationName = "Semestriel";
                } else {
                    $scope.DurationName = "Half Yearly";
                }

                $scope.amountValue = vm.amount / 2;
            }

            if (vm.selectedRecurring == null) {
                $scope.amountValue = vm.amount;
            }
            $scope.countChange();
        };

        function getCalculator(projectDetail) {
            vm.projectCalculator = ``;
            if (!!projectDetail) {
                vm.subCategories = projectDetail.programSubCategory;
                if (
                    vm.subCategories != undefined ? vm.subCategories.length > 0 : false
                ) {
                    vm.projectCalculator += "<div class='form-group'>";
                    vm.projectCalculator +=
                        " <label >{{ 'SUB CATEGORY' | translate }}</label>";
                    vm.projectCalculator +=
                        "<select  class='form-control' ng-model='projectVM.selectedCategory' ng-change='projectVM.checkSubCategory();countChange();' ng-options='x.programSubCategoryName for x in projectVM.subCategories'>";
                    vm.projectCalculator +=
                        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                    vm.projectCalculator += "</select>";
                    vm.projectCalculator += "</div>";

                    vm.projectCalculator += "<div id='subCatCalculator'>";
                    vm.projectCalculator += "</div>";

                    let calculator = $compile(vm.projectCalculator)($scope);
                    angular
                        .element(document.getElementById("projectCalculator"))
                        .html("")
                        .append(calculator);
                    vm.selectedCategory = undefined;
                    vm.selectedRecurring = undefined;
                    vm.selectedDonationDuration = undefined;

                    return;
                }
                let donationProcess = projectDetail && projectDetail.donationProcess[0];
                //if Amount is Fixed
                if (donationProcess.isAmount) {
                    var obj = new Object();
                    obj.currency = JSON.parse(sessionStorage.getItem("currency"));
                    if (obj.currency.title == "USD") {
                        let fixedAmount = Math.round(donationProcess.amount).toFixed(2);
                        $scope.amountValue =
                            donationProcess.donationDuration.length < 1 ? fixedAmount : "";
                        vm.amount = Math.round(donationProcess.amount).toFixed(2);
                    } else {
                        let fixedAmount =
                            obj.currency.rateExchange * donationProcess.amount;
                        $scope.amountValue = currencyService.currencyConversionFormula(
                            donationProcess.donationDuration.length < 1 ? fixedAmount : 0
                        );
                        vm.amount = Math.round(currencyService.currencyConversionFormula(
                            obj.currency.rateExchange * donationProcess.amount
                        )).toFixed(2);
                    }

                    // vm.projectCalculator += "</select>";
                    // vm.projectCalculator += "</div>";

                    vm.isAmount = donationProcess.amount;

                    if (donationProcess.isRecurring) {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator +=
                            " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                        // vm.projectCalculator +=
                        //     "<select  class='form-control'  ng-model='projectVM.selectedRecurring' data-ng-change='checkPaymentMethod(projectVM.selectedRecurring);countChange();'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{ 'ONETIME' | translate }}</option><option ng-value='true'>{{ 'RECURRING' | translate }}</option></select>";
                        vm.projectCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                        vm.projectCalculator += "</div>";
                    }
                    if (
                        donationProcess.isRecurring &&
                        projectDetail.programName !=
                        $translate.instant("Higher Education Loans")
                    ) {
                        vm.donationDuration = donationProcess.donationDuration;
                        vm.projectCalculator += "<div class='form-group' >";
                        vm.projectCalculator +=
                            " <label >{{ 'DURATION' | translate }}</label>";
                        vm.projectCalculator +=
                            "<select class='form-control' data-ng-change='durationForOneTimeAndRecurring()' ng-model='projectVM.selectedDonationDuration'  ng-options='x.donationDurationName for x in projectVM.donationDuration'>";
                        vm.projectCalculator +=
                            "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";
                        // jQuery("#project-calculator").append(vm.projectCalculator);
                    }
                    vm.projectCalculator += "<div class='form-group'>";
                    vm.projectCalculator +=
                        " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                    vm.projectCalculator += " <label id='fixedAmountValue' ></label>";
                    vm.projectCalculator += "<div class='input-group'>";
                    vm.projectCalculator += "<div class='input-icon'>";
                    vm.projectCalculator +=
                        "<input type='text' ng-keypress='isNumberKey($event)' min='0'  id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' class='form-control' ng-disabled='projectVM.isAmount' />";
                    vm.projectCalculator +=
                        "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
                    vm.projectCalculator += "</div>";
                    vm.projectCalculator += "</div>";
                    vm.projectCalculator += "</div>";

                    vm.isCount = donationProcess.isCount;
                    if (donationProcess.isCount) {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator +=
                            " <label >{{ 'COUNT' | translate }}</label>";

                        vm.projectCalculator +=
                            "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
                        vm.projectCalculator +=
                            "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        let min = Math.round(donationProcess.countMin);
                        let max = Math.round(donationProcess.countMax);
                        var interval = Math.round(donationProcess.interval);
                        for (let i = min; i <= max; i += interval) {
                            vm.projectCalculator +=
                                "      <option ng-value='" + i + "'>" + i + "</option>";
                        }
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";
                    }
                    vm.projectCalculator += "<div class='form-group'>";
                    // vm.projectCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}</br><span style='color: limegreen ; font-size: 16px;' ng-show='projectVM.selectedRecurring && totalAmount > 0'>  {{totalAmountPerMonth}} / {{(projectVM.selectedProject.programName == 'Higher Education Loans' || projectVM.selectedProject.programName == 'قرض التعليم العالي') ? 'Semester' : ''}}{{ 'MONTH' | translate }}</span></label>";
                    vm.projectCalculator +=
                        " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                    vm.projectCalculator += " <div class='input-group'>";
                    //vm.projectCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                    //vm.projectCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                    //vm.projectCalculator +="</div>";
                    vm.projectCalculator +=
                        "<div class='input-icon'><input type='text' min='0' ng-keypress='isNumberKey($event)' data-ng-disabled='projectVM.isCount' class='form-control addsign' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>";
                    vm.projectCalculator += "</div>";
                    vm.projectCalculator += "</div>";
                    // vm.projectCalculator += "<div class='form-group'>";
                    // vm.projectCalculator += "<span style='color: green ; font-size: 16px;' ng-show='projectVM.selectedRecurring && totalAmount > 0'>{{vm.selectedDonationDuration.donationDurationName == \"Half Yearly\" ? totalAmount/6 : totalAmount/12}}/per month</span>"
                    // vm.projectCalculator += "</div>";
                    // m.projectCalculator += "<span ng-show='donationProcess.isRecurring'>{{$scope.amountValue}}</span>";

                    vm.projectCalculator +=
                        "<div class='form-group' ng-show='showComment'>";
                    vm.projectCalculator +=
                        " <label><span class='commentTxt'>{{projectComment}}</span></label>";
                    vm.projectCalculator += "</div>";

                    vm.projectCalculator += "<div class='row'>";
                    vm.projectCalculator +=
                        "   <div class='col-md-6 col-xs-6 no-padding text-center'>";
                    vm.projectCalculator +=
                        "       <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='projectVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                    vm.projectCalculator += "   </div>";
                    vm.projectCalculator +=
                        "   <div class='col-md-6 col-xs-6 no-padding text-center'>";
                    vm.projectCalculator +=
                        "       <button class='grop-btn-donate  grop-btn_submit' data-ng-click='projectVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
                    vm.projectCalculator += "   </div>";
                    vm.projectCalculator += "</div>";
                } else {
                    if (donationProcess.isRecurring) {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator +=
                            " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                        // vm.projectCalculator +=
                        //     "<select  class='form-control' ng-change='durationForRecurring();countChange();' ng-model='projectVM.selectedRecurring'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{ 'ONETIME' | translate }}</option><option ng-value='true'>{{ 'RECURRING' | translate }}</option></select>";
                        vm.projectCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
                        vm.projectCalculator += "</div>";
                    }
                    if (donationProcess.isRecurring) {
                        vm.donationDuration = donationProcess.donationDuration;
                        vm.projectCalculator +=
                            "<div class='form-group' data-ng-show='projectVM.selectedRecurring==true'>";
                        vm.projectCalculator +=
                            " <label >{{ 'DURATION' | translate }}</label>";
                        vm.projectCalculator +=
                            "<select class='form-control' ng-model='projectVM.selectedDonationDuration'  ng-options='x.donationDurationName for x in projectVM.donationDuration'>";
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";
                        // jQuery("#project-calculator").append(Calculator);
                    }
                    vm.isCount = donationProcess.isCount;
                    if (donationProcess.isCount) {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator +=
                            " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <label id='fixedAmountValue' ></label>";
                        vm.projectCalculator += "<div class='input-group'>";
                        vm.projectCalculator += "<div class='input-icon'>";
                        vm.projectCalculator +=
                            "<input type='text' ng-keypress='isNumberKey($event)' min='0' autocomplete='off'  id='amountTextBox' ng-keyup='countChangeForNonFixed()' data-ng-model='amountValueForNonFixed'  numbers-only class='form-control'  />";
                        vm.projectCalculator +=
                            "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator +=
                            " <label >{{ 'COUNT' | translate }}</label>";

                        vm.projectCalculator +=
                            "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeForNonFixed()'>";

                        let min = Math.round(donationProcess.countMin);
                        let max = Math.round(donationProcess.countMax);
                        var interval = Math.round(donationProcess.interval);
                        vm.projectCalculator +=
                            "<option ng-value=''>{{ 'PLEASE SELECT' | translate }}</option>";
                        for (let i = min; i <= max; i += interval) {
                            vm.projectCalculator +=
                                "      <option ng-value='" + i + "'>" + i + "</option>";
                        }
                        vm.projectCalculator += "</select>";
                        vm.projectCalculator += "</div>";

                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator +=
                            " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator += "<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator += " <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator += "</div>";
                        vm.projectCalculator +=
                            "<div class='input-icon'><input type='text' min='0' ng-keypress='isNumberKey($event)' data-ng-disabled='projectVM.isCount' class='form-control addsign' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>";
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";
                    } else {
                        vm.projectCalculator += "<div class='form-group'>";
                        vm.projectCalculator +=
                            " <label >{{ 'AMOUNT' | translate }}</label>";
                        vm.projectCalculator += " <div class='input-group'>";
                        //vm.projectCalculator += "<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                        //vm.projectCalculator += " <i class=''>{{selectedCurrencySymbol}}</i>";
                        //vm.projectCalculator += "</div>";
                        vm.projectCalculator +=
                            "<div class='input-icon'><input type='text' min='0' ng-keypress='isNumberKey($event)' data-ng-disabled='projectVM.isCount' class='form-control addsign' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>";
                        vm.projectCalculator += "</div>";
                        vm.projectCalculator += "</div>";
                    }

                    vm.projectCalculator +=
                        "<div class='form-group' ng-show='showComment'>";
                    vm.projectCalculator +=
                        " <label><span class='commentTxt'>{{projectComment}}</span></label>";
                    vm.projectCalculator += "</div>";

                    vm.projectCalculator += "<div class='row'>";
                    vm.projectCalculator +=
                        "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                    vm.projectCalculator +=
                        "       <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='projectVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                    vm.projectCalculator += "   </div>";
                    vm.projectCalculator +=
                        "   <div class='col-md-6 col-xs-6 text-center no-padding'>";
                    vm.projectCalculator +=
                        "       <button class='grop-btn-donate  grop-btn_submit' data-ng-click='projectVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
                    vm.projectCalculator += "   </div>";
                    vm.projectCalculator += "</div>";
                }
            } else {
                $scope.hideDummy = false;
            }
            let calculator = $compile(vm.projectCalculator)($scope);
            angular
                .element(document.getElementById("projectCalculator"))
                .html("")
                .append(calculator);
        }

        function addOrRemoveSubcategory(x) {
            var exist = _.find(vm.selectedCategory, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedCategory, exist);
            } else {
                vm.selectedCategory.push(x);
            }
        }

        //Function to add or remove Donation Duration
        function addorRemoveDonationDuration(x) {
            var exist = _.find(vm.selectedDonationDurations, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedDonationDurations, exist);
            } else {
                vm.selectedDonationDurations.push(x);
            }
        }

        function addSubCategoryToList() {
            if (vm.subCategories.indexOf(vm.subCategoryValue) != -1) {
            } else {
                vm.subCategories.push(vm.subCategoryValue);
                vm.subCategoryValue = "";
            }
        }

        function getRelatedProjects(id, programTypeId) {
            var obj = new Object();
            obj.id = id;
            obj.programTypeId = programTypeId;
            obj.userLang = localStorage.getItem('lang');
            projectService.getRelatedProjects(obj).then(function (res) {
                let numberOfProject = 2;
                let count = 0;
                let val = 0;
                let activeProjects = [];
                res.data.forEach(function (e) {
                    if (e.isActive == true) {
                        activeProjects.push(e);
                    }
                });
                vm.relatedProjects = [];
                while ((count < numberOfProject) && (count < activeProjects.length)) {
                    val = Math.floor(Math.random() * (activeProjects.length));
                    if (vm.relatedProjects.length && vm.relatedProjects[val] && vm.relatedProjects.findIndex(pro => pro.slug === vm.relatedProjects[val].slug) > 0) {
                        val = Math.floor(Math.random() * (activeProjects.length));
                    }
                    if (activeProjects[val] && vm.projectDetail.slug === activeProjects[val].slug) {
                        val = Math.floor(Math.random() * (activeProjects.length));
                    }
                    if (activeProjects[val]) {
                        vm.relatedProjects.push(activeProjects[val]);
                    }
                    vm.relatedProjects = [...new Set(vm.relatedProjects)];
                    if (vm.relatedProjects.length != numberOfProject) {
                        count--;
                    }
                    count++;
                }
            });
        }

        //load type project in program type
        function getProgramType() {
            if (localStorage.getItem("lang") == "ARB") {
                project = "مشروع";
            } else if (localStorage.getItem("lang") == "FRN") {
                project = "Projets";
            } else {
                project = "Projects";
            }
            programTypeService.getProgramType(project).then(function (res) {
                vm.programType = res.data[0];
                projectService
                    .getCategoriesByProgramType(vm.programType._id)
                    .then(function (res) {
                        vm.projectCategories = res.data;
                        return res;
                    });
                projectService.getDonationDuration().then(function (res) {
                    vm.donationDurations = res.data;
                    return res;
                });
                return res.data[0];
            });
        }

        // get categories
        function getCategories() { }

        //get project Detail by id
        function getProjectDetail() {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            projectService.getProjectById(id).then(function (res) {
                // for removing html tag while sharing
                vm.projectDetail = res.data[0];
                // For SEO
                const metaData = {
                    title: vm.projectDetail.programName,
                    description: vm.projectDetail.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.projectDetail.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/projectdetails/${vm.projectDetail._id}`
                };
                MetaTagsService.setPageMeta(
                    metaData,
                    vm.projectDetail._id,
                    "projectdetails"
                );

                // For show

                // vm.projectDetail.programDescription = $sce.trustAsHtml(vm.projectDetail.programDescription);
                if (
                    vm.projectDetail &&
                    vm.projectDetail.programDescription.length > 1
                ) {
                    let description = vm.projectDetail.programDescription.split(" ");
                    let range1 = description.length;
                    let range2 = description.length / 3;
                    if (range2 % 1 > 0) {
                        range2 = Math.ceil(range2);
                    }
                    for (let i = 0; i <= range2; i++) {
                        vm.description.para1 = vm.description.para1 + " " + description[i];
                    }

                    for (let i = range2 + 1; i <= range1; i++) {
                        vm.description.para2 = vm.description.para2 + " " + description[i];
                    }
                }
                $scope.selectedProjectName = vm.projectDetail;
                getCalculator(vm.projectDetail);
                getRelatedProjects(
                    vm.projectDetail._id,
                    vm.projectDetail.programType[0]
                );
                $scope.isDetail = true;
            });
        }

        function getRelatedProjects(id, programTypeId) {
            var obj = new Object();
            obj.id = id;
            obj.programTypeId = programTypeId;
            obj.userLang = localStorage.getItem("lang");
            projectService.getRelatedProjects(obj).then(function (res) {
                let numberOfProject = 2;
                let count = 0;
                let val = 0;
                let activeProjects = [];
                res.data.forEach(function (e) {
                    if (e.isActive == true) {
                        activeProjects.push(e);
                    }
                });
                vm.relatedProjects = [];
                while (count < numberOfProject && count < activeProjects.length) {
                    val = Math.floor(Math.random() * activeProjects.length);
                    if (
                        vm.relatedProjects.length &&
                        vm.relatedProjects[val] &&
                        vm.relatedProjects.findIndex(
                            pro => pro.slug === vm.relatedProjects[val].slug
                        ) > 0
                    ) {
                        val = Math.floor(Math.random() * activeProjects.length);
                    }
                    if (vm.projectDetail.slug === activeProjects[val].slug) {
                        val = Math.floor(Math.random() * activeProjects.length);
                    }
                    vm.relatedProjects.push(activeProjects[val]);
                    count++;
                }
            });
        }

        // add new project
        function addProject(isValid) {
            if (vm.isCount) {
                vm.validCounter = utilService.countValidator(
                    vm.count.min,
                    vm.count.max,
                    vm.count.interval
                );
                if (!vm.validCounter) {
                    swal({
                        title:
                            Math.round(vm.count.min) == 0
                                ? "Min Value must be greater than 0"
                                : Math.round(vm.count.min) > Math.round(vm.count.max)
                                    ? "Min Value must be less than Max Value"
                                    : Math.round(vm.count.interval) > Math.round(vm.count.max) / 2
                                        ? "Interval value must not be greater than half of Max value"
                                        : "Please Insert Correct Values for Min, Max and Interval",
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
                    });
                }
                //check if min and max are equal
                let minInt = Math.round(vm.count.min);
                let maxInt = Math.round(vm.count.max);
                if (minInt == maxInt) {
                    vm.validCounter = false;
                    swal({
                        title: "Min and Max values cannot be equal",
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
                    });
                }
            } else {
                vm.validCounter = true;
            }

            if (isValid && vm.validCounter) {
                //add Donation Process
                multipartForm.post("/upload", vm.file).then(function (res) {
                    var imageLink = res.data.name;
                    donationProcessService
                        .addDonationProcess(getDonationProcessObject())
                        .then(function (res) {
                            vm.donationProcess = res.data;
                            let projectObj = getProjectData();
                            projectObj.imageLink = imageLink;
                            projectObj.donationProcess = vm.donationProcess;
                            projectObj.programType = vm.programType;
                            projectObj.subCategories = vm.selectedCategory;
                            projectObj.userLang = localStorage.getItem("lang");
                            projectService.addProject(projectObj).then(function (res) {
                                swal({
                                    title: $translate.instant(res.data),
                                    position: "center-center",
                                    type: "success",
                                    allowOutsideClick: false
                                }).then(function () {
                                    window.location = "#/admin/projectlist";
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
            if (vm.isRecurring) {
                obj.donationDurations = vm.selectedDonationDurations;
            }
            obj.isDuration = vm.isDuration;
            obj.isYearAround = vm.isYearAround;
            obj.isCount = vm.isCount;
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
                obj.amount = Math.round(vm.amount || 0).toFixed(2);
            }
            if (vm.isMinimumAmount) {
                obj.minimumAmount = Math.round(vm.minimumAmount || 0).toFixed(2);
            }
            return obj;
        }

        //create project object
        function getProjectData() {
            var obj = new Object();
            obj.programName = vm.projectName;
            obj.programPriority = vm.programPriority;
            obj.programDescription = jQuery("#addproject .froala-view").html();

            return obj;
        }

        //update project
        function updateProject(isValid) {
            if (vm.isCount) {
                vm.validCounter = utilService.countValidator(
                    vm.count.min,
                    vm.count.max,
                    vm.count.interval
                );
                if (!vm.validCounter) {
                    swal({
                        title:
                            Math.round(vm.count.min) == 0
                                ? "Min Value must be greater than 0"
                                : Math.round(vm.count.min) > Math.round(vm.count.max)
                                    ? "Min Value must be less than Max Value"
                                    : Math.round(vm.count.interval) > Math.round(vm.count.max) / 2
                                        ? "Interval value must not be greater than half of Max value"
                                        : "Please Insert Correct Values for Min, Max and Interval",
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
                    });
                }
                if (Math.round(vm.minimumAmount) > Math.round(vm.amount)) {
                    swal({
                        title: 'Minimum amount is greater than fixed amount',
                        type: "error",
                        position: "center-center"
                    })
                    return;
                }
                //check if min and max are equal
                let minInt = Math.round(vm.count.min);
                let maxInt = Math.round(vm.count.max);
                if (minInt == maxInt) {
                    vm.validCounter = false;
                    swal({
                        title: "Min and Max values cannot be equal",
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
                    });
                }
            } else {
                vm.validCounter = true;
            }
            if (isValid && vm.validCounter) {
                if (vm.file.name == undefined) {
                    let projectObj = getUpdatedProjectData();
                    projectObj.imageLink = vm.imageLink;
                    projectService.updateProject(projectObj).then(function (res) {
                        swal({
                            title: $translate.instant(res.data),
                            position: "center-center",
                            type: "success",
                            allowOutsideClick: false
                        }).then(function () {
                            window.location = "#/admin/projectlist";
                        });
                        return res;
                    });
                } else {
                    multipartForm.post("/upload", vm.file).then(function (res) {
                        let projectObj = getUpdatedProjectData();
                        projectObj.imageLink = res.data.name;
                        projectService.updateProject(projectObj).then(function (res) {
                            swal({
                                title: $translate.instant(res.data),
                                position: "center-center",
                                type: "success",
                                allowOutsideClick: false
                            }).then(function () {
                                window.location = "#/admin/projectlist";
                            });
                            return res;
                        });
                    });
                }
            }
        }
        function previewImage() {
            var image = vm.file;
        }
        //get data for project update
        function getProjectForUpdate() {
            var id = $location.search().projectid;

            projectService.getProjectById(id).then(function (res) {
                let data = res.data[0];
                vm.slug = data.slug;
                vm.programTypeId = data.programType[0];
                projectService
                    .getCategoriesByProgramType(vm.programTypeId)
                    .then(function (res) {
                        vm.projectCategories = res.data;
                        vm.selectedCategory = data.programSubCategory;
                        vm.selectedDonationDurations =
                            data.donationProcess[0].donationDuration;
                        if (vm.selectedCategory.length > 0) {
                            vm.hasCategories = true;
                        }
                        vm.projectCategories.forEach(function (element) {
                            if (_.find(vm.selectedCategory, element)) {
                                element.selected = true;
                            } else {
                                element.selected = false;
                            }
                        }, this);
                        projectService.getDonationDuration().then(function (res) {
                            vm.donationDurations = res.data;
                            if (vm.selectedDonationDurations.length > 0) {
                                vm.donationDurations.forEach(function (element) {
                                    if (_.find(vm.selectedDonationDurations, element)) {
                                        element.selected = true;
                                    } else {
                                        element.selected = false;
                                    }
                                }, this);
                            }
                            return res;
                        });
                        return res;
                    });

                vm.projectId = data._id;
                vm.projectName = data.programName;
                vm.programPriority = data.programPriority;
                vm.imageLink = data.imageLink;
                let donationProcess = data.donationProcess[0];
                vm.isRecurring = donationProcess.isRecurring;
                vm.isYearAround = donationProcess.isYearAround;
                vm.isDuration = donationProcess.isDuration;
                vm.isAmount = donationProcess.isAmount;
                vm.isMinimumAmount = donationProcess.isMinimumAmount;
                if (vm.isAmount) {
                    var obj = new Object();
                    obj.currency = JSON.parse(sessionStorage.getItem("currency"));
                    if (obj.currency.title == "USD") {
                        vm.amount = Math.round(donationProcess.amount || 0).toFixed(2) * 1;
                    } else {
                        vm.amount = Math.round(currencyService.currencyConversionFormula(
                            obj.currency.rateExchange * donationProcess.amount || 0
                        )).toFixed(2) * 1;
                    }
                }
                if (vm.isDuration) {
                    vm.StartDate = donationProcess.durationStartDate;
                    var durationSDate = jQuery("#txtFromDate");
                    durationSDate.datepicker();
                    durationSDate.datepicker("setDate", vm.StartDate);
                    vm.EndDate = donationProcess.durationEndDate;
                    var durationEDate = jQuery("#txtToDate");
                    durationEDate.datepicker();
                    durationEDate.datepicker("setDate", vm.EndDate);
                }
                vm.isCount = donationProcess.isCount;
                if (vm.isCount) {
                    vm.count.min = donationProcess.countMin;
                    vm.count.max = donationProcess.countMax;
                    vm.count.interval = donationProcess.interval;
                }
                if (vm.isMinimumAmount) {
                    vm.minimumAmount = Math.round(donationProcess.minimumAmount).toFixed(2);
                }
                vm.projectDescription = data.programDescription;
                jQuery("#projectDescription .froala-view").html(vm.projectDescription);
                return res;
            });
        }

        //create update project object
        function getUpdatedProjectData() {
            var obj = new Object();
            obj.id = vm.projectId;
            obj.programName = vm.projectName;
            obj.programPriority = vm.programPriority;
            obj.slug =
                vm.slug &&
                vm.slug
                    .toLowerCase()
                    .split(" ")
                    .join("-");
            // Save work

            obj.programDescription = jQuery(
                "#projectDescription .froala-view"
            ).html();

            var donationProcess = new Object();
            donationProcess.isRecurring = vm.isRecurring;
            if (donationProcess.isRecurring) {
                donationProcess.donationDurations = vm.selectedDonationDurations;
            }
            donationProcess.isYearAround = vm.isYearAround;
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
            donationProcess.isAmount = vm.isAmount;
            if (donationProcess.isAmount) {
                donationProcess.amount = Math.round(vm.amount || 0).toFixed(2);
            }
            donationProcess.isMinimumAmount = vm.isMinimumAmount;
            if (donationProcess.isMinimumAmount) {
                donationProcess.minimumAmount = Math.round(vm.minimumAmount || 0).toFixed(2);
            }
            obj.donationProcess = donationProcess;
            obj.programSubCategory = vm.selectedCategory;

            return obj;
        }
        function saveContent() {
            let projectTxt = document.getElementById("projectTxt").value;
            if (projectTxt == "") {
                document.getElementById("showError").innerText = $translate.instant("PLEASE FILL THE MISSING FIELD");
                document.getElementById("projectTxt").focus();
            } else {
                programTypeService
                    .getProgramContent({ content: vm.content, _id: vm.programType._id })
                    .then(function (res) {
                        vm.projects = res.data;
                        return res;
                    }, location.reload());
            }
        }
        // get all projects
        function getProjects() {
            if (localStorage.getItem("lang") == "ARB") {
                project = "مشروع";
            } else if (localStorage.getItem("lang") == "FRN") {
                project = "Projets";
            } else {
                project = "Projects";
            }
            programTypeService.getProgramType(project).then(function (res) {
                vm.programType = res.data[0];
                var programTypeId = vm.programType._id;
                vm.content = vm.programType.content;
                projectService.getProjects(programTypeId).then(function (res) {
                    vm.projects = res.data;
                    return res;
                });
            });
        }

        function getActiveProjects() {
            if (localStorage.getItem("lang") == "ARB") {
                project = "مشروع";
            } else if (localStorage.getItem("lang") == "FRN") {
                project = "Projets";
            } else {
                project = "Projects";
            }
            programTypeService.getProgramType(project).then(function (res) {
                vm.programType = res.data[0];
                var programTypeId = vm.programType._id;
                vm.content = vm.programType.content;
                projectService.getProjects(programTypeId).then(function (res) {
                    vm.projects = _.filter(res.data, function (e) {
                        const metaData = {
                            title: "Projects",
                            description: vm.programType.programDescription,
                            image: `${MetaTagsService.SERVER_URL}/uploads/${vm.programType.imageLink}`,
                            url: `${MetaTagsService.SERVER_URL}/#/projects/${vm.programType._id}`
                        };
                        MetaTagsService.setPageMeta(
                            metaData,
                            vm.programType._id,
                            "projects"
                        );
                        return e.isActive == true;
                    });
                    return res;
                });
            });
        }

        function deleteProject(projectId, status) {
            if (status == true) {
                swal({
                    title: $translate.instant('Are you sure?'),
                    text: "",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: $translate.instant('Yes, Deactivate it!'),
                    cancelButtonText: $translate.instant('No, cancel!'),
                    confirmButtonClass: "btn btn-success",
                    cancelButtonClass: "btn btn-danger",
                    buttonsStyling: false
                }).then(function (result) {
                    if (result.value) {
                        projectService.deleteProject(projectId).then(function (res) {
                            vm.result = res.data;
                            swal("Deactivated!", "Project has been deactivated.", "success");
                            getProjects();
                            return res;
                        });
                        // result.dismiss can be 'cancel', 'overlay',
                        // 'close', and 'timer'
                    } else if (result.dismiss === "cancel") {
                        swal("Cancelled", "", "error");
                    }
                });
            } else {
                projectService.deleteProject(projectId).then(function (res) {
                    vm.result = res.data;
                    swal($translate.instant('ACTIVATED!'),
                        "Project has been Activated.", "success");
                    getProjects();
                    return res;
                });
            }
        }

        jQuery("#txtFromDate").datepicker({
            autoclose: true
        });
        //For Add/Update Project Form
        $scope.startDateChange = function () {
            jQuery("#txtToDate").datepicker("remove");
            jQuery("#txtToDate").val("");
            jQuery("#txtToDate").datepicker({
                autoclose: true,
                startDate: new Date(vm.StartDate)
            });
        };
        $scope.setPosFromDate = function () {
            var position = jQuery("#txtFromDate").offset().top;
            position = position - 300;
            angular
                .element(jQuery(".datepicker-dropdown")[0])
                .css({ top: "" + position + "px" });
        };
        $scope.setPosToDate = function () {
            var position = jQuery("#txtToDate").offset().top;
            position = position - 300;
            angular
                .element(jQuery(".datepicker-dropdown")[0])
                .css({ top: "" + position + "px" });
        };
    }
})();
