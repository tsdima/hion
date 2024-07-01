import { MouseOperation, MouseOperationData } from './MouseOperation'
import { OBJ_TYPE_HINT } from '../../sdk'

export class MouseOperationElementHintRemove extends MouseOperation {
  down(x: number, y: number, button: number, obj: MouseOperationData) {
    if (obj && obj.type === OBJ_TYPE_HINT) {
      let i = 0;
      for (const h of obj.obj.e.hints) {
        if (h === obj.obj) {
          obj.obj.e.hints.splice(i, 1);
          this.editor.onsdkchange();
          return;
        }
        i++;
      }
      this.editor.draw();
    }
    this.editor.endOperation();
  }

  cursor() {
    return "url('img/cursor/15.cur'), auto";
  }
}