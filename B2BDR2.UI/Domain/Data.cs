using B2BDR2.UI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace B2BDR2.UI.Domain
{
    public class Data
    {
        public IEnumerable<Navbar> navbarItems()
        {
            var menu = new List<Navbar>();
            menu.Add(new Navbar { Id = 1, nameOption = "Dashboard", controller = "Demo", action = "Index", imageClass = "fa fa-dashboard fa-fw", status = true, isParent = false, parentId = 0 });
            menu.Add(new Navbar { Id = 2, nameOption = "Charts", imageClass = "fa fa-bar-chart-o fa-fw", status = true, isParent = true, parentId = 0 });
            menu.Add(new Navbar { Id = 3, nameOption = "Flot Charts", controller = "Demo", action = "FlotCharts", status = true, isParent = false, parentId = 2 });
            menu.Add(new Navbar { Id = 4, nameOption = "Morris.js Charts", controller = "Demo", action = "MorrisCharts", status = true, isParent = false, parentId = 2 });
            menu.Add(new Navbar { Id = 5, nameOption = "Tables", controller = "Demo", action = "Tables", imageClass = "fa fa-table fa-fw", status = true, isParent = false, parentId = 0 });
            menu.Add(new Navbar { Id = 6, nameOption = "Forms", controller = "Demo", action = "Forms", imageClass = "fa fa-edit fa-fw", status = true, isParent = false, parentId = 0 });
            menu.Add(new Navbar { Id = 7, nameOption = "UI Elements", imageClass = "fa fa-wrench fa-fw", status = true, isParent = true, parentId = 0 });
            menu.Add(new Navbar { Id = 8, nameOption = "Panels and Wells", controller = "Demo", action = "Panels", status = true, isParent = false, parentId = 7 });
            menu.Add(new Navbar { Id = 9, nameOption = "Buttons", controller = "Demo", action = "Buttons", status = true, isParent = false, parentId = 7 });
            menu.Add(new Navbar { Id = 10, nameOption = "Notifications", controller = "Demo", action = "Notifications", status = true, isParent = false, parentId = 7 });
            menu.Add(new Navbar { Id = 11, nameOption = "Typography", controller = "Demo", action = "Typography", status = true, isParent = false, parentId = 7 });
            menu.Add(new Navbar { Id = 12, nameOption = "Icons", controller = "Demo", action = "Icons", status = true, isParent = false, parentId = 7 });
            menu.Add(new Navbar { Id = 13, nameOption = "Grid", controller = "Demo", action = "Grid", status = true, isParent = false, parentId = 7 });
            menu.Add(new Navbar { Id = 14, nameOption = "Multi-Level Dropdown", imageClass = "fa fa-sitemap fa-fw", status = true, isParent = true, parentId = 0 });
            menu.Add(new Navbar { Id = 15, nameOption = "Second Level Item", status = true, isParent = false, parentId = 14 });
            menu.Add(new Navbar { Id = 16, nameOption = "Sample Pages", imageClass = "fa fa-files-o fa-fw", status = true, isParent = true, parentId = 0 });
            menu.Add(new Navbar { Id = 17, nameOption = "Blank Page", controller = "Demo", action = "Blank", status = true, isParent = false, parentId = 16 });
            menu.Add(new Navbar { Id = 18, nameOption = "Login Page", controller = "Demo", action = "Login", status = true, isParent = false, parentId = 16 });

            return menu.ToList();
        }
    }
}