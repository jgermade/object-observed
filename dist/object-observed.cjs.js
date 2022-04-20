var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/object-observed.js
var object_observed_exports = {};
__export(object_observed_exports, {
  createObjectObserved: () => createObjectObserved,
  nextTick: () => nextTick
});
module.exports = __toCommonJS(object_observed_exports);
var isArray = Array.isArray;
var promise_resolved = Promise.resolve();
var nextTick = (fn = () => {
}) => promise_resolved.then(fn);
function createObjectObserved(initial_object) {
  const listeners = {};
  const listeners_any = [];
  const events_queue = [];
  let emit_nextTick = true;
  const nestedPath = (path, key) => path + (path ? "." : "") + key;
  function emitMutation(path, value) {
    events_queue.push([path, value]);
    if (emit_nextTick)
      return;
    emit_nextTick = nextTick(() => {
      emit_nextTick = null;
      events_queue.splice(0).forEach(([path2, value2]) => {
        var _a;
        (_a = listeners[path2]) == null ? void 0 : _a.forEach((listener) => listener(value2));
        listeners_any.forEach((listener) => listener(path2, value2));
      });
    });
  }
  function getObservedValue(value, path) {
    if (isArray(value))
      return mapArrayObserved(value, path);
    if (typeof value === "object")
      return mapOjectObserved(value, path);
    return value;
  }
  function mapArrayObserved(arr = [], path = "") {
    return new Proxy(arr.map((value, i) => getObservedValue(value, nestedPath(path, i))), {
      deleteProperty(obj, key) {
        delete obj[key];
        emitMutation(nestedPath(path, key), void 0);
        return true;
      },
      set(obj, key, value) {
        const nested_key = nestedPath(path, key);
        obj[key] = key === "length" ? value : getObservedValue(value, nested_key);
        emitMutation(nested_key, obj[key]);
        return true;
      }
    });
  }
  function mapOjectObserved(src = {}, path = "") {
    const oo = new Proxy({}, {
      set(obj, key, value) {
        const nested_key = nestedPath(path, key);
        obj[key] = getObservedValue(value, nested_key);
        emitMutation(nested_key, obj[key]);
        return true;
      },
      deleteProperty(obj, key) {
        delete obj[key];
        emitMutation(nestedPath(path, key), void 0);
        return true;
      }
    });
    for (const key in src)
      oo[key] = getObservedValue(src[key], key);
    return oo;
  }
  const OO = isArray(initial_object) ? mapArrayObserved(initial_object) : mapOjectObserved(initial_object);
  Object.defineProperties(OO, {
    $on: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: (event_name, listener) => {
        var _a;
        ((_a = listeners[event_name]) != null ? _a : listeners[event_name] = []).push(listener);
        return OO;
      }
    },
    $off: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: (event_name, listener) => {
        var _a, _b;
        const index = (_b = (_a = listeners[event_name]) == null ? void 0 : _a.indexOf(listener)) != null ? _b : -1;
        if (index === -1)
          return;
        listeners[event_name].splice(index, 1);
        return OO;
      }
    },
    $onAny: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: (listener) => {
        listeners_any.push(listener);
        return OO;
      }
    },
    $offAny: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: (listener) => {
        var _a;
        const index = (_a = listeners_any.indexOf(listener)) != null ? _a : -1;
        if (index === -1)
          return;
        listeners_any.splice(index, 1);
        return OO;
      }
    }
  });
  emit_nextTick = null;
  events_queue.splice(0);
  return OO;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createObjectObserved,
  nextTick
});
