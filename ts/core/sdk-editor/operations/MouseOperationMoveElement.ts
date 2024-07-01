import { MouseOperation } from './MouseOperation'
import { toStep } from '../../../tools/tools'

export class MouseOperationMoveElement extends MouseOperation {
  begin() {
    if (this.editor.sdk.undo) {
      this.editor.sdk.undo.moveElementsBegin(this.editor.sdk.selMan);
    }
  }

  move(x: number, y: number) {
    const dx = toStep(x - MouseOperation.startX)
    const dy = toStep(y - MouseOperation.startY)
    if (dx || dy) {
      this.editor.sdk.selMan.move(dx, dy);
      MouseOperation.startX += dx;
      MouseOperation.startY += dy;
      this.editor.updateScrolls();
      this.editor.onsdkchange();
      this.editor.draw();
    }
  }

  up() {
    this.editor.sdk.selMan.normalizePosition();
    if (this.editor.sdk.undo) {
      this.editor.sdk.undo.moveElementsEnd(this.editor.sdk.selMan);
    }
    this.editor.sdk.selMan.normalizeLinks();
    return true;
  }

  cursor() { return "move"; }
}