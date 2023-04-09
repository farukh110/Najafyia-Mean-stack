(function (angular) {
    angular.module('mainApp').component('sadaqahComponent', {
      templateUrl: 'views/components/donation-calculator/sadaqah-component.html',
      bindings: {
        // showorphancategories: "=?",
        // showsubcategories: "=?",
        compactmode: "=?"
      },
      controllerAs: 'ctrl',
      controller: ['$scope', function ($scope) {
        this.$onInit = function () {
          var vm = this;
          console.log(vm);
       
  
          
        }
  
       
  
      }]
    });
  })(window.angular);