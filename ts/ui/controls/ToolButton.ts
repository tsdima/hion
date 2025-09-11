import { UIControl, UIControlOptions } from './UIControl'
import { Builder } from '../Builder'
import { MenuItemsList, PopupMenu } from '../menu/PopupMenu'

export interface ToolButtonOptions extends UIControlOptions {
  title?: string
  icon?: number
  items?: MenuItemsList
  tag?: string
  url?: string
  click?: (btn: ToolButton) => void
}

export class ToolButton extends UIControl {
  private submenu: PopupMenu

  public tag?: string

  public constructor(options?: ToolButtonOptions) {
    super()

    const b = new Builder().div("button")
    const _icon = b.div("icon")
    this._ctl = b.element
    this.submenu = null

    if (options?.items) {
      this.setSubMenu(options.items)
    }

    this.enabled = true

    if (options?.click) {
      this.addListener("click", () => {
        if (this.enabled) {
          options.click(this)
        }
      })
    }

    if (options) {
      if (options.title) {
        b.attr("title", options.title)
      }
      if (options.icon) {
        _icon.style("backgroundPosition", "-" + (options.icon % 16)*16 + "px -" + (options.icon >> 4)*16 + "px")
      }
      if (options.tag) {
        this.tag = options.tag
      }
      if (options.url) {
        _icon.style("backgroundImage", "url('" + options.url + "')")
      }
    }

    this.setOptions(options)
  }

  public haveSubMenu() {
    return !!this.submenu
  }

  public setSubMenu(items: MenuItemsList) {
    const popup = new PopupMenu(items)
    popup.group = true
    if (!this.submenu) {
      const ctl = new Builder(this._ctl).div("submenu")
      ctl.on("onclick", (e: Event) => {
        e.stopPropagation()
        if (this.enabled) {
          this.submenu.up(ctl.offsetLeft - 24, ctl.offsetHeight + 3)
        }

        return false
      })
    }
    this.submenu = popup
  }

  public set enabled(value: boolean) {
    this._ctl.setAttribute("enabled", value ? 'true' : 'false')
  }

  public get enabled(): boolean {
    return this._ctl.getAttribute("enabled") == 'true'
  }

  public set checked(value: boolean) {
    this._ctl.setAttribute("checked", value ? 'true' : 'false')
  }

  public get checked(): boolean {
    return this._ctl.getAttribute("checked") == 'true'
  }
}
