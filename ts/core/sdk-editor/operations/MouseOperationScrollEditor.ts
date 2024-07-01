import { MouseOperation } from './MouseOperation'

export class MouseOperationScrollEditor extends MouseOperation {
  move(x: number, y: number) {
    this.editor.scrollBy(MouseOperation.startX - x, MouseOperation.startY - y)
  }

  cursor() { return "move"; }
}