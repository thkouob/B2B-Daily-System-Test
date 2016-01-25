using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace B2BDR2.UI.Controllers
{
    public class B2BHomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }        

        public ActionResult CreateProject()
        {
            return View();
        }

        public ActionResult ProjectStatus()
        {
            return View();
        }

        #region Modal
        public ActionResult CreateSubTask()
        {
            return View();
        }
        #endregion
    }
}