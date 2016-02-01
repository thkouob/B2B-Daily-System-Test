class BacklogInfo2 {
    JiraNumber: string;
    JiraLink: string;
    Description: string;
    SubTaskList: Array<SubTaskInfo>;
    constructor(jNumber: string, jLink: string, desc: string) {
        this.JiraNumber = jNumber;
        this.JiraLink = jLink;
        this.Description = desc;
        this.SubTaskList = [new SubTaskInfo("Dev-UI", []), new SubTaskInfo("Dev-Service", []), new SubTaskInfo("Test", [])];
    }
}

class SubTaskInfo {
    Role: string;
    Assignee: Array<PersonInfo>;
    constructor(role: string, assignee: Array<PersonInfo>) {
        this.Role = role;
        this.Assignee = assignee;
    }
}

class PersonInfo {
    UID: string;
    Name: string;
    Title: string;
    FirstName: string;
    GroupID: number;
    MemberType: number;
    MemberTypeDesc: string;
    constructor(uid: string, name: string, title: string, firstName: string, groupID: number, membertype: number, memberTypeDesc: string) {
        this.UID = uid;
        this.Name = name;
        this.Title = title;
        this.FirstName = firstName;
        this.GroupID = groupID;
        this.MemberType = membertype;
        this.MemberTypeDesc = memberTypeDesc;
    }
}

angular.module('scrumModule', ['ngTagsInput', 'ui.bootstrap', 'ngAnimate'])
    .factory('DRService', ['$http', function ($http: ng.IHttpService) {
        //TODO Get API Data
        //$http.get('Url')
        //    .then(function (response) {
        //    }, function (response) {
        //
        //    });

        var backLogData: Array<BacklogInfo2> = [];

        backLogData.push(new BacklogInfo2("TCBB-9679", "http://jira/browse/TCBB-9679", "Fix the deadlock issue of Sciquest order process app."));
        backLogData.push(new BacklogInfo2("TCBB-9634", "http://jira/browse/TCBB-9634", "Export order results"));
        backLogData.push(new BacklogInfo2("TCBB-9623", "http://jira/browse/TCBB-9623", "support multiple fixed discount promo code for multiple warehouse order"));

        return {
            BackLogList: backLogData
        }
    }])
    .factory('JIRAService', ['$http', function ($http: ng.IHttpService) {
        var getPersonUrl = 'http://10.16.133.102:52332/prj/v1/Person';
        var getBackLogUrl = 'http://10.16.133.102:3000/jiraapi/issues';

        function GetPersonData(url) {
            var personInfoList: Array<PersonInfo> = [];
            $http.get(url)
                .then(function (response) {
                    var result: any = response.data;
                    angular.forEach(result, function (value, key) {
                        personInfoList.push(
                            new PersonInfo(value.UID, value.Name, value.Title, value.FirstName, value.GroupID, value.MemberType, value.MemberTypeDesc));
                    });
                }, function (error) {
                    //// write log / show error alert.
                    console.log(error);
                });
            return personInfoList;
        }

        function GetBackLogList(url) {
            var backLogList: Array<BacklogInfo2> = [];
            $http.get(url)
                .then(function (response) {
                    var result: any = response.data;
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
        }
    }])
    .filter('personData', function () {
        return function (data, query) {
            query = query.toLowerCase();
            var result = [];
            angular.forEach(data, function (value, key) {
                if (value.UID.toLowerCase().startsWith(query) || value.Name.toLowerCase().startsWith(query)) {
                    result.push(value)
                }
            });
            return result;
        }
    })
    .controller('createProjectCtrl', ['$scope', '$sce', '$filter', 'DRService', 'JIRAService',
        function ($scope, $sce: ng.ISCEService, $filter, DRService, JIRAService) {

            $scope.projectNumber;
            $scope.projectName;
            $scope.BackLogList = JIRAService.GetBackLogList;
            $scope.PersonData = JIRAService.GetPersonData;
            $scope.LoadPersonData = function (query) {
                return $filter('personData')($scope.PersonData, query);
            }

            $scope.AddedProjectPBInfo = [];
            var projectPBInfoList: Array<BacklogInfo2> = [];
            //Test data for added project PB infos
            //projectPBInfoList.push(new BacklogInfo2("TCBB-9397", "http://jira/browse/TCBB-9397", "facase to api phase I (Landing, Product)"));
            //projectPBInfoList.push(new BacklogInfo2("TCBB-9220", "http://jira/browse/TCBB-9220", "Support MS, MW, Stand alone sent in SciQuest app"));

            $scope.AddedProjectPBInfo = projectPBInfoList;

            $scope.AddPB = function ($index) {
                var selectedPB: BacklogInfo2 = $scope.BackLogList[$index];
                selectedPB.SubTaskList = [new SubTaskInfo("Dev-UI", []), new SubTaskInfo("Dev-Service", []), new SubTaskInfo("Test", [])];
                $scope.AddedProjectPBInfo.push(selectedPB);
                $scope.BackLogList.splice($index, 1);
            }

            $scope.RemovePB = function ($index) {
                $scope.BackLogList.push($scope.AddedProjectPBInfo[$index]);
                $scope.AddedProjectPBInfo.splice($index, 1);
            }
        }]);