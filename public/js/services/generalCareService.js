(function () {

    angular.module('mainApp').factory('generalCareService', generalCareService);

    function generalCareService($http) {
        return {
            addGeneralCareCategory: addGeneralCareCategory,
            getGeneralCare: getGeneralCare,
            getGeneralCareByProgramType: getGeneralCareByProgramType,
            addGeneralCare: addGeneralCare,
            deleteGeneralCare: deleteGeneralCare,
            getGeneralCareById: getGeneralCareById,
            updateGeneralCare: updateGeneralCare,
            getCategoriesByProgramType: getCategoriesByProgramType,
            addGeneralCareContent: addGeneralCareContent,
        }

        //create new General Care Category
        function addGeneralCareCategory(content) {
            return $http({
                method: 'post',
                url: '/api/generalCare/Category/add',
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

        function getGeneralCareByProgramType(programTypeId) {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: '/api/program/subcategory/list/' + programTypeId + '/' + userLang,
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

        //get All General Care Records
        function getGeneralCare(programTypeId) {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: '/api/program/list/' + programTypeId + '/' + userLang,
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

        function getGeneralCareById(generalCareId) {
            return $http({
                method: 'get',
                params: {lang: localStorage.getItem('lang')},
                url: '/api/program/item/' + generalCareId,
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

        //create new generalCare
        function addGeneralCare(generalCareData) {

            return $http({
                method: 'post',
                url: '/api/program/add',
                data: generalCareData,
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }

        function addGeneralCareContent(content) {
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

        //update generalCare
        function updateGeneralCare(content) {
            return $http({
                method: 'put',
                url: '/api/program/update/',
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

        //delete generalCare by id
        function deleteGeneralCare(generalCareId) {
            return $http({
                method: 'delete',
                url: '/api/program/delete/' + generalCareId + '',

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
                url: '/api/program/subcategory/list/'+ programTypeId+'/'+userLang,
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
    }
})()