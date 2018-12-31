# p-map [![Build Status](https://travis-ci.org/dinhoabreu/node-p-map.svg?branch=master)](https://travis-ci.org/dinhoabreu/node-p-map) [![Coverage Status](https://coveralls.io/repos/github/dinhoabreu/node-p-map/badge.svg?branch=master)](https://coveralls.io/github/dinhoabreu/node-p-map?branch=master)

> Map over async/promises concurrently

Control concurrent execution of async/promises functions.

## Install

```sh
npm install @dinhoabreu/p-map
```

## Usage

```js
const pMap = require('@dinhoabreu/p-map')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const main = async () => {
  const list = Promise.resolve([
    Promise.resolve('google.com'),
    'todomvc.com',
    'github.com'
  ])
  const mapper = async site => {
    await delay(50)
    return `https://${site}`
  }
  const map = pMap(mapper, { concurrency: 2 })
  const result = await map(list)
  console.log(result)
  // => ['https://google.com/', 'https://todomvc.com/', 'https://github.com/']
}

main()
```

## API

### pMap(mapper, [options])

Creates a function `map(input)`.

#### mapper(element, index)

Type: `Function`

Expected to return a `Promise` or value.

#### options

Type: `Object`

##### concurrency

Type: `number`
Default: `Infinity`
Minimum: `1`

##### rejectOnError

Type: `boolean`
Default: `true`

#### map(input)

With `rejectOnError`, returns a `Promise` that is fulfilled when all promises in `input` and ones returned from `mapper` are fulfilled, or rejects if any of the promises reject. The fulfilled value is an `Array` of the fulfilled values returned from `mapper` in `input` order.

Without `rejectOnError`, returns a `Promise` that is fulfilled when all promises in `input` and ones returned from `mapper` are fulfilled. The fulfilled value is an `Array` of `Array` the rejected or resolved values returned from `mapper` in `input` order. Check our <test/index.js> to see more.

#### input

Type: `Iterable<Promise|any>`

Iterated over concurrently in the `mapper` function.

## License

MIT © [Edison E. Abreu](https://github.com/dinhoabreu/)
