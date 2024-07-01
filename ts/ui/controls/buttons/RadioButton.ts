import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface RadioButtonOptions extends UIControlOptions {
  caption?: string
  checked?: boolean
  name?: string
}

export class RadioButton extends UIControl<HTMLLabelElement> {
  private _check: HTMLInputElement
  private _caption: HTMLSpanElement

  public constructor(options: RadioButtonOptions) {
    super()

    const b = new Builder().n("label").class("ui-checkbox")
    this._ctl = b.element

    this._check = b.n("input").attr("type", "radio").attr("name", options.name).class("check").element
    this._caption = b.n("span").class("label").element

    if (options) {
      if (options.caption) {
        this.caption = options.caption
      }
      if (options.checked) {
        this.checked = options.checked
      }
    }

    this.setOptions(options)
  }

  addListener(name: string, func: any) {
    if (name === "checked") {
      this._check.addEventListener("click", func)
    } else {
      super.addListener(name, func)
    }
  }

  public set caption(value: string) {
    this._caption.innerHTML = value
  }

  public set checked(value: boolean) {
    this._check.checked = value
  }
}
