mainApp.directive('fileReader', function() {
    return {
      scope: {
        fileReader:"="
      },
      link: function(scope, element) {
        angular.element(element).addEventListener('change', function(changeEvent) {
          var files = changeEvent.target.files;
          if (files.length) {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;
                scope.$apply(function () {
                  scope.fileReader = contents;
                });
            };
            
            r.readAsText(files[0]);
          }
        });
      }
    };
  });