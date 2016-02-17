using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace B2BDR2.UI.Controllers
{
    public class UtilityController : BaseController
    {
        public ActionResult CreateProject()
        {
            return View();
        }

        public ActionResult ProjectStatus()
        {
            return View();
        }
    }
}