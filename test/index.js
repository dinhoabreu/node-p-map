/* eslint-env mocha */
const { expect } = require('chai')

const pMap = require('..')

process.on('unhandledRejection', () => {})

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const timeSpan = (ts = Date.now()) => () => Date.now() - ts

const unexpectedVal = new Error('Unexpected val')
const mapper = ([val, ms]) => delay(ms)
  .then(() => {
    if (val === null) throw unexpectedVal
    return val
  })
const input = [
  Promise.resolve([10, 300]),
  [20, 200],
  [30, 100]
]
const inputWithRejected = [
  Promise.resolve([10, 300]),
  [20, 200],
  [null, 100]
]

describe('pMap', () => {
  describe('with rejectOnError', () => {
    const map = pMap(mapper)
    const mapLimit = pMap(mapper, { concurrency: 2 })
    const mapSerie = pMap(mapper, { concurrency: 1 })
    const expected = [10, 20, 30]
    it('should map empty array', async () => {
      const end = timeSpan()
      const result = await map([])
      expect(end()).to.be.within(0, 50)
      expect(result).to.deep.equal([])
    })
    it('should map all concurrently', async () => {
      const end = timeSpan()
      const result = await map(input)
      expect(end()).to.be.within(290, 350)
      expect(result).to.deep.equal(expected)
    })
    it('should limit map concurrently to 2', async () => {
      const end = timeSpan()
      const result = await mapLimit(input)
      expect(end()).to.be.within(290, 350)
      expect(result).to.deep.equal(expected)
    })
    it('should limit map in serie', async () => {
      const end = timeSpan()
      const result = await mapSerie(input)
      expect(end()).to.be.within(590, 650)
      expect(result).to.deep.equal(expected)
    })
    it('should reject as soon as posible', async () => {
      const end = timeSpan()
      try {
        await map(inputWithRejected)
      } catch (error) {
        expect(end()).to.be.within(90, 150)
        expect(error).to.be.instanceOf(Error)
        expect(error.message).to.be.equal('Unexpected val')
        return
      }
      throw new Error('Promise resolve')
    })
  })
  describe('without rejectOnError', () => {
    const map = pMap(mapper, { rejectOnError: false })
    const mapLimit = pMap(mapper, { concurrency: 2, rejectOnError: false })
    const mapSerie = pMap(mapper, { concurrency: 1, rejectOnError: false })
    const expected = [
      [null, 10],
      [null, 20],
      [null, 30]
    ]
    const expectedWithReject = [
      [null, 10],
      [null, 20],
      [unexpectedVal, null]
    ]
    it('should map empty array', async () => {
      const end = timeSpan()
      const result = await map([])
      expect(end()).to.be.within(0, 50)
      expect(result).to.deep.equal([])
    })
    it('should map all concurrently', async () => {
      const end = timeSpan()
      const result = await map(input)
      expect(end()).to.be.within(290, 350)
      expect(result).to.deep.equal(expected)
    })
    it('should limit map concurrently to 2', async () => {
      const end = timeSpan()
      const result = await mapLimit(input)
      expect(end()).to.be.within(290, 350)
      expect(result).to.deep.equal(expected)
    })
    it('should limit map in serie', async () => {
      const end = timeSpan()
      const result = await mapSerie(input)
      expect(end()).to.be.within(590, 650)
      expect(result).to.deep.equal(expected)
    })
    it('should reject as soon as posible', async () => {
      const end = timeSpan()
      const result = await map(inputWithRejected)
      expect(end()).to.be.within(290, 350)
      expect(result).to.deep.equal(expectedWithReject)
    })
  })
})
