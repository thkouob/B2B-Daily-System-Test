interface IPBInfo {
    IssueKey: string;
    JiraLink: string;
    Summary: string;
    SubTaskList: Array<ISubTaskInfo>;
}

interface ISubTaskInfo {
    RoleName: string;
    Role: number;
    Assignee: Array<IMemberInfo>;
}

interface IMemberInfo {
    UID: string;
    Name: string;
    Title: string;
    FirstName: string;
    GroupID: number;
    MemberType: number;
    MemberTypeDesc: string;
}

interface ICreateProjectRequest {
    ProjectNumber: number;
    ProjectName: string;
    StartDate: string;
    ReleaseDate: string;
    LaunchDate: string;
    DevGruop: number;
    SMUID: string;
    PBList: Array<IPBInfo>;
}

enum DevGroup {
    www = 1,
    ssl = 2
}

enum PbUserRole {
    Test = 1,
    Service = 2,
    UI = 3
}

class PBInfo implements IPBInfo {
    IssueId: number;
    IssueKey: string;
    Summary: string;
    JiraLink: string;
    Selected: boolean;
    SubTaskList: Array<SubTaskInfo>;

    constructor(id: number, key: string, link: string, summary: string, selected: boolean) {
        this.IssueId = id;
        this.IssueKey = key;
        this.JiraLink = link;
        this.Summary = summary;
        this.Selected = selected;
        this.SubTaskList = [new SubTaskInfo(3, "Dev-UI", [], ""), new SubTaskInfo(2, "Dev-Service", [], ""), new SubTaskInfo(1, "Test", [], "")];
    }
}

class SubTaskInfo implements ISubTaskInfo {
    RoleName: string;
    Role: number;
    Assignee: Array<MemberInfo>;
    AssigneeUID: string;

    constructor(role: number, roleName: string, assignee: Array<MemberInfo>, uid: string) {
        this.Role = role;
        this.RoleName = roleName;
        this.Assignee = assignee;
        this.AssigneeUID = uid;
    }
}

class MemberInfo implements IMemberInfo {
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

(function () {
    angular.module('UtilityCommon', [])
        .constant('DR2Config', {
            PersonSessionKey: "personList",
            ProjectStatusUrl: "/Utility/ProjectStatus",
            DRServiceHostUrl: 'http://10.16.133.102:52332',
            NodeServiceHostUrl: 'http://10.16.133.102:3000'
        })
        .filter('unique', function () { //https://gist.github.com/wholypantalones/c6a0b055a5615eb4c416
            return function (items, filterOn) {
                if (filterOn === false) {
                    return items;
                }
                if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                    var hashCheck = {}, newItems = [];
                    var extractValueToCompare = function (item) {
                        if (angular.isObject(item) && angular.isString(filterOn)) {
                            return item[filterOn];
                        }
                        else {
                            return item;
                        }
                    }
                    angular.forEach(items, function (item) {
                        var valueToCheck, isDuplicate = false;
                        for (var i = 0; i < newItems.length; i++) {
                            if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) {
                            newItems.push(item);
                        }
                    })
                    items = newItems;
                }
                return items;
            }
        })
        .filter('fullToUidName', ['DR2Service', function (DR2Service) {
            var data = null, serviceInvoked = false;

            function logicData(input) {
                if (data !== null) {
                    angular.forEach(data, function (value: IDR2Person, key) {
                        if (angular.isString(input) && input.toLowerCase() === value.Name.toLowerCase()) {
                            return input = value.UID;
                        }
                    });
                }
                return input;
            }

            var resultFn = <IStatefulFunction>function (input) {
                if (data === null) {
                    if (!serviceInvoked) {
                        serviceInvoked = true;
                        DR2Service.GetPersonList.then(function (personList) {
                            data = personList;
                        }, function () {
                            data = null;
                        })
                    }
                    return input;
                } else {
                    return logicData(input);
                }
            };
            //https://docs.angularjs.org/guide/filter
            resultFn.$stateful = true;
            return resultFn;
        }])
        .filter('uidToFullName', ['DR2Service', function (DR2Service) {

            var data = null, serviceInvoked = false;

            function logicData(input) {
                if (data !== null) {
                    angular.forEach(data, function (value: IDR2Person, key) {
                        if (angular.isString(input) && input.toLocaleLowerCase() == value.UID.toLocaleLowerCase()) {
                            return input = value.Name;
                        }
                    });
                }
                return input;
            }

            var resultFn = <IStatefulFunction>function (input) {
                if (data === null) {
                    if (!serviceInvoked) {
                        serviceInvoked = true;
                        DR2Service.GetPersonList.then(function (personList) {
                            data = personList;
                        }, function () {
                            data = null;
                        })
                    }
                    return input;
                } else {
                    return logicData(input);
                }
            };
            //https://docs.angularjs.org/guide/filter
            resultFn.$stateful = true;
            return resultFn;
        }])
        .directive("modalShow", function () {
            return {
                restrict: "A",
                scope: {
                    modalVisible: "="
                },
                link: function (scope: any, element, attrs) {
                    //Hide or show the modal
                    scope.showModal = function (visible) {
                        if (visible) {
                            element.modal("show");
                        }
                        else {
                            element.modal("hide");
                        }
                    }
                    //Check to see if the modal-visible attribute exists
                    if (!attrs.modalVisible) {
                        //The attribute isn't defined, show the modal by default
                        scope.showModal(true);
                    }
                    else {
                        //Watch for changes to the modal-visible attribute
                        scope.$watch("modalVisible", function (newValue, oldValue) {
                            scope.showModal(newValue);
                        });

                        //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                        element.bind("hide.bs.modal", function () {
                            scope.modalVisible = false;
                            if (!scope.$$phase && !scope.$root.$$phase)
                                scope.$apply();
                        });
                    }
                }
            };
        })
        .directive('drcalander', function () {
            var tpl = '<div class="input-group">' +
                '<input name="{{name}}" type="text" class="form-control" placeholder= "yyyy/MM/dd" uib-datepicker-popup="{{format}}"' +
                'ng-model="datemodel" is-open="popupDateCalander.opened" close-text="Close" ng-click="openDateCalander()" readonly required />' +
                '<span class="input-group-btn" >' +
                '<button type="button" class="btn btn-default" ng-click="openDateCalander()" ><i class="fa fa-calendar" ></i></button>' +
                '</span>' +
                '</div>';
            return {
                restrict: 'E',
                template: tpl,
                replace: true,
                scope: { format: '@', datemodel: '=', name: '@' },
                link: function (scope: any) {
                    scope.openDateCalander = function () {
                        scope.popupDateCalander.opened = true;
                    };

                    scope.popupDateCalander = {
                        opened: false
                    };
                }
            };
        })
        .factory('storageHelper', function () {
            function GetSessionStorageItem(key, isString: boolean = false) {
                var data = window.sessionStorage.getItem(key);
                if (isString) {
                    return data;
                }
                return angular.fromJson(data);
            }

            function SetSessionStorageItem(key, data: any) {
                if (!angular.isString(data)) {
                    data = angular.toJson(data)
                }
                window.sessionStorage.setItem(key, data);
            }

            return {
                GetSessionStorageItem: GetSessionStorageItem,
                SetSessionStorageItem: SetSessionStorageItem
            }
        })
        .factory('DR2Service', ['$http', '$q', 'DR2Config', 'storageHelper', function ($http: ng.IHttpService, $q: ng.IQService, DR2Config, storageHelper) {
            var hostUrl = DR2Config.DRServiceHostUrl;
            var personUrl = `${hostUrl}/prj/v1/Person`; //'/base/GetPersonInfo';
            var prjStatusUrl = `${hostUrl}/prj/v1/newprjstatus`;

            function GetOriginPersonData(url) {
                return $http.get(url, { cache: true });
            }

            function GetPersonList(url) {
                var deffered = $q.defer();
                var personInfo = storageHelper.GetSessionStorageItem(DR2Config.PersonSessionKey);

                if (personInfo === undefined || personInfo === null) {
                    GetOriginPersonData(url).then(function (response) {
                        var personList = [];
                        angular.forEach(response.data, function (value: IDR2Person, key) {
                            personList.push(
                                new DR2Person(value.FirstName, value.GroupId, value.MemberTypeDesc,
                                    value.MemberType, value.Name, value.Titile, value.UID));
                        });
                        storageHelper.SetSessionStorageItem(DR2Config.PersonSessionKey, personList);
                        deffered.resolve(personList);
                    }, function (response) {
                        deffered.reject(response);
                    });
                } else {
                    deffered.resolve(angular.fromJson(personInfo));
                }

                return deffered.promise;
            }

            function TryConvertToDate(data) {
                try {
                    var d = new Date(data);
                    return `${[d.getFullYear(), d.getMonth() + 1, d.getDate()].join('/') } ${[d.getHours(), d.getMinutes(), d.getSeconds()].join(':') }`
                } catch (e) {

                }
                return data;
            }

            function GetProjectStatus(url) {
                var deferred = $q.defer();
                $http.get(url)
                    .then(function (response) {
                        var data = response.data;
                        var mockData: Array<ProjectStatus> = [];
                        if (data) {
                            angular.forEach(data, function (value, key) {
                                mockData.push(
                                    new ProjectStatus(
                                        value.ProjectNumber,
                                        value.ProjectName,
                                        value.SM,
                                        TryConvertToDate(value.CreatedDate),
                                        value.JIRAStatus,
                                        value.DRStatus));
                            });
                            deferred.resolve(mockData);
                        }
                        deferred.reject('not found data!');

                    }, function (response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            }

            function GetMemberData(url) {
                var memberInfoList: Array<MemberInfo> = [];
                $http.get(url)
                    .then(function (response) {
                        var result: any = response.data;
                        angular.forEach(result, function (value, key) {
                            memberInfoList.push(
                                new MemberInfo(value.UID, value.Name, value.Title, value.FirstName, value.GroupID, value.MemberType, value.MemberTypeDesc));
                        });
                    }, function (error) {
                        //// write log / show error alert.
                        console.log(error);
                    });
                return memberInfoList;
            }

            return {
                GetPersonList: GetPersonList(personUrl),
                GetProjectStatus: GetProjectStatus(prjStatusUrl),
                GetMemberData: GetMemberData(personUrl)
            }
        }])
        .factory('NodeService', ['$http', '$q', 'DR2Config', function ($http: ng.IHttpService, $q, DR2Config) {
            var hostUrl = DR2Config.NodeServiceHostUrl;
            var backLogListUrl = `${hostUrl}/jiraapi/issues`;
            var createPrjUrl = `${hostUrl}/jiraapi/project`;

            function GetBackLogList() {
                var backLogList: Array<PBInfo> = [];
                $http.get(backLogListUrl)
                    .then(function (response) {
                        var result: any = response.data;
                        angular.forEach(result.data, function (value, key) {
                            backLogList.push(new PBInfo(value.id, value.key, "http://jira/browse/" + value.key, value.summary, true));
                        });
                        $('#iconLoading').hide();
                        $('#t_BackLog').fadeIn();
                    }, function (error) {
                        // write log / show error alert.
                        console.log(error);
                    });
                return backLogList;
            }

            function PostCreateProject(request: ICreateProjectRequest) {
                //var deferred = $q.defer();
                //if (true) {
                //    $http.post(createPrjUrl, request)
                //        .then(function (response) {
                //            debugger;
                //            deferred.resolve(response.data);
                //        }, function (response) {
                //            debugger
                //            // write log / show error alert.
                //            console.log(response);
                //            deferred.resolve(response);
                //        });
                //}
                //return deferred.promise;
                $http.post(createPrjUrl, request)
                    .then(function (response) {
                        return true;
                    }, function (error) {
                        // write log / show error alert.
                        console.log(error);
                        return false;
                    });
            }

            return {
                GetBackLogList,
                PostCreateProject
            }
        }])

    //Interface
    interface IDR2Person {
        FirstName: string,
        GroupId: number,
        MemberTypeDesc: string,
        MemberType: number,
        Name: string,
        Titile: string,
        UID: string
    }

    interface IProjectStatus {
        ProjectNumber: number,
        ProjectName: string,
        SMName: string,
        CreateDate: string,
        JIRAStatus: number,
        DRStatus: number
    }

    interface IPBInfo {
        IssueKey: string;
        JiraLink: string;
        Summary: string;
        SubTaskList: Array<ISubTaskInfo>;
    }

    interface IStatefulFunction {
        (): string;
        $stateful: boolean;
    }

    //class
    class DR2Person implements IDR2Person {
        FirstName: string;
        GroupId: number;
        MemberTypeDesc: string;
        MemberType: number;
        Name: string;
        Titile: string;
        UID: string;
        constructor(firstName: string,
            groupId: number,
            memberTypeDesc: string,
            memberType: number,
            name: string,
            titile: string,
            uID: string) {
            this.FirstName = firstName;
            this.GroupId = groupId;
            this.MemberType = memberType;
            this.Name = name;
            this.Titile = titile;
            this.UID = uID;
        }
    }

    class ProjectStatus implements IProjectStatus {
        ProjectNumber: number;
        ProjectName: string;
        SMName: string;
        CreateDate: string;
        JIRAStatus: number;
        DRStatus: number;
        constructor(pNumber: number, pName: string,
            sMName: string, cDate: string,
            jiraStatus: string, drStatus: string) {
            this.ProjectNumber = pNumber;
            this.ProjectName = pName;
            this.SMName = sMName;
            this.CreateDate = cDate;
            this.JIRAStatus = parseInt(jiraStatus);
            this.DRStatus = parseInt(drStatus);
        }
    }
})()
