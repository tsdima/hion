import { Layout } from './Layout'
import { UIControl } from '../UIControl'
import { UIContainer } from '../UIContainer'

export interface FlexLayoutOptions {
  wrap?: number
  justifyContent?: number
  alignItems?: number
  alignContent?: number
  padding?: number
  reverse?: boolean
}

export class FlexLayout extends Layout {
  public constructor(parent: UIContainer, options: FlexLayoutOptions) {
    super(parent)

    this.setOptions(options)
  }

  addChild(child: UIControl) {
    if (child._layoutOpt) {
      const style = child.getControl().style
      if (child._layoutOpt.margin) {
        const v = child._layoutOpt.margin.toString() + "px"
        style.marginTop = v
        style.marginLeft = v
        style.marginRight = v
        style.marginBottom = v
      }
      if (child._layoutOpt.grow) {
        style.flexGrow = child._layoutOpt.grow.toString()
      }
      if (child._layoutOpt.shrink || child._layoutOpt.shrink === 0) {
        style.flexShrink = child._layoutOpt.shrink.toString()
      }
      if (child._layoutOpt.alignSelf) {
        style.alignSelf = ["auto", "flex-start", "flex-end", "enter", "baseline", "stretch"][child._layoutOpt.alignSelf]
      }
    }
  }

  setOptions(options: FlexLayoutOptions) {
    const style = this.parent.getContainer().style
    this.parent.getContainer().classList.add("ui-layout-flex")
    if (options.wrap) {
      style.flexWrap = ["nowrap", "wrap", "wrap-reverse"][options.wrap]
    }
    if (options.justifyContent) {
      style.justifyContent = ["flex-start", "flex-end", "center", "space-between", "space-around"][options.justifyContent]
    }
    if (options.alignItems) {
      style.alignItems = ["flex-start", "flex-end", "center", "baseline", "stretch"][options.alignItems]
    }
    if (options.alignContent) {
      style.alignContent = ["flex-start", "flex-end", "center", "space-between", "space-around", "stretch"][options.alignContent]
    }
    if (options.padding) {
      style.padding = options.padding + "px"
    }

    super.setOptions(options)
  }
}
