import { UIControl, UIControlOptions } from './UIControl'
import { Builder } from '../Builder'

interface TabOptions extends UIControlOptions {
  caption: string
  title?: string
}

export class Tab extends UIControl {
  private readonly _icon: Builder
  private readonly _title: Builder

  public control: HTMLElement = null

  public constructor(options: TabOptions) {
    super()

    const tab = new Builder().div("tab").attr("parent", this)
    if (options.title) {
      tab.attr("title", options.title)
    }

    tab.on("onmousedown", () => {
      this.parent.select(this)
    })
    this._icon = tab.div("icon")
    this._title = tab.div("title").html(options.caption)
    tab.div("close").attr("title", "Close tab").html("&#10006;").on("onclick", () => {
      this.parent.close(this)
    })
    this._ctl = tab.element
  }

  public save(value: boolean) {
    this._ctl.setAttribute("save", `${value}`)
  }

  public load(value: boolean) {
    this._ctl.setAttribute("save", `${value}`)
  }

  public set caption(value: string) {
    this._title.html(value)
  }

  public get caption(): string {
    return this._title.element.innerHTML
  }

  public set title(value: string) {
    this._ctl.setAttribute("title", value)
  }

  public get title(): string {
    return this._ctl.getAttribute("title")
  }

  public set icon(value: string) {
    this._icon.style("background-image", "url('" + value + "')")
  }

  public get icon(): string {
    return this._icon.element.style.backgroundImage
  }

  public set active(value: boolean) {
    this._ctl.setAttribute("active", value ? 'true' : 'false')
  }

  public get active(): boolean {
    return this._ctl.getAttribute("active") == 'true'
  }
}
