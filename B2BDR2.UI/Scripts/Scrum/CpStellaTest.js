var BackLog = (function () {
    function BackLog(id, key, title) {
        this.IssueId = id;
        this.IssueKey = key;
        this.Title = title;
    }
    return BackLog;
})();
var B2bMember = (function () {
    function B2bMember(id, name, fname, title, mtype, gid) {
        this.UID = id;
        this.Name = name;
        this.FirstName = fname;
        this.Title = title;
        this.MerberType = mtype;
        this.GroupId = gid;
    }
    return B2bMember;
})();
var ProjectB = (function () {
    function ProjectB(id, title) {
        this.Id = id;
        this.Title = title;
    }
    return ProjectB;
})();
var tpscpPractice = angular.module("jiraApp", []);
//tpscpPractice.config([]);
tpscpPractice.factory('getBackLogList', ['$http', function ($http) {
        ////todo getBackLog
        //var apiurl = 'http://localhost:12676/misc/v1.0.0//eprocurement/namelist';
        //$http.get(apiurl).then(function (result) {
        //});
        var fakeData = [];
        fakeData.push(new BackLog(1234567, "TCBB-7040", "Allow customers change First Name, Last Name, and Job Title_1"));
        fakeData.push(new BackLog(1234568, "TCBB-9917", "[Ariba-EC-UOWashington] Modify PunchOutOrderMessage"));
        fakeData.push(new BackLog(1234569, "TCBB-9933", "[Ariba-EC-UOWashington] Allow customers change First Name"));
        fakeData.push(new BackLog(1234570, "TCBB-9939", "NEB - Member Rewards Program (Site presentation)"));
        return {
            DataList: fakeData
        };
    }]).factory('getMemberList', ['$http', function ($http) {
        ////todo getMember
        //var fakeData: Array<B2bMember> = [];
        //fakeData.push(new B2bMember("sc3l", "Sean.Z.Chen", "Sean", "Dev", 2, 2));
        //fakeData.push(new B2bMember("ll9v", "Leo.L.Lee", "Leo", "Dev", 2, 2));
        //fakeData.push(new B2bMember("cw0q", "Carboon.C.Wu", "Carboon", "Dev", 1, 2));
        //fakeData.push(new B2bMember("sl0h", "Sin.C.Lin", "Sin", "Dev", 2, 2));
        var apiurl = 'http://10.16.133.102:52332/prj/v1/Person';
        return {
            getMembers: function () {
                return $http({
                    url: apiurl,
                    method: 'GET'
                });
            }
        };
    }]);
tpscpPractice.controller("JiraCtrl", ['$scope', 'getBackLogList', 'getMemberList',
    function ($scope, getBackLogList, getMemberList) {
        getMemberList.getMembers().success(function (result) {
            $scope.MembersList = result;
        });
        $scope.BacklogList = getBackLogList.DataList;
        var tempData = [];
        $scope.SelectedLog = function (pb) {
            tempData.push(new ProjectB(pb.IssueKey, pb.Title));
            $scope.ProjectList = tempData;
        };
    }]);
//# sourceMappingURL=CpStellaTest.js.map