(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var document = require('global/document')
var hyperx = require('hyperx')
var onload = require('on-load')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = {
  autofocus: 1,
  checked: 1,
  defaultchecked: 1,
  disabled: 1,
  formnovalidate: 1,
  indeterminate: 1,
  readonly: 1,
  required: 1,
  selected: 1,
  willvalidate: 1
}
var COMMENT_TAG = '!--'
var SVG_TAGS = [
  'svg',
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // If adding onload events
  if (props.onload || props.onunload) {
    var load = props.onload || function () {}
    var unload = props.onunload || function () {}
    onload(el, function belOnload () {
      load(el)
    }, function belOnunload () {
      unload(el)
    },
    // We have to use non-standard `caller` to find who invokes `belCreateElement`
    belCreateElement.caller.caller.caller)
    delete props.onload
    delete props.onunload
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS[key]) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  function appendChild (childs) {
    if (!Array.isArray(childs)) return
    for (var i = 0; i < childs.length; i++) {
      var node = childs[i]
      if (Array.isArray(node)) {
        appendChild(node)
        continue
      }

      if (typeof node === 'number' ||
        typeof node === 'boolean' ||
        typeof node === 'function' ||
        node instanceof Date ||
        node instanceof RegExp) {
        node = node.toString()
      }

      if (typeof node === 'string') {
        if (el.lastChild && el.lastChild.nodeName === '#text') {
          el.lastChild.nodeValue += node
          continue
        }
        node = document.createTextNode(node)
      }

      if (node && node.nodeType) {
        el.appendChild(node)
      }
    }
  }
  appendChild(children)

  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"global/document":3,"hyperx":6,"on-load":10}],2:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.2.1
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }
    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
      var parent = this;

      var child = new this.constructor(lib$es6$promise$$internal$$noop);

      if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
        lib$es6$promise$$internal$$makePromise(child);
      }

      var state = parent._state;

      if (state) {
        var callback = arguments[state - 1];
        lib$es6$promise$asap$$asap(function(){
          lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
        });
      } else {
        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }
    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
      if (maybeThenable.constructor === promise.constructor &&
          then === lib$es6$promise$then$$default &&
          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    var lib$es6$promise$$internal$$id = 0;
    function lib$es6$promise$$internal$$nextId() {
      return lib$es6$promise$$internal$$id++;
    }

    function lib$es6$promise$$internal$$makePromise(promise) {
      promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
      promise._state = undefined;
      promise._result = undefined;
      promise._subscribers = [];
    }

    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      if (!lib$es6$promise$utils$$isArray(entries)) {
        return new Constructor(function(resolve, reject) {
          reject(new TypeError('You must pass an array to race.'));
        });
      } else {
        return new Constructor(function(resolve, reject) {
          var length = entries.length;
          for (var i = 0; i < length; i++) {
            Constructor.resolve(entries[i]).then(resolve, reject);
          }
        });
      }
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;


    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
      this._result = this._state = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: lib$es6$promise$then$$default,

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
        lib$es6$promise$$internal$$makePromise(this.promise);
      }

      if (lib$es6$promise$utils$$isArray(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._result = new Array(this.length);

        if (this.length === 0) {
          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
      }
    }

    function lib$es6$promise$enumerator$$validationError() {
      return new Error('Array Methods must be provided an Array');
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var input   = this._input;

      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      var resolve = c.resolve;

      if (resolve === lib$es6$promise$promise$resolve$$default) {
        var then = lib$es6$promise$$internal$$getThen(entry);

        if (then === lib$es6$promise$then$$default &&
            entry._state !== lib$es6$promise$$internal$$PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === lib$es6$promise$promise$$default) {
          var promise = new c(lib$es6$promise$$internal$$noop);
          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
        }
      } else {
        this._willSettleAt(resolve(entry), i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        this._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          this._result[i] = value;
        }
      }

      if (this._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, this._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":33}],3:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":32}],4:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],6:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        p.push([ VAR, xstate, arg ])
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else cur[1][key] = concat(cur[1][key], parts[i][1])
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else cur[1][key] = concat(cur[1][key], parts[i][2])
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)],[CLOSE])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && /\s/.test(c)) {
          res.push([OPEN, reg])
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":5}],7:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
'use strict';

var range; // Create a range object for efficently rendering strings to elements.
var NS_XHTML = 'http://www.w3.org/1999/xhtml';

var doc = typeof document === 'undefined' ? undefined : document;

var testEl = doc ?
    doc.body || doc.createElement('div') :
    {};

// Fixes <https://github.com/patrick-steele-idem/morphdom/issues/32>
// (IE7+ support) <=IE7 does not support el.hasAttribute(name)
var actualHasAttributeNS;

if (testEl.hasAttributeNS) {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttributeNS(namespaceURI, name);
    };
} else if (testEl.hasAttribute) {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttribute(name);
    };
} else {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.getAttributeNode(namespaceURI, name) != null;
    };
}

var hasAttributeNS = actualHasAttributeNS;


function toElement(str) {
    if (!range && doc.createRange) {
        range = doc.createRange();
        range.selectNode(doc.body);
    }

    var fragment;
    if (range && range.createContextualFragment) {
        fragment = range.createContextualFragment(str);
    } else {
        fragment = doc.createElement('body');
        fragment.innerHTML = str;
    }
    return fragment.childNodes[0];
}

/**
 * Returns true if two node's names are the same.
 *
 * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
 *       nodeName and different namespace URIs.
 *
 * @param {Element} a
 * @param {Element} b The target element
 * @return {boolean}
 */
function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;

    if (fromNodeName === toNodeName) {
        return true;
    }

    if (toEl.actualize &&
        fromNodeName.charCodeAt(0) < 91 && /* from tag name is upper case */
        toNodeName.charCodeAt(0) > 90 /* target tag name is lower case */) {
        // If the target element is a virtual DOM node then we may need to normalize the tag name
        // before comparing. Normal HTML elements that are in the "http://www.w3.org/1999/xhtml"
        // are converted to upper case
        return fromNodeName === toNodeName.toUpperCase();
    } else {
        return false;
    }
}

/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {Element}
 */
function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ?
        doc.createElement(name) :
        doc.createElementNS(namespaceURI, name);
}

/**
 * Copies the children of one DOM element to another DOM element
 */
function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
        var nextChild = curChild.nextSibling;
        toEl.appendChild(curChild);
        curChild = nextChild;
    }
    return toEl;
}

function morphAttrs(fromNode, toNode) {
    var attrs = toNode.attributes;
    var i;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;

    for (i = attrs.length - 1; i >= 0; --i) {
        attr = attrs[i];
        attrName = attr.name;
        attrNamespaceURI = attr.namespaceURI;
        attrValue = attr.value;

        if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);

            if (fromValue !== attrValue) {
                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            }
        } else {
            fromValue = fromNode.getAttribute(attrName);

            if (fromValue !== attrValue) {
                fromNode.setAttribute(attrName, attrValue);
            }
        }
    }

    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    attrs = fromNode.attributes;

    for (i = attrs.length - 1; i >= 0; --i) {
        attr = attrs[i];
        if (attr.specified !== false) {
            attrName = attr.name;
            attrNamespaceURI = attr.namespaceURI;

            if (attrNamespaceURI) {
                attrName = attr.localName || attrName;

                if (!hasAttributeNS(toNode, attrNamespaceURI, attrName)) {
                    fromNode.removeAttributeNS(attrNamespaceURI, attrName);
                }
            } else {
                if (!hasAttributeNS(toNode, null, attrName)) {
                    fromNode.removeAttribute(attrName);
                }
            }
        }
    }
}

function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
        fromEl[name] = toEl[name];
        if (fromEl[name]) {
            fromEl.setAttribute(name, '');
        } else {
            fromEl.removeAttribute(name, '');
        }
    }
}

var specialElHandlers = {
    /**
     * Needed for IE. Apparently IE doesn't think that "selected" is an
     * attribute when reading over the attributes using selectEl.attributes
     */
    OPTION: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'selected');
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'checked');
        syncBooleanAttrProp(fromEl, toEl, 'disabled');

        if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!hasAttributeNS(toEl, null, 'value')) {
            fromEl.removeAttribute('value');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value !== newValue) {
            fromEl.value = newValue;
        }

        var firstChild = fromEl.firstChild;
        if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;

            if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder)) {
                return;
            }

            firstChild.nodeValue = newValue;
        }
    },
    SELECT: function(fromEl, toEl) {
        if (!hasAttributeNS(toEl, null, 'multiple')) {
            var selectedIndex = -1;
            var i = 0;
            var curChild = toEl.firstChild;
            while(curChild) {
                var nodeName = curChild.nodeName;
                if (nodeName && nodeName.toUpperCase() === 'OPTION') {
                    if (hasAttributeNS(curChild, null, 'selected')) {
                        selectedIndex = i;
                        break;
                    }
                    i++;
                }
                curChild = curChild.nextSibling;
            }

            fromEl.selectedIndex = i;
        }
    }
};

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

function noop() {}

function defaultGetNodeKey(node) {
    return node.id;
}

function morphdomFactory(morphAttrs) {

    return function morphdom(fromNode, toNode, options) {
        if (!options) {
            options = {};
        }

        if (typeof toNode === 'string') {
            if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
                var toNodeHtml = toNode;
                toNode = doc.createElement('html');
                toNode.innerHTML = toNodeHtml;
            } else {
                toNode = toElement(toNode);
            }
        }

        var getNodeKey = options.getNodeKey || defaultGetNodeKey;
        var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
        var onNodeAdded = options.onNodeAdded || noop;
        var onBeforeElUpdated = options.onBeforeElUpdated || noop;
        var onElUpdated = options.onElUpdated || noop;
        var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
        var onNodeDiscarded = options.onNodeDiscarded || noop;
        var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
        var childrenOnly = options.childrenOnly === true;

        // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
        var fromNodesLookup = {};
        var keyedRemovalList;

        function addKeyedRemoval(key) {
            if (keyedRemovalList) {
                keyedRemovalList.push(key);
            } else {
                keyedRemovalList = [key];
            }
        }

        function walkDiscardedChildNodes(node, skipKeyedNodes) {
            if (node.nodeType === ELEMENT_NODE) {
                var curChild = node.firstChild;
                while (curChild) {

                    var key = undefined;

                    if (skipKeyedNodes && (key = getNodeKey(curChild))) {
                        // If we are skipping keyed nodes then we add the key
                        // to a list so that it can be handled at the very end.
                        addKeyedRemoval(key);
                    } else {
                        // Only report the node as discarded if it is not keyed. We do this because
                        // at the end we loop through all keyed elements that were unmatched
                        // and then discard them in one final pass.
                        onNodeDiscarded(curChild);
                        if (curChild.firstChild) {
                            walkDiscardedChildNodes(curChild, skipKeyedNodes);
                        }
                    }

                    curChild = curChild.nextSibling;
                }
            }
        }

        /**
         * Removes a DOM node out of the original DOM
         *
         * @param  {Node} node The node to remove
         * @param  {Node} parentNode The nodes parent
         * @param  {Boolean} skipKeyedNodes If true then elements with keys will be skipped and not discarded.
         * @return {undefined}
         */
        function removeNode(node, parentNode, skipKeyedNodes) {
            if (onBeforeNodeDiscarded(node) === false) {
                return;
            }

            if (parentNode) {
                parentNode.removeChild(node);
            }

            onNodeDiscarded(node);
            walkDiscardedChildNodes(node, skipKeyedNodes);
        }

        // // TreeWalker implementation is no faster, but keeping this around in case this changes in the future
        // function indexTree(root) {
        //     var treeWalker = document.createTreeWalker(
        //         root,
        //         NodeFilter.SHOW_ELEMENT);
        //
        //     var el;
        //     while((el = treeWalker.nextNode())) {
        //         var key = getNodeKey(el);
        //         if (key) {
        //             fromNodesLookup[key] = el;
        //         }
        //     }
        // }

        // // NodeIterator implementation is no faster, but keeping this around in case this changes in the future
        //
        // function indexTree(node) {
        //     var nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
        //     var el;
        //     while((el = nodeIterator.nextNode())) {
        //         var key = getNodeKey(el);
        //         if (key) {
        //             fromNodesLookup[key] = el;
        //         }
        //     }
        // }

        function indexTree(node) {
            if (node.nodeType === ELEMENT_NODE) {
                var curChild = node.firstChild;
                while (curChild) {
                    var key = getNodeKey(curChild);
                    if (key) {
                        fromNodesLookup[key] = curChild;
                    }

                    // Walk recursively
                    indexTree(curChild);

                    curChild = curChild.nextSibling;
                }
            }
        }

        indexTree(fromNode);

        function handleNodeAdded(el) {
            onNodeAdded(el);

            var curChild = el.firstChild;
            while (curChild) {
                var nextSibling = curChild.nextSibling;

                var key = getNodeKey(curChild);
                if (key) {
                    var unmatchedFromEl = fromNodesLookup[key];
                    if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
                        curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
                        morphEl(unmatchedFromEl, curChild);
                    }
                }

                handleNodeAdded(curChild);
                curChild = nextSibling;
            }
        }

        function morphEl(fromEl, toEl, childrenOnly) {
            var toElKey = getNodeKey(toEl);
            var curFromNodeKey;

            if (toElKey) {
                // If an element with an ID is being morphed then it is will be in the final
                // DOM so clear it out of the saved elements collection
                delete fromNodesLookup[toElKey];
            }

            if (toNode.isSameNode && toNode.isSameNode(fromNode)) {
                return;
            }

            if (!childrenOnly) {
                if (onBeforeElUpdated(fromEl, toEl) === false) {
                    return;
                }

                morphAttrs(fromEl, toEl);
                onElUpdated(fromEl);

                if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
                    return;
                }
            }

            if (fromEl.nodeName !== 'TEXTAREA') {
                var curToNodeChild = toEl.firstChild;
                var curFromNodeChild = fromEl.firstChild;
                var curToNodeKey;

                var fromNextSibling;
                var toNextSibling;
                var matchingFromEl;

                outer: while (curToNodeChild) {
                    toNextSibling = curToNodeChild.nextSibling;
                    curToNodeKey = getNodeKey(curToNodeChild);

                    while (curFromNodeChild) {
                        fromNextSibling = curFromNodeChild.nextSibling;

                        if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }

                        curFromNodeKey = getNodeKey(curFromNodeChild);

                        var curFromNodeType = curFromNodeChild.nodeType;

                        var isCompatible = undefined;

                        if (curFromNodeType === curToNodeChild.nodeType) {
                            if (curFromNodeType === ELEMENT_NODE) {
                                // Both nodes being compared are Element nodes

                                if (curToNodeKey) {
                                    // The target node has a key so we want to match it up with the correct element
                                    // in the original DOM tree
                                    if (curToNodeKey !== curFromNodeKey) {
                                        // The current element in the original DOM tree does not have a matching key so
                                        // let's check our lookup to see if there is a matching element in the original
                                        // DOM tree
                                        if ((matchingFromEl = fromNodesLookup[curToNodeKey])) {
                                            if (curFromNodeChild.nextSibling === matchingFromEl) {
                                                // Special case for single element removals. To avoid removing the original
                                                // DOM node out of the tree (since that can break CSS transitions, etc.),
                                                // we will instead discard the current node and wait until the next
                                                // iteration to properly match up the keyed target element with its matching
                                                // element in the original tree
                                                isCompatible = false;
                                            } else {
                                                // We found a matching keyed element somewhere in the original DOM tree.
                                                // Let's moving the original DOM node into the current position and morph
                                                // it.

                                                // NOTE: We use insertBefore instead of replaceChild because we want to go through
                                                // the `removeNode()` function for the node that is being discarded so that
                                                // all lifecycle hooks are correctly invoked
                                                fromEl.insertBefore(matchingFromEl, curFromNodeChild);

                                                fromNextSibling = curFromNodeChild.nextSibling;

                                                if (curFromNodeKey) {
                                                    // Since the node is keyed it might be matched up later so we defer
                                                    // the actual removal to later
                                                    addKeyedRemoval(curFromNodeKey);
                                                } else {
                                                    // NOTE: we skip nested keyed nodes from being removed since there is
                                                    //       still a chance they will be matched up later
                                                    removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                                                }

                                                curFromNodeChild = matchingFromEl;
                                            }
                                        } else {
                                            // The nodes are not compatible since the "to" node has a key and there
                                            // is no matching keyed node in the source tree
                                            isCompatible = false;
                                        }
                                    }
                                } else if (curFromNodeKey) {
                                    // The original has a key
                                    isCompatible = false;
                                }

                                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                                if (isCompatible) {
                                    // We found compatible DOM elements so transform
                                    // the current "from" node to match the current
                                    // target DOM node.
                                    morphEl(curFromNodeChild, curToNodeChild);
                                }

                            } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                                // Both nodes being compared are Text or Comment nodes
                                isCompatible = true;
                                // Simply update nodeValue on the original node to
                                // change the text value
                                curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                            }
                        }

                        if (isCompatible) {
                            // Advance both the "to" child and the "from" child since we found a match
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }

                        // No compatible match so remove the old node from the DOM and continue trying to find a
                        // match in the original DOM. However, we only do this if the from node is not keyed
                        // since it is possible that a keyed node might match up with a node somewhere else in the
                        // target tree and we don't want to discard it just yet since it still might find a
                        // home in the final DOM tree. After everything is done we will remove any keyed nodes
                        // that didn't find a home
                        if (curFromNodeKey) {
                            // Since the node is keyed it might be matched up later so we defer
                            // the actual removal to later
                            addKeyedRemoval(curFromNodeKey);
                        } else {
                            // NOTE: we skip nested keyed nodes from being removed since there is
                            //       still a chance they will be matched up later
                            removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                        }

                        curFromNodeChild = fromNextSibling;
                    }

                    // If we got this far then we did not find a candidate match for
                    // our "to node" and we exhausted all of the children "from"
                    // nodes. Therefore, we will just append the current "to" node
                    // to the end
                    if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
                        fromEl.appendChild(matchingFromEl);
                        morphEl(matchingFromEl, curToNodeChild);
                    } else {
                        var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
                        if (onBeforeNodeAddedResult !== false) {
                            if (onBeforeNodeAddedResult) {
                                curToNodeChild = onBeforeNodeAddedResult;
                            }

                            if (curToNodeChild.actualize) {
                                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
                            }
                            fromEl.appendChild(curToNodeChild);
                            handleNodeAdded(curToNodeChild);
                        }
                    }

                    curToNodeChild = toNextSibling;
                    curFromNodeChild = fromNextSibling;
                }

                // We have processed all of the "to nodes". If curFromNodeChild is
                // non-null then we still have some from nodes left over that need
                // to be removed
                while (curFromNodeChild) {
                    fromNextSibling = curFromNodeChild.nextSibling;
                    if ((curFromNodeKey = getNodeKey(curFromNodeChild))) {
                        // Since the node is keyed it might be matched up later so we defer
                        // the actual removal to later
                        addKeyedRemoval(curFromNodeKey);
                    } else {
                        // NOTE: we skip nested keyed nodes from being removed since there is
                        //       still a chance they will be matched up later
                        removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                    }
                    curFromNodeChild = fromNextSibling;
                }
            }

            var specialElHandler = specialElHandlers[fromEl.nodeName];
            if (specialElHandler) {
                specialElHandler(fromEl, toEl);
            }
        } // END: morphEl(...)

        var morphedNode = fromNode;
        var morphedNodeType = morphedNode.nodeType;
        var toNodeType = toNode.nodeType;

        if (!childrenOnly) {
            // Handle the case where we are given two DOM nodes that are not
            // compatible (e.g. <div> --> <span> or <div> --> TEXT)
            if (morphedNodeType === ELEMENT_NODE) {
                if (toNodeType === ELEMENT_NODE) {
                    if (!compareNodeNames(fromNode, toNode)) {
                        onNodeDiscarded(fromNode);
                        morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
                    }
                } else {
                    // Going from an element node to a text node
                    morphedNode = toNode;
                }
            } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) { // Text or comment node
                if (toNodeType === morphedNodeType) {
                    morphedNode.nodeValue = toNode.nodeValue;
                    return morphedNode;
                } else {
                    // Text node to something else
                    morphedNode = toNode;
                }
            }
        }

        if (morphedNode === toNode) {
            // The "to node" was not compatible with the "from node" so we had to
            // toss out the "from node" and use the "to node"
            onNodeDiscarded(fromNode);
        } else {
            morphEl(morphedNode, toNode, childrenOnly);

            // We now need to loop over any keyed nodes that might need to be
            // removed. We only do the removal if we know that the keyed node
            // never found a match. When a keyed node is matched up we remove
            // it out of fromNodesLookup and we use fromNodesLookup to determine
            // if a keyed node has been matched up or not
            if (keyedRemovalList) {
                for (var i=0, len=keyedRemovalList.length; i<len; i++) {
                    var elToRemove = fromNodesLookup[keyedRemovalList[i]];
                    if (elToRemove) {
                        removeNode(elToRemove, elToRemove.parentNode, false);
                    }
                }
            }
        }

        if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
            if (morphedNode.actualize) {
                morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
            }
            // If we had to swap out the from node with a new node because the old
            // node was not compatible with the target node then we need to
            // replace the old DOM node in the original DOM tree. This is only
            // possible if the original DOM node was part of a DOM tree which
            // we know is the case if it has a parent node.
            fromNode.parentNode.replaceChild(morphedNode, fromNode);
        }

        return morphedNode;
    };
}

var morphdom = morphdomFactory(morphAttrs);

module.exports = morphdom;

},{}],9:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = { _fns: {} }

  /**
  * Emit an event. Optionally namespace the event. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – data variables that will be passed as arguments to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event) {
    var args = [].slice.call(arguments, 1)
    var namespaced = namespaces(event)
    if (this._fns[event]) emitAll(event, this._fns[event], args)
    if (namespaced) emitAll(event, namespaced, args)
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (typeof fn !== 'function') { throw new Error('callback required') }
    (this._fns[event] = this._fns[event] || []).push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener, 
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      for (var i = 0; i < this._fns.length; i++) {
        if (this._fns[i] !== fn) {
          keep.push(this._fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function namespaces (e) {
    var out = []
    var args = e.split(':')
    var fns = emitter._fns
    Object.keys(fns).forEach(function (key) {
      if (key === '*') out = out.concat(fns[key])
      if (args.length === 2 && args[0] === key) out = out.concat(fns[key])
    })
    return out
  }

  function emitAll (e, fns, args) {
    for (var i = 0; i < fns.length; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],10:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"global/document":3,"global/window":4}],11:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],12:[function(require,module,exports){
var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements
var defaultEvents = require('./update-events.js') // default events to be copied when dom elements update

module.exports = bel

// TODO move this + defaultEvents to a new module once we receive more feedback
module.exports.update = function (fromNode, toNode, opts) {
  if (!opts) opts = {}
  if (opts.events !== false) {
    if (!opts.onBeforeElUpdated) opts.onBeforeElUpdated = copier
  }

  return morphdom(fromNode, toNode, opts)

  // morphdom only copies attributes. we decided we also wanted to copy events
  // that can be set via attributes
  function copier (f, t) {
    // copy events:
    var events = opts.events || defaultEvents
    for (var i = 0; i < events.length; i++) {
      var ev = events[i]
      if (t[ev]) { // if new element has a whitelisted attribute
        f[ev] = t[ev] // update existing element
      } else if (f[ev]) { // if existing element has it and new one doesnt
        f[ev] = undefined // remove it from existing element
      }
    }
    var oldValue = f.value
    var newValue = t.value
    // copy values for form elements
    if ((f.nodeName === 'INPUT' && f.type !== 'file') || f.nodeName === 'SELECT') {
      if (!newValue) {
        t.value = f.value
      } else if (newValue !== oldValue) {
        f.value = newValue
      }
    } else if (f.nodeName === 'TEXTAREA') {
      if (t.getAttribute('value') === null) f.value = t.value
    }
  }
}

},{"./update-events.js":13,"bel":1,"morphdom":8}],13:[function(require,module,exports){
module.exports = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

},{}],14:[function(require,module,exports){
module.exports = function yoyoifyAppendChild (el, childs) {
  for (var i = 0; i < childs.length; i++) {
    var node = childs[i]
    if (Array.isArray(node)) {
      yoyoifyAppendChild(el, node)
      continue
    }
    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      node instanceof Date ||
      node instanceof RegExp) {
      node = node.toString()
    }
    if (typeof node === 'string') {
      if (el.lastChild && el.lastChild.nodeName === '#text') {
        el.lastChild.nodeValue += node
        continue
      }
      node = document.createTextNode(node)
    }
    if (node && node.nodeType) {
      el.appendChild(node)
    }
  }
}

},{}],15:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = require('../core/Utils');
var Translator = require('../core/Translator');
var UppySocket = require('./UppySocket');
var ee = require('namespace-emitter');
var throttle = require('lodash.throttle');
// const en_US = require('../locales/en_US')
// const deepFreeze = require('deep-freeze-strict')

/**
 * Main Uppy core
 *
 * @param {object} opts general options, like locales, to show modal or not to show
 */

var Uppy = function () {
  function Uppy(opts) {
    _classCallCheck(this, Uppy);

    // set default options
    var defaultOptions = {
      // load English as the default locale
      // locale: en_US,
      autoProceed: true,
      debug: false
    };

    // Merge default options with the ones set by user
    this.opts = _extends({}, defaultOptions, opts);

    // // Dictates in what order different plugin types are ran:
    // this.types = [ 'presetter', 'orchestrator', 'progressindicator',
    //                 'acquirer', 'modifier', 'uploader', 'presenter', 'debugger']

    // Container for different types of plugins
    this.plugins = {};

    this.translator = new Translator({ locale: this.opts.locale });
    this.i18n = this.translator.translate.bind(this.translator);
    this.getState = this.getState.bind(this);
    this.updateMeta = this.updateMeta.bind(this);
    this.initSocket = this.initSocket.bind(this);
    this.log = this.log.bind(this);
    this.addFile = this.addFile.bind(this);
    this.calculateProgress = this.calculateProgress.bind(this);

    this.bus = this.emitter = ee();
    this.on = this.bus.on.bind(this.bus);
    this.emit = this.bus.emit.bind(this.bus);

    this.preProcessors = [];
    this.uploaders = [];
    this.postProcessors = [];

    this.state = {
      files: {},
      capabilities: {
        resumableUploads: false
      },
      totalProgress: 0
    };

    // for debugging and testing
    this.updateNum = 0;
    if (this.opts.debug) {
      global.UppyState = this.state;
      global.uppyLog = '';
      global.UppyAddFile = this.addFile.bind(this);
      global._Uppy = this;
    }
  }

  /**
   * Iterate on all plugins and run `update` on them. Called each time state changes
   *
   */


  Uppy.prototype.updateAll = function updateAll(state) {
    var _this = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this.plugins[pluginType].forEach(function (plugin) {
        plugin.update(state);
      });
    });
  };

  /**
   * Updates state
   *
   * @param {newState} object
   */


  Uppy.prototype.setState = function setState(stateUpdate) {
    var newState = _extends({}, this.state, stateUpdate);
    this.emit('core:state-update', this.state, newState, stateUpdate);

    this.state = newState;
    this.updateAll(this.state);
  };

  /**
   * Returns current state
   *
   */


  Uppy.prototype.getState = function getState() {
    // use deepFreeze for debugging
    // return deepFreeze(this.state)
    return this.state;
  };

  Uppy.prototype.addPreProcessor = function addPreProcessor(fn) {
    this.preProcessors.push(fn);
  };

  Uppy.prototype.removePreProcessor = function removePreProcessor(fn) {
    var i = this.preProcessors.indexOf(fn);
    if (i !== -1) {
      this.preProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addPostProcessor = function addPostProcessor(fn) {
    this.postProcessors.push(fn);
  };

  Uppy.prototype.removePostProcessor = function removePostProcessor(fn) {
    var i = this.postProcessors.indexOf(fn);
    if (i !== -1) {
      this.postProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addUploader = function addUploader(fn) {
    this.uploaders.push(fn);
  };

  Uppy.prototype.removeUploader = function removeUploader(fn) {
    var i = this.uploaders.indexOf(fn);
    if (i !== -1) {
      this.uploaders.splice(i, 1);
    }
  };

  Uppy.prototype.updateMeta = function updateMeta(data, fileID) {
    var updatedFiles = _extends({}, this.getState().files);
    var newMeta = _extends({}, updatedFiles[fileID].meta, data);
    updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
      meta: newMeta
    });
    this.setState({ files: updatedFiles });
  };

  Uppy.prototype.addFile = function addFile(file) {
    var updatedFiles = _extends({}, this.state.files);

    var fileName = file.name || 'noname';
    var fileType = Utils.getFileType(file);
    var fileTypeGeneral = fileType[0];
    var fileTypeSpecific = fileType[1];
    var fileExtension = Utils.getFileNameAndExtension(fileName)[1];
    var isRemote = file.isRemote || false;

    var fileID = Utils.generateFileID(fileName);

    var newFile = {
      source: file.source || '',
      id: fileID,
      name: fileName,
      extension: fileExtension || '',
      meta: {
        name: fileName
      },
      type: {
        general: fileTypeGeneral,
        specific: fileTypeSpecific
      },
      data: file.data,
      progress: {
        percentage: 0,
        uploadComplete: false,
        uploadStarted: false
      },
      size: file.data.size || 'N/A',
      isRemote: isRemote,
      remote: file.remote || '',
      preview: file.preview
    };

    updatedFiles[fileID] = newFile;
    this.setState({ files: updatedFiles });

    this.bus.emit('file-added', fileID);
    this.log('Added file: ' + fileName + ', ' + fileID + ', mime type: ' + fileType);

    if (fileTypeGeneral === 'image' && !isRemote) {
      this.addThumbnail(newFile.id);
    }

    if (this.opts.autoProceed) {
      this.upload().catch(function (err) {
        console.error(err.stack || err.message);
      });
      // this.bus.emit('core:upload')
    }
  };

  Uppy.prototype.removeFile = function removeFile(fileID) {
    var updatedFiles = _extends({}, this.getState().files);
    delete updatedFiles[fileID];
    this.setState({ files: updatedFiles });
    this.calculateTotalProgress();
    this.log('Removed file: ' + fileID);
  };

  Uppy.prototype.addThumbnail = function addThumbnail(fileID) {
    var _this2 = this;

    var file = this.getState().files[fileID];

    // const thumbnail = URL.createObjectURL(file.data)
    // const updatedFiles = Object.assign({}, this.getState().files)
    // const updatedFile = Object.assign({}, updatedFiles[fileID], {
    //   preview: thumbnail
    // })
    // updatedFiles[fileID] = updatedFile
    // this.setState({files: updatedFiles})

    Utils.readFile(file.data).then(function (imgDataURI) {
      return Utils.createImageThumbnail(imgDataURI, 200);
    }).then(function (thumbnail) {
      var updatedFiles = _extends({}, _this2.getState().files);
      var updatedFile = _extends({}, updatedFiles[fileID], {
        preview: thumbnail
      });
      updatedFiles[fileID] = updatedFile;
      _this2.setState({ files: updatedFiles });
    });
  };

  Uppy.prototype.calculateProgress = function calculateProgress(data) {
    var fileID = data.id;
    var updatedFiles = _extends({}, this.getState().files);

    // skip progress event for a file that’s been removed
    if (!updatedFiles[fileID]) {
      this.log('Trying to set progress for a file that’s not with us anymore: ', fileID);
      return;
    }

    var updatedFile = _extends({}, updatedFiles[fileID], _extends({}, {
      progress: _extends({}, updatedFiles[fileID].progress, {
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: Math.floor((data.bytesUploaded / data.bytesTotal * 100).toFixed(2))
      })
    }));
    updatedFiles[data.id] = updatedFile;

    this.setState({
      files: updatedFiles
    });

    this.calculateTotalProgress();
  };

  Uppy.prototype.calculateTotalProgress = function calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    var files = _extends({}, this.getState().files);

    var inProgress = Object.keys(files).filter(function (file) {
      return files[file].progress.uploadStarted;
    });
    var progressMax = inProgress.length * 100;
    var progressAll = 0;
    inProgress.forEach(function (file) {
      progressAll = progressAll + files[file].progress.percentage;
    });

    var totalProgress = Math.floor((progressAll * 100 / progressMax).toFixed(2));

    this.setState({
      totalProgress: totalProgress
    });

    // if (totalProgress === 100) {
    //   const completeFiles = Object.keys(updatedFiles).filter((file) => {
    //     // this should be `uploadComplete`
    //     return updatedFiles[file].progress.percentage === 100
    //   })
    //   this.emit('core:success', completeFiles.length)
    // }
  };

  /**
   * Registers listeners for all global actions, like:
   * `file-add`, `file-remove`, `upload-progress`, `reset`
   *
   */


  Uppy.prototype.actions = function actions() {
    var _this3 = this;

    // this.bus.on('*', (payload) => {
    //   console.log('emitted: ', this.event)
    //   console.log('with payload: ', payload)
    // })

    // stress-test re-rendering
    // setInterval(() => {
    //   this.setState({bla: 'bla'})
    // }, 20)

    this.on('core:file-add', function (data) {
      _this3.addFile(data);
    });

    // `remove-file` removes a file from `state.files`, for example when
    // a user decides not to upload particular file and clicks a button to remove it
    this.on('core:file-remove', function (fileID) {
      _this3.removeFile(fileID);
    });

    this.on('core:cancel-all', function () {
      var files = _this3.getState().files;
      Object.keys(files).forEach(function (file) {
        _this3.removeFile(files[file].id);
      });
    });

    this.on('core:upload-started', function (fileID, upload) {
      var updatedFiles = _extends({}, _this3.getState().files);
      var updatedFile = _extends({}, updatedFiles[fileID], _extends({}, {
        progress: _extends({}, updatedFiles[fileID].progress, {
          uploadStarted: Date.now()
        })
      }));
      updatedFiles[fileID] = updatedFile;

      _this3.setState({ files: updatedFiles });
    });

    // upload progress events can occur frequently, especially when you have a good
    // connection to the remote server. Therefore, we are throtteling them to
    // prevent accessive function calls.
    // see also: https://github.com/tus/tus-js-client/commit/9940f27b2361fd7e10ba58b09b60d82422183bbb
    var throttledCalculateProgress = throttle(this.calculateProgress, 100, { leading: true, trailing: false });

    this.on('core:upload-progress', function (data) {
      // this.calculateProgress(data)
      throttledCalculateProgress(data);
    });

    this.on('core:upload-success', function (fileID, uploadResp, uploadURL) {
      var updatedFiles = _extends({}, _this3.getState().files);
      var updatedFile = _extends({}, updatedFiles[fileID], {
        progress: _extends({}, updatedFiles[fileID].progress, {
          uploadComplete: true,
          // good or bad idea? setting the percentage to 100 if upload is successful,
          // so that if we lost some progress events on the way, its still marked “compete”?
          percentage: 100
        }),
        uploadURL: uploadURL
      });
      updatedFiles[fileID] = updatedFile;

      _this3.setState({
        files: updatedFiles
      });

      _this3.calculateTotalProgress();

      if (_this3.getState().totalProgress === 100) {
        var completeFiles = Object.keys(updatedFiles).filter(function (file) {
          return updatedFiles[file].progress.uploadComplete;
        });
        _this3.emit('core:upload-complete', completeFiles.length);
      }
    });

    this.on('core:update-meta', function (data, fileID) {
      _this3.updateMeta(data, fileID);
    });

    // show informer if offline
    if (typeof window !== 'undefined') {
      window.addEventListener('online', function () {
        return _this3.isOnline(true);
      });
      window.addEventListener('offline', function () {
        return _this3.isOnline(false);
      });
      setTimeout(function () {
        return _this3.isOnline();
      }, 3000);
    }
  };

  Uppy.prototype.isOnline = function isOnline(status) {
    var online = status || window.navigator.onLine;
    if (!online) {
      this.emit('is-offline');
      this.emit('informer', 'No internet connection', 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');
      if (this.wasOffline) {
        this.emit('informer', 'Connected', 'success', 3000);
        this.wasOffline = false;
      }
    }
  };

  /**
   * Registers a plugin with Core
   *
   * @param {Class} Plugin object
   * @param {Object} options object that will be passed to Plugin later
   * @return {Object} self for chaining
   */


  Uppy.prototype.use = function use(Plugin, opts) {
    // Instantiate
    var plugin = new Plugin(this, opts);
    var pluginName = plugin.id;
    this.plugins[plugin.type] = this.plugins[plugin.type] || [];

    if (!pluginName) {
      throw new Error('Your plugin must have a name');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    var existsPluginAlready = this.getPlugin(pluginName);
    if (existsPluginAlready) {
      var msg = 'Already found a plugin named \'' + existsPluginAlready.name + '\'.\n        Tried to use: \'' + pluginName + '\'.\n        Uppy is currently limited to running one of every plugin.\n        Share your use case with us over at\n        https://github.com/transloadit/uppy/issues/\n        if you want us to reconsider.';
      throw new Error(msg);
    }

    this.plugins[plugin.type].push(plugin);
    plugin.install();

    return this;
  };

  /**
   * Find one Plugin by name
   *
   * @param string name description
   */


  Uppy.prototype.getPlugin = function getPlugin(name) {
    var foundPlugin = false;
    this.iteratePlugins(function (plugin) {
      var pluginName = plugin.id;
      if (pluginName === name) {
        foundPlugin = plugin;
        return false;
      }
    });
    return foundPlugin;
  };

  /**
   * Iterate through all `use`d plugins
   *
   * @param function method description
   */


  Uppy.prototype.iteratePlugins = function iteratePlugins(method) {
    var _this4 = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this4.plugins[pluginType].forEach(method);
    });
  };

  /**
   * Logs stuff to console, only if `debug` is set to true. Silent in production.
   *
   * @return {String|Object} to log
   */


  Uppy.prototype.log = function log(msg, type) {
    if (!this.opts.debug) {
      return;
    }
    if (msg === '' + msg) {
      console.log('LOG: ' + msg);
    } else {
      console.dir(msg);
    }

    if (type === 'error') {
      console.error('LOG: ' + msg);
    }

    global.uppyLog = global.uppyLog + '\n' + 'DEBUG LOG: ' + msg;
  };

  Uppy.prototype.initSocket = function initSocket(opts) {
    if (!this.socket) {
      this.socket = new UppySocket(opts);
    }

    return this.socket;
  };

  // installAll () {
  //   Object.keys(this.plugins).forEach((pluginType) => {
  //     this.plugins[pluginType].forEach((plugin) => {
  //       plugin.install(this)
  //     })
  //   })
  // }

  /**
   * Initializes actions, installs all plugins (by iterating on them and calling `install`), sets options
   *
   */


  Uppy.prototype.run = function run() {
    this.log('Core is run, initializing actions...');

    this.actions();

    // Forse set `autoProceed` option to false if there are multiple selector Plugins active
    // if (this.plugins.acquirer && this.plugins.acquirer.length > 1) {
    //   this.opts.autoProceed = false
    // }

    // Install all plugins
    // this.installAll()

    return;
  };

  Uppy.prototype.upload = function upload() {
    var _this5 = this;

    var promise = Promise.resolve();

    this.emit('core:upload');[].concat(this.preProcessors, this.uploaders, this.postProcessors).forEach(function (fn) {
      promise = promise.then(function () {
        return fn();
      });
    });

    // Not returning the `catch`ed promise, because we still want to return a rejected
    // promise from this method if the upload failed.
    promise.catch(function (err) {
      _this5.emit('core:error', err);
    });

    return promise.then(function () {
      _this5.emit('core:success');
    });
  };

  return Uppy;
}();

module.exports = function (opts) {
  if (!(this instanceof Uppy)) {
    return new Uppy(opts);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../core/Translator":16,"../core/Utils":18,"./UppySocket":17,"lodash.throttle":7,"namespace-emitter":9}],16:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 *
 * @param {object} opts
 */
module.exports = function () {
  function Translator(opts) {
    _classCallCheck(this, Translator);

    var defaultOptions = {
      locale: {
        strings: {},
        pluralize: function pluralize(n) {
          if (n === 1) {
            return 0;
          }
          return 1;
        }
      }
    };

    this.opts = _extends({}, defaultOptions, opts);
    this.locale = _extends({}, defaultOptions.locale, opts.locale);

    // console.log(this.opts.locale)

    // this.locale.pluralize = this.locale ? this.locale.pluralize : defaultPluralize
    // this.locale.strings = Object.assign({}, en_US.strings, this.opts.locale.strings)
  }

  /**
   * Takes a string with placeholder variables like `%{smart_count} file selected`
   * and replaces it with values from options `{smart_count: 5}`
   *
   * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
   * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
   *
   * @param {string} phrase that needs interpolation, with placeholders
   * @param {object} options with values that will be used to replace placeholders
   * @return {string} interpolated
   */


  Translator.prototype.interpolate = function interpolate(phrase, options) {
    var replace = String.prototype.replace;
    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$$$';

    for (var arg in options) {
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];
        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        }
        // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.
        phrase = replace.call(phrase, new RegExp('%\\{' + arg + '\\}', 'g'), replacement);
      }
    }
    return phrase;
  };

  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @return {string} translated (and interpolated)
   */


  Translator.prototype.translate = function translate(key, options) {
    if (options && options.smart_count) {
      var plural = this.locale.pluralize(options.smart_count);
      return this.interpolate(this.opts.locale.strings[key][plural], options);
    }

    return this.interpolate(this.opts.locale.strings[key], options);
  };

  return Translator;
}();

},{}],17:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ee = require('namespace-emitter');

module.exports = function () {
  function UppySocket(opts) {
    var _this = this;

    _classCallCheck(this, UppySocket);

    this.queued = [];
    this.isOpen = false;
    this.socket = new WebSocket(opts.target);
    this.emitter = ee();

    this.socket.onopen = function (e) {
      _this.isOpen = true;

      while (_this.queued.length > 0 && _this.isOpen) {
        var first = _this.queued[0];
        _this.send(first.action, first.payload);
        _this.queued = _this.queued.slice(1);
      }
    };

    this.socket.onclose = function (e) {
      _this.isOpen = false;
    };

    this._handleMessage = this._handleMessage.bind(this);

    this.socket.onmessage = this._handleMessage;

    this.close = this.close.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.send = this.send.bind(this);
  }

  UppySocket.prototype.close = function close() {
    return this.socket.close();
  };

  UppySocket.prototype.send = function send(action, payload) {
    // attach uuid

    if (!this.isOpen) {
      this.queued.push({ action: action, payload: payload });
      return;
    }

    this.socket.send(JSON.stringify({
      action: action,
      payload: payload
    }));
  };

  UppySocket.prototype.on = function on(action, handler) {
    console.log(action);
    this.emitter.on(action, handler);
  };

  UppySocket.prototype.emit = function emit(action, payload) {
    console.log(action);
    this.emitter.emit(action, payload);
  };

  UppySocket.prototype.once = function once(action, handler) {
    this.emitter.once(action, handler);
  };

  UppySocket.prototype._handleMessage = function _handleMessage(e) {
    try {
      var message = JSON.parse(e.data);
      console.log(message);
      this.emit(message.action, message.payload);
    } catch (err) {
      console.log(err);
    }
  };

  return UppySocket;
}();

},{"namespace-emitter":9}],18:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

// import mime from 'mime-types'
// import pica from 'pica'

/**
 * A collection of small utility functions that help with dom manipulation, adding listeners,
 * promises and other good things.
 *
 * @module Utils
 */

/**
 * Shallow flatten nested arrays.
 */
function flatten(arr) {
  return [].concat.apply([], arr);
}

function isTouchDevice() {
  return 'ontouchstart' in window || // works on most browsers
  navigator.maxTouchPoints; // works on IE10/11 and Surface
}

// /**
//  * Shorter and fast way to select a single node in the DOM
//  * @param   { String } selector - unique dom selector
//  * @param   { Object } ctx - DOM node where the target of our search will is located
//  * @returns { Object } dom node found
//  */
// function $ (selector, ctx) {
//   return (ctx || document).querySelector(selector)
// }

// /**
//  * Shorter and fast way to select multiple nodes in the DOM
//  * @param   { String|Array } selector - DOM selector or nodes list
//  * @param   { Object } ctx - DOM node where the targets of our search will is located
//  * @returns { Object } dom nodes found
//  */
// function $$ (selector, ctx) {
//   var els
//   if (typeof selector === 'string') {
//     els = (ctx || document).querySelectorAll(selector)
//   } else {
//     els = selector
//     return Array.prototype.slice.call(els)
//   }
// }

function truncateString(str, length) {
  if (str.length > length) {
    return str.substr(0, length / 2) + '...' + str.substr(str.length - length / 4, str.length);
  }
  return str;

  // more precise version if needed
  // http://stackoverflow.com/a/831583
}

function secondsToTime(rawSeconds) {
  var hours = Math.floor(rawSeconds / 3600) % 24;
  var minutes = Math.floor(rawSeconds / 60) % 60;
  var seconds = Math.floor(rawSeconds % 60);

  return { hours: hours, minutes: minutes, seconds: seconds };
}

/**
 * Partition array by a grouping function.
 * @param  {[type]} array      Input array
 * @param  {[type]} groupingFn Grouping function
 * @return {[type]}            Array of arrays
 */
function groupBy(array, groupingFn) {
  return array.reduce(function (result, item) {
    var key = groupingFn(item);
    var xs = result.get(key) || [];
    xs.push(item);
    result.set(key, xs);
    return result;
  }, new Map());
}

/**
 * Tests if every array element passes predicate
 * @param  {Array}  array       Input array
 * @param  {Object} predicateFn Predicate
 * @return {bool}               Every element pass
 */
function every(array, predicateFn) {
  return array.reduce(function (result, item) {
    if (!result) {
      return false;
    }

    return predicateFn(item);
  }, true);
}

/**
 * Converts list into array
*/
function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

/**
 * Takes a fileName and turns it into fileID, by converting to lowercase,
 * removing extra characters and adding unix timestamp
 *
 * @param {String} fileName
 *
 */
function generateFileID(fileName) {
  var fileID = fileName.toLowerCase();
  fileID = fileID.replace(/[^A-Z0-9]/ig, '');
  fileID = fileID + Date.now();
  return fileID;
}

function extend() {
  for (var _len = arguments.length, objs = Array(_len), _key = 0; _key < _len; _key++) {
    objs[_key] = arguments[_key];
  }

  return Object.assign.apply(this, [{}].concat(objs));
}

/**
 * Takes function or class, returns its name.
 * Because IE doesn’t support `constructor.name`.
 * https://gist.github.com/dfkaye/6384439, http://stackoverflow.com/a/15714445
 *
 * @param {Object} fn — function
 *
 */
// function getFnName (fn) {
//   var f = typeof fn === 'function'
//   var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/))
//   return (!f && 'not a function') || (s && s[1] || 'anonymous')
// }

function getProportionalImageHeight(img, newWidth) {
  var aspect = img.width / img.height;
  var newHeight = Math.round(newWidth / aspect);
  return newHeight;
}

function getFileType(file) {
  return file.type ? file.type.split('/') : ['', ''];
  // return mime.lookup(file.name)
}

// TODO Check which types are actually supported in browsers. Chrome likes webm
// from my testing, but we may need more.
// We could use a library but they tend to contain dozens of KBs of mappings,
// most of which will go unused, so not sure if that's worth it.
var mimeToExtensions = {
  'video/ogg': 'ogv',
  'audio/ogg': 'ogg',
  'video/webm': 'webm',
  'audio/webm': 'webm',
  'video/mp4': 'mp4',
  'audio/mp3': 'mp3'
};

function getFileTypeExtension(mimeType) {
  return mimeToExtensions[mimeType] || null;
}

// returns [fileName, fileExt]
function getFileNameAndExtension(fullFileName) {
  var re = /(?:\.([^.]+))?$/;
  var fileExt = re.exec(fullFileName)[1];
  var fileName = fullFileName.replace('.' + fileExt, '');
  return [fileName, fileExt];
}

/**
 * Reads file as data URI from file object,
 * the one you get from input[type=file] or drag & drop.
 *
 * @param {Object} file object
 * @return {Promise} dataURL of the file
 *
 */
function readFile(fileObj) {
  return new _Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.addEventListener('load', function (ev) {
      return resolve(ev.target.result);
    });
    reader.readAsDataURL(fileObj);

    // function workerScript () {
    //   self.addEventListener('message', (e) => {
    //     const file = e.data.file
    //     try {
    //       const reader = new FileReaderSync()
    //       postMessage({
    //         file: reader.readAsDataURL(file)
    //       })
    //     } catch (err) {
    //       console.log(err)
    //     }
    //   })
    // }
    //
    // const worker = makeWorker(workerScript)
    // worker.postMessage({file: fileObj})
    // worker.addEventListener('message', (e) => {
    //   const fileDataURL = e.data.file
    //   console.log('FILE _ DATA _ URL')
    //   return resolve(fileDataURL)
    // })
  });
}

/**
 * Resizes an image to specified width and proportional height, using canvas
 * See https://davidwalsh.name/resize-image-canvas,
 * http://babalan.com/resizing-images-with-javascript/
 * @TODO see if we need https://github.com/stomita/ios-imagefile-megapixel for iOS
 *
 * @param {String} Data URI of the original image
 * @param {String} width of the resulting image
 * @return {String} Data URI of the resized image
 */
function createImageThumbnail(imgDataURI, newWidth) {
  return new _Promise(function (resolve, reject) {
    var img = new Image();
    img.addEventListener('load', function () {
      var newImageWidth = newWidth;
      var newImageHeight = getProportionalImageHeight(img, newImageWidth);

      // create an off-screen canvas
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      // set its dimension to target size
      canvas.width = newImageWidth;
      canvas.height = newImageHeight;

      // draw source image into the off-screen canvas:
      // ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, newImageWidth, newImageHeight);

      // pica.resizeCanvas(img, canvas, (err) => {
      //   if (err) console.log(err)
      //   const thumbnail = canvas.toDataURL('image/png')
      //   return resolve(thumbnail)
      // })

      // encode image to data-uri with base64 version of compressed image
      // canvas.toDataURL('image/jpeg', quality);  // quality = [0.0, 1.0]
      var thumbnail = canvas.toDataURL('image/png');
      return resolve(thumbnail);
    });
    img.src = imgDataURI;
  });
}

function supportsMediaRecorder() {
  return typeof MediaRecorder === 'function' && !!MediaRecorder.prototype && typeof MediaRecorder.prototype.start === 'function';
}

function dataURItoBlob(dataURI, opts, toFile) {
  // get the base64 data
  var data = dataURI.split(',')[1];

  // user may provide mime type, if not get it from data URI
  var mimeType = opts.mimeType || dataURI.split(',')[0].split(':')[1].split(';')[0];

  // default to plain/text if data URI has no mimeType
  if (mimeType == null) {
    mimeType = 'plain/text';
  }

  var binary = atob(data);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }

  // Convert to a File?
  if (toFile) {
    return new File([new Uint8Array(array)], opts.name || '', { type: mimeType });
  }

  return new Blob([new Uint8Array(array)], { type: mimeType });
}

function dataURItoFile(dataURI, opts) {
  return dataURItoBlob(dataURI, opts, true);
}

/**
 * Copies text to clipboard by creating an almost invisible textarea,
 * adding text there, then running execCommand('copy').
 * Falls back to prompt() when the easy way fails (hello, Safari!)
 * From http://stackoverflow.com/a/30810322
 *
 * @param {String} textToCopy
 * @param {String} fallbackString
 * @return {Promise}
 */
function copyToClipboard(textToCopy, fallbackString) {
  fallbackString = fallbackString || 'Copy the URL below';

  return new _Promise(function (resolve, reject) {
    var textArea = document.createElement('textarea');
    textArea.setAttribute('style', {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '2em',
      height: '2em',
      padding: 0,
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      background: 'transparent'
    });

    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();

    var magicCopyFailed = function magicCopyFailed(err) {
      document.body.removeChild(textArea);
      window.prompt(fallbackString, textToCopy);
      return reject('Oops, unable to copy displayed fallback prompt: ' + err);
    };

    try {
      var successful = document.execCommand('copy');
      if (!successful) {
        return magicCopyFailed('copy command unavailable');
      }
      document.body.removeChild(textArea);
      return resolve();
    } catch (err) {
      document.body.removeChild(textArea);
      return magicCopyFailed(err);
    }
  });
}

// function createInlineWorker (workerFunction) {
//   let code = workerFunction.toString()
//   code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'))
//
//   const blob = new Blob([code], {type: 'application/javascript'})
//   const worker = new Worker(URL.createObjectURL(blob))
//
//   return worker
// }

// function makeWorker (script) {
//   var URL = window.URL || window.webkitURL
//   var Blob = window.Blob
//   var Worker = window.Worker
//
//   if (!URL || !Blob || !Worker || !script) {
//     return null
//   }
//
//   let code = script.toString()
//   code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'))
//
//   var blob = new Blob([code])
//   var worker = new Worker(URL.createObjectURL(blob))
//   return worker
// }

function getSpeed(fileProgress) {
  if (!fileProgress.bytesUploaded) return 0;

  var timeElapsed = new Date() - fileProgress.uploadStarted;
  var uploadSpeed = fileProgress.bytesUploaded / (timeElapsed / 1000);
  return uploadSpeed;
}

function getETA(fileProgress) {
  if (!fileProgress.bytesUploaded) return 0;

  var uploadSpeed = getSpeed(fileProgress);
  var bytesRemaining = fileProgress.bytesTotal - fileProgress.bytesUploaded;
  var secondsRemaining = Math.round(bytesRemaining / uploadSpeed * 10) / 10;

  return secondsRemaining;
}

function prettyETA(seconds) {
  var time = secondsToTime(seconds);

  // Only display hours and minutes if they are greater than 0 but always
  // display minutes if hours is being displayed
  // Display a leading zero if the there is a preceding unit: 1m 05s, but 5s
  var hoursStr = time.hours ? time.hours + 'h ' : '';
  var minutesVal = time.hours ? ('0' + time.minutes).substr(-2) : time.minutes;
  var minutesStr = minutesVal ? minutesVal + 'm ' : '';
  var secondsVal = minutesVal ? ('0' + time.seconds).substr(-2) : time.seconds;
  var secondsStr = secondsVal + 's';

  return '' + hoursStr + minutesStr + secondsStr;
}

// function makeCachingFunction () {
//   let cachedEl = null
//   let lastUpdate = Date.now()
//
//   return function cacheElement (el, time) {
//     if (Date.now() - lastUpdate < time) {
//       return cachedEl
//     }
//
//     cachedEl = el
//     lastUpdate = Date.now()
//
//     return el
//   }
// }

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
function isDOMElement(obj) {
  return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.nodeType === Node.ELEMENT_NODE;
}

/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @return {Node|null}
 */
function findDOMElement(element) {
  if (typeof element === 'string') {
    return document.querySelector(element);
  }

  if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && isDOMElement(element)) {
    return element;
  }
}

module.exports = {
  generateFileID: generateFileID,
  toArray: toArray,
  every: every,
  flatten: flatten,
  groupBy: groupBy,
  // $,
  // $$,
  extend: extend,
  readFile: readFile,
  createImageThumbnail: createImageThumbnail,
  getProportionalImageHeight: getProportionalImageHeight,
  supportsMediaRecorder: supportsMediaRecorder,
  isTouchDevice: isTouchDevice,
  getFileNameAndExtension: getFileNameAndExtension,
  truncateString: truncateString,
  getFileTypeExtension: getFileTypeExtension,
  getFileType: getFileType,
  secondsToTime: secondsToTime,
  dataURItoBlob: dataURItoBlob,
  dataURItoFile: dataURItoFile,
  getSpeed: getSpeed,
  getETA: getETA,
  // makeWorker,
  // makeCachingFunction,
  copyToClipboard: copyToClipboard,
  prettyETA: prettyETA,
  findDOMElement: findDOMElement
};

},{"es6-promise":2}],19:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

module.exports = function (props) {
  var _uppyProviderAuthBtnDemo, _uppyProviderAuthTitleName, _br, _uppyProviderAuthTitle, _uppyProviderAuthBtn, _uppyProviderAuth;

  var demoLink = props.demo ? (_uppyProviderAuthBtnDemo = document.createElement('button'), _uppyProviderAuthBtnDemo.onclick = props.handleDemoAuth, _uppyProviderAuthBtnDemo.setAttribute('class', 'UppyProvider-authBtnDemo'), _uppyProviderAuthBtnDemo.textContent = 'Proceed with Demo Account', _uppyProviderAuthBtnDemo) : null;
  return _uppyProviderAuth = document.createElement('div'), _uppyProviderAuth.setAttribute('class', 'UppyProvider-auth'), _appendChild(_uppyProviderAuth, [' ', (_uppyProviderAuthTitle = document.createElement('h1'), _uppyProviderAuthTitle.setAttribute('class', 'UppyProvider-authTitle'), _appendChild(_uppyProviderAuthTitle, [' Please authenticate with ', (_uppyProviderAuthTitleName = document.createElement('span'), _uppyProviderAuthTitleName.setAttribute('class', 'UppyProvider-authTitleName'), _appendChild(_uppyProviderAuthTitleName, [props.pluginName]), _uppyProviderAuthTitleName), (_br = document.createElement('br'), _br), ' to select files ']), _uppyProviderAuthTitle), ' ', (_uppyProviderAuthBtn = document.createElement('button'), _uppyProviderAuthBtn.onclick = props.handleAuth, _uppyProviderAuthBtn.setAttribute('class', 'UppyProvider-authBtn'), _uppyProviderAuthBtn.textContent = 'Authenticate', _uppyProviderAuthBtn), ' ', demoLink, ' ']), _uppyProviderAuth;
};

},{"yo-yoify/lib/appendChild":14}],20:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

module.exports = function (props) {
  var _button, _li;

  return _li = document.createElement('li'), _appendChild(_li, [' ', (_button = document.createElement('button'), _button.onclick = props.getFolder, _appendChild(_button, [props.title]), _button), ' ']), _li;
};

},{"yo-yoify/lib/appendChild":14}],21:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

var Breadcrumb = require('./Breadcrumb');

module.exports = function (props) {
  var _uppyProviderBreadcrumbs;

  return _uppyProviderBreadcrumbs = document.createElement('ul'), _uppyProviderBreadcrumbs.setAttribute('class', 'UppyProvider-breadcrumbs'), _appendChild(_uppyProviderBreadcrumbs, [' ', props.directories.map(function (directory) {
    return Breadcrumb({
      getFolder: function getFolder() {
        return props.getFolder(directory.id);
      },
      title: directory.title
    });
  }), ' ']), _uppyProviderBreadcrumbs;
};

},{"./Breadcrumb":20,"yo-yoify/lib/appendChild":14}],22:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

var Breadcrumbs = require('./Breadcrumbs');
var Table = require('./Table');

module.exports = function (props) {
  var _browserSearch, _header, _browserUserLogout, _browserSubHeader, _browserContent, _browserBody, _browser;

  var filteredFolders = props.folders;
  var filteredFiles = props.files;

  if (props.filterInput !== '') {
    filteredFolders = props.filterItems(props.folders);
    filteredFiles = props.filterItems(props.files);
  }

  return _browser = document.createElement('div'), _browser.setAttribute('class', 'Browser'), _appendChild(_browser, [' ', (_header = document.createElement('header'), _appendChild(_header, [' ', (_browserSearch = document.createElement('input'), _browserSearch.setAttribute('type', 'text'), _browserSearch.setAttribute('placeholder', 'Search Drive'), _browserSearch.onkeyup = props.filterQuery, _browserSearch.setAttribute('value', '' + String(props.filterInput) + ''), _browserSearch.setAttribute('class', 'Browser-search'), _browserSearch), ' ']), _header), ' ', (_browserSubHeader = document.createElement('div'), _browserSubHeader.setAttribute('class', 'Browser-subHeader'), _appendChild(_browserSubHeader, [' ', Breadcrumbs({
    getFolder: props.getFolder,
    directories: props.directories
  }), ' ', (_browserUserLogout = document.createElement('button'), _browserUserLogout.onclick = props.logout, _browserUserLogout.setAttribute('class', 'Browser-userLogout'), _browserUserLogout.textContent = 'Log out', _browserUserLogout), ' ']), _browserSubHeader), ' ', (_browserBody = document.createElement('div'), _browserBody.setAttribute('class', 'Browser-body'), _appendChild(_browserBody, [' ', (_browserContent = document.createElement('main'), _browserContent.setAttribute('class', 'Browser-content'), _appendChild(_browserContent, [' ', Table({
    columns: [{
      name: 'Name',
      key: 'title'
    }],
    folders: filteredFolders,
    files: filteredFiles,
    activeRow: props.isActiveRow,
    sortByTitle: props.sortByTitle,
    sortByDate: props.sortByDate,
    handleRowClick: props.handleRowClick,
    handleFileDoubleClick: props.addFile,
    handleFolderDoubleClick: props.getNextFolder,
    getItemName: props.getItemName,
    getItemIcon: props.getItemIcon
  }), ' ']), _browserContent), ' ']), _browserBody), ' ']), _browser;
};

},{"./Breadcrumbs":21,"./Table":25,"yo-yoify/lib/appendChild":14}],23:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

module.exports = function (props) {
  var _span, _uppyProviderError;

  return _uppyProviderError = document.createElement('div'), _uppyProviderError.setAttribute('class', 'UppyProvider-error'), _appendChild(_uppyProviderError, [' ', (_span = document.createElement('span'), _appendChild(_span, [' Something went wrong. Probably our fault. ', props.error, ' ']), _span), ' ']), _uppyProviderError;
};

},{"yo-yoify/lib/appendChild":14}],24:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

module.exports = function (props) {
  var _span, _uppyProviderLoading;

  return _uppyProviderLoading = document.createElement('div'), _uppyProviderLoading.setAttribute('class', 'UppyProvider-loading'), _appendChild(_uppyProviderLoading, [' ', (_span = document.createElement('span'), _span.textContent = ' Loading ... ', _span), ' ']), _uppyProviderLoading;
};

},{"yo-yoify/lib/appendChild":14}],25:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

var Row = require('./TableRow');

module.exports = function (props) {
  var _tr, _browserTableHeader, _tbody, _browserTable;

  var headers = props.columns.map(function (column) {
    var _browserTableHeaderColumn;

    return _browserTableHeaderColumn = document.createElement('th'), _browserTableHeaderColumn.onclick = props.sortByTitle, _browserTableHeaderColumn.setAttribute('class', 'BrowserTable-headerColumn BrowserTable-column'), _appendChild(_browserTableHeaderColumn, [' ', column.name, ' ']), _browserTableHeaderColumn;
  });

  return _browserTable = document.createElement('table'), _browserTable.setAttribute('class', 'BrowserTable'), _appendChild(_browserTable, [' ', (_browserTableHeader = document.createElement('thead'), _browserTableHeader.setAttribute('class', 'BrowserTable-header'), _appendChild(_browserTableHeader, [' ', (_tr = document.createElement('tr'), _appendChild(_tr, [' ', headers, ' ']), _tr), ' ']), _browserTableHeader), ' ', (_tbody = document.createElement('tbody'), _appendChild(_tbody, [' ', props.folders.map(function (folder) {
    return Row({
      title: props.getItemName(folder),
      active: props.activeRow(folder),
      getItemIcon: function getItemIcon() {
        return props.getItemIcon(folder);
      },
      handleClick: function handleClick() {
        return props.handleRowClick(folder);
      },
      handleDoubleClick: function handleDoubleClick() {
        return props.handleFolderDoubleClick(folder);
      },
      columns: props.columns
    });
  }), ' ', props.files.map(function (file) {
    return Row({
      title: props.getItemName(file),
      active: props.activeRow(file),
      getItemIcon: function getItemIcon() {
        return props.getItemIcon(file);
      },
      handleClick: function handleClick() {
        return props.handleRowClick(file);
      },
      handleDoubleClick: function handleDoubleClick() {
        return props.handleFileDoubleClick(file);
      },
      columns: props.columns
    });
  }), ' ']), _tbody), ' ']), _browserTable;
};

},{"./TableRow":27,"yo-yoify/lib/appendChild":14}],26:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

module.exports = function (props) {
  var _browserTableRowColumn;

  return _browserTableRowColumn = document.createElement('td'), _browserTableRowColumn.setAttribute('class', 'BrowserTable-rowColumn BrowserTable-column'), _appendChild(_browserTableRowColumn, [' ', props.getItemIcon(), ' ', props.value, ' ']), _browserTableRowColumn;
};

},{"yo-yoify/lib/appendChild":14}],27:[function(require,module,exports){
'use strict';

var _appendChild = require('yo-yoify/lib/appendChild');

var Column = require('./TableColumn');

module.exports = function (props) {
  var _tr;

  var classes = props.active ? 'BrowserTable-row is-active' : 'BrowserTable-row';
  return _tr = document.createElement('tr'), _tr.onclick = props.handleClick, _tr.ondblclick = props.handleDoubleClick, _tr.setAttribute('class', '' + String(classes) + ''), _appendChild(_tr, [' ', Column({
    getItemIcon: props.getItemIcon,
    value: props.title
  }), ' ']), _tr;
};

},{"./TableColumn":26,"yo-yoify/lib/appendChild":14}],28:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthView = require('./AuthView');
var Browser = require('./Browser');
var ErrorView = require('./Error');
var LoaderView = require('./Loader');
var Utils = require('../core/Utils');

/**
 * Class to easily generate generic views for plugins
 *
 * This class expects the plugin using to have the following attributes
 *
 * stateId {String} object key of which the plugin state is stored
 *
 * This class also expects the plugin instance using it to have the following
 * accessor methods.
 * Each method takes the item whose property is to be accessed
 * as a param
 *
 * isFolder
 *    @return {Boolean} for if the item is a folder or not
 * getItemData
 *    @return {Object} that is format ready for uppy upload/download
 * getItemIcon
 *    @return {Object} html instance of the item's icon
 * getItemSubList
 *    @return {Array} sub-items in the item. e.g a folder may contain sub-items
 * getItemName
 *    @return {String} display friendly name of the item
 * getMimeType
 *    @return {String} mime type of the item
 * getItemId
 *    @return {String} unique id of the item
 * getItemRequestPath
 *    @return {String} unique request path of the item when making calls to uppy server
 * getItemModifiedDate
 *    @return {object} or {String} date of when last the item was modified
 */
module.exports = function () {
  /**
   * @param {object} instance of the plugin
   */
  function View(plugin) {
    _classCallCheck(this, View);

    this.plugin = plugin;
    this.Provider = plugin[plugin.id];

    // Logic
    this.addFile = this.addFile.bind(this);
    this.filterItems = this.filterItems.bind(this);
    this.filterQuery = this.filterQuery.bind(this);
    this.getFolder = this.getFolder.bind(this);
    this.getNextFolder = this.getNextFolder.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
    this.handleDemoAuth = this.handleDemoAuth.bind(this);
    this.sortByTitle = this.sortByTitle.bind(this);
    this.sortByDate = this.sortByDate.bind(this);
    this.isActiveRow = this.isActiveRow.bind(this);
    this.handleError = this.handleError.bind(this);

    // Visual
    this.render = this.render.bind(this);
  }

  /**
   * Little shorthand to update the state with the plugin's state
   */


  View.prototype.updateState = function updateState(newState) {
    var _plugin$core$setState;

    var stateId = this.plugin.stateId;
    var state = this.plugin.core.state;


    this.plugin.core.setState((_plugin$core$setState = {}, _plugin$core$setState[stateId] = _extends({}, state[stateId], newState), _plugin$core$setState));
  };

  /**
   * Based on folder ID, fetch a new folder and update it to state
   * @param  {String} id Folder id
   * @return {Promise}   Folders/files in folder
   */


  View.prototype.getFolder = function getFolder(id, name) {
    var _this = this;

    return this._loaderWrapper(this.Provider.list(id), function (res) {
      var folders = [];
      var files = [];
      var updatedDirectories = void 0;

      var state = _this.plugin.core.getState()[_this.plugin.stateId];
      var index = state.directories.findIndex(function (dir) {
        return id === dir.id;
      });

      if (index !== -1) {
        updatedDirectories = state.directories.slice(0, index + 1);
      } else {
        updatedDirectories = state.directories.concat([{ id: id, title: name || _this.plugin.getItemName(res) }]);
      }

      _this.plugin.getItemSubList(res).forEach(function (item) {
        if (_this.plugin.isFolder(item)) {
          folders.push(item);
        } else {
          files.push(item);
        }
      });

      var data = { folders: folders, files: files, directories: updatedDirectories };
      _this.updateState(data);

      return data;
    }, this.handleError);
  };

  /**
   * Fetches new folder
   * @param  {Object} Folder
   * @param  {String} title Folder title
   */


  View.prototype.getNextFolder = function getNextFolder(folder) {
    var id = this.plugin.getItemRequestPath(folder);
    this.getFolder(id, this.plugin.getItemName(folder));
  };

  View.prototype.addFile = function addFile(file) {
    var tagFile = {
      source: this.plugin.id,
      data: this.plugin.getItemData(file),
      name: this.plugin.getItemName(file),
      type: this.plugin.getMimeType(file),
      isRemote: true,
      body: {
        fileId: this.plugin.getItemId(file)
      },
      remote: {
        host: this.plugin.opts.host,
        url: this.plugin.opts.host + '/' + this.Provider.id + '/get/' + this.plugin.getItemRequestPath(file),
        body: {
          fileId: this.plugin.getItemId(file)
        }
      }
    };

    if (Utils.getFileType(tagFile)[0] === 'image') {
      tagFile.preview = this.plugin.opts.host + '/' + this.Provider.id + '/thumbnail/' + this.plugin.getItemRequestPath(file);
    }
    console.log('adding file');
    this.plugin.core.emitter.emit('core:file-add', tagFile);
  };

  /**
   * Removes session token on client side.
   */


  View.prototype.logout = function logout() {
    var _this2 = this;

    this.Provider.logout(location.href).then(function (res) {
      return res.json();
    }).then(function (res) {
      if (res.ok) {
        var newState = {
          authenticated: false,
          files: [],
          folders: [],
          directories: []
        };
        _this2.updateState(newState);
      }
    }).catch(this.handleError);
  };

  /**
   * Used to set active file/folder.
   * @param  {Object} file   Active file/folder
   */


  View.prototype.handleRowClick = function handleRowClick(file) {
    var state = this.plugin.core.getState()[this.plugin.stateId];
    var newState = _extends({}, state, {
      activeRow: this.plugin.getItemId(file)
    });

    this.updateState(newState);
  };

  View.prototype.filterQuery = function filterQuery(e) {
    var state = this.plugin.core.getState()[this.plugin.stateId];
    this.updateState(_extends({}, state, {
      filterInput: e.target.value
    }));
  };

  View.prototype.filterItems = function filterItems(items) {
    var _this3 = this;

    var state = this.plugin.core.getState()[this.plugin.stateId];
    return items.filter(function (folder) {
      return _this3.plugin.getItemName(folder).toLowerCase().indexOf(state.filterInput.toLowerCase()) !== -1;
    });
  };

  View.prototype.sortByTitle = function sortByTitle() {
    var _this4 = this;

    var state = _extends({}, this.plugin.core.getState()[this.plugin.stateId]);
    var files = state.files,
        folders = state.folders,
        sorting = state.sorting;


    var sortedFiles = files.sort(function (fileA, fileB) {
      if (sorting === 'titleDescending') {
        return _this4.plugin.getItemName(fileB).localeCompare(_this4.plugin.getItemName(fileA));
      }
      return _this4.plugin.getItemName(fileA).localeCompare(_this4.plugin.getItemName(fileB));
    });

    var sortedFolders = folders.sort(function (folderA, folderB) {
      if (sorting === 'titleDescending') {
        return _this4.plugin.getItemName(folderB).localeCompare(_this4.plugin.getItemName(folderA));
      }
      return _this4.plugin.getItemName(folderA).localeCompare(_this4.plugin.getItemName(folderB));
    });

    this.updateState(_extends({}, state, {
      files: sortedFiles,
      folders: sortedFolders,
      sorting: sorting === 'titleDescending' ? 'titleAscending' : 'titleDescending'
    }));
  };

  View.prototype.sortByDate = function sortByDate() {
    var _this5 = this;

    var state = _extends({}, this.plugin.core.getState()[this.plugin.stateId]);
    var files = state.files,
        folders = state.folders,
        sorting = state.sorting;


    var sortedFiles = files.sort(function (fileA, fileB) {
      var a = new Date(_this5.plugin.getItemModifiedDate(fileA));
      var b = new Date(_this5.plugin.getItemModifiedDate(fileB));

      if (sorting === 'dateDescending') {
        return a > b ? -1 : a < b ? 1 : 0;
      }
      return a > b ? 1 : a < b ? -1 : 0;
    });

    var sortedFolders = folders.sort(function (folderA, folderB) {
      var a = new Date(_this5.plugin.getItemModifiedDate(folderA));
      var b = new Date(_this5.plugin.getItemModifiedDate(folderB));

      if (sorting === 'dateDescending') {
        return a > b ? -1 : a < b ? 1 : 0;
      }

      return a > b ? 1 : a < b ? -1 : 0;
    });

    this.updateState(_extends({}, state, {
      files: sortedFiles,
      folders: sortedFolders,
      sorting: sorting === 'dateDescending' ? 'dateAscending' : 'dateDescending'
    }));
  };

  View.prototype.isActiveRow = function isActiveRow(file) {
    return this.plugin.core.getState()[this.plugin.stateId].activeRow === this.plugin.getItemId(file);
  };

  View.prototype.handleDemoAuth = function handleDemoAuth() {
    var state = this.plugin.core.getState()[this.plugin.stateId];
    this.updateState({}, state, {
      authenticated: true
    });
  };

  View.prototype.handleAuth = function handleAuth() {
    var _this6 = this;

    var urlId = Math.floor(Math.random() * 999999) + 1;
    var redirect = '' + location.href + (location.search ? '&' : '?') + 'id=' + urlId;

    var authState = btoa(JSON.stringify({ redirect: redirect }));
    var link = this.plugin.opts.host + '/connect/' + this.Provider.authProvider + '?state=' + authState;

    var authWindow = window.open(link, '_blank');
    var checkAuth = function checkAuth() {
      var authWindowUrl = void 0;

      try {
        authWindowUrl = authWindow.location.href;
      } catch (e) {
        if (e instanceof DOMException || e instanceof TypeError) {
          return setTimeout(checkAuth, 100);
        } else throw e;
      }

      // split url because chrome adds '#' to redirects
      if (authWindowUrl.split('#')[0] === redirect) {
        authWindow.close();
        _this6._loaderWrapper(_this6.Provider.auth(), _this6.plugin.onAuth, _this6.handleError);
      } else {
        setTimeout(checkAuth, 100);
      }
    };

    checkAuth();
  };

  View.prototype.handleError = function handleError(error) {
    this.updateState({ error: error });
  };

  // displays loader view while asynchronous request is being made.


  View.prototype._loaderWrapper = function _loaderWrapper(promise, then, catch_) {
    var _this7 = this;

    promise.then(function (result) {
      _this7.updateState({ loading: false });
      then(result);
    }).catch(function (err) {
      _this7.updateState({ loading: false });
      catch_(err);
    });
    this.updateState({ loading: true });
  };

  View.prototype.render = function render(state) {
    var _state$plugin$stateId = state[this.plugin.stateId],
        authenticated = _state$plugin$stateId.authenticated,
        error = _state$plugin$stateId.error,
        loading = _state$plugin$stateId.loading;


    if (error) {
      this.updateState({ error: undefined });
      return ErrorView({ error: error });
    }

    if (loading) {
      return LoaderView();
    }

    if (!authenticated) {
      return AuthView({
        pluginName: this.plugin.title,
        demo: this.plugin.opts.demo,
        handleAuth: this.handleAuth,
        handleDemoAuth: this.handleDemoAuth
      });
    }

    var browserProps = _extends({}, state[this.plugin.stateId], {
      getNextFolder: this.getNextFolder,
      getFolder: this.getFolder,
      addFile: this.addFile,
      filterItems: this.filterItems,
      filterQuery: this.filterQuery,
      handleRowClick: this.handleRowClick,
      sortByTitle: this.sortByTitle,
      sortByDate: this.sortByDate,
      logout: this.logout,
      demo: this.plugin.opts.demo,
      isActiveRow: this.isActiveRow,
      getItemName: this.plugin.getItemName,
      getItemIcon: this.plugin.getItemIcon
    });

    return Browser(browserProps);
  };

  return View;
}();

},{"../core/Utils":18,"./AuthView":19,"./Browser":22,"./Error":23,"./Loader":24}],29:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _svgNamespace = 'http://www.w3.org/2000/svg',
    _appendChild = require('yo-yoify/lib/appendChild');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('../Plugin');

var Provider = require('../../uppy-base/src/plugins/Provider');

var View = require('../../generic-provider-views/index');

module.exports = function (_Plugin) {
  _inherits(Google, _Plugin);

  function Google(core, opts) {
    _classCallCheck(this, Google);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, core, opts));

    _this.type = 'acquirer';
    _this.id = 'GoogleDrive';
    _this.title = 'Google Drive';
    _this.stateId = 'googleDrive';
    _this.icon = function () {
      var _path, _uppyIcon;

      return _uppyIcon = document.createElementNS(_svgNamespace, 'svg'), _uppyIcon.setAttribute('width', '28'), _uppyIcon.setAttribute('height', '28'), _uppyIcon.setAttribute('viewBox', '0 0 16 16'), _uppyIcon.setAttribute('class', 'UppyIcon UppyModalTab-icon'), _appendChild(_uppyIcon, [' ', (_path = document.createElementNS(_svgNamespace, 'path'), _path.setAttribute('d', 'M2.955 14.93l2.667-4.62H16l-2.667 4.62H2.955zm2.378-4.62l-2.666 4.62L0 10.31l5.19-8.99 2.666 4.62-2.523 4.37zm10.523-.25h-5.333l-5.19-8.99h5.334l5.19 8.99z'), _path), ' ']), _uppyIcon;
    };

    // writing out the key explicitly for readability the key used to store
    // the provider instance must be equal to this.id.
    _this.GoogleDrive = new Provider({
      host: _this.opts.host,
      provider: 'drive',
      authProvider: 'google'
    });

    _this.files = [];

    _this.onAuth = _this.onAuth.bind(_this);
    // Visual
    _this.render = _this.render.bind(_this);

    // set default options
    var defaultOptions = {};

    // merge default options with the ones set by user
    _this.opts = _extends({}, defaultOptions, opts);
    return _this;
  }

  Google.prototype.install = function install() {
    this.view = new View(this);
    // Set default state for Google Drive
    this.core.setState({
      // writing out the key explicitly for readability the key used to store
      // the plugin state must be equal to this.stateId.
      googleDrive: {
        authenticated: false,
        files: [],
        folders: [],
        directories: [],
        activeRow: -1,
        filterInput: ''
      }
    });

    var target = this.opts.target;
    var plugin = this;
    this.target = this.mount(target, plugin);

    // catch error here.
    this[this.id].auth().then(this.onAuth).catch(this.view.handleError);
    return;
  };

  Google.prototype.onAuth = function onAuth(authenticated) {
    this.view.updateState({ authenticated: authenticated });
    if (authenticated) {
      this.view.getFolder('root');
    }
  };

  Google.prototype.isFolder = function isFolder(item) {
    return item.mimeType === 'application/vnd.google-apps.folder';
  };

  Google.prototype.getItemData = function getItemData(item) {
    return _extends({}, item, { size: parseFloat(item.fileSize) });
  };

  Google.prototype.getItemIcon = function getItemIcon(item) {
    var _img;

    return _img = document.createElement('img'), _img.setAttribute('src', '' + String(item.iconLink) + ''), _img;
  };

  Google.prototype.getItemSubList = function getItemSubList(item) {
    return item.items;
  };

  Google.prototype.getItemName = function getItemName(item) {
    return item.title ? item.title : '/';
  };

  Google.prototype.getMimeType = function getMimeType(item) {
    return item.mimeType;
  };

  Google.prototype.getItemId = function getItemId(item) {
    return item.id;
  };

  Google.prototype.getItemRequestPath = function getItemRequestPath(item) {
    return this.getItemId(item);
  };

  Google.prototype.getItemModifiedDate = function getItemModifiedDate(item) {
    return item.modifiedByMeDate;
  };

  Google.prototype.render = function render(state) {
    return this.view.render(state);
  };

  return Google;
}(Plugin);

},{"../../generic-provider-views/index":28,"../../uppy-base/src/plugins/Provider":31,"../Plugin":30,"yo-yoify/lib/appendChild":14}],30:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var yo = require('yo-yo');
// const nanoraf = require('nanoraf')

var _require = require('../core/Utils'),
    findDOMElement = _require.findDOMElement;

/**
 * Boilerplate that all Plugins share - and should not be used
 * directly. It also shows which methods final plugins should implement/override,
 * this deciding on structure.
 *
 * @param {object} main Uppy core object
 * @param {object} object with plugin options
 * @return {array | string} files or success/fail message
 */


module.exports = function () {
  function Plugin(core, opts) {
    _classCallCheck(this, Plugin);

    this.core = core;
    this.opts = opts || {};
    this.type = 'none';

    // clear everything inside the target selector
    this.opts.replaceTargetContent === this.opts.replaceTargetContent || true;

    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.focus = this.focus.bind(this);
    this.install = this.install.bind(this);

    // this.frame = null
  }

  Plugin.prototype.update = function update(state) {
    if (typeof this.el === 'undefined') {
      return;
    }

    // const prev = {}
    // if (!this.frame) {
    //   console.log('creating frame')
    //   this.frame = nanoraf((state, prev) => {
    //     console.log('updating!', Date.now())
    //     const newEl = this.render(state)
    //     this.el = yo.update(this.el, newEl)
    //   })
    // }
    // console.log('attempting an update...', Date.now())
    // this.frame(state, prev)

    // this.core.log('update number: ' + this.core.updateNum++)

    var newEl = this.render(state);
    yo.update(this.el, newEl);

    // optimizes performance?
    // requestAnimationFrame(() => {
    //   const newEl = this.render(state)
    //   yo.update(this.el, newEl)
    // })
  };

  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   *
   * @param {String|Object} target
   *
   */


  Plugin.prototype.mount = function mount(target, plugin) {
    var callerPluginName = plugin.id;

    var targetElement = findDOMElement(target);

    if (targetElement) {
      this.core.log('Installing ' + callerPluginName + ' to a DOM element');

      // clear everything inside the target container
      if (this.opts.replaceTargetContent) {
        targetElement.innerHTML = '';
      }

      this.el = plugin.render(this.core.state);
      targetElement.appendChild(this.el);

      return targetElement;
    } else {
      // TODO: is instantiating the plugin really the way to roll
      // just to get the plugin name?
      var Target = target;
      var targetPluginName = new Target().id;

      this.core.log('Installing ' + callerPluginName + ' to ' + targetPluginName);

      var targetPlugin = this.core.getPlugin(targetPluginName);
      var selectorTarget = targetPlugin.addTarget(plugin);

      return selectorTarget;
    }
  };

  Plugin.prototype.focus = function focus() {
    return;
  };

  Plugin.prototype.install = function install() {
    return;
  };

  return Plugin;
}();

},{"../core/Utils":18,"yo-yo":12}],31:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('whatwg-fetch');

var _getName = function _getName(id) {
  return id.split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

module.exports = function () {
  function Provider(opts) {
    _classCallCheck(this, Provider);

    this.opts = opts;
    this.provider = opts.provider;
    this.id = this.provider;
    this.authProvider = opts.authProvider || this.provider;
    this.name = this.opts.name || _getName(this.id);
  }

  _createClass(Provider, [{
    key: 'auth',
    value: function auth() {
      return fetch(this.opts.host + '/' + this.id + '/auth', {
        method: 'get',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application.json'
        }
      }).then(function (res) {
        return res.json().then(function (payload) {
          return payload.authenticated;
        });
      });
    }
  }, {
    key: 'list',
    value: function list(directory) {
      return fetch(this.opts.host + '/' + this.id + '/list/' + (directory || ''), {
        method: 'get',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(function (res) {
        return res.json();
      });
    }
  }, {
    key: 'logout',
    value: function logout() {
      var redirect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : location.href;

      return fetch(this.opts.host + '/' + this.id + '/logout?redirect=' + redirect, {
        method: 'get',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    }
  }]);

  return Provider;
}();

},{"whatwg-fetch":11}],32:[function(require,module,exports){

},{}],33:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],34:[function(require,module,exports){
'use strict';

var Uppy = require('../../../../src/core/Core.js');
var Tus10 = require('../../../../src/plugins/GoogleDrive');

var uppy = new Uppy({ debug: true, autoProceed: false });

uppy.use(Tus10, { endpoint: '//master.tus.io/files/' }).run();

console.log('--> Uppy Bundled version with Tus10 & Russian language pack has loaded');

},{"../../../../src/core/Core.js":15,"../../../../src/plugins/GoogleDrive":29}]},{},[34])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvYmVsL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2Rpc3QvZXM2LXByb21pc2UuanMiLCIuLi9ub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCIuLi9ub2RlX21vZHVsZXMvaHlwZXJzY3JpcHQtYXR0cmlidXRlLXRvLXByb3BlcnR5L2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2h5cGVyeC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbW9ycGhkb20vZGlzdC9tb3JwaGRvbS5qcyIsIi4uL25vZGVfbW9kdWxlcy9uYW1lc3BhY2UtZW1pdHRlci9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9vbi1sb2FkL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIi4uL25vZGVfbW9kdWxlcy95by15by9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy95by15by91cGRhdGUtZXZlbnRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3lvLXlvaWZ5L2xpYi9hcHBlbmRDaGlsZC5qcyIsIi4uL3NyYy9jb3JlL0NvcmUuanMiLCIuLi9zcmMvY29yZS9UcmFuc2xhdG9yLmpzIiwiLi4vc3JjL2NvcmUvVXBweVNvY2tldC5qcyIsIi4uL3NyYy9jb3JlL1V0aWxzLmpzIiwiLi4vc3JjL2dlbmVyaWMtcHJvdmlkZXItdmlld3MvQXV0aFZpZXcuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9CcmVhZGNydW1iLmpzIiwiLi4vc3JjL2dlbmVyaWMtcHJvdmlkZXItdmlld3MvQnJlYWRjcnVtYnMuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9Ccm93c2VyLmpzIiwiLi4vc3JjL2dlbmVyaWMtcHJvdmlkZXItdmlld3MvRXJyb3IuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9Mb2FkZXIuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9UYWJsZS5qcyIsIi4uL3NyYy9nZW5lcmljLXByb3ZpZGVyLXZpZXdzL1RhYmxlQ29sdW1uLmpzIiwiLi4vc3JjL2dlbmVyaWMtcHJvdmlkZXItdmlld3MvVGFibGVSb3cuanMiLCIuLi9zcmMvZ2VuZXJpYy1wcm92aWRlci12aWV3cy9pbmRleC5qcyIsIi4uL3NyYy9wbHVnaW5zL0dvb2dsZURyaXZlL2luZGV4LmpzIiwiLi4vc3JjL3BsdWdpbnMvUGx1Z2luLmpzIiwiLi4vc3JjL3VwcHktYmFzZS9zcmMvcGx1Z2lucy9Qcm92aWRlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2V4YW1wbGVzL2kxOG4vYXBwLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy83QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2piQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LFFBQVEsR0FBUixDQUFZLHdFQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpXG52YXIgaHlwZXJ4ID0gcmVxdWlyZSgnaHlwZXJ4JylcbnZhciBvbmxvYWQgPSByZXF1aXJlKCdvbi1sb2FkJylcblxudmFyIFNWR05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xudmFyIFhMSU5LTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaydcblxudmFyIEJPT0xfUFJPUFMgPSB7XG4gIGF1dG9mb2N1czogMSxcbiAgY2hlY2tlZDogMSxcbiAgZGVmYXVsdGNoZWNrZWQ6IDEsXG4gIGRpc2FibGVkOiAxLFxuICBmb3Jtbm92YWxpZGF0ZTogMSxcbiAgaW5kZXRlcm1pbmF0ZTogMSxcbiAgcmVhZG9ubHk6IDEsXG4gIHJlcXVpcmVkOiAxLFxuICBzZWxlY3RlZDogMSxcbiAgd2lsbHZhbGlkYXRlOiAxXG59XG52YXIgQ09NTUVOVF9UQUcgPSAnIS0tJ1xudmFyIFNWR19UQUdTID0gW1xuICAnc3ZnJyxcbiAgJ2FsdEdseXBoJywgJ2FsdEdseXBoRGVmJywgJ2FsdEdseXBoSXRlbScsICdhbmltYXRlJywgJ2FuaW1hdGVDb2xvcicsXG4gICdhbmltYXRlTW90aW9uJywgJ2FuaW1hdGVUcmFuc2Zvcm0nLCAnY2lyY2xlJywgJ2NsaXBQYXRoJywgJ2NvbG9yLXByb2ZpbGUnLFxuICAnY3Vyc29yJywgJ2RlZnMnLCAnZGVzYycsICdlbGxpcHNlJywgJ2ZlQmxlbmQnLCAnZmVDb2xvck1hdHJpeCcsXG4gICdmZUNvbXBvbmVudFRyYW5zZmVyJywgJ2ZlQ29tcG9zaXRlJywgJ2ZlQ29udm9sdmVNYXRyaXgnLCAnZmVEaWZmdXNlTGlnaHRpbmcnLFxuICAnZmVEaXNwbGFjZW1lbnRNYXAnLCAnZmVEaXN0YW50TGlnaHQnLCAnZmVGbG9vZCcsICdmZUZ1bmNBJywgJ2ZlRnVuY0InLFxuICAnZmVGdW5jRycsICdmZUZ1bmNSJywgJ2ZlR2F1c3NpYW5CbHVyJywgJ2ZlSW1hZ2UnLCAnZmVNZXJnZScsICdmZU1lcmdlTm9kZScsXG4gICdmZU1vcnBob2xvZ3knLCAnZmVPZmZzZXQnLCAnZmVQb2ludExpZ2h0JywgJ2ZlU3BlY3VsYXJMaWdodGluZycsXG4gICdmZVNwb3RMaWdodCcsICdmZVRpbGUnLCAnZmVUdXJidWxlbmNlJywgJ2ZpbHRlcicsICdmb250JywgJ2ZvbnQtZmFjZScsXG4gICdmb250LWZhY2UtZm9ybWF0JywgJ2ZvbnQtZmFjZS1uYW1lJywgJ2ZvbnQtZmFjZS1zcmMnLCAnZm9udC1mYWNlLXVyaScsXG4gICdmb3JlaWduT2JqZWN0JywgJ2cnLCAnZ2x5cGgnLCAnZ2x5cGhSZWYnLCAnaGtlcm4nLCAnaW1hZ2UnLCAnbGluZScsXG4gICdsaW5lYXJHcmFkaWVudCcsICdtYXJrZXInLCAnbWFzaycsICdtZXRhZGF0YScsICdtaXNzaW5nLWdseXBoJywgJ21wYXRoJyxcbiAgJ3BhdGgnLCAncGF0dGVybicsICdwb2x5Z29uJywgJ3BvbHlsaW5lJywgJ3JhZGlhbEdyYWRpZW50JywgJ3JlY3QnLFxuICAnc2V0JywgJ3N0b3AnLCAnc3dpdGNoJywgJ3N5bWJvbCcsICd0ZXh0JywgJ3RleHRQYXRoJywgJ3RpdGxlJywgJ3RyZWYnLFxuICAndHNwYW4nLCAndXNlJywgJ3ZpZXcnLCAndmtlcm4nXG5dXG5cbmZ1bmN0aW9uIGJlbENyZWF0ZUVsZW1lbnQgKHRhZywgcHJvcHMsIGNoaWxkcmVuKSB7XG4gIHZhciBlbFxuXG4gIC8vIElmIGFuIHN2ZyB0YWcsIGl0IG5lZWRzIGEgbmFtZXNwYWNlXG4gIGlmIChTVkdfVEFHUy5pbmRleE9mKHRhZykgIT09IC0xKSB7XG4gICAgcHJvcHMubmFtZXNwYWNlID0gU1ZHTlNcbiAgfVxuXG4gIC8vIElmIHdlIGFyZSB1c2luZyBhIG5hbWVzcGFjZVxuICB2YXIgbnMgPSBmYWxzZVxuICBpZiAocHJvcHMubmFtZXNwYWNlKSB7XG4gICAgbnMgPSBwcm9wcy5uYW1lc3BhY2VcbiAgICBkZWxldGUgcHJvcHMubmFtZXNwYWNlXG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIGVsZW1lbnRcbiAgaWYgKG5zKSB7XG4gICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIHRhZylcbiAgfSBlbHNlIGlmICh0YWcgPT09IENPTU1FTlRfVEFHKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQocHJvcHMuY29tbWVudClcbiAgfSBlbHNlIHtcbiAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKVxuICB9XG5cbiAgLy8gSWYgYWRkaW5nIG9ubG9hZCBldmVudHNcbiAgaWYgKHByb3BzLm9ubG9hZCB8fCBwcm9wcy5vbnVubG9hZCkge1xuICAgIHZhciBsb2FkID0gcHJvcHMub25sb2FkIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgdmFyIHVubG9hZCA9IHByb3BzLm9udW5sb2FkIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgb25sb2FkKGVsLCBmdW5jdGlvbiBiZWxPbmxvYWQgKCkge1xuICAgICAgbG9hZChlbClcbiAgICB9LCBmdW5jdGlvbiBiZWxPbnVubG9hZCAoKSB7XG4gICAgICB1bmxvYWQoZWwpXG4gICAgfSxcbiAgICAvLyBXZSBoYXZlIHRvIHVzZSBub24tc3RhbmRhcmQgYGNhbGxlcmAgdG8gZmluZCB3aG8gaW52b2tlcyBgYmVsQ3JlYXRlRWxlbWVudGBcbiAgICBiZWxDcmVhdGVFbGVtZW50LmNhbGxlci5jYWxsZXIuY2FsbGVyKVxuICAgIGRlbGV0ZSBwcm9wcy5vbmxvYWRcbiAgICBkZWxldGUgcHJvcHMub251bmxvYWRcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aGUgcHJvcGVydGllc1xuICBmb3IgKHZhciBwIGluIHByb3BzKSB7XG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICB2YXIga2V5ID0gcC50b0xvd2VyQ2FzZSgpXG4gICAgICB2YXIgdmFsID0gcHJvcHNbcF1cbiAgICAgIC8vIE5vcm1hbGl6ZSBjbGFzc05hbWVcbiAgICAgIGlmIChrZXkgPT09ICdjbGFzc25hbWUnKSB7XG4gICAgICAgIGtleSA9ICdjbGFzcydcbiAgICAgICAgcCA9ICdjbGFzcydcbiAgICAgIH1cbiAgICAgIC8vIFRoZSBmb3IgYXR0cmlidXRlIGdldHMgdHJhbnNmb3JtZWQgdG8gaHRtbEZvciwgYnV0IHdlIGp1c3Qgc2V0IGFzIGZvclxuICAgICAgaWYgKHAgPT09ICdodG1sRm9yJykge1xuICAgICAgICBwID0gJ2ZvcidcbiAgICAgIH1cbiAgICAgIC8vIElmIGEgcHJvcGVydHkgaXMgYm9vbGVhbiwgc2V0IGl0c2VsZiB0byB0aGUga2V5XG4gICAgICBpZiAoQk9PTF9QUk9QU1trZXldKSB7XG4gICAgICAgIGlmICh2YWwgPT09ICd0cnVlJykgdmFsID0ga2V5XG4gICAgICAgIGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykgY29udGludWVcbiAgICAgIH1cbiAgICAgIC8vIElmIGEgcHJvcGVydHkgcHJlZmVycyBiZWluZyBzZXQgZGlyZWN0bHkgdnMgc2V0QXR0cmlidXRlXG4gICAgICBpZiAoa2V5LnNsaWNlKDAsIDIpID09PSAnb24nKSB7XG4gICAgICAgIGVsW3BdID0gdmFsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICBpZiAocCA9PT0gJ3hsaW5rOmhyZWYnKSB7XG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhYTElOS05TLCBwLCB2YWwpXG4gICAgICAgICAgfSBlbHNlIGlmICgvXnhtbG5zKCR8OikvaS50ZXN0KHApKSB7XG4gICAgICAgICAgICAvLyBza2lwIHhtbG5zIGRlZmluaXRpb25zXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKG51bGwsIHAsIHZhbClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwuc2V0QXR0cmlidXRlKHAsIHZhbClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGVuZENoaWxkIChjaGlsZHMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY2hpbGRzKSkgcmV0dXJuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBub2RlID0gY2hpbGRzW2ldXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlKSkge1xuICAgICAgICBhcHBlbmRDaGlsZChub2RlKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG5vZGUgPT09ICdudW1iZXInIHx8XG4gICAgICAgIHR5cGVvZiBub2RlID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgdHlwZW9mIG5vZGUgPT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgbm9kZSBpbnN0YW5jZW9mIERhdGUgfHxcbiAgICAgICAgbm9kZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICBub2RlID0gbm9kZS50b1N0cmluZygpXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGVsLmxhc3RDaGlsZCAmJiBlbC5sYXN0Q2hpbGQubm9kZU5hbWUgPT09ICcjdGV4dCcpIHtcbiAgICAgICAgICBlbC5sYXN0Q2hpbGQubm9kZVZhbHVlICs9IG5vZGVcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShub2RlKVxuICAgICAgfVxuXG4gICAgICBpZiAobm9kZSAmJiBub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGFwcGVuZENoaWxkKGNoaWxkcmVuKVxuXG4gIHJldHVybiBlbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGh5cGVyeChiZWxDcmVhdGVFbGVtZW50LCB7Y29tbWVudHM6IHRydWV9KVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVFbGVtZW50ID0gYmVsQ3JlYXRlRWxlbWVudFxuIiwiLyohXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2pha2VhcmNoaWJhbGQvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgMy4yLjFcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRvYmplY3RPckZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyB8fCAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc01heWJlVGhlbmFibGUoeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsO1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5O1xuICAgIGlmICghQXJyYXkuaXNBcnJheSkge1xuICAgICAgbGliJGVzNiRwcm9taXNlJHV0aWxzJCRfaXNBcnJheSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0FycmF5ID0gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRfaXNBcnJheTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiA9IDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQ7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbjtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2xpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW5dID0gY2FsbGJhY2s7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArIDFdID0gYXJnO1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArPSAyO1xuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4obGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldFNjaGVkdWxlcihzY2hlZHVsZUZuKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4gPSBzY2hlZHVsZUZuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRBc2FwKGFzYXBGbikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXAgPSBhc2FwRm47XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93ID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyB8fCB7fTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNOb2RlID0gdHlwZW9mIHNlbGYgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXSc7XG5cbiAgICAvLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAvLyBub2RlXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU5leHRUaWNrKCkge1xuICAgICAgLy8gbm9kZSB2ZXJzaW9uIDAuMTAueCBkaXNwbGF5cyBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgd2hlbiBuZXh0VGljayBpcyB1c2VkIHJlY3Vyc2l2ZWx5XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2N1am9qcy93aGVuL2lzc3Vlcy80MTAgZm9yIGRldGFpbHNcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB2ZXJ0eFxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VWZXJ0eFRpbWVyKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkdmVydHhOZXh0KGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcihsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB3ZWIgd29ya2VyXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoLCAxKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2goKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW47IGkrPTIpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2ldO1xuICAgICAgICB2YXIgYXJnID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2krMV07XG5cbiAgICAgICAgY2FsbGJhY2soYXJnKTtcblxuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpKzFdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXR0ZW1wdFZlcnR4KCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHIgPSByZXF1aXJlO1xuICAgICAgICB2YXIgdmVydHggPSByKCd2ZXJ0eCcpO1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkdmVydHhOZXh0ID0gdmVydHgucnVuT25Mb29wIHx8IHZlcnR4LnJ1bk9uQ29udGV4dDtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VWZXJ0eFRpbWVyKCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoO1xuICAgIC8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG4gICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc05vZGUpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU5leHRUaWNrKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc1dvcmtlcikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93ID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGF0dGVtcHRWZXJ0eCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSR0aGVuJCR0aGVuKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcztcblxuICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgIGlmIChjaGlsZFtsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQUk9NSVNFX0lEXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG1ha2VQcm9taXNlKGNoaWxkKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1tzdGF0ZSAtIDFdO1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChmdW5jdGlvbigpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHN0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHBhcmVudC5fcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdGhlbiQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSR0aGVuJCR0aGVuO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJHJlc29sdmUob2JqZWN0KSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QuY29uc3RydWN0b3IgPT09IENvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkcmVzb2x2ZTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUFJPTUlTRV9JRCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygxNik7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKCkge31cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRjYW5ub3RSZXR1cm5Pd24oKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3RvciAmJlxuICAgICAgICAgIHRoZW4gPT09IGxpYiRlczYkcHJvbWlzZSR0aGVuJCRkZWZhdWx0ICYmXG4gICAgICAgICAgY29uc3RydWN0b3IucmVzb2x2ZSA9PT0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGVuID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24odGhlbikpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc2VsZkZ1bGZpbGxtZW50KCkpO1xuICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4odmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgICAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICAgICAgcHJvbWlzZS5fb25lcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cblxuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUiA9IG5ldyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgICAgIHZhbHVlLCBlcnJvciwgc3VjY2VlZGVkLCBmYWlsZWQ7XG5cbiAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICB2YWx1ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGlkID0gMDtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRuZXh0SWQoKSB7XG4gICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaWQrKztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRtYWtlUHJvbWlzZShwcm9taXNlKSB7XG4gICAgICBwcm9taXNlW2xpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBST01JU0VfSURdID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaWQrKztcbiAgICAgIHByb21pc2UuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgcHJvbWlzZS5fc3Vic2NyaWJlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbChlbnRyaWVzKSB7XG4gICAgICByZXR1cm4gbmV3IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0KHRoaXMsIGVudHJpZXMpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbDtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRyYWNlKGVudHJpZXMpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICBpZiAoIWxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNBcnJheShlbnRyaWVzKSkge1xuICAgICAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkcmFjZTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJHJlamVjdChyZWFzb24pIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRyZWplY3Q7XG5cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc05ldygpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2U7XG4gICAgLyoqXG4gICAgICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gICAgICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICAgICAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGUgcmVhc29uXG4gICAgICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgVGVybWlub2xvZ3lcbiAgICAgIC0tLS0tLS0tLS0tXG5cbiAgICAgIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gICAgICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gICAgICAtIGB2YWx1ZWAgaXMgYW55IGxlZ2FsIEphdmFTY3JpcHQgdmFsdWUgKGluY2x1ZGluZyB1bmRlZmluZWQsIGEgdGhlbmFibGUsIG9yIGEgcHJvbWlzZSkuXG4gICAgICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgICAgIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgICAgIC0gYHNldHRsZWRgIHRoZSBmaW5hbCByZXN0aW5nIHN0YXRlIG9mIGEgcHJvbWlzZSwgZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuXG4gICAgICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gICAgICBzdGF0ZS4gIFByb21pc2VzIHRoYXQgYXJlIHJlamVjdGVkIGhhdmUgYSByZWplY3Rpb24gcmVhc29uIGFuZCBhcmUgaW4gdGhlXG4gICAgICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICAgICAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gICAgICBwcm9taXNlLCB0aGVuIHRoZSBvcmlnaW5hbCBwcm9taXNlJ3Mgc2V0dGxlZCBzdGF0ZSB3aWxsIG1hdGNoIHRoZSB2YWx1ZSdzXG4gICAgICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgICAgIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgICAgIGl0c2VsZiBmdWxmaWxsLlxuXG5cbiAgICAgIEJhc2ljIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIGBgYGpzXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBvbiBzdWNjZXNzXG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuXG4gICAgICAgIC8vIG9uIGZhaWx1cmVcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICBQcm9taXNlcyBzaGluZSB3aGVuIGFic3RyYWN0aW5nIGF3YXkgYXN5bmNocm9ub3VzIGludGVyYWN0aW9ucyBzdWNoIGFzXG4gICAgICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSB0aGlzLkRPTkUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgICAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICAgICAgXSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgICAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQGNsYXNzIFByb21pc2VcbiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVyXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlKHJlc29sdmVyKSB7XG4gICAgICB0aGlzW2xpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBST01JU0VfSURdID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbmV4dElkKCk7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wICE9PSByZXNvbHZlcikge1xuICAgICAgICB0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicgJiYgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgICAgdGhpcyBpbnN0YW5jZW9mIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlID8gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UodGhpcywgcmVzb2x2ZXIpIDogbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzTmV3KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuYWxsID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJhY2UgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJlc29sdmUgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJlamVjdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkZGVmYXVsdDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5fc2V0U2NoZWR1bGVyID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldFNjaGVkdWxlcjtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5fc2V0QXNhcCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRBc2FwO1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLl9hc2FwID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXA7XG5cbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5wcm90b3R5cGUgPSB7XG4gICAgICBjb25zdHJ1Y3RvcjogbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UsXG5cbiAgICAvKipcbiAgICAgIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICAgICAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgICAgIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBDaGFpbmluZ1xuICAgICAgLS0tLS0tLS1cblxuICAgICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgICAgIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgICAgIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAgICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gICAgICB9KTtcblxuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICAgICAgfSk7XG4gICAgICBgYGBcbiAgICAgIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFzc2ltaWxhdGlvblxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gICAgICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gICAgICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICAgICAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBTaW1wbGUgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBhdXRob3IsIGJvb2tzO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcblxuICAgICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG5cbiAgICAgIH1cblxuICAgICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kQXV0aG9yKCkuXG4gICAgICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgICAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgICAgICAvLyBmb3VuZCBib29rc1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgdGhlblxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0ZWRcbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgIHRoZW46IGxpYiRlczYkcHJvbWlzZSR0aGVuJCRkZWZhdWx0LFxuXG4gICAgLyoqXG4gICAgICBgY2F0Y2hgIGlzIHNpbXBseSBzdWdhciBmb3IgYHRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbilgIHdoaWNoIG1ha2VzIGl0IHRoZSBzYW1lXG4gICAgICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3luY2hyb25vdXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRBdXRob3IoKTtcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9XG5cbiAgICAgIC8vIGFzeW5jIHdpdGggcHJvbWlzZXNcbiAgICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBjYXRjaFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuICAgIH07XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3I7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0KSB7XG4gICAgICB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgICB0aGlzLnByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgIGlmICghdGhpcy5wcm9taXNlW2xpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBST01JU0VfSURdKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG1ha2VQcm9taXNlKHRoaXMucHJvbWlzZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIHRoaXMuX2lucHV0ICAgICA9IGlucHV0O1xuICAgICAgICB0aGlzLmxlbmd0aCAgICAgPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuXG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMDtcbiAgICAgICAgICB0aGlzLl9lbnVtZXJhdGUoKTtcbiAgICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdCh0aGlzLnByb21pc2UsIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCR2YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJHZhbGlkYXRpb25FcnJvcigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuZ3RoICA9IHRoaXMubGVuZ3RoO1xuICAgICAgdmFyIGlucHV0ICAgPSB0aGlzLl9pbnB1dDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHRoaXMuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICB2YXIgYyA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I7XG4gICAgICB2YXIgcmVzb2x2ZSA9IGMucmVzb2x2ZTtcblxuICAgICAgaWYgKHJlc29sdmUgPT09IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQpIHtcbiAgICAgICAgdmFyIHRoZW4gPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRnZXRUaGVuKGVudHJ5KTtcblxuICAgICAgICBpZiAodGhlbiA9PT0gbGliJGVzNiRwcm9taXNlJHRoZW4kJGRlZmF1bHQgJiZcbiAgICAgICAgICAgIGVudHJ5Ll9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gZW50cnk7XG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJGRlZmF1bHQpIHtcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBjKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgZW50cnksIHRoZW4pO1xuICAgICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChwcm9taXNlLCBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQobmV3IGMoZnVuY3Rpb24ocmVzb2x2ZSkgeyByZXNvbHZlKGVudHJ5KTsgfSksIGkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQocmVzb2x2ZShlbnRyeSksIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbihwcm9taXNlLCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkcG9seWZpbGwoKSB7XG4gICAgICB2YXIgbG9jYWw7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gZ2xvYmFsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBsb2NhbCA9IHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgICAgIGlmIChQICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSkgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWwuUHJvbWlzZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0O1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlID0ge1xuICAgICAgJ1Byb21pc2UnOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCxcbiAgICAgICdwb2x5ZmlsbCc6IGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbGliJGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZTsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGVbJ2V4cG9ydHMnXSkge1xuICAgICAgbW9kdWxlWydleHBvcnRzJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzWydFUzZQcm9taXNlJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdCgpO1xufSkuY2FsbCh0aGlzKTtcblxuIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxudmFyIGRvY2N5O1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGRvY2N5ID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXTtcblxuICAgIGlmICghZG9jY3kpIHtcbiAgICAgICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddID0gbWluRG9jO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbiIsInZhciB3aW47XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgd2luID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgd2luID0ge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2luO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5XG5cbnZhciB0cmFuc2Zvcm0gPSB7XG4gICdjbGFzcyc6ICdjbGFzc05hbWUnLFxuICAnZm9yJzogJ2h0bWxGb3InLFxuICAnaHR0cC1lcXVpdic6ICdodHRwRXF1aXYnXG59XG5cbmZ1bmN0aW9uIGF0dHJpYnV0ZVRvUHJvcGVydHkgKGgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0YWdOYW1lLCBhdHRycywgY2hpbGRyZW4pIHtcbiAgICBmb3IgKHZhciBhdHRyIGluIGF0dHJzKSB7XG4gICAgICBpZiAoYXR0ciBpbiB0cmFuc2Zvcm0pIHtcbiAgICAgICAgYXR0cnNbdHJhbnNmb3JtW2F0dHJdXSA9IGF0dHJzW2F0dHJdXG4gICAgICAgIGRlbGV0ZSBhdHRyc1thdHRyXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaCh0YWdOYW1lLCBhdHRycywgY2hpbGRyZW4pXG4gIH1cbn1cbiIsInZhciBhdHRyVG9Qcm9wID0gcmVxdWlyZSgnaHlwZXJzY3JpcHQtYXR0cmlidXRlLXRvLXByb3BlcnR5JylcblxudmFyIFZBUiA9IDAsIFRFWFQgPSAxLCBPUEVOID0gMiwgQ0xPU0UgPSAzLCBBVFRSID0gNFxudmFyIEFUVFJfS0VZID0gNSwgQVRUUl9LRVlfVyA9IDZcbnZhciBBVFRSX1ZBTFVFX1cgPSA3LCBBVFRSX1ZBTFVFID0gOFxudmFyIEFUVFJfVkFMVUVfU1EgPSA5LCBBVFRSX1ZBTFVFX0RRID0gMTBcbnZhciBBVFRSX0VRID0gMTEsIEFUVFJfQlJFQUsgPSAxMlxudmFyIENPTU1FTlQgPSAxM1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChoLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG4gIHZhciBjb25jYXQgPSBvcHRzLmNvbmNhdCB8fCBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBTdHJpbmcoYSkgKyBTdHJpbmcoYilcbiAgfVxuICBpZiAob3B0cy5hdHRyVG9Qcm9wICE9PSBmYWxzZSkge1xuICAgIGggPSBhdHRyVG9Qcm9wKGgpXG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKHN0cmluZ3MpIHtcbiAgICB2YXIgc3RhdGUgPSBURVhULCByZWcgPSAnJ1xuICAgIHZhciBhcmdsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgdmFyIHBhcnRzID0gW11cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGkgPCBhcmdsZW4gLSAxKSB7XG4gICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaSsxXVxuICAgICAgICB2YXIgcCA9IHBhcnNlKHN0cmluZ3NbaV0pXG4gICAgICAgIHZhciB4c3RhdGUgPSBzdGF0ZVxuICAgICAgICBpZiAoeHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFJfVkFMVUVfU1EpIHhzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XKSB4c3RhdGUgPSBBVFRSX1ZBTFVFXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFIpIHhzdGF0ZSA9IEFUVFJfS0VZXG4gICAgICAgIHAucHVzaChbIFZBUiwgeHN0YXRlLCBhcmcgXSlcbiAgICAgICAgcGFydHMucHVzaC5hcHBseShwYXJ0cywgcClcbiAgICAgIH0gZWxzZSBwYXJ0cy5wdXNoLmFwcGx5KHBhcnRzLCBwYXJzZShzdHJpbmdzW2ldKSlcbiAgICB9XG5cbiAgICB2YXIgdHJlZSA9IFtudWxsLHt9LFtdXVxuICAgIHZhciBzdGFjayA9IFtbdHJlZSwtMV1dXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1ciA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVswXVxuICAgICAgdmFyIHAgPSBwYXJ0c1tpXSwgcyA9IHBbMF1cbiAgICAgIGlmIChzID09PSBPUEVOICYmIC9eXFwvLy50ZXN0KHBbMV0pKSB7XG4gICAgICAgIHZhciBpeCA9IHN0YWNrW3N0YWNrLmxlbmd0aC0xXVsxXVxuICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMSkge1xuICAgICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgICAgc3RhY2tbc3RhY2subGVuZ3RoLTFdWzBdWzJdW2l4XSA9IGgoXG4gICAgICAgICAgICBjdXJbMF0sIGN1clsxXSwgY3VyWzJdLmxlbmd0aCA/IGN1clsyXSA6IHVuZGVmaW5lZFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzID09PSBPUEVOKSB7XG4gICAgICAgIHZhciBjID0gW3BbMV0se30sW11dXG4gICAgICAgIGN1clsyXS5wdXNoKGMpXG4gICAgICAgIHN0YWNrLnB1c2goW2MsY3VyWzJdLmxlbmd0aC0xXSlcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9LRVkgfHwgKHMgPT09IFZBUiAmJiBwWzFdID09PSBBVFRSX0tFWSkpIHtcbiAgICAgICAgdmFyIGtleSA9ICcnXG4gICAgICAgIHZhciBjb3B5S2V5XG4gICAgICAgIGZvciAoOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBrZXkgPSBjb25jYXQoa2V5LCBwYXJ0c1tpXVsxXSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHBhcnRzW2ldWzBdID09PSBWQVIgJiYgcGFydHNbaV1bMV0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnRzW2ldWzJdID09PSAnb2JqZWN0JyAmJiAha2V5KSB7XG4gICAgICAgICAgICAgIGZvciAoY29weUtleSBpbiBwYXJ0c1tpXVsyXSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0c1tpXVsyXS5oYXNPd25Qcm9wZXJ0eShjb3B5S2V5KSAmJiAhY3VyWzFdW2NvcHlLZXldKSB7XG4gICAgICAgICAgICAgICAgICBjdXJbMV1bY29weUtleV0gPSBwYXJ0c1tpXVsyXVtjb3B5S2V5XVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAga2V5ID0gY29uY2F0KGtleSwgcGFydHNbaV1bMl0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRzW2ldWzBdID09PSBBVFRSX0VRKSBpKytcbiAgICAgICAgdmFyIGogPSBpXG4gICAgICAgIGZvciAoOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfVkFMVUUgfHwgcGFydHNbaV1bMF0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgICBpZiAoIWN1clsxXVtrZXldKSBjdXJbMV1ba2V5XSA9IHN0cmZuKHBhcnRzW2ldWzFdKVxuICAgICAgICAgICAgZWxzZSBjdXJbMV1ba2V5XSA9IGNvbmNhdChjdXJbMV1ba2V5XSwgcGFydHNbaV1bMV0pXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJ0c1tpXVswXSA9PT0gVkFSXG4gICAgICAgICAgJiYgKHBhcnRzW2ldWzFdID09PSBBVFRSX1ZBTFVFIHx8IHBhcnRzW2ldWzFdID09PSBBVFRSX0tFWSkpIHtcbiAgICAgICAgICAgIGlmICghY3VyWzFdW2tleV0pIGN1clsxXVtrZXldID0gc3RyZm4ocGFydHNbaV1bMl0pXG4gICAgICAgICAgICBlbHNlIGN1clsxXVtrZXldID0gY29uY2F0KGN1clsxXVtrZXldLCBwYXJ0c1tpXVsyXSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggJiYgIWN1clsxXVtrZXldICYmIGkgPT09IGpcbiAgICAgICAgICAgICYmIChwYXJ0c1tpXVswXSA9PT0gQ0xPU0UgfHwgcGFydHNbaV1bMF0gPT09IEFUVFJfQlJFQUspKSB7XG4gICAgICAgICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZnJhc3RydWN0dXJlLmh0bWwjYm9vbGVhbi1hdHRyaWJ1dGVzXG4gICAgICAgICAgICAgIC8vIGVtcHR5IHN0cmluZyBpcyBmYWxzeSwgbm90IHdlbGwgYmVoYXZlZCB2YWx1ZSBpbiBicm93c2VyXG4gICAgICAgICAgICAgIGN1clsxXVtrZXldID0ga2V5LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIGN1clsxXVtwWzFdXSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gVkFSICYmIHBbMV0gPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIGN1clsxXVtwWzJdXSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQ0xPU0UpIHtcbiAgICAgICAgaWYgKHNlbGZDbG9zaW5nKGN1clswXSkgJiYgc3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGl4ID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdWzFdXG4gICAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgICBzdGFja1tzdGFjay5sZW5ndGgtMV1bMF1bMl1baXhdID0gaChcbiAgICAgICAgICAgIGN1clswXSwgY3VyWzFdLCBjdXJbMl0ubGVuZ3RoID8gY3VyWzJdIDogdW5kZWZpbmVkXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFZBUiAmJiBwWzFdID09PSBURVhUKSB7XG4gICAgICAgIGlmIChwWzJdID09PSB1bmRlZmluZWQgfHwgcFsyXSA9PT0gbnVsbCkgcFsyXSA9ICcnXG4gICAgICAgIGVsc2UgaWYgKCFwWzJdKSBwWzJdID0gY29uY2F0KCcnLCBwWzJdKVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwWzJdWzBdKSkge1xuICAgICAgICAgIGN1clsyXS5wdXNoLmFwcGx5KGN1clsyXSwgcFsyXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJbMl0ucHVzaChwWzJdKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IFRFWFQpIHtcbiAgICAgICAgY3VyWzJdLnB1c2gocFsxXSlcbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9FUSB8fCBzID09PSBBVFRSX0JSRUFLKSB7XG4gICAgICAgIC8vIG5vLW9wXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaGFuZGxlZDogJyArIHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRyZWVbMl0ubGVuZ3RoID4gMSAmJiAvXlxccyokLy50ZXN0KHRyZWVbMl1bMF0pKSB7XG4gICAgICB0cmVlWzJdLnNoaWZ0KClcbiAgICB9XG5cbiAgICBpZiAodHJlZVsyXS5sZW5ndGggPiAyXG4gICAgfHwgKHRyZWVbMl0ubGVuZ3RoID09PSAyICYmIC9cXFMvLnRlc3QodHJlZVsyXVsxXSkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdtdWx0aXBsZSByb290IGVsZW1lbnRzIG11c3QgYmUgd3JhcHBlZCBpbiBhbiBlbmNsb3NpbmcgdGFnJ1xuICAgICAgKVxuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0cmVlWzJdWzBdKSAmJiB0eXBlb2YgdHJlZVsyXVswXVswXSA9PT0gJ3N0cmluZydcbiAgICAmJiBBcnJheS5pc0FycmF5KHRyZWVbMl1bMF1bMl0pKSB7XG4gICAgICB0cmVlWzJdWzBdID0gaCh0cmVlWzJdWzBdWzBdLCB0cmVlWzJdWzBdWzFdLCB0cmVlWzJdWzBdWzJdKVxuICAgIH1cbiAgICByZXR1cm4gdHJlZVsyXVswXVxuXG4gICAgZnVuY3Rpb24gcGFyc2UgKHN0cikge1xuICAgICAgdmFyIHJlcyA9IFtdXG4gICAgICBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfVykgc3RhdGUgPSBBVFRSXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IHN0ci5jaGFyQXQoaSlcbiAgICAgICAgaWYgKHN0YXRlID09PSBURVhUICYmIGMgPT09ICc8Jykge1xuICAgICAgICAgIGlmIChyZWcubGVuZ3RoKSByZXMucHVzaChbVEVYVCwgcmVnXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gT1BFTlxuICAgICAgICB9IGVsc2UgaWYgKGMgPT09ICc+JyAmJiAhcXVvdChzdGF0ZSkgJiYgc3RhdGUgIT09IENPTU1FTlQpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IE9QRU4pIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtPUEVOLHJlZ10pXG4gICAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUUgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLnB1c2goW0NMT1NFXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gVEVYVFxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBDT01NRU5UICYmIC8tJC8udGVzdChyZWcpICYmIGMgPT09ICctJykge1xuICAgICAgICAgIGlmIChvcHRzLmNvbW1lbnRzKSB7XG4gICAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWcuc3Vic3RyKDAsIHJlZy5sZW5ndGggLSAxKV0sW0NMT1NFXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IFRFWFRcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gT1BFTiAmJiAvXiEtLSQvLnRlc3QocmVnKSkge1xuICAgICAgICAgIGlmIChvcHRzLmNvbW1lbnRzKSB7XG4gICAgICAgICAgICByZXMucHVzaChbT1BFTiwgcmVnXSxbQVRUUl9LRVksJ2NvbW1lbnQnXSxbQVRUUl9FUV0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZyA9IGNcbiAgICAgICAgICBzdGF0ZSA9IENPTU1FTlRcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gVEVYVCB8fCBzdGF0ZSA9PT0gQ09NTUVOVCkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IE9QRU4gJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIHJlcy5wdXNoKFtPUEVOLCByZWddKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IE9QRU4pIHtcbiAgICAgICAgICByZWcgKz0gY1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSICYmIC9bXlxcc1wiJz0vXS8udGVzdChjKSkge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlcbiAgICAgICAgICByZWcgPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFIgJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIGlmIChyZWcubGVuZ3RoKSByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9CUkVBS10pXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9LRVlfV1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSAmJiBjID09PSAnPScpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSxbQVRUUl9FUV0pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfV1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoKHN0YXRlID09PSBBVFRSX0tFWV9XIHx8IHN0YXRlID09PSBBVFRSKSAmJiBjID09PSAnPScpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9FUV0pXG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1dcbiAgICAgICAgfSBlbHNlIGlmICgoc3RhdGUgPT09IEFUVFJfS0VZX1cgfHwgc3RhdGUgPT09IEFUVFIpICYmICEvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIGlmICgvW1xcdy1dLy50ZXN0KGMpKSB7XG4gICAgICAgICAgICByZWcgKz0gY1xuICAgICAgICAgICAgc3RhdGUgPSBBVFRSX0tFWVxuICAgICAgICAgIH0gZWxzZSBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmIGMgPT09ICdcIicpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfRFFcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XICYmIGMgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBBVFRSX1ZBTFVFX1NRXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEgJiYgYyA9PT0gJ1wiJykge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10sW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfU1EgJiYgYyA9PT0gXCInXCIpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddLFtBVFRSX0JSRUFLXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cgJiYgIS9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgICBpLS1cbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSxbQVRUUl9CUkVBS10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUVxuICAgICAgICB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSkge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZSA9PT0gVEVYVCAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtURVhULHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfRFEgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9LRVkscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdHJmbiAoeCkge1xuICAgIGlmICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHhcbiAgICBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycpIHJldHVybiB4XG4gICAgZWxzZSBpZiAoeCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcpIHJldHVybiB4XG4gICAgZWxzZSByZXR1cm4gY29uY2F0KCcnLCB4KVxuICB9XG59XG5cbmZ1bmN0aW9uIHF1b3QgKHN0YXRlKSB7XG4gIHJldHVybiBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSB8fCBzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUVxufVxuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuZnVuY3Rpb24gaGFzIChvYmosIGtleSkgeyByZXR1cm4gaGFzT3duLmNhbGwob2JqLCBrZXkpIH1cblxudmFyIGNsb3NlUkUgPSBSZWdFeHAoJ14oJyArIFtcbiAgJ2FyZWEnLCAnYmFzZScsICdiYXNlZm9udCcsICdiZ3NvdW5kJywgJ2JyJywgJ2NvbCcsICdjb21tYW5kJywgJ2VtYmVkJyxcbiAgJ2ZyYW1lJywgJ2hyJywgJ2ltZycsICdpbnB1dCcsICdpc2luZGV4JywgJ2tleWdlbicsICdsaW5rJywgJ21ldGEnLCAncGFyYW0nLFxuICAnc291cmNlJywgJ3RyYWNrJywgJ3dicicsICchLS0nLFxuICAvLyBTVkcgVEFHU1xuICAnYW5pbWF0ZScsICdhbmltYXRlVHJhbnNmb3JtJywgJ2NpcmNsZScsICdjdXJzb3InLCAnZGVzYycsICdlbGxpcHNlJyxcbiAgJ2ZlQmxlbmQnLCAnZmVDb2xvck1hdHJpeCcsICdmZUNvbXBvc2l0ZScsXG4gICdmZUNvbnZvbHZlTWF0cml4JywgJ2ZlRGlmZnVzZUxpZ2h0aW5nJywgJ2ZlRGlzcGxhY2VtZW50TWFwJyxcbiAgJ2ZlRGlzdGFudExpZ2h0JywgJ2ZlRmxvb2QnLCAnZmVGdW5jQScsICdmZUZ1bmNCJywgJ2ZlRnVuY0cnLCAnZmVGdW5jUicsXG4gICdmZUdhdXNzaWFuQmx1cicsICdmZUltYWdlJywgJ2ZlTWVyZ2VOb2RlJywgJ2ZlTW9ycGhvbG9neScsXG4gICdmZU9mZnNldCcsICdmZVBvaW50TGlnaHQnLCAnZmVTcGVjdWxhckxpZ2h0aW5nJywgJ2ZlU3BvdExpZ2h0JywgJ2ZlVGlsZScsXG4gICdmZVR1cmJ1bGVuY2UnLCAnZm9udC1mYWNlLWZvcm1hdCcsICdmb250LWZhY2UtbmFtZScsICdmb250LWZhY2UtdXJpJyxcbiAgJ2dseXBoJywgJ2dseXBoUmVmJywgJ2hrZXJuJywgJ2ltYWdlJywgJ2xpbmUnLCAnbWlzc2luZy1nbHlwaCcsICdtcGF0aCcsXG4gICdwYXRoJywgJ3BvbHlnb24nLCAncG9seWxpbmUnLCAncmVjdCcsICdzZXQnLCAnc3RvcCcsICd0cmVmJywgJ3VzZScsICd2aWV3JyxcbiAgJ3ZrZXJuJ1xuXS5qb2luKCd8JykgKyAnKSg/OltcXC4jXVthLXpBLVowLTlcXHUwMDdGLVxcdUZGRkZfOi1dKykqJCcpXG5mdW5jdGlvbiBzZWxmQ2xvc2luZyAodGFnKSB7IHJldHVybiBjbG9zZVJFLnRlc3QodGFnKSB9XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltID0gL15cXHMrfFxccyskL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiYWQgc2lnbmVkIGhleGFkZWNpbWFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmluYXJ5IHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JpbmFyeSA9IC9eMGJbMDFdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc09jdGFsID0gL14wb1swLTddKyQvaTtcblxuLyoqIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHdpdGhvdXQgYSBkZXBlbmRlbmN5IG9uIGByb290YC4gKi9cbnZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIEdldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IGhhdmUgZWxhcHNlZCBzaW5jZVxuICogdGhlIFVuaXggZXBvY2ggKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IERhdGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVzdGFtcC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBMb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBpbnZvY2F0aW9uLlxuICovXG52YXIgbm93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiByb290LkRhdGUubm93KCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGhyb3R0bGVkIGZ1bmN0aW9uIHRoYXQgb25seSBpbnZva2VzIGBmdW5jYCBhdCBtb3N0IG9uY2UgcGVyXG4gKiBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBUaGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYFxuICogbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0b1xuICogaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgXG4gKiB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlXG4gKiB0aHJvdHRsZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiByZXR1cm4gdGhlXG4gKiByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8udGhyb3R0bGVgIGFuZCBgXy5kZWJvdW5jZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBpbnZvY2F0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmcuXG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKSk7XG4gKlxuICogLy8gSW52b2tlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXMuXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHsgJ3RyYWlsaW5nJzogZmFsc2UgfSk7XG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIHRocm90dGxlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhyb3R0bGVkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCB7XG4gICAgJ2xlYWRpbmcnOiBsZWFkaW5nLFxuICAgICdtYXhXYWl0Jzogd2FpdCxcbiAgICAndHJhaWxpbmcnOiB0cmFpbGluZ1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByYW5nZTsgLy8gQ3JlYXRlIGEgcmFuZ2Ugb2JqZWN0IGZvciBlZmZpY2VudGx5IHJlbmRlcmluZyBzdHJpbmdzIHRvIGVsZW1lbnRzLlxudmFyIE5TX1hIVE1MID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnO1xuXG52YXIgZG9jID0gdHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IGRvY3VtZW50O1xuXG52YXIgdGVzdEVsID0gZG9jID9cbiAgICBkb2MuYm9keSB8fCBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JykgOlxuICAgIHt9O1xuXG4vLyBGaXhlcyA8aHR0cHM6Ly9naXRodWIuY29tL3BhdHJpY2stc3RlZWxlLWlkZW0vbW9ycGhkb20vaXNzdWVzLzMyPlxuLy8gKElFNysgc3VwcG9ydCkgPD1JRTcgZG9lcyBub3Qgc3VwcG9ydCBlbC5oYXNBdHRyaWJ1dGUobmFtZSlcbnZhciBhY3R1YWxIYXNBdHRyaWJ1dGVOUztcblxuaWYgKHRlc3RFbC5oYXNBdHRyaWJ1dGVOUykge1xuICAgIGFjdHVhbEhhc0F0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWwsIG5hbWVzcGFjZVVSSSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZWwuaGFzQXR0cmlidXRlTlMobmFtZXNwYWNlVVJJLCBuYW1lKTtcbiAgICB9O1xufSBlbHNlIGlmICh0ZXN0RWwuaGFzQXR0cmlidXRlKSB7XG4gICAgYWN0dWFsSGFzQXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbCwgbmFtZXNwYWNlVVJJLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBlbC5oYXNBdHRyaWJ1dGUobmFtZSk7XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgYWN0dWFsSGFzQXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbCwgbmFtZXNwYWNlVVJJLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBlbC5nZXRBdHRyaWJ1dGVOb2RlKG5hbWVzcGFjZVVSSSwgbmFtZSkgIT0gbnVsbDtcbiAgICB9O1xufVxuXG52YXIgaGFzQXR0cmlidXRlTlMgPSBhY3R1YWxIYXNBdHRyaWJ1dGVOUztcblxuXG5mdW5jdGlvbiB0b0VsZW1lbnQoc3RyKSB7XG4gICAgaWYgKCFyYW5nZSAmJiBkb2MuY3JlYXRlUmFuZ2UpIHtcbiAgICAgICAgcmFuZ2UgPSBkb2MuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2MuYm9keSk7XG4gICAgfVxuXG4gICAgdmFyIGZyYWdtZW50O1xuICAgIGlmIChyYW5nZSAmJiByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQpIHtcbiAgICAgICAgZnJhZ21lbnQgPSByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoc3RyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmcmFnbWVudCA9IGRvYy5jcmVhdGVFbGVtZW50KCdib2R5Jyk7XG4gICAgICAgIGZyYWdtZW50LmlubmVySFRNTCA9IHN0cjtcbiAgICB9XG4gICAgcmV0dXJuIGZyYWdtZW50LmNoaWxkTm9kZXNbMF07XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHR3byBub2RlJ3MgbmFtZXMgYXJlIHRoZSBzYW1lLlxuICpcbiAqIE5PVEU6IFdlIGRvbid0IGJvdGhlciBjaGVja2luZyBgbmFtZXNwYWNlVVJJYCBiZWNhdXNlIHlvdSB3aWxsIG5ldmVyIGZpbmQgdHdvIEhUTUwgZWxlbWVudHMgd2l0aCB0aGUgc2FtZVxuICogICAgICAgbm9kZU5hbWUgYW5kIGRpZmZlcmVudCBuYW1lc3BhY2UgVVJJcy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGFcbiAqIEBwYXJhbSB7RWxlbWVudH0gYiBUaGUgdGFyZ2V0IGVsZW1lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVOb2RlTmFtZXMoZnJvbUVsLCB0b0VsKSB7XG4gICAgdmFyIGZyb21Ob2RlTmFtZSA9IGZyb21FbC5ub2RlTmFtZTtcbiAgICB2YXIgdG9Ob2RlTmFtZSA9IHRvRWwubm9kZU5hbWU7XG5cbiAgICBpZiAoZnJvbU5vZGVOYW1lID09PSB0b05vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0b0VsLmFjdHVhbGl6ZSAmJlxuICAgICAgICBmcm9tTm9kZU5hbWUuY2hhckNvZGVBdCgwKSA8IDkxICYmIC8qIGZyb20gdGFnIG5hbWUgaXMgdXBwZXIgY2FzZSAqL1xuICAgICAgICB0b05vZGVOYW1lLmNoYXJDb2RlQXQoMCkgPiA5MCAvKiB0YXJnZXQgdGFnIG5hbWUgaXMgbG93ZXIgY2FzZSAqLykge1xuICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgYSB2aXJ0dWFsIERPTSBub2RlIHRoZW4gd2UgbWF5IG5lZWQgdG8gbm9ybWFsaXplIHRoZSB0YWcgbmFtZVxuICAgICAgICAvLyBiZWZvcmUgY29tcGFyaW5nLiBOb3JtYWwgSFRNTCBlbGVtZW50cyB0aGF0IGFyZSBpbiB0aGUgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCJcbiAgICAgICAgLy8gYXJlIGNvbnZlcnRlZCB0byB1cHBlciBjYXNlXG4gICAgICAgIHJldHVybiBmcm9tTm9kZU5hbWUgPT09IHRvTm9kZU5hbWUudG9VcHBlckNhc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBlbGVtZW50LCBvcHRpb25hbGx5IHdpdGggYSBrbm93biBuYW1lc3BhY2UgVVJJLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBlbGVtZW50IG5hbWUsIGUuZy4gJ2Rpdicgb3IgJ3N2ZydcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZXNwYWNlVVJJXSB0aGUgZWxlbWVudCdzIG5hbWVzcGFjZSBVUkksIGkuZS4gdGhlIHZhbHVlIG9mXG4gKiBpdHMgYHhtbG5zYCBhdHRyaWJ1dGUgb3IgaXRzIGluZmVycmVkIG5hbWVzcGFjZS5cbiAqXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxuICovXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50TlMobmFtZSwgbmFtZXNwYWNlVVJJKSB7XG4gICAgcmV0dXJuICFuYW1lc3BhY2VVUkkgfHwgbmFtZXNwYWNlVVJJID09PSBOU19YSFRNTCA/XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50KG5hbWUpIDpcbiAgICAgICAgZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIG5hbWUpO1xufVxuXG4vKipcbiAqIENvcGllcyB0aGUgY2hpbGRyZW4gb2Ygb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIgRE9NIGVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gbW92ZUNoaWxkcmVuKGZyb21FbCwgdG9FbCkge1xuICAgIHZhciBjdXJDaGlsZCA9IGZyb21FbC5maXJzdENoaWxkO1xuICAgIHdoaWxlIChjdXJDaGlsZCkge1xuICAgICAgICB2YXIgbmV4dENoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgIHRvRWwuYXBwZW5kQ2hpbGQoY3VyQ2hpbGQpO1xuICAgICAgICBjdXJDaGlsZCA9IG5leHRDaGlsZDtcbiAgICB9XG4gICAgcmV0dXJuIHRvRWw7XG59XG5cbmZ1bmN0aW9uIG1vcnBoQXR0cnMoZnJvbU5vZGUsIHRvTm9kZSkge1xuICAgIHZhciBhdHRycyA9IHRvTm9kZS5hdHRyaWJ1dGVzO1xuICAgIHZhciBpO1xuICAgIHZhciBhdHRyO1xuICAgIHZhciBhdHRyTmFtZTtcbiAgICB2YXIgYXR0ck5hbWVzcGFjZVVSSTtcbiAgICB2YXIgYXR0clZhbHVlO1xuICAgIHZhciBmcm9tVmFsdWU7XG5cbiAgICBmb3IgKGkgPSBhdHRycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBhdHRyID0gYXR0cnNbaV07XG4gICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lO1xuICAgICAgICBhdHRyTmFtZXNwYWNlVVJJID0gYXR0ci5uYW1lc3BhY2VVUkk7XG4gICAgICAgIGF0dHJWYWx1ZSA9IGF0dHIudmFsdWU7XG5cbiAgICAgICAgaWYgKGF0dHJOYW1lc3BhY2VVUkkpIHtcbiAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5sb2NhbE5hbWUgfHwgYXR0ck5hbWU7XG4gICAgICAgICAgICBmcm9tVmFsdWUgPSBmcm9tTm9kZS5nZXRBdHRyaWJ1dGVOUyhhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChmcm9tVmFsdWUgIT09IGF0dHJWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGZyb21Ob2RlLnNldEF0dHJpYnV0ZU5TKGF0dHJOYW1lc3BhY2VVUkksIGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJvbVZhbHVlID0gZnJvbU5vZGUuZ2V0QXR0cmlidXRlKGF0dHJOYW1lKTtcblxuICAgICAgICAgICAgaWYgKGZyb21WYWx1ZSAhPT0gYXR0clZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZnJvbU5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGFueSBleHRyYSBhdHRyaWJ1dGVzIGZvdW5kIG9uIHRoZSBvcmlnaW5hbCBET00gZWxlbWVudCB0aGF0XG4gICAgLy8gd2VyZW4ndCBmb3VuZCBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAgYXR0cnMgPSBmcm9tTm9kZS5hdHRyaWJ1dGVzO1xuXG4gICAgZm9yIChpID0gYXR0cnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgYXR0ciA9IGF0dHJzW2ldO1xuICAgICAgICBpZiAoYXR0ci5zcGVjaWZpZWQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubmFtZTtcbiAgICAgICAgICAgIGF0dHJOYW1lc3BhY2VVUkkgPSBhdHRyLm5hbWVzcGFjZVVSSTtcblxuICAgICAgICAgICAgaWYgKGF0dHJOYW1lc3BhY2VVUkkpIHtcbiAgICAgICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubG9jYWxOYW1lIHx8IGF0dHJOYW1lO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFoYXNBdHRyaWJ1dGVOUyh0b05vZGUsIGF0dHJOYW1lc3BhY2VVUkksIGF0dHJOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tTm9kZS5yZW1vdmVBdHRyaWJ1dGVOUyhhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc0F0dHJpYnV0ZU5TKHRvTm9kZSwgbnVsbCwgYXR0ck5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzeW5jQm9vbGVhbkF0dHJQcm9wKGZyb21FbCwgdG9FbCwgbmFtZSkge1xuICAgIGlmIChmcm9tRWxbbmFtZV0gIT09IHRvRWxbbmFtZV0pIHtcbiAgICAgICAgZnJvbUVsW25hbWVdID0gdG9FbFtuYW1lXTtcbiAgICAgICAgaWYgKGZyb21FbFtuYW1lXSkge1xuICAgICAgICAgICAgZnJvbUVsLnNldEF0dHJpYnV0ZShuYW1lLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcm9tRWwucmVtb3ZlQXR0cmlidXRlKG5hbWUsICcnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxudmFyIHNwZWNpYWxFbEhhbmRsZXJzID0ge1xuICAgIC8qKlxuICAgICAqIE5lZWRlZCBmb3IgSUUuIEFwcGFyZW50bHkgSUUgZG9lc24ndCB0aGluayB0aGF0IFwic2VsZWN0ZWRcIiBpcyBhblxuICAgICAqIGF0dHJpYnV0ZSB3aGVuIHJlYWRpbmcgb3ZlciB0aGUgYXR0cmlidXRlcyB1c2luZyBzZWxlY3RFbC5hdHRyaWJ1dGVzXG4gICAgICovXG4gICAgT1BUSU9OOiBmdW5jdGlvbihmcm9tRWwsIHRvRWwpIHtcbiAgICAgICAgc3luY0Jvb2xlYW5BdHRyUHJvcChmcm9tRWwsIHRvRWwsICdzZWxlY3RlZCcpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIFwidmFsdWVcIiBhdHRyaWJ1dGUgaXMgc3BlY2lhbCBmb3IgdGhlIDxpbnB1dD4gZWxlbWVudCBzaW5jZSBpdCBzZXRzXG4gICAgICogdGhlIGluaXRpYWwgdmFsdWUuIENoYW5naW5nIHRoZSBcInZhbHVlXCIgYXR0cmlidXRlIHdpdGhvdXQgY2hhbmdpbmcgdGhlXG4gICAgICogXCJ2YWx1ZVwiIHByb3BlcnR5IHdpbGwgaGF2ZSBubyBlZmZlY3Qgc2luY2UgaXQgaXMgb25seSB1c2VkIHRvIHRoZSBzZXQgdGhlXG4gICAgICogaW5pdGlhbCB2YWx1ZS4gIFNpbWlsYXIgZm9yIHRoZSBcImNoZWNrZWRcIiBhdHRyaWJ1dGUsIGFuZCBcImRpc2FibGVkXCIuXG4gICAgICovXG4gICAgSU5QVVQ6IGZ1bmN0aW9uKGZyb21FbCwgdG9FbCkge1xuICAgICAgICBzeW5jQm9vbGVhbkF0dHJQcm9wKGZyb21FbCwgdG9FbCwgJ2NoZWNrZWQnKTtcbiAgICAgICAgc3luY0Jvb2xlYW5BdHRyUHJvcChmcm9tRWwsIHRvRWwsICdkaXNhYmxlZCcpO1xuXG4gICAgICAgIGlmIChmcm9tRWwudmFsdWUgIT09IHRvRWwudmFsdWUpIHtcbiAgICAgICAgICAgIGZyb21FbC52YWx1ZSA9IHRvRWwudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc0F0dHJpYnV0ZU5TKHRvRWwsIG51bGwsICd2YWx1ZScpKSB7XG4gICAgICAgICAgICBmcm9tRWwucmVtb3ZlQXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIFRFWFRBUkVBOiBmdW5jdGlvbihmcm9tRWwsIHRvRWwpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gdG9FbC52YWx1ZTtcbiAgICAgICAgaWYgKGZyb21FbC52YWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIGZyb21FbC52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcnN0Q2hpbGQgPSBmcm9tRWwuZmlyc3RDaGlsZDtcbiAgICAgICAgaWYgKGZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIC8vIE5lZWRlZCBmb3IgSUUuIEFwcGFyZW50bHkgSUUgc2V0cyB0aGUgcGxhY2Vob2xkZXIgYXMgdGhlXG4gICAgICAgICAgICAvLyBub2RlIHZhbHVlIGFuZCB2aXNlIHZlcnNhLiBUaGlzIGlnbm9yZXMgYW4gZW1wdHkgdXBkYXRlLlxuICAgICAgICAgICAgdmFyIG9sZFZhbHVlID0gZmlyc3RDaGlsZC5ub2RlVmFsdWU7XG5cbiAgICAgICAgICAgIGlmIChvbGRWYWx1ZSA9PSBuZXdWYWx1ZSB8fCAoIW5ld1ZhbHVlICYmIG9sZFZhbHVlID09IGZyb21FbC5wbGFjZWhvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZpcnN0Q2hpbGQubm9kZVZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFNFTEVDVDogZnVuY3Rpb24oZnJvbUVsLCB0b0VsKSB7XG4gICAgICAgIGlmICghaGFzQXR0cmlidXRlTlModG9FbCwgbnVsbCwgJ211bHRpcGxlJykpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICB2YXIgY3VyQ2hpbGQgPSB0b0VsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICB3aGlsZShjdXJDaGlsZCkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlTmFtZSA9IGN1ckNoaWxkLm5vZGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmIChub2RlTmFtZSAmJiBub2RlTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnT1BUSU9OJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQXR0cmlidXRlTlMoY3VyQ2hpbGQsIG51bGwsICdzZWxlY3RlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VyQ2hpbGQgPSBjdXJDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnJvbUVsLnNlbGVjdGVkSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxudmFyIEVMRU1FTlRfTk9ERSA9IDE7XG52YXIgVEVYVF9OT0RFID0gMztcbnZhciBDT01NRU5UX05PREUgPSA4O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gZGVmYXVsdEdldE5vZGVLZXkobm9kZSkge1xuICAgIHJldHVybiBub2RlLmlkO1xufVxuXG5mdW5jdGlvbiBtb3JwaGRvbUZhY3RvcnkobW9ycGhBdHRycykge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG1vcnBoZG9tKGZyb21Ob2RlLCB0b05vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHRvTm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmIChmcm9tTm9kZS5ub2RlTmFtZSA9PT0gJyNkb2N1bWVudCcgfHwgZnJvbU5vZGUubm9kZU5hbWUgPT09ICdIVE1MJykge1xuICAgICAgICAgICAgICAgIHZhciB0b05vZGVIdG1sID0gdG9Ob2RlO1xuICAgICAgICAgICAgICAgIHRvTm9kZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgICAgICAgICAgICAgdG9Ob2RlLmlubmVySFRNTCA9IHRvTm9kZUh0bWw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvTm9kZSA9IHRvRWxlbWVudCh0b05vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdldE5vZGVLZXkgPSBvcHRpb25zLmdldE5vZGVLZXkgfHwgZGVmYXVsdEdldE5vZGVLZXk7XG4gICAgICAgIHZhciBvbkJlZm9yZU5vZGVBZGRlZCA9IG9wdGlvbnMub25CZWZvcmVOb2RlQWRkZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIG9uTm9kZUFkZGVkID0gb3B0aW9ucy5vbk5vZGVBZGRlZCB8fCBub29wO1xuICAgICAgICB2YXIgb25CZWZvcmVFbFVwZGF0ZWQgPSBvcHRpb25zLm9uQmVmb3JlRWxVcGRhdGVkIHx8IG5vb3A7XG4gICAgICAgIHZhciBvbkVsVXBkYXRlZCA9IG9wdGlvbnMub25FbFVwZGF0ZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIG9uQmVmb3JlTm9kZURpc2NhcmRlZCA9IG9wdGlvbnMub25CZWZvcmVOb2RlRGlzY2FyZGVkIHx8IG5vb3A7XG4gICAgICAgIHZhciBvbk5vZGVEaXNjYXJkZWQgPSBvcHRpb25zLm9uTm9kZURpc2NhcmRlZCB8fCBub29wO1xuICAgICAgICB2YXIgb25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZCA9IG9wdGlvbnMub25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZCB8fCBub29wO1xuICAgICAgICB2YXIgY2hpbGRyZW5Pbmx5ID0gb3B0aW9ucy5jaGlsZHJlbk9ubHkgPT09IHRydWU7XG5cbiAgICAgICAgLy8gVGhpcyBvYmplY3QgaXMgdXNlZCBhcyBhIGxvb2t1cCB0byBxdWlja2x5IGZpbmQgYWxsIGtleWVkIGVsZW1lbnRzIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZS5cbiAgICAgICAgdmFyIGZyb21Ob2Rlc0xvb2t1cCA9IHt9O1xuICAgICAgICB2YXIga2V5ZWRSZW1vdmFsTGlzdDtcblxuICAgICAgICBmdW5jdGlvbiBhZGRLZXllZFJlbW92YWwoa2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5ZWRSZW1vdmFsTGlzdCkge1xuICAgICAgICAgICAgICAgIGtleWVkUmVtb3ZhbExpc3QucHVzaChrZXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXllZFJlbW92YWxMaXN0ID0gW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB3YWxrRGlzY2FyZGVkQ2hpbGROb2Rlcyhub2RlLCBza2lwS2V5ZWROb2Rlcykge1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJDaGlsZCA9IG5vZGUuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VyQ2hpbGQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChza2lwS2V5ZWROb2RlcyAmJiAoa2V5ID0gZ2V0Tm9kZUtleShjdXJDaGlsZCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBhcmUgc2tpcHBpbmcga2V5ZWQgbm9kZXMgdGhlbiB3ZSBhZGQgdGhlIGtleVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gYSBsaXN0IHNvIHRoYXQgaXQgY2FuIGJlIGhhbmRsZWQgYXQgdGhlIHZlcnkgZW5kLlxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkS2V5ZWRSZW1vdmFsKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IHJlcG9ydCB0aGUgbm9kZSBhcyBkaXNjYXJkZWQgaWYgaXQgaXMgbm90IGtleWVkLiBXZSBkbyB0aGlzIGJlY2F1c2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF0IHRoZSBlbmQgd2UgbG9vcCB0aHJvdWdoIGFsbCBrZXllZCBlbGVtZW50cyB0aGF0IHdlcmUgdW5tYXRjaGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgdGhlbiBkaXNjYXJkIHRoZW0gaW4gb25lIGZpbmFsIHBhc3MuXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk5vZGVEaXNjYXJkZWQoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckNoaWxkLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWxrRGlzY2FyZGVkQ2hpbGROb2RlcyhjdXJDaGlsZCwgc2tpcEtleWVkTm9kZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY3VyQ2hpbGQgPSBjdXJDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBhIERPTSBub2RlIG91dCBvZiB0aGUgb3JpZ2luYWwgRE9NXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge05vZGV9IG5vZGUgVGhlIG5vZGUgdG8gcmVtb3ZlXG4gICAgICAgICAqIEBwYXJhbSAge05vZGV9IHBhcmVudE5vZGUgVGhlIG5vZGVzIHBhcmVudFxuICAgICAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBza2lwS2V5ZWROb2RlcyBJZiB0cnVlIHRoZW4gZWxlbWVudHMgd2l0aCBrZXlzIHdpbGwgYmUgc2tpcHBlZCBhbmQgbm90IGRpc2NhcmRlZC5cbiAgICAgICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlLCBwYXJlbnROb2RlLCBza2lwS2V5ZWROb2Rlcykge1xuICAgICAgICAgICAgaWYgKG9uQmVmb3JlTm9kZURpc2NhcmRlZChub2RlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKG5vZGUpO1xuICAgICAgICAgICAgd2Fsa0Rpc2NhcmRlZENoaWxkTm9kZXMobm9kZSwgc2tpcEtleWVkTm9kZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gLy8gVHJlZVdhbGtlciBpbXBsZW1lbnRhdGlvbiBpcyBubyBmYXN0ZXIsIGJ1dCBrZWVwaW5nIHRoaXMgYXJvdW5kIGluIGNhc2UgdGhpcyBjaGFuZ2VzIGluIHRoZSBmdXR1cmVcbiAgICAgICAgLy8gZnVuY3Rpb24gaW5kZXhUcmVlKHJvb3QpIHtcbiAgICAgICAgLy8gICAgIHZhciB0cmVlV2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihcbiAgICAgICAgLy8gICAgICAgICByb290LFxuICAgICAgICAvLyAgICAgICAgIE5vZGVGaWx0ZXIuU0hPV19FTEVNRU5UKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIHZhciBlbDtcbiAgICAgICAgLy8gICAgIHdoaWxlKChlbCA9IHRyZWVXYWxrZXIubmV4dE5vZGUoKSkpIHtcbiAgICAgICAgLy8gICAgICAgICB2YXIga2V5ID0gZ2V0Tm9kZUtleShlbCk7XG4gICAgICAgIC8vICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAvLyAgICAgICAgICAgICBmcm9tTm9kZXNMb29rdXBba2V5XSA9IGVsO1xuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIC8vIE5vZGVJdGVyYXRvciBpbXBsZW1lbnRhdGlvbiBpcyBubyBmYXN0ZXIsIGJ1dCBrZWVwaW5nIHRoaXMgYXJvdW5kIGluIGNhc2UgdGhpcyBjaGFuZ2VzIGluIHRoZSBmdXR1cmVcbiAgICAgICAgLy9cbiAgICAgICAgLy8gZnVuY3Rpb24gaW5kZXhUcmVlKG5vZGUpIHtcbiAgICAgICAgLy8gICAgIHZhciBub2RlSXRlcmF0b3IgPSBkb2N1bWVudC5jcmVhdGVOb2RlSXRlcmF0b3Iobm9kZSwgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQpO1xuICAgICAgICAvLyAgICAgdmFyIGVsO1xuICAgICAgICAvLyAgICAgd2hpbGUoKGVsID0gbm9kZUl0ZXJhdG9yLm5leHROb2RlKCkpKSB7XG4gICAgICAgIC8vICAgICAgICAgdmFyIGtleSA9IGdldE5vZGVLZXkoZWwpO1xuICAgICAgICAvLyAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgZnJvbU5vZGVzTG9va3VwW2tleV0gPSBlbDtcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICBmdW5jdGlvbiBpbmRleFRyZWUobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJDaGlsZCA9IG5vZGUuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VyQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGdldE5vZGVLZXkoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tTm9kZXNMb29rdXBba2V5XSA9IGN1ckNoaWxkO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gV2FsayByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICBpbmRleFRyZWUoY3VyQ2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW5kZXhUcmVlKGZyb21Ob2RlKTtcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVOb2RlQWRkZWQoZWwpIHtcbiAgICAgICAgICAgIG9uTm9kZUFkZGVkKGVsKTtcblxuICAgICAgICAgICAgdmFyIGN1ckNoaWxkID0gZWwuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIHdoaWxlIChjdXJDaGlsZCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0U2libGluZyA9IGN1ckNoaWxkLm5leHRTaWJsaW5nO1xuXG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGdldE5vZGVLZXkoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVubWF0Y2hlZEZyb21FbCA9IGZyb21Ob2Rlc0xvb2t1cFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodW5tYXRjaGVkRnJvbUVsICYmIGNvbXBhcmVOb2RlTmFtZXMoY3VyQ2hpbGQsIHVubWF0Y2hlZEZyb21FbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckNoaWxkLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHVubWF0Y2hlZEZyb21FbCwgY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9ycGhFbCh1bm1hdGNoZWRGcm9tRWwsIGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhhbmRsZU5vZGVBZGRlZChjdXJDaGlsZCk7XG4gICAgICAgICAgICAgICAgY3VyQ2hpbGQgPSBuZXh0U2libGluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vcnBoRWwoZnJvbUVsLCB0b0VsLCBjaGlsZHJlbk9ubHkpIHtcbiAgICAgICAgICAgIHZhciB0b0VsS2V5ID0gZ2V0Tm9kZUtleSh0b0VsKTtcbiAgICAgICAgICAgIHZhciBjdXJGcm9tTm9kZUtleTtcblxuICAgICAgICAgICAgaWYgKHRvRWxLZXkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBhbiBlbGVtZW50IHdpdGggYW4gSUQgaXMgYmVpbmcgbW9ycGhlZCB0aGVuIGl0IGlzIHdpbGwgYmUgaW4gdGhlIGZpbmFsXG4gICAgICAgICAgICAgICAgLy8gRE9NIHNvIGNsZWFyIGl0IG91dCBvZiB0aGUgc2F2ZWQgZWxlbWVudHMgY29sbGVjdGlvblxuICAgICAgICAgICAgICAgIGRlbGV0ZSBmcm9tTm9kZXNMb29rdXBbdG9FbEtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0b05vZGUuaXNTYW1lTm9kZSAmJiB0b05vZGUuaXNTYW1lTm9kZShmcm9tTm9kZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghY2hpbGRyZW5Pbmx5KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9uQmVmb3JlRWxVcGRhdGVkKGZyb21FbCwgdG9FbCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtb3JwaEF0dHJzKGZyb21FbCwgdG9FbCk7XG4gICAgICAgICAgICAgICAgb25FbFVwZGF0ZWQoZnJvbUVsKTtcblxuICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZUVsQ2hpbGRyZW5VcGRhdGVkKGZyb21FbCwgdG9FbCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmcm9tRWwubm9kZU5hbWUgIT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyVG9Ob2RlQ2hpbGQgPSB0b0VsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgdmFyIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tRWwuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgICAgICB2YXIgY3VyVG9Ob2RlS2V5O1xuXG4gICAgICAgICAgICAgICAgdmFyIGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB2YXIgdG9OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hpbmdGcm9tRWw7XG5cbiAgICAgICAgICAgICAgICBvdXRlcjogd2hpbGUgKGN1clRvTm9kZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvTmV4dFNpYmxpbmcgPSBjdXJUb05vZGVDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlS2V5ID0gZ2V0Tm9kZUtleShjdXJUb05vZGVDaGlsZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1ckZyb21Ob2RlQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb21OZXh0U2libGluZyA9IGN1ckZyb21Ob2RlQ2hpbGQubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVDaGlsZC5pc1NhbWVOb2RlICYmIGN1clRvTm9kZUNoaWxkLmlzU2FtZU5vZGUoY3VyRnJvbU5vZGVDaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJUb05vZGVDaGlsZCA9IHRvTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBvdXRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVLZXkgPSBnZXROb2RlS2V5KGN1ckZyb21Ob2RlQ2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VyRnJvbU5vZGVUeXBlID0gY3VyRnJvbU5vZGVDaGlsZC5ub2RlVHlwZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlzQ29tcGF0aWJsZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlVHlwZSA9PT0gY3VyVG9Ob2RlQ2hpbGQubm9kZVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyRnJvbU5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQm90aCBub2RlcyBiZWluZyBjb21wYXJlZCBhcmUgRWxlbWVudCBub2Rlc1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSB0YXJnZXQgbm9kZSBoYXMgYSBrZXkgc28gd2Ugd2FudCB0byBtYXRjaCBpdCB1cCB3aXRoIHRoZSBjb3JyZWN0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1clRvTm9kZUtleSAhPT0gY3VyRnJvbU5vZGVLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY3VycmVudCBlbGVtZW50IGluIHRoZSBvcmlnaW5hbCBET00gdHJlZSBkb2VzIG5vdCBoYXZlIGEgbWF0Y2hpbmcga2V5IHNvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGV0J3MgY2hlY2sgb3VyIGxvb2t1cCB0byBzZWUgaWYgdGhlcmUgaXMgYSBtYXRjaGluZyBlbGVtZW50IGluIHRoZSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERPTSB0cmVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChtYXRjaGluZ0Zyb21FbCA9IGZyb21Ob2Rlc0xvb2t1cFtjdXJUb05vZGVLZXldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyRnJvbU5vZGVDaGlsZC5uZXh0U2libGluZyA9PT0gbWF0Y2hpbmdGcm9tRWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZSBmb3Igc2luZ2xlIGVsZW1lbnQgcmVtb3ZhbHMuIFRvIGF2b2lkIHJlbW92aW5nIHRoZSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRE9NIG5vZGUgb3V0IG9mIHRoZSB0cmVlIChzaW5jZSB0aGF0IGNhbiBicmVhayBDU1MgdHJhbnNpdGlvbnMsIGV0Yy4pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Ugd2lsbCBpbnN0ZWFkIGRpc2NhcmQgdGhlIGN1cnJlbnQgbm9kZSBhbmQgd2FpdCB1bnRpbCB0aGUgbmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXRlcmF0aW9uIHRvIHByb3Blcmx5IG1hdGNoIHVwIHRoZSBrZXllZCB0YXJnZXQgZWxlbWVudCB3aXRoIGl0cyBtYXRjaGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxlbWVudCBpbiB0aGUgb3JpZ2luYWwgdHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBmb3VuZCBhIG1hdGNoaW5nIGtleWVkIGVsZW1lbnQgc29tZXdoZXJlIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExldCdzIG1vdmluZyB0aGUgb3JpZ2luYWwgRE9NIG5vZGUgaW50byB0aGUgY3VycmVudCBwb3NpdGlvbiBhbmQgbW9ycGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0LlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBXZSB1c2UgaW5zZXJ0QmVmb3JlIGluc3RlYWQgb2YgcmVwbGFjZUNoaWxkIGJlY2F1c2Ugd2Ugd2FudCB0byBnbyB0aHJvdWdoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgYHJlbW92ZU5vZGUoKWAgZnVuY3Rpb24gZm9yIHRoZSBub2RlIHRoYXQgaXMgYmVpbmcgZGlzY2FyZGVkIHNvIHRoYXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFsbCBsaWZlY3ljbGUgaG9va3MgYXJlIGNvcnJlY3RseSBpbnZva2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tRWwuaW5zZXJ0QmVmb3JlKG1hdGNoaW5nRnJvbUVsLCBjdXJGcm9tTm9kZUNoaWxkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbU5leHRTaWJsaW5nID0gY3VyRnJvbU5vZGVDaGlsZC5uZXh0U2libGluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgdGhlIG5vZGUgaXMga2V5ZWQgaXQgbWlnaHQgYmUgbWF0Y2hlZCB1cCBsYXRlciBzbyB3ZSBkZWZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgcmVtb3ZhbCB0byBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEtleWVkUmVtb3ZhbChjdXJGcm9tTm9kZUtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIHNraXAgbmVzdGVkIGtleWVkIG5vZGVzIGZyb20gYmVpbmcgcmVtb3ZlZCBzaW5jZSB0aGVyZSBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHN0aWxsIGEgY2hhbmNlIHRoZXkgd2lsbCBiZSBtYXRjaGVkIHVwIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTm9kZShjdXJGcm9tTm9kZUNoaWxkLCBmcm9tRWwsIHRydWUgLyogc2tpcCBrZXllZCBub2RlcyAqLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBtYXRjaGluZ0Zyb21FbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBub2RlcyBhcmUgbm90IGNvbXBhdGlibGUgc2luY2UgdGhlIFwidG9cIiBub2RlIGhhcyBhIGtleSBhbmQgdGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXMgbm8gbWF0Y2hpbmcga2V5ZWQgbm9kZSBpbiB0aGUgc291cmNlIHRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgb3JpZ2luYWwgaGFzIGEga2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NvbXBhdGlibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IGlzQ29tcGF0aWJsZSAhPT0gZmFsc2UgJiYgY29tcGFyZU5vZGVOYW1lcyhjdXJGcm9tTm9kZUNoaWxkLCBjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0NvbXBhdGlibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGZvdW5kIGNvbXBhdGlibGUgRE9NIGVsZW1lbnRzIHNvIHRyYW5zZm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgXCJmcm9tXCIgbm9kZSB0byBtYXRjaCB0aGUgY3VycmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGFyZ2V0IERPTSBub2RlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9ycGhFbChjdXJGcm9tTm9kZUNoaWxkLCBjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VyRnJvbU5vZGVUeXBlID09PSBURVhUX05PREUgfHwgY3VyRnJvbU5vZGVUeXBlID09IENPTU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCb3RoIG5vZGVzIGJlaW5nIGNvbXBhcmVkIGFyZSBUZXh0IG9yIENvbW1lbnQgbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2ltcGx5IHVwZGF0ZSBub2RlVmFsdWUgb24gdGhlIG9yaWdpbmFsIG5vZGUgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIHRoZSB0ZXh0IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQubm9kZVZhbHVlID0gY3VyVG9Ob2RlQ2hpbGQubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ29tcGF0aWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgYm90aCB0aGUgXCJ0b1wiIGNoaWxkIGFuZCB0aGUgXCJmcm9tXCIgY2hpbGQgc2luY2Ugd2UgZm91bmQgYSBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gdG9OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJGcm9tTm9kZUNoaWxkID0gZnJvbU5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIG91dGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBObyBjb21wYXRpYmxlIG1hdGNoIHNvIHJlbW92ZSB0aGUgb2xkIG5vZGUgZnJvbSB0aGUgRE9NIGFuZCBjb250aW51ZSB0cnlpbmcgdG8gZmluZCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaCBpbiB0aGUgb3JpZ2luYWwgRE9NLiBIb3dldmVyLCB3ZSBvbmx5IGRvIHRoaXMgaWYgdGhlIGZyb20gbm9kZSBpcyBub3Qga2V5ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIGl0IGlzIHBvc3NpYmxlIHRoYXQgYSBrZXllZCBub2RlIG1pZ2h0IG1hdGNoIHVwIHdpdGggYSBub2RlIHNvbWV3aGVyZSBlbHNlIGluIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGFyZ2V0IHRyZWUgYW5kIHdlIGRvbid0IHdhbnQgdG8gZGlzY2FyZCBpdCBqdXN0IHlldCBzaW5jZSBpdCBzdGlsbCBtaWdodCBmaW5kIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhvbWUgaW4gdGhlIGZpbmFsIERPTSB0cmVlLiBBZnRlciBldmVyeXRoaW5nIGlzIGRvbmUgd2Ugd2lsbCByZW1vdmUgYW55IGtleWVkIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGF0IGRpZG4ndCBmaW5kIGEgaG9tZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgdGhlIG5vZGUgaXMga2V5ZWQgaXQgbWlnaHQgYmUgbWF0Y2hlZCB1cCBsYXRlciBzbyB3ZSBkZWZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgcmVtb3ZhbCB0byBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEtleWVkUmVtb3ZhbChjdXJGcm9tTm9kZUtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIHNraXAgbmVzdGVkIGtleWVkIG5vZGVzIGZyb20gYmVpbmcgcmVtb3ZlZCBzaW5jZSB0aGVyZSBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHN0aWxsIGEgY2hhbmNlIHRoZXkgd2lsbCBiZSBtYXRjaGVkIHVwIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTm9kZShjdXJGcm9tTm9kZUNoaWxkLCBmcm9tRWwsIHRydWUgLyogc2tpcCBrZXllZCBub2RlcyAqLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBnb3QgdGhpcyBmYXIgdGhlbiB3ZSBkaWQgbm90IGZpbmQgYSBjYW5kaWRhdGUgbWF0Y2ggZm9yXG4gICAgICAgICAgICAgICAgICAgIC8vIG91ciBcInRvIG5vZGVcIiBhbmQgd2UgZXhoYXVzdGVkIGFsbCBvZiB0aGUgY2hpbGRyZW4gXCJmcm9tXCJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm9kZXMuIFRoZXJlZm9yZSwgd2Ugd2lsbCBqdXN0IGFwcGVuZCB0aGUgY3VycmVudCBcInRvXCIgbm9kZVxuICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgZW5kXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVLZXkgJiYgKG1hdGNoaW5nRnJvbUVsID0gZnJvbU5vZGVzTG9va3VwW2N1clRvTm9kZUtleV0pICYmIGNvbXBhcmVOb2RlTmFtZXMobWF0Y2hpbmdGcm9tRWwsIGN1clRvTm9kZUNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUVsLmFwcGVuZENoaWxkKG1hdGNoaW5nRnJvbUVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoRWwobWF0Y2hpbmdGcm9tRWwsIGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdCA9IG9uQmVmb3JlTm9kZUFkZGVkKGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob25CZWZvcmVOb2RlQWRkZWRSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSBvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyVG9Ob2RlQ2hpbGQuYWN0dWFsaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gY3VyVG9Ob2RlQ2hpbGQuYWN0dWFsaXplKGZyb21FbC5vd25lckRvY3VtZW50IHx8IGRvYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21FbC5hcHBlbmRDaGlsZChjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlTm9kZUFkZGVkKGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGN1clRvTm9kZUNoaWxkID0gdG9OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHByb2Nlc3NlZCBhbGwgb2YgdGhlIFwidG8gbm9kZXNcIi4gSWYgY3VyRnJvbU5vZGVDaGlsZCBpc1xuICAgICAgICAgICAgICAgIC8vIG5vbi1udWxsIHRoZW4gd2Ugc3RpbGwgaGF2ZSBzb21lIGZyb20gbm9kZXMgbGVmdCBvdmVyIHRoYXQgbmVlZFxuICAgICAgICAgICAgICAgIC8vIHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VyRnJvbU5vZGVDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tTmV4dFNpYmxpbmcgPSBjdXJGcm9tTm9kZUNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGN1ckZyb21Ob2RlS2V5ID0gZ2V0Tm9kZUtleShjdXJGcm9tTm9kZUNoaWxkKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHRoZSBub2RlIGlzIGtleWVkIGl0IG1pZ2h0IGJlIG1hdGNoZWQgdXAgbGF0ZXIgc28gd2UgZGVmZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgcmVtb3ZhbCB0byBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkS2V5ZWRSZW1vdmFsKGN1ckZyb21Ob2RlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIHNraXAgbmVzdGVkIGtleWVkIG5vZGVzIGZyb20gYmVpbmcgcmVtb3ZlZCBzaW5jZSB0aGVyZSBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgc3RpbGwgYSBjaGFuY2UgdGhleSB3aWxsIGJlIG1hdGNoZWQgdXAgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoY3VyRnJvbU5vZGVDaGlsZCwgZnJvbUVsLCB0cnVlIC8qIHNraXAga2V5ZWQgbm9kZXMgKi8pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3BlY2lhbEVsSGFuZGxlciA9IHNwZWNpYWxFbEhhbmRsZXJzW2Zyb21FbC5ub2RlTmFtZV07XG4gICAgICAgICAgICBpZiAoc3BlY2lhbEVsSGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHNwZWNpYWxFbEhhbmRsZXIoZnJvbUVsLCB0b0VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAvLyBFTkQ6IG1vcnBoRWwoLi4uKVxuXG4gICAgICAgIHZhciBtb3JwaGVkTm9kZSA9IGZyb21Ob2RlO1xuICAgICAgICB2YXIgbW9ycGhlZE5vZGVUeXBlID0gbW9ycGhlZE5vZGUubm9kZVR5cGU7XG4gICAgICAgIHZhciB0b05vZGVUeXBlID0gdG9Ob2RlLm5vZGVUeXBlO1xuXG4gICAgICAgIGlmICghY2hpbGRyZW5Pbmx5KSB7XG4gICAgICAgICAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgYXJlIGdpdmVuIHR3byBET00gbm9kZXMgdGhhdCBhcmUgbm90XG4gICAgICAgICAgICAvLyBjb21wYXRpYmxlIChlLmcuIDxkaXY+IC0tPiA8c3Bhbj4gb3IgPGRpdj4gLS0+IFRFWFQpXG4gICAgICAgICAgICBpZiAobW9ycGhlZE5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICBpZiAodG9Ob2RlVHlwZSA9PT0gRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tcGFyZU5vZGVOYW1lcyhmcm9tTm9kZSwgdG9Ob2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKGZyb21Ob2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gbW92ZUNoaWxkcmVuKGZyb21Ob2RlLCBjcmVhdGVFbGVtZW50TlModG9Ob2RlLm5vZGVOYW1lLCB0b05vZGUubmFtZXNwYWNlVVJJKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBHb2luZyBmcm9tIGFuIGVsZW1lbnQgbm9kZSB0byBhIHRleHQgbm9kZVxuICAgICAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZSA9IHRvTm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vcnBoZWROb2RlVHlwZSA9PT0gVEVYVF9OT0RFIHx8IG1vcnBoZWROb2RlVHlwZSA9PT0gQ09NTUVOVF9OT0RFKSB7IC8vIFRleHQgb3IgY29tbWVudCBub2RlXG4gICAgICAgICAgICAgICAgaWYgKHRvTm9kZVR5cGUgPT09IG1vcnBoZWROb2RlVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBtb3JwaGVkTm9kZS5ub2RlVmFsdWUgPSB0b05vZGUubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9ycGhlZE5vZGU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGV4dCBub2RlIHRvIHNvbWV0aGluZyBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gdG9Ob2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb3JwaGVkTm9kZSA9PT0gdG9Ob2RlKSB7XG4gICAgICAgICAgICAvLyBUaGUgXCJ0byBub2RlXCIgd2FzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIFwiZnJvbSBub2RlXCIgc28gd2UgaGFkIHRvXG4gICAgICAgICAgICAvLyB0b3NzIG91dCB0aGUgXCJmcm9tIG5vZGVcIiBhbmQgdXNlIHRoZSBcInRvIG5vZGVcIlxuICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKGZyb21Ob2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vcnBoRWwobW9ycGhlZE5vZGUsIHRvTm9kZSwgY2hpbGRyZW5Pbmx5KTtcblxuICAgICAgICAgICAgLy8gV2Ugbm93IG5lZWQgdG8gbG9vcCBvdmVyIGFueSBrZXllZCBub2RlcyB0aGF0IG1pZ2h0IG5lZWQgdG8gYmVcbiAgICAgICAgICAgIC8vIHJlbW92ZWQuIFdlIG9ubHkgZG8gdGhlIHJlbW92YWwgaWYgd2Uga25vdyB0aGF0IHRoZSBrZXllZCBub2RlXG4gICAgICAgICAgICAvLyBuZXZlciBmb3VuZCBhIG1hdGNoLiBXaGVuIGEga2V5ZWQgbm9kZSBpcyBtYXRjaGVkIHVwIHdlIHJlbW92ZVxuICAgICAgICAgICAgLy8gaXQgb3V0IG9mIGZyb21Ob2Rlc0xvb2t1cCBhbmQgd2UgdXNlIGZyb21Ob2Rlc0xvb2t1cCB0byBkZXRlcm1pbmVcbiAgICAgICAgICAgIC8vIGlmIGEga2V5ZWQgbm9kZSBoYXMgYmVlbiBtYXRjaGVkIHVwIG9yIG5vdFxuICAgICAgICAgICAgaWYgKGtleWVkUmVtb3ZhbExpc3QpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpPTAsIGxlbj1rZXllZFJlbW92YWxMaXN0Lmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWxUb1JlbW92ZSA9IGZyb21Ob2Rlc0xvb2t1cFtrZXllZFJlbW92YWxMaXN0W2ldXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsVG9SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoZWxUb1JlbW92ZSwgZWxUb1JlbW92ZS5wYXJlbnROb2RlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNoaWxkcmVuT25seSAmJiBtb3JwaGVkTm9kZSAhPT0gZnJvbU5vZGUgJiYgZnJvbU5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgaWYgKG1vcnBoZWROb2RlLmFjdHVhbGl6ZSkge1xuICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gbW9ycGhlZE5vZGUuYWN0dWFsaXplKGZyb21Ob2RlLm93bmVyRG9jdW1lbnQgfHwgZG9jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHdlIGhhZCB0byBzd2FwIG91dCB0aGUgZnJvbSBub2RlIHdpdGggYSBuZXcgbm9kZSBiZWNhdXNlIHRoZSBvbGRcbiAgICAgICAgICAgIC8vIG5vZGUgd2FzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIHRhcmdldCBub2RlIHRoZW4gd2UgbmVlZCB0b1xuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgb2xkIERPTSBub2RlIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZS4gVGhpcyBpcyBvbmx5XG4gICAgICAgICAgICAvLyBwb3NzaWJsZSBpZiB0aGUgb3JpZ2luYWwgRE9NIG5vZGUgd2FzIHBhcnQgb2YgYSBET00gdHJlZSB3aGljaFxuICAgICAgICAgICAgLy8gd2Uga25vdyBpcyB0aGUgY2FzZSBpZiBpdCBoYXMgYSBwYXJlbnQgbm9kZS5cbiAgICAgICAgICAgIGZyb21Ob2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG1vcnBoZWROb2RlLCBmcm9tTm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbW9ycGhlZE5vZGU7XG4gICAgfTtcbn1cblxudmFyIG1vcnBoZG9tID0gbW9ycGhkb21GYWN0b3J5KG1vcnBoQXR0cnMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1vcnBoZG9tO1xuIiwiLyoqXG4qIENyZWF0ZSBhbiBldmVudCBlbWl0dGVyIHdpdGggbmFtZXNwYWNlc1xuKiBAbmFtZSBjcmVhdGVOYW1lc3BhY2VFbWl0dGVyXG4qIEBleGFtcGxlXG4qIHZhciBlbWl0dGVyID0gcmVxdWlyZSgnLi9pbmRleCcpKClcbipcbiogZW1pdHRlci5vbignKicsIGZ1bmN0aW9uICgpIHtcbiogICBjb25zb2xlLmxvZygnYWxsIGV2ZW50cyBlbWl0dGVkJywgdGhpcy5ldmVudClcbiogfSlcbipcbiogZW1pdHRlci5vbignZXhhbXBsZScsIGZ1bmN0aW9uICgpIHtcbiogICBjb25zb2xlLmxvZygnZXhhbXBsZSBldmVudCBlbWl0dGVkJylcbiogfSlcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZU5hbWVzcGFjZUVtaXR0ZXIgKCkge1xuICB2YXIgZW1pdHRlciA9IHsgX2Zuczoge30gfVxuXG4gIC8qKlxuICAqIEVtaXQgYW4gZXZlbnQuIE9wdGlvbmFsbHkgbmFtZXNwYWNlIHRoZSBldmVudC4gU2VwYXJhdGUgdGhlIG5hbWVzcGFjZSBhbmQgZXZlbnQgd2l0aCBhIGA6YFxuICAqIEBuYW1lIGVtaXRcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQg4oCTIHRoZSBuYW1lIG9mIHRoZSBldmVudCwgd2l0aCBvcHRpb25hbCBuYW1lc3BhY2VcbiAgKiBAcGFyYW0gey4uLip9IGRhdGEg4oCTIGRhdGEgdmFyaWFibGVzIHRoYXQgd2lsbCBiZSBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBldmVudCBsaXN0ZW5lclxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5lbWl0KCdleGFtcGxlJylcbiAgKiBlbWl0dGVyLmVtaXQoJ2RlbW86dGVzdCcpXG4gICogZW1pdHRlci5lbWl0KCdkYXRhJywgeyBleGFtcGxlOiB0cnVlfSwgJ2Egc3RyaW5nJywgMSlcbiAgKi9cbiAgZW1pdHRlci5lbWl0ID0gZnVuY3Rpb24gZW1pdCAoZXZlbnQpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgIHZhciBuYW1lc3BhY2VkID0gbmFtZXNwYWNlcyhldmVudClcbiAgICBpZiAodGhpcy5fZm5zW2V2ZW50XSkgZW1pdEFsbChldmVudCwgdGhpcy5fZm5zW2V2ZW50XSwgYXJncylcbiAgICBpZiAobmFtZXNwYWNlZCkgZW1pdEFsbChldmVudCwgbmFtZXNwYWNlZCwgYXJncylcbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZSBlbiBldmVudCBsaXN0ZW5lci5cbiAgKiBAbmFtZSBvblxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9uKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge30pXG4gICogZW1pdHRlci5vbignZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9uID0gZnVuY3Rpb24gb24gKGV2ZW50LCBmbikge1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHsgdGhyb3cgbmV3IEVycm9yKCdjYWxsYmFjayByZXF1aXJlZCcpIH1cbiAgICAodGhpcy5fZm5zW2V2ZW50XSA9IHRoaXMuX2Zuc1tldmVudF0gfHwgW10pLnB1c2goZm4pXG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGUgZW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBmaXJlcyBvbmNlLlxuICAqIEBuYW1lIG9uY2VcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vbmNlKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge30pXG4gICogZW1pdHRlci5vbmNlKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub25jZSA9IGZ1bmN0aW9uIG9uY2UgKGV2ZW50LCBmbikge1xuICAgIGZ1bmN0aW9uIG9uZSAoKSB7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICBlbWl0dGVyLm9mZihldmVudCwgb25lKVxuICAgIH1cbiAgICB0aGlzLm9uKGV2ZW50LCBvbmUpXG4gIH1cblxuICAvKipcbiAgKiBTdG9wIGxpc3RlbmluZyB0byBhbiBldmVudC4gU3RvcCBhbGwgbGlzdGVuZXJzIG9uIGFuIGV2ZW50IGJ5IG9ubHkgcGFzc2luZyB0aGUgZXZlbnQgbmFtZS4gU3RvcCBhIHNpbmdsZSBsaXN0ZW5lciBieSBwYXNzaW5nIHRoYXQgZXZlbnQgaGFuZGxlciBhcyBhIGNhbGxiYWNrLlxuICAqIFlvdSBtdXN0IGJlIGV4cGxpY2l0IGFib3V0IHdoYXQgd2lsbCBiZSB1bnN1YnNjcmliZWQ6IGBlbWl0dGVyLm9mZignZGVtbycpYCB3aWxsIHVuc3Vic2NyaWJlIGFuIGBlbWl0dGVyLm9uKCdkZW1vJylgIGxpc3RlbmVyLCBcbiAgKiBgZW1pdHRlci5vZmYoJ2RlbW86ZXhhbXBsZScpYCB3aWxsIHVuc3Vic2NyaWJlIGFuIGBlbWl0dGVyLm9uKCdkZW1vOmV4YW1wbGUnKWAgbGlzdGVuZXJcbiAgKiBAbmFtZSBvZmZcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dIOKAkyB0aGUgc3BlY2lmaWMgaGFuZGxlclxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vZmYoJ2V4YW1wbGUnKVxuICAqIGVtaXR0ZXIub2ZmKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub2ZmID0gZnVuY3Rpb24gb2ZmIChldmVudCwgZm4pIHtcbiAgICB2YXIga2VlcCA9IFtdXG5cbiAgICBpZiAoZXZlbnQgJiYgZm4pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZm5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLl9mbnNbaV0gIT09IGZuKSB7XG4gICAgICAgICAga2VlcC5wdXNoKHRoaXMuX2Zuc1tpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGtlZXAubGVuZ3RoID8gdGhpcy5fZm5zW2V2ZW50XSA9IGtlZXAgOiBkZWxldGUgdGhpcy5fZm5zW2V2ZW50XVxuICB9XG5cbiAgZnVuY3Rpb24gbmFtZXNwYWNlcyAoZSkge1xuICAgIHZhciBvdXQgPSBbXVxuICAgIHZhciBhcmdzID0gZS5zcGxpdCgnOicpXG4gICAgdmFyIGZucyA9IGVtaXR0ZXIuX2Zuc1xuICAgIE9iamVjdC5rZXlzKGZucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAoa2V5ID09PSAnKicpIG91dCA9IG91dC5jb25jYXQoZm5zW2tleV0pXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDIgJiYgYXJnc1swXSA9PT0ga2V5KSBvdXQgPSBvdXQuY29uY2F0KGZuc1trZXldKVxuICAgIH0pXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdEFsbCAoZSwgZm5zLCBhcmdzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghZm5zW2ldKSBicmVha1xuICAgICAgZm5zW2ldLmV2ZW50ID0gZVxuICAgICAgZm5zW2ldLmFwcGx5KGZuc1tpXSwgYXJncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZW1pdHRlclxufVxuIiwiLyogZ2xvYmFsIE11dGF0aW9uT2JzZXJ2ZXIgKi9cbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpXG52YXIgd2luZG93ID0gcmVxdWlyZSgnZ2xvYmFsL3dpbmRvdycpXG52YXIgd2F0Y2ggPSBPYmplY3QuY3JlYXRlKG51bGwpXG52YXIgS0VZX0lEID0gJ29ubG9hZGlkJyArIChuZXcgRGF0ZSgpICUgOWU2KS50b1N0cmluZygzNilcbnZhciBLRVlfQVRUUiA9ICdkYXRhLScgKyBLRVlfSURcbnZhciBJTkRFWCA9IDBcblxuaWYgKHdpbmRvdyAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcikge1xuICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHdhdGNoKS5sZW5ndGggPCAxKSByZXR1cm5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKG11dGF0aW9uc1tpXS5hdHRyaWJ1dGVOYW1lID09PSBLRVlfQVRUUikge1xuICAgICAgICBlYWNoQXR0cihtdXRhdGlvbnNbaV0sIHR1cm5vbiwgdHVybm9mZilcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGVhY2hNdXRhdGlvbihtdXRhdGlvbnNbaV0ucmVtb3ZlZE5vZGVzLCB0dXJub2ZmKVxuICAgICAgZWFjaE11dGF0aW9uKG11dGF0aW9uc1tpXS5hZGRlZE5vZGVzLCB0dXJub24pXG4gICAgfVxuICB9KVxuICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZUZpbHRlcjogW0tFWV9BVFRSXVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9ubG9hZCAoZWwsIG9uLCBvZmYsIGNhbGxlcikge1xuICBvbiA9IG9uIHx8IGZ1bmN0aW9uICgpIHt9XG4gIG9mZiA9IG9mZiB8fCBmdW5jdGlvbiAoKSB7fVxuICBlbC5zZXRBdHRyaWJ1dGUoS0VZX0FUVFIsICdvJyArIElOREVYKVxuICB3YXRjaFsnbycgKyBJTkRFWF0gPSBbb24sIG9mZiwgMCwgY2FsbGVyIHx8IG9ubG9hZC5jYWxsZXJdXG4gIElOREVYICs9IDFcbiAgcmV0dXJuIGVsXG59XG5cbmZ1bmN0aW9uIHR1cm5vbiAoaW5kZXgsIGVsKSB7XG4gIGlmICh3YXRjaFtpbmRleF1bMF0gJiYgd2F0Y2hbaW5kZXhdWzJdID09PSAwKSB7XG4gICAgd2F0Y2hbaW5kZXhdWzBdKGVsKVxuICAgIHdhdGNoW2luZGV4XVsyXSA9IDFcbiAgfVxufVxuXG5mdW5jdGlvbiB0dXJub2ZmIChpbmRleCwgZWwpIHtcbiAgaWYgKHdhdGNoW2luZGV4XVsxXSAmJiB3YXRjaFtpbmRleF1bMl0gPT09IDEpIHtcbiAgICB3YXRjaFtpbmRleF1bMV0oZWwpXG4gICAgd2F0Y2hbaW5kZXhdWzJdID0gMFxuICB9XG59XG5cbmZ1bmN0aW9uIGVhY2hBdHRyIChtdXRhdGlvbiwgb24sIG9mZikge1xuICB2YXIgbmV3VmFsdWUgPSBtdXRhdGlvbi50YXJnZXQuZ2V0QXR0cmlidXRlKEtFWV9BVFRSKVxuICBpZiAoc2FtZU9yaWdpbihtdXRhdGlvbi5vbGRWYWx1ZSwgbmV3VmFsdWUpKSB7XG4gICAgd2F0Y2hbbmV3VmFsdWVdID0gd2F0Y2hbbXV0YXRpb24ub2xkVmFsdWVdXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKHdhdGNoW211dGF0aW9uLm9sZFZhbHVlXSkge1xuICAgIG9mZihtdXRhdGlvbi5vbGRWYWx1ZSwgbXV0YXRpb24udGFyZ2V0KVxuICB9XG4gIGlmICh3YXRjaFtuZXdWYWx1ZV0pIHtcbiAgICBvbihuZXdWYWx1ZSwgbXV0YXRpb24udGFyZ2V0KVxuICB9XG59XG5cbmZ1bmN0aW9uIHNhbWVPcmlnaW4gKG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICBpZiAoIW9sZFZhbHVlIHx8ICFuZXdWYWx1ZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB3YXRjaFtvbGRWYWx1ZV1bM10gPT09IHdhdGNoW25ld1ZhbHVlXVszXVxufVxuXG5mdW5jdGlvbiBlYWNoTXV0YXRpb24gKG5vZGVzLCBmbikge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHdhdGNoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5vZGVzW2ldICYmIG5vZGVzW2ldLmdldEF0dHJpYnV0ZSAmJiBub2Rlc1tpXS5nZXRBdHRyaWJ1dGUoS0VZX0FUVFIpKSB7XG4gICAgICB2YXIgb25sb2FkaWQgPSBub2Rlc1tpXS5nZXRBdHRyaWJ1dGUoS0VZX0FUVFIpXG4gICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgaWYgKG9ubG9hZGlkID09PSBrKSB7XG4gICAgICAgICAgZm4oaywgbm9kZXNbaV0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChub2Rlc1tpXS5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGVhY2hNdXRhdGlvbihub2Rlc1tpXS5jaGlsZE5vZGVzLCBmbilcbiAgICB9XG4gIH1cbn1cbiIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcblxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBsaXN0ID0gdGhpcy5tYXBbbmFtZV1cbiAgICBpZiAoIWxpc3QpIHtcbiAgICAgIGxpc3QgPSBbXVxuICAgICAgdGhpcy5tYXBbbmFtZV0gPSBsaXN0XG4gICAgfVxuICAgIGxpc3QucHVzaCh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgICByZXR1cm4gdmFsdWVzID8gdmFsdWVzWzBdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSB8fCBbXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IFtub3JtYWxpemVWYWx1ZSh2YWx1ZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLm1hcCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLm1hcFtuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMpXG4gICAgICB9LCB0aGlzKVxuICAgIH0sIHRoaXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAvLyBPbmx5IHN1cHBvcnQgQXJyYXlCdWZmZXJzIGZvciBQT1NUIG1ldGhvZC5cbiAgICAgICAgLy8gUmVjZWl2aW5nIEFycmF5QnVmZmVycyBoYXBwZW5zIHZpYSBCbG9icywgaW5zdGVhZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIHJldHVybiByZWplY3RlZCA/IHJlamVjdGVkIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IGlucHV0XG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhlYWRlcnMoeGhyKSB7XG4gICAgdmFyIGhlYWQgPSBuZXcgSGVhZGVycygpXG4gICAgdmFyIHBhaXJzID0gKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJykudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICB2YXIgc3BsaXQgPSBoZWFkZXIudHJpbSgpLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBzcGxpdC5zaGlmdCgpLnRyaW0oKVxuICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignOicpLnRyaW0oKVxuICAgICAgaGVhZC5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiBoZWFkXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXNcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gb3B0aW9ucy5zdGF0dXNUZXh0XG4gICAgdGhpcy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycyA/IG9wdGlvbnMuaGVhZGVycyA6IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3RcbiAgICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSAmJiAhaW5pdCkge1xuICAgICAgICByZXF1ZXN0ID0gaW5wdXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIH1cblxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlVVJMKCkge1xuICAgICAgICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIpIHtcbiAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdm9pZCBzZWN1cml0eSB3YXJuaW5ncyBvbiBnZXRSZXNwb25zZUhlYWRlciB3aGVuIG5vdCBhbGxvd2VkIGJ5IENPUlNcbiAgICAgICAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICAgICAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzKHhociksXG4gICAgICAgICAgdXJsOiByZXNwb25zZVVSTCgpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsInZhciBiZWwgPSByZXF1aXJlKCdiZWwnKSAvLyB0dXJucyB0ZW1wbGF0ZSB0YWcgaW50byBET00gZWxlbWVudHNcbnZhciBtb3JwaGRvbSA9IHJlcXVpcmUoJ21vcnBoZG9tJykgLy8gZWZmaWNpZW50bHkgZGlmZnMgKyBtb3JwaHMgdHdvIERPTSBlbGVtZW50c1xudmFyIGRlZmF1bHRFdmVudHMgPSByZXF1aXJlKCcuL3VwZGF0ZS1ldmVudHMuanMnKSAvLyBkZWZhdWx0IGV2ZW50cyB0byBiZSBjb3BpZWQgd2hlbiBkb20gZWxlbWVudHMgdXBkYXRlXG5cbm1vZHVsZS5leHBvcnRzID0gYmVsXG5cbi8vIFRPRE8gbW92ZSB0aGlzICsgZGVmYXVsdEV2ZW50cyB0byBhIG5ldyBtb2R1bGUgb25jZSB3ZSByZWNlaXZlIG1vcmUgZmVlZGJhY2tcbm1vZHVsZS5leHBvcnRzLnVwZGF0ZSA9IGZ1bmN0aW9uIChmcm9tTm9kZSwgdG9Ob2RlLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG4gIGlmIChvcHRzLmV2ZW50cyAhPT0gZmFsc2UpIHtcbiAgICBpZiAoIW9wdHMub25CZWZvcmVFbFVwZGF0ZWQpIG9wdHMub25CZWZvcmVFbFVwZGF0ZWQgPSBjb3BpZXJcbiAgfVxuXG4gIHJldHVybiBtb3JwaGRvbShmcm9tTm9kZSwgdG9Ob2RlLCBvcHRzKVxuXG4gIC8vIG1vcnBoZG9tIG9ubHkgY29waWVzIGF0dHJpYnV0ZXMuIHdlIGRlY2lkZWQgd2UgYWxzbyB3YW50ZWQgdG8gY29weSBldmVudHNcbiAgLy8gdGhhdCBjYW4gYmUgc2V0IHZpYSBhdHRyaWJ1dGVzXG4gIGZ1bmN0aW9uIGNvcGllciAoZiwgdCkge1xuICAgIC8vIGNvcHkgZXZlbnRzOlxuICAgIHZhciBldmVudHMgPSBvcHRzLmV2ZW50cyB8fCBkZWZhdWx0RXZlbnRzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBldiA9IGV2ZW50c1tpXVxuICAgICAgaWYgKHRbZXZdKSB7IC8vIGlmIG5ldyBlbGVtZW50IGhhcyBhIHdoaXRlbGlzdGVkIGF0dHJpYnV0ZVxuICAgICAgICBmW2V2XSA9IHRbZXZdIC8vIHVwZGF0ZSBleGlzdGluZyBlbGVtZW50XG4gICAgICB9IGVsc2UgaWYgKGZbZXZdKSB7IC8vIGlmIGV4aXN0aW5nIGVsZW1lbnQgaGFzIGl0IGFuZCBuZXcgb25lIGRvZXNudFxuICAgICAgICBmW2V2XSA9IHVuZGVmaW5lZCAvLyByZW1vdmUgaXQgZnJvbSBleGlzdGluZyBlbGVtZW50XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBvbGRWYWx1ZSA9IGYudmFsdWVcbiAgICB2YXIgbmV3VmFsdWUgPSB0LnZhbHVlXG4gICAgLy8gY29weSB2YWx1ZXMgZm9yIGZvcm0gZWxlbWVudHNcbiAgICBpZiAoKGYubm9kZU5hbWUgPT09ICdJTlBVVCcgJiYgZi50eXBlICE9PSAnZmlsZScpIHx8IGYubm9kZU5hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICBpZiAoIW5ld1ZhbHVlKSB7XG4gICAgICAgIHQudmFsdWUgPSBmLnZhbHVlXG4gICAgICB9IGVsc2UgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgICBmLnZhbHVlID0gbmV3VmFsdWVcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGYubm9kZU5hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgIGlmICh0LmdldEF0dHJpYnV0ZSgndmFsdWUnKSA9PT0gbnVsbCkgZi52YWx1ZSA9IHQudmFsdWVcbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gW1xuICAvLyBhdHRyaWJ1dGUgZXZlbnRzIChjYW4gYmUgc2V0IHdpdGggYXR0cmlidXRlcylcbiAgJ29uY2xpY2snLFxuICAnb25kYmxjbGljaycsXG4gICdvbm1vdXNlZG93bicsXG4gICdvbm1vdXNldXAnLFxuICAnb25tb3VzZW92ZXInLFxuICAnb25tb3VzZW1vdmUnLFxuICAnb25tb3VzZW91dCcsXG4gICdvbmRyYWdzdGFydCcsXG4gICdvbmRyYWcnLFxuICAnb25kcmFnZW50ZXInLFxuICAnb25kcmFnbGVhdmUnLFxuICAnb25kcmFnb3ZlcicsXG4gICdvbmRyb3AnLFxuICAnb25kcmFnZW5kJyxcbiAgJ29ua2V5ZG93bicsXG4gICdvbmtleXByZXNzJyxcbiAgJ29ua2V5dXAnLFxuICAnb251bmxvYWQnLFxuICAnb25hYm9ydCcsXG4gICdvbmVycm9yJyxcbiAgJ29ucmVzaXplJyxcbiAgJ29uc2Nyb2xsJyxcbiAgJ29uc2VsZWN0JyxcbiAgJ29uY2hhbmdlJyxcbiAgJ29uc3VibWl0JyxcbiAgJ29ucmVzZXQnLFxuICAnb25mb2N1cycsXG4gICdvbmJsdXInLFxuICAnb25pbnB1dCcsXG4gIC8vIG90aGVyIGNvbW1vbiBldmVudHNcbiAgJ29uY29udGV4dG1lbnUnLFxuICAnb25mb2N1c2luJyxcbiAgJ29uZm9jdXNvdXQnXG5dXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHlveW9pZnlBcHBlbmRDaGlsZCAoZWwsIGNoaWxkcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBub2RlID0gY2hpbGRzW2ldXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICAgIHlveW9pZnlBcHBlbmRDaGlsZChlbCwgbm9kZSlcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ251bWJlcicgfHxcbiAgICAgIHR5cGVvZiBub2RlID09PSAnYm9vbGVhbicgfHxcbiAgICAgIG5vZGUgaW5zdGFuY2VvZiBEYXRlIHx8XG4gICAgICBub2RlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICBub2RlID0gbm9kZS50b1N0cmluZygpXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChlbC5sYXN0Q2hpbGQgJiYgZWwubGFzdENoaWxkLm5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICAgIGVsLmxhc3RDaGlsZC5ub2RlVmFsdWUgKz0gbm9kZVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG4gICAgfVxuICAgIGlmIChub2RlICYmIG5vZGUubm9kZVR5cGUpIHtcbiAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgfVxuICB9XG59XG4iLCJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbHMnKVxuY29uc3QgVHJhbnNsYXRvciA9IHJlcXVpcmUoJy4uL2NvcmUvVHJhbnNsYXRvcicpXG5jb25zdCBVcHB5U29ja2V0ID0gcmVxdWlyZSgnLi9VcHB5U29ja2V0JylcbmNvbnN0IGVlID0gcmVxdWlyZSgnbmFtZXNwYWNlLWVtaXR0ZXInKVxuY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuLy8gY29uc3QgZW5fVVMgPSByZXF1aXJlKCcuLi9sb2NhbGVzL2VuX1VTJylcbi8vIGNvbnN0IGRlZXBGcmVlemUgPSByZXF1aXJlKCdkZWVwLWZyZWV6ZS1zdHJpY3QnKVxuXG4vKipcbiAqIE1haW4gVXBweSBjb3JlXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgZ2VuZXJhbCBvcHRpb25zLCBsaWtlIGxvY2FsZXMsIHRvIHNob3cgbW9kYWwgb3Igbm90IHRvIHNob3dcbiAqL1xuY2xhc3MgVXBweSB7XG4gIGNvbnN0cnVjdG9yIChvcHRzKSB7XG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgLy8gbG9hZCBFbmdsaXNoIGFzIHRoZSBkZWZhdWx0IGxvY2FsZVxuICAgICAgLy8gbG9jYWxlOiBlbl9VUyxcbiAgICAgIGF1dG9Qcm9jZWVkOiB0cnVlLFxuICAgICAgZGVidWc6IGZhbHNlXG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXJcbiAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cylcblxuICAgIC8vIC8vIERpY3RhdGVzIGluIHdoYXQgb3JkZXIgZGlmZmVyZW50IHBsdWdpbiB0eXBlcyBhcmUgcmFuOlxuICAgIC8vIHRoaXMudHlwZXMgPSBbICdwcmVzZXR0ZXInLCAnb3JjaGVzdHJhdG9yJywgJ3Byb2dyZXNzaW5kaWNhdG9yJyxcbiAgICAvLyAgICAgICAgICAgICAgICAgJ2FjcXVpcmVyJywgJ21vZGlmaWVyJywgJ3VwbG9hZGVyJywgJ3ByZXNlbnRlcicsICdkZWJ1Z2dlciddXG5cbiAgICAvLyBDb250YWluZXIgZm9yIGRpZmZlcmVudCB0eXBlcyBvZiBwbHVnaW5zXG4gICAgdGhpcy5wbHVnaW5zID0ge31cblxuICAgIHRoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKHtsb2NhbGU6IHRoaXMub3B0cy5sb2NhbGV9KVxuICAgIHRoaXMuaTE4biA9IHRoaXMudHJhbnNsYXRvci50cmFuc2xhdGUuYmluZCh0aGlzLnRyYW5zbGF0b3IpXG4gICAgdGhpcy5nZXRTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUuYmluZCh0aGlzKVxuICAgIHRoaXMudXBkYXRlTWV0YSA9IHRoaXMudXBkYXRlTWV0YS5iaW5kKHRoaXMpXG4gICAgdGhpcy5pbml0U29ja2V0ID0gdGhpcy5pbml0U29ja2V0LmJpbmQodGhpcylcbiAgICB0aGlzLmxvZyA9IHRoaXMubG9nLmJpbmQodGhpcylcbiAgICB0aGlzLmFkZEZpbGUgPSB0aGlzLmFkZEZpbGUuYmluZCh0aGlzKVxuICAgIHRoaXMuY2FsY3VsYXRlUHJvZ3Jlc3MgPSB0aGlzLmNhbGN1bGF0ZVByb2dyZXNzLmJpbmQodGhpcylcblxuICAgIHRoaXMuYnVzID0gdGhpcy5lbWl0dGVyID0gZWUoKVxuICAgIHRoaXMub24gPSB0aGlzLmJ1cy5vbi5iaW5kKHRoaXMuYnVzKVxuICAgIHRoaXMuZW1pdCA9IHRoaXMuYnVzLmVtaXQuYmluZCh0aGlzLmJ1cylcblxuICAgIHRoaXMucHJlUHJvY2Vzc29ycyA9IFtdXG4gICAgdGhpcy51cGxvYWRlcnMgPSBbXVxuICAgIHRoaXMucG9zdFByb2Nlc3NvcnMgPSBbXVxuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZpbGVzOiB7fSxcbiAgICAgIGNhcGFiaWxpdGllczoge1xuICAgICAgICByZXN1bWFibGVVcGxvYWRzOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDBcbiAgICB9XG5cbiAgICAvLyBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nXG4gICAgdGhpcy51cGRhdGVOdW0gPSAwXG4gICAgaWYgKHRoaXMub3B0cy5kZWJ1Zykge1xuICAgICAgZ2xvYmFsLlVwcHlTdGF0ZSA9IHRoaXMuc3RhdGVcbiAgICAgIGdsb2JhbC51cHB5TG9nID0gJydcbiAgICAgIGdsb2JhbC5VcHB5QWRkRmlsZSA9IHRoaXMuYWRkRmlsZS5iaW5kKHRoaXMpXG4gICAgICBnbG9iYWwuX1VwcHkgPSB0aGlzXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb24gYWxsIHBsdWdpbnMgYW5kIHJ1biBgdXBkYXRlYCBvbiB0aGVtLiBDYWxsZWQgZWFjaCB0aW1lIHN0YXRlIGNoYW5nZXNcbiAgICpcbiAgICovXG4gIHVwZGF0ZUFsbCAoc3RhdGUpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLnBsdWdpbnMpLmZvckVhY2goKHBsdWdpblR5cGUpID0+IHtcbiAgICAgIHRoaXMucGx1Z2luc1twbHVnaW5UeXBlXS5mb3JFYWNoKChwbHVnaW4pID0+IHtcbiAgICAgICAgcGx1Z2luLnVwZGF0ZShzdGF0ZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHN0YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7bmV3U3RhdGV9IG9iamVjdFxuICAgKi9cbiAgc2V0U3RhdGUgKHN0YXRlVXBkYXRlKSB7XG4gICAgY29uc3QgbmV3U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLCBzdGF0ZVVwZGF0ZSlcbiAgICB0aGlzLmVtaXQoJ2NvcmU6c3RhdGUtdXBkYXRlJywgdGhpcy5zdGF0ZSwgbmV3U3RhdGUsIHN0YXRlVXBkYXRlKVxuXG4gICAgdGhpcy5zdGF0ZSA9IG5ld1N0YXRlXG4gICAgdGhpcy51cGRhdGVBbGwodGhpcy5zdGF0ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGN1cnJlbnQgc3RhdGVcbiAgICpcbiAgICovXG4gIGdldFN0YXRlICgpIHtcbiAgICAvLyB1c2UgZGVlcEZyZWV6ZSBmb3IgZGVidWdnaW5nXG4gICAgLy8gcmV0dXJuIGRlZXBGcmVlemUodGhpcy5zdGF0ZSlcbiAgICByZXR1cm4gdGhpcy5zdGF0ZVxuICB9XG5cbiAgYWRkUHJlUHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucHJlUHJvY2Vzc29ycy5wdXNoKGZuKVxuICB9XG5cbiAgcmVtb3ZlUHJlUHJvY2Vzc29yIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnByZVByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucHJlUHJvY2Vzc29ycy5zcGxpY2UoaSwgMSlcbiAgICB9XG4gIH1cblxuICBhZGRQb3N0UHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucG9zdFByb2Nlc3NvcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVBvc3RQcm9jZXNzb3IgKGZuKSB7XG4gICAgY29uc3QgaSA9IHRoaXMucG9zdFByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucG9zdFByb2Nlc3NvcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgYWRkVXBsb2FkZXIgKGZuKSB7XG4gICAgdGhpcy51cGxvYWRlcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVVwbG9hZGVyIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnVwbG9hZGVycy5pbmRleE9mKGZuKVxuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgdGhpcy51cGxvYWRlcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlTWV0YSAoZGF0YSwgZmlsZUlEKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGNvbnN0IG5ld01ldGEgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXS5tZXRhLCBkYXRhKVxuICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sIHtcbiAgICAgIG1ldGE6IG5ld01ldGFcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoe2ZpbGVzOiB1cGRhdGVkRmlsZXN9KVxuICB9XG5cbiAgYWRkRmlsZSAoZmlsZSkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuZmlsZXMpXG5cbiAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGUubmFtZSB8fCAnbm9uYW1lJ1xuICAgIGNvbnN0IGZpbGVUeXBlID0gVXRpbHMuZ2V0RmlsZVR5cGUoZmlsZSlcbiAgICBjb25zdCBmaWxlVHlwZUdlbmVyYWwgPSBmaWxlVHlwZVswXVxuICAgIGNvbnN0IGZpbGVUeXBlU3BlY2lmaWMgPSBmaWxlVHlwZVsxXVxuICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBVdGlscy5nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlTmFtZSlbMV1cbiAgICBjb25zdCBpc1JlbW90ZSA9IGZpbGUuaXNSZW1vdGUgfHwgZmFsc2VcblxuICAgIGNvbnN0IGZpbGVJRCA9IFV0aWxzLmdlbmVyYXRlRmlsZUlEKGZpbGVOYW1lKVxuXG4gICAgY29uc3QgbmV3RmlsZSA9IHtcbiAgICAgIHNvdXJjZTogZmlsZS5zb3VyY2UgfHwgJycsXG4gICAgICBpZDogZmlsZUlELFxuICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICBleHRlbnNpb246IGZpbGVFeHRlbnNpb24gfHwgJycsXG4gICAgICBtZXRhOiB7XG4gICAgICAgIG5hbWU6IGZpbGVOYW1lXG4gICAgICB9LFxuICAgICAgdHlwZToge1xuICAgICAgICBnZW5lcmFsOiBmaWxlVHlwZUdlbmVyYWwsXG4gICAgICAgIHNwZWNpZmljOiBmaWxlVHlwZVNwZWNpZmljXG4gICAgICB9LFxuICAgICAgZGF0YTogZmlsZS5kYXRhLFxuICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgICAgdXBsb2FkQ29tcGxldGU6IGZhbHNlLFxuICAgICAgICB1cGxvYWRTdGFydGVkOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHNpemU6IGZpbGUuZGF0YS5zaXplIHx8ICdOL0EnLFxuICAgICAgaXNSZW1vdGU6IGlzUmVtb3RlLFxuICAgICAgcmVtb3RlOiBmaWxlLnJlbW90ZSB8fCAnJyxcbiAgICAgIHByZXZpZXc6IGZpbGUucHJldmlld1xuICAgIH1cblxuICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gbmV3RmlsZVxuICAgIHRoaXMuc2V0U3RhdGUoe2ZpbGVzOiB1cGRhdGVkRmlsZXN9KVxuXG4gICAgdGhpcy5idXMuZW1pdCgnZmlsZS1hZGRlZCcsIGZpbGVJRClcbiAgICB0aGlzLmxvZyhgQWRkZWQgZmlsZTogJHtmaWxlTmFtZX0sICR7ZmlsZUlEfSwgbWltZSB0eXBlOiAke2ZpbGVUeXBlfWApXG5cbiAgICBpZiAoZmlsZVR5cGVHZW5lcmFsID09PSAnaW1hZ2UnICYmICFpc1JlbW90ZSkge1xuICAgICAgdGhpcy5hZGRUaHVtYm5haWwobmV3RmlsZS5pZClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRzLmF1dG9Qcm9jZWVkKSB7XG4gICAgICB0aGlzLnVwbG9hZCgpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyLm1lc3NhZ2UpXG4gICAgICAgIH0pXG4gICAgICAvLyB0aGlzLmJ1cy5lbWl0KCdjb3JlOnVwbG9hZCcpXG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlRmlsZSAoZmlsZUlEKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGRlbGV0ZSB1cGRhdGVkRmlsZXNbZmlsZUlEXVxuICAgIHRoaXMuc2V0U3RhdGUoe2ZpbGVzOiB1cGRhdGVkRmlsZXN9KVxuICAgIHRoaXMuY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG4gICAgdGhpcy5sb2coYFJlbW92ZWQgZmlsZTogJHtmaWxlSUR9YClcbiAgfVxuXG4gIGFkZFRodW1ibmFpbCAoZmlsZUlEKSB7XG4gICAgY29uc3QgZmlsZSA9IHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdXG5cbiAgICAvLyBjb25zdCB0aHVtYm5haWwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUuZGF0YSlcbiAgICAvLyBjb25zdCB1cGRhdGVkRmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgLy8gY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwge1xuICAgIC8vICAgcHJldmlldzogdGh1bWJuYWlsXG4gICAgLy8gfSlcbiAgICAvLyB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IHVwZGF0ZWRGaWxlXG4gICAgLy8gdGhpcy5zZXRTdGF0ZSh7ZmlsZXM6IHVwZGF0ZWRGaWxlc30pXG5cbiAgICBVdGlscy5yZWFkRmlsZShmaWxlLmRhdGEpXG4gICAgICAudGhlbigoaW1nRGF0YVVSSSkgPT4gVXRpbHMuY3JlYXRlSW1hZ2VUaHVtYm5haWwoaW1nRGF0YVVSSSwgMjAwKSlcbiAgICAgIC50aGVuKCh0aHVtYm5haWwpID0+IHtcbiAgICAgICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLCB7XG4gICAgICAgICAgcHJldmlldzogdGh1bWJuYWlsXG4gICAgICAgIH0pXG4gICAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gdXBkYXRlZEZpbGVcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZmlsZXM6IHVwZGF0ZWRGaWxlc30pXG4gICAgICB9KVxuICB9XG5cbiAgY2FsY3VsYXRlUHJvZ3Jlc3MgKGRhdGEpIHtcbiAgICBjb25zdCBmaWxlSUQgPSBkYXRhLmlkXG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuXG4gICAgLy8gc2tpcCBwcm9ncmVzcyBldmVudCBmb3IgYSBmaWxlIHRoYXTigJlzIGJlZW4gcmVtb3ZlZFxuICAgIGlmICghdXBkYXRlZEZpbGVzW2ZpbGVJRF0pIHtcbiAgICAgIHRoaXMubG9nKCdUcnlpbmcgdG8gc2V0IHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdOKAmXMgbm90IHdpdGggdXMgYW55bW9yZTogJywgZmlsZUlEKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSxcbiAgICAgIE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLnByb2dyZXNzLCB7XG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogZGF0YS5ieXRlc1VwbG9hZGVkLFxuICAgICAgICAgIGJ5dGVzVG90YWw6IGRhdGEuYnl0ZXNUb3RhbCxcbiAgICAgICAgICBwZXJjZW50YWdlOiBNYXRoLmZsb29yKChkYXRhLmJ5dGVzVXBsb2FkZWQgLyBkYXRhLmJ5dGVzVG90YWwgKiAxMDApLnRvRml4ZWQoMikpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgKSlcbiAgICB1cGRhdGVkRmlsZXNbZGF0YS5pZF0gPSB1cGRhdGVkRmlsZVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzXG4gICAgfSlcblxuICAgIHRoaXMuY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG4gIH1cblxuICBjYWxjdWxhdGVUb3RhbFByb2dyZXNzICgpIHtcbiAgICAvLyBjYWxjdWxhdGUgdG90YWwgcHJvZ3Jlc3MsIHVzaW5nIHRoZSBudW1iZXIgb2YgZmlsZXMgY3VycmVudGx5IHVwbG9hZGluZyxcbiAgICAvLyBtdWx0aXBsaWVkIGJ5IDEwMCBhbmQgdGhlIHN1bW0gb2YgaW5kaXZpZHVhbCBwcm9ncmVzcyBvZiBlYWNoIGZpbGVcbiAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcblxuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSBPYmplY3Qua2V5cyhmaWxlcykuZmlsdGVyKChmaWxlKSA9PiB7XG4gICAgICByZXR1cm4gZmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZFxuICAgIH0pXG4gICAgY29uc3QgcHJvZ3Jlc3NNYXggPSBpblByb2dyZXNzLmxlbmd0aCAqIDEwMFxuICAgIGxldCBwcm9ncmVzc0FsbCA9IDBcbiAgICBpblByb2dyZXNzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIHByb2dyZXNzQWxsID0gcHJvZ3Jlc3NBbGwgKyBmaWxlc1tmaWxlXS5wcm9ncmVzcy5wZXJjZW50YWdlXG4gICAgfSlcblxuICAgIGNvbnN0IHRvdGFsUHJvZ3Jlc3MgPSBNYXRoLmZsb29yKChwcm9ncmVzc0FsbCAqIDEwMCAvIHByb2dyZXNzTWF4KS50b0ZpeGVkKDIpKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB0b3RhbFByb2dyZXNzOiB0b3RhbFByb2dyZXNzXG4gICAgfSlcblxuICAgIC8vIGlmICh0b3RhbFByb2dyZXNzID09PSAxMDApIHtcbiAgICAvLyAgIGNvbnN0IGNvbXBsZXRlRmlsZXMgPSBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgIC8vICAgICAvLyB0aGlzIHNob3VsZCBiZSBgdXBsb2FkQ29tcGxldGVgXG4gICAgLy8gICAgIHJldHVybiB1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MucGVyY2VudGFnZSA9PT0gMTAwXG4gICAgLy8gICB9KVxuICAgIC8vICAgdGhpcy5lbWl0KCdjb3JlOnN1Y2Nlc3MnLCBjb21wbGV0ZUZpbGVzLmxlbmd0aClcbiAgICAvLyB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgYWxsIGdsb2JhbCBhY3Rpb25zLCBsaWtlOlxuICAgKiBgZmlsZS1hZGRgLCBgZmlsZS1yZW1vdmVgLCBgdXBsb2FkLXByb2dyZXNzYCwgYHJlc2V0YFxuICAgKlxuICAgKi9cbiAgYWN0aW9ucyAoKSB7XG4gICAgLy8gdGhpcy5idXMub24oJyonLCAocGF5bG9hZCkgPT4ge1xuICAgIC8vICAgY29uc29sZS5sb2coJ2VtaXR0ZWQ6ICcsIHRoaXMuZXZlbnQpXG4gICAgLy8gICBjb25zb2xlLmxvZygnd2l0aCBwYXlsb2FkOiAnLCBwYXlsb2FkKVxuICAgIC8vIH0pXG5cbiAgICAvLyBzdHJlc3MtdGVzdCByZS1yZW5kZXJpbmdcbiAgICAvLyBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgLy8gICB0aGlzLnNldFN0YXRlKHtibGE6ICdibGEnfSlcbiAgICAvLyB9LCAyMClcblxuICAgIHRoaXMub24oJ2NvcmU6ZmlsZS1hZGQnLCAoZGF0YSkgPT4ge1xuICAgICAgdGhpcy5hZGRGaWxlKGRhdGEpXG4gICAgfSlcblxuICAgIC8vIGByZW1vdmUtZmlsZWAgcmVtb3ZlcyBhIGZpbGUgZnJvbSBgc3RhdGUuZmlsZXNgLCBmb3IgZXhhbXBsZSB3aGVuXG4gICAgLy8gYSB1c2VyIGRlY2lkZXMgbm90IHRvIHVwbG9hZCBwYXJ0aWN1bGFyIGZpbGUgYW5kIGNsaWNrcyBhIGJ1dHRvbiB0byByZW1vdmUgaXRcbiAgICB0aGlzLm9uKCdjb3JlOmZpbGUtcmVtb3ZlJywgKGZpbGVJRCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVGaWxlKGZpbGVJRClcbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTpjYW5jZWwtYWxsJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldFN0YXRlKCkuZmlsZXNcbiAgICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgIHRoaXMucmVtb3ZlRmlsZShmaWxlc1tmaWxlXS5pZClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ2NvcmU6dXBsb2FkLXN0YXJ0ZWQnLCAoZmlsZUlELCB1cGxvYWQpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sXG4gICAgICAgIE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICBwcm9ncmVzczogT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ucHJvZ3Jlc3MsIHtcbiAgICAgICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IERhdGUubm93KClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApKVxuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB1cGRhdGVkRmlsZVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtmaWxlczogdXBkYXRlZEZpbGVzfSlcbiAgICB9KVxuXG4gICAgLy8gdXBsb2FkIHByb2dyZXNzIGV2ZW50cyBjYW4gb2NjdXIgZnJlcXVlbnRseSwgZXNwZWNpYWxseSB3aGVuIHlvdSBoYXZlIGEgZ29vZFxuICAgIC8vIGNvbm5lY3Rpb24gdG8gdGhlIHJlbW90ZSBzZXJ2ZXIuIFRoZXJlZm9yZSwgd2UgYXJlIHRocm90dGVsaW5nIHRoZW0gdG9cbiAgICAvLyBwcmV2ZW50IGFjY2Vzc2l2ZSBmdW5jdGlvbiBjYWxscy5cbiAgICAvLyBzZWUgYWxzbzogaHR0cHM6Ly9naXRodWIuY29tL3R1cy90dXMtanMtY2xpZW50L2NvbW1pdC85OTQwZjI3YjIzNjFmZDdlMTBiYTU4YjA5YjYwZDgyNDIyMTgzYmJiXG4gICAgY29uc3QgdGhyb3R0bGVkQ2FsY3VsYXRlUHJvZ3Jlc3MgPSB0aHJvdHRsZSh0aGlzLmNhbGN1bGF0ZVByb2dyZXNzLCAxMDAsIHtsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogZmFsc2V9KVxuXG4gICAgdGhpcy5vbignY29yZTp1cGxvYWQtcHJvZ3Jlc3MnLCAoZGF0YSkgPT4ge1xuICAgICAgLy8gdGhpcy5jYWxjdWxhdGVQcm9ncmVzcyhkYXRhKVxuICAgICAgdGhyb3R0bGVkQ2FsY3VsYXRlUHJvZ3Jlc3MoZGF0YSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTp1cGxvYWQtc3VjY2VzcycsIChmaWxlSUQsIHVwbG9hZFJlc3AsIHVwbG9hZFVSTCkgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwge1xuICAgICAgICBwcm9ncmVzczogT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ucHJvZ3Jlc3MsIHtcbiAgICAgICAgICB1cGxvYWRDb21wbGV0ZTogdHJ1ZSxcbiAgICAgICAgICAvLyBnb29kIG9yIGJhZCBpZGVhPyBzZXR0aW5nIHRoZSBwZXJjZW50YWdlIHRvIDEwMCBpZiB1cGxvYWQgaXMgc3VjY2Vzc2Z1bCxcbiAgICAgICAgICAvLyBzbyB0aGF0IGlmIHdlIGxvc3Qgc29tZSBwcm9ncmVzcyBldmVudHMgb24gdGhlIHdheSwgaXRzIHN0aWxsIG1hcmtlZCDigJxjb21wZXRl4oCdP1xuICAgICAgICAgIHBlcmNlbnRhZ2U6IDEwMFxuICAgICAgICB9KSxcbiAgICAgICAgdXBsb2FkVVJMOiB1cGxvYWRVUkxcbiAgICAgIH0pXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IHVwZGF0ZWRGaWxlXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBmaWxlczogdXBkYXRlZEZpbGVzXG4gICAgICB9KVxuXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuXG4gICAgICBpZiAodGhpcy5nZXRTdGF0ZSgpLnRvdGFsUHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICBjb25zdCBjb21wbGV0ZUZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZW1pdCgnY29yZTp1cGxvYWQtY29tcGxldGUnLCBjb21wbGV0ZUZpbGVzLmxlbmd0aClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29yZTp1cGRhdGUtbWV0YScsIChkYXRhLCBmaWxlSUQpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlTWV0YShkYXRhLCBmaWxlSUQpXG4gICAgfSlcblxuICAgIC8vIHNob3cgaW5mb3JtZXIgaWYgb2ZmbGluZVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29ubGluZScsICgpID0+IHRoaXMuaXNPbmxpbmUodHJ1ZSkpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsICgpID0+IHRoaXMuaXNPbmxpbmUoZmFsc2UpKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmlzT25saW5lKCksIDMwMDApXG4gICAgfVxuICB9XG5cbiAgaXNPbmxpbmUgKHN0YXR1cykge1xuICAgIGNvbnN0IG9ubGluZSA9IHN0YXR1cyB8fCB3aW5kb3cubmF2aWdhdG9yLm9uTGluZVxuICAgIGlmICghb25saW5lKSB7XG4gICAgICB0aGlzLmVtaXQoJ2lzLW9mZmxpbmUnKVxuICAgICAgdGhpcy5lbWl0KCdpbmZvcm1lcicsICdObyBpbnRlcm5ldCBjb25uZWN0aW9uJywgJ2Vycm9yJywgMClcbiAgICAgIHRoaXMud2FzT2ZmbGluZSA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbWl0KCdpcy1vbmxpbmUnKVxuICAgICAgaWYgKHRoaXMud2FzT2ZmbGluZSkge1xuICAgICAgICB0aGlzLmVtaXQoJ2luZm9ybWVyJywgJ0Nvbm5lY3RlZCcsICdzdWNjZXNzJywgMzAwMClcbiAgICAgICAgdGhpcy53YXNPZmZsaW5lID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLyoqXG4gKiBSZWdpc3RlcnMgYSBwbHVnaW4gd2l0aCBDb3JlXG4gKlxuICogQHBhcmFtIHtDbGFzc30gUGx1Z2luIG9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0IHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gUGx1Z2luIGxhdGVyXG4gKiBAcmV0dXJuIHtPYmplY3R9IHNlbGYgZm9yIGNoYWluaW5nXG4gKi9cbiAgdXNlIChQbHVnaW4sIG9wdHMpIHtcbiAgICAvLyBJbnN0YW50aWF0ZVxuICAgIGNvbnN0IHBsdWdpbiA9IG5ldyBQbHVnaW4odGhpcywgb3B0cylcbiAgICBjb25zdCBwbHVnaW5OYW1lID0gcGx1Z2luLmlkXG4gICAgdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXSA9IHRoaXMucGx1Z2luc1twbHVnaW4udHlwZV0gfHwgW11cblxuICAgIGlmICghcGx1Z2luTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHBsdWdpbiBtdXN0IGhhdmUgYSBuYW1lJylcbiAgICB9XG5cbiAgICBpZiAoIXBsdWdpbi50eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdXIgcGx1Z2luIG11c3QgaGF2ZSBhIHR5cGUnKVxuICAgIH1cblxuICAgIGxldCBleGlzdHNQbHVnaW5BbHJlYWR5ID0gdGhpcy5nZXRQbHVnaW4ocGx1Z2luTmFtZSlcbiAgICBpZiAoZXhpc3RzUGx1Z2luQWxyZWFkeSkge1xuICAgICAgbGV0IG1zZyA9IGBBbHJlYWR5IGZvdW5kIGEgcGx1Z2luIG5hbWVkICcke2V4aXN0c1BsdWdpbkFscmVhZHkubmFtZX0nLlxuICAgICAgICBUcmllZCB0byB1c2U6ICcke3BsdWdpbk5hbWV9Jy5cbiAgICAgICAgVXBweSBpcyBjdXJyZW50bHkgbGltaXRlZCB0byBydW5uaW5nIG9uZSBvZiBldmVyeSBwbHVnaW4uXG4gICAgICAgIFNoYXJlIHlvdXIgdXNlIGNhc2Ugd2l0aCB1cyBvdmVyIGF0XG4gICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5L2lzc3Vlcy9cbiAgICAgICAgaWYgeW91IHdhbnQgdXMgdG8gcmVjb25zaWRlci5gXG4gICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKVxuICAgIH1cblxuICAgIHRoaXMucGx1Z2luc1twbHVnaW4udHlwZV0ucHVzaChwbHVnaW4pXG4gICAgcGx1Z2luLmluc3RhbGwoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4vKipcbiAqIEZpbmQgb25lIFBsdWdpbiBieSBuYW1lXG4gKlxuICogQHBhcmFtIHN0cmluZyBuYW1lIGRlc2NyaXB0aW9uXG4gKi9cbiAgZ2V0UGx1Z2luIChuYW1lKSB7XG4gICAgbGV0IGZvdW5kUGx1Z2luID0gZmFsc2VcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKChwbHVnaW4pID0+IHtcbiAgICAgIGNvbnN0IHBsdWdpbk5hbWUgPSBwbHVnaW4uaWRcbiAgICAgIGlmIChwbHVnaW5OYW1lID09PSBuYW1lKSB7XG4gICAgICAgIGZvdW5kUGx1Z2luID0gcGx1Z2luXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvdW5kUGx1Z2luXG4gIH1cblxuLyoqXG4gKiBJdGVyYXRlIHRocm91Z2ggYWxsIGB1c2VgZCBwbHVnaW5zXG4gKlxuICogQHBhcmFtIGZ1bmN0aW9uIG1ldGhvZCBkZXNjcmlwdGlvblxuICovXG4gIGl0ZXJhdGVQbHVnaW5zIChtZXRob2QpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLnBsdWdpbnMpLmZvckVhY2goKHBsdWdpblR5cGUpID0+IHtcbiAgICAgIHRoaXMucGx1Z2luc1twbHVnaW5UeXBlXS5mb3JFYWNoKG1ldGhvZClcbiAgICB9KVxuICB9XG5cbi8qKlxuICogTG9ncyBzdHVmZiB0byBjb25zb2xlLCBvbmx5IGlmIGBkZWJ1Z2AgaXMgc2V0IHRvIHRydWUuIFNpbGVudCBpbiBwcm9kdWN0aW9uLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ3xPYmplY3R9IHRvIGxvZ1xuICovXG4gIGxvZyAobXNnLCB0eXBlKSB7XG4gICAgaWYgKCF0aGlzLm9wdHMuZGVidWcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAobXNnID09PSBgJHttc2d9YCkge1xuICAgICAgY29uc29sZS5sb2coYExPRzogJHttc2d9YClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5kaXIobXNnKVxuICAgIH1cblxuICAgIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBMT0c6ICR7bXNnfWApXG4gICAgfVxuXG4gICAgZ2xvYmFsLnVwcHlMb2cgPSBnbG9iYWwudXBweUxvZyArICdcXG4nICsgJ0RFQlVHIExPRzogJyArIG1zZ1xuICB9XG5cbiAgaW5pdFNvY2tldCAob3B0cykge1xuICAgIGlmICghdGhpcy5zb2NrZXQpIHtcbiAgICAgIHRoaXMuc29ja2V0ID0gbmV3IFVwcHlTb2NrZXQob3B0cylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zb2NrZXRcbiAgfVxuXG4gIC8vIGluc3RhbGxBbGwgKCkge1xuICAvLyAgIE9iamVjdC5rZXlzKHRoaXMucGx1Z2lucykuZm9yRWFjaCgocGx1Z2luVHlwZSkgPT4ge1xuICAvLyAgICAgdGhpcy5wbHVnaW5zW3BsdWdpblR5cGVdLmZvckVhY2goKHBsdWdpbikgPT4ge1xuICAvLyAgICAgICBwbHVnaW4uaW5zdGFsbCh0aGlzKVxuICAvLyAgICAgfSlcbiAgLy8gICB9KVxuICAvLyB9XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYWN0aW9ucywgaW5zdGFsbHMgYWxsIHBsdWdpbnMgKGJ5IGl0ZXJhdGluZyBvbiB0aGVtIGFuZCBjYWxsaW5nIGBpbnN0YWxsYCksIHNldHMgb3B0aW9uc1xuICpcbiAqL1xuICBydW4gKCkge1xuICAgIHRoaXMubG9nKCdDb3JlIGlzIHJ1biwgaW5pdGlhbGl6aW5nIGFjdGlvbnMuLi4nKVxuXG4gICAgdGhpcy5hY3Rpb25zKClcblxuICAgIC8vIEZvcnNlIHNldCBgYXV0b1Byb2NlZWRgIG9wdGlvbiB0byBmYWxzZSBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgc2VsZWN0b3IgUGx1Z2lucyBhY3RpdmVcbiAgICAvLyBpZiAodGhpcy5wbHVnaW5zLmFjcXVpcmVyICYmIHRoaXMucGx1Z2lucy5hY3F1aXJlci5sZW5ndGggPiAxKSB7XG4gICAgLy8gICB0aGlzLm9wdHMuYXV0b1Byb2NlZWQgPSBmYWxzZVxuICAgIC8vIH1cblxuICAgIC8vIEluc3RhbGwgYWxsIHBsdWdpbnNcbiAgICAvLyB0aGlzLmluc3RhbGxBbGwoKVxuXG4gICAgcmV0dXJuXG4gIH1cblxuICB1cGxvYWQgKCkge1xuICAgIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKClcblxuICAgIHRoaXMuZW1pdCgnY29yZTp1cGxvYWQnKVxuXG4gICAgO1tdLmNvbmNhdChcbiAgICAgIHRoaXMucHJlUHJvY2Vzc29ycyxcbiAgICAgIHRoaXMudXBsb2FkZXJzLFxuICAgICAgdGhpcy5wb3N0UHJvY2Vzc29yc1xuICAgICkuZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oKCkgPT4gZm4oKSlcbiAgICB9KVxuXG4gICAgLy8gTm90IHJldHVybmluZyB0aGUgYGNhdGNoYGVkIHByb21pc2UsIGJlY2F1c2Ugd2Ugc3RpbGwgd2FudCB0byByZXR1cm4gYSByZWplY3RlZFxuICAgIC8vIHByb21pc2UgZnJvbSB0aGlzIG1ldGhvZCBpZiB0aGUgdXBsb2FkIGZhaWxlZC5cbiAgICBwcm9taXNlLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnY29yZTplcnJvcicsIGVycilcbiAgICB9KVxuXG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoJ2NvcmU6c3VjY2VzcycpXG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRzKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBVcHB5KSkge1xuICAgIHJldHVybiBuZXcgVXBweShvcHRzKVxuICB9XG59XG4iLCIvKipcbiAqIFRyYW5zbGF0ZXMgc3RyaW5ncyB3aXRoIGludGVycG9sYXRpb24gJiBwbHVyYWxpemF0aW9uIHN1cHBvcnQuXG4gKiBFeHRlbnNpYmxlIHdpdGggY3VzdG9tIGRpY3Rpb25hcmllcyBhbmQgcGx1cmFsaXphdGlvbiBmdW5jdGlvbnMuXG4gKlxuICogQm9ycm93cyBoZWF2aWx5IGZyb20gYW5kIGluc3BpcmVkIGJ5IFBvbHlnbG90IGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcG9seWdsb3QuanMsXG4gKiBiYXNpY2FsbHkgYSBzdHJpcHBlZC1kb3duIHZlcnNpb24gb2YgaXQuIERpZmZlcmVuY2VzOiBwbHVyYWxpemF0aW9uIGZ1bmN0aW9ucyBhcmUgbm90IGhhcmRjb2RlZFxuICogYW5kIGNhbiBiZSBlYXNpbHkgYWRkZWQgYW1vbmcgd2l0aCBkaWN0aW9uYXJpZXMsIG5lc3RlZCBvYmplY3RzIGFyZSB1c2VkIGZvciBwbHVyYWxpemF0aW9uXG4gKiBhcyBvcHBvc2VkIHRvIGB8fHx8YCBkZWxpbWV0ZXJcbiAqXG4gKiBVc2FnZSBleGFtcGxlOiBgdHJhbnNsYXRvci50cmFuc2xhdGUoJ2ZpbGVzX2Nob3NlbicsIHtzbWFydF9jb3VudDogM30pYFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVHJhbnNsYXRvciB7XG4gIGNvbnN0cnVjdG9yIChvcHRzKSB7XG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBsb2NhbGU6IHtcbiAgICAgICAgc3RyaW5nczoge30sXG4gICAgICAgIHBsdXJhbGl6ZTogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICBpZiAobiA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKVxuICAgIHRoaXMubG9jYWxlID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMubG9jYWxlLCBvcHRzLmxvY2FsZSlcblxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMub3B0cy5sb2NhbGUpXG5cbiAgICAvLyB0aGlzLmxvY2FsZS5wbHVyYWxpemUgPSB0aGlzLmxvY2FsZSA/IHRoaXMubG9jYWxlLnBsdXJhbGl6ZSA6IGRlZmF1bHRQbHVyYWxpemVcbiAgICAvLyB0aGlzLmxvY2FsZS5zdHJpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgZW5fVVMuc3RyaW5ncywgdGhpcy5vcHRzLmxvY2FsZS5zdHJpbmdzKVxuICB9XG5cbi8qKlxuICogVGFrZXMgYSBzdHJpbmcgd2l0aCBwbGFjZWhvbGRlciB2YXJpYWJsZXMgbGlrZSBgJXtzbWFydF9jb3VudH0gZmlsZSBzZWxlY3RlZGBcbiAqIGFuZCByZXBsYWNlcyBpdCB3aXRoIHZhbHVlcyBmcm9tIG9wdGlvbnMgYHtzbWFydF9jb3VudDogNX1gXG4gKlxuICogQGxpY2Vuc2UgaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKiB0YWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcG9seWdsb3QuanMvYmxvYi9tYXN0ZXIvbGliL3BvbHlnbG90LmpzI0wyOTlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlIHRoYXQgbmVlZHMgaW50ZXJwb2xhdGlvbiwgd2l0aCBwbGFjZWhvbGRlcnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGludGVycG9sYXRlZFxuICovXG4gIGludGVycG9sYXRlIChwaHJhc2UsIG9wdGlvbnMpIHtcbiAgICBjb25zdCByZXBsYWNlID0gU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlXG4gICAgY29uc3QgZG9sbGFyUmVnZXggPSAvXFwkL2dcbiAgICBjb25zdCBkb2xsYXJCaWxsc1lhbGwgPSAnJCQkJCdcblxuICAgIGZvciAobGV0IGFyZyBpbiBvcHRpb25zKSB7XG4gICAgICBpZiAoYXJnICE9PSAnXycgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShhcmcpKSB7XG4gICAgICAgIC8vIEVuc3VyZSByZXBsYWNlbWVudCB2YWx1ZSBpcyBlc2NhcGVkIHRvIHByZXZlbnQgc3BlY2lhbCAkLXByZWZpeGVkXG4gICAgICAgIC8vIHJlZ2V4IHJlcGxhY2UgdG9rZW5zLiB0aGUgXCIkJCQkXCIgaXMgbmVlZGVkIGJlY2F1c2UgZWFjaCBcIiRcIiBuZWVkcyB0b1xuICAgICAgICAvLyBiZSBlc2NhcGVkIHdpdGggXCIkXCIgaXRzZWxmLCBhbmQgd2UgbmVlZCB0d28gaW4gdGhlIHJlc3VsdGluZyBvdXRwdXQuXG4gICAgICAgIHZhciByZXBsYWNlbWVudCA9IG9wdGlvbnNbYXJnXVxuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJlcGxhY2VtZW50ID0gcmVwbGFjZS5jYWxsKG9wdGlvbnNbYXJnXSwgZG9sbGFyUmVnZXgsIGRvbGxhckJpbGxzWWFsbClcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBjcmVhdGUgYSBuZXcgYFJlZ0V4cGAgZWFjaCB0aW1lIGluc3RlYWQgb2YgdXNpbmcgYSBtb3JlLWVmZmljaWVudFxuICAgICAgICAvLyBzdHJpbmcgcmVwbGFjZSBzbyB0aGF0IHRoZSBzYW1lIGFyZ3VtZW50IGNhbiBiZSByZXBsYWNlZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICAvLyBpbiB0aGUgc2FtZSBwaHJhc2UuXG4gICAgICAgIHBocmFzZSA9IHJlcGxhY2UuY2FsbChwaHJhc2UsIG5ldyBSZWdFeHAoJyVcXFxceycgKyBhcmcgKyAnXFxcXH0nLCAnZycpLCByZXBsYWNlbWVudClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBocmFzZVxuICB9XG5cbi8qKlxuICogUHVibGljIHRyYW5zbGF0ZSBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCBsYXRlciB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBzdHJpbmdcbiAqIEByZXR1cm4ge3N0cmluZ30gdHJhbnNsYXRlZCAoYW5kIGludGVycG9sYXRlZClcbiAqL1xuICB0cmFuc2xhdGUgKGtleSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuc21hcnRfY291bnQpIHtcbiAgICAgIHZhciBwbHVyYWwgPSB0aGlzLmxvY2FsZS5wbHVyYWxpemUob3B0aW9ucy5zbWFydF9jb3VudClcbiAgICAgIHJldHVybiB0aGlzLmludGVycG9sYXRlKHRoaXMub3B0cy5sb2NhbGUuc3RyaW5nc1trZXldW3BsdXJhbF0sIG9wdGlvbnMpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW50ZXJwb2xhdGUodGhpcy5vcHRzLmxvY2FsZS5zdHJpbmdzW2tleV0sIG9wdGlvbnMpXG4gIH1cbn1cbiIsImNvbnN0IGVlID0gcmVxdWlyZSgnbmFtZXNwYWNlLWVtaXR0ZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFVwcHlTb2NrZXQge1xuICBjb25zdHJ1Y3RvciAob3B0cykge1xuICAgIHRoaXMucXVldWVkID0gW11cbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlXG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KG9wdHMudGFyZ2V0KVxuICAgIHRoaXMuZW1pdHRlciA9IGVlKClcblxuICAgIHRoaXMuc29ja2V0Lm9ub3BlbiA9IChlKSA9PiB7XG4gICAgICB0aGlzLmlzT3BlbiA9IHRydWVcblxuICAgICAgd2hpbGUgKHRoaXMucXVldWVkLmxlbmd0aCA+IDAgJiYgdGhpcy5pc09wZW4pIHtcbiAgICAgICAgY29uc3QgZmlyc3QgPSB0aGlzLnF1ZXVlZFswXVxuICAgICAgICB0aGlzLnNlbmQoZmlyc3QuYWN0aW9uLCBmaXJzdC5wYXlsb2FkKVxuICAgICAgICB0aGlzLnF1ZXVlZCA9IHRoaXMucXVldWVkLnNsaWNlKDEpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IChlKSA9PiB7XG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5faGFuZGxlTWVzc2FnZSA9IHRoaXMuX2hhbmRsZU1lc3NhZ2UuYmluZCh0aGlzKVxuXG4gICAgdGhpcy5zb2NrZXQub25tZXNzYWdlID0gdGhpcy5faGFuZGxlTWVzc2FnZVxuXG4gICAgdGhpcy5jbG9zZSA9IHRoaXMuY2xvc2UuYmluZCh0aGlzKVxuICAgIHRoaXMuZW1pdCA9IHRoaXMuZW1pdC5iaW5kKHRoaXMpXG4gICAgdGhpcy5vbiA9IHRoaXMub24uYmluZCh0aGlzKVxuICAgIHRoaXMub25jZSA9IHRoaXMub25jZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5zZW5kID0gdGhpcy5zZW5kLmJpbmQodGhpcylcbiAgfVxuXG4gIGNsb3NlICgpIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQuY2xvc2UoKVxuICB9XG5cbiAgc2VuZCAoYWN0aW9uLCBwYXlsb2FkKSB7XG4gICAgLy8gYXR0YWNoIHV1aWRcblxuICAgIGlmICghdGhpcy5pc09wZW4pIHtcbiAgICAgIHRoaXMucXVldWVkLnB1c2goe2FjdGlvbiwgcGF5bG9hZH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGFjdGlvbixcbiAgICAgIHBheWxvYWRcbiAgICB9KSlcbiAgfVxuXG4gIG9uIChhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICBjb25zb2xlLmxvZyhhY3Rpb24pXG4gICAgdGhpcy5lbWl0dGVyLm9uKGFjdGlvbiwgaGFuZGxlcilcbiAgfVxuXG4gIGVtaXQgKGFjdGlvbiwgcGF5bG9hZCkge1xuICAgIGNvbnNvbGUubG9nKGFjdGlvbilcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdChhY3Rpb24sIHBheWxvYWQpXG4gIH1cblxuICBvbmNlIChhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB0aGlzLmVtaXR0ZXIub25jZShhY3Rpb24sIGhhbmRsZXIpXG4gIH1cblxuICBfaGFuZGxlTWVzc2FnZSAoZSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShlLmRhdGEpXG4gICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKVxuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UuYWN0aW9uLCBtZXNzYWdlLnBheWxvYWQpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgfVxuICB9XG59XG4iLCIvLyBpbXBvcnQgbWltZSBmcm9tICdtaW1lLXR5cGVzJ1xuLy8gaW1wb3J0IHBpY2EgZnJvbSAncGljYSdcblxuLyoqXG4gKiBBIGNvbGxlY3Rpb24gb2Ygc21hbGwgdXRpbGl0eSBmdW5jdGlvbnMgdGhhdCBoZWxwIHdpdGggZG9tIG1hbmlwdWxhdGlvbiwgYWRkaW5nIGxpc3RlbmVycyxcbiAqIHByb21pc2VzIGFuZCBvdGhlciBnb29kIHRoaW5ncy5cbiAqXG4gKiBAbW9kdWxlIFV0aWxzXG4gKi9cblxuLyoqXG4gKiBTaGFsbG93IGZsYXR0ZW4gbmVzdGVkIGFycmF5cy5cbiAqL1xuZnVuY3Rpb24gZmxhdHRlbiAoYXJyKSB7XG4gIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIGFycilcbn1cblxuZnVuY3Rpb24gaXNUb3VjaERldmljZSAoKSB7XG4gIHJldHVybiAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgLy8gd29ya3Mgb24gbW9zdCBicm93c2Vyc1xuICAgICAgICAgIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyAgIC8vIHdvcmtzIG9uIElFMTAvMTEgYW5kIFN1cmZhY2Vcbn1cblxuLy8gLyoqXG4vLyAgKiBTaG9ydGVyIGFuZCBmYXN0IHdheSB0byBzZWxlY3QgYSBzaW5nbGUgbm9kZSBpbiB0aGUgRE9NXG4vLyAgKiBAcGFyYW0gICB7IFN0cmluZyB9IHNlbGVjdG9yIC0gdW5pcXVlIGRvbSBzZWxlY3RvclxuLy8gICogQHBhcmFtICAgeyBPYmplY3QgfSBjdHggLSBET00gbm9kZSB3aGVyZSB0aGUgdGFyZ2V0IG9mIG91ciBzZWFyY2ggd2lsbCBpcyBsb2NhdGVkXG4vLyAgKiBAcmV0dXJucyB7IE9iamVjdCB9IGRvbSBub2RlIGZvdW5kXG4vLyAgKi9cbi8vIGZ1bmN0aW9uICQgKHNlbGVjdG9yLCBjdHgpIHtcbi8vICAgcmV0dXJuIChjdHggfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4vLyB9XG5cbi8vIC8qKlxuLy8gICogU2hvcnRlciBhbmQgZmFzdCB3YXkgdG8gc2VsZWN0IG11bHRpcGxlIG5vZGVzIGluIHRoZSBET01cbi8vICAqIEBwYXJhbSAgIHsgU3RyaW5nfEFycmF5IH0gc2VsZWN0b3IgLSBET00gc2VsZWN0b3Igb3Igbm9kZXMgbGlzdFxuLy8gICogQHBhcmFtICAgeyBPYmplY3QgfSBjdHggLSBET00gbm9kZSB3aGVyZSB0aGUgdGFyZ2V0cyBvZiBvdXIgc2VhcmNoIHdpbGwgaXMgbG9jYXRlZFxuLy8gICogQHJldHVybnMgeyBPYmplY3QgfSBkb20gbm9kZXMgZm91bmRcbi8vICAqL1xuLy8gZnVuY3Rpb24gJCQgKHNlbGVjdG9yLCBjdHgpIHtcbi8vICAgdmFyIGVsc1xuLy8gICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuLy8gICAgIGVscyA9IChjdHggfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4vLyAgIH0gZWxzZSB7XG4vLyAgICAgZWxzID0gc2VsZWN0b3Jcbi8vICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWxzKVxuLy8gICB9XG4vLyB9XG5cbmZ1bmN0aW9uIHRydW5jYXRlU3RyaW5nIChzdHIsIGxlbmd0aCkge1xuICBpZiAoc3RyLmxlbmd0aCA+IGxlbmd0aCkge1xuICAgIHJldHVybiBzdHIuc3Vic3RyKDAsIGxlbmd0aCAvIDIpICsgJy4uLicgKyBzdHIuc3Vic3RyKHN0ci5sZW5ndGggLSBsZW5ndGggLyA0LCBzdHIubGVuZ3RoKVxuICB9XG4gIHJldHVybiBzdHJcblxuICAvLyBtb3JlIHByZWNpc2UgdmVyc2lvbiBpZiBuZWVkZWRcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODMxNTgzXG59XG5cbmZ1bmN0aW9uIHNlY29uZHNUb1RpbWUgKHJhd1NlY29uZHMpIHtcbiAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKHJhd1NlY29uZHMgLyAzNjAwKSAlIDI0XG4gIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKHJhd1NlY29uZHMgLyA2MCkgJSA2MFxuICBjb25zdCBzZWNvbmRzID0gTWF0aC5mbG9vcihyYXdTZWNvbmRzICUgNjApXG5cbiAgcmV0dXJuIHsgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMgfVxufVxuXG4vKipcbiAqIFBhcnRpdGlvbiBhcnJheSBieSBhIGdyb3VwaW5nIGZ1bmN0aW9uLlxuICogQHBhcmFtICB7W3R5cGVdfSBhcnJheSAgICAgIElucHV0IGFycmF5XG4gKiBAcGFyYW0gIHtbdHlwZV19IGdyb3VwaW5nRm4gR3JvdXBpbmcgZnVuY3Rpb25cbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgICAgICBBcnJheSBvZiBhcnJheXNcbiAqL1xuZnVuY3Rpb24gZ3JvdXBCeSAoYXJyYXksIGdyb3VwaW5nRm4pIHtcbiAgcmV0dXJuIGFycmF5LnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XG4gICAgbGV0IGtleSA9IGdyb3VwaW5nRm4oaXRlbSlcbiAgICBsZXQgeHMgPSByZXN1bHQuZ2V0KGtleSkgfHwgW11cbiAgICB4cy5wdXNoKGl0ZW0pXG4gICAgcmVzdWx0LnNldChrZXksIHhzKVxuICAgIHJldHVybiByZXN1bHRcbiAgfSwgbmV3IE1hcCgpKVxufVxuXG4vKipcbiAqIFRlc3RzIGlmIGV2ZXJ5IGFycmF5IGVsZW1lbnQgcGFzc2VzIHByZWRpY2F0ZVxuICogQHBhcmFtICB7QXJyYXl9ICBhcnJheSAgICAgICBJbnB1dCBhcnJheVxuICogQHBhcmFtICB7T2JqZWN0fSBwcmVkaWNhdGVGbiBQcmVkaWNhdGVcbiAqIEByZXR1cm4ge2Jvb2x9ICAgICAgICAgICAgICAgRXZlcnkgZWxlbWVudCBwYXNzXG4gKi9cbmZ1bmN0aW9uIGV2ZXJ5IChhcnJheSwgcHJlZGljYXRlRm4pIHtcbiAgcmV0dXJuIGFycmF5LnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiBwcmVkaWNhdGVGbihpdGVtKVxuICB9LCB0cnVlKVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGxpc3QgaW50byBhcnJheVxuKi9cbmZ1bmN0aW9uIHRvQXJyYXkgKGxpc3QpIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGxpc3QgfHwgW10sIDApXG59XG5cbi8qKlxuICogVGFrZXMgYSBmaWxlTmFtZSBhbmQgdHVybnMgaXQgaW50byBmaWxlSUQsIGJ5IGNvbnZlcnRpbmcgdG8gbG93ZXJjYXNlLFxuICogcmVtb3ZpbmcgZXh0cmEgY2hhcmFjdGVycyBhbmQgYWRkaW5nIHVuaXggdGltZXN0YW1wXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVOYW1lXG4gKlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUZpbGVJRCAoZmlsZU5hbWUpIHtcbiAgbGV0IGZpbGVJRCA9IGZpbGVOYW1lLnRvTG93ZXJDYXNlKClcbiAgZmlsZUlEID0gZmlsZUlELnJlcGxhY2UoL1teQS1aMC05XS9pZywgJycpXG4gIGZpbGVJRCA9IGZpbGVJRCArIERhdGUubm93KClcbiAgcmV0dXJuIGZpbGVJRFxufVxuXG5mdW5jdGlvbiBleHRlbmQgKC4uLm9ianMpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24uYXBwbHkodGhpcywgW3t9XS5jb25jYXQob2JqcykpXG59XG5cbi8qKlxuICogVGFrZXMgZnVuY3Rpb24gb3IgY2xhc3MsIHJldHVybnMgaXRzIG5hbWUuXG4gKiBCZWNhdXNlIElFIGRvZXNu4oCZdCBzdXBwb3J0IGBjb25zdHJ1Y3Rvci5uYW1lYC5cbiAqIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2Rma2F5ZS82Mzg0NDM5LCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNTcxNDQ0NVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBmbiDigJQgZnVuY3Rpb25cbiAqXG4gKi9cbi8vIGZ1bmN0aW9uIGdldEZuTmFtZSAoZm4pIHtcbi8vICAgdmFyIGYgPSB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbidcbi8vICAgdmFyIHMgPSBmICYmICgoZm4ubmFtZSAmJiBbJycsIGZuLm5hbWVdKSB8fCBmbi50b1N0cmluZygpLm1hdGNoKC9mdW5jdGlvbiAoW15cXChdKykvKSlcbi8vICAgcmV0dXJuICghZiAmJiAnbm90IGEgZnVuY3Rpb24nKSB8fCAocyAmJiBzWzFdIHx8ICdhbm9ueW1vdXMnKVxuLy8gfVxuXG5mdW5jdGlvbiBnZXRQcm9wb3J0aW9uYWxJbWFnZUhlaWdodCAoaW1nLCBuZXdXaWR0aCkge1xuICB2YXIgYXNwZWN0ID0gaW1nLndpZHRoIC8gaW1nLmhlaWdodFxuICB2YXIgbmV3SGVpZ2h0ID0gTWF0aC5yb3VuZChuZXdXaWR0aCAvIGFzcGVjdClcbiAgcmV0dXJuIG5ld0hlaWdodFxufVxuXG5mdW5jdGlvbiBnZXRGaWxlVHlwZSAoZmlsZSkge1xuICByZXR1cm4gZmlsZS50eXBlID8gZmlsZS50eXBlLnNwbGl0KCcvJykgOiBbJycsICcnXVxuICAvLyByZXR1cm4gbWltZS5sb29rdXAoZmlsZS5uYW1lKVxufVxuXG4vLyBUT0RPIENoZWNrIHdoaWNoIHR5cGVzIGFyZSBhY3R1YWxseSBzdXBwb3J0ZWQgaW4gYnJvd3NlcnMuIENocm9tZSBsaWtlcyB3ZWJtXG4vLyBmcm9tIG15IHRlc3RpbmcsIGJ1dCB3ZSBtYXkgbmVlZCBtb3JlLlxuLy8gV2UgY291bGQgdXNlIGEgbGlicmFyeSBidXQgdGhleSB0ZW5kIHRvIGNvbnRhaW4gZG96ZW5zIG9mIEtCcyBvZiBtYXBwaW5ncyxcbi8vIG1vc3Qgb2Ygd2hpY2ggd2lsbCBnbyB1bnVzZWQsIHNvIG5vdCBzdXJlIGlmIHRoYXQncyB3b3J0aCBpdC5cbmNvbnN0IG1pbWVUb0V4dGVuc2lvbnMgPSB7XG4gICd2aWRlby9vZ2cnOiAnb2d2JyxcbiAgJ2F1ZGlvL29nZyc6ICdvZ2cnLFxuICAndmlkZW8vd2VibSc6ICd3ZWJtJyxcbiAgJ2F1ZGlvL3dlYm0nOiAnd2VibScsXG4gICd2aWRlby9tcDQnOiAnbXA0JyxcbiAgJ2F1ZGlvL21wMyc6ICdtcDMnXG59XG5cbmZ1bmN0aW9uIGdldEZpbGVUeXBlRXh0ZW5zaW9uIChtaW1lVHlwZSkge1xuICByZXR1cm4gbWltZVRvRXh0ZW5zaW9uc1ttaW1lVHlwZV0gfHwgbnVsbFxufVxuXG4vLyByZXR1cm5zIFtmaWxlTmFtZSwgZmlsZUV4dF1cbmZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uIChmdWxsRmlsZU5hbWUpIHtcbiAgdmFyIHJlID0gLyg/OlxcLihbXi5dKykpPyQvXG4gIHZhciBmaWxlRXh0ID0gcmUuZXhlYyhmdWxsRmlsZU5hbWUpWzFdXG4gIHZhciBmaWxlTmFtZSA9IGZ1bGxGaWxlTmFtZS5yZXBsYWNlKCcuJyArIGZpbGVFeHQsICcnKVxuICByZXR1cm4gW2ZpbGVOYW1lLCBmaWxlRXh0XVxufVxuXG4vKipcbiAqIFJlYWRzIGZpbGUgYXMgZGF0YSBVUkkgZnJvbSBmaWxlIG9iamVjdCxcbiAqIHRoZSBvbmUgeW91IGdldCBmcm9tIGlucHV0W3R5cGU9ZmlsZV0gb3IgZHJhZyAmIGRyb3AuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGZpbGUgb2JqZWN0XG4gKiBAcmV0dXJuIHtQcm9taXNlfSBkYXRhVVJMIG9mIHRoZSBmaWxlXG4gKlxuICovXG5mdW5jdGlvbiByZWFkRmlsZSAoZmlsZU9iaikge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIChldikge1xuICAgICAgcmV0dXJuIHJlc29sdmUoZXYudGFyZ2V0LnJlc3VsdClcbiAgICB9KVxuICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVPYmopXG5cbiAgICAvLyBmdW5jdGlvbiB3b3JrZXJTY3JpcHQgKCkge1xuICAgIC8vICAgc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGUpID0+IHtcbiAgICAvLyAgICAgY29uc3QgZmlsZSA9IGUuZGF0YS5maWxlXG4gICAgLy8gICAgIHRyeSB7XG4gICAgLy8gICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJTeW5jKClcbiAgICAvLyAgICAgICBwb3N0TWVzc2FnZSh7XG4gICAgLy8gICAgICAgICBmaWxlOiByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKVxuICAgIC8vICAgICAgIH0pXG4gICAgLy8gICAgIH0gY2F0Y2ggKGVycikge1xuICAgIC8vICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSlcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyBjb25zdCB3b3JrZXIgPSBtYWtlV29ya2VyKHdvcmtlclNjcmlwdClcbiAgICAvLyB3b3JrZXIucG9zdE1lc3NhZ2Uoe2ZpbGU6IGZpbGVPYmp9KVxuICAgIC8vIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGUpID0+IHtcbiAgICAvLyAgIGNvbnN0IGZpbGVEYXRhVVJMID0gZS5kYXRhLmZpbGVcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdGSUxFIF8gREFUQSBfIFVSTCcpXG4gICAgLy8gICByZXR1cm4gcmVzb2x2ZShmaWxlRGF0YVVSTClcbiAgICAvLyB9KVxuICB9KVxufVxuXG4vKipcbiAqIFJlc2l6ZXMgYW4gaW1hZ2UgdG8gc3BlY2lmaWVkIHdpZHRoIGFuZCBwcm9wb3J0aW9uYWwgaGVpZ2h0LCB1c2luZyBjYW52YXNcbiAqIFNlZSBodHRwczovL2Rhdmlkd2Fsc2gubmFtZS9yZXNpemUtaW1hZ2UtY2FudmFzLFxuICogaHR0cDovL2JhYmFsYW4uY29tL3Jlc2l6aW5nLWltYWdlcy13aXRoLWphdmFzY3JpcHQvXG4gKiBAVE9ETyBzZWUgaWYgd2UgbmVlZCBodHRwczovL2dpdGh1Yi5jb20vc3RvbWl0YS9pb3MtaW1hZ2VmaWxlLW1lZ2FwaXhlbCBmb3IgaU9TXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IERhdGEgVVJJIG9mIHRoZSBvcmlnaW5hbCBpbWFnZVxuICogQHBhcmFtIHtTdHJpbmd9IHdpZHRoIG9mIHRoZSByZXN1bHRpbmcgaW1hZ2VcbiAqIEByZXR1cm4ge1N0cmluZ30gRGF0YSBVUkkgb2YgdGhlIHJlc2l6ZWQgaW1hZ2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW1hZ2VUaHVtYm5haWwgKGltZ0RhdGFVUkksIG5ld1dpZHRoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKClcbiAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IG5ld0ltYWdlV2lkdGggPSBuZXdXaWR0aFxuICAgICAgY29uc3QgbmV3SW1hZ2VIZWlnaHQgPSBnZXRQcm9wb3J0aW9uYWxJbWFnZUhlaWdodChpbWcsIG5ld0ltYWdlV2lkdGgpXG5cbiAgICAgIC8vIGNyZWF0ZSBhbiBvZmYtc2NyZWVuIGNhbnZhc1xuICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICAgIC8vIHNldCBpdHMgZGltZW5zaW9uIHRvIHRhcmdldCBzaXplXG4gICAgICBjYW52YXMud2lkdGggPSBuZXdJbWFnZVdpZHRoXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gbmV3SW1hZ2VIZWlnaHRcblxuICAgICAgLy8gZHJhdyBzb3VyY2UgaW1hZ2UgaW50byB0aGUgb2ZmLXNjcmVlbiBjYW52YXM6XG4gICAgICAvLyBjdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpXG4gICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCwgbmV3SW1hZ2VXaWR0aCwgbmV3SW1hZ2VIZWlnaHQpXG5cbiAgICAgIC8vIHBpY2EucmVzaXplQ2FudmFzKGltZywgY2FudmFzLCAoZXJyKSA9PiB7XG4gICAgICAvLyAgIGlmIChlcnIpIGNvbnNvbGUubG9nKGVycilcbiAgICAgIC8vICAgY29uc3QgdGh1bWJuYWlsID0gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJylcbiAgICAgIC8vICAgcmV0dXJuIHJlc29sdmUodGh1bWJuYWlsKVxuICAgICAgLy8gfSlcblxuICAgICAgLy8gZW5jb2RlIGltYWdlIHRvIGRhdGEtdXJpIHdpdGggYmFzZTY0IHZlcnNpb24gb2YgY29tcHJlc3NlZCBpbWFnZVxuICAgICAgLy8gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvanBlZycsIHF1YWxpdHkpOyAgLy8gcXVhbGl0eSA9IFswLjAsIDEuMF1cbiAgICAgIGNvbnN0IHRodW1ibmFpbCA9IGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpXG4gICAgICByZXR1cm4gcmVzb2x2ZSh0aHVtYm5haWwpXG4gICAgfSlcbiAgICBpbWcuc3JjID0gaW1nRGF0YVVSSVxuICB9KVxufVxuXG5mdW5jdGlvbiBzdXBwb3J0c01lZGlhUmVjb3JkZXIgKCkge1xuICByZXR1cm4gdHlwZW9mIE1lZGlhUmVjb3JkZXIgPT09ICdmdW5jdGlvbicgJiYgISFNZWRpYVJlY29yZGVyLnByb3RvdHlwZSAmJlxuICAgIHR5cGVvZiBNZWRpYVJlY29yZGVyLnByb3RvdHlwZS5zdGFydCA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5mdW5jdGlvbiBkYXRhVVJJdG9CbG9iIChkYXRhVVJJLCBvcHRzLCB0b0ZpbGUpIHtcbiAgLy8gZ2V0IHRoZSBiYXNlNjQgZGF0YVxuICB2YXIgZGF0YSA9IGRhdGFVUkkuc3BsaXQoJywnKVsxXVxuXG4gIC8vIHVzZXIgbWF5IHByb3ZpZGUgbWltZSB0eXBlLCBpZiBub3QgZ2V0IGl0IGZyb20gZGF0YSBVUklcbiAgdmFyIG1pbWVUeXBlID0gb3B0cy5taW1lVHlwZSB8fCBkYXRhVVJJLnNwbGl0KCcsJylbMF0uc3BsaXQoJzonKVsxXS5zcGxpdCgnOycpWzBdXG5cbiAgLy8gZGVmYXVsdCB0byBwbGFpbi90ZXh0IGlmIGRhdGEgVVJJIGhhcyBubyBtaW1lVHlwZVxuICBpZiAobWltZVR5cGUgPT0gbnVsbCkge1xuICAgIG1pbWVUeXBlID0gJ3BsYWluL3RleHQnXG4gIH1cblxuICB2YXIgYmluYXJ5ID0gYXRvYihkYXRhKVxuICB2YXIgYXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5LnB1c2goYmluYXJ5LmNoYXJDb2RlQXQoaSkpXG4gIH1cblxuICAvLyBDb252ZXJ0IHRvIGEgRmlsZT9cbiAgaWYgKHRvRmlsZSkge1xuICAgIHJldHVybiBuZXcgRmlsZShbbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXSwgb3B0cy5uYW1lIHx8ICcnLCB7dHlwZTogbWltZVR5cGV9KVxuICB9XG5cbiAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShhcnJheSldLCB7dHlwZTogbWltZVR5cGV9KVxufVxuXG5mdW5jdGlvbiBkYXRhVVJJdG9GaWxlIChkYXRhVVJJLCBvcHRzKSB7XG4gIHJldHVybiBkYXRhVVJJdG9CbG9iKGRhdGFVUkksIG9wdHMsIHRydWUpXG59XG5cbi8qKlxuICogQ29waWVzIHRleHQgdG8gY2xpcGJvYXJkIGJ5IGNyZWF0aW5nIGFuIGFsbW9zdCBpbnZpc2libGUgdGV4dGFyZWEsXG4gKiBhZGRpbmcgdGV4dCB0aGVyZSwgdGhlbiBydW5uaW5nIGV4ZWNDb21tYW5kKCdjb3B5JykuXG4gKiBGYWxscyBiYWNrIHRvIHByb21wdCgpIHdoZW4gdGhlIGVhc3kgd2F5IGZhaWxzIChoZWxsbywgU2FmYXJpISlcbiAqIEZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzA4MTAzMjJcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dFRvQ29weVxuICogQHBhcmFtIHtTdHJpbmd9IGZhbGxiYWNrU3RyaW5nXG4gKiBAcmV0dXJuIHtQcm9taXNlfVxuICovXG5mdW5jdGlvbiBjb3B5VG9DbGlwYm9hcmQgKHRleHRUb0NvcHksIGZhbGxiYWNrU3RyaW5nKSB7XG4gIGZhbGxiYWNrU3RyaW5nID0gZmFsbGJhY2tTdHJpbmcgfHwgJ0NvcHkgdGhlIFVSTCBiZWxvdydcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHRleHRBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICAgIHRleHRBcmVhLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCB7XG4gICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB3aWR0aDogJzJlbScsXG4gICAgICBoZWlnaHQ6ICcyZW0nLFxuICAgICAgcGFkZGluZzogMCxcbiAgICAgIGJvcmRlcjogJ25vbmUnLFxuICAgICAgb3V0bGluZTogJ25vbmUnLFxuICAgICAgYm94U2hhZG93OiAnbm9uZScsXG4gICAgICBiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnXG4gICAgfSlcblxuICAgIHRleHRBcmVhLnZhbHVlID0gdGV4dFRvQ29weVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGV4dEFyZWEpXG4gICAgdGV4dEFyZWEuc2VsZWN0KClcblxuICAgIGNvbnN0IG1hZ2ljQ29weUZhaWxlZCA9IChlcnIpID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGV4dEFyZWEpXG4gICAgICB3aW5kb3cucHJvbXB0KGZhbGxiYWNrU3RyaW5nLCB0ZXh0VG9Db3B5KVxuICAgICAgcmV0dXJuIHJlamVjdCgnT29wcywgdW5hYmxlIHRvIGNvcHkgZGlzcGxheWVkIGZhbGxiYWNrIHByb21wdDogJyArIGVycilcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgICAgIGlmICghc3VjY2Vzc2Z1bCkge1xuICAgICAgICByZXR1cm4gbWFnaWNDb3B5RmFpbGVkKCdjb3B5IGNvbW1hbmQgdW5hdmFpbGFibGUnKVxuICAgICAgfVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZXh0QXJlYSlcbiAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGV4dEFyZWEpXG4gICAgICByZXR1cm4gbWFnaWNDb3B5RmFpbGVkKGVycilcbiAgICB9XG4gIH0pXG59XG5cbi8vIGZ1bmN0aW9uIGNyZWF0ZUlubGluZVdvcmtlciAod29ya2VyRnVuY3Rpb24pIHtcbi8vICAgbGV0IGNvZGUgPSB3b3JrZXJGdW5jdGlvbi50b1N0cmluZygpXG4vLyAgIGNvZGUgPSBjb2RlLnN1YnN0cmluZyhjb2RlLmluZGV4T2YoJ3snKSArIDEsIGNvZGUubGFzdEluZGV4T2YoJ30nKSlcbi8vXG4vLyAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY29kZV0sIHt0eXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCd9KVxuLy8gICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpXG4vL1xuLy8gICByZXR1cm4gd29ya2VyXG4vLyB9XG5cbi8vIGZ1bmN0aW9uIG1ha2VXb3JrZXIgKHNjcmlwdCkge1xuLy8gICB2YXIgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMXG4vLyAgIHZhciBCbG9iID0gd2luZG93LkJsb2Jcbi8vICAgdmFyIFdvcmtlciA9IHdpbmRvdy5Xb3JrZXJcbi8vXG4vLyAgIGlmICghVVJMIHx8ICFCbG9iIHx8ICFXb3JrZXIgfHwgIXNjcmlwdCkge1xuLy8gICAgIHJldHVybiBudWxsXG4vLyAgIH1cbi8vXG4vLyAgIGxldCBjb2RlID0gc2NyaXB0LnRvU3RyaW5nKClcbi8vICAgY29kZSA9IGNvZGUuc3Vic3RyaW5nKGNvZGUuaW5kZXhPZigneycpICsgMSwgY29kZS5sYXN0SW5kZXhPZignfScpKVxuLy9cbi8vICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbY29kZV0pXG4vLyAgIHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpXG4vLyAgIHJldHVybiB3b3JrZXJcbi8vIH1cblxuZnVuY3Rpb24gZ2V0U3BlZWQgKGZpbGVQcm9ncmVzcykge1xuICBpZiAoIWZpbGVQcm9ncmVzcy5ieXRlc1VwbG9hZGVkKSByZXR1cm4gMFxuXG4gIGNvbnN0IHRpbWVFbGFwc2VkID0gKG5ldyBEYXRlKCkpIC0gZmlsZVByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgY29uc3QgdXBsb2FkU3BlZWQgPSBmaWxlUHJvZ3Jlc3MuYnl0ZXNVcGxvYWRlZCAvICh0aW1lRWxhcHNlZCAvIDEwMDApXG4gIHJldHVybiB1cGxvYWRTcGVlZFxufVxuXG5mdW5jdGlvbiBnZXRFVEEgKGZpbGVQcm9ncmVzcykge1xuICBpZiAoIWZpbGVQcm9ncmVzcy5ieXRlc1VwbG9hZGVkKSByZXR1cm4gMFxuXG4gIGNvbnN0IHVwbG9hZFNwZWVkID0gZ2V0U3BlZWQoZmlsZVByb2dyZXNzKVxuICBjb25zdCBieXRlc1JlbWFpbmluZyA9IGZpbGVQcm9ncmVzcy5ieXRlc1RvdGFsIC0gZmlsZVByb2dyZXNzLmJ5dGVzVXBsb2FkZWRcbiAgY29uc3Qgc2Vjb25kc1JlbWFpbmluZyA9IE1hdGgucm91bmQoYnl0ZXNSZW1haW5pbmcgLyB1cGxvYWRTcGVlZCAqIDEwKSAvIDEwXG5cbiAgcmV0dXJuIHNlY29uZHNSZW1haW5pbmdcbn1cblxuZnVuY3Rpb24gcHJldHR5RVRBIChzZWNvbmRzKSB7XG4gIGNvbnN0IHRpbWUgPSBzZWNvbmRzVG9UaW1lKHNlY29uZHMpXG5cbiAgLy8gT25seSBkaXNwbGF5IGhvdXJzIGFuZCBtaW51dGVzIGlmIHRoZXkgYXJlIGdyZWF0ZXIgdGhhbiAwIGJ1dCBhbHdheXNcbiAgLy8gZGlzcGxheSBtaW51dGVzIGlmIGhvdXJzIGlzIGJlaW5nIGRpc3BsYXllZFxuICAvLyBEaXNwbGF5IGEgbGVhZGluZyB6ZXJvIGlmIHRoZSB0aGVyZSBpcyBhIHByZWNlZGluZyB1bml0OiAxbSAwNXMsIGJ1dCA1c1xuICBjb25zdCBob3Vyc1N0ciA9IHRpbWUuaG91cnMgPyB0aW1lLmhvdXJzICsgJ2ggJyA6ICcnXG4gIGNvbnN0IG1pbnV0ZXNWYWwgPSB0aW1lLmhvdXJzID8gKCcwJyArIHRpbWUubWludXRlcykuc3Vic3RyKC0yKSA6IHRpbWUubWludXRlc1xuICBjb25zdCBtaW51dGVzU3RyID0gbWludXRlc1ZhbCA/IG1pbnV0ZXNWYWwgKyAnbSAnIDogJydcbiAgY29uc3Qgc2Vjb25kc1ZhbCA9IG1pbnV0ZXNWYWwgPyAoJzAnICsgdGltZS5zZWNvbmRzKS5zdWJzdHIoLTIpIDogdGltZS5zZWNvbmRzXG4gIGNvbnN0IHNlY29uZHNTdHIgPSBzZWNvbmRzVmFsICsgJ3MnXG5cbiAgcmV0dXJuIGAke2hvdXJzU3RyfSR7bWludXRlc1N0cn0ke3NlY29uZHNTdHJ9YFxufVxuXG4vLyBmdW5jdGlvbiBtYWtlQ2FjaGluZ0Z1bmN0aW9uICgpIHtcbi8vICAgbGV0IGNhY2hlZEVsID0gbnVsbFxuLy8gICBsZXQgbGFzdFVwZGF0ZSA9IERhdGUubm93KClcbi8vXG4vLyAgIHJldHVybiBmdW5jdGlvbiBjYWNoZUVsZW1lbnQgKGVsLCB0aW1lKSB7XG4vLyAgICAgaWYgKERhdGUubm93KCkgLSBsYXN0VXBkYXRlIDwgdGltZSkge1xuLy8gICAgICAgcmV0dXJuIGNhY2hlZEVsXG4vLyAgICAgfVxuLy9cbi8vICAgICBjYWNoZWRFbCA9IGVsXG4vLyAgICAgbGFzdFVwZGF0ZSA9IERhdGUubm93KClcbi8vXG4vLyAgICAgcmV0dXJuIGVsXG4vLyAgIH1cbi8vIH1cblxuLyoqXG4gKiBDaGVjayBpZiBhbiBvYmplY3QgaXMgYSBET00gZWxlbWVudC4gRHVjay10eXBpbmcgYmFzZWQgb24gYG5vZGVUeXBlYC5cbiAqXG4gKiBAcGFyYW0geyp9IG9ialxuICovXG5mdW5jdGlvbiBpc0RPTUVsZW1lbnQgKG9iaikge1xuICByZXR1cm4gb2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iai5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREVcbn1cblxuLyoqXG4gKiBGaW5kIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtOb2RlfHN0cmluZ30gZWxlbWVudFxuICogQHJldHVybiB7Tm9kZXxudWxsfVxuICovXG5mdW5jdGlvbiBmaW5kRE9NRWxlbWVudCAoZWxlbWVudCkge1xuICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudClcbiAgfVxuXG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ29iamVjdCcgJiYgaXNET01FbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuZXJhdGVGaWxlSUQsXG4gIHRvQXJyYXksXG4gIGV2ZXJ5LFxuICBmbGF0dGVuLFxuICBncm91cEJ5LFxuICAvLyAkLFxuICAvLyAkJCxcbiAgZXh0ZW5kLFxuICByZWFkRmlsZSxcbiAgY3JlYXRlSW1hZ2VUaHVtYm5haWwsXG4gIGdldFByb3BvcnRpb25hbEltYWdlSGVpZ2h0LFxuICBzdXBwb3J0c01lZGlhUmVjb3JkZXIsXG4gIGlzVG91Y2hEZXZpY2UsXG4gIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uLFxuICB0cnVuY2F0ZVN0cmluZyxcbiAgZ2V0RmlsZVR5cGVFeHRlbnNpb24sXG4gIGdldEZpbGVUeXBlLFxuICBzZWNvbmRzVG9UaW1lLFxuICBkYXRhVVJJdG9CbG9iLFxuICBkYXRhVVJJdG9GaWxlLFxuICBnZXRTcGVlZCxcbiAgZ2V0RVRBLFxuICAvLyBtYWtlV29ya2VyLFxuICAvLyBtYWtlQ2FjaGluZ0Z1bmN0aW9uLFxuICBjb3B5VG9DbGlwYm9hcmQsXG4gIHByZXR0eUVUQSxcbiAgZmluZERPTUVsZW1lbnRcbn1cbiIsImNvbnN0IGh0bWwgPSByZXF1aXJlKCd5by15bycpXG5cbm1vZHVsZS5leHBvcnRzID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IGRlbW9MaW5rID0gcHJvcHMuZGVtbyA/IGh0bWxgPGJ1dHRvbiBjbGFzcz1cIlVwcHlQcm92aWRlci1hdXRoQnRuRGVtb1wiIG9uY2xpY2s9JHtwcm9wcy5oYW5kbGVEZW1vQXV0aH0+UHJvY2VlZCB3aXRoIERlbW8gQWNjb3VudDwvYnV0dG9uPmAgOiBudWxsXG4gIHJldHVybiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJVcHB5UHJvdmlkZXItYXV0aFwiPlxuICAgICAgPGgxIGNsYXNzPVwiVXBweVByb3ZpZGVyLWF1dGhUaXRsZVwiPlxuICAgICAgICBQbGVhc2UgYXV0aGVudGljYXRlIHdpdGggPHNwYW4gY2xhc3M9XCJVcHB5UHJvdmlkZXItYXV0aFRpdGxlTmFtZVwiPiR7cHJvcHMucGx1Z2luTmFtZX08L3NwYW4+PGJyPiB0byBzZWxlY3QgZmlsZXNcbiAgICAgIDwvaDE+XG4gICAgICA8YnV0dG9uIGNsYXNzPVwiVXBweVByb3ZpZGVyLWF1dGhCdG5cIiBvbmNsaWNrPSR7cHJvcHMuaGFuZGxlQXV0aH0+QXV0aGVudGljYXRlPC9idXR0b24+XG4gICAgICAke2RlbW9MaW5rfVxuICAgIDwvZGl2PlxuICBgXG59XG4iLCJjb25zdCBodG1sID0gcmVxdWlyZSgneW8teW8nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChwcm9wcykgPT4ge1xuICByZXR1cm4gaHRtbGBcbiAgICA8bGk+XG4gICAgICA8YnV0dG9uIG9uY2xpY2s9JHtwcm9wcy5nZXRGb2xkZXJ9PiR7cHJvcHMudGl0bGV9PC9idXR0b24+XG4gICAgPC9saT5cbiAgYFxufVxuIiwiY29uc3QgaHRtbCA9IHJlcXVpcmUoJ3lvLXlvJylcbmNvbnN0IEJyZWFkY3J1bWIgPSByZXF1aXJlKCcuL0JyZWFkY3J1bWInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChwcm9wcykgPT4ge1xuICByZXR1cm4gaHRtbGBcbiAgICA8dWwgY2xhc3M9XCJVcHB5UHJvdmlkZXItYnJlYWRjcnVtYnNcIj5cbiAgICAgICR7XG4gICAgICAgIHByb3BzLmRpcmVjdG9yaWVzLm1hcCgoZGlyZWN0b3J5KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIEJyZWFkY3J1bWIoe1xuICAgICAgICAgICAgZ2V0Rm9sZGVyOiAoKSA9PiBwcm9wcy5nZXRGb2xkZXIoZGlyZWN0b3J5LmlkKSxcbiAgICAgICAgICAgIHRpdGxlOiBkaXJlY3RvcnkudGl0bGVcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIDwvdWw+XG4gIGBcbn1cbiIsImNvbnN0IGh0bWwgPSByZXF1aXJlKCd5by15bycpXG5jb25zdCBCcmVhZGNydW1icyA9IHJlcXVpcmUoJy4vQnJlYWRjcnVtYnMnKVxuY29uc3QgVGFibGUgPSByZXF1aXJlKCcuL1RhYmxlJylcblxubW9kdWxlLmV4cG9ydHMgPSAocHJvcHMpID0+IHtcbiAgbGV0IGZpbHRlcmVkRm9sZGVycyA9IHByb3BzLmZvbGRlcnNcbiAgbGV0IGZpbHRlcmVkRmlsZXMgPSBwcm9wcy5maWxlc1xuXG4gIGlmIChwcm9wcy5maWx0ZXJJbnB1dCAhPT0gJycpIHtcbiAgICBmaWx0ZXJlZEZvbGRlcnMgPSBwcm9wcy5maWx0ZXJJdGVtcyhwcm9wcy5mb2xkZXJzKVxuICAgIGZpbHRlcmVkRmlsZXMgPSBwcm9wcy5maWx0ZXJJdGVtcyhwcm9wcy5maWxlcylcbiAgfVxuXG4gIHJldHVybiBodG1sYFxuICAgIDxkaXYgY2xhc3M9XCJCcm93c2VyXCI+XG4gICAgICA8aGVhZGVyPlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgY2xhc3M9XCJCcm93c2VyLXNlYXJjaFwiXG4gICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggRHJpdmVcIlxuICAgICAgICAgIG9ua2V5dXA9JHtwcm9wcy5maWx0ZXJRdWVyeX1cbiAgICAgICAgICB2YWx1ZT0ke3Byb3BzLmZpbHRlcklucHV0fS8+XG4gICAgICA8L2hlYWRlcj5cbiAgICAgIDxkaXYgY2xhc3M9XCJCcm93c2VyLXN1YkhlYWRlclwiPlxuICAgICAgICAke0JyZWFkY3J1bWJzKHtcbiAgICAgICAgICBnZXRGb2xkZXI6IHByb3BzLmdldEZvbGRlcixcbiAgICAgICAgICBkaXJlY3RvcmllczogcHJvcHMuZGlyZWN0b3JpZXNcbiAgICAgICAgfSl9XG4gICAgICAgIDxidXR0b24gb25jbGljaz0ke3Byb3BzLmxvZ291dH0gY2xhc3M9XCJCcm93c2VyLXVzZXJMb2dvdXRcIj5Mb2cgb3V0PC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJCcm93c2VyLWJvZHlcIj5cbiAgICAgICAgPG1haW4gY2xhc3M9XCJCcm93c2VyLWNvbnRlbnRcIj5cbiAgICAgICAgICAke1RhYmxlKHtcbiAgICAgICAgICAgIGNvbHVtbnM6IFt7XG4gICAgICAgICAgICAgIG5hbWU6ICdOYW1lJyxcbiAgICAgICAgICAgICAga2V5OiAndGl0bGUnXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIGZvbGRlcnM6IGZpbHRlcmVkRm9sZGVycyxcbiAgICAgICAgICAgIGZpbGVzOiBmaWx0ZXJlZEZpbGVzLFxuICAgICAgICAgICAgYWN0aXZlUm93OiBwcm9wcy5pc0FjdGl2ZVJvdyxcbiAgICAgICAgICAgIHNvcnRCeVRpdGxlOiBwcm9wcy5zb3J0QnlUaXRsZSxcbiAgICAgICAgICAgIHNvcnRCeURhdGU6IHByb3BzLnNvcnRCeURhdGUsXG4gICAgICAgICAgICBoYW5kbGVSb3dDbGljazogcHJvcHMuaGFuZGxlUm93Q2xpY2ssXG4gICAgICAgICAgICBoYW5kbGVGaWxlRG91YmxlQ2xpY2s6IHByb3BzLmFkZEZpbGUsXG4gICAgICAgICAgICBoYW5kbGVGb2xkZXJEb3VibGVDbGljazogcHJvcHMuZ2V0TmV4dEZvbGRlcixcbiAgICAgICAgICAgIGdldEl0ZW1OYW1lOiBwcm9wcy5nZXRJdGVtTmFtZSxcbiAgICAgICAgICAgIGdldEl0ZW1JY29uOiBwcm9wcy5nZXRJdGVtSWNvblxuICAgICAgICAgIH0pfVxuICAgICAgICA8L21haW4+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYFxufVxuIiwiY29uc3QgaHRtbCA9IHJlcXVpcmUoJ3lvLXlvJylcblxubW9kdWxlLmV4cG9ydHMgPSAocHJvcHMpID0+IHtcbiAgcmV0dXJuIGh0bWxgXG4gICAgPGRpdiBjbGFzcz1cIlVwcHlQcm92aWRlci1lcnJvclwiPlxuICAgICAgPHNwYW4+XG4gICAgICAgIFNvbWV0aGluZyB3ZW50IHdyb25nLiAgUHJvYmFibHkgb3VyIGZhdWx0LiAke3Byb3BzLmVycm9yfVxuICAgICAgPC9zcGFuPlxuICAgIDwvZGl2PlxuICBgXG59XG4iLCJjb25zdCBodG1sID0gcmVxdWlyZSgneW8teW8nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChwcm9wcykgPT4ge1xuICByZXR1cm4gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwiVXBweVByb3ZpZGVyLWxvYWRpbmdcIj5cbiAgICAgIDxzcGFuPlxuICAgICAgICBMb2FkaW5nIC4uLlxuICAgICAgPC9zcGFuPlxuICAgIDwvZGl2PlxuICBgXG59XG4iLCJjb25zdCBodG1sID0gcmVxdWlyZSgneW8teW8nKVxuY29uc3QgUm93ID0gcmVxdWlyZSgnLi9UYWJsZVJvdycpXG5cbm1vZHVsZS5leHBvcnRzID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IGhlYWRlcnMgPSBwcm9wcy5jb2x1bW5zLm1hcCgoY29sdW1uKSA9PiB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8dGggY2xhc3M9XCJCcm93c2VyVGFibGUtaGVhZGVyQ29sdW1uIEJyb3dzZXJUYWJsZS1jb2x1bW5cIiBvbmNsaWNrPSR7cHJvcHMuc29ydEJ5VGl0bGV9PlxuICAgICAgICAke2NvbHVtbi5uYW1lfVxuICAgICAgPC90aD5cbiAgICBgXG4gIH0pXG5cbiAgcmV0dXJuIGh0bWxgXG4gICAgPHRhYmxlIGNsYXNzPVwiQnJvd3NlclRhYmxlXCI+XG4gICAgICA8dGhlYWQgY2xhc3M9XCJCcm93c2VyVGFibGUtaGVhZGVyXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICAke2hlYWRlcnN9XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RoZWFkPlxuICAgICAgPHRib2R5PlxuICAgICAgICAke3Byb3BzLmZvbGRlcnMubWFwKChmb2xkZXIpID0+IHtcbiAgICAgICAgICByZXR1cm4gUm93KHtcbiAgICAgICAgICAgIHRpdGxlOiBwcm9wcy5nZXRJdGVtTmFtZShmb2xkZXIpLFxuICAgICAgICAgICAgYWN0aXZlOiBwcm9wcy5hY3RpdmVSb3coZm9sZGVyKSxcbiAgICAgICAgICAgIGdldEl0ZW1JY29uOiAoKSA9PiBwcm9wcy5nZXRJdGVtSWNvbihmb2xkZXIpLFxuICAgICAgICAgICAgaGFuZGxlQ2xpY2s6ICgpID0+IHByb3BzLmhhbmRsZVJvd0NsaWNrKGZvbGRlciksXG4gICAgICAgICAgICBoYW5kbGVEb3VibGVDbGljazogKCkgPT4gcHJvcHMuaGFuZGxlRm9sZGVyRG91YmxlQ2xpY2soZm9sZGVyKSxcbiAgICAgICAgICAgIGNvbHVtbnM6IHByb3BzLmNvbHVtbnNcbiAgICAgICAgICB9KVxuICAgICAgICB9KX1cbiAgICAgICAgJHtwcm9wcy5maWxlcy5tYXAoKGZpbGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gUm93KHtcbiAgICAgICAgICAgIHRpdGxlOiBwcm9wcy5nZXRJdGVtTmFtZShmaWxlKSxcbiAgICAgICAgICAgIGFjdGl2ZTogcHJvcHMuYWN0aXZlUm93KGZpbGUpLFxuICAgICAgICAgICAgZ2V0SXRlbUljb246ICgpID0+IHByb3BzLmdldEl0ZW1JY29uKGZpbGUpLFxuICAgICAgICAgICAgaGFuZGxlQ2xpY2s6ICgpID0+IHByb3BzLmhhbmRsZVJvd0NsaWNrKGZpbGUpLFxuICAgICAgICAgICAgaGFuZGxlRG91YmxlQ2xpY2s6ICgpID0+IHByb3BzLmhhbmRsZUZpbGVEb3VibGVDbGljayhmaWxlKSxcbiAgICAgICAgICAgIGNvbHVtbnM6IHByb3BzLmNvbHVtbnNcbiAgICAgICAgICB9KVxuICAgICAgICB9KX1cbiAgICAgIDwvdGJvZHk+XG4gICAgPC90YWJsZT5cbiAgYFxufVxuIiwiY29uc3QgaHRtbCA9IHJlcXVpcmUoJ3lvLXlvJylcblxubW9kdWxlLmV4cG9ydHMgPSAocHJvcHMpID0+IHtcbiAgcmV0dXJuIGh0bWxgXG4gICAgPHRkIGNsYXNzPVwiQnJvd3NlclRhYmxlLXJvd0NvbHVtbiBCcm93c2VyVGFibGUtY29sdW1uXCI+XG4gICAgICAke3Byb3BzLmdldEl0ZW1JY29uKCl9ICR7cHJvcHMudmFsdWV9XG4gICAgPC90ZD5cbiAgYFxufVxuIiwiY29uc3QgaHRtbCA9IHJlcXVpcmUoJ3lvLXlvJylcbmNvbnN0IENvbHVtbiA9IHJlcXVpcmUoJy4vVGFibGVDb2x1bW4nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChwcm9wcykgPT4ge1xuICBjb25zdCBjbGFzc2VzID0gcHJvcHMuYWN0aXZlID8gJ0Jyb3dzZXJUYWJsZS1yb3cgaXMtYWN0aXZlJyA6ICdCcm93c2VyVGFibGUtcm93J1xuICByZXR1cm4gaHRtbGBcbiAgICA8dHIgb25jbGljaz0ke3Byb3BzLmhhbmRsZUNsaWNrfSBvbmRibGNsaWNrPSR7cHJvcHMuaGFuZGxlRG91YmxlQ2xpY2t9IGNsYXNzPSR7Y2xhc3Nlc30+XG4gICAgICAke0NvbHVtbih7XG4gICAgICAgIGdldEl0ZW1JY29uOiBwcm9wcy5nZXRJdGVtSWNvbixcbiAgICAgICAgdmFsdWU6IHByb3BzLnRpdGxlXG4gICAgICB9KX1cbiAgICA8L3RyPlxuICBgXG59XG4iLCJjb25zdCBBdXRoVmlldyA9IHJlcXVpcmUoJy4vQXV0aFZpZXcnKVxuY29uc3QgQnJvd3NlciA9IHJlcXVpcmUoJy4vQnJvd3NlcicpXG5jb25zdCBFcnJvclZpZXcgPSByZXF1aXJlKCcuL0Vycm9yJylcbmNvbnN0IExvYWRlclZpZXcgPSByZXF1aXJlKCcuL0xvYWRlcicpXG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbHMnKVxuXG4vKipcbiAqIENsYXNzIHRvIGVhc2lseSBnZW5lcmF0ZSBnZW5lcmljIHZpZXdzIGZvciBwbHVnaW5zXG4gKlxuICogVGhpcyBjbGFzcyBleHBlY3RzIHRoZSBwbHVnaW4gdXNpbmcgdG8gaGF2ZSB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXNcbiAqXG4gKiBzdGF0ZUlkIHtTdHJpbmd9IG9iamVjdCBrZXkgb2Ygd2hpY2ggdGhlIHBsdWdpbiBzdGF0ZSBpcyBzdG9yZWRcbiAqXG4gKiBUaGlzIGNsYXNzIGFsc28gZXhwZWN0cyB0aGUgcGx1Z2luIGluc3RhbmNlIHVzaW5nIGl0IHRvIGhhdmUgdGhlIGZvbGxvd2luZ1xuICogYWNjZXNzb3IgbWV0aG9kcy5cbiAqIEVhY2ggbWV0aG9kIHRha2VzIHRoZSBpdGVtIHdob3NlIHByb3BlcnR5IGlzIHRvIGJlIGFjY2Vzc2VkXG4gKiBhcyBhIHBhcmFtXG4gKlxuICogaXNGb2xkZXJcbiAqICAgIEByZXR1cm4ge0Jvb2xlYW59IGZvciBpZiB0aGUgaXRlbSBpcyBhIGZvbGRlciBvciBub3RcbiAqIGdldEl0ZW1EYXRhXG4gKiAgICBAcmV0dXJuIHtPYmplY3R9IHRoYXQgaXMgZm9ybWF0IHJlYWR5IGZvciB1cHB5IHVwbG9hZC9kb3dubG9hZFxuICogZ2V0SXRlbUljb25cbiAqICAgIEByZXR1cm4ge09iamVjdH0gaHRtbCBpbnN0YW5jZSBvZiB0aGUgaXRlbSdzIGljb25cbiAqIGdldEl0ZW1TdWJMaXN0XG4gKiAgICBAcmV0dXJuIHtBcnJheX0gc3ViLWl0ZW1zIGluIHRoZSBpdGVtLiBlLmcgYSBmb2xkZXIgbWF5IGNvbnRhaW4gc3ViLWl0ZW1zXG4gKiBnZXRJdGVtTmFtZVxuICogICAgQHJldHVybiB7U3RyaW5nfSBkaXNwbGF5IGZyaWVuZGx5IG5hbWUgb2YgdGhlIGl0ZW1cbiAqIGdldE1pbWVUeXBlXG4gKiAgICBAcmV0dXJuIHtTdHJpbmd9IG1pbWUgdHlwZSBvZiB0aGUgaXRlbVxuICogZ2V0SXRlbUlkXG4gKiAgICBAcmV0dXJuIHtTdHJpbmd9IHVuaXF1ZSBpZCBvZiB0aGUgaXRlbVxuICogZ2V0SXRlbVJlcXVlc3RQYXRoXG4gKiAgICBAcmV0dXJuIHtTdHJpbmd9IHVuaXF1ZSByZXF1ZXN0IHBhdGggb2YgdGhlIGl0ZW0gd2hlbiBtYWtpbmcgY2FsbHMgdG8gdXBweSBzZXJ2ZXJcbiAqIGdldEl0ZW1Nb2RpZmllZERhdGVcbiAqICAgIEByZXR1cm4ge29iamVjdH0gb3Ige1N0cmluZ30gZGF0ZSBvZiB3aGVuIGxhc3QgdGhlIGl0ZW0gd2FzIG1vZGlmaWVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVmlldyB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2Ugb2YgdGhlIHBsdWdpblxuICAgKi9cbiAgY29uc3RydWN0b3IgKHBsdWdpbikge1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luXG4gICAgdGhpcy5Qcm92aWRlciA9IHBsdWdpbltwbHVnaW4uaWRdXG5cbiAgICAvLyBMb2dpY1xuICAgIHRoaXMuYWRkRmlsZSA9IHRoaXMuYWRkRmlsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5maWx0ZXJJdGVtcyA9IHRoaXMuZmlsdGVySXRlbXMuYmluZCh0aGlzKVxuICAgIHRoaXMuZmlsdGVyUXVlcnkgPSB0aGlzLmZpbHRlclF1ZXJ5LmJpbmQodGhpcylcbiAgICB0aGlzLmdldEZvbGRlciA9IHRoaXMuZ2V0Rm9sZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLmdldE5leHRGb2xkZXIgPSB0aGlzLmdldE5leHRGb2xkZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlUm93Q2xpY2sgPSB0aGlzLmhhbmRsZVJvd0NsaWNrLmJpbmQodGhpcylcbiAgICB0aGlzLmxvZ291dCA9IHRoaXMubG9nb3V0LmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUF1dGggPSB0aGlzLmhhbmRsZUF1dGguYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlRGVtb0F1dGggPSB0aGlzLmhhbmRsZURlbW9BdXRoLmJpbmQodGhpcylcbiAgICB0aGlzLnNvcnRCeVRpdGxlID0gdGhpcy5zb3J0QnlUaXRsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5zb3J0QnlEYXRlID0gdGhpcy5zb3J0QnlEYXRlLmJpbmQodGhpcylcbiAgICB0aGlzLmlzQWN0aXZlUm93ID0gdGhpcy5pc0FjdGl2ZVJvdy5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVFcnJvciA9IHRoaXMuaGFuZGxlRXJyb3IuYmluZCh0aGlzKVxuXG4gICAgLy8gVmlzdWFsXG4gICAgdGhpcy5yZW5kZXIgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpXG4gIH1cblxuICAvKipcbiAgICogTGl0dGxlIHNob3J0aGFuZCB0byB1cGRhdGUgdGhlIHN0YXRlIHdpdGggdGhlIHBsdWdpbidzIHN0YXRlXG4gICAqL1xuICB1cGRhdGVTdGF0ZSAobmV3U3RhdGUpIHtcbiAgICBsZXQgc3RhdGVJZCA9IHRoaXMucGx1Z2luLnN0YXRlSWRcbiAgICBjb25zdCB7c3RhdGV9ID0gdGhpcy5wbHVnaW4uY29yZVxuXG4gICAgdGhpcy5wbHVnaW4uY29yZS5zZXRTdGF0ZSh7W3N0YXRlSWRdOiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZVtzdGF0ZUlkXSwgbmV3U3RhdGUpfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBCYXNlZCBvbiBmb2xkZXIgSUQsIGZldGNoIGEgbmV3IGZvbGRlciBhbmQgdXBkYXRlIGl0IHRvIHN0YXRlXG4gICAqIEBwYXJhbSAge1N0cmluZ30gaWQgRm9sZGVyIGlkXG4gICAqIEByZXR1cm4ge1Byb21pc2V9ICAgRm9sZGVycy9maWxlcyBpbiBmb2xkZXJcbiAgICovXG4gIGdldEZvbGRlciAoaWQsIG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fbG9hZGVyV3JhcHBlcihcbiAgICAgIHRoaXMuUHJvdmlkZXIubGlzdChpZCksXG4gICAgICAocmVzKSA9PiB7XG4gICAgICAgIGxldCBmb2xkZXJzID0gW11cbiAgICAgICAgbGV0IGZpbGVzID0gW11cbiAgICAgICAgbGV0IHVwZGF0ZWREaXJlY3Rvcmllc1xuXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5wbHVnaW4uY29yZS5nZXRTdGF0ZSgpW3RoaXMucGx1Z2luLnN0YXRlSWRdXG4gICAgICAgIGNvbnN0IGluZGV4ID0gc3RhdGUuZGlyZWN0b3JpZXMuZmluZEluZGV4KChkaXIpID0+IGlkID09PSBkaXIuaWQpXG5cbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHVwZGF0ZWREaXJlY3RvcmllcyA9IHN0YXRlLmRpcmVjdG9yaWVzLnNsaWNlKDAsIGluZGV4ICsgMSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1cGRhdGVkRGlyZWN0b3JpZXMgPSBzdGF0ZS5kaXJlY3Rvcmllcy5jb25jYXQoW3tpZCwgdGl0bGU6IG5hbWUgfHwgdGhpcy5wbHVnaW4uZ2V0SXRlbU5hbWUocmVzKX1dKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wbHVnaW4uZ2V0SXRlbVN1Ykxpc3QocmVzKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMucGx1Z2luLmlzRm9sZGVyKGl0ZW0pKSB7XG4gICAgICAgICAgICBmb2xkZXJzLnB1c2goaXRlbSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsZXMucHVzaChpdGVtKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBsZXQgZGF0YSA9IHtmb2xkZXJzLCBmaWxlcywgZGlyZWN0b3JpZXM6IHVwZGF0ZWREaXJlY3Rvcmllc31cbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZShkYXRhKVxuXG4gICAgICAgIHJldHVybiBkYXRhXG4gICAgICB9LFxuICAgICAgdGhpcy5oYW5kbGVFcnJvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIG5ldyBmb2xkZXJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBGb2xkZXJcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0aXRsZSBGb2xkZXIgdGl0bGVcbiAgICovXG4gIGdldE5leHRGb2xkZXIgKGZvbGRlcikge1xuICAgIGxldCBpZCA9IHRoaXMucGx1Z2luLmdldEl0ZW1SZXF1ZXN0UGF0aChmb2xkZXIpXG4gICAgdGhpcy5nZXRGb2xkZXIoaWQsIHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZvbGRlcikpXG4gIH1cblxuICBhZGRGaWxlIChmaWxlKSB7XG4gICAgY29uc3QgdGFnRmlsZSA9IHtcbiAgICAgIHNvdXJjZTogdGhpcy5wbHVnaW4uaWQsXG4gICAgICBkYXRhOiB0aGlzLnBsdWdpbi5nZXRJdGVtRGF0YShmaWxlKSxcbiAgICAgIG5hbWU6IHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZpbGUpLFxuICAgICAgdHlwZTogdGhpcy5wbHVnaW4uZ2V0TWltZVR5cGUoZmlsZSksXG4gICAgICBpc1JlbW90ZTogdHJ1ZSxcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgZmlsZUlkOiB0aGlzLnBsdWdpbi5nZXRJdGVtSWQoZmlsZSlcbiAgICAgIH0sXG4gICAgICByZW1vdGU6IHtcbiAgICAgICAgaG9zdDogdGhpcy5wbHVnaW4ub3B0cy5ob3N0LFxuICAgICAgICB1cmw6IGAke3RoaXMucGx1Z2luLm9wdHMuaG9zdH0vJHt0aGlzLlByb3ZpZGVyLmlkfS9nZXQvJHt0aGlzLnBsdWdpbi5nZXRJdGVtUmVxdWVzdFBhdGgoZmlsZSl9YCxcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIGZpbGVJZDogdGhpcy5wbHVnaW4uZ2V0SXRlbUlkKGZpbGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoVXRpbHMuZ2V0RmlsZVR5cGUodGFnRmlsZSlbMF0gPT09ICdpbWFnZScpIHtcbiAgICAgIHRhZ0ZpbGUucHJldmlldyA9IGAke3RoaXMucGx1Z2luLm9wdHMuaG9zdH0vJHt0aGlzLlByb3ZpZGVyLmlkfS90aHVtYm5haWwvJHt0aGlzLnBsdWdpbi5nZXRJdGVtUmVxdWVzdFBhdGgoZmlsZSl9YFxuICAgIH1cbiAgICBjb25zb2xlLmxvZygnYWRkaW5nIGZpbGUnKVxuICAgIHRoaXMucGx1Z2luLmNvcmUuZW1pdHRlci5lbWl0KCdjb3JlOmZpbGUtYWRkJywgdGFnRmlsZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHNlc3Npb24gdG9rZW4gb24gY2xpZW50IHNpZGUuXG4gICAqL1xuICBsb2dvdXQgKCkge1xuICAgIHRoaXMuUHJvdmlkZXIubG9nb3V0KGxvY2F0aW9uLmhyZWYpXG4gICAgICAudGhlbigocmVzKSA9PiByZXMuanNvbigpKVxuICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBpZiAocmVzLm9rKSB7XG4gICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGZpbGVzOiBbXSxcbiAgICAgICAgICAgIGZvbGRlcnM6IFtdLFxuICAgICAgICAgICAgZGlyZWN0b3JpZXM6IFtdXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUobmV3U3RhdGUpXG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKHRoaXMuaGFuZGxlRXJyb3IpXG4gIH1cblxuICAvKipcbiAgICogVXNlZCB0byBzZXQgYWN0aXZlIGZpbGUvZm9sZGVyLlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGZpbGUgICBBY3RpdmUgZmlsZS9mb2xkZXJcbiAgICovXG4gIGhhbmRsZVJvd0NsaWNrIChmaWxlKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF1cbiAgICBjb25zdCBuZXdTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICBhY3RpdmVSb3c6IHRoaXMucGx1Z2luLmdldEl0ZW1JZChmaWxlKVxuICAgIH0pXG5cbiAgICB0aGlzLnVwZGF0ZVN0YXRlKG5ld1N0YXRlKVxuICB9XG5cbiAgZmlsdGVyUXVlcnkgKGUpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMucGx1Z2luLmNvcmUuZ2V0U3RhdGUoKVt0aGlzLnBsdWdpbi5zdGF0ZUlkXVxuICAgIHRoaXMudXBkYXRlU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUsIHtcbiAgICAgIGZpbHRlcklucHV0OiBlLnRhcmdldC52YWx1ZVxuICAgIH0pKVxuICB9XG5cbiAgZmlsdGVySXRlbXMgKGl0ZW1zKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF1cbiAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChmb2xkZXIpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnBsdWdpbi5nZXRJdGVtTmFtZShmb2xkZXIpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzdGF0ZS5maWx0ZXJJbnB1dC50b0xvd2VyQ2FzZSgpKSAhPT0gLTFcbiAgICB9KVxuICB9XG5cbiAgc29ydEJ5VGl0bGUgKCkge1xuICAgIGNvbnN0IHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wbHVnaW4uY29yZS5nZXRTdGF0ZSgpW3RoaXMucGx1Z2luLnN0YXRlSWRdKVxuICAgIGNvbnN0IHtmaWxlcywgZm9sZGVycywgc29ydGluZ30gPSBzdGF0ZVxuXG4gICAgbGV0IHNvcnRlZEZpbGVzID0gZmlsZXMuc29ydCgoZmlsZUEsIGZpbGVCKSA9PiB7XG4gICAgICBpZiAoc29ydGluZyA9PT0gJ3RpdGxlRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZpbGVCKS5sb2NhbGVDb21wYXJlKHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZpbGVBKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnBsdWdpbi5nZXRJdGVtTmFtZShmaWxlQSkubG9jYWxlQ29tcGFyZSh0aGlzLnBsdWdpbi5nZXRJdGVtTmFtZShmaWxlQikpXG4gICAgfSlcblxuICAgIGxldCBzb3J0ZWRGb2xkZXJzID0gZm9sZGVycy5zb3J0KChmb2xkZXJBLCBmb2xkZXJCKSA9PiB7XG4gICAgICBpZiAoc29ydGluZyA9PT0gJ3RpdGxlRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lKGZvbGRlckIpLmxvY2FsZUNvbXBhcmUodGhpcy5wbHVnaW4uZ2V0SXRlbU5hbWUoZm9sZGVyQSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wbHVnaW4uZ2V0SXRlbU5hbWUoZm9sZGVyQSkubG9jYWxlQ29tcGFyZSh0aGlzLnBsdWdpbi5nZXRJdGVtTmFtZShmb2xkZXJCKSlcbiAgICB9KVxuXG4gICAgdGhpcy51cGRhdGVTdGF0ZShPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgZmlsZXM6IHNvcnRlZEZpbGVzLFxuICAgICAgZm9sZGVyczogc29ydGVkRm9sZGVycyxcbiAgICAgIHNvcnRpbmc6IChzb3J0aW5nID09PSAndGl0bGVEZXNjZW5kaW5nJykgPyAndGl0bGVBc2NlbmRpbmcnIDogJ3RpdGxlRGVzY2VuZGluZydcbiAgICB9KSlcbiAgfVxuXG4gIHNvcnRCeURhdGUgKCkge1xuICAgIGNvbnN0IHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wbHVnaW4uY29yZS5nZXRTdGF0ZSgpW3RoaXMucGx1Z2luLnN0YXRlSWRdKVxuICAgIGNvbnN0IHtmaWxlcywgZm9sZGVycywgc29ydGluZ30gPSBzdGF0ZVxuXG4gICAgbGV0IHNvcnRlZEZpbGVzID0gZmlsZXMuc29ydCgoZmlsZUEsIGZpbGVCKSA9PiB7XG4gICAgICBsZXQgYSA9IG5ldyBEYXRlKHRoaXMucGx1Z2luLmdldEl0ZW1Nb2RpZmllZERhdGUoZmlsZUEpKVxuICAgICAgbGV0IGIgPSBuZXcgRGF0ZSh0aGlzLnBsdWdpbi5nZXRJdGVtTW9kaWZpZWREYXRlKGZpbGVCKSlcblxuICAgICAgaWYgKHNvcnRpbmcgPT09ICdkYXRlRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIGEgPiBiID8gLTEgOiBhIDwgYiA/IDEgOiAwXG4gICAgICB9XG4gICAgICByZXR1cm4gYSA+IGIgPyAxIDogYSA8IGIgPyAtMSA6IDBcbiAgICB9KVxuXG4gICAgbGV0IHNvcnRlZEZvbGRlcnMgPSBmb2xkZXJzLnNvcnQoKGZvbGRlckEsIGZvbGRlckIpID0+IHtcbiAgICAgIGxldCBhID0gbmV3IERhdGUodGhpcy5wbHVnaW4uZ2V0SXRlbU1vZGlmaWVkRGF0ZShmb2xkZXJBKSlcbiAgICAgIGxldCBiID0gbmV3IERhdGUodGhpcy5wbHVnaW4uZ2V0SXRlbU1vZGlmaWVkRGF0ZShmb2xkZXJCKSlcblxuICAgICAgaWYgKHNvcnRpbmcgPT09ICdkYXRlRGVzY2VuZGluZycpIHtcbiAgICAgICAgcmV0dXJuIGEgPiBiID8gLTEgOiBhIDwgYiA/IDEgOiAwXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhID4gYiA/IDEgOiBhIDwgYiA/IC0xIDogMFxuICAgIH0pXG5cbiAgICB0aGlzLnVwZGF0ZVN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICBmaWxlczogc29ydGVkRmlsZXMsXG4gICAgICBmb2xkZXJzOiBzb3J0ZWRGb2xkZXJzLFxuICAgICAgc29ydGluZzogKHNvcnRpbmcgPT09ICdkYXRlRGVzY2VuZGluZycpID8gJ2RhdGVBc2NlbmRpbmcnIDogJ2RhdGVEZXNjZW5kaW5nJ1xuICAgIH0pKVxuICB9XG5cbiAgaXNBY3RpdmVSb3cgKGZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5wbHVnaW4uY29yZS5nZXRTdGF0ZSgpW3RoaXMucGx1Z2luLnN0YXRlSWRdLmFjdGl2ZVJvdyA9PT0gdGhpcy5wbHVnaW4uZ2V0SXRlbUlkKGZpbGUpXG4gIH1cblxuICBoYW5kbGVEZW1vQXV0aCAoKSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBsdWdpbi5jb3JlLmdldFN0YXRlKClbdGhpcy5wbHVnaW4uc3RhdGVJZF1cbiAgICB0aGlzLnVwZGF0ZVN0YXRlKHt9LCBzdGF0ZSwge1xuICAgICAgYXV0aGVudGljYXRlZDogdHJ1ZVxuICAgIH0pXG4gIH1cblxuICBoYW5kbGVBdXRoICgpIHtcbiAgICBjb25zdCB1cmxJZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDk5OTk5OSkgKyAxXG4gICAgY29uc3QgcmVkaXJlY3QgPSBgJHtsb2NhdGlvbi5ocmVmfSR7bG9jYXRpb24uc2VhcmNoID8gJyYnIDogJz8nfWlkPSR7dXJsSWR9YFxuXG4gICAgY29uc3QgYXV0aFN0YXRlID0gYnRvYShKU09OLnN0cmluZ2lmeSh7IHJlZGlyZWN0IH0pKVxuICAgIGNvbnN0IGxpbmsgPSBgJHt0aGlzLnBsdWdpbi5vcHRzLmhvc3R9L2Nvbm5lY3QvJHt0aGlzLlByb3ZpZGVyLmF1dGhQcm92aWRlcn0/c3RhdGU9JHthdXRoU3RhdGV9YFxuXG4gICAgY29uc3QgYXV0aFdpbmRvdyA9IHdpbmRvdy5vcGVuKGxpbmssICdfYmxhbmsnKVxuICAgIGNvbnN0IGNoZWNrQXV0aCA9ICgpID0+IHtcbiAgICAgIGxldCBhdXRoV2luZG93VXJsXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1dGhXaW5kb3dVcmwgPSBhdXRoV2luZG93LmxvY2F0aW9uLmhyZWZcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBET01FeGNlcHRpb24gfHwgZSBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGNoZWNrQXV0aCwgMTAwKVxuICAgICAgICB9IGVsc2UgdGhyb3cgZVxuICAgICAgfVxuXG4gICAgICAvLyBzcGxpdCB1cmwgYmVjYXVzZSBjaHJvbWUgYWRkcyAnIycgdG8gcmVkaXJlY3RzXG4gICAgICBpZiAoYXV0aFdpbmRvd1VybC5zcGxpdCgnIycpWzBdID09PSByZWRpcmVjdCkge1xuICAgICAgICBhdXRoV2luZG93LmNsb3NlKClcbiAgICAgICAgdGhpcy5fbG9hZGVyV3JhcHBlcih0aGlzLlByb3ZpZGVyLmF1dGgoKSwgdGhpcy5wbHVnaW4ub25BdXRoLCB0aGlzLmhhbmRsZUVycm9yKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dChjaGVja0F1dGgsIDEwMClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0F1dGgoKVxuICB9XG5cbiAgaGFuZGxlRXJyb3IgKGVycm9yKSB7XG4gICAgdGhpcy51cGRhdGVTdGF0ZSh7IGVycm9yIH0pXG4gIH1cblxuICAvLyBkaXNwbGF5cyBsb2FkZXIgdmlldyB3aGlsZSBhc3luY2hyb25vdXMgcmVxdWVzdCBpcyBiZWluZyBtYWRlLlxuICBfbG9hZGVyV3JhcHBlciAocHJvbWlzZSwgdGhlbiwgY2F0Y2hfKSB7XG4gICAgcHJvbWlzZVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSlcbiAgICAgICAgdGhlbihyZXN1bHQpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pXG4gICAgICAgIGNhdGNoXyhlcnIpXG4gICAgICB9KVxuICAgIHRoaXMudXBkYXRlU3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pXG4gIH1cblxuICByZW5kZXIgKHN0YXRlKSB7XG4gICAgY29uc3QgeyBhdXRoZW50aWNhdGVkLCBlcnJvciwgbG9hZGluZyB9ID0gc3RhdGVbdGhpcy5wbHVnaW4uc3RhdGVJZF1cblxuICAgIGlmIChlcnJvcikge1xuICAgICAgdGhpcy51cGRhdGVTdGF0ZSh7IGVycm9yOiB1bmRlZmluZWQgfSlcbiAgICAgIHJldHVybiBFcnJvclZpZXcoeyBlcnJvcjogZXJyb3IgfSlcbiAgICB9XG5cbiAgICBpZiAobG9hZGluZykge1xuICAgICAgcmV0dXJuIExvYWRlclZpZXcoKVxuICAgIH1cblxuICAgIGlmICghYXV0aGVudGljYXRlZCkge1xuICAgICAgcmV0dXJuIEF1dGhWaWV3KHtcbiAgICAgICAgcGx1Z2luTmFtZTogdGhpcy5wbHVnaW4udGl0bGUsXG4gICAgICAgIGRlbW86IHRoaXMucGx1Z2luLm9wdHMuZGVtbyxcbiAgICAgICAgaGFuZGxlQXV0aDogdGhpcy5oYW5kbGVBdXRoLFxuICAgICAgICBoYW5kbGVEZW1vQXV0aDogdGhpcy5oYW5kbGVEZW1vQXV0aFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBicm93c2VyUHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZVt0aGlzLnBsdWdpbi5zdGF0ZUlkXSwge1xuICAgICAgZ2V0TmV4dEZvbGRlcjogdGhpcy5nZXROZXh0Rm9sZGVyLFxuICAgICAgZ2V0Rm9sZGVyOiB0aGlzLmdldEZvbGRlcixcbiAgICAgIGFkZEZpbGU6IHRoaXMuYWRkRmlsZSxcbiAgICAgIGZpbHRlckl0ZW1zOiB0aGlzLmZpbHRlckl0ZW1zLFxuICAgICAgZmlsdGVyUXVlcnk6IHRoaXMuZmlsdGVyUXVlcnksXG4gICAgICBoYW5kbGVSb3dDbGljazogdGhpcy5oYW5kbGVSb3dDbGljayxcbiAgICAgIHNvcnRCeVRpdGxlOiB0aGlzLnNvcnRCeVRpdGxlLFxuICAgICAgc29ydEJ5RGF0ZTogdGhpcy5zb3J0QnlEYXRlLFxuICAgICAgbG9nb3V0OiB0aGlzLmxvZ291dCxcbiAgICAgIGRlbW86IHRoaXMucGx1Z2luLm9wdHMuZGVtbyxcbiAgICAgIGlzQWN0aXZlUm93OiB0aGlzLmlzQWN0aXZlUm93LFxuICAgICAgZ2V0SXRlbU5hbWU6IHRoaXMucGx1Z2luLmdldEl0ZW1OYW1lLFxuICAgICAgZ2V0SXRlbUljb246IHRoaXMucGx1Z2luLmdldEl0ZW1JY29uXG4gICAgfSlcblxuICAgIHJldHVybiBCcm93c2VyKGJyb3dzZXJQcm9wcylcbiAgfVxufVxuIiwiY29uc3QgaHRtbCA9IHJlcXVpcmUoJ3lvLXlvJylcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4uL1BsdWdpbicpXG5cbmNvbnN0IFByb3ZpZGVyID0gcmVxdWlyZSgnLi4vLi4vdXBweS1iYXNlL3NyYy9wbHVnaW5zL1Byb3ZpZGVyJylcblxuY29uc3QgVmlldyA9IHJlcXVpcmUoJy4uLy4uL2dlbmVyaWMtcHJvdmlkZXItdmlld3MvaW5kZXgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdvb2dsZSBleHRlbmRzIFBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yIChjb3JlLCBvcHRzKSB7XG4gICAgc3VwZXIoY29yZSwgb3B0cylcbiAgICB0aGlzLnR5cGUgPSAnYWNxdWlyZXInXG4gICAgdGhpcy5pZCA9ICdHb29nbGVEcml2ZSdcbiAgICB0aGlzLnRpdGxlID0gJ0dvb2dsZSBEcml2ZSdcbiAgICB0aGlzLnN0YXRlSWQgPSAnZ29vZ2xlRHJpdmUnXG4gICAgdGhpcy5pY29uID0gKCkgPT4gaHRtbGBcbiAgICAgIDxzdmcgY2xhc3M9XCJVcHB5SWNvbiBVcHB5TW9kYWxUYWItaWNvblwiIHdpZHRoPVwiMjhcIiBoZWlnaHQ9XCIyOFwiIHZpZXdCb3g9XCIwIDAgMTYgMTZcIj5cbiAgICAgICAgPHBhdGggZD1cIk0yLjk1NSAxNC45M2wyLjY2Ny00LjYySDE2bC0yLjY2NyA0LjYySDIuOTU1em0yLjM3OC00LjYybC0yLjY2NiA0LjYyTDAgMTAuMzFsNS4xOS04Ljk5IDIuNjY2IDQuNjItMi41MjMgNC4zN3ptMTAuNTIzLS4yNWgtNS4zMzNsLTUuMTktOC45OWg1LjMzNGw1LjE5IDguOTl6XCIvPlxuICAgICAgPC9zdmc+XG4gICAgYFxuXG4gICAgLy8gd3JpdGluZyBvdXQgdGhlIGtleSBleHBsaWNpdGx5IGZvciByZWFkYWJpbGl0eSB0aGUga2V5IHVzZWQgdG8gc3RvcmVcbiAgICAvLyB0aGUgcHJvdmlkZXIgaW5zdGFuY2UgbXVzdCBiZSBlcXVhbCB0byB0aGlzLmlkLlxuICAgIHRoaXMuR29vZ2xlRHJpdmUgPSBuZXcgUHJvdmlkZXIoe1xuICAgICAgaG9zdDogdGhpcy5vcHRzLmhvc3QsXG4gICAgICBwcm92aWRlcjogJ2RyaXZlJyxcbiAgICAgIGF1dGhQcm92aWRlcjogJ2dvb2dsZSdcbiAgICB9KVxuXG4gICAgdGhpcy5maWxlcyA9IFtdXG5cbiAgICB0aGlzLm9uQXV0aCA9IHRoaXMub25BdXRoLmJpbmQodGhpcylcbiAgICAvLyBWaXN1YWxcbiAgICB0aGlzLnJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcylcblxuICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHt9XG5cbiAgICAvLyBtZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKVxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG4gICAgdGhpcy52aWV3ID0gbmV3IFZpZXcodGhpcylcbiAgICAvLyBTZXQgZGVmYXVsdCBzdGF0ZSBmb3IgR29vZ2xlIERyaXZlXG4gICAgdGhpcy5jb3JlLnNldFN0YXRlKHtcbiAgICAgIC8vIHdyaXRpbmcgb3V0IHRoZSBrZXkgZXhwbGljaXRseSBmb3IgcmVhZGFiaWxpdHkgdGhlIGtleSB1c2VkIHRvIHN0b3JlXG4gICAgICAvLyB0aGUgcGx1Z2luIHN0YXRlIG11c3QgYmUgZXF1YWwgdG8gdGhpcy5zdGF0ZUlkLlxuICAgICAgZ29vZ2xlRHJpdmU6IHtcbiAgICAgICAgYXV0aGVudGljYXRlZDogZmFsc2UsXG4gICAgICAgIGZpbGVzOiBbXSxcbiAgICAgICAgZm9sZGVyczogW10sXG4gICAgICAgIGRpcmVjdG9yaWVzOiBbXSxcbiAgICAgICAgYWN0aXZlUm93OiAtMSxcbiAgICAgICAgZmlsdGVySW5wdXQ6ICcnXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMub3B0cy50YXJnZXRcbiAgICBjb25zdCBwbHVnaW4gPSB0aGlzXG4gICAgdGhpcy50YXJnZXQgPSB0aGlzLm1vdW50KHRhcmdldCwgcGx1Z2luKVxuXG4gICAgLy8gY2F0Y2ggZXJyb3IgaGVyZS5cbiAgICB0aGlzW3RoaXMuaWRdLmF1dGgoKS50aGVuKHRoaXMub25BdXRoKS5jYXRjaCh0aGlzLnZpZXcuaGFuZGxlRXJyb3IpXG4gICAgcmV0dXJuXG4gIH1cblxuICBvbkF1dGggKGF1dGhlbnRpY2F0ZWQpIHtcbiAgICB0aGlzLnZpZXcudXBkYXRlU3RhdGUoe2F1dGhlbnRpY2F0ZWR9KVxuICAgIGlmIChhdXRoZW50aWNhdGVkKSB7XG4gICAgICB0aGlzLnZpZXcuZ2V0Rm9sZGVyKCdyb290JylcbiAgICB9XG4gIH1cblxuICBpc0ZvbGRlciAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLm1pbWVUeXBlID09PSAnYXBwbGljYXRpb24vdm5kLmdvb2dsZS1hcHBzLmZvbGRlcidcbiAgfVxuXG4gIGdldEl0ZW1EYXRhIChpdGVtKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGl0ZW0sIHtzaXplOiBwYXJzZUZsb2F0KGl0ZW0uZmlsZVNpemUpfSlcbiAgfVxuXG4gIGdldEl0ZW1JY29uIChpdGVtKSB7XG4gICAgcmV0dXJuIGh0bWxgPGltZyBzcmM9JHtpdGVtLmljb25MaW5rfS8+YFxuICB9XG5cbiAgZ2V0SXRlbVN1Ykxpc3QgKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5pdGVtc1xuICB9XG5cbiAgZ2V0SXRlbU5hbWUgKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS50aXRsZSA/IGl0ZW0udGl0bGUgOiAnLydcbiAgfVxuXG4gIGdldE1pbWVUeXBlIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0ubWltZVR5cGVcbiAgfVxuXG4gIGdldEl0ZW1JZCAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLmlkXG4gIH1cblxuICBnZXRJdGVtUmVxdWVzdFBhdGggKGl0ZW0pIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJdGVtSWQoaXRlbSlcbiAgfVxuXG4gIGdldEl0ZW1Nb2RpZmllZERhdGUgKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5tb2RpZmllZEJ5TWVEYXRlXG4gIH1cblxuICByZW5kZXIgKHN0YXRlKSB7XG4gICAgcmV0dXJuIHRoaXMudmlldy5yZW5kZXIoc3RhdGUpXG4gIH1cbn1cbiIsImNvbnN0IHlvID0gcmVxdWlyZSgneW8teW8nKVxuLy8gY29uc3QgbmFub3JhZiA9IHJlcXVpcmUoJ25hbm9yYWYnKVxuY29uc3QgeyBmaW5kRE9NRWxlbWVudCB9ID0gcmVxdWlyZSgnLi4vY29yZS9VdGlscycpXG5cbi8qKlxuICogQm9pbGVycGxhdGUgdGhhdCBhbGwgUGx1Z2lucyBzaGFyZSAtIGFuZCBzaG91bGQgbm90IGJlIHVzZWRcbiAqIGRpcmVjdGx5LiBJdCBhbHNvIHNob3dzIHdoaWNoIG1ldGhvZHMgZmluYWwgcGx1Z2lucyBzaG91bGQgaW1wbGVtZW50L292ZXJyaWRlLFxuICogdGhpcyBkZWNpZGluZyBvbiBzdHJ1Y3R1cmUuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG1haW4gVXBweSBjb3JlIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IG9iamVjdCB3aXRoIHBsdWdpbiBvcHRpb25zXG4gKiBAcmV0dXJuIHthcnJheSB8IHN0cmluZ30gZmlsZXMgb3Igc3VjY2Vzcy9mYWlsIG1lc3NhZ2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQbHVnaW4ge1xuXG4gIGNvbnN0cnVjdG9yIChjb3JlLCBvcHRzKSB7XG4gICAgdGhpcy5jb3JlID0gY29yZVxuICAgIHRoaXMub3B0cyA9IG9wdHMgfHwge31cbiAgICB0aGlzLnR5cGUgPSAnbm9uZSdcblxuICAgIC8vIGNsZWFyIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSB0YXJnZXQgc2VsZWN0b3JcbiAgICB0aGlzLm9wdHMucmVwbGFjZVRhcmdldENvbnRlbnQgPT09IHRoaXMub3B0cy5yZXBsYWNlVGFyZ2V0Q29udGVudCB8fCB0cnVlXG5cbiAgICB0aGlzLnVwZGF0ZSA9IHRoaXMudXBkYXRlLmJpbmQodGhpcylcbiAgICB0aGlzLm1vdW50ID0gdGhpcy5tb3VudC5iaW5kKHRoaXMpXG4gICAgdGhpcy5mb2N1cyA9IHRoaXMuZm9jdXMuYmluZCh0aGlzKVxuICAgIHRoaXMuaW5zdGFsbCA9IHRoaXMuaW5zdGFsbC5iaW5kKHRoaXMpXG5cbiAgICAvLyB0aGlzLmZyYW1lID0gbnVsbFxuICB9XG5cbiAgdXBkYXRlIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5lbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGNvbnN0IHByZXYgPSB7fVxuICAgIC8vIGlmICghdGhpcy5mcmFtZSkge1xuICAgIC8vICAgY29uc29sZS5sb2coJ2NyZWF0aW5nIGZyYW1lJylcbiAgICAvLyAgIHRoaXMuZnJhbWUgPSBuYW5vcmFmKChzdGF0ZSwgcHJldikgPT4ge1xuICAgIC8vICAgICBjb25zb2xlLmxvZygndXBkYXRpbmchJywgRGF0ZS5ub3coKSlcbiAgICAvLyAgICAgY29uc3QgbmV3RWwgPSB0aGlzLnJlbmRlcihzdGF0ZSlcbiAgICAvLyAgICAgdGhpcy5lbCA9IHlvLnVwZGF0ZSh0aGlzLmVsLCBuZXdFbClcbiAgICAvLyAgIH0pXG4gICAgLy8gfVxuICAgIC8vIGNvbnNvbGUubG9nKCdhdHRlbXB0aW5nIGFuIHVwZGF0ZS4uLicsIERhdGUubm93KCkpXG4gICAgLy8gdGhpcy5mcmFtZShzdGF0ZSwgcHJldilcblxuICAgIC8vIHRoaXMuY29yZS5sb2coJ3VwZGF0ZSBudW1iZXI6ICcgKyB0aGlzLmNvcmUudXBkYXRlTnVtKyspXG5cbiAgICBjb25zdCBuZXdFbCA9IHRoaXMucmVuZGVyKHN0YXRlKVxuICAgIHlvLnVwZGF0ZSh0aGlzLmVsLCBuZXdFbClcblxuICAgIC8vIG9wdGltaXplcyBwZXJmb3JtYW5jZT9cbiAgICAvLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIC8vICAgY29uc3QgbmV3RWwgPSB0aGlzLnJlbmRlcihzdGF0ZSlcbiAgICAvLyAgIHlvLnVwZGF0ZSh0aGlzLmVsLCBuZXdFbClcbiAgICAvLyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN1cHBsaWVkIGB0YXJnZXRgIGlzIGEgRE9NIGVsZW1lbnQgb3IgYW4gYG9iamVjdGAuXG4gICAqIElmIGl04oCZcyBhbiBvYmplY3Qg4oCUIHRhcmdldCBpcyBhIHBsdWdpbiwgYW5kIHdlIHNlYXJjaCBgcGx1Z2luc2BcbiAgICogZm9yIGEgcGx1Z2luIHdpdGggc2FtZSBuYW1lIGFuZCByZXR1cm4gaXRzIHRhcmdldC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB0YXJnZXRcbiAgICpcbiAgICovXG4gIG1vdW50ICh0YXJnZXQsIHBsdWdpbikge1xuICAgIGNvbnN0IGNhbGxlclBsdWdpbk5hbWUgPSBwbHVnaW4uaWRcblxuICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBmaW5kRE9NRWxlbWVudCh0YXJnZXQpXG5cbiAgICBpZiAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgdGhpcy5jb3JlLmxvZyhgSW5zdGFsbGluZyAke2NhbGxlclBsdWdpbk5hbWV9IHRvIGEgRE9NIGVsZW1lbnRgKVxuXG4gICAgICAvLyBjbGVhciBldmVyeXRoaW5nIGluc2lkZSB0aGUgdGFyZ2V0IGNvbnRhaW5lclxuICAgICAgaWYgKHRoaXMub3B0cy5yZXBsYWNlVGFyZ2V0Q29udGVudCkge1xuICAgICAgICB0YXJnZXRFbGVtZW50LmlubmVySFRNTCA9ICcnXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWwgPSBwbHVnaW4ucmVuZGVyKHRoaXMuY29yZS5zdGF0ZSlcbiAgICAgIHRhcmdldEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbClcblxuICAgICAgcmV0dXJuIHRhcmdldEVsZW1lbnRcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogaXMgaW5zdGFudGlhdGluZyB0aGUgcGx1Z2luIHJlYWxseSB0aGUgd2F5IHRvIHJvbGxcbiAgICAgIC8vIGp1c3QgdG8gZ2V0IHRoZSBwbHVnaW4gbmFtZT9cbiAgICAgIGNvbnN0IFRhcmdldCA9IHRhcmdldFxuICAgICAgY29uc3QgdGFyZ2V0UGx1Z2luTmFtZSA9IG5ldyBUYXJnZXQoKS5pZFxuXG4gICAgICB0aGlzLmNvcmUubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gJHt0YXJnZXRQbHVnaW5OYW1lfWApXG5cbiAgICAgIGNvbnN0IHRhcmdldFBsdWdpbiA9IHRoaXMuY29yZS5nZXRQbHVnaW4odGFyZ2V0UGx1Z2luTmFtZSlcbiAgICAgIGNvbnN0IHNlbGVjdG9yVGFyZ2V0ID0gdGFyZ2V0UGx1Z2luLmFkZFRhcmdldChwbHVnaW4pXG5cbiAgICAgIHJldHVybiBzZWxlY3RvclRhcmdldFxuICAgIH1cbiAgfVxuXG4gIGZvY3VzICgpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIHJldHVyblxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxucmVxdWlyZSgnd2hhdHdnLWZldGNoJylcblxuY29uc3QgX2dldE5hbWUgPSAoaWQpID0+IHtcbiAgcmV0dXJuIGlkLnNwbGl0KCctJykubWFwKChzKSA9PiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKSkuam9pbignICcpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvciAob3B0cykge1xuICAgIHRoaXMub3B0cyA9IG9wdHNcbiAgICB0aGlzLnByb3ZpZGVyID0gb3B0cy5wcm92aWRlclxuICAgIHRoaXMuaWQgPSB0aGlzLnByb3ZpZGVyXG4gICAgdGhpcy5hdXRoUHJvdmlkZXIgPSBvcHRzLmF1dGhQcm92aWRlciB8fCB0aGlzLnByb3ZpZGVyXG4gICAgdGhpcy5uYW1lID0gdGhpcy5vcHRzLm5hbWUgfHwgX2dldE5hbWUodGhpcy5pZClcbiAgfVxuXG4gIGF1dGggKCkge1xuICAgIHJldHVybiBmZXRjaChgJHt0aGlzLm9wdHMuaG9zdH0vJHt0aGlzLmlkfS9hdXRoYCwge1xuICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24uanNvbidcbiAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgIHJldHVybiByZXMuanNvbigpXG4gICAgICAudGhlbigocGF5bG9hZCkgPT4ge1xuICAgICAgICByZXR1cm4gcGF5bG9hZC5hdXRoZW50aWNhdGVkXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBsaXN0IChkaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gZmV0Y2goYCR7dGhpcy5vcHRzLmhvc3R9LyR7dGhpcy5pZH0vbGlzdC8ke2RpcmVjdG9yeSB8fCAnJ31gLCB7XG4gICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgfVxuICAgIH0pXG4gICAgLnRoZW4oKHJlcykgPT4gcmVzLmpzb24oKSlcbiAgfVxuXG4gIGxvZ291dCAocmVkaXJlY3QgPSBsb2NhdGlvbi5ocmVmKSB7XG4gICAgcmV0dXJuIGZldGNoKGAke3RoaXMub3B0cy5ob3N0fS8ke3RoaXMuaWR9L2xvZ291dD9yZWRpcmVjdD0ke3JlZGlyZWN0fWAsIHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuIiwiIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImNvbnN0IFVwcHkgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9zcmMvY29yZS9Db3JlLmpzJylcbmNvbnN0IFR1czEwID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vc3JjL3BsdWdpbnMvR29vZ2xlRHJpdmUnKVxuXG5jb25zdCB1cHB5ID0gbmV3IFVwcHkoe2RlYnVnOiB0cnVlLCBhdXRvUHJvY2VlZDogZmFsc2V9KVxuXG51cHB5XG4gIC51c2UoVHVzMTAsIHtlbmRwb2ludDogJy8vbWFzdGVyLnR1cy5pby9maWxlcy8nfSlcbiAgLnJ1bigpXG5cbmNvbnNvbGUubG9nKCctLT4gVXBweSBCdW5kbGVkIHZlcnNpb24gd2l0aCBUdXMxMCAmIFJ1c3NpYW4gbGFuZ3VhZ2UgcGFjayBoYXMgbG9hZGVkJylcbiJdfQ==