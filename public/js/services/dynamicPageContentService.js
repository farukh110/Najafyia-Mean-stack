(function () {

    angular.module('mainApp').factory('dynamicPageContentService', DynamicPageContentService);

    function DynamicPageContentService($http) {
        return {
            getPageContentByTitle: getPageContentByTitle,
            getPageContentById: getPageContentById,
            savePageContentByName: savePageContentByName,
            deletePage: deletePage,
            getPagesListById: getPagesListById,
            getPagesListByTitle: getPagesListByTitle,
            getAllPagesList: getAllPagesList
        }

        function getPageContentByTitle(pageName) {
            return $http({
                method: 'GET',
                url: '/api/dynamicPageContent/getByTitle/' + pageName,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            }).catch(function (e) {
                return e.data;
            });
        }

        function getPageContentById(id, lang) {
            return $http({
                method: 'GET',
                url: '/api/dynamicPageContent/getById/' + id,
                headers: {
                    'Content-Type': 'application/json',
                    'language': lang
                },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            }).catch(function (e) {
                return e.data;
            });
        }


        function savePageContentByName(params) {
            return $http({
                method: 'POST',
                url: '/api/dynamicPageContent/save',
                data: params,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            }).catch(function (e) {
                return e.data;
            });
        }

        function deletePage(id) {
            return $http({
                method: 'POST',
                url: '/api/dynamicPageContent/delete/' + id,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            }).catch(function (e) {
                return e.data;
            });
        }

        function getPagesListById(id, lang) {
            return $http({
                method: 'GET',
                url: '/api/dynamicPageContent/getPagesListById/' + id,
                headers: {
                    'Content-Type': 'application/json',
                    'language': lang
                },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            }).catch(function (e) {
                return e.data;
            });
        }

        function getPagesListByTitle(title, lang) {
            return $http({
                method: 'GET',
                url: '/api/dynamicPageContent/getPagesListByTitle/' + title,
                headers: {
                    'Content-Type': 'application/json',
                    'language': lang
                },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            }).catch(function (e) {
                return e.data;
            });
        }

        function getAllPagesList(lang) {
            return $http({
                method: 'GET',
                url: '/api/dynamicPageContent/getAllPagesList',
                params: { 'language': lang },
                headers: {
                    'Content-Type': 'application/json',
                    'language': lang,
                },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            }).catch(function (e) {
                return e.data;
            });
        }


    }
})()