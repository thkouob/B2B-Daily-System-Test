(function () {

    class CreateProjectRequest {
        ProjectNumber: number;
        ProjectName: string;
        StartDate: string;
        ReleaseDate: string;
        LaunchDate: string;
        DevGruop: number; //1:WWW, 2:SSL
        SMUID: string;
        PBList: Array<PBInfo>;

        constructor(prjNumber: number, prjName: string, startDate: string, releaseDate: string, launchDate: string, devGroup: number, smUid: string, pbList: Array<PBInfo>) {
            this.ProjectNumber = prjNumber;
            this.ProjectName = prjName;
            this.StartDate = startDate;
            this.ReleaseDate = releaseDate;
            this.LaunchDate = launchDate;
            this.DevGruop = devGroup; //1:WWW, 2:SSL
            this.SMUID = smUid;
            this.PBList = pbList;
        }
    }

    angular.module('mvcapp', ['UtilityCommon', 'ngTagsInput', 'ui.bootstrap', 'ngMessages'])
        .filter('nameToUid', function () {
            return function (inputName: string = null, datalist: Array<MemberInfo> = null) {
                var result;
                if (inputName !== null && datalist !== null && angular.isString(inputName) && angular.isArray(datalist)) {
                    angular.forEach(datalist, function (value: IMemberInfo, key) {
                        if (inputName.toLocaleLowerCase() === value.Name.toLowerCase()) {
                            return result = value.UID;
                        }
                    });
                }

                return result;
            };
        })
        .filter('memberData', function () {
            return function (data, query) {
                query = query.toLowerCase();
                var result = [];
                angular.forEach(data, function (value, key) {
                    if (value.UID.toLowerCase().startsWith(query) || value.Name.toLowerCase().startsWith(query)) {
                        result.push({
                            UID: value.UID,
                            Name: value.Name,
                            FirstName: value.FirstName
                        })
                    }
                });
                return result;
            }
        })
        .directive('checksmname', ['$filter', function ($filter) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function ($scope, elm, attrs, ngModel: any) {
                    return ngModel.$validators.json = function (modelValue, viewValue) {
                        if (ngModel.$isEmpty(modelValue)) {
                            ngModel.$setValidity("checksmname", true);
                            return true;
                        }
                        var uid = $filter('nameToUid')(modelValue, $scope.memberData);
                        if (!ngModel.$isEmpty(uid)) {
                            ngModel.$setValidity("checksmname", true);
                            return true;
                        }

                        ngModel.$setValidity("checksmname", false);
                        return false;
                    };
                }
            };
        }])
        .controller('indexCtrl', ['$scope', '$filter', 'DR2Service', 'NodeService', '$anchorScroll', '$location', '$window',
            function ($scope, $filter, DR2Service, NodeService, $anchorScroll: ng.IAnchorScrollService, $location, $window:ng.IWindowService) {
                // Init
                $scope.projectNumber;
                $scope.projectName;
                $scope.scrumMasterName; //TODO: use localStorage to get init
                $scope.devGroup = 1; //TODO: use localStorage to get init: OOO || 1
                $scope.startDate;
                $scope.releaseDate;
                $scope.launchDate;
                $scope.addedProjectPBInfo = [];
                $scope.backLogList = NodeService.GetBackLogList();
                $scope.memberData = DR2Service.GetMemberData;
                $scope.format = 'yyyy/MM/dd';
                $scope.showDialog;

                // Function
                $scope.scrumMasterUID = function () {
                    var result = $filter('nameToUid')($scope.scrumMasterName, $scope.memberData);
                    return result;
                };

                $scope.FormatDate = function (date) {
                    return $filter('date')(date, 'd/MMM/yy');
                }

                $scope.OpenModal = function () {
                    $scope.drform.$setSubmitted();
                    if ($scope.drform.$valid) {
                        $scope.showDialog = true;
                    } else {
                        $location.hash('top');
                        $anchorScroll();
                    }
                }

                $scope.CloseModal = function () {
                    $scope.showDialog = false;
                }

                //Load all member data use to autocomplete.
                $scope.LoadMemberData = function (query) {
                    return $filter('memberData')($scope.memberData, query);
                }

                $scope.AddPB = function ($index) {
                    var selectedPB: PBInfo = $scope.backLogList[$index];
                    selectedPB.SubTaskList = [new SubTaskInfo(3, "Dev-UI", [], ""), new SubTaskInfo(2, "Dev-Service", [], ""), new SubTaskInfo(1, "Test", [], "")];
                    $scope.addedProjectPBInfo.push(selectedPB);
                    $scope.backLogList.splice($index, 1);
                }

                $scope.RemovePB = function ($index, JiraName) {
                    var answer = confirm("Remove " + JiraName + " from added list?");
                    if (answer) {
                        $scope.backLogList.push($scope.addedProjectPBInfo[$index]);
                        $scope.addedProjectPBInfo.splice($index, 1);
                    }
                }

                // Use to show PB assignees with distinct.
                $scope.GetPBAssignees = function (pb: PBInfo) {
                    var allAssignees = [];

                    pb.SubTaskList.forEach(function (sub) {
                        sub.Assignee.forEach(function (p) {
                            allAssignees.push(p.FirstName);
                        });
                    });
                    var pbAssignees = $filter('unique')(allAssignees);
                    return pbAssignees.join(", ");
                }

                $scope.CreateProject = function () {
                    NodeService.PostCreateProject($scope.GetCreateProjectRequest());

                    $window.location.href = '/Utility/ProjectStatus';
                }

                $scope.GetCreateProjectRequest = function () {
                    $scope.reuqestAddedPBList = angular.copy($scope.addedProjectPBInfo);
                    $scope.reuqestAddedPBList.forEach(function (pb) {
                        var requestSubTaskList: Array<SubTaskInfo> = [];
                        pb.SubTaskList.forEach(function (sub) {
                            sub.Assignee.forEach(function (assignee) {
                                requestSubTaskList.push(new SubTaskInfo(sub.Role, sub.RoleName, null, assignee.UID));
                            });
                        });
                        pb.SubTaskList = requestSubTaskList;
                    });

                    var request: CreateProjectRequest = new CreateProjectRequest(
                        $scope.projectNumber,
                        $scope.projectName,
                        $scope.FormatDate($scope.startDate),
                        $scope.FormatDate($scope.releaseDate),
                        $scope.FormatDate($scope.launchDate),
                        $scope.devGroup,
                        $scope.scrumMasterUID(),
                        $scope.reuqestAddedPBList
                    );

                    return request;
                }
            }]);
})()