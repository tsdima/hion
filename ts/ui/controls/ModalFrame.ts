import { $ } from '../Helpers'
import { Builder } from '../Builder'

export class ModalFrame {
  private readonly control: HTMLElement
  private readonly id = "_modalframe"

  public constructor(child: HTMLElement) {
    this.control = new Builder().div("modalframe").id(this.id).element
    child.parentNode.insertBefore(this.control, child)
  }

  public close() {
    $.removeChild(this.control)
  }
}
