(function () {

    angular.module('mainApp').controller('dynamicPageContentController', DynamicPageContentController);

    function DynamicPageContentController($scope, $sce, $state, $location, $compile, utilService, $window, multipartForm, dynamicPageContentService, MetaTagsService, $translate) {


        var pageVM = this;
        pageVM.pageData = null;
        pageVM.pageDetails = {};
        pageVM.gallery = {};
        pageVM.editRow = false;
        pageVM.parentList = [];
        pageVM.pagesList = [];
        pageVM.showPageContent = false;
        pageVM.showSocailSharing = false;

        pageVM.currentPage = 0;
        pageVM.pageSize = 100;

        pageVM.getAllPagesList = getAllPagesList;
        pageVM.getPagesListByTitle = getPagesListByTitle;
        pageVM.getPagesListById = getPagesListById;
        pageVM.getPageContentByTitle = getPageContentByTitle;
        pageVM.getPageContentById = getPageContentById;
        pageVM.savePageContentByName = savePageContentByName;
        pageVM.deletePage = deletePage;
        pageVM.editPage = editPage;
        pageVM.addGallery = addGallery;
        pageVM.deleteGallery = deleteGallery;
        pageVM.printContent = printContent;
        pageVM.resetForm = resetForm;

        $scope.numberOfPages = () => {
            let size = Math.ceil(
                pageVM.pagesList.length / pageVM.pageSize
            );
            var range = [];
            for (var i = 1; i <= size; i++) {
                range.push(i);
            }
            return range;
        }
        // for arabic header in print view
        let lang = localStorage.getItem('lang');
        if(lang == 'ARB'){
            pageVM.printArb = true
        }else if (lang == 'FRN' || lang == 'ENG') {
            pageVM.printArb = false
        }

        $scope.numberOfPages();

        function getAllPagesList() {
            var lang = localStorage.getItem('lang');
            dynamicPageContentService.getAllPagesList(lang).then(function (response) {
                if (response.data) {
                    pageVM.allPagesList = _.sortBy(response.data, ['parentPageName', 'subParentPageId']) || [];
                }
            });
        }

        function getPagesListByTitle() {
            if (pageVM.pageDetails.parentPageName) {
                var lang = localStorage.getItem('lang');
                dynamicPageContentService.getPagesListByTitle(pageVM.pageDetails.parentPageName, lang).then(function (response) {
                    if (response.data) {
                        pageVM.pagesList = response.data || [];
                    }
                });
            }
        }

        function getPagesListById() {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            var lang = localStorage.getItem('lang');
            dynamicPageContentService.getPagesListById(id, lang).then(function (response) {
                if (response.data) {
                    pageVM.pagesList = response.data || [];
                }
            });
        }

        function getPageContentByTitle(pageName) {
            dynamicPageContentService.getPagesListByTitle(pageName).then(function (response) {
                if ($state.current.name === 'addPageContent') {
                    pageVM.pageDetails = response.data || {};
                    if (response.data.titleImage) {
                        pageVM.editRow = true;
                        pageVM.imegeURL = "/uploads/" + response.data.titleImage;
                        jQuery('input[type=file]').val('');
                    }
                    pageVM.galleryList = response.data.gallery || [];
                } else {
                    pageVM.pageData = response.data;
                }
            });
        }

        $scope.sendMail = function () {
            const mail = utilService.sendEmail(pageVM.pageData.title, pageVM.pageData.pageContent, `pages/${pageVM.pageData.slug || pageVM.pageData._id}`)
            $window.open(mail);
        }

        function getPageContentById() {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            var lang = localStorage.getItem('lang');
            dynamicPageContentService.getPageContentById(id, lang).then(function (response) {
                pageVM.pageData = response.data;
                //  var description =  pageVM.pageData.pageContent.split(' ');
                if (pageVM.pageData.pageContent && pageVM.pageData.pageContent != ' ') {
                    //pageVM.pageData.pageContent = $sce.trustAsHtml(pageVM.pageData.pageContent);
                }
                const metaData = {
                    title: pageVM.pageData.title,
                    description: pageVM.pageData.pageContent,
                    image: `${MetaTagsService.SERVER_URL}/uploads/${pageVM.pageData.titleImage}`,
                    url: `${MetaTagsService.SERVER_URL}/#/pages/${pageVM.pageData.slug}`
                };
                MetaTagsService.setPageMeta(
                    metaData,
                    pageVM.pageData._id,
                    "pages"
                );
                pageVM.showPageContent = true;
                if (id === response.data._id) {
                    SocialShareKit.init({
                        reinitialize: true,
                        selector: ".custom-parent .ssk",
                        url: "https://www.google.com",
                        text: "Share text default"
                    });
                    pageVM.showSocailSharing = true;

                }
            });
        }

        function savePageContentByName(isValid) {
            if (isValid) {
                var lang = localStorage.getItem('lang');
                pageVM.pageDetails.language = lang;
                pageVM.pageDetails.pageContent = jQuery('#pageContent .froala-view').html() == "<p><br></p>" ? ' ' : jQuery('#pageContent .froala-view').html();
                if (pageVM.pageDetails.file) {
                    multipartForm.post('/upload', pageVM.pageDetails.file).then(function (res) {
                        if (res) {
                            pageVM.pageDetails.titleImage = res.data.name;
                            dynamicPageContentService.savePageContentByName(pageVM.pageDetails).then(function (response) {
                                if (response.status === 200) {
                                    pageVM.getAllPagesList();
                                    pageVM.resetForm();
                                    swal({
                                        title: $translate.instant(response.data),
                                        position: 'center-center',
                                        type: 'success',
                                        allowOutsideClick: false,
                                    });
                                } else {
                                    swal({
                                        title: $translate.instant('Failed to save'),
                                        position: 'center-center',
                                        type: 'error',
                                        allowOutsideClick: false,
                                    });
                                }
                            });
                        }
                    });
                } else {
                    dynamicPageContentService.savePageContentByName(pageVM.pageDetails).then(function (response) {
                        if (response.status === 200) {
                            pageVM.getAllPagesList();
                            pageVM.resetForm();
                            swal({
                                title: $translate.instant(response.data),
                                position: 'center-center',
                                type: 'success',
                                allowOutsideClick: false,
                            });
                        } else {
                            swal({
                                title: $translate.instant('Failed to save'),
                                position: 'center-center',
                                type: 'error',
                                allowOutsideClick: false,
                            });
                        }
                    });
                }
            }
        }

        function deletePage(id) {
            if (id) {
                dynamicPageContentService.deletePage(id).then(function (response) {
                    if (response.status == 200) {
                        pageVM.getAllPagesList();
                        pageVM.resetForm();
                        swal(
                            $translate.instant('Success!'),
                            $translate.instant(response.data.message),
                            'success'
                        );
                    } else {
                        swal(
                            'Failed!',
                            'Failed to save',
                            'error'
                        );
                    }
                });
            }
        }

        function editPage(page) {
            if (page) {
                pageVM.pageDetails = page;
                pageVM.getPagesListByTitle();
                if (page.pageContent) {
                    jQuery("#pageContent .froala-view").html(page.pageContent);
                }
                if (page.titleImage) {
                    pageVM.editRow = true;
                    pageVM.imegeURL = "/uploads/" + page.titleImage;
                    jQuery('input[type=file]').val('');
                }
            }
        }

        function addGallery() {
            if (pageVM.gallery.item !== null) {
                pageVM.galleryList.push(pageVM.gallery);
                pageVM.gallery = {};
            }
        }

        function deleteGallery(idx) {
            if (idx !== null) {
                pageVM.galleryList.splice(idx, 1);
            }
        }

        function printContent(divName) {
            window.print();
        }

        function resetForm() {
            pageVM.pageData = null;
            pageVM.pageDetails = {};
            pageVM.gallery = {};
            pageVM.editRow = false;
            pageVM.imegeURL = "";
            pageVM.showPageContent = false;
            pageVM.showSocailSharing = false;
            pageVM.parentList = [];
            jQuery('input[type=file]').val('');
            jQuery("#pageContent .froala-view").html('');
        }
    }

})()