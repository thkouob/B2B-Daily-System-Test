## DR2 Project

## Web.config Setting

* 第一次下載專案人員，請到路徑 C:\Users\{{username}}\Documents\IISExpress\config\applicationhost.config  
把節點 \<section name="windowsAuthentication" overrideModeDefault="Deny" /> 的 overrideModeDefault set "Allow"

## Switch mode
* 依不同mode(debug、dr2debug、release) 切換不同route入口，製作mockup人員可切換debug mode，開發人員則切換dr2debug mode

## Nuget Package

* Package檔案請不要上版控。

* 另有架設內部Nuget Server(http://10.16.133.102:59698/)，可參考(http://confluence.newegg.org/display/TCBB/Create+Nuget+Package+In+Visual+studio+Project)做配置連線。