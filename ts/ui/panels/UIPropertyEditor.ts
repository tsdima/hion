import { UIControl, UIControlOptions } from '../controls/UIControl'
import { Builder } from '../Builder'
import { Hion } from '../../core/element'

const colors = [
  "Red",
  "IndianRed",
  "LightCoral",
  "Salmon",
  "Crimson",
  "DarkRed",
  "Pink",
  "HotPink",
  "DeepPink",
  "MediumVioletRed",
  "Coral",
  "Tomato",
  "OrangeRed",
  "Orange",
  "Khaki",
  "DarkKhaki",
  "Gold",
  "Yellow",
  "Lavender",
  "Violet",
  "Magenta",
  "MediumPurple",
  "DarkViolet",
  "Purple",
  "Lime",
  "LimeGreen",
  "LightGreen",
  "SpringGreen",
  "SeaGreen",
  "Green",
  "Olive",
  "Cyan",
  "DarkCyan",
  "Aquamarine",
  "SteelBlue",
  "Blue",
  "Navy",
  "SkyBlue",
  "Cornsilk",
  "NavajoWhite",
  "BurlyWood",
  "RosyBrown",
  "Peru",
  "Brown",
  "Maroon",
  "SaddleBrown",
  "White",
  "Silver",
  "DarkGray",
  "Gray",
  "DimGray",
  "Black"
];

export interface PropertyEditorItem {
  name?: string;
  title: string;
  header: boolean;
  info: string;
  value?: any;
  type?: number;
  check?: boolean;
  checked?: boolean;
  defvalue?: any;
  default?: boolean;
  list?: Array<string>;
  group?: string;
}

interface PropertyRow extends HTMLElement {
  item: PropertyEditorItem;
}

export class UIPropertyEditor extends UIControl<HTMLTableElement> {
  oncheck: (item: PropertyEditorItem, checked: boolean) => void = () => {}
  onchange: (item: PropertyEditorItem, value: any) => void = () => {}
  onadveditor: (item: PropertyEditorItem) => void = () => {}
  onselect: (item: PropertyEditorItem) => void = () => {}

  translator: {translate:(text: string) => string}

  private groupState: { [name: string]: boolean } = {};
  private body: Builder<HTMLTableElement>;
  private selected: PropertyRow;

  constructor(options: UIControlOptions) {
    super();

    this.body = new Builder().n("table").class("ui-property-editor")
      .attr("parent", this)
      .on("onmousedown", function(event: MouseEvent) {
        this.__moved = true;
        this.parent._clickRow(this, event);
      })
      .on("onmousemove", function(event: MouseEvent) {
        if(this.__moved) {
          this.parent._clickRow(this, event);
          this.__moved = true;
        }
      })
      .on("onmouseup", function() {
        this.__moved = false;
      })

    this._ctl = this.body.element

    this.setOptions(options)
  }

  _clickRow(obj, event: MouseEvent) {
    if (obj.childNodes.length) {
      const index = Math.floor((event.clientY - obj.parentNode.parentNode.offsetTop + obj.parentNode.scrollTop) / obj.childNodes[0].offsetHeight)

      let cur = 0;
      for (let i = 0; i < obj.childNodes.length; i++) {
        if (!obj.childNodes[i].hasAttribute("visible")) {
          if (cur === index) {
            if (!this._selectRow(obj.childNodes[i])) {
              obj.__moved = false;
            }
            break;
          }
          cur++;
        }
      }
    }
  }

  _getDisplayValue(item: PropertyEditorItem) {
    let value = item.value.toString().replace(/\n/g, "\\n"); // .replace(/\"/g, "&quot;")
    switch(item.type) {
      case Hion.DATA_ENUM:
      case Hion.DATA_ENUMEX:
        value = item.list[value];
        break;
      case Hion.DATA_DATA:
        if(typeof item.value === "string" && item.value.length) {
          return "#" + value;
        }
        break;
      case Hion.DATA_FONT:
        return item.value.name + ", " + item.value.size;
      case Hion.DATA_ICON:
        return "[Icon]";
      case Hion.DATA_BITMAP:
        return "[Picture]";
      case Hion.DATA_JPEG:
        return "[Jpeg]";
      case Hion.DATA_STREAM:
        return "[Stream]";
      case Hion.DATA_ARRAY:
        return "[Array]";
    }
    return value;
  }

  _getEditValue(cell: Builder, item: PropertyEditorItem) {
    switch(item.type) {
      case Hion.DATA_COLOR:
        cell.html("");
        cell.div("color").style("backgroundColor", item.value);
        cell.n("div").html(item.value);
        break;
      default:
        cell.html(this._getDisplayValue(item).replace(/&/g, "&amp;").replace(/</g, "&lt;"));
    }
    this._updateChanged(cell, item);
  }

  _updateChanged(input: Builder, item: PropertyEditorItem) {
    const def = item.type == Hion.DATA_FONT ? item.defvalue.valueOf() == item.value.valueOf() : item.defvalue == item.value;
    if(!def) {
      input.htmlAttr("changed", "");
    } else {
      input.element.removeAttribute("changed");
    }
  }

  _clearSelection() {
    for (let i = 0; i < this.body.childs(); i++) {
      const c = this.body.child(i) as PropertyRow;
      if (c.hasAttribute("selected")) {
        c.removeAttribute("selected");
        if (c.item && !c.item.header) {
          this._getEditValue(new Builder(c.childNodes[1].childNodes[0].childNodes[0] as HTMLElement), c.item);
        }
        break;
      }
    }
  }

  _fillDataList(item: PropertyEditorItem, edit: Builder<HTMLInputElement>, combo: Builder) {
    combo.html("");
    let index = 0;
    const isEnum = item.type == Hion.DATA_ENUM || item.type == Hion.DATA_ENUMEX || item.type == Hion.DATA_MANAGER;
    const indexAsValue = item.type == Hion.DATA_ENUM || item.type == Hion.DATA_ENUMEX;
    const list = isEnum ? item.list : colors;
    for (let option of list) {
      let optionValue = indexAsValue ? index : option;
      let line = combo.n("div")
        .on("onmousedown", (event: MouseEvent) => {
          event.stopPropagation();

          this.onchange(item, optionValue);
          combo.hide();
          edit.attr("value", this._getDisplayValue(item))
        })

      if (isEnum) {
        line.html(option.replace("<", "&lt;"));
      } else {
        line.div("color").style("backgroundColor", option);
        line.n("div").html(option);
      }

      if (optionValue == item.defvalue) {
        line.htmlAttr("default", "");
      }
      if (optionValue == item.value) {
        line.htmlAttr("selected", "");
      }
      index++;
    }
  }

  haveTextEditor(prop: PropertyEditorItem) {
    return !(prop.type === Hion.DATA_ARRAY || prop.type === Hion.DATA_ICON || prop.type === Hion.DATA_BITMAP || prop.type === Hion.DATA_JPEG || prop.type === Hion.DATA_STREAM || prop.type === Hion.DATA_FONT);
  }

  _selectRow(row: PropertyRow) {
    if(row === this.selected) {
      return false;
    }
    this.selected = row;
    this._clearSelection();
    row.setAttribute("selected", "");

    this.onselect(row.item);

    if (!row.item || row.item.header) {
      return true;
    }

    const line = new Builder(row.childNodes[1].childNodes[0].childNodes[0] as HTMLElement).html("")

    const value = this._getDisplayValue(row.item);

    let edit: Builder<HTMLInputElement>

    // input box
    if (this.haveTextEditor(row.item)) {
      edit = line.inputbox("").value(value.toString())
      const pEditor = this
      edit.on("onkeyup", function() {
        if(row.item.type == Hion.DATA_ENUM || row.item.type == Hion.DATA_ENUMEX) {
          let index = 0;
          for (const item of row.item.list) {
            if (item.toLowerCase() === this.value.toLowerCase()) {
              pEditor.onchange(row.item, index);
              break;
            }
            index++;
          }
        } else {
          let value: any
          switch(row.item.type) {
            case Hion.DATA_INT:
              try {
                value = parseInt(this.value);
              }
              catch(err) {
                value = 0;
              }
              break;
            case Hion.DATA_REAL:
              try {
                value = parseFloat(this.value);
              }
              catch(err) {
                value = 0;
              }
              break;
            case Hion.DATA_STR:
            case Hion.DATA_LIST:
              value = this.value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
              break;
            case Hion.DATA_DATA:
              if(this.value.substring(0,1) == "#") {
                value = this.value.substring(1);
              }
              else {
                value = parseFloat(this.value);
                if(isNaN(value)) {
                  value = this.value;
                }
              }
              break;
            default:
              value = this.value;
          }
          pEditor.onchange(row.item, value);
        }
      });
      setTimeout(() => edit.element.focus(), 1);
    } else {
      line.div("advanced").html(this._getDisplayValue(row.item));
    }

    let combo: Builder<HTMLDivElement>

    // button
    if(row.item.type != Hion.DATA_INT && row.item.type != Hion.DATA_REAL) {
      let isDropList = row.item.type === Hion.DATA_ENUM || row.item.type === Hion.DATA_ENUMEX || row.item.type === Hion.DATA_COLOR || row.item.type === Hion.DATA_MANAGER;
      line.n("button").html("..").on("onclick", () => {
        if(isDropList) {
          this._fillDataList(row.item, edit, combo);
          combo.show();
        }
        else {
          this.onadveditor(row.item);
        }
      });

      if(isDropList) {
        combo = line.div("combo").on("onmousedown", (event: Event) => event.stopPropagation());
        combo.hide();
        edit.on("ondblclick", () => {
          switch(row.item.type) {
            case Hion.DATA_ENUM:
            case Hion.DATA_ENUMEX:
              let val: number
              if(row.item.value === row.item.list.length-1) {
                val = 0;
              }
              else {
                val = row.item.value + 1;
              }
              this.onchange(row.item, val);
              edit.attr("value", this._getDisplayValue(row.item));
              break;
          }
        });
      }
    }

    return true;
  }

  select(propertyName: string) {

  }

  clear() {
    this.body.html("")
    this.selected = null
  }

  edit(items: Array<PropertyEditorItem>) {
    this.clear()

    let group: { name: string, items: Builder[] } = null
    for (const item of items) {

      // make group row
      if (item.group) {
        if (group && group.name == item.group) {

        } else {
          group = {name: item.group, items: []}
          let g = this.body.n("tr").n("td").attr("colSpan", 2).div("out pe-title pe-group")
          let div = g.span("checkboxspoiler")
          let checkBox = div.checkbox("").checked(this.groupState[group.name] || false)
          let itemgroup = group;
          div.n("span").on("onclick", () => {
            let checked = !checkBox.checked()
            checkBox.checked(checked)
            for (let item of itemgroup.items) {
              checked ? item.show() : item.hide()
            }
            this.groupState[itemgroup.name] = checked
          })
          g.span("caption").html(this.translator.translate(group.name))
        }
      } else {
        group = null
      }

      // make property and header row
      const row = this.body.n("tr").attr("item", item)

      if(item.header) {
        row.n("td").attr("colSpan", 2).div("out pe-title pe-header").html(item.title);
      } else {
        const title = row.n("td").style("width", "100px").div("out pe-title");
        if (item.check) {
          let div = title.div("checkboxsmall");
          let checkBox = div.checkbox("").checked(item.checked)
          div.n("span").on("onclick", () => {
            let checked = !checkBox.checked()
            checkBox.checked(checked)
            this.oncheck(item, checked)
          })
        }
        let t = title.div("in").html(item.title)
        if (item.default) {
          t.htmlAttr("default", "")
        }
        if (item.type == Hion.DATA_MANAGER) {
          t.htmlAttr("manager", "")
        }
        if(group) {
          t.htmlAttr("ingroup", "")
        }

        const disp = row.n("td").div("out pe-value").div("in")
        this._getEditValue(disp, item)
      }

      if (group) {
        if (!this.groupState[group.name]) {
          row.hide()
        }
        group.items.push(row)
      }
    }
  }
}