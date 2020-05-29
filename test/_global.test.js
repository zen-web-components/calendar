import chaiAsPromised from 'chai-as-promised'

import { chai } from '@bundled-es-modules/chai'

chai.use(require('sinon-chai'))

chai.use(chaiAsPromised)

before(() => {
  document.documentElement.style.fontSize = '62.5%'
})
