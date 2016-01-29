var BacklogInfo2 = (function () {
    function BacklogInfo2(jNumber, jLink, desc, stList) {
        this.JiraNumber = jNumber;
        this.JiraLink = jLink;
        this.Description = desc;
        this.SubTaskList = stList;
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
    function PersonInfo(uid, name, groupID, membertype, memberTypeDesc) {
        this.UID = uid;
        this.Name = name;
        this.GroupID = groupID;
        this.MemberType = membertype;
        this.MemberTypeDesc = memberTypeDesc;
    }
    return PersonInfo;
})();
angular.module('scrumModule', [])
    .factory('DRService', ['$http', function ($http) {
        //TODO Get API Data
        //$http.get('Url')
        //    .then(function (response) {
        //    }, function (response) {
        //
        //    });
        var backLogData = [];
        backLogData.push(new BacklogInfo2("TCBB-9679", "http://jira/browse/TCBB-9679", "Fix the deadlock issue of Sciquest order process app.", []));
        backLogData.push(new BacklogInfo2("TCBB-9634", "http://jira/browse/TCBB-9634", "Export order results", []));
        backLogData.push(new BacklogInfo2("TCBB-9623", "http://jira/browse/TCBB-9623", "support multiple fixed discount promo code for multiple warehouse order", []));
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
                    personInfoList.push(new PersonInfo(value.UID, value.Name, value.GroupID, value.MemberType, value.MemberTypeDesc));
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
    .controller('createProjectCtrl', ['$scope', '$sce', 'DRService', 'JIRAService', function ($scope, $sce, DRService, JIRAService) {
        $scope.projectNumber;
        $scope.projectName;
        $scope.BackLogList = DRService.BackLogList;
        $scope.PersonData = JIRAService.GetPersonData;
        $scope.tags = [
            { text: 'Tag1' },
            { text: 'Tag2' },
            { text: 'Tag3' }
        ];
        var defaultSubTask = [];
        defaultSubTask.push(new SubTask2("Dev-UI", ["Stella.W.Chen", "Sean.Z.Chen"]));
        defaultSubTask.push(new SubTask2("Dev-Service", ["Sin.C.Lin"]));
        defaultSubTask.push(new SubTask2("Test", ["Tina.Y.Lee"]));
        $scope.AddedProjectPBInfo = [];
        var projectPBInfoList = [];
        //Test data for added project PB infos
        projectPBInfoList.push(new BacklogInfo2("TCBB-9397", "http://jira/browse/TCBB-9397", "facase to api phase I (Landing, Product)", defaultSubTask));
        projectPBInfoList.push(new BacklogInfo2("TCBB-9220", "http://jira/browse/TCBB-9220", "Support MS, MW, Stand alone sent in SciQuest app", defaultSubTask));
        $scope.AddedProjectPBInfo = projectPBInfoList;
        $scope.AddPB = function ($index) {
            var selectedPB = $scope.BackLogList[$index];
            $scope.BackLogList.splice($index, 1);
            $scope.AddedProjectPBInfo.push(selectedPB);
        };
        $scope.RemovePB = function ($index) {
            var removedPB = $scope.AddedProjectPBInfo[$index];
            $scope.AddedProjectPBInfo.splice($index, 1);
            $scope.BackLogList.push(removedPB);
        };
        $scope.tags = [
            { id: 1, name: 'Tag1' },
            { id: 2, name: 'Tag2' },
            { id: 3, name: 'Tag3' }
        ];
    }]);
//# sourceMappingURL=createProjectSin.js.map