/* Optim Office page manager */
var tplMgr = {
	fCbkInit : true,
	fCookieWarn : false,
	fCbkClosedPath : "des:.cbkClosed",
	fCbkOpenPath : "des:.cbkOpen",
	fEwebPath : "des:.binWeb/chi:iframe",
	fEwebMaxHeight : 1200,
	fBkBtnPath : "des:.outBkBtn/des:a",
	fListeners : {showSearch:[],resetSearch:[]},

	fStrings : ["Cacher le contenu de \'%s\'","Afficher le contenu de \'%s\'",
		/*02*/      "Ce site utilise un système de mesure d\'audience qui nécessite l\'utilisation de cookies pour comprendre et améliorer l\'expérience du visiteur.","",
		/*04*/      "Pour en savoir plus, %s.","cliquez ici",
		/*06*/      "Accepter","Refuser",
		/*08*/      "Cookies","Gestion des cookies",
		/*10*/      "Continuer","Continuer sans accepter"],

	init : function(){
		try{
			var vHash = window.location.hash;
			if (vHash.length>0); vHash = vHash.substring(1);

			// Set callback functions.
			scDynUiMgr.collBlk.addOpenListener(this.sCollBlkOpen);
			scDynUiMgr.collBlk.addCloseListener(this.sCollBlkClose);
			if ("scTooltipMgr" in window ) {
				scTooltipMgr.addShowListener(this.sTtShow);
				scTooltipMgr.addHideListener(this.sTtHide);
			}

			this.initDom(vHash);

			this.fCurrentUrl = scCoLib.hrefBase();
			this.fPageCurrent = scServices.scLoad.getUrlFromRoot(this.fCurrentUrl);
			this.fStore = new this.LocalStore();

			if (this.fCookieWarn){
				var vCookieWarnBar = this.fCookieWarnBar = scDynUiMgr.addElement("div", scPaLib.findNode("bod:"), "cookieWarnBar" + (localStorage.getItem("AcknowledgeAnalytics") || sessionStorage.getItem("AcknowledgeAnalytics") ? " acknowledged" : ""), scPaLib.findNode("bod:/chi:"));
				var vCookieWarnContent = scDynUiMgr.addElement("div", vCookieWarnBar, "cookieWarnContent");
				var vMsgBox = scDynUiMgr.addElement("span", vCookieWarnContent, "cookieWarnMsg")
				var vMsg = this.fStrings[this.fCookieWarn=="analytics" ? 2 : 3];
				var vLegalLink = scPaLib.findNode("ide:footer/des:a.privacyLnk");
				if (vLegalLink) vMsg += " " + this.fStrings[4].replace("%s", '<a href="'+vLegalLink.href+'">'+this.fStrings[5]+'</a>');
				vMsgBox.innerHTML = vMsg + " ";
				var vBtnOk = scDynUiMgr.addElement("a", vCookieWarnContent, "cookieWarnBtnOk");
				vBtnOk.setAttribute("role", "button");
				vBtnOk.setAttribute("title", this.fStrings[6]);
				vBtnOk.href = "#";
				vBtnOk.innerHTML = '<span>'+this.fStrings[6]+'</span>';
				vBtnOk.onclick = function(){
					var vIsActive = localStorage.getItem("ActivateAnalytics");
					localStorage.setItem("ActivateAnalytics", true);
					localStorage.setItem("AcknowledgeAnalytics", true);
					tplMgr.fCookieWarnBar.classList.add("acknowledged");
					if (!vIsActive) window.location.reload();
					return false;
				}
				var vBtnNok = scDynUiMgr.addElement("a", vCookieWarnContent, "cookieWarnBtnNok");
				vBtnNok.setAttribute("role", "button");
				vBtnNok.setAttribute("title", this.fStrings[7]);
				vBtnNok.href = "#";
				vBtnNok.innerHTML = '<span>'+this.fStrings[7]+'</span>';
				vBtnNok.onclick = function(){
					var vIsActive = localStorage.getItem("ActivateAnalytics");
					localStorage.removeItem("ActivateAnalytics");
					localStorage.setItem("AcknowledgeAnalytics", true);
					tplMgr.fCookieWarnBar.classList.add("acknowledged");
					if (vIsActive) window.location.reload();
					return false;
				}
				var vBtnCont = scDynUiMgr.addElement("a", vCookieWarnContent, "cookieWarnBtnCont");
				vBtnCont.setAttribute("role", "button");
				vBtnCont.setAttribute("title", this.fStrings[11]);
				vBtnCont.href = "#";
				vBtnCont.innerHTML = '<span>'+this.fStrings[10]+'</span>';
				vBtnCont.onclick = function(){
					var vIsActive = localStorage.getItem("ActivateAnalytics");
					localStorage.removeItem("ActivateAnalytics");
					localStorage.removeItem("AcknowledgeAnalytics");
					sessionStorage.setItem("AcknowledgeAnalytics", true);
					tplMgr.fCookieWarnBar.classList.add("acknowledged");
					if (vIsActive) window.location.reload();
					return false;
				}
				var vBtnBar = scDynUiMgr.addElement("a", scPaLib.findNode("ide:footer/chi:.tplFootBanner"), "cookieWarnBtnBar");
				vBtnBar.setAttribute("role", "button");
				vBtnBar.setAttribute("title", this.fStrings[9]);
				vBtnBar.href = "#";
				vBtnBar.innerHTML = '<span>'+this.fStrings[8]+'</span>';
				vBtnBar.onclick = function(){
					localStorage.removeItem("AcknowledgeAnalytics");
					tplMgr.fCookieWarnBar.classList.remove("acknowledged");
					return false;
				}
			}
		}catch(e){scCoLib.log("ERROR - tplMgr.init : "+e)}
	},
	initDom : function(pHash) {
		// Close collapsable blocks that are closed by default.
		if (this.fCbkInit){
			var vCbks = scPaLib.findNodes(this.fCbkClosedPath);
			for (var i=0; i<vCbks.length; i++) {
				if (!pHash || pHash && pHash != scPaLib.findNode("chi:", vCbks[i]).id) {
					var vTgl = scPaLib.findNode("des:a", vCbks[i]);
					if (vTgl) vTgl.onclick();
				}
			}
			vCbks = scPaLib.findNodes(this.fCbkOpenPath);
			for (var i=0; i<vCbks.length; i++) {
				var vTgl = scPaLib.findNode("des:a", vCbks[i]);
				if (vTgl) vTgl.title = tplMgr.fStrings[0].replace("%s", (vTgl.innerText ? vTgl.innerText: vTgl.textContent));
			}
		}

		// Init Ewebs
		var vEwebs = scPaLib.findNodes(this.fEwebPath);
		for (var i=0; i<vEwebs.length; i++) {
			var vEweb = vEwebs[i];
			vEweb.fParent = vEweb.parentNode;
			vEweb.fParent.style.position = "relative";
			vEweb.fParent.style.height = "200px";
			vEweb.style.position = "absolute";
			vEweb.style.width = "100%";
			vEweb.style.height = "100%";
			if(scCoLib.isIE) vEweb.onreadystatechange = this.sOnloadEweb;
			else vEweb.onload = this.sOnloadEweb;
		}
	},
	setCookieWarn : function(pFlag) {
		this.fCookieWarn = pFlag;
	},
	saveLocation : function() {
		this.fStore.set("lastPageUrl", document.location.href);
	},
	loadPage : function(pUrl){
		if (pUrl && pUrl.length>0) {
			window.location.href = scServices.scLoad.getPathFromRoot(pUrl);
		}
	},
	makeVisible : function(pNode){
		// Ouvre bloc collapsable contenant pNode
		var vCollBlk = scPaLib.findNode("anc:.collBlk_closed",pNode);
		if(vCollBlk) vCollBlk.fTitle.onclick();
	},
	scrollTo : function(pId){
		this.loadPage(this.fPageCurrent +"#" + pId);
	},
	setBackButtons : function() {
		var vBkBtns = scPaLib.findNodes(this.fBkBtnPath);
		for (var i=0; i<vBkBtns.length; i++) vBkBtns[i].onclick=function(){var vUrl = tplMgr.fStore.get("lastPageUrl");if(vUrl) this.setAttribute("href", vUrl)};
	},
	xMediaFallback: function(pMedia) {
		while (pMedia.firstChild) {
			if (pMedia.firstChild instanceof HTMLSourceElement) {
				pMedia.removeChild(pMedia.firstChild);
			} else {
				pMedia.parentNode.insertBefore(pMedia.firstChild, pMedia);
			}
		}
		pMedia.parentNode.removeChild(pMedia);
	},

	/* === Utilities ============================================================ */
	/** tplMgr.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		var vBtn = pParent.ownerDocument.createElement("a");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		vBtn.href = "#";
		vBtn.target = "_self";
		if (pTitle) vBtn.setAttribute("title", pTitle);
		if (pCapt) vBtn.innerHTML = '<span class="capt">' + pCapt + '</span>';
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib);
		else pParent.appendChild(vBtn);
		return vBtn;
	},
	/** tplMgr.xAddElt : Add an HTML element to a parent node. */
	xAddElt : function(pName, pParent, pClassName, pNoDisplay, pHidden, pNxtSib){
		var vElt;
		if(scCoLib.isIE && pName.toLowerCase() == "iframe") {
			//BUG IE : impossible de masquer les bordures si on ajoute l'iframe via l'API DOM.
			var vFrmHolder = pParent.ownerDocument.createElement("div");
			if (pNxtSib) pParent.insertBefore(vFrmHolder,pNxtSib);
			else pParent.appendChild(vFrmHolder);
			vFrmHolder.innerHTML = "<iframe scrolling='no' frameborder='0'></iframe>";
			vElt = vFrmHolder.firstChild;
		} else {
			vElt = pParent.ownerDocument.createElement(pName);
			if (pNxtSib) pParent.insertBefore(vElt,pNxtSib);
			else pParent.appendChild(vElt);
		}
		if (pClassName) vElt.className = pClassName;
		if (pNoDisplay) vElt.style.display = "none";
		if (pHidden) vElt.style.visibility = "hidden";
		return vElt;
	},
	/** tplMgr.xSwitchClass - replace a class name. */
	xSwitchClass : function(pNode, pClassOld, pClassNew, pAddIfAbsent, pMatchExact) {
		var vAddIfAbsent = typeof pAddIfAbsent == "undefined" ? false : pAddIfAbsent;
		var vMatchExact = typeof pMatchExact == "undefined" ? true : pMatchExact;
		var vClassName = pNode.className;
		var vReg = new RegExp("\\b"+pClassNew+"\\b");
		if (vMatchExact && vClassName.match(vReg)) return;
		var vClassFound = false;
		if (pClassOld && pClassOld != "") {
			if (vClassName.indexOf(pClassOld)==-1){
				if (!vAddIfAbsent) return;
				else if (pClassNew && pClassNew != '') pNode.className = vClassName + " " + pClassNew;
			} else {
				var vCurrentClasses = vClassName.split(' ');
				var vNewClasses = new Array();
				for (var i = 0, n = vCurrentClasses.length; i < n; i++) {
					var vCurrentClass = vCurrentClasses[i];
					if (vMatchExact && vCurrentClass != pClassOld || !vMatchExact && vCurrentClass.indexOf(pClassOld) != 0) {
						vNewClasses.push(vCurrentClasses[i]);
					} else {
						if (pClassNew && pClassNew != '') vNewClasses.push(pClassNew);
						vClassFound = true;
					}
				}
				pNode.className = vNewClasses.join(' ');
			}
		}
		return vClassFound;
	},
	/** Tooltip lib show callback */
	sTtShow: function(pNode) {
		if (!pNode.fOpt.FOCUS && !pNode.onblur) pNode.onblur = function(){scTooltipMgr.hideTooltip(true);};
	},
	/** Tooltip lib hide callback : this = scTooltipMgr */
	sTtHide: function(pNode) {
		if (pNode) pNode.focus();
	},
	/** Collapsable on open callback function. */
	sCollBlkOpen: function(pCo, pTitle) {
		if (pTitle) pTitle.title = tplMgr.fStrings[0].replace("%s", (pTitle.innerText ? pTitle.innerText: pTitle.textContent));
	},
	/** Collapsable on close callback function. */
	sCollBlkClose: function(pCo, pTitle) {
		if (pTitle) pTitle.title = tplMgr.fStrings[1].replace("%s", (pTitle.innerText ? pTitle.innerText: pTitle.textContent));
	},
	/** Eweb on load callback function. */
	sOnloadEweb: function() {
		try{
			if(scCoLib.isIE && this.readyState != "complete") return;
			try{var vDoc = this.contentWindow.document}catch(e){};
			this.fParent.style.height = Math.min((vDoc ? vDoc.body.scrollHeight+2 : 500), tplMgr.fEwebMaxHeight)+"px";
		} catch(e){scCoLib.log("ERROR tplMgr.sOnloadEweb", e);}
	},
	/** Local Storage API (localStorage/userData/cookie) */
	LocalStore : function (pId){
		if (pId && !/^[a-z][a-z0-9]+$/.exec(pId)) throw new Error("Invalid store name");
		this.fId = pId || "";
		this.fRootKey = scServices.scLoad.getRootUrl();
		if ("localStorage" in window) {
			this.get = function(pKey) {var vRet = localStorage.getItem(this.fRootKey+this.xKey(pKey));return (typeof vRet == "string" ? unescape(vRet) : null)};
			this.set = function(pKey, pVal) {localStorage.setItem(this.fRootKey+this.xKey(pKey), escape(pVal))};
		} else if (window.ActiveXObject){
			this.get = function(pKey) {this.xLoad();return this.fIE.getAttribute(this.xEsc(pKey))};
			this.set = function(pKey, pVal) {this.fIE.setAttribute(this.xEsc(pKey), pVal);this.xSave()};
			this.xLoad = function() {this.fIE.load(this.fRootKey+this.fId)};
			this.xSave = function() {this.fIE.save(this.fRootKey+this.fId)};
			this.fIE=document.createElement('div');
			this.fIE.style.display='none';
			this.fIE.addBehavior('#default#userData');
			document.body.appendChild(this.fIE);
		} else {
			this.get = function(pKey){var vReg=new RegExp(this.xKey(pKey)+"=([^;]*)");var vArr=vReg.exec(document.cookie);if(vArr && vArr.length==2) return(unescape(vArr[1]));else return null};
			this.set = function(pKey,pVal){document.cookie = this.xKey(pKey)+"="+escape(pVal)};
		}
		this.xKey = function(pKey){return this.fId + this.xEsc(pKey)};
		this.xEsc = function(pStr){return "LS" + pStr.replace(/ /g, "_")};
	}
}

