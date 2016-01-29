﻿class BacklogInfo2 {
    JiraNumber: string;
    JiraLink: string;
    Description: string;
    SubTaskList: Array<SubTask2>;
    constructor(jNumber: string, jLink: string, desc: string, stList: Array<SubTask2>) {
        this.JiraNumber = jNumber;
        this.JiraLink = jLink;
        this.Description = desc;
        this.SubTaskList = stList;
    }
}

class SubTask2 {
    Role: string;
    Assignee: Array<string>;
    constructor(role: string, assignee: Array<string>) {
        this.Role = role;
        this.Assignee = assignee;
    }
}

class PersonInfo {
    UID: string;
    Name: string;
    GroupID: number;
    MemberType: number;
    MemberTypeDesc: string;
    constructor(uid: string, name: string, groupID: number, membertype: number, memberTypeDesc: string) {
        this.UID = uid;
        this.Name = name;
        this.GroupID = groupID;
        this.MemberType = membertype;
        this.MemberTypeDesc = memberTypeDesc;
    }
}

angular.module('scrumModule', [])
    .factory('DRService', ['$http', function ($http: ng.IHttpService) {
        //TODO Get API Data
        //$http.get('Url')
        //    .then(function (response) {
        //    }, function (response) {
        //
        //    });

        var backLogData: Array<BacklogInfo2> = [];

        backLogData.push(new BacklogInfo2("TCBB-9679", "http://jira/browse/TCBB-9679", "Fix the deadlock issue of Sciquest order process app.",[]));
        backLogData.push(new BacklogInfo2("TCBB-9634", "http://jira/browse/TCBB-9634", "Export order results",[]));
        backLogData.push(new BacklogInfo2("TCBB-9623", "http://jira/browse/TCBB-9623", "support multiple fixed discount promo code for multiple warehouse order",[]));

        return {
            BackLogList: backLogData
        }
    }])
    .factory('JIRAService', ['$http', function ($http: ng.IHttpService) {
        var getPersonUrl = 'http://10.16.133.102:52332/prj/v1/Person';

        function GetPersonData(url) {
            var personInfoList: Array<PersonInfo> = [];
            $http.get(url)
                .then(function (response) {
                    var result: any = response.data;
                    angular.forEach(result, function (value, key) {
                        personInfoList.push(
                            new PersonInfo(value.UID, value.Name, value.GroupID, value.MemberType, value.MemberTypeDesc));
                    });
                }, function (error) {
                    console.log(error);
                });
            return personInfoList;
        }

        return {
            GetPersonData: GetPersonData(getPersonUrl)
        }
    }])
    .controller('createProjectCtrl', ['$scope', '$sce', 'DRService', 'JIRAService', function ($scope, $sce: ng.ISCEService, DRService, JIRAService) {
        $scope.projectNumber;
        $scope.projectName;
        $scope.BackLogList = DRService.BackLogList;
        $scope.PersonData = JIRAService.GetPersonData;
        $scope.tags = [
            { text: 'Tag1' },
            { text: 'Tag2' },
            { text: 'Tag3' }
        ];
        var defaultSubTask: Array<SubTask2> = [];
        defaultSubTask.push(new SubTask2("Dev-UI", ["Stella.W.Chen","Sean.Z.Chen"]));
        defaultSubTask.push(new SubTask2("Dev-Service", ["Sin.C.Lin"]));
        defaultSubTask.push(new SubTask2("Test", ["Tina.Y.Lee"]));

        $scope.AddedProjectPBInfo = [];
        var projectPBInfoList: Array<BacklogInfo2> = [];
        //Test data for added project PB infos
        projectPBInfoList.push(new BacklogInfo2("TCBB-9397", "http://jira/browse/TCBB-9397", "facase to api phase I (Landing, Product)", defaultSubTask));
        projectPBInfoList.push(new BacklogInfo2("TCBB-9220", "http://jira/browse/TCBB-9220", "Support MS, MW, Stand alone sent in SciQuest app", defaultSubTask));

        $scope.AddedProjectPBInfo = projectPBInfoList;

        $scope.AddPB = function ($index) {
            var selectedPB: BacklogInfo2 = $scope.BackLogList[$index];
            $scope.BackLogList.splice($index, 1);
            $scope.AddedProjectPBInfo.push(selectedPB);
        }

        $scope.RemovePB = function ($index) {
            var removedPB: BacklogInfo2 = $scope.AddedProjectPBInfo[$index];
            $scope.AddedProjectPBInfo.splice($index, 1);
            $scope.BackLogList.push(removedPB);
        }
        
        $scope.tags = [
            { id: 1, name: 'Tag1' },
            { id: 2, name: 'Tag2' },
            { id: 3, name: 'Tag3' }
        ];

    }]);