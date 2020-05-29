import Calendar from '../src/calendar'

import { html } from 'lit-element'

import { sinon, expect, genSuite } from './helpers'

const NAME = 'someName'
const NOW = new Date('2019-12-01T00:00:00')

let clock
let onChangeSpy

const REFS = {
  daySpots: 'day-',
}

window.customElements.define('neb-calendar-test', class extends Calendar {
  static get refs () { return REFS }

  renderDay (num, index) {
    return html`
      <span
        id="${REFS.daySpots}-${index}"
        .num="${num}"
        @click="${this.handlers.selectDate}"
      >${num}</span>
    `
  }
})

genSuite('neb-calendar-test', {
  onBegan: () => {
    clock = sinon.useFakeTimers(NOW)
  },
  onStart: meta => {
    meta.instance.name = NAME

    onChangeSpy = meta.sandbox.spy(meta.instance, 'onChange')
  },
  onFinish: () => {
    clock.restore()
  },
}, meta => {
  it('has correct day offset', () =>
    expect(meta.instance.getDayNumOffset()).to.be.eq(1))

  it('outputs 31 days', () =>
    expect(meta.instance.getDaysInMonthCount()).to.be.eq(31))

  it('outputs 5 weeks', () =>
    expect(meta.instance.getWeekCount()).to.be.eq(5))

  context('when displayDate is provided', () => {
    beforeEach(async () => {
      meta.instance.displayDate = new Date('2019-03-01T00:00:00')
      await meta.updateComplete()
    })

    it('has correct day offset', () =>
      expect(meta.instance.getDayNumOffset()).to.be.eq(-4))

    it('outputs 31 days', () =>
      expect(meta.instance.getDaysInMonthCount()).to.be.eq(31))

    it('outputs 6 weeks', () =>
      expect(meta.instance.getWeekCount()).to.be.eq(6))

    it('is false if passed a different day from the selected date', () =>
      expect(meta.instance.isDayNumSelected(4)).to.be.false)

    it('is false if passed the same day num as the selected date', () =>
      expect(meta.instance.isDayNumSelected(1)).to.be.false)

    context('when a date is selected (same month)', () => {
      const ROW_STYLE_SYMBOLS = ['', '', '', '', '', '<', '>']

      beforeEach(async () => {
        meta.instance.value = new Date('2019-03-01T00:00:00')
        await meta.updateComplete()
      })

      it('is false if passed a different day from the selected date', () =>
        expect(meta.instance.isDayNumSelected(4)).to.be.false)

      it('is true if passed the same day num as the selected date', () =>
        expect(meta.instance.isDayNumSelected(1)).to.be.true)

      it('returns the correct selected week index', () =>
        expect(meta.instance.getSelectedWeekIndex()).to.be.eq(0))

      ROW_STYLE_SYMBOLS.forEach((v, i) => {
        const result = v ? (v === '<' ? 'start' : 'end') : 'no'

        it(`has style symbol: ${result}`, () =>
          expect(meta.instance.getStyleSymbol(i - 4, i)).to.be.eq(v))
      })

      context('when a day in the middle of the month is selected', () => {
        const ROW_STYLE_SYMBOLS_MIDDLE = ['<', '=', '=', '=', '=', '=', '>']

        beforeEach(async () => {
          meta.instance.value = new Date('2019-03-14T00:00:00')
          await meta.updateComplete()
        })

        ROW_STYLE_SYMBOLS_MIDDLE.forEach((v, i) => {
          const result = v ? (v === '<' ? 'start' : 'end') : 'no'

          it(`has style symbol: ${result}`, () =>
            expect(meta.instance.getStyleSymbol(i + 10, i + 14)).to.be.eq(v))
        })
      })

      context('when a day in the last week is selected', () => {
        const ROW_STYLE_SYMBOLS_LAST = ['<>', '', '', '', '', '', '']

        beforeEach(async () => {
          meta.instance.value = new Date('2019-03-31T00:00:00')
          await meta.updateComplete()
        })

        ROW_STYLE_SYMBOLS_LAST.forEach((v, i) => {
          const result = v ? (v === '<' ? 'start' : 'end') : 'no'

          it(`has style symbol: ${result}`, () =>
            expect(meta.instance.getStyleSymbol(i + 31, i + 35)).to.be.eq(v))
        })
      })
    })

    context('when a date is selected (different months)', () => {
      beforeEach(async () => {
        meta.instance.value = new Date('2019-10-12T00:00:00')
        await meta.updateComplete()
      })

      it('is false if passed a different day from the selected date', () =>
        expect(meta.instance.isDayNumSelected(10)).to.be.false)

      it('is false if passed the same day num as the selected date', () =>
        expect(meta.instance.isDayNumSelected(12)).to.be.false)
    })

    context('when the 14th day spot is clicked', () => {
      const EXPECTED_VALUE = new Date('2019-03-14T00:00:00')

      beforeEach(async () => {
        meta.elements.daySpots[13].click()
        await meta.updateComplete()
      })

      it('invokes the callback', () =>
        expect(onChangeSpy).to.be.calledOnceWith(NAME, EXPECTED_VALUE))
    })
  })

  describe('isValidDayNum', () => {
    it('is not valid when zero is passed', () =>
      expect(meta.instance.isValidDayNum(0)).to.be.false)

    it('is not valid when negative values are passed', () =>
      expect(meta.instance.isValidDayNum(-1)).to.be.false)

    it('is not valid when values greater than the day count are passed', () =>
      expect(meta.instance.isValidDayNum(32)).to.be.false)

    it('is valid when the value is 1', () =>
      expect(meta.instance.isValidDayNum(1)).to.be.true)

    it('is valid when the value is the day count', () =>
      expect(meta.instance.isValidDayNum(31)).to.be.true)

    it('is valid when the value is within 1 and the day count', () =>
      expect(meta.instance.isValidDayNum(12)).to.be.true)
  })
})
