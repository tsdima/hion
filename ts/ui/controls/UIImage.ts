import { UIControl, UIControlOptions } from './UIControl'
import { Builder } from '../Builder'

interface UIImageOptions extends UIControlOptions {
  mode?: number
  url?: string
}

export class UIImage extends UIControl<HTMLImageElement|HTMLDivElement> {
  private image: HTMLImageElement

  public constructor (options?: UIImageOptions) {
    super()

    let img: Builder<HTMLImageElement>
    if (options?.mode) {
      img = new Builder().div("ui-image").n("img")
      this._ctl = img.element.parentNode as HTMLDivElement
    } else {
      img = new Builder().n("img").class("ui-image")
      this._ctl = img.element
    }
    img.on("ondragstart", () => false)
    this.image = img.element

    if (options) {
      if (options.url) {
        this.url = options.url
      }
      if (options.mode) {
        if (options.mode == 2) {
          img.style("width", "100%")
        } else if(options.mode == 3) {
          img.style("height", "100%")
        }
      }
    }

    this.setOptions(options)
  }

  public set url (value: string) {
    this.image.src = value
  }

  public get url (): string {
    return this.image.src
  }
}
