(function () {

    angular.module('mainApp').factory('countryService', countryService);

    function countryService($http) {
        return {
            getCountryList: getCountryList,
            getCountryCode: getCountryCode,
            getCitiesByCountry: getCitiesByCountry,
            getLanguagesList: getLanguagesList
        }


        function getCountryList() {
            return $http({
                method: 'get',
                url: '/api/country/list',
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
        function getCitiesByCountry(country) {
            return $http({
                method: 'get',
                params: country,
                url: '/api/country/getCitiesByCountry/',
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
        function getCountryCode() {
            return $http({
                url: "/api/country/list",
                method: "GET"
            }).then(function (response) {
                return response.data;
            }).catch(function (error) {
                return error;
            })
        }

        function getLanguagesList() {
            return $http({
                method: 'get',
                url: '/JSON/languages.json'
            }).then((response) => {
                return response.data
            }).catch((error) => {
                return error;
            })

        }

    }
})()