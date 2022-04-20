
const isArray = Array.isArray
const promise_resolved = Promise.resolve()
export const nextTick = (fn = () => {}) => promise_resolved.then(fn)

export function createObjectObserved (initial_object) {
  const listeners = {}
  const listeners_any = []

  const events_queue = []
  let emit_nextTick = true // disabled while initializing

  const nestedPath = (path, key) => path + (path ? '.' : '') + key

  function emitMutation (path, value) {
    events_queue.push([path, value])
    if (emit_nextTick) return
    
    emit_nextTick = nextTick(() => {
      emit_nextTick = null
      events_queue.splice(0).forEach(([path, value]) => {
        listeners[path]?.forEach(listener => listener(value))
        listeners_any.forEach(listener => listener(path, value))
      })
    })
  }

  function getObservedValue (value, path) {
    if (isArray(value)) return mapArrayObserved(value, path)
    if (typeof value === 'object') return mapOjectObserved(value, path)
    return value
  }

  function mapArrayObserved (arr = [], path = '') {
    return new Proxy(arr.map((value, i) => getObservedValue(value, nestedPath(path, i))), {
      deleteProperty (obj, key) {
        delete obj[key]
        emitMutation(nestedPath(path, key), undefined)
        return true
      },
      set (obj, key, value) {
        const nested_key = nestedPath(path, key)
        obj[key] = key === 'length' ? value : getObservedValue(value, nested_key)
        emitMutation(nested_key, obj[key])
        return true
      }
    })
  }
  
  function mapOjectObserved (src = {}, path = '') {
    const oo = new Proxy({}, {
      set (obj, key, value) {
        const nested_key = nestedPath(path, key)
        obj[key] = getObservedValue(value, nested_key)
        emitMutation(nested_key, obj[key])
        return true
      },
      deleteProperty (obj, key) {
        delete obj[key]
        emitMutation(nestedPath(path, key), undefined)
        return true
      },
    })

    for (const key in src) oo[key] = getObservedValue(src[key], key)

    return oo
  }

  const OO = isArray(initial_object)
    ? mapArrayObserved(initial_object)
    : mapOjectObserved(initial_object)

  Object.defineProperties(OO, {
    $on: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: (event_name, listener) => {
        (listeners[event_name] ??= []).push(listener)
        return OO
      }
    },
    $off: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: (event_name, listener) => {
        const index = listeners[event_name]?.indexOf(listener) ?? -1
        if (index === -1) return
        listeners[event_name].splice(index, 1)
        return OO
      },
    },
    $onAny: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: (listener) => {
        listeners_any.push(listener)
        return OO
      },
    },
    $offAny: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: (listener) => {
        const index = listeners_any.indexOf(listener) ?? -1
        if (index === -1) return
        listeners_any.splice(index, 1)
        return OO
      },
    },
  })

  emit_nextTick = null
  events_queue.splice(0)

  return OO
}
