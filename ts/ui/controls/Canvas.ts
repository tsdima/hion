import { UIControl, UIControlOptions } from './UIControl'
import { Builder } from '../Builder'

export class Canvas extends UIControl<HTMLCanvasElement> {
  private canvas: CanvasRenderingContext2D

  public constructor(options: UIControlOptions) {
    super()

    this._ctl = new Builder().n("canvas").class("ui-canvas").element
    this.canvas = this._ctl.getContext("2d")

    this.setOptions(options)
  }

  public clear(){
    this._ctl.width = this._ctl.offsetWidth
    this._ctl.height = this._ctl.offsetHeight
    this.canvas.clearRect(0, 0, this._ctl.offsetWidth, this._ctl.offsetHeight)
  }
}
