(function () {

    angular.module('mainApp').factory('programService', programService);

    function programService($http) {
        return {
            addProgramCategory: addProgramCategory,
            getCategories: getCategories,
            getCategoriesByProgramType: getCategoriesByProgramType,
            addProgram: addProgram,
            getPrograms: getPrograms,
            getProgramsByLang: getProgramsByLang,
            deleteProgram: deleteProgram,
            getProgramById: getProgramById,
            getProgramByTypeId: getProgramByTypeId,
            updateProgram: updateProgram,
            getRelatedPrograms: getRelatedPrograms,
            getDonationDuration: getDonationDuration,
            getProgramCategoryById: getProgramCategoryById,
            deleteProgramSubCategory: deleteProgramSubCategory,
            getCategoriesWithInActive: getCategoriesWithInActive,
            getCountryList: getCountryList,
            getSDOZList: getSDOZList,
            getFirtahSubType: getFirtahSubType,
            getSahms: getSahms,
            getProgramOfSubCategories: getProgramOfSubCategories,
            getProgramByProgramName: getProgramByProgramName
        }

        //delete sub category by id
        function deleteProgramSubCategory(id) {
            return $http({
                method: 'delete',
                url: '/api/program/subcategory/delete/' + id + '',

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

        //get program categories by id
        function getProgramCategoryById(id) {
            return $http({
                method: 'get',
                params: { lang: localStorage.getItem('lang') },
                url: '/api/program/subcategory/item/' + id,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }

        // get related Programs for Program details
        function getRelatedPrograms(content) {
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
        function addProgramCategory(content) {

            return $http({
                method: 'post',
                url: '/api/Program/Category/add',
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
                url: '/api/program/subcategory/list',
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

        function getCategoriesWithInActive(programTypeId) {
            var userLang = localStorage.getItem('lang');

            return $http({
                method: 'get',
                url: '/api/program/subcategory/listWithAll/' + programTypeId + '/' + userLang,
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

        //get categories with program type id
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
                })
            });
        }

        //get donation duration list
        function getDonationDuration() {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: ' /api/donationduration/list/' + userLang,
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

        //create new Program
        function addProgram(ProgramData) {

            return $http({
                method: 'post',
                url: '/api/program/add',
                data: ProgramData,
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

        //update Program
        function updateProgram(content) {
            if (content.programSubCategory != null || content.programSubCategory || undefined) {
                content.programSubCategory.forEach(function (e) {
                    delete e.selected;
                }, this);
            }
            if (content.donationProcess.donationDurations != null || content.donationProcess.donationDurations || undefined) {
                content.donationProcess.donationDurations.forEach(function (e) {
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

        //get Programs
        function getPrograms() {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: '/api/programs/',
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

        function getProgramsByLang() {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: '/api/programsByLang/' + userLang,
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

        function getProgramOfSubCategories(subCategoryId) {

            return $http({
                method: 'get',
                url: '/api/programs/getCategoryBySub/' + subCategoryId,

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

        //delete Program by id
        function deleteProgram(ProgramId) {

            return $http({
                method: 'delete',
                url: '/api/program/delete/' + ProgramId + '',

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

        // function updatePost(content) {

        //     return $http({
        //         method: 'put',
        //         url: '/api/post/update/',
        //         data: content,
        //         headers: { 'Content-Type': 'application/json' },
        //         success: (function (response) {
        //             return response.data;
        //         }),
        //         error: (function (error) {
        //             return error;
        //         }
        //         )
        //     });


        // }


        function getProgramById(ProgramId) {
            var userLang = localStorage.getItem('lang');

            return $http({
                method: 'get',
                params: {language: userLang},
                url: '/api/program/item/' + ProgramId + '/' + userLang,
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

        function getProgramByTypeId(ProgramTypeId) {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: '/api/program/list/' + ProgramTypeId + '/' + userLang,
                data: userLang,
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

        //get SDOZ List
        function getSDOZList() {
            return $http({
                method: 'get',
                url: '/api/sdoz/list',
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

        //get fitrah sub types
        function getFirtahSubType() {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/fitrahsubtype/list',
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

        //function to get Sahms
        function getSahms() {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/sahms/list',
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

        function getProgramByProgramName(programName) {
            var userLang = localStorage.getItem('lang');

            return $http({
                method: 'get',
                url: '/api/program/itemlist/' + programName + '/' + userLang,
                data: userLang,
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

        // function deletePost(postId) {

        //     return $http({
        //         method: 'delete',
        //         url: '/api/post/delete/'+postId+'',

        //         headers: { 'Content-Type': 'application/json' },
        //         success: (function (response) {
        //             return response.data;
        //         }),
        //         error: (function (error) {
        //             return error;
        //         }
        //         )
        //     });
        // }
    }
})()