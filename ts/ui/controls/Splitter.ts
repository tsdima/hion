import { UIControl, UIControlOptions } from './UIControl'
import { Builder } from '../Builder'

const __splitter = {
  dragObj: {x: 0, y: 0, w: 0, h: 0, ctl: null as Splitter},
  managed: null as UIControl,
  mode: 1,
  moveX: function(event: MouseEvent) {
    const deltaX = __splitter.dragObj.x - event.clientX
    __splitter.managed.width = __splitter.dragObj.w - __splitter.mode*deltaX
  },
  moveY: function(event: MouseEvent) {
    const deltaY = __splitter.dragObj.y - event.clientY
    __splitter.managed.height = __splitter.dragObj.h - __splitter.mode*deltaY
  },
  up: function() {
    document.removeEventListener("mousemove", __splitter.moveX)
    document.removeEventListener("mousemove", __splitter.moveY)
    document.removeEventListener("mouseup", __splitter.up)
    __splitter.managed.parent.getControl().style.cursor = "default"
    __splitter.dragObj.ctl.onresize()
  }
}

interface SplitterOptions extends UIControlOptions {
  edge: number
  size?: number
  manage?: UIControl
}

export class Splitter extends UIControl {
  public onresize: () => void
  private manage: UIControl

  private edge: number

  public constructor(options: SplitterOptions) {
    super()

    this.manage = null

    this.onresize = () =>{}

    this._ctl = new Builder().div("ui-splitter " + (options.theme || "")).on("onmousedown", (event: MouseEvent) => {
      __splitter.managed = this.manage
      __splitter.dragObj = {x: event.clientX, y: event.clientY, w: __splitter.managed.width, h: __splitter.managed.height, ctl: this}
      document.addEventListener("mousemove", options.edge % 2 === 1 ? __splitter.moveX : __splitter.moveY)
      document.addEventListener("mouseup", __splitter.up)
      __splitter.managed.parent.getControl().style.cursor = options.edge % 2 === 1 ? "col-resize" : "row-resize"
      __splitter.mode = options.edge > 2 ? 1 : -1
    }).element

    if (options.edge % 2 === 0) {
      this._ctl.setAttribute("vertical", 'true')
    }

    if (options?.size) {
      if (options.edge % 2 === 1) {
        this.width = options.size
      } else {
        this.height = options.size
      }
    }

    this.edge = options.edge
    if (options.manage) {
      this.setManage(options.manage)
    }
  }

  public setManage(control: UIControl) {
    this.manage = control
    this.free()
    let c = control
    if (this.edge > 2) {
      const index = control.parent.indexOf(control)
      c = index + 1 < control.parent.size() ? control.parent.get(index + 1) : null
    }
    if(c) {
      control.parent.insert(this, c)
    } else {
      control.parent.add(this)
    }
  }
}
