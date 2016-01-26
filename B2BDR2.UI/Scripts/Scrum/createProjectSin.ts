angular.module('scrumModule', [])
    .factory('projectMiscService', ['$http', function ($http: ng.IHttpService) {

        //TODO Get API Data
        //$http.get('Url')
        //    .then(function (response) {
        //    }, function (response) {
        //
        //    });

        var mockData: Array<ProjectStatus> = [];

        return {
            DataList: mockData
        }
    }])
    .controller('scrumCtrl', ['$scope', '$sce', 'projectMiscService', function ($scope, $sce: ng.ISCEService, projectMiscService) {

        $scope.DataList = projectMiscService.DataList;

    }]);