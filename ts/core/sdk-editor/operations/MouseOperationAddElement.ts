import { ME_ADDELEMENT_POINT } from '../sdkeditor'
import { MouseOperation, MouseOperationData } from './MouseOperation'
import { OBJ_TYPE_LINE, OBJ_TYPE_POINT } from '../../sdk'
import { palette } from '../../../main'

export class MouseOperationAddElement extends MouseOperation {
  down(x: number, y: number, button: number, obj: MouseOperationData, flags: number) {
    if (button === 0) {
      if (obj && obj.type === OBJ_TYPE_POINT && obj.obj.isFree()) {
        this.moveCursorStart(obj.obj.pos.x, obj.obj.pos.y);
        this.editor.emouse.sobj = this.editor.emouse.obj;
        this.editor.beginOperation(ME_ADDELEMENT_POINT, obj.obj);
      } else {
        const element = this.editor.addElement(this.editor.emouse.obj, x, y)

        if ((flags & 0x1) === 0) {
          palette.unSelect();
        }

        if(obj && obj.type === 3) {
          element.insertInLine(obj.point, obj.obj);
        }
        return element;
      }
    } else {
      palette.unSelect();
    }
  }

  up(x: number, y: number, button: number, obj: MouseOperationData, flags: number) {
    return (flags & 0x1) === 0;
  }

  cursor(x: number, y: number, obj: MouseOperationData) {
    if (obj) {
      if (obj.type === OBJ_TYPE_POINT) {
        return this.editor.cursorPoint;
      } else if(obj.type === OBJ_TYPE_LINE) {
        return this.editor.cursorLine;
      }
    }
    return this.editor.cursorNormal;
  }
}