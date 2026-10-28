var app = angular.module("app-module", ['ngRoute', 'ngResource']);

app.controller("app-controller", function ($scope, $http) {
  /** 1 */
  $scope.name = ["English", "Maths", "Economics"];

  /** 2 */
  $scope.addingNewSubject = function () {
    $scope.name.push($scope.addSubject);
  }

  /** 2 */
  $scope.remove = function (x) {
    $scope.name.splice(x, 1);
  }
})
