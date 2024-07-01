import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface UISwitcherOptions extends UIControlOptions {
  on?: boolean
}

export class UISwitcher extends UIControl<HTMLDivElement> {
  private onchange: (value: boolean) => void

  public constructor(options: UISwitcherOptions) {
    super()

    this.onchange = () => {}

    this._ctl = new Builder().div("ui-switcher").on("onclick", () => {
      if (this._ctl.hasAttribute("disabled")) {
        return
      }

      this.on = !this.on;
    }).on("onkeypress", (event: KeyboardEvent) => {
      if (this._ctl.hasAttribute("disabled")) {
        return
      }

      if (event.keyCode === 32) {
        this.on = !this.on
      }
    }).div("in").element.parentNode as HTMLDivElement

    if (options) {
      if (options.on) {
        this.on = true
      }
    }

    this.setOptions(options);
  }

  public addListener(name: string, func: any) {
    if (name === "onchange") {
      this.onchange = func
    } else {
      super.addListener(name, func)
    }
  }

  public set on(value: boolean) {
    value ? this._ctl.setAttribute("on", "true") : this._ctl.removeAttribute("on")
    this.onchange(value)
  }

  public get on(): boolean {
    return this._ctl.hasAttribute("on")
  }
}
