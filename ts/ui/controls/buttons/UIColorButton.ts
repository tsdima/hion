import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface UIColorButtonOptions extends UIControlOptions {
  color?: string
}

export class UIColorButton extends UIControl<HTMLInputElement> {
  public constructor(options) {
    super()

    this._ctl = new Builder().n("input").attr("type", "color").class("ui-colorbutton").element

    if (options) {
      this.color = options.color || ""
    }

    this.setOptions(options);
  }

  public set color(value: string) {
    this._ctl.value = value
  }

  public get color(): string {
    return this._ctl.value
  }
}
