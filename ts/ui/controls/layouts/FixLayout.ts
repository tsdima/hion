import { Layout } from './Layout'
import { UIControl } from '../UIControl'
import { UIContainer } from '../UIContainer'

export class FixLayout extends Layout {
  public constructor(parent: UIContainer) {
    super(parent)
  }

  addChild(child: UIControl) {
    child.getControl().style.position = "absolute"
  }
}
