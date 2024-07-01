import { UIControl, UIControlOptions } from '../../controls/UIControl'
import { Builder } from '../../Builder'

export class StatePanel extends UIControl {
  private list: Builder

  constructor (options: UIControlOptions) {
    super()

    this.list = new Builder().div("state")
    this._ctl = this.list.element

    this.setOptions(options);
  }

  public set(text: string) {
    this.list.html(text);
  }

  public add(text: string, color?: string) {
    const line = this.list.n("div").html(text)
    if (color) {
      line.style("color", color)
    }
  }

  public clear() {
    this.list.html('')
  }
}