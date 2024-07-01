import { UIContainer } from './UIContainer'
import { Builder } from '../Builder'
import { UIControlOptions } from './UIControl'

interface SpoilerOptions extends UIControlOptions {
  caption: string
}

export class Spoiler extends UIContainer {
  private readonly spoiler: Builder
  private readonly _body: Builder
  private readonly _caption: Builder

  public onchange: () => void

  public constructor(options: SpoilerOptions) {
    super()

    this.onchange = () => {}

    this.spoiler = new Builder().div("ui-spoiler")
    this._ctl = this.spoiler.element

    this._caption = this.spoiler.div("caption").html(options.caption).on("onclick", () => {
      this.opened = !this.opened
    })

    this._body = this.spoiler.div("content").div("body")
  }

  getContainer(): HTMLElement {
    return this._body.element
  }

  public body() {
    return this._body
  }

  public set caption(value: string) {
    this._caption.html(value)
  }

  public set opened(value: boolean) {
    if (value) {
      this.getControl().setAttribute("opened", 'true')
      this._body.parent().height(this._body.offsetHeight)
    } else {
      this.getControl().removeAttribute("opened")
      this._body.parent().height(0)
    }
    this.onchange()
  }

  public get opened(): boolean {
    return !!this.getControl().getAttribute("opened")
  }
}
