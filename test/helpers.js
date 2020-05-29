import _sinon from 'sinon'

import {
  fixture,
  expect as _expect,
  html as _html,
} from '@open-wc/testing'

export const sinon = _sinon
export const expect = _expect
export const html = _html
export const wait = ms => Promise.resolve(resolve => setTimeout(resolve, ms))

function getBaseClass (element) {
  return Object.getPrototypeOf(element.constructor)
}

async function genTestData (componentName) {
  const elements = {}
  const instance = await fixture(`<${componentName}></${componentName}>`)
  const componentType = window.customElements.get(componentName)

  const baseRefs = getBaseClass(instance).refs || {}
  const refs = { ...baseRefs, ...componentType.refs }

  if (!componentType) {
    throw new Error('Invalid custom element:', componentType)
  }

  if (refs) {
    Object.entries(refs).forEach(([name, selector]) => {
      Object.defineProperty(elements, name, {
        get: () => {
          if (selector.endsWith('-')) {
            const query = `[id^='${selector}']`
            const nodeList = instance.shadowRoot.querySelectorAll(query)

            return Array.from(nodeList)
          }

          return instance.shadowRoot.getElementById(selector)
        },
      })
    })
  }

  const updateComplete = async () => {
    while (!(await instance.updateComplete)) {}
  }

  return {
    instance,
    elements,
    updateComplete,
  }
}

export function genSuite (componentName, { onBegan, onStart, onFinish }, callback) {
  const meta = {
    sandbox: null,
    instance: null,
    elements: null,
    updateComplete: null,
  }

  describe(componentName, () => {
    beforeEach(async () => {
      meta.sandbox = sinon.createSandbox()

      if (onBegan) {
        onBegan(meta)
      }

      const result = await genTestData(componentName)
      meta.instance = result.instance
      meta.elements = result.elements
      meta.updateComplete = result.updateComplete

      if (onStart) {
        onStart(meta)
      }

      await meta.updateComplete()
    })

    afterEach(() => {
      meta.sandbox.restore()

      if (onFinish) {
        onFinish(meta)
      }
    })

    it('renders', () => expect(meta.instance.shadowRoot).to.exist)

    callback(meta)
  })
}
