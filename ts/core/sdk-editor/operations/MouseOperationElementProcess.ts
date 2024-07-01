import { MouseOperation } from './MouseOperation'
import { Hion } from '../../element'

export class MouseOperationElementProcess extends MouseOperation {
  private state: Hion.ElementMouseState;

  begin() {
    this.state = {startX: MouseOperation.startX, startY: MouseOperation.startY};
  }

  move(x: number, y: number) {
    this.editor.emouse.obj.mouseMove(x, y, this.state);
    this.editor.draw();
  }

  up(x: number, y: number, button: number) {
    this.editor.emouse.obj.mouseUp(x, y, button, this.state);
    this.editor.draw();
    return true;
  }

  cursor(x: number, y: number) {
    return this.editor.emouse.obj.getCursor(x, y);
  }
}