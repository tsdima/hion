import { UIControlOptions } from './UIControl'
import { Builder } from '../Builder'
import { ListControl, ListControlElement } from './ListControl'

interface UISimpleTableColumn {
  title: string
  width?: string
  align?: string
  type?: 'image'|'checkbox'
}

interface UISimpleTableRow extends ListControlElement {
  data: any[]
}

interface UISimpleTableRowDataV {
  v?: any
}

type UISimpleTableRowData = UISimpleTableRowDataV | any

interface UISimpleTableOptions extends UIControlOptions {
  columns?: UISimpleTableColumn[]
  lineHeight?: number
  showGrid?: boolean
  headers?: boolean
}

export class UISimpleTable extends ListControl<UISimpleTableRow> {
  private readonly table: Builder<HTMLTableElement>
  private readonly body: Builder

  public onrowclick: (row: UISimpleTableRow, index: number) => void
  public onrowselect: (row: UISimpleTableRow, index: number) => void

  public constructor(private options?: UISimpleTableOptions) {
    super()

    this.table = new Builder().div("ui-simple-table").n("div").n("div").n("table")
    this._ctl = this.table.element.parentNode.parentNode.parentNode as HTMLElement

    this.onrowclick = () => {}
    this.onrowselect = () => {}

    if (options?.columns) {
      const head = this.table.n("thead").n("tr")
      for (const col of options.columns) {
        head.n("th").style("width", col.width).html(col.title)
      }
    }

    if (options?.headers === false) {
      this._ctl.setAttribute("headers", 'false')
    }

    this.body = this.table.n("tbody")

    this.attachKeyHandler()

    this.setOptions(options)
  }

  addListener(name: string, func: any) {
    if(name === "rowselect") {
      this.onrowselect = func
    } else if(name === "rowclick") {
      this.onrowclick = func
    } else {
      super.addListener(name, func)
    }
  }

  public clear() {
    this.body.html("")
    this.selected = null
  }

  private _select(row: UISimpleTableRow) {
    if (this.selected) {
      this.selected.setAttribute("selected", 'false')
    }
    this.selected = row
    row.setAttribute("selected", 'true')
    this.onrowselect(row, row.index)
  }

  public click(obj: UISimpleTableRow) {
    this.onrowclick(obj, obj.index)
  }

  public addRow(row: UISimpleTableRowData[]) {
    const r = this.body.n("tr").attr("data", row).attr("index", this.size()-1)

    r.on("onclick", () => this._select(r.element as undefined as UISimpleTableRow))
    r.on("ondblclick", () => this.click(r.element as undefined as UISimpleTableRow))

    if (this.options?.lineHeight) {
      r.style("lineHeight", this.options?.lineHeight.toString() + "px");
    }

    let index = 0
    for (const item of row) {
      const col = this.options?.columns[index]

      if (!col) break

      const td = r.n("td")
      if (col.type == "image") {
        td.n("img").attr("src", item.v || item)
      } else if(col.type == "checkbox") {
        td.n("input").attr("type", "checkbox").attr("index", index).on("onchange", function(){
          this.parentNode.parentNode.data[this.index] = this.checked ? 1 : 0
        }).value(item.v || item)
      } else {
        td.n("div").html(item.v || item)
      }

      if (!this.options?.showGrid) {
        td.style("border", 0)
      }
      if (this.body.element.childNodes.length === 1) {
        const w = col.width || "100%"
        td.style(w.indexOf("%") > 0 ? "width" : "min-width", w)
      }
      if (col.align) {
        td.style("textAlign", col.align)
      }

      index++
    }
  }

  public selectIndex(index: number) {
    this._select(this.body.child(index) as UISimpleTableRow)
  }

  public size() {
    return this.body.childs()
  }

  public getSelectionRow() {
    return this.selected
  }

  public removeSelection() {
    if (this.selected) {
      this.body.element.removeChild(this.selected)
      for (let i = this.selected.index; i < this.size(); i++) {
        (this.body.child(i) as UISimpleTableRow).index--
      }
      this.selected = null
    }
  }
}
