(function () {

    angular.module('mainApp').factory('darAlZahraService', darAlZahraService);

    function darAlZahraService($http) {
        return {
            addDarAlZahra: addDarAlZahra,
            getCategoriesByProgramType: getCategoriesByProgramType,
            getDarAlZahra: getDarAlZahra,
            deleteDarAlZahra: deleteDarAlZahra,
            getDarAlZahraById: getDarAlZahraById,
            updateDarAlZahra: updateDarAlZahra,
            addDarAlZahraContent: addDarAlZahraContent
        }

        //create new generalCare
        function addDarAlZahra(darAlZahraData) {
            return $http({
                method: 'post',
                url: '/api/program/add',
                data: darAlZahraData,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }
        function addDarAlZahraContent(content) {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'post',
                url: '/api/program/addContent',
                data: content,
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                        return error;
                    }
                )
            });
        }

        function getCategoriesByProgramType(programTypeId) {

            var userLang = localStorage.getItem('lang');

            return $http({
                method: 'get',
                url: '/api/program/subcategory/list/' + programTypeId + '/' + userLang,
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

        //get All Dar Al Zahra Records
        function getDarAlZahra(programTypeId) {
            var userLang = localStorage.getItem('lang');

            return $http({
                method: 'get',
                url: '/api/program/list/' + programTypeId + '/' + userLang,

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

        //delete DarAlZahra by id
        function deleteDarAlZahra(darAlZahraId) {
            return $http({
                method: 'delete',
                url: '/api/program/delete/' + darAlZahraId + '',

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

        function getDarAlZahraById(darAlZahraId) {
            return $http({
                method: 'get',
                params: {lang: localStorage.getItem('lang')},
                url: '/api/program/item/' + darAlZahraId,
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

        //update Dar Al Zahra Object
        function updateDarAlZahra(content) {
            return $http({
                method: 'put',
                url: '/api/program/update/',
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
    }
})()