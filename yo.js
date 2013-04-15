var Yo = (function(window){
	var _W = window
		,_D = window.document
		,_N = window.navigator
		,_P = window.performance
		,_B = {
			ie : (/MSIE/g).test(_N.userAgent)
			, webkit :  (/AppleWebKit/g).test(_N.userAgent)
			, moz :  (/Mozilla/g).test(_N.userAgent) && !(/AppleWebKit/g).test(_N.userAgent)
			, version : (/^[\d\.]+\s/).exec(_N.appVersion)[0]
		}
		,_E = _D.documentElement
		, _apply = function(ctx,f,args){
			return function(){
				f.apply(ctx,args);
			}
		}
		, _extend = function(destination) {
			var i = 1,
				ln = arguments.length,
				mergeFn = _extend,
				object, key, value, sourceKey;

			for (; i < ln; i++) {
				object = arguments[i];

				for (key in object) {
					value = object[key];
					if (value && value.constructor === Object) {
						sourceKey = destination[key];
						mergeFn(sourceKey, value);
					}
					else {
						destination[key] = value;
					}
				}
			}

			return destination;
		},

		YoMediator = (function(){

			var _channels = [];

			return {
				publish: function(channel){
					if(_channels.hasOwnProperty(channel)){
						for(var i =0,j=_channels[channel].length;i<j;i++){
							var element = _channels[channel][i];
							element.callback.apply(element.context,arguments);
						}
					}
				},
				subscribe: function(context,channel,callback){
					if(!_channels.hasOwnProperty(channel)) _channels[channel] = [];
					_channels[channel].push({ context: context, callback: callback });
				}
			}
		}());

		function YoOverload(options,args){
			if(args.length > 0){
				var _args = [];
				for( var i = 0,j=args.length;i<j;i++)
					_args.push(args[i].constructor.toString().match(/function\s+(\w+)s*/)[1])

				return options[_args.toString()].apply(this,args);
			}
		}

		function YoPromises(fn,callback){
			this.init(fn,callback);
			return this;
		}

		YoPromises.prototype = function(){
			var _ready
				, _do
				, _return
				, _process = function(){
					try{
						var results = _do.call(this);
						_ready = true;
						_return(null,results);

						return this;
					} catch(e){
						_ready = true;
						_return(e,results);
						return this;
					}
				}
			return {
				ready: function(){
					return _ready;
				}
				, init: function(fn,callback){
					_ready = false;
					_do = fn;
					_return = callback;
					return _process();
				}
			}
		}();

		function getParent(object){
			var parents = "";
			if(object && object.parentNode){
				parents += getParent(object.parentNode) + " ";
				parents += object.tagName.toLowerCase() + ( object.id != "" ? "#"+object.id : "" ) + ( object.className != "" ? "."+object.className : "" );
			}
			return parents;
		}

		function cammelize(str){
			var parts = str.split("-"),
				cammel = parts.shift();
			for(var i=0,j=parts.length;i<j;i++){
				var text = parts[i];
				cammel += text.charAt(0).toUpperCase() + text.substr(1,text.length);
			}
			return cammel;
		}

		function Yobject(){
			var _constructor = {
				"String,NodeList" : function(str,query){
					this.query = str;
					this.selector = query;
				},
				"HTMLDivElement" : function(object){
					this.query = getParent(object);
					this.selector = [object];
				},
				"HTMLElement" : function(object){
					this.query = getParent(object);
					this.selector = [object];
				}
			}

			return YoOverload.call(this,_constructor,arguments);
		}

		Yobject.prototype = function(){
			return {
				getOverHere : function(){
					return this;
				}
				, bringThatMothafuckerNow: function(str){
					var queryString = this.query + " " + str
						, query = _D.querySelectorAll(queryString);

					return new Yobject(queryString,query)
				}
				, forEachDog: function(fn){
					var _this = this;
					for(var i=0,j=this.selector.length;i<j;i++){
						var selector = this.selector[i];
						fn.call(_this,i,selector);
					}
				}
				, blingBling: function(){
					var _this = this
						, options = {
							"String,String" : function(key,value){
								_this.forEachDog(function(i,obj){
									obj.style[key] = cammelize(value);
								})
							}
							, "Object" : function(o){
								for (var k in o){
									_this.forEachDog (function(i,obj){
										obj.style[cammelize(k)] = o[k];
									})
								}
							}
						}

					YoOverload.call(_this,options,arguments);

					return _this;
				}
				, firstNigga: function() {
					if(this.selector && this.selector.length>0){
						return new Yobject(this.selector[0]);
					} else {
						throw Error("Object doesnt have first.");
					}
				}
				, listenNigga: function(event,callback) {
					var _this = this;
					for(var i=0,j=this.selector.length;i<j;i++){
						var selector = this.selector[i];
						selector[("on"+event)] = function(e){
							var e = _extend(e,_this);
							callback.call(_this,e);
						};
					}
				}
				, killThatShitOff: function(event){
					for(var i=0,j=this.selector.length;i<j;i++){
						var selector = this.selector[i];
						selector[("on"+event)] = null;
					}
				}
				, shootItUpNigga: function(event,data){
					YoMediator.publish(event,data);
				}
				, writeShitDown : function(str){
					for(var i=0,j=this.selector.length;i<j;i++){
						var selector = this.selector[i];
						selector.innerHTML = str;
					}
					return this;
				}
			}
		}();

		function Yo(){
			return this;
		}

		Yo.prototype = function(){

			var _queryElements
				,_events = {}
				,_constructor = {
					"String" : function(str){
						return this.query.call(this,str);
					}
					, "HTMLElement": function(element){
						return new Yobject(element);
					}
					, "Function" : function(fn){
						YoMediator.subscribe(this,"ready",fn);
					}
				}
				, _doQuery = function(obj){
					var first = obj.shift()
						, result = _D[ first.type == "id" ? "getElementById" : first.type == "class" ? "getElementsByClassName" : "getElementsByTagName" ](first.str);
				}
				, _onload = function(e){
					YoMediator.publish("ready",e);
				}
				, _bindEvents = function(){
					_W.addEventListener("DOMContentLoaded",_onload,false);
				}
				, _query = function(str){
					var query = _D.querySelectorAll(str);
					return new Yobject(str,query);
				}
				, _init = function(){
					_bindEvents();
					_currentContext = this;
					if(arguments.length > 0){
						return YoOverload.call(_currentContext,_constructor,arguments);
					}

					return this;
				}
				, _finishWait = function(){
					return this;
				}
				, _wait = function(time,callback){
					var _this = this;
					setTimeout(function(){
						if(callback)
							callback.call(_this.getInstance());

						_finishWait();
					},time);
				}

		return {
			getInstance : function(){
				return this;
			}
			, holdYourShitNigga:_wait
			, query: _query
			, init : _init
		}
	}();

	var _core = new Yo();

	function _Yo(argument){
		return _core.init.call(_core,argument);
	}

	_extend(Yobject.prototype,Yo.prototype);

	_Yo.holdYourShitNigga = function(time,fn){
		return _core.holdYourShitNigga.call(_core,time,fn);
	}

	_Yo.bringThatMothafuckerNow = Yo.prototype.query;

	_Yo.listenNigga = function(event,callback){
		YoMediator.subscribe(_core,event,callback);
		return _core;
	}
	_Yo.shootItUpNigga = function(event,data){
		YoMediator.publish(event,data);
		return _core;
	}
	_Yo.pimpItUp = _extend;

	return _Yo;

}(window));
