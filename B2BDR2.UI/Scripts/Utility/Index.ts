angular.module('mvcapp', ['UtilityCommon'])
    .controller('indexCtrl', ['$scope', '$sce', 'DR2Service', function ($scope, $sce: ng.ISCEService, DR2Service) {
        DR2Service.GetProjRelease.then(function (html) {
            $scope.PrjReleaseContent = $sce.trustAsHtml(html);
        })
    }]);