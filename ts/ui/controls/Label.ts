import { UIControl, UIControlOptions } from './UIControl'
import { Builder, BuilderElementType } from '../Builder'

interface LabelOptions extends UIControlOptions {
  caption?: string
  halign?: number
  valign?: number
}

export class Label extends UIControl {
  private _caption: BuilderElementType

  public constructor (options?: LabelOptions) {
    super()

    const b = new Builder().div("ui-label")
    this._ctl = b.element
    this._caption = b.n("span").element

    if (options) {
      if (options.caption) {
        this.caption = options.caption
      }
      if (options.halign) {
        b.style("alignItems", ["flex-start", "center", "flex-end"][options.halign])
      }
      if (options.valign === 0 || options.valign === 2) {
        b.style("justifyContent", ["flex-start", "center", "flex-end"][options.valign])
      }
    }

    this.setOptions(options);
  }

  public set caption(value: any) {
    this._caption.innerHTML = value
  }

  public get caption (): string {
    return this._caption.innerHTML
  }
}
