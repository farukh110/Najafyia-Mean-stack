(function () {

    angular.module('mainApp').controller('webSettingsController', WebSettingsController);

    function WebSettingsController($scope, $sce, $state, $location, multipartForm, webSettingsService, $translate) {

        var webVM = this;
        webVM.details = null;
        webVM.socialMedia = {};
        webVM.socialMediaList = [];

        webVM.getWebSettings = getWebSettings;
        webVM.saveWebSettings = saveWebSettings;
        webVM.addSocialMedia = addSocialMedia;
        webVM.deleteSocialMedia = deleteSocialMedia;
        webVM.resetForm = resetForm;


        function getWebSettings() {
            webSettingsService.getWebSettings().then(function (response) {
                if (response.status == 200) {
                    webVM.socialMediaList = response.data.socialMedia;
                    if (response.data.image) {
                        webVM.imageURL = "/uploads/"+response.data.image;
                        jQuery('input[type=file]').val('');
                    }
                    webVM.details = response.data || {};
                }
            });
        }

        function saveWebSettings(isValid) {
            if (isValid) {
                if (webVM.socialMediaList.length > 0) {
                    webVM.details.socialMedia = webVM.socialMediaList;
                }

                if (webVM.file) {
                    //upload image than save
                    multipartForm.post('/upload', webVM.file).then(function (res) {
                        webVM.details.image = res.data.name;
                        webSettingsService.saveWebSettings(webVM.details).then(function (response) {
                            if (response.status == 200) {
                                webVM.resetForm();
                                webVM.getWebSettings();
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
                } else {
                    webSettingsService.saveWebSettings(webVM.details).then(function (response) {
                        if (response.status == 200) {
                            webVM.resetForm();
                            webVM.getWebSettings();
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
                }
            }
        }

        function addSocialMedia() {
            if (webVM.socialMedia.socialMedia != null && webVM.socialMedia.link != null) {
                webVM.socialMediaList.push(webVM.socialMedia);
                webVM.socialMedia = {};
            }
        }

        function deleteSocialMedia(idx) {
            if (idx != null) {
                webVM.socialMediaList.splice(idx, 1);
            }
        }

        function resetForm() {
            webVM.details = null;
            webVM.socialMedia = {};
            webVM.socialMediaList = [];
            webVM.file = null;
        }


    }
})()