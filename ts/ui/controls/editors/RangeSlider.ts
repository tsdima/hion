import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

const __rangeSlider = {
  mode: 0,
  startX: 0,
  startValue: 0,
  ctl: null as RangeSlider,
  move: function(event: MouseEvent) {
    const newValue = __rangeSlider.ctl._ctlToReal(__rangeSlider.startValue + event.clientX - __rangeSlider.startX)
    if(__rangeSlider.mode == 0) {
      __rangeSlider.ctl.value1 = newValue
    } else {
      __rangeSlider.ctl.value2 = newValue
    }
  },
  up: () => {
    document.removeEventListener("mousemove", __rangeSlider.move)
    document.removeEventListener("mouseup", __rangeSlider.up)
  }
}

interface RangeSliderOptions extends UIControlOptions {
  min?: number
  max?: number
  step?: number
  value1?: number
  value2?: number
}

export class RangeSlider extends UIControl<HTMLDivElement> {
  private onchange: (value: { value1: number, value2: number }) => void

  private _value1: number
  private _value2: number

  private readonly step: number
  private readonly min: number
  private readonly max: number

  private readonly initValue1: number
  private readonly initValue2: number

  public constructor(options: RangeSliderOptions) {
    super()

    const body = new Builder().div("ui-range-slider")
      .on("onmousedown", (event: MouseEvent) => {
        if (body.element.hasAttribute("disabled"))
          return true;
        const lx = this._ctlToReal(event.layerX)
        let d1: number|boolean = Math.abs(lx - this._value1)
        let d2: number|boolean = Math.abs(lx - this._value2)
        if (this._value1 >= this._value2) {
          d2 = lx < this._value1
          d1 = lx > this._value2
        }
        if (d1 < d2) {
          this.value1 = lx
        } else {
          this.value2 = lx
        }
        __rangeSlider.startValue = event.layerX
        __rangeSlider.startX = event.clientX
        __rangeSlider.ctl = this
        __rangeSlider.mode = d1 < d2 ? 0 : 1;
        document.addEventListener("mousemove", __rangeSlider.move)
        document.addEventListener("mouseup", __rangeSlider.up)
        event.preventDefault()
        return false
      })

    const bg = body.div("control").div("bg")
    /*this.from = */bg.div("from")
    /*this.to = */bg.div("to")
    this._ctl = body.element

    this.onchange = () => {}

    this._value1 = this._value2 = this.min = this.max = 0
    this.step = 1

    if (options) {
      this.initValue1 = options.value1 || 0
      this.initValue2 = options.value2 || 0

      this.min = options.min || 0
      this.max = options.max || 0
      this.step = options.step || 1
    }

    this.setOptions(options)
  }

  public changeContainer() {
    super.changeContainer()

    this._setValue1(this.initValue1, false)
    this._setValue2(this.initValue2, false)
  }

  public addListener(name: string, func: any) {
    if(name === "input") {
      this.onchange = func
    } else {
      super.addListener(name, func)
    }
  }

  private _setValue1(value: number, flag: boolean) {
    const n = Math.round(Math.max(this.min, Math.min(value, this._value2))/this.step)*this.step
    if (n != this._value1) {
      this._value1 = n

      const v1 = this._realToCtl(this._value1)
      const v2 = this._realToCtl(this._value2)
      const ctl = this._ctl.firstChild.firstChild as HTMLElement
      ctl.style.marginLeft = v1.toString() + "px"
      ctl.style.width = (v2 - v1).toString() + "px"
      if(flag) this._change()
    }
  }

  private _setValue2(value: number, flag: boolean) {
    const n = Math.round(Math.min(Math.max(value, this._value1), this.max)/this.step)*this.step
    if (n != this._value2) {
      this._value2 = n

      const v1 = this._realToCtl(this._value1)
      const v2 = this._realToCtl(this._value2)
      const ctl = this._ctl.firstChild.firstChild as HTMLElement
      ctl.style.width = (v2 - v1).toString() + "px"
      if(flag) this._change()
    }
  }

  private _change() {
    this.onchange({
      value1: this.value1,
      value2: this.value2
    })
  }

  private _realToCtl(value: number) {
    const len = this.max - this.min
    return len ? Math.round((value - this.min)/len*(this._ctl.offsetWidth-2)) : 0
  }

  public _ctlToReal(value: number) {
    return Math.round(this.min + (this.max - this.min)*value/(this._ctl.offsetWidth-2))
  }

  public set value1(value: number) {
    this._setValue1(value, true)
  }

  public get value1(): number {
    return this._value1
  }

  public set value2(value: number) {
    this._setValue2(value, true)
  }

  public get value2(): number {
    return this._value2
  }
}
