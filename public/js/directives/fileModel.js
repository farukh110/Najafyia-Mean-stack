mainApp.directive('fileModel', ['$parse', function ($parse) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            // console.log('directive working');
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                    // jQuery('#imageURL').html(element[0].files[0].name);
                    if (element[0].files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            jQuery('.previewImg')
                                .attr('src', e.target.result);
                        };
                        reader.readAsDataURL(element[0].files[0]);
                    }
                    // console.log(element[0].files[0]);
                })

            })
        }
    }
}])