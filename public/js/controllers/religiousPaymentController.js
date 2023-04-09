(function () {

    angular.module('mainApp').controller('religiousPaymentController', ReligiousPaymentController);

    function ReligiousPaymentController($scope, $rootScope, $translate, $window, $compile, $location, religiousPaymentService, utilService, currencyService,
        programTypeService, donationProcessService, multipartForm, programService, MetaTagsService, loginService, cartService, occasionService, duaService, $state, donationService, MetaTagsService, config) {

        var vm = this;
        vm.validation = validation;
        vm.religiousPaymentCalculator = "";
        vm.selectedFitrah = "";
        vm.saveIslamicContent = saveIslamicContent;
        $scope.selectedCountryOfResidence = "";
        $scope.religiousPaymentDetailAfterSelection = "";
        $scope.subCategories = "";
        vm.addReligiousPaymentCategory = addReligiousPaymentCategory;
        vm.getReligiousPayments = getReligiousPayments;
        vm.printContent = printContent;
        vm.deleteReligiousPayment = deleteReligiousPayment;
        vm.updateReligiousPayment = updateReligiousPayment;
        vm.getReligiousPaymentForUpdate = getReligiousPaymentForUpdate;
        vm.previewImage = previewImage;
        vm.donationProcess = {};
        vm.religiousPaymentCategoryName = "";
        vm.categoryDescription = "";
        vm.addReligiousPayment = addReligiousPayment;
        vm.religiousPaymentCategories = [];
        vm.getCategories = getCategories;
        vm.selectedCategory = [];
        vm.selectedDonationDurations = [];
        vm.imageUrl = "";
        vm.file = {};
        vm.programType = {};
        vm.subCategories = [];
        vm.getReligiousPaymentDetail = getReligiousPaymentDetail;
        vm.getReligiousPaymentSubCategories = getReligiousPaymentSubCategories;
        vm.getActiveReligiousPayments = getActiveReligiousPayments;
        vm.count = [
            min = 0,
            max = 0,
            interval = 0
        ]
        vm.validCounter = true;
        vm.getProgramType = getProgramType;
        vm.addSubCategoryToList = addSubCategoryToList;
        vm.addOrRemoveSubcategory = addOrRemoveSubcategory;
        vm.durationStartDate = "";
        vm.durationEndDate = "";
        vm.getReligiousPaymentSubCategoryDetail = getReligiousPaymentSubCategoryDetail;
        vm.addorRemoveDonationDuration = addorRemoveDonationDuration;
        vm.selectCalculator = selectCalculator;
        vm.addCartItem = addCartItem;
        vm.donate = donate;
        vm.getCountryList = getCountryList;
        $scope.duaList = [];
        vm.clearCalculator = clearCalculator;
        vm.clearCalculatorFarmaish = clearCalculatorFarmaish;
        vm.categoryIsDetail = false;
        vm.description = {
            para1: '',
            para2: ''
        };
        vm.userLanguage = localStorage.getItem('lang');
        vm.MobileDevice = false;
        $scope.customerNote = null;
        $scope.qurbaniPerformPlace = null;
        $scope.childName = null;

        if (window.innerWidth < 600) {
            vm.MobileDevice = true;
            // vm.projectDescription.length == 200
        }
        $scope.readmoreText = function (text, lines) {
            return utilService.readmoreText(text, lines)
        }

        // for arabic header in print view
        let lang = localStorage.getItem('lang');
        if (lang == 'ARB') {
            vm.printArb = true
        } else if (lang == 'FRN' || lang == 'ENG') {
            vm.printArb = false
        }

        $scope.sendMail = function () {
            const mail = utilService.sendEmail(vm.religiousPaymentDetail.programName, vm.religiousPaymentDetail.programDescription, `religiouspayment_subcategories/${vm.religiousPaymentDetail.slug}`, vm.religiousPaymentDetail.imageLink)
            $window.open(mail);
        }

        vm.hideSubCategories = hideSubCategories;
        vm.showSubCategories = showSubCategories;
        vm.validateKeyStrokes = validateKeyStrokes;
        $scope.selectedCurrencySymbol = JSON.parse(sessionStorage.getItem('currency')).symbol;

        $scope.isNumberKey = function ($event) {
            let amount = String.fromCharCode(event.which || event.keyCode)
            let pattern = /^[0-9]\d*(\.\d+)?$/;
            if (!pattern.test(amount)) {
                event.preventDefault()
            }
        }


        async function getNoteBasedOnSlug(slug) {

            $scope.customerNote = null;
            let messages = await religiousPaymentService.getNoteBasedOnSlug(slug);
            if (messages && messages.data) {
                let note = messages.data.value.translatedMessage[lang];
                $scope.customerNote = note;
            }

        }

        function hideSubCategories() {
            const programName = vm.religiousPaymentDetail.programName;
            return programName != $translate.instant("KHUMS") && programName != $translate.instant('NIYAZ') && programName != $translate.instant('DONATIONS FOR HOLY SHRINES');
        }

        function showSubCategories() {
            const programName = vm.religiousPaymentDetail.programName;
            return programName == $translate.instant("KHUMS") || programName == $translate.instant('NIYAZ') || programName == $translate.instant('DONATIONS FOR HOLY SHRINES');
        }


        function printContent(divName) {
            window.print();
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
        }

        function saveIslamicContent() {
            let islamicPaymentTxt = document.getElementById("islamicPaymentTxt").value;
            if (islamicPaymentTxt == "") {
                document.getElementById("showError").innerText = $translate.instant("PLEASE FILL THE MISSING FIELD");
                document.getElementById("islamicPaymentTxt").focus();
            } else {
                religiousPaymentService.addReligiousPaymentContent({
                    content: vm.content,
                    _id: vm.programType._id
                }).then(function (res) {
                    vm.religiousPayments = res.data;
                    return res;
                }, location.reload());
            }
        }

        function donate() {
            var obj = new Object();
            if (vm.clickedDonate) return;
            vm.clickedDonate = true;
            if (vm.religiousPaymentDetail) {
                obj.program = vm.religiousPaymentDetail;
            } else {
                obj.program = vm.selectedReligiousPayment;
            }
            if (!validation(obj.program)) return vm.clickedDonate = false;
            if (obj.program.donationProcess[0].isCount) {
                obj.count = $scope.selectedCount;
            }


            if ($scope.selectedCategory.amountBasedOnCountry) {
                if ($scope.qurbaniPerformPlace) {
                    obj.performLocation = $scope.qurbaniPerformPlace;
                }
                if (!obj.performLocation) {
                    vm.clickedDonate = false;
                    return showError();
                };
            }


            if (religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" && ($scope.selectedCategory.slug == '-aqiqa' || $scope.selectedCategory.slug == 'aqiqa-')) {
                if ($scope.childName) {
                    obj.aqiqaChildName = $scope.childName;
                }
                if (!obj.aqiqaChildName) {
                    vm.clickedDonate = false;
                    return showError();
                };


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
                    vm.clickedDonate = false;
                }
            }
            if (obj.program.donationProcess[0].isMarhomeenName) {
                obj.marhomeenName = $scope.marhomeenName;
                obj.comment = $scope.marhumeenComment;
            }
            obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
            obj.isRecurring = vm.selectedRecurring;
            if (!!$scope.selectedCategory) {
                obj.isRecurring = vm.selectedRecurring;
                obj.programSubCategory = $scope.selectedCategory;
                if (vm.selectedRecurring) {
                    if ($scope.selectedCategory.isSDOZ) {
                        obj.donationDuration = vm.selectedRecurring;
                        obj.sdoz = $scope.selectedSDOZ;
                    }
                    if (!obj.programSubCategory) {
                        vm.clickedDonate = false;
                        return showError();
                    }
                }
            }
            if ($scope.selectedCategory.isSahm) {
                obj.sahm = $scope.selectedSahm;
                if (!obj.sahm) {
                    vm.clickedDonate = false;
                    return showError();
                }
            }//  if (obj.program.donationProcess[0].isCalendar)
            if ((obj.program.donationProcess[0].isCalendar && religiousPaymentDetailAfterSelection.slug != '-niyaz') || (obj.program.donationProcess[0].isCalendar && religiousPaymentDetailAfterSelection.slug == '-niyaz' && ($scope.selectedCategory.slug == '-others' || $scope.selectedCategory.slug == 'others'))) {
                obj.calendarForSacrifice = $scope.calendarForSacrifice;
                if (!obj.calendarForSacrifice) {
                    vm.clickedDonate = false;
                    return showError();
                }
            }
            if (vm.selectedRecurring) {
                obj.donationDuration = vm.selectedRecurring;
                if (obj.donationDuration !== false && !obj.donationDuration) {
                    vm.clickedDonate = false;
                    return showError();
                }

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
            if ($scope.ocassionList && $scope.ocassionList.length > 0) {
                obj.occasion = $scope.selectedOccasion;
                if (!obj.occasion) {
                    vm.clickedDonate = false;
                    return showError();
                }

            }

            if ($scope.duaList && $scope.duaList.length > 0) {
                obj.dua = $scope.selectedDua;
                if (!obj.dua) {
                    vm.clickedDonate = false;
                    return showError();
                }

            }
            // obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            // obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            // localStorage.setItem("cart", null);
            // localStorage.setItem("cart", JSON.stringify(obj));
            // if ($rootScope.isLogin) {
            //     $window.location.href = "/#/checkout";
            // } else {
            //     jQuery('#globalLoginModal').modal('show');
            // }
            if (vm.otherFieldForNiyaz) {
                obj.otherPersonalityName = vm.otherFieldForNiyaz;
            }
            obj.currency = JSON.parse(sessionStorage.getItem("currency"));
            obj.currency.hajjAmount = vm.hajjAmount;

            cartService.addCartItem(obj).then(function () {
                //   if ($rootScope.isLogin) {
                $rootScope.$broadcast("getCartCounter");
                $state.go("cart");
                vm.clickedDonate = false;
                //   } else {
                //     jQuery("#globalLoginModal").modal("show");
                //   }
            });
        }

        function addCartItem(tab) {
            var obj = new Object();
            if (vm.clickedCart) return;
            vm.clickedCart = true;
            if (vm.religiousPaymentDetail) {
                obj.program = vm.religiousPaymentDetail;
            } else {
                obj.program = vm.selectedReligiousPayment;
            }
            if (!validation(obj.program)) return vm.clickedCart = false;

            if (obj.program.donationProcess[0].isCount) {
                obj.count = $scope.selectedCount;
            }



          
            if ($scope.selectedCategory.amountBasedOnCountry) {

                if ($scope.qurbaniPerformPlace) {
                    obj.performLocation = $scope.qurbaniPerformPlace;
                }
                if (!obj.performLocation) {
                    vm.clickedCart = false;
                    return showError();
                };
            }

            if (religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" && ($scope.selectedCategory.slug == '-aqiqa' || $scope.selectedCategory.slug == 'aqiqa-')) {
                if ($scope.childName) {
                    obj.aqiqaChildName = $scope.childName;
                }
                if (!obj.aqiqaChildName) {
                    vm.clickedCart = false;
                    return showError();
                };


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
            obj.isRecurring = vm.selectedRecurring;
            if (!!$scope.selectedCategory) {
                obj.isRecurring = vm.selectedRecurring;
                obj.programSubCategory = $scope.selectedCategory;
                if (vm.selectedRecurring) {
                    if ($scope.selectedCategory.isSDOZ) {
                        obj.donationDuration = vm.selectedRecurring;
                        obj.sdoz = $scope.selectedSDOZ;
                    }
                    if ($scope.selectedCategory.isSahm) {
                        obj.sahm = $scope.selectedSahm;
                        if (!obj.sahm) {
                            vm.clickedCart = false;
                            return showError();
                        }
                    }
                    if (!obj.programSubCategory) {
                        vm.clickedCart = false;
                        return showError();
                    }
                }
            }
            if ($scope.selectedCategory.isSahm) {
                obj.sahm = $scope.selectedSahm;
                if (!obj.sahm) {
                    vm.clickedCart = false;
                    return showError();
                }
            }
            if ((obj.program.donationProcess[0].isCalendar && religiousPaymentDetailAfterSelection.slug != '-niyaz') || (obj.program.donationProcess[0].isCalendar && religiousPaymentDetailAfterSelection.slug == '-niyaz' && ($scope.selectedCategory.slug == '-others' || $scope.selectedCategory.slug == 'others'))) {
                obj.calendarForSacrifice = $scope.calendarForSacrifice;
                if (!obj.calendarForSacrifice) {
                    vm.clickedCart = false;
                    return showError();
                }
            }
            if (vm.selectedRecurring) {
                obj.donationDuration = vm.selectedRecurring;
                if (obj.donationDuration !== false && !obj.donationDuration) {
                    vm.clickedCart = false;
                    return showError();
                }

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
            if ($scope.ocassionList && $scope.ocassionList.length > 0) {
                obj.occasion = $scope.selectedOccasion;
                if (!obj.occasion) {
                    vm.clickedCart = false;
                    return showError();
                }

            }

            if ($scope.duaList && $scope.duaList.length > 0) {
                obj.dua = $scope.selectedDua;
                if (!obj.dua) {
                    vm.clickedCart = false;
                    return showError();
                }

            }
            if (obj.program.donationProcess[0].isMarhomeenName) {
                obj.marhomeenName = $scope.marhomeenName;
                obj.comment = $scope.marhumeenComment;
            }
            if (vm.otherFieldForNiyaz) {
                obj.otherPersonalityName = vm.otherFieldForNiyaz;
            }
            obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            obj.currency.hajjAmount = vm.hajjAmount;

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
        }

        function validation(program) {
            if (!Math.round($scope.totalAmount || 0) && !Math.round($scope.amount || 0)) return showError();

            if (program.donationProcess[0].isMarhomeenName) {
                //for fixed amount.
                if (!$scope.marhomeenName) return showError();
            }

            if ((program.donationProcess[0].isCalendar && religiousPaymentDetailAfterSelection.slug != '-niyaz') || (program.donationProcess[0].isCalendar && religiousPaymentDetailAfterSelection.slug == '-niyaz' && ($scope.selectedCategory.slug == '-others' || $scope.selectedCategory.slug == 'others'))) {
                if (!$scope.calendarForSacrifice) return showError();
            }
            if (program.donationProcess[0].isFirtahSubType) {
                if (!$scope.selectedFitrahSubType) return showError();
            }
            if (!program.donationProcess[0].isSyed) {
                if (!$scope.totalAmount) return showError();
            }
            if (program.programSubCategory && program.programSubCategory.length) {
                if (!$scope.selectedCategory) return showError();
            }
            if ($scope.ocassionList && $scope.ocassionList.length && !$scope.selectedOccasion) return showError();
            if ($scope.duaList && $scope.duaList.length && !$scope.selectedDua) return showError();

            if ($scope.selectedCategory.isFirtahSubType) {
                if (!$scope.selectedCountryOfResidence) return showError();
                if (!$scope.selectedFitrahSubType) return showError();
                if ($scope.selectedDescend !== false && !$scope.selectedDescend) return showError();
            }
            if (program.isSyed) {
                if ($scope.selectedDescend !== false && !$scope.selectedDescend) return showError();
            }
            if (program.programSubCategory && program.programSubCategory.length) {
                if (program.programSubCategory.find(sc => sc.isSahm && !$scope.selectedSahm)) return showError();
            }
            return true;



        }

        function selectCalculator() {
            let selectedReligiousPayment = vm.selectedReligiousPayment;
            $scope.selectedCategory = null;
            $scope.amountValue = null;
            $scope.totalAmount = undefined;
            $scope.marhomeenName = null;
            $scope.calendarForSacrifice = null;
            getCalculator(selectedReligiousPayment);
        }


        $scope.setAmountBasedOnCountry = function () {
            let countryArray = $scope.selectedCategory.amountBasedOnCountry && $scope.selectedCategory.countryWiseAmount ? $scope.selectedCategory.countryWiseAmount : null;
            let amountToUse = null;
            if (countryArray) {
                let item = countryArray.find(item => item.key == $scope.qurbaniPerformPlace);
                if (item) {
                    amountToUse = item.price;
                }
            }
            else {
                amountToUse = $scope.selectedCategory.fixedAmount
            }
            if (amountToUse) {
                var obj = new Object();
                obj.currency = JSON.parse(sessionStorage.getItem('currency'));
                if (obj.currency.title == "USD") {
                    let fixedAmount = Math.round(amountToUse).toFixed(2);
                    $scope.amountValue = vm.amount = fixedAmount;
                } else {
                    let amount = Math.round(obj.currency.rateExchange * amountToUse).toFixed(2);
                    $scope.amountValue = vm.amount = Math.round(currencyService.currencyConversionFormula(amount)).toFixed(2);
                }
                $scope.countChange();
            }
            else {
                $scope.totalAmount = $scope.amountValue = vm.amount = null
            }
        }
        $scope.countChange = function () {
            $scope.amountValue = vm.amount || 0;

            const selectedOcassion = $scope.selectedOccasion || vm.selectedOccasion;
            const selectedDua = $scope.selectedDua || vm.selectedDua;
            if (selectedOcassion) {
                $scope.totalAmount = Math.round(parseFloat($scope.amountValue) +
                    (selectedOcassion == undefined ? 0 : selectedOcassion.fixedAmount) +
                    (selectedDua == undefined ? 0 : selectedDua.fixedAmount)).toFixed(2) *
                    ($scope.selectedCount || 0);
                $scope.amountValue = Math.round($scope.selectedCategory.fixedAmount +
                    (selectedOcassion == undefined ? 0 : selectedOcassion.fixedAmount) +
                    (selectedDua == undefined ? 0 : selectedDua.fixedAmount)).toFixed(2);
                vm.hajjAmount = $scope.amountValue;
            }
            $scope.totalAmount =
                Math.round(parseFloat($scope.amountValue) * ($scope.selectedCount || 0)).toFixed(2);
        };
        $scope.countChangeForFitrah = function () {
            if (!$scope.selectedCount) {
                $scope.totalAmount = null;
                return;
            }
            var obj = new Object();
            obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.fitrahFixedAmount).toFixed(2);

        }
        $scope.showSpecialFieldsOnSubCategory = function () {
            $scope.marhomeenName = null;
            $scope.marhumeenComment = null;
            $scope.selectedFitrahSubType = null;
            $scope.selectedCountryOfResidence = null;
            $scope.selectedDescend = null;
            $scope.selectedCount = null;
            $scope.amountValue = null;
            $scope.totalAmount = null;
            $scope.calendarForSacrifice = null;
            $scope.religiousPaymentVM.otherFieldForNiyaz = null;
            $scope.childName = null;
            $scope.qurbaniPerformPlace = null;


            if ($scope.selectedCategory) {
                if ($scope.selectedCategory.slug) {
                    getNoteBasedOnSlug($scope.selectedCategory.slug);
                }
            }


            if (!$scope.selectedCategory) {
                vm.clearCalculatorFarmaish();
                return;
            }
            if (!$scope.selectedCategory) {
                $scope.amountValue = null;
                // getReligiousPaymentSubCategories();
                return;
            }
            if ($scope.selectedCategory && $scope.selectedCategory.isSDOZ) {
                vm.religiousPaymentCalculator = "";
                setSubcategory();

                if ($scope.selectedCategory.isCountryFoZiyarat) {
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += " <label>{{ 'COUNTRY OF ZIYARAT' | translate }}</label>";
                    if ($scope.selectedCategory.countryOfZiyarat != null) {
                        $scope.countryName = $scope.selectedCategory.countryOfZiyarat.name;
                        vm.religiousPaymentCalculator += "<input type='text' id='countrtNameTextBox' data-ng-model='countryName' readonly class='form-control' />"
                    }
                    vm.religiousPaymentCalculator += "</div>";
                }

                $scope.sdoz = [];
                sdoz = $scope.selectedCategory.sdoz;
                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label>{{ 'SPECIAL DAYS ZIYARAT' | translate }}</label>";
                vm.religiousPaymentCalculator += "<select class='form-control' ng-model='selectedSDOZ' ng-options='x.name for x in selectedCategory.sdoz'>"
                vm.religiousPaymentCalculator += "</select>";
                vm.religiousPaymentCalculator += "</div>";
                //Get Calculator for Other Fields
                getCalculatorAfterSubcategory();
            } else if ($scope.selectedCategory && $scope.selectedCategory.isFirtahSubType) {
                vm.religiousPaymentCalculator = "";
                setSubcategory();

                $scope.fitrahSubTypes = [];
                fitrahSubTypes = $scope.selectedCategory.fitrahSubTypes;
                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label>{{ 'FITRAH SUBTYPE' | translate }}</label>";
                vm.religiousPaymentCalculator += "<select class='form-control' ng-model='selectedFitrahSubType' ng-change='showSpecialCalculatorForFitrahAndZakat()' ng-options='x.name for x in selectedCategory.fitrahSubTypes'>"
                vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                vm.religiousPaymentCalculator += "</select>";
                vm.religiousPaymentCalculator += "</div>";
                //vm.religiousPaymentCalculator = "";
                //getCalculator(vm.selectedReligiousPayment);
            } else {
                vm.religiousPaymentCalculator = "";
                setSubcategory();
                if ($scope.selectedCategory && $scope.selectedCategory.isSahm) {
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += " <label>{{ 'SELECT SAHM' | translate }}</label>";
                    vm.religiousPaymentCalculator += "<select class='form-control' ng-model='selectedSahm'  ng-options='(x.name | translate) for x in selectedCategory.sahms'>"
                    vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                    vm.religiousPaymentCalculator += "</select>";
                    vm.religiousPaymentCalculator += "</div>";
                }
                if ($scope.selectedCategory && $scope.selectedCategory.isCountryFoZiyarat) {
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += " <label>{{ 'COUNTRY OF ZIYARAT' | translate }}</label>";
                    if ($scope.selectedCategory.countryOfZiyarat != null) {
                        $scope.countryName = $scope.selectedCategory.countryOfZiyarat.name;
                        vm.religiousPaymentCalculator += "<input type='text' id='countrtNameTextBox' data-ng-model='countryName' readonly class='form-control' />"
                    }
                    vm.religiousPaymentCalculator += "</div>";
                }
                getCalculatorAfterSubcategory();
                //get Simple Calculator
            }
            let calculator = $compile(vm.religiousPaymentCalculator)($scope);
            angular.element(document.getElementById("religiousPaymentCalculator")).html("").append(calculator);
            vm.selectedFitrahSubType = undefined;
            vm.selectedCountryOfResidence = undefined;
            if (!angular.isUndefined($scope.selectedCount)) {
                $scope.selectedCount = undefined;
            }
        }

        $scope.setCalendarForDate = function () {
            jQuery(this).on("click", function () {
                jQuery(this).datepicker({
                    autoclose: true
                });
            });
        }

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

        function getCalculator(religiousPaymentDetail) {

            vm.religiousPaymentCalculator = "";

            if (religiousPaymentDetail != undefined) {
                vm.subCategories = religiousPaymentDetail.programSubCategory || [];
                if (vm.subCategories.length) {
                    vm.subCategories = vm.subCategories.filter(o => o.isActive);
                    vm.subCategories = vm.subCategories.sort((a, b) => a.slug < b.slug ? -1 : 1);
                }
                religiousPaymentDetailAfterSelection = religiousPaymentDetail;
                setSubcategory();
                // let calculator = $compile(vm.religiousPaymentCalculator)($scope);
                // angular.element(document.getElementById("religiousPaymentCalculator")).html("").append(calculator);
            }
            let calculator = $compile(vm.religiousPaymentCalculator)($scope);
            angular.element(document.getElementById("religiousPaymentCalculator")).html("").append(calculator);
        }

        function setSubcategory() {
            if (religiousPaymentDetailAfterSelection.programSubCategory != undefined ? religiousPaymentDetailAfterSelection.programSubCategory.length > 0 : false) {

                let labelkey = religiousPaymentDetailAfterSelection.slug == "-niyaz" ? "NIYAZ_OCCASION" :
                    religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" ? "QURBANI_PROGRAM" :
                        religiousPaymentDetailAfterSelection.slug == "hajj-and-ziyarah" ? "REQUEST_TYPE" : "SUB CATEGORY";


                subCategories = religiousPaymentDetailAfterSelection.programSubCategory;
                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label >{{ '" + labelkey + "' | translate }}</label>";
                vm.religiousPaymentCalculator += "<select ng-disabled='religiousPaymentVM.isDetail == undefined ? false : religiousPaymentVM.isDetail' ng-change='showSpecialFieldsOnSubCategory()' class='form-control' ng-model='selectedCategory'  ng-options='x.programSubCategoryName for x in religiousPaymentVM.subCategories'>"
                vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                vm.religiousPaymentCalculator += "</select>";
                vm.religiousPaymentCalculator += "</div>";
            } else {
                getCalculatorAfterSubcategory();
            }
        }

        $scope.showSpecialCalculatorForFitrahAndZakat = function () {
            vm.religiousPaymentCalculator = "";
            setSubcategory();
            selectedFitrah = $scope.selectedFitrahSubType;
            var obj = new Object();
            obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            if (obj.currency.title == "USD") {
                $scope.fitrahFixedAmount = Math.round(selectedFitrah.fitrahSubTypeAmount).toFixed(2);
            } else {
                $scope.fitrahFixedAmount = Math.round(currencyService.currencyConversionFormula(obj.currency.rateExchange * selectedFitrah.fitrahSubTypeAmount)).toFixed(2);
            }

            let donationProcess = religiousPaymentDetailAfterSelection.donationProcess[0];

            $scope.fitrahSubTypes = [];
            fitrahSubTypes = $scope.selectedCategory.fitrahSubTypes;
            vm.religiousPaymentCalculator += "<div class='form-group'>";
            vm.religiousPaymentCalculator += " <label>{{ 'FITRAH SUBTYPE' | translate }}</label>";
            vm.religiousPaymentCalculator += "<select class='form-control' ng-model='selectedFitrahSubType' ng-change='showSpecialCalculatorForFitrahAndZakat()' ng-options='x.name for x in selectedCategory.fitrahSubTypes'>"
            vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            vm.religiousPaymentCalculator += "</select>";
            vm.religiousPaymentCalculator += "</div>";

            vm.religiousPaymentCalculator += "<div class='form-group'>";
            vm.religiousPaymentCalculator += " <label>{{ 'COUNTRY OF RESIDENCE' | translate }}</label>";
            vm.religiousPaymentCalculator += "<select class='form-control' ng-model='selectedCountryOfResidence'  ng-options='x.name for x in countriesForResidence'>"
            vm.religiousPaymentCalculator += "<option value= ''>---{{'PLEASE SELECT' | translate}}---</option>";
            vm.religiousPaymentCalculator += "</select>";
            vm.religiousPaymentCalculator += "</div>";

            if (religiousPaymentDetailAfterSelection.isSyed) {
                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label >{{ 'DESCEND' | translate }}</label>";
                vm.religiousPaymentCalculator += "<select class='form-control' ng-model='selectedDescend'>";
                vm.religiousPaymentCalculator += " <option  value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                vm.religiousPaymentCalculator += " <option ng-value='false' >{{'NONSYED' | translate}}</option>";
                vm.religiousPaymentCalculator += " <option ng-value='true'>{{'SYED' | translate}}</option>";
                vm.religiousPaymentCalculator += "</select>";
                vm.religiousPaymentCalculator += "</div>";
            }
            vm.religiousPaymentCalculator += "<div class='form-group'>";
            vm.religiousPaymentCalculator += " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
            vm.religiousPaymentCalculator += " <label id='fixedAmountValue' ></label>";
            vm.religiousPaymentCalculator += "<div class='input-group'>"
            vm.religiousPaymentCalculator += "<div class='input-icon'>"
            vm.religiousPaymentCalculator += "<input type='text' ng-keypress='isNumberKey($event)' min='0' id='amountTextBox' ng-keyup='countChangeForFitrah()' data-ng-model='fitrahFixedAmount' readonly class='form-control' ng-disabled='amountValue' />"
            vm.religiousPaymentCalculator += "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>"
            vm.religiousPaymentCalculator += "</div>";
            vm.religiousPaymentCalculator += "</div>";
            vm.religiousPaymentCalculator += "</div>";

            vm.isCount = donationProcess.isCount;
            if (donationProcess.isCount) {
                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label >{{ 'COUNT' | translate }}</label>";

                vm.religiousPaymentCalculator += "   <select id='zakahCountSelect' class='form-control' data-ng-model='selectedCount' ng-change='countChangeForFitrah()'>";
                vm.religiousPaymentCalculator += "<option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                let min = Math.round(donationProcess.countMin);
                let max = Math.round(donationProcess.countMax);
                var interval = Math.round(donationProcess.interval);
                for (let i = min; i <= max; i += interval) {
                    vm.religiousPaymentCalculator += "      <option ng-value='" + i + "'>" + i + "</option>";
                }
                vm.religiousPaymentCalculator += "</select>";
                vm.religiousPaymentCalculator += "</div>";
            }
            vm.religiousPaymentCalculator += "<div class='form-group'>";
            vm.religiousPaymentCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
            vm.religiousPaymentCalculator += " <div class='input-group'>";



            //vm.religiousPaymentCalculator += "<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
            //vm.religiousPaymentCalculator += " <i class=''>{{selectedCurrencySymbol}}</i>";
            //vm.religiousPaymentCalculator += "</div>";
            vm.religiousPaymentCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='0'  data-ng-disabled='religiousPaymentVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
            vm.religiousPaymentCalculator += "</div>";
            vm.religiousPaymentCalculator += "</div>";

            vm.religiousPaymentCalculator += "<div ng-show='customerNote != null' class='form-group' > ";
            // vm.religiousPaymentCalculator +=  " ";
            vm.religiousPaymentCalculator += "<label><span class='commentTxt-grey-Box' ng-bind-html='customerNote'></span></label> ";
            vm.religiousPaymentCalculator += "</div>";


            vm.religiousPaymentCalculator += "<div class='row'>";
            vm.religiousPaymentCalculator += "   <div class='col-md-6 col-sm-6 col-xs-6 no-padding text_center'>";
            vm.religiousPaymentCalculator += "      <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='religiousPaymentVM.addCartItem();'>{{'ADD TO CART' | translate}}</button>";
            vm.religiousPaymentCalculator += "   </div>";
            vm.religiousPaymentCalculator += "   <div class='col-md-6 col-sm-6 col-xs-6 no-padding text_center'>";
            vm.religiousPaymentCalculator += "      <button class='grop-btn-donate  grop-btn_submit' data-ng-click='religiousPaymentVM.donate();'>{{'DONATE NOW' | translate}}</button>";
            vm.religiousPaymentCalculator += "   </div>";
            vm.religiousPaymentCalculator += "</div>";

            let calculator = $compile(vm.religiousPaymentCalculator)($scope);
            angular.element(document.getElementById("religiousPaymentCalculator")).html("").append(calculator);
        }

        jQuery('#religiousPaymentCalculator').bind("DOMSubtreeModified", function () {
            var nullOption = jQuery("#zakahCountSelect option[value='? object:null ?']");
            if (nullOption.length > 0) {
                nullOption.remove();
                $scope.selectedCount = undefined;
            }
        });

        $scope.getOcassionBySubCat = function (subCatId) {
            occasionService.getOcassionBySubCat(subCatId)
                .then(function (res) {
                    $scope.ocassionList = res.data;
                });
        }

        $scope.getDuasByOcassion = function (ocassionId) {
            duaService.getDuasByOcassion(ocassionId)
                .then(function (res) {
                    $scope.duaList = res.data;
                });
        }

        function validateKeyStrokes(event) {
            var charCode = (event.which) ? event.which : event.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            return true;
        }

        function getCalculatorAfterSubcategory() {
            let donationProcess = religiousPaymentDetailAfterSelection.donationProcess[0] || {};
            if ($scope.selectedCategory.slug == "rad-el-mazaalim") {
                donationProcess.isCount = false;
            }
            if ($scope.selectedCategory && $scope.selectedCategory._id) {
                $scope.getOcassionBySubCat($scope.selectedCategory._id);
            }
            vm.religiousPaymentCalculator += "<div class='form-group' ng-show='ocassionList.length > 0 ? true : false'>";
            vm.religiousPaymentCalculator += " <label >{{ 'OCCASION' | translate }}</label>";
            vm.religiousPaymentCalculator += "<select ng-change='getDuasByOcassion(selectedOccasion._id);countChange();' class='form-control' ng-model='selectedOccasion' ng-options='o.occasionName for o in ocassionList'>"
            vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            vm.religiousPaymentCalculator += "</select>";
            vm.religiousPaymentCalculator += "</div>";
            vm.religiousPaymentCalculator += "<div class='form-group' ng-show='duaList.length > 0 ? true : false'>";
            vm.religiousPaymentCalculator += " <label >{{ 'ZIYARAH' | translate }}</label>";
            vm.religiousPaymentCalculator += "<select class='form-control' ng-change='countChange()' ng-model='selectedDua' ng-options='d.duaName for d in duaList'>"
            vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            vm.religiousPaymentCalculator += "</select>";
            vm.religiousPaymentCalculator += "</div>";

            //check if amount is fixed.
            if (donationProcess.isAmount) {
                if (donationProcess.isMarhomeenName) {
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    if (religiousPaymentDetailAfterSelection.programName == 'Hajj & Ziyarah') {
                        vm.religiousPaymentCalculator += " <label >{{ 'MARHUMNAME' | translate }}</label>";
                    } else {
                        vm.religiousPaymentCalculator += " <label >{{ 'BENEFICIARYMARHUMNAME' | translate }}</label>";
                    }
                    vm.religiousPaymentCalculator += "<input type='text' maxlength='85' class='form-control' data-ng-model='marhomeenName' />"
                    vm.religiousPaymentCalculator += "</div>";
                }

                var obj = new Object();
                obj.currency = JSON.parse(sessionStorage.getItem('currency'));
                if (obj.currency.title == "USD") {
                    let fixedAmount = Math.round(donationProcess.amount).toFixed(2);
                    $scope.amountValue = fixedAmount;

                } else {
                    let amount = Math.round(obj.currency.rateExchange * donationProcess.amount).toFixed(2);
                    $scope.amountValue = Math.round(currencyService.currencyConversionFormula(amount)).toFixed(2);
                }


                vm.amount = $scope.amountValue;

                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
                vm.religiousPaymentCalculator += " <label id='fixedAmountValue' ></label>";
                vm.religiousPaymentCalculator += "<div class='input-group'>"
                vm.religiousPaymentCalculator += "<div class='input-icon'>"
                vm.religiousPaymentCalculator += "<input type='text' ng-keypress='isNumberKey($event)' min='0' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='amountValue' />"
                vm.religiousPaymentCalculator += "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>"
                vm.religiousPaymentCalculator += "</div>";
                vm.religiousPaymentCalculator += "</div>";
                vm.religiousPaymentCalculator += "</div>";

                vm.isCount = donationProcess.isCount;
                if (donationProcess.isCount) {

                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += " <label >{{ 'COUNT' | translate }}</label>";

                    vm.religiousPaymentCalculator += "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
                    vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";

                    let min = Math.round(donationProcess.countMin);
                    let max = Math.round(donationProcess.countMax);
                    var interval = Math.round(donationProcess.interval);
                    for (let i = min; i <= max; i += interval) {
                        vm.religiousPaymentCalculator += "      <option ng-value='" + i + "'>" + i + "</option>";
                    }
                    vm.religiousPaymentCalculator += "</select>";
                    vm.religiousPaymentCalculator += "</div>";
                }
                if (donationProcess.isCalendar) {

                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += "<label for=''>{{ 'CALENDAR' | translate }}</label>";
                    vm.religiousPaymentCalculator += "<div class='input-group date'>";
                    vm.religiousPaymentCalculator += "<div class='input-group-addon'>";
                    vm.religiousPaymentCalculator += "<i class='fa fa-calendar'></i>";
                    vm.religiousPaymentCalculator += "</div>";
                    vm.religiousPaymentCalculator += "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='calendarForSacrifice' data-date-format='dd/mm/yyyy'>";

                    vm.religiousPaymentCalculator += "</div>";
                    vm.religiousPaymentCalculator += "</div>";

                    vm.religiousPaymentCalculator += "<script>";
                    vm.religiousPaymentCalculator += "jQuery('#txtFromDate').datepicker({";
                    vm.religiousPaymentCalculator += " autoclose: true,startDate: new Date(new Date().setDate(new Date().getDate() + 2))";
                    vm.religiousPaymentCalculator += "});";
                    vm.religiousPaymentCalculator += "jQuery('.fa-calendar').click(function(){";
                    vm.religiousPaymentCalculator += "    jQuery(document).ready(function(){";
                    vm.religiousPaymentCalculator += "        jQuery('#txtFromDate').datepicker().focus();";
                    vm.religiousPaymentCalculator += "var position = jQuery('#txtFromDate').offset().top;";
                    vm.religiousPaymentCalculator += "position = position - 300;";
                    vm.religiousPaymentCalculator += "angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: '' + (position) + 'px' });";
                    vm.religiousPaymentCalculator += "    });";
                    vm.religiousPaymentCalculator += "});";
                    vm.religiousPaymentCalculator += "</script>";

                }
                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
                vm.religiousPaymentCalculator += " <div class='input-group'>";

                //vm.religiousPaymentCalculator += "<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                //vm.religiousPaymentCalculator += " <i class=''>{{selectedCurrencySymbol}}</i>";
                //vm.religiousPaymentCalculator += "</div>";
                vm.religiousPaymentCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='0'  data-ng-disabled='religiousPaymentVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                vm.religiousPaymentCalculator += "</div>";
                vm.religiousPaymentCalculator += "</div>";

                vm.religiousPaymentCalculator += "<div ng-if='customerNote != null' class='form-group' > ";
                // vm.religiousPaymentCalculator +=  " ";
                vm.religiousPaymentCalculator += "<label><span class='commentTxt-grey-Box' ng-bind-html='customerNote'></span></label> ";
                vm.religiousPaymentCalculator += "</div>";
            } else {
                if (donationProcess.isMarhomeenName) {
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    if (religiousPaymentDetailAfterSelection.programName == 'Hajj & Ziyarah') {
                        vm.religiousPaymentCalculator += " <label >{{ 'MARHUMNAME' | translate }}</label>";
                    } else {
                        vm.religiousPaymentCalculator += " <label >{{ 'BENEFICIARYMARHUMNAME' | translate }}</label>";
                    }
                    vm.religiousPaymentCalculator += "<input type='text' maxlength='85' class='form-control' data-ng-model='marhomeenName' />"
                    vm.religiousPaymentCalculator += "</div>";
                }
                if (donationProcess.isRecurring) {
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
                    vm.religiousPaymentCalculator += "<select  class='form-control' ng-model='religiousPaymentVM.selectedRecurring'><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>"
                    vm.religiousPaymentCalculator += "</div>";

                }
                if (donationProcess.isRecurring) {
                    vm.donationDuration = donationProcess.donationDuration;
                    vm.religiousPaymentCalculator += "<div class='form-group' data-ng-show='religiousPaymentVM.selectedRecurring==true'>";
                    vm.religiousPaymentCalculator += " <label >{{ 'DURATION' | translate }}</label>";
                    vm.religiousPaymentCalculator += "<select class='form-control' ng-model='religiousPaymentVM.selectedDonationDuration' ng-options='x.donationDurationName for x in religiousPaymentVM.donationDuration'>";
                    vm.religiousPaymentCalculator += "</select>";
                    vm.religiousPaymentCalculator += "</div>";
                }
                if (religiousPaymentDetailAfterSelection.isSyed) {
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += " <label >{{'DESCEND' | translate}}</label>";
                    vm.religiousPaymentCalculator += "<select class='form-control' ng-model='selectedDescend'>";
                    vm.religiousPaymentCalculator += " <option  value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                    vm.religiousPaymentCalculator += " <option ng-value='false' >{{'NONSYED' | translate}}</option>";
                    vm.religiousPaymentCalculator += " <option ng-value='true'>{{'SYED' | translate}}</option>";
                    vm.religiousPaymentCalculator += "</select>";
                    vm.religiousPaymentCalculator += "</div>";
                }




             

                if ($scope.selectedCategory.amountBasedOnCountry) {

                    let countryList = $scope.selectedCategory.countryWiseAmount;

                    let wherePerform = religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" ? "WHERE_TO_PERFORM" : "COUNTRY";
                    // vm.religiousPaymentCalculator +=
                    //   "<div class='col-md-6 col-xs-12'>";
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator +=
                        " <label >{{  '" + wherePerform + "'  | translate }}</label>";
                    vm.religiousPaymentCalculator +=
                        "   <select class='form-control' data-ng-model='qurbaniPerformPlace' ng-change='setAmountBasedOnCountry();'>";
                    vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";

                    for (let i = 0; i < countryList.length; i++) {
                        vm.religiousPaymentCalculator +=
                            "      <option value='" + countryList[i].key + "'>" + countryList[i][vm.userLanguage] + "</option>";
                    }
                    vm.religiousPaymentCalculator += "</select>";
                    vm.religiousPaymentCalculator += "</div>";
                    // vm.religiousPaymentCalculator += "</div>";
                }


                if (religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" && ($scope.selectedCategory.slug == '-aqiqa' || $scope.selectedCategory.slug == 'aqiqa-')) {

                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator +=
                        " <label >{{ 'CHILD_NAME' | translate }}</label>";
                    vm.religiousPaymentCalculator +=
                        "<input type='text'  class='form-control'  data-ng-model='childName' />";

                    vm.religiousPaymentCalculator += "</div>";

                }

                if ((donationProcess.isCalendar && religiousPaymentDetailAfterSelection.slug != '-niyaz') || (donationProcess.isCalendar && religiousPaymentDetailAfterSelection.slug == '-niyaz' && ($scope.selectedCategory.slug == '-others' || $scope.selectedCategory.slug == 'others'))) {

                    let whenPerform = religiousPaymentDetailAfterSelection.slug == "-niyaz" || "qurbani-(sacrifice)" ? "WHEN_TO_PERFORM" : "CALENDAR";

                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += "<label for=''>{{ '" + whenPerform + "' | translate }}</label>";
                    vm.religiousPaymentCalculator += "<div class='input-group date'>";
                    vm.religiousPaymentCalculator += "<div class='input-group-addon'>";
                    vm.religiousPaymentCalculator += "<i class='fa fa-calendar'></i>";
                    vm.religiousPaymentCalculator += "</div>";
                    vm.religiousPaymentCalculator += "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='calendarForSacrifice' data-date-format='dd/mm/yyyy'>";
                    vm.religiousPaymentCalculator += "</div>";
                    vm.religiousPaymentCalculator += "</div>";

                    vm.religiousPaymentCalculator += "<script>";
                    vm.religiousPaymentCalculator += "jQuery('#txtFromDate').datepicker({";
                    vm.religiousPaymentCalculator += " autoclose: true,startDate: new Date(new Date().setDate(new Date().getDate() + 2))";
                    vm.religiousPaymentCalculator += "});";
                    vm.religiousPaymentCalculator += "jQuery('.fa-calendar').click(function(){";
                    vm.religiousPaymentCalculator += "    jQuery(document).ready(function(){";
                    vm.religiousPaymentCalculator += "        jQuery('#txtFromDate').datepicker().focus();";
                    vm.religiousPaymentCalculator += "var position = jQuery('#txtFromDate').offset().top;";
                    vm.religiousPaymentCalculator += "position = position - 300;";
                    vm.religiousPaymentCalculator += "angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: '' + (position) + 'px' });";
                    vm.religiousPaymentCalculator += "    });";
                    vm.religiousPaymentCalculator += "});";
                    vm.religiousPaymentCalculator += "</script>";
                }
                vm.isCount = donationProcess.isCount;
                if (religiousPaymentDetailAfterSelection.programName != "Zakah") {
                    if (donationProcess.isCount) {

                        if ($scope.selectedCategory && $scope.selectedCategory.isFixedAmount) {
                            var obj = new Object();
                            obj.currency = JSON.parse(sessionStorage.getItem('currency'));
                            if (obj.currency.title == "USD") {
                                let fixedAmount = Math.round($scope.selectedCategory.fixedAmount).toFixed(2);
                                $scope.amountValue = fixedAmount;
                            } else {
                                let fixedAmount = Math.round(obj.currency.rateExchange * $scope.selectedCategory.fixedAmount).toFixed(2);
                                $scope.amountValue = Math.round(currencyService.currencyConversionFormula(fixedAmount)).toFixed(2);
                            }

                            if ($scope.selectedCategory.amountBasedOnCountry) {
                                vm.amount = $scope.amountValue = null;
                            }
                            else {
                                vm.amount = Math.round($scope.amountValue || $scope.selectedCategory.fixedAmount).toFixed(2);
                            }

                            let AmountText = religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" ? "AMOUNT_ANIMAL" : religiousPaymentDetailAfterSelection.slug == "hajj-and-ziyarah" ? "AMOUT_PER_REQUEST" : "AMOUNT";

                            vm.religiousPaymentCalculator += "<div class='form-group'>";
                            vm.religiousPaymentCalculator += " <label id='amountLabel'>{{'" + AmountText + "' | translate}}</label>";
                            vm.religiousPaymentCalculator += " <label id='fixedAmountValue' ></label>";
                            vm.religiousPaymentCalculator += "<div class='input-group'>";
                            vm.religiousPaymentCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='0' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='amountValue' /><i>{{selectedCurrencySymbol}}</i></div>"
                            vm.religiousPaymentCalculator += "</div>";
                            vm.religiousPaymentCalculator += "</div>";
                        } else {
                            vm.amount = undefined;
                            $scope.amountValue = undefined;
                            vm.religiousPaymentCalculator += "<div class='form-group'>";
                            vm.religiousPaymentCalculator += " <label >{{'AMOUNT' | translate}}</label>";
                            vm.religiousPaymentCalculator += " <div class='input-group'>";
                            //vm.religiousPaymentCalculator += "<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                            //vm.religiousPaymentCalculator += " <i class=''>{{selectedCurrencySymbol}}</i>";
                            //vm.religiousPaymentCalculator += "</div>";
                            vm.religiousPaymentCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='0'  data-ng-disabled='religiousPaymentVM.isCount' class='form-control' data-ng-model='totalAmount' style='' /><i>{{selectedCurrencySymbol}}</i></div>"
                            vm.religiousPaymentCalculator += "</div>";
                            vm.religiousPaymentCalculator += "</div>";
                        }




                        let countText = religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" ? "NO_OF_ANIMAL" : religiousPaymentDetailAfterSelection.slug == "hajj-and-ziyarah" ? "NO_OF_REQUESTS" : "COUNT";

                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label >{{'" + countText + "' | translate}}</label>";
                        vm.religiousPaymentCalculator += "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
                        vm.religiousPaymentCalculator += "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
                        let min = Math.round(donationProcess.countMin);
                        let max = Math.round(donationProcess.countMax);
                        var interval = Math.round(donationProcess.interval);
                        for (let i = min; i <= max; i += interval) {
                            vm.religiousPaymentCalculator += "      <option ng-value='" + i + "'>" + i + "</option>";
                        }
                        vm.religiousPaymentCalculator += "</select>";
                        vm.religiousPaymentCalculator += "</div>";



                    }
                }

                if (donationProcess.isOtherFieldForNiyaz || ($scope.selectedCategory && $scope.selectedCategory.programSubCategoryName == $translate.instant('OTHER') || $scope.selectedCategory.programSubCategoryName == $translate.instant('OTHERS'))) {
                    vm.religiousPaymentCalculator += "<div class='form-group'>";
                    vm.religiousPaymentCalculator += " <label >{{'OTHER' | translate}}</label>";
                    vm.religiousPaymentCalculator += "<input type='text' maxlength='85' class='form-control' data-ng-model='religiousPaymentVM.otherFieldForNiyaz'  />"
                    vm.religiousPaymentCalculator += "</div>";
                }

                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label >{{'TOTAL AMOUNT' | translate}}</label>";
                vm.religiousPaymentCalculator += " <div class='input-group'>";








                //     <div ng-show="$parent.isRecurringPaymentPlan && $parent.paymentChargeMessage"
                //     ng-class="{ 'form-group' : ctrl.compactmode == 'false',  'col-md-12 col-xs-12': ctrl.compactmode == 'true' }">
                //     <label><span class='commentTxt' ng-bind-html="$parent.paymentChargeMessage"></span></label>

                // </div>

                //vm.religiousPaymentCalculator += "<div class='input-group-addon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
                //vm.religiousPaymentCalculator += " <i class=''>{{selectedCurrencySymbol}}</i>";
                //vm.religiousPaymentCalculator += "</div>";
                vm.religiousPaymentCalculator += "<div class='input-icon'><input type='text' ng-keypress='isNumberKey($event)' min='0' data-ng-model='totalAmount' class='form-control' ng-disabled='amountValue'/><i>{{selectedCurrencySymbol}}</i></div>"
                vm.religiousPaymentCalculator += "</div>";
                vm.religiousPaymentCalculator += "</div>";

                vm.religiousPaymentCalculator += "<div ng-show='customerNote != null' class='form-group' > ";
                vm.religiousPaymentCalculator += "<label><span class='commentTxt-grey-Box' ng-bind-html='customerNote'></span></label> ";
                vm.religiousPaymentCalculator += "</div>";


                if (religiousPaymentDetailAfterSelection.programName == 'Niyaz' || religiousPaymentDetailAfterSelection.programName == "الإطعام") {
                    let language = localStorage.getItem('lang');
                    if (language == 'ARB') {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>نود لفت إنتباهكم أن طلبات توزيع البركة في مناسبات محددة يجب أن تتم قبل 48 ساعة من موعد المناسبة، و إلا سيتم إدراج المساهمة في صندوق البركة العام.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    } else if (language == 'FRN') {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>Veuillez noter que les demandes concernant les Niyaz lors d'occasions assignés doivent être adressées (48) heures à l'avance, faute de quoi la contribution servira de fonds pour le général Niyaz.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    } else {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>Please note, requests for Niyaz on auspicious occasions must be made (48) hours in advance or else the contribution will be used as general Niyaz fund.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    }
                } else if (religiousPaymentDetailAfterSelection.programName == 'Khums' || religiousPaymentDetailAfterSelection.programName == "الخمس") {
                    let language = localStorage.getItem('lang');

                    if (language == 'ARB') {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>إخلاء طرف: نحن مجرد وسيط. سنقوم بتسليم الأموال إلى مكتب المرجع .و سيتم تقديم إيصال من مكتب المرجع خلال 15 يوم عمل.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    } else if (language == 'FRN') {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>A titre indicatif : Nous ne sommes qu'un intermédiaire. Nous allons livrer les fonds fournis par vos soins au bureau du Marja respectif. Notez qu'un reçu original sera édité par le bureau du Marja dans les 15 jours ouvrables.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    } else {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>Disclaimer: We are just an intermediary. We will be delivering the funds to the office of the respective Marja. Note that an original receipt will be provided from the office of the Marja within 15 working days.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    }
                }

            }

            if ((religiousPaymentDetailAfterSelection.slug == 'ibadaat-for-marhumeen') && ($scope.selectedCategory != undefined || $scope.selectedCategory != null)) {
                if ($scope.selectedCategory.slug == "qadha-salaah"
                    // $scope.selectedCategory.programSubCategoryName == "Qadha Salaah" || 
                    // $scope.selectedCategory.programSubCategoryName == "صلاة القضاء" || 
                    // $scope.selectedCategory.programSubCategoryName == "Qadha Salaah")) 
                ) {
                    let language = localStorage.getItem('lang');
                    if (language == 'ARB') {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>يرجى ملاحظة أن قضاء الصلاة السنوية عن الميت تتضمن قضاء أربعة من صلاة الآيات.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    } else if (language == 'FRN') {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>Veuillez noter que les Qadha Salaah pour le marhum comprend (04) Salaat Al Ayaat.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    } else {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>Please note that Qadha Salaah for the marhum includes (04) Salaat Al Ayaat. </span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    }
                } else if (($scope.selectedCategory.programSubCategoryName == "Salaat Al Ayat" || $scope.selectedCategory.programSubCategoryName == "Salaat Al Ayaat" || $scope.selectedCategory.programSubCategoryName == "صلاة الآيات")) {
                    let language = localStorage.getItem('lang');
                    if (language == 'ARB') {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>يرجى ملاحظة أن قضاء الصلاة السنوية عن الميت تتضمن قضاء أربعة من صلاة الآيات.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    } else if (language == 'FRN') {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>Veuillez noter que (04) Salaat Al Ayaat sont inclus dans le pack annuel Qadha Salaah.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    } else {
                        vm.religiousPaymentCalculator += "<div class='form-group'>";
                        vm.religiousPaymentCalculator += " <label><span class='commentTxt'>Please note that Qadha Salaah for the marhum includes (04) Salaat Al Ayaat.</span></label>";
                        vm.religiousPaymentCalculator += "</div>";
                    }
                } else {
                    // vm.religiousPaymentCalculator += "<div class='form-group'>";
                    // vm.religiousPaymentCalculator += " <label ><span class='commentTxt'>{{ 'NOTE' | translate }}: {{ 'IBADAATOFMARHUMEEN' | translate }}</span></label>";
                    // vm.religiousPaymentCalculator += "</div>";
                }
                vm.religiousPaymentCalculator += "<div class='form-group'>";
                vm.religiousPaymentCalculator += " <label >{{'COMMENT' | translate}}</label>";
                vm.religiousPaymentCalculator += "<textarea class='form-control' data-ng-model='marhumeenComment' rows='3'></textarea>"

                vm.religiousPaymentCalculator += "</div>";
            }

            vm.religiousPaymentCalculator += "<div class='row'>";
            vm.religiousPaymentCalculator += "   <div class='col-md-6 col-sm-6 col-xs-6 no-padding text_center'>";
            vm.religiousPaymentCalculator += "      <button class='grop-btn-addcart  grop-btn_submit' data-ng-click='religiousPaymentVM.addCartItem();'>{{'ADD TO CART' | translate}}</button>";
            vm.religiousPaymentCalculator += "   </div>";
            vm.religiousPaymentCalculator += "   <div class='col-md-6 col-sm-6 col-xs-6 no-padding text_center'>";
            vm.religiousPaymentCalculator += "      <button class='grop-btn-donate  grop-btn_submit' data-ng-click='religiousPaymentVM.donate();'>{{'DONATE NOW' | translate}}</button>";
            vm.religiousPaymentCalculator += "   </div>";
            vm.religiousPaymentCalculator += "</div>";
        }


        function clearCalculator() {
            $scope.marhumeenComment = "";
            if (vm.categoryIsDetail) {
                getReligiousPaymentSubCategories();
                vm.selectedReligiousPayment = undefined;
            } else if (vm.isDetail) {
                getReligiousPaymentSubCategoryDetail();
            } else {

                vm.selectedReligiousPayment = undefined;
                vm.religiousPaymentCalculator = "";
                let calculator = $compile(vm.religiousPaymentCalculator)($scope);
                angular.element(document.getElementById("religiousPaymentCalculator")).html("").append(calculator);
            }
        }

        function clearCalculatorFarmaish() {
            if (vm.categoryIsDetail) {
                getReligiousPaymentSubCategories();
                // vm.selectedReligiousPayment = undefined;
            } else if (vm.isDetail) {
                getReligiousPaymentSubCategoryDetail();
            } else {

                // vm.selectedReligiousPayment = undefined;
                $scope.selectedCategory = null;
                vm.religiousPaymentCalculator = "";
                let calculator = $compile(vm.religiousPaymentCalculator)($scope);
                angular.element(document.getElementById("religiousPaymentCalculator")).html("").append(calculator);
                vm.selectCalculator()
            }
        }

        function addSubCategoryToList() {
            if (vm.subCategories.indexOf(vm.subCategoryValue) != -1) { } else {
                vm.subCategories.push(vm.subCategoryValue);
                vm.subCategoryValue = "";
            }
        }

        function previewImage() {
            var image = vm.file;
        }

        //load type Religious Payment in program type
        function getProgramType() {
            if (localStorage.getItem('lang') == 'ARB') {
                religiousPayment = "المدفوعات الدينية";
            } else if (localStorage.getItem('lang') == 'FRN') {
                religiousPayment = "Paiements religieux";
            } else {
                religiousPayment = "Religious Payments";
            }
            programTypeService.getProgramType(religiousPayment).then(function (res) {
                vm.programType = res.data[0];
                vm.religiousPaymentSlug = res.data[0] && res.data[0].slug;
                religiousPaymentService.getCategoriesByProgramType(vm.programType._id).then(function (res) {
                    vm.religiousPaymentCategories = res.data;
                    return res;
                });
                programService.getDonationDuration().then(function (res) {
                    vm.donationDurations = res.data;
                    return res;
                });
                return res.data[0];
            });
        }

        //Create Religious Payment Category
        function addReligiousPaymentCategory() {
            religiousPaymentService.addReligiousPaymentCategory(getCategoryData()).then(function (res) {
                swal({
                    paddreligiousPaymentosition: 'center-center',
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
            obj.categoryName = vm.religiousPaymentCategoryName;
            obj.categoryDescription = vm.categoryDescription;
            return obj;

        }

        // get categories
        function getCategories() {
            religiousPaymentService.getCategories().then(function (res) {
                vm.religiousPaymentCategories = res.data;
                return res;
            });
        }

        // add new Religious Payment
        function addReligiousPayment(isValid) {
            if (vm.isCount) {
                vm.validCounter = utilService.countValidator(vm.count.min, vm.count.max, vm.count.interval)
                if (!vm.validCounter) {

                    swal({
                        title: Math.round(vm.count.min) == 0 ? 'Min Value must be greater than 0' : Math.round(vm.count.min) > Math.round(vm.count.max) ? 'Min Value must be less than Max Value' : Math.round(vm.count.interval) > Math.round(vm.count.max) / 2 ?
                            'Interval value must not be greater than half of Max value' : 'Please Insert Correct Values for Min, Max and Interval',
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

                        let religiousPaymentObj = getReligiousPaymentData();
                        religiousPaymentObj.imageLink = imageLink;
                        religiousPaymentObj.donationProcess = vm.donationProcess;
                        religiousPaymentObj.programType = vm.programType;
                        religiousPaymentObj.subCategories = vm.selectedCategory;
                        religiousPaymentObj.isSyed = vm.isSyed;
                        religiousPaymentObj.userLang = localStorage.getItem('lang');
                        religiousPaymentService.addReligiousPayment(religiousPaymentObj).then(function (res) {

                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/religiousPaymentslist";
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
            obj.isMarhomeenName = vm.isMarhomeenName;
            obj.isOtherFieldForNiyaz = vm.isOtherFieldForNiyaz;
            obj.isCount = vm.isCount;
            obj.isAmount = vm.isAmount;
            obj.isMinimumAmount = vm.isMinimumAmount;
            obj.isCalendar = vm.isCalendar;

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

        //creat Religious Payment object
        function getReligiousPaymentData() {
            var obj = new Object();
            obj.programName = vm.religiousPaymentName;
            obj.programPriority = vm.programPriority;
            obj.programDescription = jQuery('#addreligiouspayment .froala-view').html();

            return obj;
        }

        //update Religious Payment
        function updateReligiousPayment(isValid) {
            if (vm.isCount) {
                vm.validCounter = utilService.countValidator(vm.count.min, vm.count.max, vm.count.interval)
                if (!vm.validCounter) {

                    swal({
                        title: Math.round(vm.count.min) == 0 ? 'Min Value must be greater than 0' : Math.round(vm.count.min) > Math.round(vm.count.max) ? 'Min Value must be less than Max Value' : Math.round(vm.count.interval) > Math.round(vm.count.max) / 2 ?
                            'Interval value must not be greater than half of Max value' : 'Please Insert Correct Values for Min, Max and Interval',
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
                    let religiousPaymentObj = getUpdatedReligiousPaymentData();
                    religiousPaymentObj.imageLink = vm.imageLink;
                    religiousPaymentService.updateReligiousPayment(religiousPaymentObj).then(function (res) {
                        swal({
                            title: $translate.instant(res.data),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/religiousPaymentslist";
                        });
                        return res;
                    });
                } else {
                    multipartForm.post('/upload', vm.file).then(function (res) {
                        let religiousPaymentObj = getUpdatedReligiousPaymentData();
                        religiousPaymentObj.imageLink = res.data.name;
                        religiousPaymentService.updateReligiousPayment(religiousPaymentObj).then(function (res) {
                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/religiousPaymentslist";
                            });
                            return res;
                        });
                    });
                }
            }
        }

        //get data for religious payment update
        function getReligiousPaymentForUpdate() {
            var id = $location.search().religiousPaymentId;

            religiousPaymentService.getReligiousPaymentById(id).then(function (res) {
                let data = res.data[0];
                vm.programTypeId = data.programType[0];
                religiousPaymentService.getCategoriesByProgramType(vm.programTypeId).then(function (res) {
                    vm.religiousPaymentCategories = res.data;
                    vm.selectedCategory = data.programSubCategory;
                    vm.selectedDonationDurations = data.donationProcess[0].donationDuration;
                    if (vm.selectedCategory.length > 0) {
                        vm.hasCategories = true;
                    }
                    vm.religiousPaymentCategories.forEach(function (element) {
                        if (vm.selectedCategory.find(c => c._id === element._id))
                            element.selected = true;
                        else {
                            element.selected = false;
                        }
                        // if (_.find(vm.selectedCategory, element)) {
                        // }
                    }, this);
                    return res;
                });
                programService.getDonationDuration().then(function (res) {
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
                vm.religiousPaymentId = data._id;
                vm.religiousPaymentName = data.programName;
                vm.programPriority = data.programPriority;
                vm.imageLink = data.imageLink;
                vm.religiousPaymentSlug = data.slug;
                let donationProcess = data.donationProcess[0];
                vm.isRecurring = donationProcess.isRecurring;
                vm.isYearAround = donationProcess.isYearAround;
                vm.isMarhomeenName = donationProcess.isMarhomeenName;
                vm.isCalendar = donationProcess.isCalendar;
                vm.isOtherFieldForNiyaz = donationProcess.isOtherFieldForNiyaz;
                vm.isDuration = donationProcess.isDuration;
                vm.isSyed = data.isSyed;
                vm.isMinimumAmount = donationProcess.isMinimumAmount;

                vm.isAmount = donationProcess.isAmount;
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
                if (vm.isAmount) {
                    vm.amount = Math.round(donationProcess.amount).toFixed(2);
                }
                if (vm.isMinimumAmount) {
                    vm.minimumAmount = Math.round(donationProcess.minimumAmount).toFixed(2);
                }
                vm.isCount = donationProcess.isCount;
                if (vm.isCount) {
                    vm.count.min = donationProcess.countMin;
                    vm.count.max = donationProcess.countMax;
                    vm.count.interval = donationProcess.interval;
                }
                vm.religiousPaymentDescription = data.programDescription;

                vm.upreligiouspayment = data.programDescription;
                jQuery("#upreligiouspayment .froala-view").html(vm.upreligiouspayment);
                return res;
            });
        }

        //create update religious object
        function getUpdatedReligiousPaymentData() {
            var obj = new Object();
            obj.id = vm.religiousPaymentId;
            obj.programPriority = vm.programPriority;
            obj.programName = vm.religiousPaymentName;
            obj.programDescription = vm.religiousPaymentDescription;
            obj.slug = vm.religiousPaymentSlug;
            obj.programDescription = jQuery('#upreligiouspayment .froala-view').html();

            var donationProcess = new Object();
            donationProcess.isRecurring = vm.isRecurring;
            donationProcess.isYearAround = vm.isYearAround;
            donationProcess.isMarhomeenName = vm.isMarhomeenName;
            donationProcess.isOtherFieldForNiyaz = vm.isOtherFieldForNiyaz;
            donationProcess.isDuration = vm.isDuration;
            donationProcess.isAmount = vm.isAmount;
            donationProcess.isCalendar = vm.isCalendar;
            donationProcess.isMinimumAmount = vm.isMinimumAmount;
            if (donationProcess.isDuration) {
                donationProcess.durationStartDate = vm.StartDate;
                donationProcess.durationEndDate = vm.EndDate;
            }
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
            obj.isSyed = vm.isSyed;
            obj.programSubCategory = vm.selectedCategory;
            return obj;
        }

        // get all Religious Payments
        function getReligiousPayments() {
            if (localStorage.getItem('lang') == 'ARB') {
                religiousPayment = "المدفوعات الدينية";
            } else if (localStorage.getItem('lang') == 'FRN') {
                religiousPayment = "Paiements religieux";
            } else {
                religiousPayment = "Religious Payments";
            }
            programTypeService.getProgramType(religiousPayment).then(function (res) {
                vm.programType = res.data[0];
                var programTypeId = vm.programType._id;
                vm.content = vm.programType.content;
                religiousPaymentService.getReligiousPayments(programTypeId).then(function (res) {
                    vm.religiousPayments = res.data;
                    return res;
                });
            });
        }

        function getActiveReligiousPayments() {

            if (localStorage.getItem('lang') == 'ARB') {
                religiousPayment = "المدفوعات الدينية";
            } else if (localStorage.getItem('lang') == 'FRN') {
                religiousPayment = "Paiements religieux";
            } else {
                religiousPayment = "Religious Payments";
            }
            programTypeService.getProgramType(religiousPayment).then(function (res) {
                vm.programType = res.data[0];
                var programTypeId = vm.programType._id;
                vm.content = vm.programType.content;
                const metaData = {
                    title: 'Islamic Payments',
                    description: vm.programType.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.programType.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/religiouspayments/${vm.programType._id}`,
                };
                MetaTagsService.setPageMeta(metaData, vm.programType._id, 'religiouspayments');
                religiousPaymentService.getReligiousPayments(programTypeId).then(function (res) {
                    vm.religiousPayments = _.filter(res.data, function (e) {
                        return e.isActive == true;
                    });
                    return res;
                });
            });
        }

        function getReligiousPaymentSubCategories() {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            religiousPaymentService.getReligiousPaymentById(id).then(function (res) {
                vm.religiousPaymentDetail = res.data[0];
                const metaData = {
                    title: vm.religiousPaymentDetail.programName,
                    description: vm.religiousPaymentDetail.programDescription,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.religiousPaymentDetail.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/religiouspayment_subcategories/${vm.religiousPaymentDetail._id}`,
                };
                MetaTagsService.setPageMeta(metaData, vm.religiousPaymentDetail._id, 'religiouspayment_subcategories');
                getCalculator(vm.religiousPaymentDetail);
                if (res.data && res.data.length && res.data[0].programSubCategory) {
                    vm.religiousPaymentSubCategories = res.data[0].programSubCategory;
                    vm.religiousPaymentSubCategories.sort((a, b) => a.programPriority - b.programPriority);
                    vm.religiousPaymentSubCategories = vm.religiousPaymentSubCategories.filter(rc => rc.isActive)
                    vm.categoryIsDetail = true;
                }
            });
        }

        function getReligiousPaymentSubCategoryDetail() {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            let programid = $location.search().programid;
            programService.getProgramCategoryById(id).then(function (res) {
                vm.religiousPaymentSubCategoryDetail = res.data;
                const metaData = {
                    title: vm.religiousPaymentSubCategoryDetail.programSubCategoryName,
                    description: vm.religiousPaymentSubCategoryDetail.description,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${vm.religiousPaymentSubCategoryDetail.imageLink}`,
                    url: `${MetaTagsService.SERVER_URL}/#/subcategorydetail/${vm.religiousPaymentSubCategoryDetail._id}/?programid=${programid}`,
                };
                MetaTagsService.setPageMeta(metaData, vm.religiousPaymentSubCategoryDetail._id, 'religiouspayment_subcategories');

                if (vm.religiousPaymentSubCategoryDetail.description != undefined) {
                    if (vm.religiousPaymentSubCategoryDetail.description.length > 1) {
                        let description = vm.religiousPaymentSubCategoryDetail.description.split(' ');
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
                }
                religiousPaymentService.getReligiousPaymentById(programid).then(function (res) {
                    vm.religiousPaymentDetail = res.data[0];
                    getCalculator(vm.religiousPaymentDetail);
                    let selectedCategoryVal = _.find(vm.subCategories, function (o) {
                        return o._id == vm.religiousPaymentSubCategoryDetail._id;
                    });
                    $scope.selectedCategory = selectedCategoryVal;
                    vm.selectedCategory = selectedCategoryVal;
                    $scope.showSpecialFieldsOnSubCategory();
                    vm.isDetail = true;
                    vm.categoryIsDetail = false;
                    getRelatedReligiousPayments(vm.religiousPaymentSubCategoryDetail._id, vm.religiousPaymentSubCategoryDetail.programType._id);
                });
            });
        }

        //get project Detail by id
        function getReligiousPaymentDetail() {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            religiousPaymentService.getReligiousPaymentById(id).then(function (res) {
                vm.religiousPaymentDetail = res.data[0];
                getCalculator(vm.religiousPaymentDetail);
                getRelatedReligiousPayments(vm.religiousPaymentDetail._id, vm.religiousPaymentDetail.programType[0]);
                vm.isDetail = true;
            });
        }

        function getRelatedReligiousPayments(id, programTypeId) {
            var obj = new Object();
            obj.id = id;
            obj.programTypeId = programTypeId;
            obj.userLang = localStorage.getItem('lang');
            religiousPaymentService.getRelatedReligiousPayments(obj).then(function (res) {
                let numberOfReligiousPayment = 2;
                let count = 0;
                var val = 0;
                let activeReligiousPayments = [];
                res.data.forEach(function (e) {
                    if (e.isActive == true) {
                        activeReligiousPayments.push(e);
                    }
                });
                vm.relatedReligiousPayments = [];
                while ((count < numberOfReligiousPayment) && (count < activeReligiousPayments.length)) {
                    val = Math.floor(Math.random() * (activeReligiousPayments.length));
                    if (activeReligiousPayments[val] && activeReligiousPayments[val].slug === vm.religiousPaymentDetail && vm.religiousPaymentDetail.slug) {
                        val = Math.floor(Math.random() * (activeReligiousPayments.length));
                    }
                    if (vm.religiousPaymentDetail.slug === activeReligiousPayments[val].slug) {
                        val = Math.floor(Math.random() * (activeReligiousPayments.length));
                    }
                    if (activeReligiousPayments[val]) {
                        vm.relatedReligiousPayments.push(activeReligiousPayments[val]);
                    }
                    count++;
                }
            });
        }

        function deleteReligiousPayment(religiousPaymentId, status) {
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
                        religiousPaymentService.deleteReligiousPayment(religiousPaymentId).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                'Religious Payment has been deactivated.',
                                'success'
                            )
                            getReligiousPayments();
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
            } else {
                religiousPaymentService.deleteReligiousPayment(religiousPaymentId).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        'Relgious Payment has been Activated.',
                        'success'
                    )
                    getReligiousPayments();

                    return res;
                });
            }

        }

        jQuery("#txtFromDate").datepicker({
            autoclose: true
        });
        //For Add/Update Relgiious Payment Form
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
            angular.element(jQuery('.datepicker-dropdown')[0]).css({
                top: "" + (position) + "px"
            });
        }
        $scope.setPosToDate = function () {
            var position = jQuery("#txtToDate").offset().top;
            position = position - 300;
            angular.element(jQuery('.datepicker-dropdown')[0]).css({
                top: "" + (position) + "px"
            });
        }

        // Function to get country list for Country of Residence in Fitrah Payment
        function getCountryList() {
            religiousPaymentService.getCountryList().then(function (res) {
                $scope.countriesForResidence = res.data;
                $scope.countriesForResidence = $scope.countriesForResidence.map(c => {
                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;
                    }
                    return c;
                })
            });
        }
    }
})()