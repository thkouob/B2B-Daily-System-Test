var BacklogInfo2 = (function () {
    function BacklogInfo2(jNumber, jLink, desc) {
        this.JiraNumber = jNumber;
        this.JiraLink = jLink;
        this.Description = desc;
        this.SubTaskList = [new SubTaskInfo("Dev-UI", []), new SubTaskInfo("Dev-Service", []), new SubTaskInfo("Test", [])];
    }
    return BacklogInfo2;
})();
var SubTaskInfo = (function () {
    function SubTaskInfo(role, assignee) {
        this.Role = role;
        this.Assignee = assignee;
    }
    return SubTaskInfo;
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
        var getBackLogUrl = 'http://10.16.133.102:3000/jiraapi/issues';
        function GetPersonData(url) {
            var personInfoList = [];
            $http.get(url)
                .then(function (response) {
                var result = response.data;
                angular.forEach(result, function (value, key) {
                    personInfoList.push(new PersonInfo(value.UID, value.Name, value.Title, value.FirstName, value.GroupID, value.MemberType, value.MemberTypeDesc));
                });
            }, function (error) {
                //// write log / show error alert.
                console.log(error);
            });
            return personInfoList;
        }
        function GetBackLogList(url) {
            var backLogList = [];
            $http.get(url)
                .then(function (response) {
                var result = response.data;
                angular.forEach(result.data, function (value, key) {
                    backLogList.push(new BacklogInfo2(value.key, "http://jira/browse/" + value.key, value.summary));
                });
                $('#iconLoading').hide();
                $('#t_BackLog').fadeIn();
            }, function (error) {
                //// write log / show error alert.
                console.log(error);
            });
            return backLogList;
        }
        return {
            GetPersonData: GetPersonData(getPersonUrl),
            GetBackLogList: GetBackLogList(getBackLogUrl)
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
        $scope.BackLogList = JIRAService.GetBackLogList;
        $scope.PersonData = JIRAService.GetPersonData;
        $scope.LoadPersonData = function (query) {
            return $filter('personData')($scope.PersonData, query);
        };
        $scope.AddedProjectPBInfo = [];
        var projectPBInfoList = [];
        //Test data for added project PB infos
        //projectPBInfoList.push(new BacklogInfo2("TCBB-9397", "http://jira/browse/TCBB-9397", "facase to api phase I (Landing, Product)"));
        //projectPBInfoList.push(new BacklogInfo2("TCBB-9220", "http://jira/browse/TCBB-9220", "Support MS, MW, Stand alone sent in SciQuest app"));
        $scope.AddedProjectPBInfo = projectPBInfoList;
        $scope.AddPB = function ($index) {
            var selectedPB = $scope.BackLogList[$index];
            selectedPB.SubTaskList = [new SubTaskInfo("Dev-UI", []), new SubTaskInfo("Dev-Service", []), new SubTaskInfo("Test", [])];
            $scope.AddedProjectPBInfo.push(selectedPB);
            $scope.BackLogList.splice($index, 1);
        };
        $scope.RemovePB = function ($index) {
            $scope.BackLogList.push($scope.AddedProjectPBInfo[$index]);
            $scope.AddedProjectPBInfo.splice($index, 1);
        };
    }]);
//# sourceMappingURL=createProjectSin.js.map