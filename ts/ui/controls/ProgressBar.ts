import { UIControl, UIControlOptions } from './UIControl'
import { Builder } from '../Builder'

interface ProgressBarOptions extends UIControlOptions {
  custom?: boolean
  max?: number
  position?: number
}

export class ProgressBar extends UIControl<HTMLDivElement|HTMLProgressElement> {
  private maxValue: number
  private currentValue: number
  private readonly custom: boolean

  public constructor(options: ProgressBarOptions) {
    super()

    this.custom = !!options?.custom

    const b = new Builder().n(this.custom ? "div" : "progress").class("ui-progressbar")
    b.div("content")
    this._ctl = b.element

    if (options?.max) {
      this.max = options.max
    }
    if (options?.position) {
      this.position = options.position
    }

    this.setOptions(options)
  }

  public set max(value: number) {
    this.maxValue = value
    if (!this.custom) {
      (this._ctl as HTMLProgressElement).max = value
    }
  }

  public set position(value: number) {
    this.currentValue = value
    if (this.custom) {
      const ctl = this._ctl.firstChild as HTMLDivElement
      ctl.style.width = (Math.round(value / this.maxValue * 100)).toString() + "%"
      ctl.style.display = (value > 0 ? "block" : "none")
    } else {
      (this._ctl as HTMLProgressElement).value = value
    }
  }

  public get position(): number {
    return this.currentValue
  }
}

// ProgressBar.prototype.setPosition = function(value) {
// 	this.position = value;
// 	this.control.firstChild.style.width = this._getPos().toString() + "px";
// 	this.control.firstChild.style.display = (value > 0 ? "block" : "none");
// };

// ProgressBar.prototype.getPosition = function() {
// 	return this.position;
// };