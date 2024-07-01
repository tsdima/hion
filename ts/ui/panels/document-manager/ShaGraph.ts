import { UIControl, UIControlOptions } from '../../controls/UIControl'
import { Builder } from '../../Builder'
import { SDK } from '../../../core/sdk'
import { Hion } from '../../../core/element'
import { SHATab } from './tabs/SHATab'

export class ShaGraph extends UIControl {
  private body: Builder;
  public sdkTab: SHATab;

  constructor (options: UIControlOptions) {
    super();

    this.body = new Builder().div("graph");
    this._ctl = this.body.element;

    this.sdkTab = null;

    this.setOptions(options);
  }

  public clear() {
    this.body.html('')
  }

  public parse(sdk: SDK) {
    this.clear();

    const ed = this;

    function parse(sdk: SDK, level: number) {
      for (let e of sdk.imgs) {
        if (e.sdk) {
          const node = ed.body.div("node").attr("level", level);
          for (let i = 0; i < level; i++) {
            node.div("cell");
          }
          const item = node.div("item").attr("element", e).on("onclick", () => {
            ed.sdkTab.goInto(e);
          })
          item.n("img").attr("src", e.img.src)
          item.n("div").html(e.sys.Comment.value || e.name)
          for (let l = ed.body.childs()-1; l > 0 && ed.body.child(l)['level'] >= level; l--) {
            const cls = (ed.body.child(l).childNodes[level-1] as HTMLElement).className;
            if(cls == "cell")
              (ed.body.child(l).childNodes[level-1] as HTMLElement).className = l == ed.body.childs()-1 ? "tree-end" : "tree";
            else if(cls == "tree-end")
              (ed.body.child(l).childNodes[level-1] as HTMLElement).className = "tree-center";
          }
          parse(e.sdk, level + 1);
        }
      }
    }

    for (let e of sdk.imgs) {
      if (e.flags & Hion.IS_PARENT) {
        let node = this.body.div("node").div("item").on("onclick", () => {
          this.sdkTab.goInto(e);
        })
        node.n("img").attr("src", e.img.src);
        node.n("div").html(e.name);
        parse(sdk, 1);
        break;
      }
    }
  }
}