import { UIControl } from './UIControl'

export interface ListControlElement extends HTMLElement {
  index: number
}

export class ListControl<T extends ListControlElement> extends UIControl {
  public selected?: T = null

  public size(): number {
    return 0
  }

  public selectIndex(index: number) {

  }

  public click(item: ListControlElement) {

  }

  protected attachKeyHandler () {
    this.addListener("keydown", (event: KeyboardEvent) => {
      if (this.getControl().hasAttribute("disabled")) {
        return
      }
      let selIndex = -1
      switch(event.keyCode) {
        case 38: // up
          if (this.selected) {
            const index = this.selected.index
            if (index) {
              selIndex = index - 1
            }
          } else if(this.size()) {
            selIndex = this.size() - 1
          }
          break
        case 40: // down
          if (this.selected) {
            const index = this.selected.index
            if (index < this.size() - 1) {
              selIndex = index + 1
            }
          } else if(this.size()) {
            selIndex = 0;
          }
          break
        case 13:
          if (this.selected) {
            this.click(this.selected)
          }
          break
      }
      if (selIndex != -1) {
        this.selectIndex(selIndex)
      }
    })
  }
}
