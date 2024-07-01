import { UIContainer } from '../UIContainer'
import { Builder } from '../../Builder'
import { Label } from '../Label'
import { Layout } from '../layouts/Layout'
import { UIControlOptions } from '../UIControl'
import { UIImage } from '../UIImage'

interface ButtonOptions extends UIControlOptions {
  caption?: string
  /** image URL */
  url?: string
}

export class Button extends UIContainer {
  private readonly _caption: Label
  private readonly _image: UIImage

  public constructor(options: ButtonOptions) {
    super()

    this._ctl = new Builder().n("button").class("ui-button").element
    this._caption = new Label()
    this.layout = new Layout(this)

    if (options) {
      if (options.caption) {
        this.caption = options.caption
      }
      if (options.url) {
        this._image = new UIImage({url: options.url})
        this.add(this._image)
      }
    }
    this.add(this._caption)

    this.setOptions(options)
  }

  public set caption(value: string) {
    this._caption.caption = value
  }

  public get caption(): string {
    return this._caption.caption
  }
}