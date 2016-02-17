using B2BDR2.UI.Domain;
using B2BDR2.UI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace B2BDR2.UI.Controllers
{
    public class NavbarController : Controller
    {
        // GET: Navbar
        public ActionResult Index()
        {
            var data = new Data();
            return PartialView("_Navbar", data.navbarItems().ToList());
        }

        public ActionResult B2BIndex()
        {
            var data = new Data();
            return PartialView("_B2BNavbar", data.GetB2BNavbarItems().ToList());
        }

        public ActionResult B2BMockupIndex()
        {
            var data = new Data();
            return PartialView("_B2BMockupNavbar", data.GetB2BMockupNavbarItems().ToList());
        }
    }
}