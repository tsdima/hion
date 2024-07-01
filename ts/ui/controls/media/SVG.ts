import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface SVGOptions extends UIControlOptions {
  shape?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
}

export class SVG extends UIControl<HTMLDivElement> {
  private readonly svg: SVGSVGElement

  public constructor(options: SVGOptions) {
    super()

    const d = new Builder().div("ui-figure")
    this._ctl = d.element
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    d.append(this.svg)
    this.svg.setAttribute("width", "100%")
    this.svg.setAttribute("height", "100%")
    // this.svg.setAttribute("viewBox", "0 0 100 100");

    switch (options.shape) {
      case 0:
        this.svg.innerHTML = '<ellipse cx="50%" cy="50%" rx="50%" ry="50%" stroke="' + options.stroke + '" stroke-width="' + options.strokeWidth + '" fill="' + options.fill + '"/>'
        break
      case 1:
        this.svg.innerHTML = '<rect x="0" y="0" width="99.9%" height="99.9%" stroke="' + options.stroke + '" stroke-width="' + options.strokeWidth + '" fill="' + options.fill + '"/>'
        break
      case 2:
        this.svg.innerHTML = '<line x1="0" y1="50%" x2="100%" y2="50%" stroke="' + options.stroke + '" stroke-width="' + options.strokeWidth + '" fill="' + options.fill + '"/>'
        break
    }

    this.setOptions(options);
  }

  public fill(value: string) {
    (this.svg.childNodes[0] as HTMLElement).style.fill = value
  }

  public stroke(value: string) {
    (this.svg.childNodes[0] as HTMLElement).style.stroke = value
  }
}
