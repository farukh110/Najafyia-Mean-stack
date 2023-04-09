(function () {

    angular.module('mainApp').factory('aboutUsContentService', AboutUsContentService);

    function AboutUsContentService($http) {
        return {
            getPageContent: getPageContent,
            savePageContent: savePageContent
        }
        function getPageContent(pageName) {
            return $http({
                method: 'GET',
                url: '/api/pageContent/get/' + pageName,
                headers: {'Content-Type': 'application/json'},
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
        function savePageContent(params) {
            return $http({
                method: 'POST',
                url: '/api/pageContent/save',
                data: params,
                headers: {'Content-Type': 'application/json'},
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