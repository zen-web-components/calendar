import Calendar from '../src/calendar'

import { html, storiesOf } from '@open-wc/demoing-storybook'

const changeAction = date => console.info('onChange', date)
const changeDisplayAction = date => console.info('onChangeDisplay', date)

const stories = storiesOf('Controls|Calendar', module)

stories.add(
  'Main',
  () => html`
    <zen-calendar
      .value="${new Date('2019-12-03T00:00:00')}"
      .displayDate="${new Date('2019-12-01T00:00:00')}"
      .onChange="${changeAction}"
      .onChangeDisplay="${changeDisplayAction}"
    ></zen-calendar>
  `,
)

window.customElements.define('zen-calendar', Calendar)
