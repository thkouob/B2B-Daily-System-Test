module CreateProject {
    export class PersonInfo {
        constructor(
            public UID: string,
            public Name: string,
            public Title: string,
            public FirstName: string,
            public GroundId: number,
            public MemberType: number,
            public MemberTypeDesc: string
        ) {

        }
    }

    export class BackLog {
        constructor(
            public JiraNumber: string,
            public JiraLink: string,
            public Description: string,
            public SubTaskList: Array<SubTaskInfo>
        ) {

        }
    }

    export class SubTaskInfo {
        constructor(
            public Role: string,
            public AssigneeList: Array<PersonInfo>
        ) {

        }
    }

    export const DRServiceHost = 'http://10.16.133.102:52332/';
    export const JiraServiceHost = 'http://10.16.133.102:3000/';
    export const JiraSiteHost = 'http://jira/browse/';
    export const GetPersonUri = 'prj/v1/Person';
    export const GetBackLogUri = 'jiraapi/issues';

    export function GetPersonData($http: ng.IHttpService): Array<PersonInfo> {
        var personInfoList: Array<PersonInfo> = [];
        var requestUrl = CreateProject.DRServiceHost + CreateProject.GetPersonUri;
        $http.get(requestUrl)
            .then(function (response) {
                var responseData: any = response.data;
                for (var person of responseData) {
                    personInfoList.push(
                        new PersonInfo(
                            person.UID,
                            person.Name,
                            person.Title,
                            person.FirstName,
                            person.GroupID,
                            person.MemberType,
                            person.MemberTypeDesc));
                }
            }, function (error) {
                //// write log / show error alert.
                console.log(error);
            });

        return personInfoList;
    }

    export function GetBackLogList($http: ng.IHttpService): Array<BackLog> {
        var backLogList: Array<BackLog> = [];
        var requestUrl = CreateProject.JiraServiceHost + CreateProject.GetBackLogUri;
        //var requestUrl = '/base/GetMockNodeBacklogInfo';
        $http.get(requestUrl)
            .then(function (response) {
                var responseObj: any = response.data;
                if (responseObj) {
                    $('#iconLoading').hide();
                    $('#t_BackLog').fadeIn();
                    for (var backLog of responseObj.data) {
                        backLogList.push(
                            new BackLog(
                                backLog.key,
                                CreateProject.JiraSiteHost + backLog.key,
                                backLog.summary,
                                null
                            ));
                    }
                }
            }, function (error) {
                //// write log / show error alert.
                console.log(error);
            });

        return backLogList;
    }
}

angular.module('CreateProjectModule', ['ngTagsInput', 'ui.bootstrap'])
    .factory('DRService', ['$http', function ($http: ng.IHttpService) {
        return {
            GetPersonData: CreateProject.GetPersonData($http),
        }
    }])

    .factory('JiraService', ['$http', function ($http: ng.IHttpService) {
        return {
            GetBackLogList: CreateProject.GetBackLogList($http)
        }
    }])

    .filter('FilterPersonData', function () {
        return function (data, query) {
            query = query.toLowerCase();
            var result = [];
            for (var person of data) {
                if (person.UID.toLowerCase().startsWith(query) || person.Name.toLowerCase().startsWith(query)) {
                    result.push(person);
                }
            }

            return result;
        }
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
        }

        $scope.RemovePB = function ($index) {
            $scope.BackLogList.push($scope.AddedProjectPBInfo[$index]);
            $scope.AddedProjectPBInfo.splice($index, 1);
        }

        $scope.LoadPersonData = function (query) {
            return $filter('FilterPersonData')($scope.PersonData, query);
        }
    }])