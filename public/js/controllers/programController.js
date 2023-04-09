(function () {

    angular.module('mainApp').controller('programController', programController);

    function programController($scope, $location, programTypeService, programService, multipartForm, $translate) {

        var vm = this;
        var programData = [];
        vm.sdoz = [];
        vm.sahms = [];
        vm.selectedSDOZ = [];
        vm.selectedSahms = [];
        vm.selectedFitrahSubTypesWithAmount = [];
        vm.result = "";
        vm.programId = "";
        vm.addProgramSubcategory = addProgramSubcategory;
        vm.updateProgramSubcategory = updateProgramSubcategory;
        vm.getPrograms = getPrograms;
        vm.getCountryList = getCountryList;
        vm.getSDOZList = getSDOZList;
        vm.getFirtahSubType = getFirtahSubType;
        vm.getSahms = getSahms;
        vm.addOrRemoveSDOZ = addOrRemoveSDOZ;
        vm.addOrRemoveSahm = addOrRemoveSahm;
        vm.addOrRemoveFitrahSubTypeWithAmount = addOrRemoveFitrahSubTypeWithAmount;
        vm.updateFitrahSubTypeAmount = updateFitrahSubTypeAmount;
        vm.getProgramTypes = getProgramTypes;
        vm.getSubcategoriesByProgramType = getSubcategoriesByProgramType;
        vm.deleteSubCategory = deleteSubCategory;
        vm.getCategoriesWithInActive = getCategoriesWithInActive;
        vm.getProgramTypesForCategoryUpdate = getProgramTypesForCategoryUpdate;
        vm.getSubcategoryDataForUpdate = getSubcategoryDataForUpdate;
        vm.addAnotherCountry = addAnotherCountry;
        vm.removeCountry = removeCountry;
        vm.programTypes = [];
        vm.file = [];
        vm.subTypeAmountError = false;
        // Function to get country list for Country of Ziyarat
        function getCountryList() {
            programService.getCountryList().then(function (res) {
                vm.country = res.data;
                vm.country = vm.country.map(c => {
                    if (localStorage.getItem('lang') === 'FRN') {
                        c.name = c.nameFRN;
                    } else if (localStorage.getItem('lang') === 'ARB') {
                        c.name = c.nameARB;
                    }
                    return c;
                })
            });
        }
        // Function to get country list for Country of Ziyarat
        function getCountryListForUpdate() {
            programService.getCountryList().then(function (res) {
                vm.country = res.data;
                // vm.country = vm.country.map(c => {
                //     if (localStorage.getItem('lang') === 'FRN') {
                //         c.name = c.nameFRN;
                //     } else if (localStorage.getItem('lang') === 'ARB') {
                //         c.name = c.nameARB;    
                //     }
                //     return c;
                // })
                getSDOZListForUpdate();
            });
        }
        //Function to get SDOZ List
        function getSDOZList() {
            programService.getSDOZList().then(function (res) {
                vm.sdoz = res.data;
            });
        }
        //Function to get Fitrah SUb type
        function getFirtahSubType() {
            programService.getFirtahSubType().then(function (res) {
                vm.fitrahSubTypes = res.data;
            });
        }
        //Function to get Sahms
        function getSahms() {
            programService.getSahms().then(function (res) {
                vm.sahms = res.data;
            });
        }
        //Function to get Fitrah SUb type for Update
        function getFirtahSubTypeForUpdate() {
            programService.getFirtahSubType().then(function (res) {
                vm.fitrahSubTypes = res.data;
                getSahmsForUpdate();
            });
        }
        //Function to get Sahms for Update
        function getSahmsForUpdate() {
            programService.getSahms().then(function (res) {
                vm.sahms = res.data;
                getSubcategoryDataForUpdate();
            });
        }
        function getSDOZListForUpdate() {
            programService.getSDOZList().then(function (res) {
                vm.sdoz = res.data;
                getFirtahSubTypeForUpdate();
            });
        }
        function addOrRemoveSDOZ(x) {
            var exist = _.find(vm.selectedSDOZ, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedSDOZ, exist);

            }
            else {
                vm.selectedSDOZ.push(x);
            }
        }
        function addOrRemoveSahm(x) {
            var exist = _.find(vm.selectedSahms, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedSahms, exist);

            }
            else {
                vm.selectedSahms.push(x);
            }
        }
        function addOrRemoveFitrahSubTypeWithAmount(x) {
            var exist = _.find(vm.selectedFitrahSubTypesWithAmount, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedFitrahSubTypesWithAmount, exist);

            }
            else {
                vm.selectedFitrahSubTypesWithAmount.push(x);
            }
        }
        function updateFitrahSubTypeAmount(x) {
            var exist = _.find(vm.selectedFitrahSubTypesWithAmount, function (o) {
                return o._id == x._id;
            });
            if (exist) {
                _.remove(vm.selectedFitrahSubTypesWithAmount, exist);
                vm.selectedFitrahSubTypesWithAmount.push(x);

            }
        }
        //activate or deactivate subcategory
        function deleteSubCategory(id, status) {
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
                        programService.deleteProgramSubCategory(id).then(function (res) {
                            vm.result = res.data;
                            swal(
                                $translate.instant('DEACTIVATED!'),
                                $translate.instant('Subcategory has been deactivated.'),
                                'success'
                            )
                            getCategoriesWithInActive();
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
                programService.deleteProgramSubCategory(id).then(function (res) {
                    vm.result = res.data;
                    swal(
                        $translate.instant('ACTIVATED!'),
                        $translate.instant('Subcategory has been Activated.'),
                        'success'
                    )
                    getCategoriesWithInActive();
                    return res;
                });
            }
        }
        function getCategoriesWithInActive() {
            let programTypeId = vm.selectedProgramType._id;
            programService.getCategoriesWithInActive(programTypeId).then(function (res) {
                vm.subcategories = res.data;
                var listIncludingParent = [];

                vm.subcategories.forEach(function (element) {
                    programService.getProgramOfSubCategories(element._id)
                        .then(function (res) {
                            if (res.data.length) {
                                element['parent'] = res.data[0].programName;
                                listIncludingParent.push(element);
                            }

                        });
                })

                // vm.subcategories = allList;



            });
        }
        //get subcategories by programtype
        function getSubcategoriesByProgramType() {
            let programTypeId = vm.selectedProgramType._id;
            programService.getCategoriesByProgramType(programTypeId).then(function (res) {
                vm.subcategories = res.data;
            });
        }
        //get all programs
        function getPrograms() {
            programService.getPrograms().then(function (res) {
            });
        }
        //This function adds new program
        function addProgramSubcategory(isValid) {
            if (vm.isFirtahSubType) {
                if (vm.fitrahSubTypes.length > 1) {
                    if (vm.selectedFitrahSubTypesWithAmount.length < 1) {
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
                    } else {
                        vm.selectedFitrahSubTypesWithAmount.forEach(function (element) {
                            if (_.find(vm.selectedFitrahSubTypesWithAmount, element)) {
                                if (element.fitrahSubTypeAmount == undefined || element.fitrahSubTypeAmount == "") {
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
                                    vm.subTypeAmountError = true;
                                }
                            }

                        }, this);

                        if (vm.subTypeAmountError) {
                            vm.subTypeAmountError = false;
                            return;
                        }
                    }
                }
            }
            //if (vm.selectedProgramType.programTypeName == 'Religious Payments') 
            if (vm.selectedProgramType.programTypeName == 'Religious Payments' || vm.selectedProgramType.programTypeName == 'Paiements religieux' || vm.selectedProgramType.programTypeName == 'المدفوعات الدينية') {
                if (vm.file.name != undefined) {
                    //with image

                    multipartForm.post('/upload', vm.file).then(function (res) {
                        var imageLink = res.data.name;
                        let obj = new Object();
                        obj = getprogramobject();
                        obj.imageLink = imageLink;
                        // Add Subcategory
                        obj.description = jQuery('#addsubcat .froala-view').html();
                        programTypeService.addProgramSubcategory(obj).then(function (res) {
                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/subcategorylist";
                            });
                            return res;
                        });
                    });
                }
                else {
                    //without image
                    let obj = new Object();
                    obj = getprogramobject();
                    obj.imageLink = "defaultpost.jpg";
                    // Add Subcategory
                    obj.description = jQuery('#addsubcat .froala-view').html();
                    programTypeService.addProgramSubcategory(obj).then(function (res) {
                        swal({
                            title: $translate.instant(res.data),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/subcategorylist";
                        });
                        return res;
                    });
                }
            }
            else {
                programTypeService.addProgramSubcategory(getprogramobject()).then(function (res) {
                    swal({
                        title: $translate.instant(res.data),
                        position: 'center-center',
                        type: 'success',
                        allowOutsideClick: false,
                    }).then(function () {
                        window.location = "#/admin/subcategorylist";
                    });
                    return res;
                });
            }
        }
        function getProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                vm.programTypes = res.data;
                vm.programTypes = vm.programTypes.map(prg => {
                    prg.programTypeName = $translate.instant(prg.programTypeName);
                    return prg;
                })
            });
        }
        //Function to update program sub category
        function updateProgramSubcategory(isValid) {
            //if (isValid) {

            if (vm.selectedProgramType.programTypeName == 'Religious Payments' || vm.selectedProgramType.programTypeName == 'Paiements religieux' || vm.selectedProgramType.programTypeName == 'المدفوعات الدينية') {
                if (vm.file.name != undefined) {
                    //with image
                    multipartForm.post('/upload', vm.file).then(function (res) {
                        var imageLink = res.data.name;
                        let obj = new Object();
                        obj = getprogramobject();
                        obj.imageLink = imageLink;
                        obj.programType = vm.selectedProgramType;
                        obj.slug = vm.programSubcategorySlug;
                        obj.description = jQuery('#upsubcat .froala-view').html();
                        obj.isLanding = vm.isLanding;
                        obj.amountBasedOnCountry = vm.amountBasedOnCountry
                        obj.countryWiseAmount = vm.countryWiseAmount
                        programTypeService.updateProgramSubcategory(obj).then(function (res) {
                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/subcategorylist";
                            });
                            return res;
                        });
                    });
                }
                else {
                    //without image
                    let obj = new Object();
                    obj = getprogramobject();
                    obj.programType = vm.selectedProgramType;
                    obj.slug = vm.programSubcategorySlug;
                    //Edit Subcategory text only

                    //obj.description = vm.description;
                    obj.description = jQuery('#upsubcat .froala-view').html();

                    obj.isLanding = vm.isLanding;
                    obj.amountBasedOnCountry = vm.amountBasedOnCountry;
                    obj.countryWiseAmount = vm.countryWiseAmount
                    programTypeService.updateProgramSubcategory(obj).then(function (res) {
                        if (res.data == "Program Subcategory not updated Sucessfully") {
                            swal({
                                title: $translate.instant(res.data),
                                position: 'center-center',
                                type: 'error',
                                allowOutsideClick: false,
                            }).then(function () {
                                window.location = "#/admin/subcategorylist";
                            });
                            return res;
                        }
                        swal({
                            title: $translate.instant(res.data),
                            position: 'center-center',
                            type: 'success',
                            allowOutsideClick: false,
                        }).then(function () {
                            window.location = "#/admin/subcategorylist";
                        });
                        return res;
                    });
                }
            }
            else {
                programTypeService.updateProgramSubcategory(getprogramobject()).then(function (res) {
                    swal({
                        title: $translate.instant(res.data),
                        position: 'center-center',
                        type: 'success',
                        allowOutsideClick: false,
                    }).then(function () {
                        window.location = "#/admin/subcategorylist";
                    });
                    return res;
                });
            }
            // }
        }
        //create program object
        function getprogramobject() {
            var obj = {};
            obj.id = vm.subcategoryId;
            obj.programSubcategoryName = vm.programSubcategoryName;
            obj.programPriority = vm.programPriority;
            obj.programType = vm.selectedProgramType;
            obj.isLanding = vm.isLanding;
            obj.amountBasedOnCountry = vm.amountBasedOnCountry;
            obj.countryWiseAmount = vm.countryWiseAmount
            obj.slug = vm.programSubcategorySlug;
            obj.isCountryFoZiyarat = vm.isCountryFoZiyarat;
            obj.isFirtahSubType = vm.isFirtahSubType;
            obj.isSDOZ = vm.isSDOZ;
            obj.isSahm = vm.isSahm;
            obj.isFixedAmount = vm.isFixedAmount;
            obj.userLang = localStorage.getItem('lang');

            if (obj.isCountryFoZiyarat) {
                obj.countryOfZiyarat = vm.selectedCountry;
            }
            if (obj.isSDOZ) {
                obj.sdoz = vm.selectedSDOZ;
            }
            if (obj.isFirtahSubType) {
                obj.fitrahSubTypes = vm.selectedFitrahSubTypesWithAmount;
            }
            if (obj.isSahm) {
                obj.sahms = vm.selectedSahms;
            }
            if (obj.isFixedAmount) {
                obj.fixedAmount = vm.fixedAmount;
            }

            return obj;
        }
        // Function to get program type list for Subcategory update
        function getProgramTypesForCategoryUpdate() {
            programTypeService.getProgramTypes().then(function (res) {
                vm.programTypes = res.data;
                getCountryListForUpdate();

            });
            vm.language = localStorage.getItem('lang');
        }
        function addAnotherCountry() {
            
            if (vm.countryWiseAmount == undefined) {
                vm.countryWiseAmount = [];
            }
            vm.countryWiseAmount.push({});
        }

        function removeCountry(index) {
            vm.countryWiseAmount.splice(index, 1);
        }

        //Function to get Subcategory data for update
        function getSubcategoryDataForUpdate() {

            var id = $location.search().subcategoryId;
            programTypeService.getSubCategoryById(id).then(function (res) {
                let dataReturned = res.data;
                vm.subcategoryId = dataReturned._id;
                vm.programSubcategoryName = dataReturned.programSubCategoryName;
                vm.programPriority = dataReturned.programPriority;
                jQuery("#upsubcat .froala-view").html(dataReturned.description);
                let selectedProgramTypeVal = _.find(vm.programTypes, function (o) {
                    return o._id == dataReturned.programType._id
                });
                vm.selectedProgramType = selectedProgramTypeVal;
                vm.programSubcategorySlug = dataReturned.slug;
                vm.imageLink = dataReturned.imageLink;
                vm.isLanding = dataReturned.isLanding;
                vm.amountBasedOnCountry = dataReturned.amountBasedOnCountry;
                vm.countryWiseAmount = dataReturned.countryWiseAmount;
                vm.description = dataReturned.description;
                vm.isCountryFoZiyarat = dataReturned.isCountryFoZiyarat;
                vm.isSahm = dataReturned.isSahm;
                if (vm.isCountryFoZiyarat) {
                    let selectedCountryVal = _.find(vm.country, function (o) {
                        return o._id == dataReturned.countryOfZiyarat._id;
                    });
                    vm.selectedCountry = selectedCountryVal;
                }

                vm.selectedSahms = dataReturned.sahms || [];

                vm.isSDOZ = dataReturned.isSDOZ;
                vm.isFirtahSubType = dataReturned.isFirtahSubType;
                vm.selectedSDOZ = dataReturned.sdoz;
                vm.selectedFitrahSubTypesWithAmount = dataReturned.fitrahSubTypes;
                vm.lookup = [];
                if (vm.selectedFitrahSubTypesWithAmount != null) {
                    for (var i = 0, len = vm.selectedFitrahSubTypesWithAmount.length; i < len; i++) {
                        vm.lookup[vm.selectedFitrahSubTypesWithAmount[i]._id] = vm.selectedFitrahSubTypesWithAmount[i];
                    }
                    vm.fitrahSubTypes.forEach(function (element) {
                        if (_.find(vm.selectedFitrahSubTypesWithAmount, element)) {
                            element.selected = true;
                            element.fitrahSubTypeAmount = vm.lookup[element._id].fitrahSubTypeAmount;
                            //element.fitrahSubTypeAmount = vm.selectedFitrahSubTypesWithAmount
                            //element.fitrahSubTypeAmount = vm.selectedFitrahSubTypesWithAmount
                            //element.fitrahSubTypeAmount = vm.selectedFitrahSubTypesWithAmount[element.id].fitrahSubTypeAmount;
                        } else {
                            element.selected = false;
                        }
                    }, this);
                }
                vm.sdoz.forEach(function (element) {
                    if (_.find(vm.selectedSDOZ, element)) {
                        element.selected = true;
                    }
                    else {
                        element.selected = false;
                    }
                }, this);

                vm.sahms.forEach(function (element) {
                    if (_.find(vm.selectedSahms, element)) {
                        element.selected = true;
                    }
                    else {
                        element.selected = false;
                    }
                }, this);

                vm.isFixedAmount = dataReturned.isFixedAmount;
                if (vm.isFixedAmount) {
                    vm.fixedAmount = dataReturned.fixedAmount;
                }

                return res;
            });
        }
    }
})()