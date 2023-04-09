(function () {

    angular.module('mainApp').factory('donationService', donationService);
    function donationService($http) {
        return {
            addDonation: addDonation,
            updateDonationWithDocument: updateDonationWithDocument,
            addDonationDirect : addDonationDirect,
            uploadAndSendFile : uploadAndSendFile
        }
        function addDonation(content) {
            return $http({
                method: 'post',
                url: '/api/donation/add',
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
        function updateDonationWithDocument(content) {
            return $http({
                method: 'post',
                url: '/api/donation/updateDonationWithDocument',
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

        function uploadAndSendFile(files){
            var formData = new FormData();
            formData.append('files', files);
            return $http({
                url: '/donation/uploadFilSendEmail',
                method: 'POST',
                data: formData,
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(function (res) {
                return res;
            });
        }

        function addDonationDirect(content) {
            return $http({
                method: 'post',
                url: '/api/donation/addDirectDonation',
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
    }
})()