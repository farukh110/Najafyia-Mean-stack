(function () {

    angular.module('mainApp').controller('socialLoginController', SocialLoginController);

    function SocialLoginController($scope, $window, $sce, $compile, $location, utilService, projectService, programTypeService, donationProcessService, multipartForm, loginService, cartService) {


        $scope.checkUser = function () {
            var url = $location.url();
            var arr = url.split("/");
            var id = arr[arr.length - 1];
            if (arr[3]) {
                var user = {email: arr[2]};
                loginService.socialLoginAuthentication(user).then(function (res) {
                    loginService.getDonarFromUser(res._id)
                        .then(function (result) {
                            localStorage.setItem("donarId", result.data._id);
                            loginService.getSession().then(function (res) {
                                var user = res.data;
                            });
                            $window.location.href = "/#/home";
                            //toastr.success("Welcome " + result.data.user.fullName);
                        }).catch(function (error) {
                        return error
                    });
                })
            }


        }

    }
})();