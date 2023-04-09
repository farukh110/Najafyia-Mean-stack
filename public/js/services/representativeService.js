(function () {

    angular.module('mainApp').factory('representativeService', RepresentativeService);

    function RepresentativeService($http) {
        return {
            getRepresentative: getRepresentative,
            getRepresentativeById: getRepresentativeById,
            saveRepresentative: saveRepresentative,
            deleteRepresentative: deleteRepresentative,
            ChangeRepresentativeStat: changeRepresentativeStat,
            getCities: getCities,
        }

        function getRepresentative(lang, showActiveOnly) {
            return $http({
                method: 'GET',
                url: '/api/representative/list/' + showActiveOnly,
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

        function getRepresentativeById(id, lang) {
            return $http({
                method: 'GET',
                url: '/api/representative/get/' + id,
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

        function saveRepresentative(params) {
            return $http({
                method: 'POST',
                url: '/api/representative/save',
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

        function deleteRepresentative(params) {
            return $http({
                method: 'POST',
                url: '/api/representative/delete/' + params,
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

        function changeRepresentativeStat(params) {
            return $http({
                method: 'POST',
                url: '/api/representative/changeStat/' + params,
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





        function getCities() {
            return $http.get('/JSON/cities.json')
                .then(function (response) {
                    return response;
                })
                .catch(function (error) {
                    return error;
                });
        }
    }
})()