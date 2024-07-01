import {
  ME_ELEMENT,
  ME_ELEMENT_MOUSE,
  ME_LINEPOINT,
  ME_MOVE_LH,
  ME_POINTLINK,
  ME_POPUP_MENU,
  ME_SCROLL_EDITOR,
  ME_SELRECT
} from '../sdkeditor'
import { MouseOperation, MouseOperationData } from './MouseOperation'
import { OBJ_TYPE_ELEMENT, OBJ_TYPE_HINT, OBJ_TYPE_LINE, OBJ_TYPE_LINEPOINT, OBJ_TYPE_POINT } from '../../sdk'

export class MouseOperationNone extends MouseOperation {
  down(x: number, y: number, button: number, obj: MouseOperationData, flags: number) {
    if (button === 1) {
      this.editor.beginOperation(ME_SCROLL_EDITOR, null)
    } else if (obj) {
      switch (obj.type) {
        case OBJ_TYPE_ELEMENT:
          if(obj.obj.mouseDown(x, y, button, flags)) {
            this.editor.beginOperation(ME_ELEMENT_MOUSE, obj.obj);
          } else {
            if(!obj.obj.isSelect()) {
              this.editor.sdk.selMan.select(obj.obj);
            }
            if(button === 0) {
              this.editor.beginOperation(ME_ELEMENT, obj.obj);
            } else if(button === 2) {
              this.editor.beginOperation(ME_POPUP_MENU, obj);
            }
          }
          break;
        case OBJ_TYPE_POINT:
          if (button === 2) {
            if (this.editor.sdk.undo) {
              this.editor.sdk.undo.delLink(obj.obj);
            }
            obj.obj.clear();
            this.editor.onsdkchange();
          } else {
            let o = obj.obj
            if (o.point) {
              const p = o.point
              o = p;
              if (this.editor.sdk.undo) {
                this.editor.sdk.undo.delLink(obj.obj);
              }
              obj.obj.parent.clearPoint(obj.obj);
            }
            this.moveCursorStart(o.pos.x, o.pos.y);
            this.moveCursor(x, y);
            this.editor.beginOperation(ME_POINTLINK, o);
          }
          break;
        case OBJ_TYPE_LINE:
          if (button === 0) {
            if (this.editor.sdk.undo) {
              this.editor.sdk.undo.changeLinkBegin(obj.point);
            }
            obj.obj.next = {x: x, y: y, next: obj.obj.next, prev: obj.obj};
            obj.obj.next.next.prev = obj.obj.next;
            this.editor.beginOperation(ME_LINEPOINT, obj.obj.next);
          } else if (button === 2) {
            this.editor.beginOperation(ME_POPUP_MENU, obj);
          }
          break;
        case OBJ_TYPE_LINEPOINT:
          if (button === 0) {
            this.editor.beginOperation(ME_LINEPOINT, obj.obj);
            if (this.editor.sdk.undo) {
              this.editor.sdk.undo.changeLinkBegin(obj.point);
            }
          } else {
            if (this.editor.sdk.undo) {
              this.editor.sdk.undo.changeLinkBegin(obj.point);
            }
            let pt = obj.point.pos;
            while (pt.next !== obj.obj)
              pt = pt.next;
            pt.next = pt.next.next;
            pt.next.prev = pt;
            if (this.editor.sdk.undo) {
              this.editor.sdk.undo.changeLinkEnd(obj.point);
            }
            this.editor.onsdkchange();
          }
          break;
        case OBJ_TYPE_HINT:
          if (button === 0) {
            this.editor.beginOperation(ME_MOVE_LH, obj.obj);
          }
          break;
      }
    } else {
      if (button === 0) {
        if ((flags & 0x1) === 0) {
          this.editor.sdk.selMan.clear();
        }
        this.editor.beginOperation(ME_SELRECT, null);
        setTimeout(() => {
          if(this.editor.isOperation(ME_SELRECT) && Math.abs(MouseOperation.curX - x) < 5 && Math.abs(MouseOperation.curY - y) < 5) {
            this.editor.beginOperation(ME_SCROLL_EDITOR, null);
          }
        }, 300);
      } else if(button === 2) {
        this.editor.sdk.selMan.clear();
        this.editor.beginOperation(ME_POPUP_MENU, null);
      }
    }
  }

  cursor(x: number, y: number, obj: MouseOperationData) {
    let cur = "default";
    if (obj) {
      switch (obj.type) {
        case OBJ_TYPE_ELEMENT:
          const c = obj.obj.getCursor(x, y);
          if(c) {
            cur = c;
          }
          break;
        case OBJ_TYPE_POINT:
          cur = "pointer";
          break;
        case OBJ_TYPE_LINE:
          cur = "crosshair";
          break;
        case OBJ_TYPE_LINEPOINT:
          cur = "move";
          break;
      }
    }
    return cur;
  }
}