(function () {

    angular.module('mainApp').factory('duaService', duaService);
    function duaService($http) {
        return {
            addDua: addDua,
            getDuas: getDuas,
            deleteDua: deleteDua,
            getDuaById: getDuaById,
            updateDua: updateDua,
            getDuasByOcassion: getDuasByOcassion,
            getSubCategory: getSubCategory,
            getOccasionBySubCategory: getOccasionBySubCategory,

        }
        //create new Dua
        function addDua(dua) {
            return $http({
                method: 'post',
                url: '/api/dua/add',
                data: dua,
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
        //Get All Dua list
        function getDuas(lang) {
            return $http({
                method: 'get',
                url: '/api/dua/list/' + lang,
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
        //Function to get Dua by Id
        function getDuaById(duaId) {
            return $http({
                method: 'get',
                url: '/api/dua/item/' + duaId,
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
        //Function to Update Dua
        function updateDua(content) {
            return $http({
                method: 'put',
                url: '/api/dua/update',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }
        //delete Dua by id
        function deleteDua(duaId) {
            return $http({
                method: 'delete',
                url: '/api/dua/delete/' + duaId + '',

                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }

        //Function to get Duas By Ocassion
        function getDuasByOcassion(ocassionId) {
            return $http({
                method: 'get',
                url: '/api/dua/getByOcassion/' + ocassionId,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }
        function getSubCategory() {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: '/api/program/subcategory/get/' + userLang,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }

        function getOccasionBySubCategory(subCategoryId) {
            return $http({
                method: 'get',
                url: '/api/ocassion/bySubCategory/' + subCategoryId,
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