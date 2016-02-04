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
    #region
    //public enum DR2HttpMethod
    //{
    //    Get,
    //    Post,
    //    Put,
    //    Delete
    //}

    //public enum DR2ContentType
    //{
    //    [Metadata(Value = "text/html", IsText = true)]
    //    HTML,
    //    [Metadata(Value = "application/json", IsText = true)]
    //    JSON,
    //    [Metadata(Value = "image/png", IsBinary = true)]
    //    PNG,
    //    [Metadata]
    //    TXT,
    //    [Metadata(Value = "application/octet-stream", IsBinary = true)]
    //    DEFAULT
    //}

    ////http://scottoffen.com/2014/04/23/extending-enum-in-c-sharp-dot-net/
    //public class Metadata : Attribute
    //{
    //    public Metadata()
    //    {
    //        this.Value = "text/plain";
    //        this.IsText = true;
    //    }

    //    public string Value { get; set; }
    //    public bool IsText { get; set; }

    //    public bool IsBinary
    //    {
    //        get
    //        {
    //            return !this.IsText;
    //        }
    //        set
    //        {
    //            this.IsText = !value;
    //        }
    //    }
    //}

    //public static class ContentTypeExtensions
    //{
    //    private static object GetMetadata(DR2ContentType ct)
    //    {
    //        var type = ct.GetType();
    //        MemberInfo[] info = type.GetMember(ct.ToString());
    //        if ((info != null) && (info.Length > 0))
    //        {
    //            object[] attrs = info[0].GetCustomAttributes(typeof(Metadata), false);
    //            if ((attrs != null) && (attrs.Length > 0))
    //            {
    //                return attrs[0];
    //            }
    //        }
    //        return null;
    //    }

    //    public static string ToValue(this DR2ContentType ct)
    //    {
    //        var metadata = GetMetadata(ct);
    //        return (metadata != null) ? ((Metadata)metadata).Value : ct.ToString();
    //    }

    //    public static bool IsText(this DR2ContentType ct)
    //    {
    //        var metadata = GetMetadata(ct);
    //        return (metadata != null) ? ((Metadata)metadata).IsText : true;
    //    }

    //    public static bool IsBinary(this DR2ContentType ct)
    //    {
    //        var metadata = GetMetadata(ct);
    //        return (metadata != null) ? ((Metadata)metadata).IsBinary : false;
    //    }
    //}

    //public static class DR2HttpHelper
    //{
    //    //TODO 尚未實作完成
    //    public static string GetRequest(string uri, DR2HttpMethod method, Dictionary<string, string> parameters)
    //    {
    //        //http://blackriver.to/2011/09/rest-service-with-asp-net-mvc-part-2/
    //        if (string.IsNullOrWhiteSpace(uri))
    //        {
    //            throw new ArgumentException("Uri cannot be empty", "uri");
    //        }

    //        if (method == DR2HttpMethod.Get && parameters != null)
    //        {
    //            //uri = string.Format("", uri, string.Join(parameters.ToList(x=>x), ""));
    //        }


    //        var req = (HttpWebRequest)HttpWebRequest.Create(uri);
    //        switch (method)
    //        {
    //            case DR2HttpMethod.Get:
    //                req.Method = DR2HttpMethod.Get.ToString();
    //                break;
    //            case DR2HttpMethod.Post:
    //                req.Method = DR2HttpMethod.Post.ToString();
    //                break;
    //            case DR2HttpMethod.Put:
    //                req.Method = DR2HttpMethod.Put.ToString();
    //                break;
    //            case DR2HttpMethod.Delete:
    //                req.Method = DR2HttpMethod.Delete.ToString();
    //                break;
    //        }

    //        req.ContentType = "application/x-www-form-urlencoded; charset=UTF-8";

    //        if (method != DR2HttpMethod.Get)
    //        {
    //            using (var reW = new StreamWriter(req.GetRequestStream()))
    //            {
    //                //reW.Write(parameters)
    //            }
    //        }

    //        var httpReq = (HttpWebResponse)req.GetResponse();
    //        using (var reR = new StreamReader(httpReq.GetResponseStream()))
    //        {
    //            return reR.ReadToEnd();
    //        }
    //    }
    //}

    #endregion

    public class BaseController : Controller
    {
        //private string GetPostData(NameValueCollection nameValueCollection)
        //{
        //    var parameters = new StringBuilder();

        //    foreach (string key in nameValueCollection.Keys)
        //    {
        //        parameters.AppendFormat("{0}={1}&",
        //            HttpUtility.UrlEncode(key),
        //            HttpUtility.UrlEncode(nameValueCollection[key]));
        //    }
        //    return parameters.ToString();
        //}

        private string GetJsonData(Dictionary<string, string> dct)
        {
            return JsonConvert.SerializeObject(dct);
        }

        public ActionResult GetJIRABacklogInfo()
        {
            return Content(this.GetJIRABackLogData(), "application/json; charset=utf-8");
        }

        public ActionResult GetMockNodeBacklogInfo()
        {
            var data = this.GetJIRABackLogData();
            var result = JObject.Parse(data);
            var d = result["issues"];
            if (d.HasValues)
            {
                var f = d.Select(item => new
                {
                    id = (string)item["id"],
                    key = (string)item["key"],
                    summary = (string)item["fields"]["summary"],
                    name = (string)item["fields"]["assignee"]["name"]
                });
                string errorMsg = null;
                data = JsonConvert.SerializeObject(new { status = "success", data = f, errorMsg = errorMsg });
                return Content(data, "application/json; charset=utf-8");
            }

            return Content(data, "application/json; charset=utf-8");
        }

        public ActionResult GetPersonInfo()
        {
            string result = string.Empty;
            var req = (HttpWebRequest)HttpWebRequest.Create("http://10.16.133.102:52332/prj/v1/Person");
            req.Method = "GET";

            using (WebResponse res = req.GetResponse())
            {
                using (StreamReader reader = new StreamReader(res.GetResponseStream()))
                {
                    result = reader.ReadToEnd();
                }
            }

            return Content(result, "application/json; charset=utf-8");
        }

        private string GetJIRABackLogData()
        {
            string result = string.Empty;
            var req = (HttpWebRequest)HttpWebRequest.Create("http://jira/rest/api/2/search");

            req.Method = "POST";
            req.ContentType = "application/json; charset=utf-8";
            req.Headers.Add("Authorization", "Basic cWFzYXV0aDAxOldpbmRqYWNrITIz");
            var data = new Dictionary<string, string>() { 
            { "jql", "project=TC_B2B AND issuetype ='Product Backlog' AND fixVersion is EMPTY" } ,
            {"maxResults","5000"}};

            byte[] byteArray = Encoding.UTF8.GetBytes(GetJsonData(data));
            req.ContentLength = byteArray.Length;
            Stream rs = req.GetRequestStream();

            rs.Write(byteArray, 0, byteArray.Length);
            rs.Close();

            using (WebResponse res = req.GetResponse())
            {
                rs = res.GetResponseStream();
                using (StreamReader reader = new StreamReader(rs))
                {
                    result = reader.ReadToEnd();
                }
            }

            return result;
        }
    }
}