import { UIContainer } from './UIContainer'
import { Builder } from '../Builder'
import { HLayout } from './layouts/HLayout'
import { ToolButton, ToolButtonOptions } from './ToolButton'
import { UIControlOptions } from './UIControl'

interface ToolBarOptions extends UIControlOptions {
  url?: string
}

export class ToolBar extends UIContainer {
  public constructor(buttons: ToolButtonOptions[], options?: ToolBarOptions) {
    super()

    const p = new Builder().div("ui-toolbar")

    this._ctl = p.element;

    this.layout = new HLayout(this, {})

    for (const btn of buttons) {
      if (btn.title === "-") {
        p.div("splitter")
      } else {
        if (options && options.url) {
          btn.url = options.url
        }
        this.add(new ToolButton(btn))
      }
    }

    this.setOptions(options);
  }

  public enabled(index: number, value: boolean) {
    (this.get(index) as ToolButton).enabled = value
  }

  public getButtonByTag(tag: string) {
    let _btn: ToolButton = null
    this.each(function(btn: ToolButton){
      if(btn.tag == tag) {
        _btn = btn
        return true
      }
    })
    return _btn
  }
}
