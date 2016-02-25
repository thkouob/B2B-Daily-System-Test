using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;

namespace B2BDR2.UI
{
    public class B2bAuthHelper
    {
        private static bool IsExist
        {
            get
            {
                return HttpContext.Current != null;
            }
        }

        private static IPrincipal _user
        {
            get
            {
                if (IsExist)
                {
                    return HttpContext.Current.User;
                }
                return null;
            }
        }

        /// <summary>ad short name</summary>
        public static string CurrentUserName
        {
            get
            {
                if (_user != null && _user.Identity.IsAuthenticated)
                {
                    var userName = _user.Identity.Name;
                    return userName.Substring(userName.LastIndexOf(@"\") + 1);
                }
                return null;
            }
        }
    }
}