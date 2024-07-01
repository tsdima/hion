import { ME_MOVE_LH } from '../sdkeditor'
import { MouseOperation, MouseOperationData } from './MouseOperation'
import { OBJ_TYPE_ELEMENT } from '../../sdk'

export class MouseOperationElementHintAdd extends MouseOperation {
  down(x: number, y: number, button: number, obj: MouseOperationData) {
    if (obj && obj.type === OBJ_TYPE_ELEMENT) {
      this.editor.beginOperation(ME_MOVE_LH, obj.obj.addHint(x - obj.obj.x, y - obj.obj.y, null));
    }
  }

  cursor(x: number, y: number, obj: MouseOperationData) {
    if (obj?.type === OBJ_TYPE_ELEMENT) {
      return "url('img/cursor/14.cur'), auto";
    }
    return "url('img/cursor/13.cur'), auto";
  }
}