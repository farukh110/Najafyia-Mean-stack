mainApp.service('multipartForm', ['$http', function ($http) {

    try {

        this.post = function (uploadUrl, file) {
            console.log('upload URL ',uploadUrl,file);
            var formData = new FormData();
            formData.append('file', file);
            return $http({
                url: uploadUrl,
                method: 'POST',
                data: formData,
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(function (res) {
                console.log('returnign resp from multippart ', res);
                return res;
            }).catch(err => console.log(`Caught by multipart ${JSON.stringify(err)}`));;
        }
    }

    catch (ex) {
    }


}])