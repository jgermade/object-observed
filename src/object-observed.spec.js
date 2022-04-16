
import { createObjectObserved, nextTick } from './object-observed'

test('OO.$on("foo")', async () => {
  const OO = createObjectObserved()
  const onFoo = jest.fn()

  OO.$on('foo', onFoo)
  OO.foo = 'bar'

  await nextTick()

  expect(onFoo).toHaveBeenCalledTimes(1)
  expect(onFoo).toHaveBeenCalledWith('bar')
})

test('OO.$onAny()', async () => {
  const OO = createObjectObserved()
  const onAny = jest.fn()

  OO.$onAny(onAny)
  OO.foo = 'bar'

  await nextTick()

  expect(onAny).toHaveBeenCalledTimes(1)
  expect(onAny).toHaveBeenCalledWith('foo', 'bar')
})

test('OO.$onAny({ foo: { bar: "foobar" } })', async () => {
  const OO = createObjectObserved()
  const onAny = jest.fn()

  OO.$onAny(onAny)
  OO.foo = { bar: 'foobar' }

  await nextTick()

  expect(onAny).toHaveBeenCalledTimes(2)
  expect(onAny).toHaveBeenNthCalledWith(1, 'foo.bar', 'foobar')
  expect(onAny).toHaveBeenNthCalledWith(2, 'foo', expect.objectContaining({
    bar: 'foobar',
  }))
})

test('OO.$onAny({ foo: { bar: "foobar" -> "barfoo" } })', async () => {
  const OO = createObjectObserved({ foo: { bar: 'foobar' } })
  const onAny = jest.fn()

  OO.$onAny(onAny)
  OO.foo.bar = 'barfoo'

  await nextTick()

  expect(onAny).toHaveBeenCalledTimes(1)
  expect(onAny).toHaveBeenNthCalledWith(1, 'foo.bar', 'barfoo')
})

test('Observed Array', async () => {
  const OA = createObjectObserved([])
  const onAny = jest.fn()

  OA.$onAny(onAny)

  OA.push(1)

  await nextTick()

  expect(onAny).toHaveBeenCalledTimes(2)
  expect(onAny).toHaveBeenNthCalledWith(1, '0', 1)
  expect(onAny).toHaveBeenNthCalledWith(2, 'length', 1)
})

test('Observed nested Array', async () => {
  const OA = createObjectObserved({ list: [1, 2, 3] })
  const onAny = jest.fn()

  OA.$onAny(onAny)

  OA.list.push(4)

  await nextTick()

  expect(onAny).toHaveBeenCalledTimes(2)
  expect(onAny).toHaveBeenNthCalledWith(1, 'list.3', 4)
  expect(onAny).toHaveBeenNthCalledWith(2, 'list.length', 4)
})

test('Observed shift Array', async () => {
  const OA = createObjectObserved({ list: [1, 2, 3] })
  const onAny = jest.fn()

  OA.$onAny(onAny)

  OA.list.shift()

  await nextTick()

  expect(onAny).toHaveBeenCalledTimes(4)
  expect(onAny).toHaveBeenNthCalledWith(1, 'list.0', 2)
  expect(onAny).toHaveBeenNthCalledWith(2, 'list.1', 3)
  expect(onAny).toHaveBeenNthCalledWith(3, 'list.2', undefined)
  expect(onAny).toHaveBeenNthCalledWith(4, 'list.length', 2)
})

test('Observed pop Array', async () => {
  const OA = createObjectObserved({ list: [1, 2, 3] })
  const onAny = jest.fn()

  OA.$onAny(onAny)

  OA.list.pop()

  await nextTick()

  expect(onAny).toHaveBeenCalledTimes(2)
  expect(onAny).toHaveBeenNthCalledWith(1, 'list.2', undefined)
  expect(onAny).toHaveBeenNthCalledWith(2, 'list.length', 2)
})

test('Observed unshift Array', async () => {
  const OA = createObjectObserved({ list: [1, 2, 3] })
  const onAny = jest.fn()

  OA.$onAny(onAny)

  OA.list.unshift(-1)

  await nextTick()

  expect(onAny).toHaveBeenCalledTimes(5)
  expect(onAny).toHaveBeenNthCalledWith(1, 'list.3', 3)
  expect(onAny).toHaveBeenNthCalledWith(2, 'list.2', 2)
  expect(onAny).toHaveBeenNthCalledWith(3, 'list.1', 1)
  expect(onAny).toHaveBeenNthCalledWith(4, 'list.0', -1)
  expect(onAny).toHaveBeenNthCalledWith(5, 'list.length', 4)
})
