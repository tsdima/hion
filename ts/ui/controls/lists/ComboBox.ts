import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

type Item = string

export class ComboBox extends UIControl<HTMLSelectElement> {
  private combo: Builder<HTMLSelectElement>
  public onselect: (element: HTMLOptionElement, item: Item) => void

  private items: Item[]
  private selected: HTMLOptionElement

  public constructor(options?: UIControlOptions) {
    super()

    this.combo = new Builder().n("select").class("ui-combobox")
    this._ctl = this.combo.element

    this.selected = null
    this.items = []
    this.onselect = () => {
    }

    this.combo.on("onchange", () => {
      this.select(this._ctl.options[this._ctl.selectedIndex])
    })

    this.setOptions(options)
  }

  private _makeItem() {
    return this.combo.n("option").attr("parent", this)
  }

  public select(item: HTMLOptionElement) {
    if (this.selected) {
      this.selected.setAttribute("selected", 'false')
    }
    this.selected = item
    item.setAttribute("selected", 'true')
    this.onselect(item, this.items[item.index])
  }

  public selectIndex(index: number) {
    this._ctl.selectedIndex = index
    this.onselect(this._ctl.options[index], this.items[index])
  }

  public selectString(string: string) {
    for (let i = 0; i < this.size(); i++) {
      if (this.items[i] == string) {
        this.selectIndex(i)
        break
      }
    }
  }

  public add(text: string) {
    this.items.push(text)

    return this._makeItem().html(text).element
  }

  public addIcon(icon: string, text: string) {
    this.items.push(text)

    const div = this._makeItem()

    div.n("img").attr("src", icon).class("icon")
    div.n("span").html(text)

    return div.element
  }

  public clear() {
    this.combo.html("")
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

  public text() {
    return this.items.join()
  }

  public size() {
    return this.items.length
  }

  public getSelectIndex() {
    return this.combo.element.selectedIndex
  }

  public getSelectString() {
    return this.items[this.getSelectIndex()]
  }
}
