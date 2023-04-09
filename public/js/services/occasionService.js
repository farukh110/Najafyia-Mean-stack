(function () {

    angular.module('mainApp').factory('occasionService', occasionService);
    function occasionService($http) {
        return {
            addOccasion: addOccasion,
            getOccasions: getOccasions,
            getActiveOccasions: getActiveOccasions,
            deleteOccasion: deleteOccasion,
            getOccasionById: getOccasionById,
            updateOccasion: updateOccasion,
            getOcassionBySubCat: getOcassionBySubCat
        }
        //create new Occasion
        function addOccasion(occasion) {
            return $http({
                method: 'post',
                url: '/api/ocassion/add',
                data: occasion,
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
        function getOccasions(lang) {
            return $http({
                method: 'get',
                url: '/api/ocassion/list/' + lang,

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
        //get Active Occasions
        function getActiveOccasions() {
            return $http({
                method: 'get',
                url: '/api/ocassion/activeOccasionsList',

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
        //delete Occasion by id
        function deleteOccasion(occasionId) {
            return $http({
                method: 'delete',
                url: '/api/ocassion/delete/' + occasionId + '',

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
        //Function to get Occasion by Id
        function getOccasionById(occasionId) {
            return $http({
                method: 'get',
                url: '/api/ocassion/item/' + occasionId,
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
        //Function to update Occasion
        function updateOccasion(content) {
            return $http({
                method: 'put',
                url: '/api/ocassion/update',
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

        //Function to get Occasions By Sub Category
        function getOcassionBySubCat(subCatId) {
            return $http({
                method: 'get',
                url: '/api/ocassion/getBySubCat/' + subCatId,
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