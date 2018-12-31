const defaultOptions = { concurrency: Infinity, rejectOnError: true }
const noop = () => {}

const aMap = (mapper, options = defaultOptions) => (iterable, progress = noop) => {
  const results = []
  const context = {
    resolve: null,
    reject: null,
    mapper,
    options,
    iterable,
    progress
  }
  const state = {
    iterator: null,
    item: null,
    rejected: false,
    finished: 0,
    running: 0,
    index: 0,
    results
  }
  Promise.resolve(iterable).then(iterable => {
    const iterator = iterable[Symbol.iterator]()
    const item = iterator.next()
    if (item.done) return context.resolve([])
    state.iterator = iterator
    state.item = item
    const next = createNext(state, context, () => run())
    const run = createRun(state, context, next)
    progress(state)
    run()
  })
  return new Promise((resolve, reject) => {
    context.resolve = resolve
    context.reject = error => {
      state.rejected = true
      reject(error)
    }
  })
}

const createNext = (state, context, run) => {
  const { resolve, progress, options } = context
  const { rejectOnError = true } = options
  const { results } = state
  return (error, data, i) => {
    state.finished += 1
    state.running -= 1
    results[i] = rejectOnError
      ? data
      : [error, data]
    progress(state)
    if (state.item.done && state.running === 0) {
      return resolve(results)
    }
    run()
  }
}

const createRun = (state, context, next) => () => {
  const { iterator } = state
  const { reject, progress, mapper, options } = context
  const { concurrency = Infinity, rejectOnError = true } = options
  while (
    !state.rejected &&
    !state.item.done &&
    state.running < concurrency
  ) {
    const index = state.index
    state.index += 1
    state.running += 1
    progress(state)
    Promise.resolve(state.item.value)
      .then(item => mapper(item, index))
      .then(data => next(null, data, index))
      .catch(error => rejectOnError
        ? reject(error)
        : next(error, null, index))
    state.item = iterator.next()
  }
}

module.exports = aMap
