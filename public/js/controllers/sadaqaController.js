(function () {

    angular.module('mainApp').controller('sadaqaController', sadaqaController);

    function sadaqaController($scope, $rootScope, $sce, $http, $translate, MetaTagsService, $window, $compile, $location, sadaqaService, utilService, programTypeService, $state, programService, donationProcessService, multipartForm, loginService, cartService,config,eventLogsService) {

        var vm = this;
        $scope.checkBoxNotChecked = true;
        vm.addSadaqaCategory = addSadaqaCategory;
        vm.getSadaqas = getSadaqas;
        vm.saveBasicContent = saveBasicContent;
        vm.getActiveSadaqas = getActiveSadaqas;
        vm.printContent = printContent;
        vm.getSadaqaDetail = getSadaqaDetail;
        vm.deleteSadaqa = deleteSadaqa;
        vm.updateSadaqa = updateSadaqa;
        vm.deleteAllSubCategory = deleteAllSubCategory;
        vm.getSadaqaForUpdate = getSadaqaForUpdate;
        vm.previewImage = previewImage;
        vm.donationProcess = {};
        vm.SadaqaCategoryName = "";
        vm.categoryDescription = "";
        vm.addSadaqa = addSadaqa;
        vm.SadaqaCategories = [];
        vm.selectedDonationDurations = [];
        vm.getCategories = getCategories;
        vm.selectedCategory = [];
        vm.imageUrl = "";
        vm.file = {};
        vm.programType = {};
        vm.subCategories = [];
        vm.count = [
            min = 0,
            max = 0,
            interval = 0
        ];
        $scope.selectedRecurringType = false;
        $scope.paymentMethod = $translate.instant('ONETIME');
        vm.validCounter = true;
        vm.getProgramType = getProgramType;
        vm.addSubCategoryToList = addSubCategoryToList;
        vm.addOrRemoveSubcategory = addOrRemoveSubcategory;
        vm.addorRemoveDonationDuration = addorRemoveDonationDuration;
        vm.selectCalculator = selectCalculator;
        vm.addCartItem = addCartItem;
        vm.donate = donate;
        vm.user = {};
        vm.clearCalculator = clearCalculator;
        $scope.isDetail = false;
        vm.description = {
            para1: '',
            para2: ''
        };
        vm.sadaqa = {};
        vm.language = "";
        $scope.isFixedAmountValid = () => {
            return vm.isMinimumAmount && parseFloat(vm.minimumAmount) > parseFloat(vm.amount)
        }
        // for arabic header in print view
        let lang = localStorage.getItem('lang');
        if (lang == 'ARB') {
            vm.printArb = true
        } else if (lang == 'FRN' || lang == 'ENG') {
            vm.printArb = false
        }

        vm.MobileDevice = false;
        if (window.innerWidth < 600) {
            vm.MobileDevice = true;
            // vm.projectDescription.length == 200
        }

        $scope.readmoreText = function (text, lines) {
            return utilService.readmoreText(text, lines)
        }

        $scope.sendMail = function () {
            const mail = utilService.sendEmail(vm.sadaqaDetail.programName, vm.sadaqaDetail.programDescription, `sadaqadetails/${vm.sadaqaDetail.slug}`, vm.sadaqaDetail.imageLink)
            $window.open(mail);
        }

        $scope.selectedCurrencySymbol = JSON.parse(sessionStorage.getItem('currency')).symbol;

        $scope.isNumberKey = function ($event) {
            let amount = String.fromCharCode(event.which || event.keyCode)
            let pattern = /^[0-9]\d*(\.\d+)?$/;
            if (!pattern.test(amount)) {
                event.preventDefault()
            }
        }

        function addCartItem() {
            var obj = new Object();
            if (vm.clickedCart) return;
            vm.clickedCart = true;

            if (vm.sadaqaDetail) {
                obj.program = vm.sadaqaDetail;
            }
            else {
                obj.program = vm.selectedSadaqa;
            }

            // obj.userId = vm.user.userId;
            // obj.userName = vm.user.username;
            if ($scope.checkBoxNotChecked) {
                if ($scope.selectedCategory != null && $scope.selectedCategory.length > 0) {
                    obj.programSubCategory = $scope.selectedCategory;
                }
            } else {
                if ($scope.otherPersonalityTextBox != null) {
                    obj.otherPersonalityName = $scope.otherPersonalityTextBox;
                }
            }
            // vm.mytotalAmount = vm.mytotalAmount || vm.totalAmount;
            vm.mytotalAmount = vm.totalAmount;

            obj.totalAmount = Math.round(vm.mytotalAmount).toFixed(2);
            obj.isRecurring = $scope.selectedRecurringType;
            obj.paymentPlan = $scope.selectedPaymentPlan;
            obj.isRecurringProgram = obj.program && obj.program.isRecurringProgram;
            if ($scope.selectedRecurringType) {
                obj.donationDuration = vm.selectedDonationDuration;
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
            //Validations
            if (obj.program.programName != "Sadaqah a Day") {
                if (obj.program.programSubCategory != null && obj.program.programSubCategory.length > 0) {
                    if ($scope.checkBoxNotChecked) {
                        if ($scope.selectedCategory == null || $scope.selectedCategory.length == 0) {
                            //stop and ask to select religous personality
                            vm.clickedCart = false;
                            return showError();
                        }
                    } else {
                        // if (!$scope.otherPersonalityTextBox) {
                        //     vm.clickedCart = false;
                        //     return showError();
                        // }
                    }
                }
            }
            if (obj.program.donationProcess[0].isRecurring) {
                if ($scope.selectedRecurringType !== false && !$scope.selectedRecurringType) {
                    //stop and ask to select payment type
                    vm.clickedCart = false;
                    return showError();
                } else if ($scope.selectedRecurringType) {
                    if (!vm.selectedDonationDuration) {
                        //stop and ask to select duration
                        vm.clickedCart = false;
                        return showError();
                    }
                }
            }
            if (!obj.totalAmount) {
                vm.clickedCart = false;
                return showError();
            }
            if (obj.program.donationProcess[0].isMinimumAmount) {
                let minimiumAmountForDonation = obj.program.donationProcess[0].minimumAmount;
                if (vm.mytotalAmount != 0 && !vm.mytotalAmount) { vm.clickedCart = false; return showError(); }
                // if ($scope.otherPersonalityTextBox !== null && !$scope.otherPersonalityTextBox) { vm.clickedCart = false; return showError(); }


                if (vm.mytotalAmount >= 0 && vm.mytotalAmount < minimiumAmountForDonation) {
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
                        text: minAmountmsg,
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                        confirmButtonColor: '#f0c84b',
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
            if ($scope.selectedCategory != null) {
                obj.programSubCategory = $scope.selectedCategory;
            }
            obj.otherPersonalityName = vm.selectedDonationDuration && vm.selectedDonationDuration.donationDurationName || $scope.otherPersonalityTextBox;

            obj.currency = JSON.parse(sessionStorage.getItem('currency'));

            cartService.getCartDetail().then(function (result) {
                let addToCart = checkForMultipleRecurringPrograms(obj, result);
                vm.clickedCart = false;
                if (addToCart) {
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
            });

        }

        function printContent(divName) {
            window.print();
        }

        function clearCalculator() {
            $scope.amount = undefined;
            vm.amount = undefined;
            vm.totalAmount = undefined;
            $scope.totalAmount = undefined;
            vm.mytotalAmount = undefined;
            vm.selectedDonationDuration = undefined;

            $scope.paymentChargeMessage = undefined;
            $scope.cancellationMessage = undefined;
            vm.sadaqa.totalAmount = undefined;
            vm.sadaqa.amount = undefined;
            $scope.selectedPaymentPlan = undefined;
            if ($scope.isDetail) {
                getSadaqaDetail();
            }
            else {
                vm.selectedSadaqa = undefined;
                vm.sadaqaCalculator = "";
                let calculator = $compile(vm.sadaqaCalculator)($scope);
                angular.element(document.getElementById("sadaqaCalculator")).html("").append(calculator);
            }
        }
        function showError() {
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
        function donate() {
            var obj = new Object();
            if (vm.clickedDonate) return;
            vm.clickedDonate = false;
            if (vm.sadaqaDetail) {
                obj.program = vm.sadaqaDetail;
            }
            else {
                obj.program = vm.selectedSadaqa;
            }

            // obj.userId = vm.user.userId;
            // obj.userName = vm.user.username;
            if ($scope.checkBoxNotChecked) {
                if ($scope.selectedCategory != null && $scope.selectedCategory.length) {
                    obj.programSubCategory = $scope.selectedCategory;
                }
            } else {
                if ($scope.otherPersonalityTextBox != null) {
                    obj.otherPersonalityName = $scope.otherPersonalityTextBox;
                }
            }
            // vm.mytotalAmount = vm.mytotalAmount || vm.totalAmount;
            vm.mytotalAmount = vm.totalAmount;


            obj.totalAmount = Math.round(vm.mytotalAmount || vm.totalAmount).toFixed(2);
            obj.isRecurring = $scope.selectedRecurringType;
            obj.paymentPlan = $scope.selectedPaymentPlan;
            obj.isRecurringProgram = obj.program && obj.program.isRecurringProgram;
            if ($scope.selectedRecurringType) {
                obj.donationDuration = vm.selectedDonationDuration;
            }
            //Validations
            if (obj.program.programName != $translate.instant("Sadaqah a Day".toUpperCase())) {
                if (obj.program.programSubCategory != null && obj.program.programSubCategory.length > 0) {
                    if ($scope.checkBoxNotChecked) {
                        if ($scope.selectedCategory == null || $scope.selectedCategory.length == 0) {
                            //stop and ask to select religous personality
                            vm.clickedDonate = false;

                            return showError();
                        }
                    } else {
                        // if (!$scope.otherPersonalityTextBox) {
                        //     vm.clickedDonate = false;

                        //     return showError();
                        // }
                    }
                }
            }
            if (obj.program.donationProcess[0].isRecurring) {
                if ($scope.selectedRecurringType !== false && !$scope.selectedRecurringType) {
                    //stop and ask to select payment type
                    vm.clickedDonate = false;

                    return showError();
                } else if ($scope.selectedRecurringType) {
                    if (!vm.selectedDonationDuration) {
                        //stop and ask to select duration
                        vm.clickedDonate = false;

                        return showError();
                    }
                }
            }
            if (!obj.totalAmount) {
                vm.clickedDonate = false;

                return showError();
            }
            if (obj.program.donationProcess[0].isMinimumAmount) {
                let minimiumAmountForDonation = obj.program.donationProcess[0].minimumAmount;
                if (vm.mytotalAmount != 0 && !vm.mytotalAmount) {
                    vm.clickedDonate = false;
                    return showError();
                }
                // if ($scope.otherPersonalityTextBox !== null && !$scope.otherPersonalityTextBox) {
                //     vm.clickedDonate = false;
                //     return showError();
                // }

                if (vm.mytotalAmount >= 0 && vm.mytotalAmount < minimiumAmountForDonation) {
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
                        text: minAmountmsg,
                        position: 'center-center',
                        type: 'error',
                        allowOutsideClick: false,
                        confirmButtonColor: '#f0c84b',
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
            // obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            // localStorage.setItem("cart", null);
            // localStorage.setItem("cart", JSON.stringify(obj));
            // if ($rootScope.isLogin) {
            //     $window.location.href = "/#/checkout";
            // } else {
            //     jQuery('#globalLoginModal').modal('show');
            // }
            if ($scope.selectedCategory != null) {
                obj.programSubCategory = $scope.selectedCategory;
            }
            if ($scope.selectedRecurringType) {
                obj.donationDuration = vm.selectedDonationDuration;
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
            obj.otherPersonalityName = vm.selectedDonationDuration && vm.selectedDonationDuration.donationDurationName || $scope.otherPersonalityTextBox;
            obj.currency = JSON.parse(sessionStorage.getItem("currency"));

            cartService.getCartDetail().then(function (result) {
                let addToCart = checkForMultipleRecurringPrograms(obj, result);
                if (addToCart) {
                    cartService.addCartItem(obj).then(function () {

                        $rootScope.$broadcast("getCartCounter");
                        $state.go("cart");
                        vm.clickedDonate = false;

                    });
                }
            });
            // cartService.addCartItem(obj).then(function (res) {
            //     $rootScope.$broadcast('getCartCounter');

            // });
        }

        $scope.getFixedAmount = function () {
            vm.totalAmount = null;
            if ($scope.selectedCategory.value === 'other') {
                $scope.allowTextBoxForRPField = true;
                $scope.checkBoxNotChecked = false;
                return;
            }
            $scope.allowTextBoxForRPField = false;
            $scope.checkBoxNotChecked = true;
            if ($scope.selectedCategory.isFixedAmount) {
                var obj = new Object();
                obj.currency = JSON.parse(sessionStorage.getItem('currency'));
                if (obj.currency.title == "USD") {
                    $scope.amount = Math.round($scope.selectedCategory.fixedAmount).toFixed(2);
                } else {
                    $scope.amount = Math.round(obj.currency.rateExchange * $scope.selectedCategory.fixedAmount).toFixed(2);
                }
            }
            else {
                $scope.amount = undefined;
            }
        }

        function selectCalculator() {
            let selectedSadaqa = vm.selectedSadaqa;
            $scope.selectedCategory = null;
            vm.amount = undefined;
            vm.totalAmount = undefined;
            $scope.totalAmount = undefined;
            $scope.paymentChargeMessage = undefined;
            $scope.cancellationMessage = undefined;
            vm.sadaqa.totalAmount = undefined;
            vm.sadaqa.amount = undefined;
            $scope.selectedPaymentPlan = undefined;
            getCalculator(selectedSadaqa);
        }

        function addOrRemoveSubcategory(x) {
            var exist = _.find(vm.selectedCategory, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedCategory, exist);

            }
            else {
                if (vm.selectedCategory == null) {
                    vm.selectedCategory = [];
                }
                vm.selectedCategory.push(x);
            }
        }

        function addorRemoveDonationDuration(x) {
            var exist = _.find(vm.selectedDonationDurations, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedDonationDurations, exist);
            }
            else {
                vm.selectedDonationDurations.push(x);
            }
        }

        function getCalculator(sadaqaDetail) {
            $scope.sadaqaDetail = sadaqaDetail;
            $scope.otherPersonalityTextBox = null;
            $scope.allowTextBoxForRPField = null;
            $scope.checkBoxNotChecked = true;
            vm.sadaqaCalculator = "";
            vm.language = localStorage.getItem('lang');

            if (sadaqaDetail != undefined) {

                let donationProcess = sadaqaDetail.donationProcess[0];

                if (donationProcess.isRecurring) {
                    $scope.selectedPaymentPlan = donationProcess.subscriptionDetail.paymentPlan[0];
                    getSadaqahCountValues();
                    //NF-I175 (this function is replaced by the sadaqah-component)
                    //daily sadaqa calculator
                    //setCalculatorForDailySadaqa();
                } else {

                    var activeSubCategories = [];
                    var totalSubCategories = sadaqaDetail.programSubCategory;
                    vm.subCategories = sadaqaDetail.programSubCategory;
                    totalSubCategories.forEach(function (object) {
                        if (object.isActive == true) {
                            activeSubCategories.push(object)
                        }
                    });
                    vm.subCategories = activeSubCategories;
                    vm.subCategories = vm.subCategories.filter(
                        sProg => sProg.isActive && sProg.programSubCategoryName !== $translate.instant('OTHER') && sProg.isActive && sProg.programSubCategoryName !== $translate.instant('OTHERS')
                    );
                    vm.subCategories.push({ _id: "5acb5dd62af4f01c4850afa5", value: 'other', programSubCategoryName: $translate.instant('OTHER') });
                    if (vm.subCategories.length) {
                        // vm.sadaqaCalculator += "<div class='form-group' ng-show='checkBoxNotChecked'>";
                        vm.sadaqaCalculator += " <label >{{ 'HOLY PERSONALITY' | translate}}</label>";
                        vm.sadaqaCalculator += "<select  class='form-control' ng-model='selectedCategory' ng-change='getFixedAmount()'  ng-options='x.programSubCategoryName for x in pageVM.subCategories'>";
                        vm.sadaqaCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        vm.sadaqaCalculator += "</select>";
                        // vm.sadaqaCalculator += "</div>";
                    }
                    if (donationProcess.isOtherFieldForRP) {
                        var placeholderText;
                        if (localStorage.getItem('lang') == 'ARB') {
                            placeholderText = 'يرجى كتابة الشخصية المقدسة';
                        } else if (localStorage.getItem('lang') == 'FRN') {
                            placeholderText = 'Saisir nom';
                        } else {
                            placeholderText = 'Please type the Holy Personality';
                        }
                        vm.sadaqaCalculator += "<div class='form-group' ng-hide='checkBoxNotChecked' style='margin-top:16px'>";
                        vm.sadaqaCalculator += " <label >{{ 'OTHER HOLY PERSONALITY' | translate}}</label>";
                        vm.sadaqaCalculator += "<input type='text' class='form-control' maxlength='75' data-ng-model='otherPersonalityTextBox'  placeholder='" + placeholderText + "' />"
                        vm.sadaqaCalculator += "</div>";
                    }
                    // if (donationProcess.isOtherFieldForRP) {
                    //     vm.sadaqaCalculator += "<div class='form-group'>";
                    //     vm.sadaqaCalculator += "<div class='checkbox'>";
                    //     vm.sadaqaCalculator += "<label style='padding:0px;'><input type='checkbox' id='checkBoxForOtherRP' style='margin:0px 10px !important; position:relative !important;'  ng-change='setCalForOtherField()' name='minimumAmount'  ng-model='allowTextBoxForRPField'/>{{ 'OTHER HOLY PERSONALITY' | translate}}</label>";
                    //     vm.sadaqaCalculator += "</div>";
                    //     vm.sadaqaCalculator += "</div>";
                    // }

                    vm.sadaqaCalculator += "<div class='form-group' style='margin-top: 14px;'>";
                    vm.sadaqaCalculator += " <label >{{ 'AMOUNT' | translate}}</label>";
                    vm.sadaqaCalculator += " <div class='input-group'>";
                    //vm.sadaqaCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                    //vm.sadaqaCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
                    //vm.sadaqaCalculator +="</div>";
                    vm.sadaqaCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='0' data-ng-disabled='projectVM.isCount' class='form-control' data-ng-model='pageVM.totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                    vm.sadaqaCalculator += "</div>";
                    vm.sadaqaCalculator += "</div>";


                    vm.sadaqaCalculator += "<div class='row'>";
                    vm.sadaqaCalculator += "    <div class='col-md-6 col-xs-6 text-center no-padding'>";
                    vm.sadaqaCalculator += "        <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
                    vm.sadaqaCalculator += "    </div>";
                    vm.sadaqaCalculator += "    <div class='col-md-6 col-xs-6 text-center  no-padding'>";
                    vm.sadaqaCalculator += "        <button class='grop-btn-donate  grop-btn_submit' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
                    vm.sadaqaCalculator += "    </div>";
                    vm.sadaqaCalculator += "</div>";

                }
            }
            let calculator = $compile(vm.sadaqaCalculator)($scope);
            angular.element(document.getElementById("sadaqaCalculator")).html("").append(calculator);
        }

        $scope.setCalForOtherField = function () {
            $scope.otherPersonalityTextBox = null;
            if (checkBoxForOtherRP.checked) {
                $scope.checkBoxNotChecked = false;
                $scope.selectedCategory = undefined;
            } else {
                $scope.checkBoxNotChecked = true;
            }
            $scope.amount = undefined;
        }
        $scope.changeSadaqaAmount = function () {
            let numberOfDays = 30;
            vm.sadaqa.totalAmount = numberOfDays * vm.sadaqa.amount;
            vm.totalAmount = vm.sadaqa.totalAmount;
            if (vm.sadaqa.totalAmount > 0) {
                let messageCOmmand = $scope.sadaqaDetail.donationProcess[0].subscriptionDetail.paymentChargeMessage.value[vm.language];

                $scope.paymentChargeMessage = messageCOmmand.replace("[currency]", $scope.selectedCurrencySymbol).replace("[amount]", vm.sadaqa.totalAmount);

                $scope.cancellationMessage = $scope.sadaqaDetail.donationProcess[0].subscriptionDetail.cancellationMessage.value[vm.language];

            }
            else {
                $scope.paymentChargeMessage = undefined;
                vm.sadaqa.totalAmount = undefined;
                $scope.cancellationMessage = undefined;
                vm.totalAmount = undefined;
            }
        };
        function setCalculatorForDailySadaqa() {
            let language = localStorage.getItem('lang');
            let donationProcess = $scope.sadaqaDetail.donationProcess[0];
            vm.sadaqaCalculator += "<div class='form-group'>";
            vm.sadaqaCalculator += " <label >{{ 'PAYMENT METHOD' | translate}}</label>";
            // vm.sadaqaCalculator += "<select  class='form-control' ng-model='selectedRecurringType' ng-change='removeAmount()'>"
            // vm.sadaqaCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            // vm.sadaqaCalculator += "<option ng-value='false' ng-model='oneTime'>{{'ONETIME' | translate}}</option>";
            // vm.sadaqaCalculator += "<option ng-value='true' >{{'RECURRING' | translate}}</option>";
            // vm.sadaqaCalculator += "</select>";
            vm.sadaqaCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";

            vm.sadaqaCalculator += "</div>";

            vm.donationDuration = donationProcess.donationDuration;
            vm.sadaqaCalculator += "<div class='form-group' ng-show='true'>";
            vm.sadaqaCalculator += " <label >{{ 'DURATION' | translate}}</label>";
            vm.sadaqaCalculator += "<select class='form-control' ng-change = 'dateCalculate(); changeSadaqaAmount()' ng-model='sadaqaVM.selectedDonationDuration' ng-options='x.donationDurationName for x in sadaqaVM.donationDuration'>";
            vm.sadaqaCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            vm.sadaqaCalculator += "</select>";
            vm.sadaqaCalculator += "</div>";

            vm.sadaqaCalculator += "<div class='form-group' ng-show='true' >";
            vm.sadaqaCalculator += " <label >{{ 'AMOUNT' | translate}}</label>";
            vm.sadaqaCalculator += "<select class='form-control'  ng-change='changeSadaqaAmount()' ng-model='sadaqaVM.sadaqaAmount'>"
            vm.sadaqaCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            vm.sadaqaCalculator += "<option ng-value='30'>{{selectedCurrencySymbol}} 30</option>";
            vm.sadaqaCalculator += "<option ng-value='60'>{{selectedCurrencySymbol}} 60</option>";
            vm.sadaqaCalculator += "<option ng-value='90'>{{selectedCurrencySymbol}} 90</option>";
            vm.sadaqaCalculator += "</select>";
            vm.sadaqaCalculator += "</div>";

            // vm.sadaqaCalculator += "<div class='form-group' ng-if='selectedRecurringType && date'>";
            // if (language == 'ARB') {
            //     vm.sadaqaCalculator += " <label><span class='commentTxt' style='font-size:9px'>يرجى ملاحظة أنه سيتم خصم {{selectedCurrencySymbol}}{{sadaqaVM.totalAmount || '0'}} شهريا حتى {{date | date:'yyyy-MM-dd'}}</span></label>";
            // }
            // else if (language == 'FRN') {
            //     vm.sadaqaCalculator += " <label><span class='commentTxt'>Veuillez noter que les {{selectedCurrencySymbol}}{{sadaqaVM.totalAmount || '0'}} seront déduit de votre compte mensuellement jusqu'au {{date | date:'dd-MM-yyyy'}}.</span></label>";
            // }
            // else {
            //     vm.sadaqaCalculator += " <label><span class='commentTxt'>Please note that {{selectedCurrencySymbol}}{{sadaqaVM.totalAmount || '0'}} will be deducted from your account monthly till {{date | date:'dd-MM-yyyy'}}.</span></label>";
            // }
            // vm.sadaqaCalculator += "</div>";

            vm.sadaqaCalculator += "<div class='form-group' ng-show='selectedRecurringType==false'>";
            vm.sadaqaCalculator += " <label >{{ 'TOTAL AMOUNT' | translate}}</label>";
            vm.sadaqaCalculator += " <div class='input-group'>";
            //vm.sadaqaCalculator +="<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
            //vm.sadaqaCalculator +=" <i class=''>{{selectedCurrencySymbol}}</i>";
            //vm.sadaqaCalculator +="</div>";
            vm.sadaqaCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='0' disabled='true' class='form-control' ng-model='sadaqaVM.mytotalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
            vm.sadaqaCalculator += "</div>";
            vm.sadaqaCalculator += "</div>";

            vm.sadaqaCalculator += "   <div class='row'>";
            vm.sadaqaCalculator += "       <div class='col-md-6 col-xs-6 text-center no-padding'>";
            vm.sadaqaCalculator += "            <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='sadaqaVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            vm.sadaqaCalculator += "        </div>";
            vm.sadaqaCalculator += "        <div class='col-md-6 col-xs-6 text-center no-padding' >";
            vm.sadaqaCalculator += "            <button class='grop-btn-donate  grop-btn_submit' data-ng-click='sadaqaVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            vm.sadaqaCalculator += "        </div>";
            vm.sadaqaCalculator += "  </div>";

        }


        $scope.dateCalculate = function () {
            let todayDate = new Date();
            if (vm.selectedDonationDuration && vm.selectedDonationDuration.noOfMonths) {
                // if($scope.amount){
                //     $scope.recurrAmount = $scope.amount/vm.selectedDonationDuration.noOfMonths;
                // }
                $scope.date = new Date(todayDate.setMonth(todayDate.getMonth() + vm.selectedDonationDuration.noOfMonths - 1)).toISOString().slice(0, 10);
            } else {
                $scope.recurrAmount = Math.round($scope.amount).toFixed(2);
            }
        }
        $scope.removeAmount = function () {
            vm.totalAmount = null;
            vm.selectedDonationDuration = null;
        }
        function addSubCategoryToList() {
            if (vm.subCategories.indexOf(vm.subCategoryValue) != -1) {
            }
            else {
                vm.subCategories.push(vm.subCategoryValue);
                vm.subCategoryValue = "";
            }
        }

        function previewImage() {
            var image = vm.file;
        }

        //load type Sadaqa in program type
        function getProgramType() {

            if (localStorage.getItem('lang') == 'ARB') {
                sadaqa = "الصدقة";
            } else if (localStorage.getItem('lang') == 'FRN') {
                sadaqa = "Sadaqa";
            } else {
                sadaqa = "Sadaqah";
            }
            programTypeService.getProgramType(sadaqa).then(function (res) {
                if (res.data && res.data.length) {
                    vm.programType = res.data[0];
                    sadaqaService.getCategoriesByProgramType(vm.programType._id).then(function (res) {
                        vm.sadaqaCategories = res.data;
                        return res;
                    });
                    programService.getDonationDuration().then(function (res) {
                        vm.donationDurations = res.data;
                        return res;
                    });
                    return res.data[0];
                }
            }
            );
        }
        function chunckArray(arr) {
            let chunk;
            while (arr.length > 0) {
                chunk = arr.splice(0, 200);
                return chunk
            }
        }

        //get project Detail by id
        function getSadaqaDetail() {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            sadaqaService.getSadaqaById(id).then(function (res) {
                vm.sadaqaDetail = res.data[0];
                const metaData = {
                    title: vm.sadaqaDetail.programName,
                    description: vm.sadaqaDetail.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.sadaqaDetail.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/sadaqadetails/${vm.sadaqaDetail._id}`,

                };
                MetaTagsService.setPageMeta(metaData, vm.sadaqaDetail._id, 'sadaqadetails');
                //vm.sadaqaDetail.sadaqaDescription = $sce.trustAsHtml(vm.sadaqaDetail.sadaqaDescription);
                let description = vm.sadaqaDetail.programDescription.slice();
                description = description.split(' ');
                getCalculator(vm.sadaqaDetail);
                getRelatedSadaqas(vm.sadaqaDetail._id, vm.sadaqaDetail.programType[0]);
                $scope.isDetail = true;
            });
            loginService.getSession().then(function (res) {
                vm.user = res.data;
            });
        }

        function getRelatedSadaqas(id, programTypeId) {
            var obj = new Object();
            obj.id = id;
            obj.programTypeId = programTypeId;
            obj.userLang = localStorage.getItem('lang');
            sadaqaService.getRelatedSadaqas(obj).then(function (res) {
                let numberOfSadaqa = 2;
                let count = 0;
                var val = 0;
                let activeSadaqas = [];
                let url = $location.url().split('/')[2];
                res.data.forEach(function (e) {
                    if (e.isActive == true && url !== e.slug) {
                        activeSadaqas.push(e);
                    }
                });
                vm.relatedSadaqas = [];
                while ((count < numberOfSadaqa) && (count < activeSadaqas.length)) {
                    val = Math.floor(Math.random() * (activeSadaqas.length));
                    if (vm.relatedSadaqas.length && vm.relatedSadaqas[val] && vm.relatedSadaqas.findIndex(pro => pro.slug === vm.relatedSadaqas[val].slug) > 0) {
                        val = Math.floor(Math.random() * (activeSadaqas.length));
                    }
                    if (vm.sadaqaDetail.slug === activeSadaqas[val].slug) {
                        val = Math.floor(Math.random() * (activeSadaqas.length));
                    }
                    if (activeSadaqas[val]) {
                        vm.relatedSadaqas.push(activeSadaqas[val]);
                    }
                    count++;
                }

            });
        }

        //Create Sadaqa category
        function addSadaqaCategory() {

            sadaqaService.addSadaqaCategory(getCategoryData()).then(function (res) {

                swal({
                    title: $translate.instant(res.data),
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                }).then(function () {
                    window.location = "#/admin/sadaqalist";
                });
                return res;
            });
        }

        // create category object
        function getCategoryData() {
            var obj = new Object();
            obj.categoryName = vm.SadaqaCategoryName;
            obj.categoryDescription = vm.categoryDescription;
            return obj;

        }

        // get categories
        function getCategories() {

            sadaqaService.getCategories().then(function (res) {
                vm.SadaqaCategories = res.data;
                return res;
            });
        }

        // add new Sadaqa
        function addSadaqa(isValid) {
            if (vm.isCount) {
                vm.validCounter = utilService.countValidator(vm.count.min, vm.count.max, vm.count.interval)
                if (!vm.validCounter) {

                    swal({
                        title: Math.round(vm.count.min) == 0 ? 'Min value must be greater than 0'
                            : Math.round(vm.count.min) > Math.round(vm.count.max) ? 'Min value must be less than max value'
                                : Math.round(vm.count.interval) > Math.round(vm.count.max) / 2
                                    ? 'Interval value must not be greater than half of Max value'
                                    : 'Please insert correct values for min, max and interval',
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

                        let SadaqaObj = getSadaqaData();
                        SadaqaObj.imageLink = imageLink;
                        SadaqaObj.donationProcess = vm.donationProcess;
                        SadaqaObj.programType = vm.programType;
                        SadaqaObj.subCategories = vm.selectedCategory;
                        SadaqaObj.userLang = localStorage.getItem('lang');

                        sadaqaService.addSadaqa(SadaqaObj).then(function (res) {

                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/sadaqalist";
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
            obj.isAmount = vm.isAmount;
            obj.isMinimumAmount = vm.isMinimumAmount;
            obj.isOtherFieldForRP = vm.isOtherFieldForRP;
            if (vm.isRecurring) {
                obj.donationDurations = vm.selectedDonationDurations;
            }
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

        //creat Sadaqa object
        function getSadaqaData() {
            var obj = new Object();
            obj.programName = vm.sadaqaName;
            obj.slug = vm.sadaqaSlug;
            obj.programPriority = vm.programPriority;
            obj.programDescription = jQuery('#addsadaqacat .froala-view').html();

            return obj;
        }

        function deleteAllSubCategory() {
            if (!vm.hasCategories) {
                vm.selectedCategory = [];
            }
        }

        //update Sadaqa
        function updateSadaqa(isValid) {
            if (vm.isCount) {
                vm.validCounter = utilService.countValidator(vm.count.min, vm.count.max, vm.count.interval)
                if (!vm.validCounter) {

                    swal({
                        title: Math.round(vm.count.min) == 0 ? 'Min value must be greater than 0'
                            : Math.round(vm.count.min) > Math.round(vm.count.max) ? 'Min value must be less than max value'
                                : Math.round(vm.count.interval) > Math.round(vm.count.max) / 2
                                    ? 'Interval value must not be greater than half of Max value'
                                    : 'Please insert correct values for min, max and interval',
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
                    let SadaqaObj = getUpdatedSadaqaData();
                    SadaqaObj.imageLink = vm.imageLink;
                    sadaqaService.updateSadaqa(SadaqaObj).then(function (res) {

                        swal({
                            title: $translate.instant(res.data),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/sadaqalist";
                        });
                        return res;
                    });
                }
                else {
                    multipartForm.post('/upload', vm.file).then(function (res) {
                        let SadaqaObj = getUpdatedSadaqaData();
                        SadaqaObj.imageLink = res.data.name;
                        sadaqaService.updateSadaqa(SadaqaObj).then(function (res) {

                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/sadaqalist";
                            });
                            return res;
                        });
                    });
                }
            }
        }

        //get data for Sadaqa update
        function getSadaqaForUpdate() {
            var id = $location.search().sadaqaid;

            sadaqaService.getSadaqaById(id).then(function (res) {
                let data = res.data[0];
                vm.programTypeId = data.programType[0];
                sadaqaService.getCategoriesByProgramType(vm.programTypeId).then(function (res) {
                    vm.sadaqaCategories = res.data;
                    vm.selectedCategory = data.programSubCategory;
                    vm.selectedDonationDurations = data.donationProcess[0].donationDuration;
                    if (vm.selectedCategory.length > 0) {
                        vm.hasCategories = true;
                    }
                    vm.sadaqaCategories.forEach(function (element) {
                        if (_.find(vm.selectedCategory, element)) {
                            element.selected = true;
                        }
                        else {
                            element.selected = false;
                        }
                    }, this);
                    return res;
                });
                programService.getDonationDuration().then(function (res) {
                    vm.donationDurations = res.data;
                    if (vm.selectedDonationDurations.length > 0) {
                        vm.donationDurations.forEach(function (element) {
                            if (_.find(vm.selectedDonationDurations, element)) {
                                element.selected = true;
                            }
                            else {
                                element.selected = false;
                            }
                        }, this);
                    }
                    return res;
                });
                vm.sadaqaId = data._id;
                vm.sadaqaName = data.programName;
                vm.programPriority = data.programPriority;
                vm.sadaqaSlug = data.slug;
                vm.imageLink = data.imageLink;
                let donationProcess = data.donationProcess[0];
                vm.isRecurring = donationProcess.isRecurring;
                vm.isYearAround = donationProcess.isYearAround;
                vm.isDuration = donationProcess.isDuration;
                vm.isAmount = donationProcess.isAmount
                vm.isOtherFieldForRP = donationProcess.isOtherFieldForRP;
                vm.isMinimumAmount = donationProcess.isMinimumAmount;
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
                if (vm.isAmount) {
                    vm.amount = Math.round(donationProcess.amount).toFixed(2);
                }
                if (vm.isMinimumAmount) {
                    vm.minimumAmount = Math.round(donationProcess.minimumAmount).toFixed(2);
                }
                vm.sadaqaDescription = data.programDescription;
                jQuery("#sadaqaDescription .froala-view").html(vm.sadaqaDescription);
                return res;
            });
        }

        //create update Sadaqa object
        function getUpdatedSadaqaData() {
            var obj = new Object();
            obj.id = vm.sadaqaId;
            obj.programName = vm.sadaqaName;
            obj.programPriority = vm.programPriority;
            obj.slug = vm.sadaqaSlug;
            obj.programDescription = jQuery('#sadaqaDescription .froala-view').html();

            //obj.programDescription = vm.sadaqaDescription;
            var donationProcess = new Object();
            donationProcess.isRecurring = vm.isRecurring;
            donationProcess.isDuration = vm.isDuration;
            donationProcess.isAmount = vm.isAmount;
            donationProcess.isMinimumAmount = vm.isMinimumAmount;
            donationProcess.isOtherFieldForRP = vm.isOtherFieldForRP;
            if (donationProcess.isDuration) {
                donationProcess.durationStartDate = vm.StartDate;
                donationProcess.durationEndDate = vm.EndDate;
            }
            donationProcess.isYearAround = vm.isYearAround;
            donationProcess.isCount = vm.isCount;
            if (donationProcess.isRecurring) {
                donationProcess.donationDurations = vm.selectedDonationDurations;
            }
            if (donationProcess.isCount) {
                donationProcess.countMin = vm.count.min;
                donationProcess.countMax = vm.count.max;
                donationProcess.interval = vm.count.interval;
            }
            if (donationProcess.isAmount) {
                donationProcess.amount = Math.round(vm.amount).toFixed(2);
            }
            if (donationProcess.isMinimumAmount) {
                donationProcess.minimumAmount = Math.round(vm.minimumAmount).toFixed(2);
            }
            obj.donationProcess = donationProcess;
            obj.programSubCategory = vm.selectedCategory;

            return obj;
        }

        function saveBasicContent() {
            let sadaqahTxt = document.getElementById("sadaqahTxt").value;
            if (sadaqahTxt == "") {
                document.getElementById("showError").innerText = $translate.instant("PLEASE FILL THE MISSING FIELD");
                document.getElementById("sadaqahTxt").focus();
            }
            else {
                sadaqaService.addSadqaContent({ content: vm.content, _id: vm.programType._id }).then(function (res) {
                    vm.Sadaqas = res.data;
                    return res;
                }, location.reload());
            }

        }

        // get all Sadaqas
        function getSadaqas() {

            if (localStorage.getItem('lang') == 'ARB') {
                sadaqa = "الصدقة";
            } else if (localStorage.getItem('lang') == 'FRN') {
                sadaqa = "Sadaqa";
            } else {
                sadaqa = "Sadaqah";
            }

            programTypeService.getProgramType(sadaqa).then(function (res) {
                if (res.data && res.data.length) {
                    vm.programType = res.data[0];
                    var programTypeId = vm.programType._id;
                    vm.content = vm.programType.content;
                    sadaqaService.getSadaqas(programTypeId).then(function (res) {
                        vm.Sadaqas = res.data;
                        return res;
                    });
                }
            });
        }

        function getActiveSadaqas() {
            if (localStorage.getItem('lang') == 'ARB') {
                sadaqa = "الصدقة";
            } else if (localStorage.getItem('lang') == 'FRN') {
                sadaqa = "Sadaqa";
            } else {
                sadaqa = "Sadaqah";
            }

            programTypeService.getProgramType(sadaqa).then(function (res) {
                vm.programType = res.data[0];
                var programTypeId = vm.programType._id;
                vm.content = vm.programType.content;
                const metaData = {
                    title: 'Sadaqah',
                    description: vm.programType.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.programType.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/religiouspayments/${vm.programType._id}`,
                };
                MetaTagsService.setPageMeta(metaData, vm.programType._id, 'religiouspayments');
                sadaqaService.getSadaqas(programTypeId).then(function (res) {
                    vm.Sadaqas = _.filter(res.data, function (e) {
                        return e.isActive == true;
                    });
                    console.log('Sadaqas', vm.Sadaqas);
                    return res;
                });
            });
        }

        function deleteSadaqa(SadaqaId, status) {
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
                        sadaqaService.deleteSadaqa(SadaqaId).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                'Sadaqa has been deactivated.',
                                'success'
                            )
                            getSadaqas();
                            return res;
                        });
                        // result.dismiss can be 'cancel', 'overlay',
                        // 'close', and 'timer'
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
                sadaqaService.deleteSadaqa(SadaqaId).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        'Sadaqa has been activated.',
                        'success'
                    )
                    getSadaqas();

                    return res;
                });
            }
        }

        jQuery("#txtFromDate").datepicker({
            autoclose: true
        });
        //For Add/Update Sadaqah Form
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

        function getSadaqahCountValues() {

            if ($scope.sadaqaDetail) {
                let min = Math.round($scope.sadaqaDetail.donationProcess[0].countMin);
                let max = Math.round($scope.sadaqaDetail.donationProcess[0].countMax);
                var interval = Math.round($scope.sadaqaDetail.donationProcess[0].interval);
                console.log(min);
                let arry = [{}];
                for (let i = min; i <= max; i += interval) {
                    arry[i - 1] = i;
                }

                $scope.sadaqahCountArray = arry;


            }
        }
        function checkForMultipleRecurringPrograms(obj, result) {
            let addToCart = true;
            if (obj.isRecurringProgram) {

                if (result && result.data.items.length > 0) {
                    const found = result.data.items.some(item => item.isRecurringProgram);
                    if (found) {
                        addToCart = false;
                        vm.clikedCart = false;
                        vm.clickedDonate = false;
                        let eventObj = utilService.getEventObjMultipleSubscription(config.EventConstants.EventTypes.AddingSadaqah);
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

            return addToCart;
        }
    }
})()