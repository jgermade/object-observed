
Object Observed
---------------

``` sh
npm i object-observed
```

``` js
import { createObjectObserved } from 'object-observed'

const OO = createObjectObserved()

OO.$on('foo.bar', value => console.log('foo.bar is now:', value))

OO.foo = { bar: 'foobar' }

// foo.bar is now: foobar
```