import { SdkEditor } from '../sdkeditor'
import { OBJ_TYPE_ELEMENT, OBJ_TYPE_HINT, OBJ_TYPE_LINE, OBJ_TYPE_LINEPOINT, OBJ_TYPE_POINT } from '../../sdk'
import { Hion } from '../../element'
import { Point, PointPosition } from '../../point'

export interface MouseOperationObject<Type extends number, ObjectType> {
  type: Type
  obj: ObjectType
}

export interface MouseOperationObjectElement extends MouseOperationObject<typeof OBJ_TYPE_ELEMENT, Hion.SdkElement> {}
export interface MouseOperationObjectPoint extends MouseOperationObject<typeof OBJ_TYPE_POINT, Point> {}
export interface MouseOperationObjectLine extends MouseOperationObject<typeof OBJ_TYPE_LINE, PointPosition> {
  point: Point
}
export interface MouseOperationObjectLinePoint extends MouseOperationObject<typeof OBJ_TYPE_LINEPOINT, PointPosition> {
  point: Point
}
export interface MouseOperationObjectHint extends MouseOperationObject<typeof OBJ_TYPE_HINT, Hion.PropertyHint> {}

export type MouseOperationData = MouseOperationObjectElement|MouseOperationObjectPoint|MouseOperationObjectLine|MouseOperationObjectLinePoint|MouseOperationObjectHint

export class MouseOperation {
  static startX: number;
  static startY: number;
  static curX: number;
  static curY: number;

  constructor (protected editor: SdkEditor) {}

  moveCursorStart(x: number, y: number) {
    MouseOperation.startX = x;
    MouseOperation.startY = y;
    this.moveCursor(x, y);
  }

  moveCursor(x: number, y: number) {
    MouseOperation.curX = x;
    MouseOperation.curY = y;
  }

  begin() {}
  down(x: number, y: number, button: number, obj: MouseOperationData, flags: number) {}
  move(x: number, y: number, obj: MouseOperationData) {}
  up(x: number, y: number, button: number, obj: MouseOperationData, flags: number) { return true; }
  cursor(x: number, y: number, obj: MouseOperationData) { return ""; }
  draw(ctx: CanvasRenderingContext2D) {}
}