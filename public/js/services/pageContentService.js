(function () {

    angular.module('mainApp').factory('pageContentService', PageContentService);

    function PageContentService($http) {
        return {
            getPageContentByName: getPageContentByName,
            savePageContentByName: savePageContentByName,
            sendEmail: sendEmail,
            saveVolunteer: saveVolunteer,
            getAllPageContent: getAllPageContent,
            sendEmailContactUs: sendEmailContactUs
        }

        function getAllPageContent(lang) {
            return $http({
                method: 'GET',
                url: '/api/pageContent/all/' + lang,
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            }).catch(function (e) {
                return e.data;
            });
        }
        function getPageContentByName(pageName, lang) {
            return $http({
                method: 'GET',
                url: '/api/pageContent/get/' + pageName,
                headers: {
                    'Content-Type': 'application/json',
                    'language': lang
                },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            }).catch(function (e) {
                return e.data;
            });
        }

        function savePageContentByName(params) {
            return $http({
                method: 'POST',
                url: '/api/pageContent/save',
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

        function sendEmail(params) {
            return $http({
                method: 'post',
                url: '/api/sendEmail',
                headers: { 'Content-Type': 'application/json' },
                data: params,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function sendEmailContactUs(params) {
            params.language = localStorage.getItem('lang') || 'ENG';
            return $http({
                method: 'post',
                url: '/api/sendEmailContactUs',
                headers: { 'Content-Type': 'application/json' },
                data: params,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function saveVolunteer(params) {
            return $http({
                method: 'post',
                url: '/api/volunteer/save',
                headers: { 'Content-Type': 'application/json' },
                data: params,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
    }
})()