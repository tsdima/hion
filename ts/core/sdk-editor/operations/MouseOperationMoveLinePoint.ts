import { MouseOperation } from './MouseOperation'

export class MouseOperationMoveLinePoint extends MouseOperation {
  move(x: number, y: number) {
    const pos = this.editor.emouse.obj
    const oldX = pos.x, oldY = pos.y
    pos.x = x;
    pos.y = y;

    if (pos.prev && !pos.prev.prev) {
      const dy = Math.abs(pos.y - pos.prev.y)
      const dx = Math.abs(pos.x - pos.prev.x)
      if (dy <= 10 && dx <= 10) {
        // do nothing
      } else if(dy <= 5) {
        pos.y = pos.prev.y
      } else if(dx <= 5) {
        pos.x = pos.prev.x
      }
    }

    if (pos.next && !pos.next.next) {
      const dy = Math.abs(pos.y - pos.next.y)
      const dx = Math.abs(pos.x - pos.next.x)
      if(dy <= 10 && dx <= 10) {
        // do nothing
      } else if(dy <= 5) {
        pos.y = pos.next.y;
      } else if(dx <= 5) {
        pos.x = pos.next.x;
      }
    }

    let no = pos.next;
    let flagx = false;
    let flagy = false;
    if (no.next) {
      const dx = Math.abs(oldX - no.x)
      const dy = Math.abs(oldY - no.y)
      if(dx < 10 && dy < 10) {
        // do nothing
      } else if (dx < 10) {
        no.x = x;
        flagx = true;
      } else if (dy < 10) {
        no.y = y;
        flagy = true;
      }
    }
    no = pos.prev;
    if (no.prev) {
      const dx = Math.abs(oldX - no.x)
      const dy = Math.abs(oldY - no.y)
      if(dx < 10 && dy < 10) {
        // do nothing
      } else if (dx < 10 && !flagx) {
        no.x = x;
      } else if (dy < 10 && !flagy) {
        no.y = y;
      }
    }
    this.editor.draw();
    this.editor.onsdkchange();
  }

  up() {
    if (this.editor.sdk.undo) {
      this.editor.sdk.undo.changeLinkEnd(null);
    }
    return true;
  }

  cursor() { return "move"; }
}