(function () {

    angular.module('mainApp').factory('sadaqaService', sadaqaService);
    function sadaqaService($http) {
        return {
            addSadaqaCategory: addSadaqaCategory,
            getCategories: getCategories,
            getCategoriesByProgramType: getCategoriesByProgramType,
            addSadaqa: addSadaqa,
            getSadaqas: getSadaqas,
            deleteSadaqa: deleteSadaqa,
            getSadaqaById: getSadaqaById,
            updateSadaqa: updateSadaqa,
            addSadqaContent: addSadqaContent,
            getRelatedSadaqas: getRelatedSadaqas
        }
        // get related projects for project details
        function getRelatedSadaqas(content) {
            return $http({
                method: 'post',
                url: '/api/program/related/list/',
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
        //create new Category
        function addSadaqaCategory(content) {
            return $http({
                method: 'post',
                url: '/api/Sadaqa/Category/add',
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
        //select All categories categories
        function getCategories() {
            return $http({
                method: 'get',
                url: '/api/Sadaqa/category/list',
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
        //create new Sadaqa
        function addSadaqa(SadaqaData) {
            return $http({
                method: 'post',
                url: '/api/program/add',
                data: SadaqaData,
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
        function addSadqaContent(content) {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'post',
                url: '/api/program/addContent',
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
        //update Sadaqa
        function updateSadaqa(content) {
            if (content.programSubCategory != undefined || content.programSubCategory != null) {
                content.programSubCategory.forEach(function (e) {
                    delete e.selected;
                }, this);
            }
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
        //get Sadaqas
        function getSadaqas(programTypeId) {
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
        //delete Sadaqa by id
        function deleteSadaqa(SadaqaId) {
            return $http({
                method: 'delete',
                url: '/api/program/delete/' + SadaqaId + '',

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
        function getSadaqaById(SadaqaId) {
            return $http({
                method: 'get',
                params: { lang: localStorage.getItem('lang') },
                url: '/api/program/item/' + SadaqaId,
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