import { ME_ELEMENT } from '../sdkeditor'
import { MouseOperation } from './MouseOperation'
import { drawLine } from '../../../tools/tools'

export class MouseOperationSlideDown extends MouseOperation {
  down(x: number, y: number) {
    this.editor.sdk.selMan.clear();

    for (const e of this.editor.sdk.imgs) {
      if (e.y >= y) {
        this.editor.sdk.selMan.add(e);
      }
    }

    if(!this.editor.sdk.selMan.isEmpty()) {
      this.editor.beginOperation(ME_ELEMENT);
    }
  }

  move(x: number, y: number) {
    this.moveCursor(x, y);
    this.editor.draw();
  }

  cursor() { return "url('img/cursor/12.cur'), auto"; }

  draw(ctx: CanvasRenderingContext2D) {
    drawLine(ctx, 0, MouseOperation.curY, this.editor.width, MouseOperation.curY);
  }
}