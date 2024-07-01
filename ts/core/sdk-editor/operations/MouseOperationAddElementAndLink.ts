import { ME_ADDELEMENT, ME_POINTLINK } from '../sdkeditor'
import { MouseOperation, MouseOperationData } from './MouseOperation'
import { OBJ_TYPE_LINE, OBJ_TYPE_POINT } from '../../sdk'
import { Hion } from '../../element'

export class MouseOperationAddElementAndLink extends MouseOperation {
  move(x: number, y: number) {
    this.moveCursor(x, y);
    this.editor.draw();
  }

  up(x: number, y: number, button: number, obj: MouseOperationData, flags: number) {
    const p1 = this.editor.emouse.obj;
    this.editor.emouse.obj = this.editor.emouse.sobj;
    delete this.editor.emouse.sobj;

    if (obj && obj.type === OBJ_TYPE_POINT && obj.obj.isFree()) {
      if (p1.type - obj.obj.type === 1) {
        let p2 = obj.obj;
        p1.connect(p2);
        const point = p1.isPrimary() ? p1 : p2;
        this.editor.mouseHandlers[ME_ADDELEMENT].down((p1.pos.x + p2.pos.x)/2, (p1.pos.y + p2.pos.y)/2, button, {type: OBJ_TYPE_LINE, point: point, obj: point.pos}, flags);
        if (p1.point) {
          p1.createPath();
        }
        if (p2.point) {
          p2.point.createPath();
        }
      }
    } else {
      let e: any = this.editor.mouseHandlers[ME_ADDELEMENT].down(x, y, button, obj, flags);
      let p2 = (e as Hion.SdkElement).getFirstFreePoint(p1.getPair());
      if(p2) {
        p1.connect(p2).createPath();
      }
    }
    return true;
  }

  cursor(x: number, y: number, obj: MouseOperationData) {
    if(obj && obj.type === OBJ_TYPE_POINT) {
      return this.editor.cursorPoint;
    }
    return this.editor.cursorNormal;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.editor.mouseHandlers[ME_POINTLINK].draw(ctx);
  }
}