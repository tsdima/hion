import { ME_ELEMENT } from '../sdkeditor'
import { MouseOperation } from './MouseOperation'
import { drawLine } from '../../../tools/tools'

export class MouseOperationSlideRight extends MouseOperation {
  down(x: number) {
    this.editor.sdk.selMan.clear();

    for (const e of this.editor.sdk.imgs) {
      if (e.x >= x) {
        this.editor.sdk.selMan.add(e)
      }
    }

    if (!this.editor.sdk.selMan.isEmpty()) {
      this.editor.beginOperation(ME_ELEMENT)
    }
  }

  move(x: number, y: number) {
    this.moveCursor(x, y)
    this.editor.draw()
  }

  cursor() { return "url('img/cursor/10.cur'), auto"; }

  draw(ctx: CanvasRenderingContext2D) {
    drawLine(ctx, MouseOperation.curX, 0, MouseOperation.curX, this.editor.height);
  }
}