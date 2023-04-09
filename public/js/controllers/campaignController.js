(function () {

    angular.module('mainApp').controller('campaignController', CampaignController);

    function CampaignController($scope, $sce, $state, $location, multipartForm, campaignService, programTypeService, programService, $translate) {
        var campVM = this;
        campVM.details = {
            isBanner: false
        };
        campVM.campaignList = [];
        campVM.programTypesList = [];
        campVM.programList = [];
        campVM.programSubCategoryList = [];
        campVM.editRow = false;
        campVM.imegeURL = null;
        campVM.file = {};
        //functions 
        campVM.getProgramTypes = getProgramTypes;
        campVM.getProgramList = getProgramList;
        campVM.getProgramSubCategoryList = getProgramSubCategoryList;
        campVM.getCampaigns = getCampaigns;
        campVM.getCampaignById = getCampaignById;
        campVM.saveCampaign = saveCampaign;
        campVM.deActivateCampaign = deActivateCampaign;
        campVM.deleteCampaign = deleteCampaign;
        campVM.resetForm = resetForm;

        //Get All Program Types
        function getProgramTypes() {
            programTypeService.getProgramTypes().then(function (res) {
                campVM.programTypesList = res.data;
            });
        }

        // Get Program List by Type
        function getProgramList(typeId) {
            programService.getProgramByTypeId(typeId).then(function (res) {
                campVM.programList = res.data;
                // campVM.programSubCategoryList = [];
            });
        }

        //Get Program Sub Cateogory List by Program Id
        function getProgramSubCategoryList(programId) {
            programService.getProgramById(programId).then(function (res) {
                campVM.programSubCategoryList = res.data[0].programSubCategory;
            });
        }

        //Get All Campaigns
        function getCampaigns() {
            var lang = localStorage.getItem('lang');
            campaignService.getCampaigns(lang).then(function (response) {
                campVM.campaignList = response.data || [];
            });
        }

        //Get Campaign By Id
        function getCampaignById() {
            var id = $location.search().id;
            if (id) {
                var lang = localStorage.getItem('lang');
                campaignService.getCampaignById(id, lang).then(function (res) {
                    campVM.details = res.data;
                    if (!campVM.details.isBanner) {
                        campVM.details.programType = res.data.programType ? res.data.programType[0] : null;
                        campVM.details.program = res.data.program ? res.data.program[0] : null;
                        campVM.details.programSubCategory = res.data.programSubCategory ? res.data.programSubCategory[0] : null;
                        campVM.getProgramList(campVM.details.programType);
                        campVM.getProgramSubCategoryList(campVM.details.program);
                    }
                    campVM.editRow = true;
                    campVM.imegeURL = res.data.image;
                    jQuery('input[type=file]').val('');
                    return res;
                });
            } else {
                campVM.resetForm();
            }
        }

        //Function to Save New Campaign
        function saveCampaign(isValid) {
            if (isValid) {
                campVM.details.language = localStorage.getItem('lang');
                if (campVM.file.name == undefined) {
                    campVM.details.image = campVM.imegeURL;
                    campaignService.saveCampaign(campVM.details).then(function (response) {
                        $state.go('campaignList');
                        if (response.status == 200) {
                            campVM.resetForm();
                            swal(
                                $translate.instant('Success!'),
                                response.data,
                                'success'
                            );
                        } else {
                            swal(
                                'Failed!',
                                'Failed to save',
                                'error'
                            )
                        }
                    });
                } else {
                    //upload image than save
                    multipartForm.post('/upload', campVM.file).then(function (res) {
                        campVM.details.image = res.data.name;
                        campaignService.saveCampaign(campVM.details).then(function (response) {
                            $state.go('campaignList');
                            if (response.status == 200) {
                                campVM.resetForm();
                                swal(
                                    $translate.instant('Success!'),
                                    response.data,
                                    'success'
                                );
                            } else {
                                swal(
                                    'Failed!',
                                    'Failed to save',
                                    'error'
                                )
                            }
                        });
                    });
                }
            }
        }

        //Function to Deactivate Campaign
        function deActivateCampaign(id, status) {
            if (id) {
                let obj = {
                    _id: id,
                    status: status,
                    language: localStorage.getItem('lang')
                }
                campaignService.deActivateCampaign(obj).then(function (response) {
                    if (response.status == 200) {
                        campVM.getCampaigns();
                        swal(
                            $translate.instant('Success!'),
                            response.data,
                            'success'
                        );
                    } else {
                        swal(
                            'Failed!',
                            'Failed to deActivate',
                            'error'
                        )
                    }
                });
            }
        }

        //Function to Delete Campaign
        function deleteCampaign(id) {
            if (id) {
                campaignService.deleteCampaign(id).then(function (response) {
                    if (response.status == 200) {
                        campVM.getCampaigns();
                        swal(
                            $translate.instant('Success!'),
                            response.data,
                            'success'
                        );
                    } else {
                        swal(
                            'Failed!',
                            'Failed to delete',
                            'error'
                        )
                    }
                });
            }
        }

        //Function to Reset form
        function resetForm() {
            campVM.details = {
                isBanner: false
            };
            campVM.file = {};
            campVM.imegeURL = null;
        }

        jQuery("#txtFromDate").datepicker({
            minDate: 0,
            maxDate: 'today',
            autoclose: true
        });
        $scope.checkDate = function () {
            const startDate = new Date(campVM.details.startDate);
            const endDate = new Date(campVM.details.endDate);

            if (startDate && endDate && startDate > endDate) {
                campVM.details.endDate = null;
                campVM.details.startDate = null;
                jQuery("#txtToDate").val('');
                swal(
                    'Failed!',
                    'Invalid Date for Campaign',
                    'error'
                )
            }
        }
        //For Add/Update Sadaqah Form
        $scope.startDateChange = function () {
            jQuery("#txtToDate").datepicker("remove");
            jQuery("#txtToDate").val('');
            jQuery("#txtToDate").datepicker({
                autoclose: true,
                startDate: new Date(campVM.details.startDate),
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
    }
})()