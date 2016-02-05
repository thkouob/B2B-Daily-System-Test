var CreateProject;
(function (CreateProject) {
    var PersonInfo = (function () {
        function PersonInfo(UID, Name, Title, FirstName, GroundId, MemberType, MemberTypeDesc) {
            this.UID = UID;
            this.Name = Name;
            this.Title = Title;
            this.FirstName = FirstName;
            this.GroundId = GroundId;
            this.MemberType = MemberType;
            this.MemberTypeDesc = MemberTypeDesc;
        }
        return PersonInfo;
    })();
    CreateProject.PersonInfo = PersonInfo;
    var BackLog = (function () {
        function BackLog(JiraNumber, JiraLink, Description, SubTaskList) {
            this.JiraNumber = JiraNumber;
            this.JiraLink = JiraLink;
            this.Description = Description;
            this.SubTaskList = SubTaskList;
        }
        return BackLog;
    })();
    CreateProject.BackLog = BackLog;
    var SubTaskInfo = (function () {
        function SubTaskInfo(Role, AssigneeList) {
            this.Role = Role;
            this.AssigneeList = AssigneeList;
        }
        return SubTaskInfo;
    })();
    CreateProject.SubTaskInfo = SubTaskInfo;
    CreateProject.DRServiceHost = 'http://10.16.133.102:52332/';
    CreateProject.JiraServiceHost = 'http://10.16.133.102:3000/';
    CreateProject.JiraSiteHost = 'http://jira/browse/';
    CreateProject.GetPersonUri = 'prj/v1/Person';
    CreateProject.GetBackLogUri = 'jiraapi/issues';
    function GetPersonData($http) {
        var personInfoList = [];
        var requestUrl = CreateProject.DRServiceHost + CreateProject.GetPersonUri;
        $http.get(requestUrl)
            .then(function (response) {
            var responseData = response.data;
            for (var _i = 0; _i < responseData.length; _i++) {
                var person = responseData[_i];
                personInfoList.push(new PersonInfo(person.UID, person.Name, person.Title, person.FirstName, person.GroupID, person.MemberType, person.MemberTypeDesc));
            }
        }, function (error) {
            //// write log / show error alert.
            console.log(error);
        });
        return personInfoList;
    }
    CreateProject.GetPersonData = GetPersonData;
    function GetBackLogList($http) {
        var backLogList = [];
        var requestUrl = CreateProject.JiraServiceHost + CreateProject.GetBackLogUri;
        //var requestUrl = '/base/GetMockNodeBacklogInfo';
        $http.get(requestUrl)
            .then(function (response) {
            var responseObj = response.data;
            if (responseObj) {
                $('#iconLoading').hide();
                $('#t_BackLog').fadeIn();
                for (var _i = 0, _a = responseObj.data; _i < _a.length; _i++) {
                    var backLog = _a[_i];
                    backLogList.push(new BackLog(backLog.key, CreateProject.JiraSiteHost + backLog.key, backLog.summary, null));
                }
            }
        }, function (error) {
            //// write log / show error alert.
            console.log(error);
        });
        return backLogList;
    }
    CreateProject.GetBackLogList = GetBackLogList;
})(CreateProject || (CreateProject = {}));
angular.module('CreateProjectModule', ['ngTagsInput', 'ui.bootstrap'])
    .factory('DRService', ['$http', function ($http) {
        return {
            GetPersonData: CreateProject.GetPersonData($http),
        };
    }])
    .factory('JiraService', ['$http', function ($http) {
        return {
            GetBackLogList: CreateProject.GetBackLogList($http)
        };
    }])
    .filter('FilterPersonData', function () {
    return function (data, query) {
        query = query.toLowerCase();
        var result = [];
        for (var _i = 0; _i < data.length; _i++) {
            var person = data[_i];
            if (person.UID.toLowerCase().startsWith(query) || person.Name.toLowerCase().startsWith(query)) {
                result.push(person);
            }
        }
        return result;
    };
})
    .controller('CreateProjectCtr', ['$scope', '$filter', 'DRService', 'JiraService', function ($scope, $filter, drService, jiraService) {
        //model
        $scope.ProjectNumber;
        $scope.ProjectName;
        $scope.PersonData = drService.GetPersonData;
        $scope.BackLogList = jiraService.GetBackLogList;
        $scope.AddedProjectPBInfo = [];
        $scope.SM;
        $scope.DevGroup;
        $scope.StartDate;
        $scope.ReleaseDate;
        $scope.LaunchDay;
        // function
        $scope.AddPB = function ($index) {
            var selectedPB = $scope.BackLogList[$index];
            selectedPB.SubTaskList = [
                new CreateProject.SubTaskInfo("Dev-UI", []),
                new CreateProject.SubTaskInfo("Dev-Service", []),
                new CreateProject.SubTaskInfo("Test", [])
            ];
            $scope.AddedProjectPBInfo.push(selectedPB);
            $scope.BackLogList.splice($index, 1);
        };
        $scope.RemovePB = function ($index) {
            $scope.BackLogList.push($scope.AddedProjectPBInfo[$index]);
            $scope.AddedProjectPBInfo.splice($index, 1);
        };
        $scope.LoadPersonData = function (query) {
            return $filter('FilterPersonData')($scope.PersonData, query);
        };
    }]);
//# sourceMappingURL=CreateProject_Sean.js.map