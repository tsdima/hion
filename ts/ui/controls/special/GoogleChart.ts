import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'
import { $ } from '../../Helpers'

interface GoogleChartOptions extends UIControlOptions {
  chart?: string
}

declare global {
  interface Window {
    google: any
  }
}

export class GoogleChart extends UIControl<HTMLDivElement> {
  public oninit: () => void
  private chart: any

  public constructor(private options: GoogleChartOptions) {
    super()

    this._ctl = new Builder().div("ui-chart").element
    this.oninit = () => {}

    this.setOptions(options)
  }

  public init() {
    if (window.google) {
      this.oninit()
    } else {
      $.appendScript("https://www.google.com/jsapi", () => this._onload())
    }
  }

  public draw(data: any) {
    if (!this.chart) {
      this.chart = new window.google.visualization[this.options.chart](this._ctl)
    }
    this.chart.draw(data, this.options)
  }

  private _onload() {
    window.google.load("visualization", "1", {
      packages:["corechart", "gauge"],
      callback : () => this.oninit()
    })
  }
}
