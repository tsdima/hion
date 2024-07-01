import { FlexLayout, FlexLayoutOptions } from './FlexLayout'
import { UIContainer } from '../UIContainer'

export class VLayout extends FlexLayout {
  public constructor(parent: UIContainer, options: FlexLayoutOptions) {
    super(parent, options)

    parent.getContainer().style.flexDirection = options.reverse ? "column-reverse" : "column";
  }
}
