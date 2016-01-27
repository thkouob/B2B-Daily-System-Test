using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace B2BDR2.UI.Controllers
{
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

        private string GetJsonData(Dictionary<string,string> dct) 
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(dct);
        }

        public ActionResult GetJIRABacklogInfo()
        {
            string result = string.Empty;
            var req = (HttpWebRequest)HttpWebRequest.Create("http://jira/rest/api/2/search");

            req.Method = "POST";
            req.ContentType = "application/json; charset=utf-8";
            req.Headers.Add("Authorization", "Basic cWFzYXV0aDAxOldpbmRqYWNrITIz");
            var data = new Dictionary<string,string>() { 
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

            return Content(result, "application/json; charset=utf-8");
        }
    }
}