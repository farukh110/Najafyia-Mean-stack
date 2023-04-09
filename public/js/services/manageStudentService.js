(function () {

    angular.module('mainApp').factory('manageStudentService', ManageStudentService);

    function ManageStudentService($http) {
        return {
            getStudentsRecurring: getStudentsRecurring,
            changeStudent: changeStudent,
            cancelStudent: cancelStudent
        }

        function getStudentsRecurring() {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/manageStu/getStudentsRecurring',
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

        function changeStudent(content) {
            return $http({
                method: 'post',
                url: '/api/manageStu/changeStudent',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function cancelStudent(content) {
            return $http({
                method: 'post',
                url: '/api/manageStu/cancelStudent',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }


    }
})()