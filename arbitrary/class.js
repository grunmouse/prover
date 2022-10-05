	// if we are initializing a new class
	var initializing = false,
        //point = '.',
		noop = function(){},
		isFunction = (fun)=>(fun && fun.call),
		isArray = Array.isArray,
		extend = function(target, ...sources){
			Object.assign(target, ...sources);
		},
        toStringStr = 'toString',
        valueOfStr = 'valueOf',
        //check if toString is enumerable
        supportToString = (function(){
            var obj = {
                toString: noop
            }, name;
            for(name in obj) {
                if(obj.hasOwnProperty(name) && name === toStringStr) {
                    return true;
                }
            }
            return false;
        }()),
        //check if valueOf is enumerable
        supportValueOf = (function(){
            var obj = {
                valueOf: noop
            }, name;
            for(name in obj) {
                if(obj.hasOwnProperty(name) && name === valueOfStr) {
                    return true;
                }
            }
            return false;
        }()),
        //Copy nonenumerable methods.
        copyNonEnumerableProps = supportToString && supportValueOf ? noop :
            function(to, from) {
                if(!supportToString && from.hasOwnProperty(toStringStr)) {
                    to[toStringStr] = from[toStringStr];
                }

                if(!supportValueOf && from.hasOwnProperty(valueOfStr)) {
                    to[valueOfStr] = from[valueOfStr];
                }
            },
		// tests if we can get super in .toString()
		fnTest = /xyz/.test(function() {
			return 'xyz'; //Old one was fucked up by GCC
		}) ? /\b_super\b/ : /.*/;


	// overwrites an object with methods, sets up _super
	// newProps - new properties
	// oldProps - where the old properties might be
	// addTo - what we are adding to
	var inheritProps = function( newProps, oldProps, addTo ) {
		var wrapSuper = function( name, fn ) {
			return function() {
				var tmp = this._super,
						ret;

				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = oldProps[name];

				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				ret = fn.apply(this, arguments);
				this._super = tmp;
				return ret;
			};
		}, name;
		addTo = addTo || newProps
		for (name in newProps ) {
			// Check if we're overwriting an existing function
			addTo[name] = isFunction(newProps[name]) && 
						  isFunction(oldProps[name]) && 
						  fnTest.test(newProps[name]) ? wrapSuper(name, newProps[name]) : newProps[name];
		}

		//Take care of toString method
		if(newProps && !supportToString && newProps.hasOwnProperty(toStringStr)){
			addTo[toStringStr] = fnTest.test(newProps[toStringStr]) ? wrapSuper(toStringStr, newProps[toStringStr]) : newProps[toStringStr];
		}

		//Take care of valueOf method
		if(newProps && !supportValueOf && newProps.hasOwnProperty(valueOfStr)){
			addTo[valueOfStr] = fnTest.test(newProps[valueOfStr]) ? wrapSuper(valueOfStr, newProps[valueOfStr]) : newProps[valueOfStr];
		}
	};


	var clss = function() {
		if (arguments.length) {
			clss.extend.apply(clss, arguments);
		}
	};

	/* @Static*/
	extend(clss, {
		proxy: function( funcs ) {

			//args that should be curried
			var args = Array.from(arguments),
				self;

			funcs = args.shift();

			if (!isArray(funcs) ) {
				funcs = [funcs];
			}

			self = this;
			//!steal-remove-start
			for( var i =0; i< funcs.length;i++ ) {
				if(typeof funcs[i] == "string" && !isFunction(this[funcs[i]])){
					throw ("does not have a "+funcs[i]+"method!");
				}
			}
			//!steal-remove-end
			return function class_cb(...a) {
				var cur = args.concat(a),
					isString, 
					length = funcs.length,
					f = 0,
					func;

				for (; f < length; f++ ) {
					func = funcs[f];
					if (!func ) {
						continue;
					}

					isString = typeof func == "string";
					if ( isString && self._set_called ) {
						self.called = func;
					}
					cur = (isString ? self[func] : func).apply(self, cur || []);
					if ( f < length - 1 ) {
						cur = !isArray(cur) || cur._use_call ? [cur] : cur
					}
				}
				return cur;
			}
		},

		newInstance: function(...argumentsCopy) {
			var inst = this.rawInstance(),
				args;

			if ( inst.setup ) {
				args = inst.setup(...argumentsCopy);
			}
			
			if(!isArray(args)){
				args = argumentsCopy;
			}
			
			if ( inst.init ) {
				inst.init(...args);
			}

			return inst;
		},

		setup: function(...args) {
			return args;
		},
		rawInstance: function() {
			initializing = true;
			var inst = new this();
			initializing = false;
			return inst;
		},

		extend: function(name, klass, proto ) {
			if(typeof name !== 'string'){
				proto = klass;
				klass = name;
				name = 'AnonimousClass';
			}
			// figure out what was passed
			if (!proto ) {
				proto = klass;
				klass = undefined;
			}
			console.log(name, klass, proto);
			proto = proto || {};
			var _super_class = this,
				_super = this.prototype,
				_prototype, parts, current;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			_prototype = new this();
			initializing = false;
			// Copy the properties over onto the new prototype
			inheritProps(proto, _super, _prototype);

			// The dummy class constructor

			function Class(...args) {
				// All construction is actually done in the init method
				if ( initializing ) return;

				if ( !(this && this.constructor === Class) ) { //we are being called w/o new
					return Class.newInstance(...args)
					//return arguments.callee.extend.apply(arguments.callee, arguments)
				} else { //we are being called w/ new
					return this.Class.newInstance(...args)
				}
			}
			Object.defineProperty(Class, 'name', {value:name});
			
			
			Object.setPrototypeOf(Class, this);
			
			// Copy old stuff onto class
			/*for ( name in this ) {
				if ( this.hasOwnProperty(name) ) {
					Class[name] = this[name];
				}
			}*/
            //Take care of special props
            //copyNonEnumerableProps(Class, this);

			// copy new props on class
			inheritProps(klass, this, Class);

			// set things that can't be overwritten
			/*extend(Class, {
				prototype: _prototype,
				constructor: Class
			});*/
			Class.prototype = _prototype;

			//make sure our prototype looks nice
			Class.prototype.Class = Class.prototype.constructor = Class;


			var args = Class.setup(_super_class, name, klass, proto) || [];

			if ( Class.init ) {
				Class.init(...args);
			}

			/* @Prototype*/
			return Class;
		}

	});





	clss.prototype.proxy = clss.proxy;

module.exports = clss;