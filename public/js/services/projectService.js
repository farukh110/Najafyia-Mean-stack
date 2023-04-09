(function () {

    angular.module('mainApp').factory('projectService', projectService);

    function projectService($http) {
        return {
            addProjectCategory: addProjectCategory,
            getCategories: getCategories,
            getCategoriesByProgramType: getCategoriesByProgramType,
            addProject: addProject,
            getProjects: getProjects,
            deleteProject: deleteProject,
            getProjectById: getProjectById,
            updateProject: updateProject,
            getRelatedProjects: getRelatedProjects,
            getDonationDuration: getDonationDuration
        }

        // get related projects for project details
        function getRelatedProjects(content) {
            return $http({
                method: 'post',
                url: '/api/program/related/list/',
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

        //create new Category
        function addProjectCategory(content) {
            return $http({
                method: 'post',
                url: '/api/project/Category/add',
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

        //select All categories categories
        function getCategories() {
            return $http({
                method: 'get',
                url: '/api/program/subcategory/list',
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

        //get categories with program type id
        function getCategoriesByProgramType(programTypeId) {
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
                })
            });
        }

        //get donation duration list
        function getDonationDuration() {
            var userLang = localStorage.getItem('lang');
            return $http({
                method: 'get',
                url: ' /api/donationduration/list/'+ userLang ,
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

        //create new project
        function addProject(projectData) {
            var languageSelected = localStorage.getItem('lang');
            return $http({
                method: 'post',
                url: '/api/program/add',
                data: projectData,
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

        //update project
        function updateProject(content) {
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

        //get projects
        function getProjects(programTypeId) {
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

        //delete project by id
        function deleteProject(projectId) {
            return $http({
                method: 'delete',
                url: '/api/program/delete/' + projectId + '',

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

        function getProjectById(projectId) {
            
            return $http({
                method: 'get',
                params: {lang: localStorage.getItem('lang')},
                url: '/api/program/item/' + projectId,
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