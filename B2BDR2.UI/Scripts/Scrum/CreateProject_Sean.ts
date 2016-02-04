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
            public Assignee: Array<PersonInfo>
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
        $http.get(requestUrl)
            .then(function (response) {
                var responseData: any = response.data;
                $('#iconLoading').hide();
                $('#t_BackLog').fadeIn();
                for (var backLog of responseData) {
                    backLogList.push(
                        new BackLog(
                            backLog.key,
                            CreateProject.JiraSiteHost + backLog.key,
                            backLog.summary,
                            null
                        ));
                }
            }, function (error) {
                //// write log / show error alert.
                console.log(error);
            });

        return backLogList;
    }
}

angular.module('CreateProjectModule', [])
    .factory('Service', ['$http', function ($http: ng.IHttpService) {
        return {
            GetPersonData: CreateProject.GetPersonData($http),
            GetBackLogList: CreateProject.GetBackLogList($http)
        }
    }])

    .controller('CreateProjectCtr', ['$scope', 'Service', '', function ($scope, service) {
        //model
        $scope.ProjectNumber;
        $scope.ProjectName;
        $scope.BackLogList = service.GetBackLogList;
        $scope.PersonData = service.GetPersonData;
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
    }])