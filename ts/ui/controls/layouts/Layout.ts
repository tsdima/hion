import { UIControl } from '../UIControl'
import { UIContainer } from '../UIContainer'

export class Layout {
  public constructor(public parent: UIContainer) {
  }

  public addChild(child: UIControl) {
    // do nothing
  }

  public setOptions(options: object) {
    // var style = this.parent.getControl().style;
    // if(options.padding) {
    // 	var v = options.padding.toString() + "px";
    // 	style.paddingTop = v;
    // 	style.paddingLeft = v;
    // 	style.paddingRight = v;
    // 	style.paddingBottom = v;
    // }
  }
}