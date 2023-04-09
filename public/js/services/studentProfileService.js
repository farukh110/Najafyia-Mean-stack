(function () {

    angular.module('mainApp').factory('studentProfileService', studentProfileService);
    function studentProfileService($http) {
        return {
            addStudent: addStudent,
            getStudents: getStudents,
            addStudentsList: addStudentsList,
            uploadPhotos: uploadPhotos,
            getCountryList: getCountryList,
            getLanguagesList: getLanguagesList,
            deleteStudent: deleteStudent,
            getStudentById: getStudentById,
            updateStudent: updateStudent,
            getStudentsByCount: getStudentsByCount,
            getStudentListWithPriority: getStudentListWithPriority,
            getStudentListWithNoPriority: getStudentListWithNoPriority
        }
        //create new Student
        function addStudent(studentProfileData) {
            return $http({
                method: 'post',
                url: '/api/studentProfile/add',
                data: studentProfileData,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.studentData;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }
        //Function to get all Students
        function getStudents() {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/studentProfile/list',
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
        function addStudentsList(students) {
            return $http({
                method: 'post',
                url: '/api/studentProfile/addList',
                params: { langauge: localStorage.getItem('lang') },
                data: students,
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
        function uploadPhotos(files) {
            var formData = new FormData();
            formData.append('files', files);
            return $http({
                url: '/admin/studentList',
                method: 'POST',
                data: formData,
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(function (res) {
                return res;
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
        //get Languages List
        function getLanguagesList() {
            return $http({
                method: 'get',
                url: '/api/languages/list',
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
        //Function to Actiave/Deactiave Student Profile
        function deleteStudent(studentId, status) {
            return $http({
                method: 'delete',
                url: '/api/studentProfile/delete/' + studentId + '/' + status,
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
        //Function to get Student by Id
        function getStudentById(studentId) {
            return $http({
                method: 'get',
                url: '/api/studentProfile/item/' + studentId,
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
        //Function to update Student
        function updateStudent(content) {
            return $http({
                method: 'put',
                url: '/api/studentProfile/update',
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
        function getStudentsByCount(studentsCount, isSyed) {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/studentProfile/studentsCount/' + studentsCount + '/' + isSyed,
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

        function getStudentListWithPriority() {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/studentProfile/StudentListWithPriority',
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

        function getStudentListWithNoPriority() {
            return $http({
                method: 'get',
                params: { language: localStorage.getItem('lang') },
                url: '/api/studentProfile/StudentListWithNoPriority',
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