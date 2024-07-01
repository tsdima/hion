import { PopupMenuType } from '../sdkeditor'
import { MouseOperation } from './MouseOperation'

export class MouseOperationElementHintMove extends MouseOperation {
  move(x: number, y: number) {
    const h = this.editor.emouse.obj;
    h.x += x - MouseOperation.startX;
    h.y += y - MouseOperation.startY;
    MouseOperation.startX = x;
    MouseOperation.startY = y;
    this.editor.draw();
    this.editor.onsdkchange();
  }

  up(x: number, y: number) {
    const h = this.editor.emouse.obj
    if (!h.prop) {
      this.editor.showPopup(PopupMenuType.POPUP_MENU_HINT_LINK, x, y, h)
    }
    return true;
  }

  cursor() { return "move"; }
}