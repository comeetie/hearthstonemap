
var Workspace = Backbone.Router.extend({

  views : {},
  models:{},
  routes: {
    "map/:deck":             				"routeMap",
    "about/*":						"routeAbout",
    "*actions": 					"routeSplash"
  },
  initialize: function(){
	this.models.currentState = new State();
	if($(window).width()<500){
		this.models.currentState.set({"settings":"closed","infos":"closed"})
	}
        this.views.mapView = new MapView({model : this.models.currentState, el : $("#map")  });
	this.views.selView = new SelView({model : this.models.currentState, el : $("#sel")  });
	this.views.infosView = new InfosView({model : this.models.currentState , el : $("#infos")});
	this.views.deckioView = new DeckIOView({model : this.models.currentState , el : $("#deckio")});
	this.views.deckView = new DeckView({model : this.models.currentState });
	this.views.deckStatsView = new DeckStatsView({model : this.models.currentState });
	this.views.aboutView = new AboutView({model : this.models.currentState });
	this.views.splashView = new SplashView({model : this.models.currentState ,el : $("#splash")});
  this.views.twitterView = new TwitterView({model : this.models.currentState });
	this.initUI();
	Backbone.history.start()
  },
  routeMap: function(deck) {
	if(deck){
		this.models.currentState.set("deck",decodeURIComponent(deck).split(","))
	}
	this.models.currentState.set({splash:"closed",about:"closed",map:"open"});
  },
  routeAbout: function(params) {
	this.models.currentState.set({splash:"closed",about:"open",map:"closed"});
  },
  routeSplash: function(params) {
	this.models.currentState.set({splash:"open",about:"closed",map:"closed"});
  },
  initUI: function(){
		// tie model changes to location hash
		this.models.currentState.on("change:deckobj change:splash change:map change:about",this.mynav,this);
	},
   mynav: function(){
	if(this.models.currentState.get("map")=="open"){
		this.navigate("map/" + encodeURIComponent(this.models.currentState.get("deckobj").map(function(c){return c["count"]+" "+c["name"]})))
	}
	if(this.models.currentState.get("splash")=="open"){
		this.navigate("splash")
	}
	if(this.models.currentState.get("about")=="open"){
		this.navigate("about")
	}

	}

});

// %%%%%%%%%%%%%%
// Model
var State = Backbone.Model.extend({
	defaults: {deck: [],deckobj:[],settings:"closed",infos:"open",deckio:"closed",splash:"closed",about:"closed",map:"closed",maploaded:false,deckstats:"close"},
	initialize: function(options){
		// constructor
	}

});

// %%%%%%%%%%%%%%
// View

var SplashView = Backbone.View.extend({
	initialize: function(){
		// render view when model changes
		this.model.on("change:splash", this.render,this);

		var that=this;
		this.explore = function(){
			return function(){
				that.model.set({splash:"closed",about:"closed",map:"open"});
			}
		}
		this.$("#btn-explore").on("click",this.explore())


		this.about = function(){
			return function(){
				that.model.set({splash:"closed",about:"open",map:"closed"});
			}
		}
		this.$("#btn-about").on("click",this.about())
		this.render()
	},
	render: function(){
		if(this.model.get("splash")=="open"){
			this.$el.css("display","block")
		}else{
			this.$el.css("display","none")
		}

	}
})


var AboutView = Backbone.View.extend({
	map:{},
	initialize: function(options){
		// render view when model changes
		this.model.on("change:about", this.render,this);


		this.about = function(){
			return function(){
				that.model.set({splash:"closed",about:"open",map:"closed"});
			}
		}



		this.mapgoback = function(){
			return function(){
				that.model.set({splash:"closed",about:"closed",map:"open"});
			}
		}
		$("#btn-mapgoback").on("click",this.mapgoback())
		this.render()
	},
	render: function(){
		if(this.model.get("about")=="open"){
			$("#about").fadeIn()
		}else{
			$("#about").fadeOut()
		}

	}
})



var InfosView = Backbone.View.extend({
	initialize: function(){
		// render view when model changes
		this.model.on("change:infos", this.renderbutton,this);
		// render now
		var that = this;
		this.close = function(){

			return function(){
				console.log("close")
				that.model.set("infos", "closed")
			}
		}
		this.open = function(){
			return function(){
				that.model.set("infos", "open")
			}
		}
		$("#infos-close").on("click",this.close())
		$("#infos-button").on("click",this.open())


		this.renderbutton()
	},
	renderbutton: function(){
		if(this.model.get("infos")=="open"){
			$("#infos-content").css("display","block")
			$("#infos-button").css("display","none")
		}else{
			$("#infos-content").css("display","none")
			$("#infos-button").css("display","block")
		}
	}
})


var DeckIOView = Backbone.View.extend({


	initialize: function(){
		// render view when model changes
		this.model.on("change:deckio", this.renderbutton,this);
		this.model.on("change:deckobj", this.renderdeck,this);
		// render now
		var that = this;
		this.close = function(){
			return function(){
				that.model.set("deckio", "closed")
			}
		}
		this.open = function(){
			return function(){
				that.model.set("deckio", "open")
			}
		}
		this.$("#deck-close").on("click",this.close())
		this.$("#deck-button").on("click",this.open())


		this.renderbutton()
		d3.select("#deckcopypaste").on("input",function(d){that.updatedeck(that)})
	},
	renderbutton: function(){
		if(this.model.get("deckio")=="open"){
			this.$("#deck-content").css("display","block")
			this.$("#deck-button").css("display","none")
		}else{
			this.$("#deck-content").css("display","none")
			this.$("#deck-button").css("display","block")
		}
	},
	renderdeck:function(){

		if(this.model.get("deckobj")!=undefined && this.model.get("deckobj").length>0){
		var decktxt = this.model.get("deckobj").map(function(c){return c["count"]+" "+c["name"]}).join("\n")
		$('#deckcopypaste').val(decktxt);
		}

	},
	updatedeck:function(map){
		map.model.set("deck",document.getElementById("deckcopypaste").value.split("\n"))
	}
})

var TwitterView = Backbone.View.extend({

	initialize: function(){
		// render view when model changes
		this.model.on("change:deckobj", this.render,this);

		this.render()
	},
	render: function(){
		$("#twitter-link").attr("href","https://twitter.com/intent/tweet?text="+encodeURIComponent("Check-out my deck on hearthmap")+"&url="+encodeURIComponent(document.URL))
	}
})

var DeckStatsView = Backbone.View.extend({


	initialize: function(){
		// render view when model changes
		this.model.on("change:deckstats", this.renderbutton,this);
		this.model.on("change:deckobj", this.renderdeck,this);
		// render now
		var that = this;
		this.close = function(){
			return function(){
				that.model.set("deckstats", "closed")
			}
		}
		this.open = function(){
			return function(){
				that.model.set("deckstats", "open")
			}
		}
		$("#deckstats-close").on("click",this.close())
		$("#deckstats-button").on("click",this.open())


		this.renderbutton()
	},
	renderbutton: function(){

		if(this.model.get("deckstats")=="open"){
			$("#deckstats-content").css("display","block")
			$("#deckstats-button").css("display","none")
		}else{
			$("#deckstats-content").css("display","none")
			$("#deckstats-button").css("display","block")
		}
	},

  format : function(){

  },
	renderdeck:function(){
		if(this.model.get("deckobj")!=undefined && this.model.get("deckobj").length>0){
			var decktxt = this.model.get("deckobj").map(function(c){return c["count"]+" "+c["name"]}).join("\n")
    			nbc = d3.sum(this.model.get("deckobj"),function(c){return c["count"]})
		
			d3.select("#nbcard").html(nbc)
			nbuc = this.model.get("deckobj").length
			d3.select("#nbuniqcard").html(nbuc)
			mechs = this.model.get("deckobj").map(function(c){
				return c["mechanics"]!="" ?
				c["mechanics"]
				.substr(1,c["mechanics"].length-2)
				.replace(" ","")
				.replace("_"," ")
				.split(",")
				.map(function(m){return {mechanics:m,count:c["count"]}}) : []
			})
			mechs = [].concat.apply([], mechs)
			mechsc = d3.nest().key(function(d){return d.mechanics})
			.rollup(function(a){return d3.sum(a,function(c){return c["count"]})})
			.entries(mechs)
			.sort(function(a,b){return b.value - a.value})
			
			d3.select("#deckmechs").selectAll(".mechs").remove()
			d3.select("#deckmechs")
			.selectAll(".mechs")
			.data(mechsc)
			.enter()
			.append("span")
			.attr("class","mechs")
			.style("font-size",function(d){return d.value/8 + "em"})
			.text(function(d){return " "+d.key})
		        /* tags = this.model.get("deckobj").map(function(c){
				return c["referencedTags"]!="" ?
				c["tags"]
				.substr(1,c["referencedTags"].length-2)
				.replace(" ","")
				.replace("_"," ")
				.split(",")
				.map(function(m){return {mechanics:m,count:c["count"]}}) : []
			})
			tags = [].concat.apply([], tags) */

    			type=d3.nest().key(function(d){return d["type"]})
			.rollup(function(a){return d3.sum(a,function(c){return c["count"]})})
			.entries(this.model.get("deckobj"))
			.sort(function(a,b){return b.value - a.value})

			d3.select("#decktypes").selectAll(".types").remove()
			d3.select("#decktypes")
			.selectAll(".types")
			.data(type)
			.enter()
			.append("span")
			.attr("class","types")
			.style("font-size",function(d){return d.value/8 + "em"})
			.text(function(d){return " "+d.key})


    	costa=d3.nest().key(function(d){return Math.min(d["cost"],9)})
			.rollup(function(a){return d3.sum(a,function(c){return c["count"]})})
			.entries(this.model.get("deckobj"))
      var cc = [];
      for(var i =0;i<10;i++){
        cc[i]=0
      }
      mv =d3.max(costa,function(c){return c.value})
      costa.forEach(function(c){cc[c.key]=Math.round(c.value/mv*100)})
   
      d3.select("#deckcosthist").text("{"+cc.join(",")+"}")
      d3.selectAll(".rvalue").text("0")
			rare=d3.nest().key(function(d){return d["rarity"]})
			.rollup(function(a){return d3.sum(a,function(c){return c["count"]})})
			.map(this.model.get("deckobj"))
      costsvalues = {$LEGENDARY:1600,$EPIC:1000,$RARE:400,$COMMON:100,$:0,$FREE:0}
      var totcost = 0
      Object.keys(rare).forEach(function(k){
          spid = "#r"+k.substr(1).toLowerCase()+"deck"
   
          totcost = totcost + rare[k]*costsvalues[k]
          d3.select(spid).text(rare[k])
      })
      d3.select("#tcost").text(totcost)


		}

	}
})


var DeckView = Backbone.View.extend({
	initialize: function(){
		// render view when model changes
		this.model.on("change:deck", this.updatedeck,this);
		this.model.on("change:data", this.updatedeck,this);
		this.model.on("change:deckobj", this.renderdeck,this);
		// render now


		this.updatedeck()
		this.renderdeck()
	},

	updatedeck:function(){
		data = this.model.get("data")

		deck = this.model.get("deck")
		if(data!=undefined && deck.length>0){
			name_dict = d3.nest().key(function(d){return d["name"]}).rollup(function(d){return d[0]}).map(data)

			d = deck.map(function(r){
				v=r.split(' ')
				if(+v[0]<3 & +v[0]>0){
					n = r.substr(2)
					return {"name":n,"count":+v[0]}
				}else{
					return {"name":"","count":""}
				}
			}).filter(function(r){return r["name"]!=''})

			deckclean = d.map(function(d){
				tc = name_dict['$'+d["name"]];
				if(tc!=undefined){tc["count"]=d["count"]};
				return tc
			}).filter(function(d){return d!=undefined}).sort(function(a,b){return (a["cost"]-b["cost"])==0 ? (a["name"]<b["name"]?-1:1) : a["cost"]-b["cost"] })

			this.model.set("deckobj",deckclean)
		}
	},

	renderdeck: function(){


		if(this.model.get("deckobj")!=undefined && this.model.get("deckobj").length==0){
			d3.selectAll(".deck").remove()
		}

		if(this.model.get("deckobj")!=undefined && this.model.get("deckobj").length>0){

			var deckclean = this.model.get("deckobj")
			var that = this
			wstep = 5
			wm = 10
			pad= 1
			deckclean.forEach(function(d,i){d["pos"]=i})
			//d3.selectAll(".deck").remove()
			ic = Math.floor(Math.random()*deckclean.length)

			dd=d3.select("#map").selectAll(".deck")
			.data(deckclean,function(d){return Math.round(d["dbfId"])+"c"})
			dda = dd.enter()
			.append("div")
			.attr("class","deck")
			.attr("id",function(d,i){return "deckcardN"+i})
			.style("left",function(d,i){return i*wstep+"em"})
			.style("width",wm+"em")
			.style("padding-top",pad+"em")
			.style("bottom","-40em")
			.on("mouseover",function(d){
				console.log(d["name"])
				ic = that.model.get("deckobj").map(function(d){return d["name"]}).indexOf(d["name"])
				d3.selectAll(".deck").transition(200)
				.style("left",function(dt,i){if(dt["pos"]>ic){return (i*wstep+wm)+"em"}else{return i*wstep+"em"}})
				.style("bottom",function(dt,i){if(dt["pos"]==ic){return "0.2em"}else{return "-4em"}})
				.style("width",function(dt,i){if(dt["pos"]==ic){return "15em"}else{return "10em"}})
				d3.select(this).selectAll(".cardcontrol").style("visibility","visible")

				})
			.on("mouseout",function(d){
				//ic = deck.map(function(d){return d["name"]}).indexOf(d["name"])
				d3.selectAll(".deck").transition(200).style("left",function(dt,i){return i*wstep+"em"}).style("bottom","-4em").style("width","10em")
				d3.select(this).selectAll(".cardcontrol").style("visibility","hidden")
			})
			dda.append("img")
			.attr("src",function(d){return "hearthstone-card-images-master/rel/"+(Math.round(d["dbfId"]))+".png"})
			.style("width","100%")
			.on("click",function(d){
				function transform() {
				  return d3.zoomIdentity.translate(2000/2, 2000/2).scale(12).translate(-d.x, -d.y);
				}

				function transformcenter() {
				  return d3.zoomIdentity.translate(2000/2, 2000/2).scale(0.7).translate(-1000, -1000);
				}
				//that.model.get("zoomF").transform(d3.select("svg").transition().duration(1500), transform);
				d3.select("svg").transition().duration(1500).call(that.model.get("zoomF").transform, transformcenter).transition().duration(1500).delay(500).call(that.model.get("zoomF").transform, transform);
			})


			//centrer la vue init de la map sur le centre de gravité du deck (prise en cmpte de l'extend du deck ?)

			dda.append("img")
			.attr("class","ndcard")
			.attr("src",function(d){if(d["count"]==2){return "hearthstone-card-images-master/rel/"+(Math.round(d["dbfId"]))+".png"}})
			.style("width","100%")
			.style("pointer-events","none")
			.style("position","absolute")
			.style("left","0.5em")




			ctrl = dda.append("div")
			.attr("class","cardcontrol")
			.style("visibility","hidden")
			ctrl.append("span").attr("class","cardcounter").text(function(d){return d["count"]})

			ctrl.append("i")
			.attr("class","fa fa-minus")
			.on("click",function(d){
				dc = that.model.get("deckobj").map(function(c){return _.clone(c)})
				dc.forEach(function(c){if(c["dbfId"]==d["dbfId"]){c["count"]=Math.max(c["count"]-1,0)}})
				dc=dc.filter(function(c){return c["count"]>0})
				that.model.set("deckobj",_.clone(dc))
			})


			ctrl.append("i")
			.attr("class","fa fa-plus")
			.on("click",function(d){
				dc = that.model.get("deckobj").map(function(c){return _.clone(c)})
				dc.forEach(function(c){if(c["dbfId"]==d["dbfId"]){c["count"]=Math.min(c["count"]+1,2)}})
				dc=dc.filter(function(c){return c["count"]>0})
				that.model.set("deckobj",_.clone(dc))
			})






			dd.exit().remove()
			deckmap = d3.nest().key(function(c){return c["dbfId"]}).rollup(function(c){return c[0]}).map(deckclean)


			d3.selectAll(".ndcard")
			.attr("src",function(d){if(deckmap["$"+d["dbfId"]]["count"]==2){return "hearthstone-card-images-master/rel/"+(Math.round(d["dbfId"]))+".png"}})

			d3.selectAll(".cardcounter")
			.text(function(d){return deckmap["$"+d["dbfId"]]["count"]})

			dda.transition(2000).style("bottom","-4em")
			if(dd.enter().size()>0 | dd.exit().size()>0){
				dd.transition(2000).style("left",function(d,i){return i*wstep+"em"})
			}
		}
	}

})

var SelView = Backbone.View.extend({
	events : {"change":"updatemodel"},
	initialize: function(){

		// render view when model changes
		this.model.on("change:settings", this.render,this);

		var that = this;
		this.close = function(){
			return function(){

				that.model.set("settings", "closed")
			}
		}
		this.open = function(){
			return function(){
				that.model.set("settings", "open")
			}
		}

		$("#sel-close").on("click",this.close())
		$("#sel-button").on("click",this.open())


		this.updatemodel()
		this.render()
	},
	render: function(){

		if(this.model.get("settings")=="open"){
			
			this.$("#sel-content").css("display","block")
			this.$("#sel-button").css("display","none")
		}else{
			this.$("#sel-content").css("display","none")
			this.$("#sel-button").css("display","block")

		}
	},
	updatemodel : function(){
		var choicesrace = [];
		d3.selectAll(".check-races").each(function(d){
		  cb = d3.select(this);
		  if(cb.property("checked")){
		    choicesrace.push(cb.property("value"));
		  }
		});

		var choicestype = [];
		d3.selectAll(".check-types").each(function(d){
		  cb = d3.select(this);
		  if(cb.property("checked")){
		    choicestype.push(cb.property("value"));
		  }
		});

		var choicesrarity = [""];
		d3.selectAll(".check-rarity").each(function(d){
		  cb = d3.select(this);
		  if(cb.property("checked")){
		    choicesrarity.push(cb.property("value"));
		  }
		});

		var choicescost = [""];
		d3.selectAll(".check-cost").each(function(d){
		  cb = d3.select(this);
		  if(cb.property("checked")){
		    choicescost.push(+cb.property("value"))
		  }
		});

		var filters = {"race":choicesrace,'type':choicestype,'rarity':choicesrarity,'cost':choicescost}

		this.model.set("filters", filters)


 	}
});










var MapView = Backbone.View.extend({

	palette : {'DREAM' :"#377f30"  , 'DRUID' : "#583821", 'HUNTER':"#355e33", 'MAGE':"#606891", 'NEUTRAL':"#777", 'PALADIN':"#cb8e38", 'PRIEST':"#91959a", 'ROGUE':"#393c42", 'SHAMAN':'#313863', 'WARLOCK':"#633c6b", 'WARRIOR':'#b64237',"DEATHKNIGHT":"#61c0ce"},


	r: function(d){
		return 2*Math.sqrt(+d["cost"])
	},

	formatinfos: function(d){
		html = "<h4>Card statistics :</h4><ul>"
		html += "<li> Winrate: "+Math.round(d["winrates"]*100) +"%"
		html += "<li> Frequency: "+Math.round(d["w"]/198118*1000) +"‰"
		html += "</ul>"
		return html
	},


	mover : function(d,that,map){
		//d3.select("#img").selectAll("img").remove()
    d3.select("#img").select("img").data([Math.round(d["dbfId"])]).enter().append("img").attr("class","currentcard")
		.attr("src","hearthstone-card-images-master/rel/"+(Math.round(d["dbfId"]))+".png")

		d3.select("#img").select("img")
		.attr("src","hearthstone-card-images-master/rel/"+(Math.round(d["dbfId"]))+".png").attr("class","currentcard")

    var thg = d3.select("#gn_"+(Math.round(d["dbfId"]))).node()
    thg.parentNode.appendChild(thg)

		d3.select("#ci_"+(Math.round(d["dbfId"]))).transition(200)
		.attr("fill-opacity",1)
		.attr("stroke-width","0.6px")
		.attr("r", function(d) { return 1.5*map.r(d); })

		d3.select("#cio_"+(Math.round(d["dbfId"]))).transition(200)
		.attr("fill-opacity",function(d){return map.model.get("zoom")>5 ? 0 : 1})
		.attr("stroke-width","0.6px")
		.attr("r", function(d) { return 1.5*map.r(d); })

		d3.select("#info").html(map.formatinfos(d))

		//d3.select("#cardtitle").html(d["name"])
		//d3.select("#cardinfos").style("visibility","visible")

		},
	mout : function(d,that,map){
		//d3.select("#img").selectAll("img").remove()
    var thg = d3.select("#gn_"+(Math.round(d["dbfId"]))).node()
    if(thg.parentNode.firstChild){thg.parentNode.insertBefore(thg, thg.parentNode.firstChild )};
		d3.select("#ci_"+(Math.round(d["dbfId"]))).transition(200)
		.attr("fill-opacity",function(d){return map.ischecked(d,map.model.get("filters")) ? 1 : 0.1})
		.attr("stroke-width","0.4px")
		.attr("r", map.r)

		d3.select("#cio_"+(Math.round(d["dbfId"]))).transition(200)
		.attr("fill-opacity",1-Math.max((map.model.get("zoom")-5)/5*0.8,0))
		.attr("stroke-width","0.4px")
		.attr("r",map.r)
		//d3.select("#info").html("<h4>Card statistics :</h4><ul><li> Winrate: <li>Frequency: </ul>")
		//d3.select("#cardtitle").html("Card name")
		//d3.select("#cardinfos").style("visibility","hidden")

	},

	initialize: function(){
		this.model.on("change:map", this.render,this);
		this.model.on("change:filters", this.update,this);
		this.model.on("change:deckobj", this.updatedeck,this);
		this.model.on("change:data", this.updatedeck,this);
		this.model.on("change:maploaded", this.updatedeck,this);
		this.render();


	svg = d3.select("svg");


	this.svg=svg
	width = 2000;




	var x = d3.scaleLinear().range([0,width]).domain([-80,80])
	var y = x // d3.scaleLinear().range([width,0]).domain([-80,80])
	var colorScale = d3.scaleOrdinal(d3["schemeCategory20"])

 	var that = this;

	var small_labels = [{cardname:"King Krush",label:"Montain of the Beasts"},
	{cardname:"Nozdormu",label:"Dragon's volcano"},
	{cardname:"Naga Corsair",label:"Pirate's island"},
	{cardname:"Fearsome Doomguard",label:"Castle of the Daemons"},
	{cardname:"Seadevil Stinger",label:"Swamp of the Murlocs"},
	{cardname:"Sunwalker",label:"Taunt Valley"},
	{cardname:"Doomcaller",label:"Temple of C'Thun"},
	{cardname:"Spider Tank",label:"Mech's worksops"},
	{cardname:"Stormwatcher",label:"Elemental's headquaters"}
	]


	d3.csv("./skip_gram_tsne200kwinrates.csv",function(data){


		data.forEach(function(d){d["x"]=x(+d["t0"]);d["y"]=y(+d["t1"])})

		that.model.set("data",data)

		pmap = d3.nest().key(function(d){return d["name"]}).rollup(function(a){return [a[0]["x"],a[0]["y"]]}).map(data)
		defs = svg.append("defs")
		defs.selectAll("patterns")
			.data(data)
			.enter()
			.append("pattern")
			.attr("id",function(d){return d["dbfId"]})
			.attr("x","0%")
			.attr("y","0%")
 			.attr("height","100%")
			.attr("width","100%")
			.attr("viewBox","0 0 140 140")
			.append("image")
 			.attr("height","140")
			.attr("width","140")
			.attr("xlink:href",function(d){return "./assets/img/circle_thumbs/"+(Math.round(d["dbfId"]))+".png"})



		data.sort(function(a,b){return +b["cost"]-a["cost"]})

		classes = data.filter(function(d){return d["cardClass"]!="NEUTRAL"})

		labels = d3.nest().key(function(d){return d["cardClass"]}).rollup(function(a){
			//norm=a.map(function(t){return Math.sqrt(Math.pow(t.x,2)+Math.pow(t.y,2))})
			//im = norm.indexOf(d3.max(norm))
			//return [a[im]["x"]+5*a[im]["x"]/norm[im],a[im]["y"]+5*a[im]["y"]/norm[im]]
			return [d3.quantile(a,0.35,function(d){return d.x}),d3.quantile(a,0.5,function(d){return d.y})]
			}).entries(classes)



		var zoom = d3.zoom()
			.scaleExtent([0.7, 30])
        		.extent([[0, 0], [width, width]])
			.on("zoom", zoomed)
		that.model.set("zoomF",zoom)
		svg.append("a").attr("class","interactive_canvas").append("rect")
		    .attr("width", "200%")
		    .attr("height", "200%")
		    .style("fill", "none")
		    .style("pointer-events", "all")


    var g  = svg.append("g")
    that.g = g;
    var gh = g.append("g");
    that.gh = gh
		var gp = g.append("g");
		that.gp = gp
    var gl = g.append("g");
    that.gl = gl
    var gv = g.append("g");
    that.gv = gv
    voro = d3.voronoi().x(function(d){return d.x}).y(function(d){return d.y}).size([width,width])

    gv.selectAll("path").data(voro.polygons(data)).enter().append("path").attr("class","vpol").attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
    .on("mouseover",function(d){that.mover(d.data,this,that)})
    .on("mouseout",function(d){that.mout(d.data,this,that)})
    .on("click",function(d){updeck(d.data)})
		var gn = gp.selectAll(".gn")
		    .data(data)
		  .enter().append("g")
        .attr("id",function(d){return "gn_"+(Math.round(d["dbfId"]))})
		    .attr("class","gn")

		svg.call(zoom);
    svg.on("dblclick.zoom", null);
		updeck = function(d){
			deck = that.model.get("deckobj").filter(function(c){return c["dbfId"]!=d["dbfId"]})
			console.log("Map up deck")
			console.log(deck.map(function(c){return c["count"]+" "+c["name"]}).join("\n"))
			if(d["count"]>0){
				d["count"]=2
			}else{
				d["count"]=1
			}

			deck.push(_.clone(d))
			console.log(deck.map(function(c){return c["count"]+" "+c["name"]}).join("\n"))
			a=deck.sort(function(a,b){return (a["cost"]-b["cost"])==0 ? (a["name"]<b["name"]?-1:1) : a["cost"]-b["cost"] })
			that.model.set("deckobj",_.clone(a))
			}

		    gn.append("circle")
		    .attr("cx", function(d) { return d["x"]; })
		    .attr("cy", function(d) { return d["y"]; })
		    .attr("r", that.r)
		    .attr("class","ci")
		    .attr("id",function(d){return "ci_"+(Math.round(d["dbfId"]))})
		    .attr("fill",function(d){return "url(#"+d["dbfId"]+")"})//d3.color(that.palette[d["cardClass"]]).brighter()
		    .attr("fill-opacity",0.8)
		    .attr("stroke",function(d){return that.palette[d["cardClass"]] })
		    .attr("stroke-width","0.4px")
		    .attr("visibility","hidden")

		  .on("click",updeck)
		   gn.append("circle")
		    .attr("cx", function(d) { return d["x"]; })
		    .attr("cy", function(d) { return d["y"]; })
		    .attr("r", that.r)
		    .attr("class","cio")
		    .attr("id",function(d){return "cio_"+(Math.round(d["dbfId"]))})
		    .attr("fill",function(d){return d3.color(that.palette[d["cardClass"]]).brighter() })//d3.color(that.palette[d["cardClass"]]).brighter() "url(#"+d["dbfId"]+")"
		    .attr("fill-opacity",0.8)
		    .attr("stroke",function(d){return that.palette[d["cardClass"]] })
		    .attr("stroke-width","0.4px")


		   gl.selectAll(".biglabels")
		    .data(labels)
		    .enter()
		    .append("text")
		    .attr("class","biglabels")
		    .attr("x",function(d){return d.value[0]})
		    .attr("y",function(d){return d.value[1]})
		    .text(function(d){return d.key})
		    .attr("fill",function(d){return d3.color(that.palette[d.key]).darker()})
		    .attr("fill-opacity",1)
		small_labels.forEach(function(l){if("$"+l["cardname"] in pmap){l.x = pmap["$"+l["cardname"]][0];l.y = pmap["$"+l["cardname"]][1]}else{l.x=0;l.y=0}})


	   	gl.selectAll(".smalllabels")
		    .data(small_labels)
		    .enter()
		    .append("text")
		    .attr("class","smalllabels")
		    .attr("x",function(d){return d.x})
		    .attr("y",function(d){return d.y})
		    .text(function(d){console.log(d["label"]);return d["label"]})


		function zoomed() {
		  	g.attr("transform", d3.event.transform);
			that.model.set("zoom",d3.event.transform.k)
			filters= that.model.get("filters")

			if(d3.event.transform.k>5 & d3.event.transform.k<10 ){
				gp.selectAll(".ci").attr("visibility","visible")
				gp.selectAll(".cio").attr("visibility","visible")
				gp.selectAll(".cio").attr("fill-opacity",function(d){return that.ischecked(d,filters) ? 1-(d3.event.transform.k-5)/5*0.8 : 0.1})
				.attr("stroke-opacity",function(d){return that.ischecked(d,filters) ? 1-(d3.event.transform.k-5)/5*0.8 : 0.1})

			}
			if(d3.event.transform.k<5 ){
				gp.selectAll(".ci").attr("visibility","hidden")
				gp.selectAll(".cio").attr("visibility","visible")
				gp.selectAll(".cio").attr("fill-opacity",function(d){return that.ischecked(d,filters) ? 1 : 0.1})

			}
			if(d3.event.transform.k>10 ){
				gp.selectAll(".ci").attr("visibility","visible")
				gp.selectAll(".cio").attr("visibility","hidden")

			}
			if(d3.event.transform.k>6 ){
				gl.selectAll(".biglabels").attr("visibility","hidden")
				gl.selectAll(".smalllabels").attr("visibility","hidden")
			}else{
				gl.selectAll(".biglabels").attr("visibility","visible")
				gl.selectAll(".smalllabels").attr("visibility","visible")
			}



		}
		// calculer le centre de gravité du deck et zoomer un peu
		// changer les hallo suivant le type de deck
		function transform() {
				  return d3.zoomIdentity.translate(width/2, width/2).scale(1.1).translate(-1000, -1200);
		}
		that.model.get("zoomF").transform(d3.select("svg").transition().duration(1500), transform);
		that.mover(data[282],that,that)
		that.model.set("maploaded",true)

	});


	},

	render: function(){
		if(this.model.get("map")=="open"){
			this.$el.css("display","block")
		}else{
			this.$el.css("display","none")
		}

	},

	ischecked: function(d,filters){
			if(filters["race"].indexOf(d["race"])!=-1 && filters["type"].indexOf(d["type"])!=-1 &&
				filters["rarity"].indexOf(d["rarity"])!=-1 &&
				(filters["cost"].indexOf(+d["cost"])!=-1 || (filters["cost"].indexOf(+9)!=-1) && (+d["cost"]>9))){
				return true
			}else{
				return false
			}
		},

	update :function(){
		var filters = this.model.get("filters")
		var that = this
		mov = function(d){if(that.ischecked(d.data,filters)){ that.mover(d.data,this,that) }}
		mot = function(d){if(that.ischecked(d.data,filters)){ that.mout(d.data,this,that)  }}
		this.svg.selectAll(".vpol")
			.on("mouseover",mov)
			.on("mouseout",mot)
		this.svg.selectAll(".ci")
			.attr("fill-opacity",function(d){return that.ischecked(d,filters) ? 0.8 : 0.1})
			.attr("stroke-opacity",function(d){return that.ischecked(d,filters) ? 0.8 : 0.1})
			.style("cursor",function(d){return that.ischecked(d,filters) ? "pointer" : "default"})
			
		this.svg.selectAll(".cio")
			.attr("fill-opacity",function(d){return that.ischecked(d,filters) ? 0.8 : 0.1})
			.attr("stroke-opacity",function(d){return that.ischecked(d,filters) ? 0.8 : 0.1})
			.style("cursor",function(d){return that.ischecked(d,filters) ? "pointer" : "default"})
		/*	.on("mouseover",mov)
			.on("mouseout",mot)*/

	},

	updatedeck :function(){
		console.log("Rendering map deck")
		var deck = this.model.get("deckobj")
		console.log(deck)
		var that = this
		if(that.gh!=undefined && deck!=undefined){
		var hallo = that.gh.selectAll(".deckhallo")
			.data(deck)

		hallo.enter()
			.append("circle")
			.attr("class","deckhallo")
			.attr("cx", function(d) { return d["x"]; })
		    	.attr("cy", function(d) { return d["y"]; })
		    	.attr("r", function(d){return 2.5*that.r(d)})
			.attr("fill-opacity",0)
		    	.attr("stroke",function(d){return d3.color(that.palette[d.cardClass]).darker()})
		    	.attr("stroke-width","5px")
		    	.attr("stroke-opacity",0.8)
			.attr("stroke-dasharray","3 2 1")
			.style("pointer-events","none")
		hallo.exit()
			.remove()

		hallo.attr("cx", function(d) { return d["x"]; })
		    	.attr("cy", function(d) { return d["y"]; })
		    	.attr("r", function(d){return 2.5*that.r(d)})
			.attr("stroke",function(d){return d3.color(that.palette[d.cardClass]).darker()})


		}
	}

});

var work = new Workspace();


function help(){
     var intro = introJs();
          intro.setOptions({
            steps: [
              { 
                intro: "The main map presents heartstone cards. Cards positions were determined using a neural network and 200 000 hearthstone matchs. They encode similarity of cards, cards played in similar context being closer. More infos on the process and code can be found <a href='http://www.comeetie.fr/galerie/hearthstone/#about' target='_blank'>here</a> and <a href=''>here</a>."
              },
		{
		intro:"Zoom to see cards, hover points to get detailed infos on cards, click to add the card to your deck.",
	      },
	      {
		intro:"Over a card in our deck to view details and manage its quantity in your deck. Click to zoom and center the map to the card position.",
	      },
	      {
		element:"#infos",
		intro:"When hovering a card in the map, this panel give you details on it : effects, stats,..."  
	      },
		{
		element:"#deckio",
		intro:"Here you can import/export and manage your deck with simple copy and paste."
		},
		{
		element : "#sel"  ,
		intro:"Do you want fo filters cards by cost, rarity or type open this panel."
		},
		{
		element: "#deckstats", 
		intro:"Do you want to check our deck stats this is here."
		},
		{
		element: "#twitter-button", 
		intro:"Share a deck link with twitter"
		}
	]})
  intro.start()
}
