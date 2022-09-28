var blogMgr = {
	fPathRoot : "bod:/des:div.tplPge",
	fPathPostItems : "ide:content/des:.bkPostItem",
	fPathPostLink : "chi:.bkBase_ti/des:.postLink",
	fPathPostContent : "chi:.bkBase_co/des:.postCo",
	fPathOutNav : "ide:content/des:ul.outNav",
	fPathBlogLink : "ide:navigation/des:.outCat_sel_yes.outCat_typ_blog/des:.outCat_lnk",
	fPathRootLink : "ide:header/des:.rootLnk",
	fIsBlogPage : false,
	fStrings : [
	/*00*/  "Publié le","par",
	/*02*/  "Catégories :", "Ouvrir",
	/*04*/  "Ouvrir ce billet"
	],
	init : function(){
		try{
			this.fRoot = scPaLib.findNode(this.fPathRoot);
			scOnLoads[scOnLoads.length] = this;
		}catch(e){scCoLib.log("ERROR - blogMgr.init : "+e)}
	},
	onLoad : function(){
		this.fOutNav = scPaLib.findNode(this.fPathOutNav);
		this.fPostItems = scPaLib.findNodes(this.fPathPostItems);

		if (!this.fPostItems || this.fPostItems.length==0) {
			this.fBlogLink = scPaLib.findNode(this.fPathBlogLink) || scPaLib.findNode(this.fPathRootLink);
			return;
		}
		this.fIsBlogPage = true;
		this.fPostCtrl = {};
		for (var i=0; i<this.fPostItems.length; i++){
			var vPostItem = this.fPostItems[i];
			var vLink = scPaLib.findNode(this.fPathPostLink, vPostItem);
			vPostItem.fLink = vLink.getAttribute("data-link");
			vPostItem.fContent = scPaLib.findNode(this.fPathPostContent, vPostItem);
			vPostItem.fShade = scDynUiMgr.addElement("a", vPostItem.fContent, "postShade");
			vPostItem.fShade.href = vLink.href;
			vPostItem.fShade.innerHTML = "<span>"+this.fStrings[3]+"</span>";
			vPostItem.fShade.title = this.fStrings[4];
			this.fPostCtrl[vPostItem.fLink] = true;
		}
		this.fExtraPosts = scDynUiMgr.addElement("div", scPaLib.findNode("par:", this.fPostItems[0]), "");
		
		if(window.location.search.length > 0) {
			var vCtxt = window.location.search.substring(1).split("&");
			for (var i = 0, n = vCtxt.length; i < n; i++) {
				var vCmd = vCtxt[i].split("=");
				switch (vCmd[0]) {
					case "tag" : 
						this.filterTag(vCmd[1]);
						break;
				}
			}
		}
	},
	declarePostInfo : function(pUrlPostInfo){
		this.fUrlPostInfo = pUrlPostInfo;
	},
	declarePostIndex: function(pIdx){
		this.fIdxUrl = pIdx;
	},
	setId : function(pBlogId){
		this.fBlogId = pBlogId;
	},
	filterTag : function(pTagId){
		if (!this.fIsBlogPage) {
			if (this.fBlogLink) window.location.replace(this.fBlogLink.getAttribute("href")+"?tag="+pTagId);
			return;
		}
		this.fExtraPosts.innerHTML = "";
		if (this.fCurrentTag) tplMgr.xSwitchClass(sc$(this.fCurrentTag), "tagFilter_true", "tagFilter_false", true);
		if (pTagId==this.fCurrentTag){
			this.fCurrentTag = "";
			tplMgr.xSwitchClass(this.fRoot, "tagFilter_true", "tagFilter_false", true);
			if (this.fOutNav) this.fOutNav.style.display = "";
			return;
		}
		this.fCurrentTag = pTagId;
		this.xInitPostInfo();
		var vPosts = scServices.scSearch.find(this.fIdxUrl, "tag-"+pTagId+ " blog-"+this.fBlogId, {returnResultSet:true});
		for (var i=0; i<this.fPostItems.length; i++){
			var vPostItem = this.fPostItems[i];
			var vIsListed = typeof vPosts.ctrl[vPostItem.fLink] != "undefined";
			tplMgr.xSwitchClass(vPostItem, "tagDisplay_"+!vIsListed, "tagDisplay_"+vIsListed, true);
		}
		for (var i=0; i<vPosts.list.length; i++){
			var vPost = vPosts.list[i];
			if (!this.fPostCtrl[vPost.url]){
				var vPostInfo = this.fPostInfo.list[this.fPostInfo.ctrl[vPost.url]];
				if (vPostInfo) {
					var vItemRoot = scDynUiMgr.addElement("div", this.fExtraPosts, "bkBase bkPostItem");
					var vItemHead = scDynUiMgr.addElement("h2", vItemRoot, "bkBase_ti");
					var vItemLink = scDynUiMgr.addElement("a", vItemHead, "postLink");
					vItemLink.href= scServices.scLoad.getPathFromRoot(vPostInfo.url);
					vItemLink.innerHTML = "<span>" + vPostInfo.title + "</span>";
					var vItemCo = scDynUiMgr.addElement("div", vItemRoot, "bkBase_co");
					var vItemCoHead = scDynUiMgr.addElement("div", vItemCo, "postHead");
					vItemCoHead.innerHTML = '<span class="postDate">'+this.fStrings[0]+' <em class="postDate">'+vPostInfo.dateStr+'</em></span><span class="postAuthor"> '+this.fStrings[1]+' <em class="postAuthor">'+vPostInfo.author+'</em></span>';
					var vItemCoInfo = scDynUiMgr.addElement("div", vItemCo, "postInfo");
					var vPostTags = "";
					for (var j=0; j<vPostInfo.tags.length; j++){
					 vPostTags += '<em class="postTag "><a class="tagLink " rel="tag" target="_self" href="?tag='+vPostInfo.tags[j].id+'"><span>'+vPostInfo.tags[j].name+'</span></a></em>';
					 if (j<vPostInfo.tags.length-1) vPostTags += ' , ';
					}
					vItemCoInfo.innerHTML = '<span class="postTags ">'+this.fStrings[2]+' '+vPostTags+'</span>';
				}
			}
		}
		tplMgr.xSwitchClass(this.fRoot, "tagFilter_false", "tagFilter_true", true);
		tplMgr.xSwitchClass(sc$(pTagId), "tagFilter_false", "tagFilter_true", true);
		if (this.fOutNav) this.fOutNav.style.display = "none";
		
	},

	/* === Private functions ================================================== */

	xInitPostInfo : function() {
		if (this.fPostInfo) return;
		try{
			var vReq = this.xGetHttpRequest();
			vReq.open("GET",this.fUrlPostInfo,false);
			vReq.send();
			this.fPostInfo = {list:this.xDeserialiseObjJs(vReq.responseText), ctrl:{}};
			for (var i=0; i<this.fPostInfo.list.length; i++){
				var vPostInfo = this.fPostInfo.list[i];
				this.fPostInfo.ctrl[vPostInfo.url] = i;
			}
		}catch(e){
			scCoLib.log("ERROR - blogMgr.xInitPostInfo : "+e);
		}
	},


	/* === Utilities ========================================================== */
	xGetHttpRequest: function(){
		if (window.XMLHttpRequest && (!this.fIsLocal || !window.ActiveXObject)) return new XMLHttpRequest();
		else if (window.ActiveXObject) return new ActiveXObject("Microsoft.XMLHTTP");
	},
	xDeserialiseObjJs : function(pStr){
		if(!pStr) return {};
		var vVal;
		eval("vVal="+pStr);
		return vVal;
	},

	onLoadSortKey : "Z"
}