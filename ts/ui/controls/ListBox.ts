import { UIControlOptions } from './UIControl'
import { Builder } from '../Builder'
import { ListControl, ListControlElement } from './ListControl'

interface ListBoxOptions extends UIControlOptions {
  checkboxes?: boolean
}

export interface ListBoxItem extends ListControlElement {

}

export type ListBoxEvent<T> = (item: T, text: string) => void

export class ListBox<T extends ListBoxItem = ListBoxItem> extends ListControl<T> {
  public onclick: ListBoxEvent<T> = () => {}
  public onselect: ListBoxEvent<T> = () => {}
  public oncheck: ListBoxEvent<T> = () => {}

  private control: HTMLElement

  public items: string[] = []

  private readonly checkboxes: boolean = false

  public constructor(options?: ListBoxOptions) {
    super()

    const l = new Builder().div("ui-listbox").div("content")
    l.div("items")
    this.control = l.element

    if (options) {
      if (options.checkboxes) {
        this.checkboxes = true
      }
    }

    this.setOptions(options)

    this.attachKeyHandler()
  }

  public setDisabled (value: boolean) {
    super.setDisabled(value)

    if (value) {
      this.getControl().removeAttribute("tabindex")
    } else {
      this.tabIndex = 0
    }
  }

  getControl(): HTMLElement {
    return this.control.parentNode as HTMLElement
  }

  private _makeItem() {
    const ctl = new Builder(this.control.childNodes[0] as HTMLElement)
      .n("div")
      .class("item")
      .attr("index", this.items.length - 1)

    const _box_ = this

    ctl.on("onclick", function() {
      if (!this.hasAttribute("disabled")) {
        _box_.select(this)
      }
    })
    ctl.on("ondblclick", function() {
      if (!this.hasAttribute("disabled")) {
        _box_.click(this)
      }
    })

    if (this.checkboxes) {
      ctl.n("input").attr("type", "checkbox").class("check").on("onclick", function(){
        _box_.check(this.parentNode)
      })
    }

    return ctl
  }

  public select(item: T) {
    if (this.selected) {
      this.selected.setAttribute("selected", 'false')
    }
    this.selected = item
    item.setAttribute("selected", 'true')
    this.onselect(item, this.items[item.index])
  }

  public click(item: T) {
    this.onclick(item, this.items[item.index])
  }

  public check(item: T) {
    this.oncheck(item, this.items[item.index])
  }

  public selectIndex(index: number) {
    this.select(this.control.childNodes[0].childNodes[index] as T)
  }

  public selectString(text: string) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] == text) {
        this.selectIndex(i)
        break
      }
    }
  }

  public add(text: string) {
    this.items.push(text)

    return this._makeItem().n("span").html(text).element
  }

  public addIcon(icon: string, text: string): T {
    this.items.push(text)

    const div = this._makeItem()

    div.n("img").attr("src", icon).class("icon")
    div.n("span").html(text)

    return div.element as unknown as T
  }

  public checked(item: T, value: boolean) {
    (item.childNodes[0] as HTMLInputElement).checked = value
  }

  public clear() {
    (this.control.childNodes[0] as HTMLElement).innerHTML = ""
    this.items = []
    this.selected = null
  }

  public setText(text: string) {
    this.clear()
    if (text) {
      const arr = text.split("\n")
      for (const line in arr) {
        this.add(arr[line])
      }
    }
  }

  public getSelectString() {
    const index = this.getSelectIndex()
    return index === -1 ? "" : this.items[index]
  }

  public getSelectIndex() {
    return this.selected ? this.selected.index : -1
  }

  public text() {
    return this.items.join("\n")
  }

  public size() {
    return this.items.length
  }

  public replaceSelect(text: string) {
    const index = this.getSelectIndex()
    if (index != -1) {
      this.items[index] = text;
      (this.selected.childNodes[0] as HTMLElement).innerHTML = text
    }
  }
}
