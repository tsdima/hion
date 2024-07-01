import { UIContainer } from './UIContainer'
import { UIControlOptions } from './UIControl'
import { Layout } from './layouts/Layout'
import { Builder } from '../Builder'
import { HLayout } from './layouts/HLayout'

interface PanelOptions extends UIControlOptions {
  layout?: Layout
}

export class Panel extends UIContainer {
  private readonly body: HTMLElement

  public constructor(options: PanelOptions) {
    super()

    const panel = new Builder().n('div').class("ui-panel")
    this.body = panel.div("content").element
    this._ctl = panel.element

    this.layout = null

    if (options) {
      if (options.layout) {
        this.layout = options.layout
      }
    }

    if (!this.layout) {
      this.layout = new HLayout(this, {})
    }

    this.setOptions(options)
  }

  getContainer(): HTMLElement {
    return this.body
  }
}
