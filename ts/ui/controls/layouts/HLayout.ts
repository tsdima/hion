import { FlexLayout, FlexLayoutOptions } from './FlexLayout'
import { UIContainer } from '../UIContainer'

export class HLayout extends FlexLayout {
  public constructor(parent: UIContainer, options: FlexLayoutOptions) {
    super(parent, options)

    parent.getContainer().style.flexDirection = options.reverse ? "row-reverse" : "row";
  }
}
