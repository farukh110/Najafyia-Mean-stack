(function () {

    angular.module('mainApp').controller('pagecontroller', pageController);

    function pageController($scope, $location, pageService) {

        var vm = this;
        var pageData = [];
        vm.result = "";
        vm.pageId = "";
        vm.publishPage = publishPage;
        vm.updatePage = updatePage;
        vm.getPages = getPages;
        vm.getContactUsList = getContactUsList;
        vm.deletePage = deletePage;
        vm.getPageForUpdate = getPageForUpdate;
        vm.getPageDetail = getPageDetail;
        vm.getPageContentByName = getPageContentByName;
        vm.pages = [];

        //This function adds new page
        function publishPage() {
            pageService.publishPage(getPageobject()).then(function (res) {

                swal({
                    title: $translate.instant(res.data),
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                }).then(function () {
                    window.location = "#/admin/pagelist";
                });
                return res;
            });
        }
        function updatePage() {
            let pageObj = getUpdatedPageobject();
            if (!pageObj.slug) {
                return swal({
                    title: 'Please provide Page Slug',
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                });
            }

            pageService.updatePage(getUpdatedPageobject()).then(function (res) {
                swal({
                    title: $translate.instant(res.data),
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                }).then(function () {
                    window.location = "#/admin/pagelist";
                });
                return res;
            });
        }
        //get project Detail by id
        function getPageDetail(name) {
            var url = $location.url();
            var arr = url.split("/");
            var name = arr[arr.length - 1];
            pageService.getPageByName(name).then(function (res) {
                vm.PageDetail = res.data;
                jQuery("#pageContent").html(vm.PageDetail.pageContent);
            });
        }
        function getPageContentByName(pageName) {
            pageService.getPageContentByName(pageName).then(function (res) {
                vm.PageDetail = res.data;
                jQuery("#pageContent").html(vm.PageDetail.pageContent);
            });
        }
        //create page object
        function getPageobject() {
            var obj = {};
            var val = vm.pageTitle;
            obj.title = vm.pageTitle;
            obj.slug = vm.slug;
            obj.content = jQuery('#edit .froala-view').html();
            obj.link = val.replace(/ /g, "-");
            obj.language = localStorage.getItem('lang')
            return obj;
        }
        function getUpdatedPageobject() {
            var obj = {};
            var val = vm.pageTitle;
            obj.title = vm.pageTitle;
            obj.content = jQuery('#edit .froala-view').html();
            obj.id = vm.pageId;
            obj.slug = vm.slug.toLowerCase().split(' ').join('-')  // i made slug obj for web conversion
            return obj;
        }
        // gets all pages
        function getPages() {

            pageService.getPages().then(function (res) {
                vm.pages = res.data;
                return res;

            });
        }
        function getContactUsList() {
            pageService.getContactUsList().then(function (res) {
                vm.contactUsList = res.data;
                return res;

            });
        }
        //get page data for update
        function getPageForUpdate() {
            var id = $location.search().pageid;
            pageService.getPageById(id).then(function (res) {
                vm.pages = res.data;
                vm.pageId = res.data._id;
                vm.pageTitle = res.data.pageName;
                vm.slug = res.data.slug;
                if(vm.slug) {
                    vm.pageSlug = vm.slug;
                }
                jQuery('#edit .froala-view').html(res.data.pageContent);

                return res;

            });
        }
        // Delete page by Id
        function deletePage(pageId) {
            swal({
                title: $translate.instant('Are you sure?'),
                text: $translate.instant("You won't be able to revert this!"),
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: $translate.instant('Yes, delete it!'),
                cancelButtonText: $translate.instant('No, cancel!'),
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
            }).then(function (result) {
                if (result.value) {
                    pageService.deletePage(pageId).then(function (res) {
                        vm.result = res.data;
                        swal(
                            'Deleted!',
                            'Page has been deleted.',
                            'success'
                        )
                        getPages();
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
    }
})()