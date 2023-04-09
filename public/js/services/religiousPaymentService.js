(function () {

    angular.module('mainApp').factory('religiousPaymentService', religiousPaymentService);
    function religiousPaymentService($http) {
        return {
            addreligiousPaymentCategory: addreligiousPaymentCategory,
            getCategories: getCategories,
            addReligiousPayment: addReligiousPayment,
            getReligiousPayments: getReligiousPayments,
            deleteReligiousPayment: deleteReligiousPayment,
            getReligiousPaymentById: getReligiousPaymentById,
            updateReligiousPayment: updateReligiousPayment,
            getCategoriesByProgramType: getCategoriesByProgramType,
            getRelatedReligiousPayments: getRelatedReligiousPayments,
            getCountryList: getCountryList,
            addReligiousPaymentContent: addReligiousPaymentContent,
            getNoteBasedOnSlug:getNoteBasedOnSlug
        }
        //create new Category
        function addreligiousPaymentCategory(content) {
            return $http({
                method: 'post',
                url: '/api/religiousPayments/Category/add',
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
        //select All categories categories
        function getCategories() {
            return $http({
                method: 'get',
                url: '/api/religiousPayments/category/list',
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

        function addReligiousPaymentContent(content) {
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

        //create new religiousPayment
        function addReligiousPayment(religiousPaymentData) {
            return $http({
                method: 'post',
                url: '/api/program/add',
                data: religiousPaymentData,
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
        //update religiousPayment
        function updateReligiousPayment(content) {
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
        //get religiousPayments
        function getReligiousPayments(programTypeId) {
            var userLang  = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: '/api/program/list/' + programTypeId+'/'+userLang,
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
        //delete religiousPayment by id
        function deleteReligiousPayment(religiousPaymentId) {
            return $http({
                method: 'delete',
                url: '/api/program/delete/' + religiousPaymentId + '',

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
        //Get Religious Payment By Id
        function getReligiousPaymentById(religiousPaymentId) {
            return $http({
                method: 'get',
                params: {lang: localStorage.getItem('lang')},
                url: '/api/program/item/' + religiousPaymentId,
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
        // get related projects for project details
        function getRelatedReligiousPayments(content) {
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
        function getCategoriesByProgramType(programTypeId) {
            var userLang = localStorage.getItem('lang');

            return $http({
                method: 'get',
                url: '/api/program/subcategory/list/' + programTypeId+'/'+userLang,
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
        //get Country List
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

        function getNoteBasedOnSlug(slug) {
            return $http({
                method: 'get',
                url: '/api/program/configSetting?slug='+encodeURIComponent(slug),
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