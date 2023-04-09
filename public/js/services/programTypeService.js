(function () {

    angular.module('mainApp').factory('programTypeService', programTypeService);

    function programTypeService($http) {
        return {
            getProgramType: getProgramType,
            getProgramContent: getProgramContent,
            addProgramSubcategory: addProgramSubcategory,
            getProgramTypes: getProgramTypes,
            getSubCategoryById: getSubCategoryById,
            updateProgramSubcategory: updateProgramSubcategory,
        }

        //create new Category
        function addProgramSubcategory(subcategory) {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'post',
                url: '/api/program/subcategory/add',
                data: subcategory,
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

        function getProgramContent(content) {
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

        //get list of program type
        // gets program types
        function getProgramTypes() {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: '/api/programType/list' + '/' + userLang,
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

        // gets program type by name
        function getProgramType(name) {
            var userLang = localStorage.getItem('lang')
            return $http({
                method: 'get',
                url: '/api/programType/' + name + '/' + userLang,
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

        //Function to get Subcategory data by Id
        function getSubCategoryById(subcategoryId) {
            //work here for data return
            return $http({
                method: 'get',
                url: '/api/program/subcategory/item/' + subcategoryId,
                headers: {'Content-Type': 'application/json'},
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }

        function updateProgramSubcategory(content) {
            return $http({
                method: 'put',
                url: '/api/program/subcategory/update',
                data: content,
                headers: {'Content-Type': 'application/json'},
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