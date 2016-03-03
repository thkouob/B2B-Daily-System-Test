using HtmlAgilityPack;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace B2BDR2.UI.Controllers
{
    public class BaseController : Controller
    {
        private string GetJsonData(Dictionary<string, string> dct)
        {
            return JsonConvert.SerializeObject(dct);
        }

        public ActionResult GetJiraBacklogInfo()
        {
            var j = new JiraAPIService();
            return Content(j.GetJiraBackLogData(), ContentType.JSON.ToValue());
        }

        public ActionResult GetMockNodeBacklogInfo()
        {
            var j = new JiraAPIService();
            var data = j.GetJiraBackLogData();
            var result = JObject.Parse(data);
            var d = result["issues"];
            if (d.HasValues)
            {
                var f = d.Select(item => new
                {
                    id = item["id"],
                    key = item["key"],
                    hidden = "",//不知道對應哪裡
                    typeName = item["fields"]["issuetype"]["name"],
                    typeId = item["fields"]["issuetype"]["id"],
                    summary = item["fields"]["summary"],
                    typeUrl = item["fields"]["issuetype"]["iconUrl"],
                    priorityUrl = item["fields"]["priority"]["iconUrl"],
                    priorityName = item["fields"]["priority"]["name"],
                    done = "",//不知道對應哪裡
                    assignee = item["fields"]["assignee"]["name"],
                    assigneeName = item["fields"]["assignee"]["displayName"],
                    assigneeUrl = item["fields"]["assignee"]["avatarUrls"]["48x48"],
                    color = "",//不知道對應哪裡
                    estimateStatistic = "",//好像要抓 customfield_10002
                    trackingStatistic = "",//好像要抓 timeestimate
                    statusId = item["fields"]["status"]["id"],
                    statusName = item["fields"]["status"]["name"],
                    statusUrl = item["fields"]["status"]["iconUrl"],
                    fixVersions = item["fields"]["fixVersions"],//array
                    projectId = item["fields"]["project"]["id"],
                });
                string errorMsg = null;
                data = JsonConvert.SerializeObject(new { status = "success", data = f, errorMsg = errorMsg });
                return Content(data, ContentType.JSON.ToValue());
            }

            return Content(data, ContentType.JSON.ToValue());
        }

        public ActionResult GetPersonInfo()
        {
            var dr = new DRAPIService();

            return Content(dr.GetPersonInfo(), ContentType.JSON.ToValue());
        }

        public ActionResult GetProjectRelease()
        {
            var dr = new DRAPIService("http://10.16.133.102:828/");

            return Content(dr.GetProjectRelease());
        }

        public ActionResult TestPutJsonData(string hostUrl, string u,
            string data, Dictionary<string, string> headerInfo)
        {
            //Todo js Test data
            //var jsonI ={"TransactionNumber":2919,"MasterId":"353","CatalogType":"1","CatalogId":"2","ConstraintType":"I","Status":"D","InDate":"2016-02-05T06:40:38.000Z","InUser":"superuser","LastEditDate":"2016-02-25T07:10:02.000Z","LastEditUser":"superuser"}
            //$.post('http://localhost:29128/base/PutJsonData',{data:angular.toJson(jsonI)})

            var d = JsonConvert.DeserializeObject<Dictionary<string, string>>(data);

            if (string.IsNullOrWhiteSpace(hostUrl))
            {
                hostUrl = "http://10.16.133.103/v1.0.50/misc/v1.0.0";
            }

            if (string.IsNullOrWhiteSpace(u))
            {
                u = "siteconstraint/setting/typebinding";
            }

            var s = new DRAPIService(hostUrl);
            var result = s.ExecuteJasonRequest(u, HttpMethod.Put, d, headerInfo);

            return Content(result.ResultMsg, ContentType.JSON.ToValue());
        }

        public ActionResult GetUserName()
        {
            return Json(B2bAuthHelper.CurrentUserName, JsonRequestBehavior.AllowGet);
        }

        public ActionResult HasJIRAFixVersion(string prjNo)
        {
            var j = new JiraAPIService();
            return Json(j.HasFixVersion(prjNo), JsonRequestBehavior.AllowGet);
        }
    }
}