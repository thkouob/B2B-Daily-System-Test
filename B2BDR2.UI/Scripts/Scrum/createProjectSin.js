var BacklogInfo2 = (function () {
    function BacklogInfo2(jNumber, jLink, desc) {
        this.JiraNumber = jNumber;
        this.JiraLink = jLink;
        this.Description = desc;
        this.SubTaskList = [new SubTask2("Dev-UI", []), new SubTask2("Dev-Service", []), new SubTask2("Test", [])];
    }
    return BacklogInfo2;
})();
var SubTask2 = (function () {
    function SubTask2(role, assignee) {
        this.Role = role;
        this.Assignee = assignee;
    }
    return SubTask2;
})();
var PersonInfo = (function () {
    function PersonInfo(uid, name, title, firstName, groupID, membertype, memberTypeDesc) {
        this.UID = uid;
        this.Name = name;
        this.Title = title;
        this.FirstName = firstName;
        this.GroupID = groupID;
        this.MemberType = membertype;
        this.MemberTypeDesc = memberTypeDesc;
    }
    return PersonInfo;
})();
angular.module('scrumModule', ['ngTagsInput', 'ui.bootstrap', 'ngAnimate'])
    .factory('DRService', ['$http', function ($http) {
        //TODO Get API Data
        //$http.get('Url')
        //    .then(function (response) {
        //    }, function (response) {
        //
        //    });
        var backLogData = [];
        backLogData.push(new BacklogInfo2("TCBB-9679", "http://jira/browse/TCBB-9679", "Fix the deadlock issue of Sciquest order process app."));
        backLogData.push(new BacklogInfo2("TCBB-9634", "http://jira/browse/TCBB-9634", "Export order results"));
        backLogData.push(new BacklogInfo2("TCBB-9623", "http://jira/browse/TCBB-9623", "support multiple fixed discount promo code for multiple warehouse order"));
        return {
            BackLogList: backLogData
        };
    }])
    .factory('JIRAService', ['$http', function ($http) {
        var getPersonUrl = 'http://10.16.133.102:52332/prj/v1/Person';
        function GetPersonData(url) {
            var personInfoList = [];
            $http.get(url)
                .then(function (response) {
                var result = response.data;
                angular.forEach(result, function (value, key) {
                    personInfoList.push(new PersonInfo(value.UID, value.Name, value.Title, value.FirstName, value.GroupID, value.MemberType, value.MemberTypeDesc));
                });
            }, function (error) {
                console.log(error);
            });
            return personInfoList;
        }
        return {
            GetPersonData: GetPersonData(getPersonUrl)
        };
    }])
    .filter('personData', function () {
    return function (data, query) {
        query = query.toLowerCase();
        var result = [];
        angular.forEach(data, function (value, key) {
            if (value.UID.toLowerCase().startsWith(query) || value.Name.toLowerCase().startsWith(query)) {
                result.push(value);
            }
        });
        return result;
    };
})
    .controller('createProjectCtrl', ['$scope', '$sce', '$filter', 'DRService', 'JIRAService',
    function ($scope, $sce, $filter, DRService, JIRAService) {
        $scope.projectNumber;
        $scope.projectName;
        $scope.BackLogList = DRService.BackLogList;
        $scope.PersonData = JIRAService.GetPersonData;
        $scope.LoadPersonData = function (query) {
            return $filter('personData')($scope.PersonData, query);
        };
        $scope.AddedProjectPBInfo = [];
        var projectPBInfoList = [];
        //Test data for added project PB infos
        projectPBInfoList.push(new BacklogInfo2("TCBB-9397", "http://jira/browse/TCBB-9397", "facase to api phase I (Landing, Product)"));
        projectPBInfoList.push(new BacklogInfo2("TCBB-9220", "http://jira/browse/TCBB-9220", "Support MS, MW, Stand alone sent in SciQuest app"));
        $scope.AddedProjectPBInfo = projectPBInfoList;
        $scope.AddPB = function ($index) {
            var selectedPB = $scope.BackLogList[$index];
            selectedPB.SubTaskList = [new SubTask2("Dev-UI", []), new SubTask2("Dev-Service", []), new SubTask2("Test", [])];
            $scope.BackLogList.splice($index, 1);
            $scope.AddedProjectPBInfo.push(selectedPB);
        };
        $scope.RemovePB = function ($index) {
            var removedPB = $scope.AddedProjectPBInfo[$index];
            $scope.AddedProjectPBInfo.splice($index, 1);
            $scope.BackLogList.push(removedPB);
        };
    }]);
//# sourceMappingURL=createProjectSin.js.map