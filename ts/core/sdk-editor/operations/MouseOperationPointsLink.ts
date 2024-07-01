import { MouseOperation, MouseOperationData } from './MouseOperation'
import { OBJ_TYPE_ELEMENT, OBJ_TYPE_LINE, OBJ_TYPE_LINEPOINT, OBJ_TYPE_POINT } from '../../sdk'
import { drawLine, toStep } from '../../../tools/tools'
import { Point } from '../../point'

export class MouseOperationPointsLink extends MouseOperation {
  move (x: number, y: number) {
    this.moveCursor(x, y);
    this.editor.draw();
  }

  up(x: number, y: number, button: number, obj: MouseOperationData) {
    if(obj && obj.type === OBJ_TYPE_LINE) {
      // insert hubex

      const e = this.editor.sdk.add(obj.point.type == 2 ? "HubEx" : "GetDataEx", toStep(x), toStep(y));
      e.insertInLine(obj.point, obj.obj);
      e.connectToPoint(this.editor.emouse.obj);
      this.editor.onsdkchange();
      if (this.editor.sdk.undo) {
        this.editor.sdk.undo.addElement(e);
        this.editor.sdk.undo.makeLink(this.editor.emouse.obj);
      }
      return true;
    }

    if(obj && obj.type === OBJ_TYPE_LINEPOINT) {
      // link point
      let pt = obj.point.pos;
      while (pt.next !== obj.obj)
        pt = pt.next;
      pt.next = pt.next.next;
      pt.next.prev = pt;

      const e = this.editor.sdk.add(obj.point.type == 2 ? "HubEx" : "GetDataEx", toStep(pt.x), toStep(pt.y))
      e.insertInLine(obj.point, obj.obj);
      const points: Point[] = []
      for (let i = 1; i <= 3; i++) {
        points.push(e.points[(obj.point.type == 2 ? "doWork" : "Var") + i]);
      }
      obj.point.connectWithPath(points);
      this.editor.emouse.obj.connectWithPath(points);
      this.editor.onsdkchange();
      if(this.editor.sdk.undo) {
        this.editor.sdk.undo.addElement(e);
        this.editor.sdk.undo.makeLink(this.editor.emouse.obj);
      }

      return true;
    }

    if (!obj || obj && [OBJ_TYPE_LINE, OBJ_TYPE_LINEPOINT].includes(obj.type))
      return true;

    if (obj.type === OBJ_TYPE_ELEMENT) {
      const freePoint = obj.obj.getPointToLink(this.editor.emouse.obj.getPair());
      if (freePoint) {
        obj = {obj: freePoint, type: OBJ_TYPE_POINT};
      }
    }

    if (obj.type === OBJ_TYPE_POINT) {
      const sum = (obj.obj !== this.editor.emouse.obj) ? (this.editor.emouse.obj.type + obj.obj.type) : 0
      if (sum === 3 || sum === 7) {
        obj.obj.connect(this.editor.emouse.obj).createPath();
        if (this.editor.sdk.undo) {
          this.editor.sdk.undo.makeLink(obj.obj);
        }
        this.editor.onsdkchange();
      }
    }
    return true;
  }

  cursor(x: number, y: number, obj: MouseOperationData) {
    if (obj) {
      if (obj.type === OBJ_TYPE_ELEMENT) {
        if (obj.obj.getFirstFreePoint(this.editor.emouse.obj.getPair())) {
          return "url('img/cursor/6.cur'), auto";
        }
      }
      if (obj.type === OBJ_TYPE_POINT) {
        return "url('img/cursor/6.cur'), auto";
      }
      if (obj.type === OBJ_TYPE_LINE || obj.type === OBJ_TYPE_LINEPOINT) {
        return "url('img/cursor/9.cur'), auto";
      }
    }
    return "url('img/cursor/7.cur'), auto";
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#555";
    drawLine(ctx, MouseOperation.startX, MouseOperation.startY, MouseOperation.curX, MouseOperation.curY);
  }
}