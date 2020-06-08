import { LitElement, html, css } from 'lit-element'

export const DAY_SYMBOLS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const REFS = {
  daySpots: 'day-',
}

export default class Calendar extends LitElement {
  static get refs () { return REFS }

  static get properties () {
    return {
      name: String,
      value: Object,
      displayDate: Object,
    }
  }

  static get styles () {
    return css`
      :host {
        display: inline-block;
        background-color: #FFF;
      }

      .container {
        display: flex;
        width: 100%;
        height: 100%;
        flex-flow: column nowrap;
      }

      .section {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }

      .section-symbols,
      .section-days { /* extend in sub-class */ }
    `
  }

  set displayDate (value) {
    const oldValue = value

    this.__displayDate = new Date(value.getFullYear(), value.getMonth(), 1)
    this.requestUpdate('displayDate', oldValue)
  }

  get displayDate () { return this.__displayDate }

  constructor () {
    super()
    this.initState()
    this.initHandlers()
  }

  initState () {
    const now = new Date()

    this.__dayNums = []
    this.__displayDate = new Date(now.getFullYear(), now.getMonth(), 1)

    this.name = ''
    this.value = null

    this.onChange = () => {}
    this.onChangeDisplay = () => {}
  }

  initHandlers () {
    this.handlers = {
      changeHeader: date => this.onChangeDisplay(this.name, date),
      selectToday: () => this.onChange(this.name, new Date()),
      selectDate: e => {
        const num = Number(e.currentTarget.num)
        const date = new Date(this.displayDate.getTime())
        date.setDate(num)

        this.onChange(this.name, date)
      },
    }
  }

  isValidDayNum (num) {
    return num > 0 && num <= this.getDaysInMonthCount()
  }

  isDayNumSelected (num) {
    return Boolean(this.value) &&
      this.value.getDate() === num &&
      this.value.getMonth() === this.displayDate.getMonth()
  }

  getDayNumOffset () {
    return 1 - this.displayDate.getDay()
  }

  getDaysInMonthCount () {
    return new Date(
      this.displayDate.getFullYear(),
      this.displayDate.getMonth() + 1,
      0,
    ).getDate()
  }

  getWeekCount () {
    const totalSpaces = this.getDaysInMonthCount() + this.displayDate.getDay()

    return Math.ceil(totalSpaces / 7)
  }

  getSelectedWeekIndex () {
    const index = this.value.getDate() - this.getDayNumOffset()

    return Math.floor(index / 7)
  }

  getStyleSymbol (num, index) {
    const currentWeekIndex = Math.floor(index / 7)

    if (!this.value ||
      !this.isValidDayNum(num) ||
      this.value.getMonth() !== this.displayDate.getMonth() ||
      this.getSelectedWeekIndex() !== currentWeekIndex
    ) {
      return ''
    }

    const date = this.value.getDate()
    const weekDayIndex = this.value.getDay()
    const startDay = Math.max(1, date - weekDayIndex)
    const endDay = Math.min(6 - weekDayIndex + date, this.getDaysInMonthCount())

    if (num === startDay && num === endDay) {
      return '<>'
    }

    if (num === startDay) {
      return '<'
    }

    if (num === endDay) {
      return '>'
    }

    return '='
  }

  getDate (num) {
    const date = new Date(this.displayDate.getTime())
    date.setDate(num)

    return date
  }

  update (changedProps) {
    if (changedProps.has('displayDate')) {
      const count = this.getWeekCount() * 7

      this.__dayNums = new Array(count).fill(0).map((_, index) =>
        (index + this.getDayNumOffset()))
    }

    super.update(changedProps)
  }

  __renderSymbols () {
    return DAY_SYMBOLS.map((symbol, index) =>
      this.renderSymbol(symbol, index))
  }

  __renderDays () {
    return this.__dayNums.map((num, index) =>
      (this.isValidDayNum(num)
        ? this.renderDay(num, index)
        : this.renderPlaceholder(index)))
  }

  renderHeader () {
    return html``
  }

  renderFooter () {
    return html``
  }

  renderSymbol (symbol, _index) {
    return html`
      <span>${symbol}</span>
    `
  }

  renderDay (num, index) {
    return html`
      <span
        id="${REFS.daySpots}-${index}"
        .num="${num}"
        @click="${this.handlers.selectDate}"
      >${num}</span>
    `
  }

  renderPlaceholder (_index) {
    return html`
      <div></div>
    `
  }

  render () {
    return html`
      <div class="container">
        ${this.renderHeader()}
        <div class="section section-symbols">${this.__renderSymbols()}</div>
        <div class="section section-days">${this.__renderDays()}</div>
        ${this.renderFooter()}
      </div>
    `
  }
}
