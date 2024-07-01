import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface EditOptions extends UIControlOptions {
  text?: string
  placeHolder?: string
  password?: boolean
  pattern?: string
}

export class Edit extends UIControl<HTMLInputElement> {
  public constructor(options: EditOptions) {
    super()

    this._ctl = new Builder<HTMLInputElement>().n("input").class("ui-edit").element

    if (options) {
      if (options.text) {
        this.text = options.text
      }
      if (options.placeHolder) {
        this.placeHolder = options.placeHolder;
      }
      if (options.password) {
        this._ctl.setAttribute("type", "password")
      }
      if (options.pattern) {
        this._ctl.setAttribute("pattern", options.pattern)
      }
    }

    this.setOptions(options)
  }

  public set text(value: any) {
    this._ctl.value = value
  }

  public get text(): string {
    return this._ctl.value
  }

  public set placeHolder(value: string) {
    this._ctl.placeholder = value
  }
}
