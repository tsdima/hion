import { UIContainer } from './UIContainer'
import { UIControl, UIControlOptions } from './UIControl'
import { Builder } from '../Builder'
import { HLayout } from './layouts/HLayout'
import { Tab } from './Tab'

interface TabControlOptions extends UIControlOptions {

}

export class TabControl extends UIContainer {
  private _tabController: Builder
  private control: HTMLElement

  public onselect: (tab?: Tab) => void
  public onclose: (tab: Tab) => boolean

  public constructor(options: TabControlOptions) {
    super()

    this._tabController = new Builder().n("div").on("onmousewheel", (event: WheelEvent) => {
      this.scroll(-event.deltaY/2)
    }).class("tabs").div("body")
    this._ctl = this._tabController.element.parentNode as HTMLElement

    this.onselect = () => {}
    this.onclose = () => true

    this.control = this._tabController.element

    this.setOptions(options)

    this.layout = new HLayout(this, {})
  }

  getContainer(): HTMLElement {
    return  this._tabController.element
  }

  public scroll(delta: number) {
    if (delta > 0 && this.getContainer().offsetLeft + delta > 0) {
      delta = -this.getContainer().offsetLeft
    } else if(delta < 0 && this.getContainer().offsetLeft + delta + this.getContainer().offsetWidth < this._ctl.offsetWidth-2) {
      delta = this._ctl.offsetWidth - 2 - (this.getContainer().offsetLeft + this.getContainer().offsetWidth)
    }

    if (this.getContainer().offsetWidth < this._ctl.offsetWidth-2) {
      if (this.getContainer().offsetLeft) {
        this.getContainer().style.left = "0px"
      }
    } else {
      this.getContainer().style.left = (this.getContainer().offsetLeft + delta).toString() + "px"
    }
  }

  public select(tab: Tab) {
    this.each((item: Tab) => {
      item.active = false
      if (item.control) {
        item.control.setAttribute("visible", 'false')
      }
      return false
    })

    tab.active = true

    if (tab.control) {
      tab.control.removeAttribute('visible')
    }

    this.onselect(tab)
  }

  public close(tab: Tab) {
    if (this.onclose(tab)) {
      const index = this.indexOf(tab)
      tab.free()
      if (index > 0) {
        this.select(this.get(index-1) as Tab)
      } else if(this.size()) {
        this.select(this.get(0) as Tab)
      } else {
        this.onselect(null)
      }

      const d = this._ctl.offsetWidth-2 - (this.getContainer().offsetLeft + this.getContainer().offsetWidth)
      if (d > 0) {
        this.scroll(d)
      }
    }
  }

  public addTab(name: string, title: string, control?: HTMLElement) {
    const tab = new Tab({caption: name, title})

    this.add(tab)
    this.select(tab)

    if (control) {
      control.removeAttribute('visible')
      this.control.parentNode.appendChild(control)
      tab.control = control
    }
    this.scroll(-4096)

    return tab
  }

  public getCurrentTab() {
    let active: Tab = null
    this.each((item: Tab) => {
      if (item.active) {
        active = item
        return true
      }
      return false
    })

    return active
  }
}
