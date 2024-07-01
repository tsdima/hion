import { Layout } from './layouts/Layout'

export interface ElementLayoutOptions {
  grow?: number;
  shrink?: number;
  alignSelf?: number;
  margin?: number;
}

export interface UIControlOptions {
  theme?: string
  width?: number
  height?: number
}

export class UIControl<T extends HTMLElementTagNameMap[keyof HTMLElementTagNameMap] = HTMLElement> {
  public parent: any = null
  public _ctl: T = null
  public _layoutOpt: ElementLayoutOptions = null
  public layout: Layout

  public appendTo(parent: HTMLElement) {
    parent.appendChild(this.getControl())
    return this
  }

  public getControl() {
    return this._ctl
  }

  public insertBefore(child: HTMLElement) {
    child.parentNode.insertBefore(this.getControl(), child)
    return this
  }

  public show() {
    this.visible = true
    return this
  }

  public hide() {
    this.visible = false
    return this
  }

  public free() {
    if (this.parent) {
      this.parent.remove(this)
    }
  }

  public addListener(name: string, func: any) {
    this.getControl().addEventListener(name, func)
  }

  public initFromHTML(element: T) {
    this._ctl = element
  }

  public move(x: number, y: number) {
    const element = this.getControl()
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  }

  public setLayoutOptions(options: ElementLayoutOptions) {
    this._layoutOpt = options
  }

  public place(left: number, top: number, width: number, height: number) {
    const style = this.getControl().style
    style.left = left.toString() + "px"
    style.top = top.toString() + "px"
    if (width) {
      style.width = width.toString() + "px"
    }
    if (height) {
      style.height = height.toString() + "px"
    }
  }

  public setVisible(value: boolean) {
    this.visible = value
  }

  public setOptions(options: UIControlOptions) {
    if (options) {
      if (options.theme) {
        this.getControl().className += " " + options.theme
      }
      if (options.width) {
        this.width = options.width
      }
      if (options.height) {
        this.height = options.height
      }
    }
  }

  public setDisabled(value: boolean) {
    function __disabled(ctl: HTMLElement) {
      if (ctl.setAttribute) {
        if (value) {
          ctl.setAttribute("disabled", "")
        } else {
          ctl.removeAttribute("disabled")
        }
        for (let i = 0; i < ctl.childNodes.length; i++) {
          __disabled(ctl.childNodes[i] as HTMLElement)
        }
      }
    }
    __disabled(this.getControl() as HTMLElement)
  }

  public changeContainer() {
    // do nothing
  }

  get left(): number {
    return this.getControl().offsetLeft
  }
  set left(value: number) {
    this.getControl().style.left = value.toString() + "px"
  }

  get top(): number {
    return this.getControl().offsetTop;
  }
  set top(value: number) {
    this.getControl().style.top = value.toString() + "px"
  }

  get width(): number {
    return this.getControl().offsetWidth
  }
  set width(value: number) {
    const v = value.toString()
    this.getControl().style.width = v.indexOf("%") > 0 ? v : (value.toString() + "px")
  }

  get height(): number {
    return this.getControl().offsetHeight
  }
  set height(value: number) {
    const v = value.toString()
    this.getControl().style.height = v.indexOf("%") > 0 ? v : (value.toString() + "px")
  }

  get tabIndex(): number {
    return parseInt(this.getControl().getAttribute("tabindex"))
  }
  set tabIndex(value: number) {
    this.getControl().setAttribute("tabindex", value.toString())
  }

  get visible(): boolean {
    return this.getControl().getAttribute("visible") === "true"
  }
  set visible(value: boolean) {
    this.getControl().setAttribute("visible", value ? 'true' : 'false')
  }
}
