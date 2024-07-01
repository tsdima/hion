import { MouseOperation, MouseOperationData } from './MouseOperation'
import { PopupMenuType } from '../sdkeditor'
import { OBJ_TYPE_ELEMENT, OBJ_TYPE_LINE } from '../../sdk'
import { toStep } from '../../../tools/tools'

export class MouseOperationPopupMenu extends MouseOperation {
  up(x: number, y: number, button: number, obj: MouseOperationData) {
    if (this.editor.emouse.obj) {
      if (this.editor.emouse.obj.type === OBJ_TYPE_ELEMENT) {
        this.editor.showPopup(PopupMenuType.POPUP_MENU_ELEMENT, x, y);
      } else if(this.editor.emouse.obj.type === OBJ_TYPE_LINE) {
        this.editor.pasteX = toStep(x);
        this.editor.pasteY = toStep(y);
        if (obj?.type === OBJ_TYPE_LINE) {
          this.editor.pasteObj = {obj: obj.obj, point: obj.point}
        }
        this.editor.showPopup(PopupMenuType.POPUP_MENU_LINE, x, y);
      }
    } else {
      this.editor.pasteX = toStep(x);
      this.editor.pasteY = toStep(y);
      this.editor.showPopup(PopupMenuType.POPUP_MENU_SDK, x, y);
    }
    return true;
  }
}