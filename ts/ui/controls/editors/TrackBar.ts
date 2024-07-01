import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface TrackBarOptions extends UIControlOptions {
  min?: number
  max?: number
  step?: number
  position?: number
}

export class TrackBar extends UIControl<HTMLInputElement> {
  public constructor(options: TrackBarOptions) {
    super()

    this._ctl = new Builder().n("input").attr("type", "range").class("ui-trackbar").element as HTMLInputElement

    if (options) {
      if (options.min) {
        this._ctl.min = options.min.toString()
      }
      if (options.max) {
        this._ctl.max = options.max.toString()
      }
      if (options.step) {
        this._ctl.step = options.step.toString()
      }
      this.position = options.position || 0
    }

    this.setOptions(options);
  }

  public set position(value: number) {
    this._ctl.value = value.toString()
    this._ctl.dispatchEvent(new Event('input'))
  }

  public get position(): number {
    return parseInt(this._ctl.value)
  }
}
