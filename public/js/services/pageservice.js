(function () {

    angular.module('mainApp').factory('pageService', pageService);

    function pageService($http) {
        return {
            publishPage: publishPage,
            updatePage: updatePage,
            getPages: getPages,
            getContactUsList: getContactUsList,
            deletePage: deletePage,
            getPageById: getPageById,
            getPageByName: getPageByName,
            getPageContentByName: getPageContentByName
        }
        function publishPage(content) {
            return $http({
                method: 'post',
                url: '/api/page/add',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        //update page
        function updatePage(content) {
            return $http({
                method: 'put',
                url: '/api/page/update/',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function getPages() {
            return $http({
                method: 'get',
                url: '/api/page/list',
                params: {language:localStorage.getItem('lang')},
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function getContactUsList() {
            return $http({
                method: 'get',
                url: '/api/getContactUsList',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function getPageById(pageId) {
            return $http({
                method: 'get',
                url: '/api/page/' + pageId,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        //get page by name
        function getPageByName(pageName) {
            return $http({
                method: 'get',
                url: '/api/page/byname/' + pageName,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        //get page by name
        function getPageContentByName(pageName) {
            return $http({
                method: 'get',
                url: '/api/page/content/' + pageName,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        //delete page by id
        function deletePage(pageId) {
            return $http({
                method: 'delete',
                url: '/api/page/delete/' + pageId + '',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
    }
})()