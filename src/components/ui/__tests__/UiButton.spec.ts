import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '../UiButton.vue'

describe('UiButton', () => {
  it('renders slot content as a button', () => {
    const wrapper = mount(UiButton, { slots: { default: 'Save' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.text()).toBe('Save')
  })

  it('disables itself and shows a spinner while loading', () => {
    const wrapper = mount(UiButton, { props: { loading: true }, slots: { default: 'Save' } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })
})
