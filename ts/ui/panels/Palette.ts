import { UIContainer } from '../controls/UIContainer'
import { Builder, BuilderElementType } from '../Builder'
import { Hint } from '../overlay/Hint'
import { UIControlOptions } from '../controls/UIControl'
import { VLayout } from '../controls/layouts/VLayout'
import { Pack } from '../../core/pack/Pack'
import { Spoiler } from '../controls/Spoiler'
import { getOptionBool } from '../../tools/tools'

interface ElementsCacheList {
  [pack: string]: Array<HTMLElement>;
}

interface TabList {
  [name: string]: PaletteSpoiler;
}

interface PaletteSpoiler extends Spoiler {
  name: string;
}

export class Palette extends UIContainer {
  onselect = (elementName: string) => {};

  private palette: Builder;
  private hint: Hint;
  private currentPack: string;
  private readonly cache: ElementsCacheList;
  private selected: BuilderElementType;

  constructor(options: UIControlOptions) {
    super();

    let p = new Builder().div("palette");
    this.palette = p.div("pl-body");
    this._ctl = p.element;

    this.selected = null;

    this.hint = new Hint();

    this.setOptions(options);
    this.layout = new VLayout(this, {});

    this.cache = {};
    this.currentPack = "";
  }

  getContainer(): BuilderElementType {
    return this.palette.element;
  }

  private selElement(obj: BuilderElementType, id: string) {
    if(this.selected) {
      this.selected.removeAttribute("selected");
    }
    this.selected = obj;
    this.selected.setAttribute("selected", "");
    this.onselect(id);
  }

  unSelect() {
    if(this.selected) {
      this.selected.removeAttribute("selected");
      this.selected = null;
    }
  }

  view(pack: Pack) {
    if(!pack) {
      this.currentPack = "";
      return;
    }
    if(this.currentPack === pack.name) {
      return;
    }
    this.currentPack = pack.name;
    this.removeAll();
    this.palette.html("");

    if(this.cache[pack.name]) {
      for(const item of this.cache[pack.name])
        this.palette.append(item);
      return;
    }

    function isValidTab(tab) {
      return tab && tab !== "*";
    }

    // create tabs
    const tabs: TabList = {}
    for (const i in pack.elements) {
      const element = pack.elements[i];
      if(isValidTab(element.tab) && !tabs[element.tab]) {
        const tab = new Spoiler({
          caption: pack.translate("tab." + element.tab)
        }) as PaletteSpoiler
        tab.name = element.tab;
        tabs[element.tab] = tab;
        this.add(tab);
      }
    }

    // elements
    for (let id in pack.elements) {
      const element = pack.elements[id];
      if(isValidTab(element.tab)) {
        if(element.group) {
          tabs[element.tab].body().div("group").html(pack.translate("group." + id));
        } else {
          let e = tabs[element.tab].body().div("element")
            .on("onmouseenter", (event: MouseEvent) => {
              const tpl = pack.elements[id]
              const h = this.hint.body()
              const header = h.div("header")
              header.html(pack.translate(id));
              h.n("div").html(pack.translate("el." + id));
              this.hint.show(event.clientX + 16, event.clientY + 16);
            })
            .on("onmouseleave", () => this.hint.close());

          e.on("onclick", () => this.selElement(e.element, id));
          e.on("onmousedown", () => false);

          e.append(element.icon);
        }
      }
    }

    let arr = [];
    for(let i = 0; i < this.palette.childs(); i++)
      arr.push(this.palette.child(i));
    this.cache[pack.name] = arr;

    // settings
    for (let t in tabs) {
      let tab = tabs[t];
      if(getOptionBool("opt_palette_groups", 0)) {
        if(window.localStorage.getItem(tab.name) === "true") {
          tab.opened = true;
        }
      }
      tab.addListener("mouseover", function(){
        if(!tab.opened) {
          if(getOptionBool("opt_auto_open", 0)) {
            tab.opened = true;
          }
        }
      });
      tab.addListener("mouseout", function(){
        if(this.childNodes[0].parent.opened) {
          if(getOptionBool("opt_auto_open", 0)) {
            this.childNodes[0].parent.opened = false;
          }
        }
      });
      tab.onchange = function(){
        window.localStorage.setItem(this.name, this.opened);

        if(this.opened && getOptionBool("opt_auto_close", 1)) {
          for (let t in tabs) {
            if(tabs[t].opened && tabs[t] !== this) {
              tabs[t].opened = false;
            }
          }
        }
      }
    }
  }
}
