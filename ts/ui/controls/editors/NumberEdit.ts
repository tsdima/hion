import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface NumberEditOptions extends UIControlOptions {
  number: number
  min?: number
  max?: number
  step?: number
  placeHolder?: string
}

export class NumberEdit extends UIControl<HTMLInputElement> {
  public constructor(options: NumberEditOptions) {
    super()

    this._ctl = new Builder().n("input").attr("type", "number").class("ui-edit").element

    if (options) {
      this.number = options.number || 0
      this._ctl.min = options.min.toString() || '0'
      if (options.max) {
        this._ctl.max = options.max.toString()
      }
      if (options.step) {
        this._ctl.step = options.step.toString()
      }
      if (options.placeHolder) {
        this.placeHolder = options.placeHolder
      }
    }

    this.setOptions(options)
  }

  public set placeHolder(value: string) {
    this._ctl.placeholder = value
  }

  public set number(value: number) {
    this._ctl.value = value.toString()
  }

  public get number(): number {
    return parseInt(this._ctl.value)
  }
}
