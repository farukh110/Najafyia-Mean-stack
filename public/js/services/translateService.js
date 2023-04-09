(function () {

    angular.module('mainApp').factory('translateService', translateService);

    function translateService($http) {
        return {
            getTranslations: getTranslations
        }

        function getTranslations(lang) {
            return $http({
                method: 'get',
                url: '/api/translation/' + lang + '/',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }
    }

})()