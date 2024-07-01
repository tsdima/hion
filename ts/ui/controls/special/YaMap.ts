import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'
import { $ } from '../../Helpers'

declare global {
  interface Window {
    ymaps: any
  }
}

export class YaMap extends UIControl<HTMLDivElement> {
  private oncoords: (pos: any) => void

  private map

  public constructor(options: UIControlOptions) {
    super()

    this._ctl = new Builder().div("ui-yamap").id("mp-" + Math.random()).element

    this.setOptions(options)
  }

  public addListener(name: string, func: any) {
    if(name === "coords") {
      this.oncoords = func
    } else {
      super.addListener(name, func)
    }
  }

  public setPlacemark(x: number, y: number, title: string, info: string) {
    if (this.map) {
      const myPlacemark = new window.ymaps.Placemark([x, y], {
        hintContent: title,
        balloonContent: info
      })

      this.map.geoObjects.add(myPlacemark)
    }
  }

  public setCenter(x: number, y: number) {
    if (this.map) {
      this.map.setCenter([x, y])
    }
  }

  public init() {
    if (window.ymaps) {
      this._onload()
    } else {
      $.appendScript("https://api-maps.yandex.ru/2.1/?lang=ru_RU", () => this._onload())
    }
  }

  private _onload(){
    window.ymaps.ready(() => {
      this.map = new window.ymaps.Map(this._ctl.id, {
        center: [55.76, 37.64],
        zoom: 7
      })
      this.map.events.add('click', (e: any) => {
        if (this.oncoords) {
          this.oncoords(e.get('coords'))
        }
      })
    })
  }
}
