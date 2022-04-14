
Object Observed
---------------

[![Build Status](https://cloud.drone.io/api/badges/jgermade/object-observed/status.svg?ref=refs/heads/main)](https://cloud.drone.io/jgermade/object-observed)

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