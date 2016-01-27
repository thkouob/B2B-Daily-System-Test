interface IBackLog {
    IssueId: number,
    IssueKey: string,
    Title: string
}

interface IB2bMember {
    UID: string,
    Name: string,
    FirstName: string,
    Title: string,
    MerberType: number,
    GroupId: number
}

class BackLog implements IBackLog {
    IssueId: number;
    IssueKey: string;
    Title: string;
    constructor(id: number, key: string, title: string) {
        this.IssueId = id;
        this.IssueKey = key;
        this.Title = title;
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

var tpscpPractice = angular.module("jiraApp", []);
//tpscpPractice.config([]);
tpscpPractice.factory('getBackLogList', ['$http', function ($http: ng.IHttpService) {
    ////todo getBackLog
    //var apiurl = 'http://localhost:12676/misc/v1.0.0//eprocurement/namelist';

    //$http.get(apiurl).then(function (result) {
    //});

    var fakeData: Array<BackLog> = [];

    fakeData.push(new BackLog(1234567, "TCBB-7040", "Allow customers change First Name, Last Name, and Job Title_1"));
    fakeData.push(new BackLog(1234568, "TCBB-9917", "[Ariba-EC-UOWashington] Modify PunchOutOrderMessage"));
    fakeData.push(new BackLog(1234569, "TCBB-9933", "[Ariba-EC-UOWashington] Allow customers change First Name"));
    fakeData.push(new BackLog(1234570, "TCBB-9939", "NEB - Member Rewards Program (Site presentation)"));

    return {
        DataList: fakeData
    }
}]).factory('getMemberList', ['$http', function ($http: ng.IHttpService) {
    ////todo getMember
    //var apiurl = 'http://localhost:12676/misc/v1.0.0//eprocurement/namelist';

    //$http.get(apiurl).then(function (result) {
    //});

    var fakeData: Array<B2bMember> = [];

    fakeData.push(new B2bMember("sc3l", "Sean.Z.Chen", "Sean", "Dev", 2, 2));
    fakeData.push(new B2bMember("ll9v", "Leo.L.Lee", "Leo", "Dev", 2, 2));
    fakeData.push(new B2bMember("cw0q", "Carboon.C.Wu", "Carboon", "Dev", 1, 2));
    fakeData.push(new B2bMember("sl0h", "Sin.C.Lin", "Sin", "Dev", 2, 2));
    return {
        DataList: fakeData
    }
}]);

tpscpPractice.controller("JiraCtrl", ['$scope', 'getBackLogList', 'getMemberList',
    function ($scope, getBackLogList, getMemberList) {
        $scope.MembersList = getMemberList.DataList;

}]);