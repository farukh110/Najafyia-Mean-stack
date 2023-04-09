(function (angular) {
  angular.module('mainApp').component('donationCalculatorComponent', {
    templateUrl: 'views/components/donation-calculator/donation-calculator.component.html',
    bindings: {
      showorphancategories: "=?",
      showsubcategories: "=?",
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