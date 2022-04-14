
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
