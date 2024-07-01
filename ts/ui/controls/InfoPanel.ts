import { Builder } from '../Builder'

export class InfoPanel {
  private panel: Builder
  private timer: NodeJS.Timeout

  private _show(className: 'error'|'info', text: string) {

    this.panel = new Builder().div("infopanel").on("onclick", () => {
      this._hide(this.panel.element.parentNode as HTMLElement)
      clearInterval(this.timer)
    }).div(className).html(text)

    const e = this.panel.element.parentNode as HTMLElement
    document.body.appendChild(e);
    e.style.top = "0"

    this.timer = setTimeout(() => this._hide(e), 5000)
  }

  private _hide(obj: HTMLElement) {
    obj.style.top = "-60px"
    this.panel = null
    setTimeout(() => document.body.removeChild(obj), 1000)
  }

  public error(text: string) {
    this._show("error", text)
  }

  public info(text: string) {
    this._show("info", text)
  }
}
