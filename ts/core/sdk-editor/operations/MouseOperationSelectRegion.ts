import { ME_SELRECT } from '../sdkeditor'
import { MouseOperation } from './MouseOperation'

export class MouseOperationSelectRegion extends MouseOperation {
  private timerId: NodeJS.Timeout

  begin() {
    this.timerId = setInterval(() => {
      if (!this.editor.isOperation(ME_SELRECT)) {
        clearInterval(this.timerId)
        return
      }

      const ctl = this.editor.getControl().firstChild as HTMLElement
      const tx = ctl.scrollLeft
      const ty = ctl.scrollTop
      let dx = 0
      let dy = 0
      const cY = MouseOperation.curY * this.editor.scale
      const cX = MouseOperation.curX * this.editor.scale
      if (cY > this.editor.height + ty - 20 && ctl.clientHeight + ctl.scrollTop + 5 <= ctl.scrollHeight) {
        dy = 5;
      } else if(ty > 0 && cY < ty + 20) {
        dy = -Math.min(5, ty);
      }
      if (cX > this.editor.width + tx - 20 && ctl.clientWidth + ctl.scrollLeft + 5 <= ctl.scrollWidth) {
        dx = 5;
      } else if(tx > 0 && cX < tx + 20) {
        dx = -Math.min(5, tx);
      }

      if(dy) {
        ctl.scrollTop += dy;
        MouseOperation.curY += dy/this.editor.scale;
      }
      if(dx) {
        ctl.scrollLeft += dx;
        MouseOperation.curX += dx/this.editor.scale;
      }
      if(dx || dy) {
        this.editor.draw();
      }
    }, 10);
  }

  move(x: number, y: number) {
    this.moveCursor(x, y);
    this.editor.draw();
  }

  up(x: number, y: number) {
    clearInterval(this.timerId);
    this.editor.sdk.selMan.selRect(MouseOperation.startX, MouseOperation.startY, x, y);
    return true;
  }

  cursor() { return "default"; }

  draw(ctx: CanvasRenderingContext2D) {
    const x1 = Math.min(MouseOperation.startX, MouseOperation.curX)
    const y1 = Math.min(MouseOperation.startY, MouseOperation.curY)
    const x2 = Math.max(MouseOperation.startX, MouseOperation.curX)
    const y2 = Math.max(MouseOperation.startY, MouseOperation.curY)

    ctx.fillStyle = "rgba(100,200,255,0.4)";
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    ctx.strokeStyle = "#aaa";
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }
}