import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface YouTubeOptions extends UIControlOptions {
  url?: string
}

export class YouTube extends UIControl<HTMLIFrameElement> {
  public constructor(options: YouTubeOptions) {
    super()

    this._ctl = new Builder().n("iframe").class("ui-youtube").element
    this._ctl.setAttribute("frameborder", "0")
    this._ctl.setAttribute("allowfullscreen", "")

    if (options?.url) {
      this.load(options.url)
    }

    this.setOptions(options)
  }

  public load(id: string) {
    this._ctl.src = "https://www.youtube.com/embed/" + id
  }
}
