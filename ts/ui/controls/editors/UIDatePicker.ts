import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface UIDatePickerOptions extends UIControlOptions {
  date?: string
  min?: string
  max?: string
}

export class UIDatePicker extends UIControl<HTMLInputElement> {
  public constructor(options: UIDatePickerOptions) {
    super()

    this._ctl = new Builder().n("input").attr("type", "date").class("ui-datepicker").element

    if (options) {
      this.date = options.date || ""
      if (options.min) {
        this._ctl.min = options.min
      }
      if (options.max) {
        this._ctl.max = options.max
      }
    }

    this.setOptions(options)
  }

  public set placeHolder(value: string) {
    this._ctl.placeholder = value
  }

  public set date(value: string) {
    this._ctl.value = value
  }

  public get date(): string {
    return this._ctl.value
  }
}
