import { UIControl, UIControlOptions } from './UIControl'
import { Builder } from '../Builder'

interface UILoaderOptions extends UIControlOptions {
  size?: number
  radius?: number
}

export class UILoader extends UIControl {
  private svg: SVGSVGElement

  public constructor(options: UILoaderOptions) {
    super()

    const d = new Builder().div("ui-loader")
    this._ctl = d.element
    d.element.appendChild(this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"))
    const lSize = options.size || 120
    this.svg.setAttribute("width", lSize.toString())
    this.svg.setAttribute("height", lSize.toString())

    const radius = options.radius || 10
    const center = lSize/2
    const offset = center - radius
    let text = ""
    for (let i = 0; i < 12; i++) {
      const x = center + Math.sin(i*30/180*Math.PI)*offset
      const y = center + Math.cos(i*30/180*Math.PI)*offset
      text += '<circle class="g--circle" r="' + radius + '" cx="' + x + '" cy="' + y + '"></circle>'
    }

    this.svg.innerHTML = text
  }
}
