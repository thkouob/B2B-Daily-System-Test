interface IBackLog {
    Id: string,
    Key: string,
    Summary: string,
    Description: string,
    Assignee: any,
    Reporter: any
}
//interface ISubTask2 extends IBackLog {
//    SubTaskList: any;
//}
interface IB2bMember {
    UID: string,
    Name: string,
    FirstName: string,
    Title: string,
    MerberType: number,
    GroupId: number
}

interface IProjectB {
    Id: string,
    Title: string,
    Active: string,
    Subtask: any
}

interface ISubTask {
    Id: string,
    Role: string,
    Assign: string
}

class BackLog implements IBackLog {
    Id: string;
    Key: string;
    Summary: string;
    Description: string;
    Assignee: any;
    Reporter: any;
    constructor(id: string, key: string,
        summary: string, description: string,
        assignee: any, reporter: any
    ) {
        this.Id = id;
        this.Key = key;
        this.Summary = summary;
        this.Description = description;
        this.Assignee = assignee;
        this.Reporter = reporter;
    }
}

class B2bMember implements IB2bMember {
    UID: string;
    Name: string;
    FirstName: string;
    Title: string;
    MerberType: number;//1:PM, 2:DEV, 3:Test
    GroupId: number;//1:WWW, 2:SSL
    constructor(id: string, name: string, fname: string, title: string, mtype: number, gid: number) {
        this.UID = id;
        this.Name = name;
        this.FirstName = fname;
        this.Title = title;
        this.MerberType = mtype;
        this.GroupId = gid;
    }
}

class ProjectB implements IProjectB {
    Id: string;
    Title: string;
    Active: string;
    Subtask: any;
    constructor(id: string, title: string, active: string, sub: any) {
        this.Id = id;
        this.Title = title;
        this.Active = active;
        this.Subtask = sub;
    }
}

class SubTask implements ISubTask {
    Id: string;
    Role: string;
    Assign: string;
    constructor(id: string, role: string, assign: string) {
        this.Id = id;
        this.Role = role;
        this.Assign = assign;
    }
}



var tpscpPractice = angular.module("jiraApp", []);
tpscpPractice.factory('getBackLogList', ['$http', '$q', function ($http: ng.IHttpService, $q: ng.IQService) {
    ////getBackLog
    var url = '/Base/GetJIRABacklogInfo';
    var deferred = $q.defer();

    function GetBackLog(url) {
        var backlogInfoList = [];
      
        $http.get(`${url}`)
            .then(function (response) {
                var resultData: any = response.data;
                angular.forEach(resultData.issues, function (value, key) {    
                    backlogInfoList.push(
                        new BackLog(value.id, value.key,
                            value.fields.summary, value.fields.description,
                            value.fields.assignee, value.fields.reporter));
                });
                deferred.resolve(backlogInfoList);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    }

    return {
        DataList: GetBackLog(url)
    }
}]).factory('getMemberList', ['$http', function ($http: ng.IHttpService) {
    ////getMember
    var apiurl = 'http://10.16.133.102:52332/prj/v1/Person';

    return {
        getMembers: function () {
            return $http({
                url: apiurl,
                method: 'GET'
            })
        }
    }
}]);

tpscpPractice.controller("JiraCtrl", ['$scope', 'getBackLogList', 'getMemberList',
    function ($scope, getBackLogList, getMemberList) {
        
        ////display lists info ---------------------------------------------------------------////
        getMemberList.getMembers().success(function (result) {
            $scope.MembersList = result;
        });
        getBackLogList.DataList.then(function (data) {
            $scope.BacklogList = data;
        });

        //// add pb to project ---------------------------------------------------------------////
        var tempData: Array<ProjectB> = [];
        var tempBackLog: Array<BackLog> = [];
        $scope.SelectedProjectLog = function (idx) {
            var tempSubTask = [];
            tempSubTask = GetBackLogWithSubTask($scope.BacklogList[idx].Key);
            if (tempData.length > 0) {
                tempData.push(new ProjectB($scope.BacklogList[idx].Key,
                    $scope.BacklogList[idx].Summary,
                    "",
                    tempSubTask));

                tempBackLog.push($scope.BacklogList[idx]);
                $scope.BacklogList.splice(idx, 1);
            } else {
                tempData.push(new ProjectB($scope.BacklogList[idx].Key,
                        $scope.BacklogList[idx].Summary,
                        "active",
                        tempSubTask));
                tempBackLog.push($scope.BacklogList[idx]);
                $scope.BacklogList.splice(idx, 1);
            }

            $scope.ProjectList = tempData;
         
        };

        function GetBackLogWithSubTask(key) {
            var subTaskInfoList = [];
            subTaskInfoList.push(new SubTask(key, "UI", "(Please use 'Edit' to add assignee!)"),
                new SubTask(key, "Service", null),
                new SubTask(key, "Test", null)
            );

            return subTaskInfoList;
        }

        ////add a subTask to pb ---------------------------------------------------------------////
        $scope.AddSubTask = function (pbId, role, asign, idx) {
            var keepGoing = true;
            angular.forEach($scope.ProjectList, function (value, key) {
                if (keepGoing) {
                    if (value.Id === pbId) {
                        value.Subtask.push(new SubTask(pbId, role, asign));
                    }
                }
            });
        }

        ////remove pb to project ---------------------------------------------------------------////
        $scope.RemoveProjectLog = function (idx) {
            var keepGoing = true;
            angular.forEach(tempBackLog, function (value, key) {
                if (keepGoing) {
                    if (value.Key === $scope.ProjectList[idx].Id) {
                        $scope.BacklogList.push(new BackLog(value.Id, value.Key,
                            value.Summary, value.Description,
                            value.Assignee, value.Reporter));
                        keepGoing = false;
                    }
                }
            });
            tempData.splice(idx, 1);
        };
        
        ////remove a subTask to pb ---------------------------------------------------------------////
        $scope.RemoveSubTask = function (pbId, idx) {
            var keepGoing = true;
            angular.forEach($scope.ProjectList, function (value, key) {
                if (keepGoing) {
                    if (value.Id === pbId) {
                        value.Subtask.splice(idx, 1);
                    }
                }
            });
        }
}]);