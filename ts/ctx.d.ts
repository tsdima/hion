declare global {
  interface CanvasRenderingContext2D {
    drawLine(x1: number, y1: number, x2: number, y2: number): void
  }

  interface DialogButton {
    text: string
    click: (dialog: Hion.Dialog) => void
  }

  interface DialogOptions {
    icon?: string
    title: string
    resize: boolean
    modal: boolean,
    destroy: boolean,
    buttons: DialogButton[]
  }

  interface HTMLElement {
    hide(): void
    show(): void
    width(value: number): HTMLElement
    height(value: number): HTMLElement
    dialog(options: DialogOptions): HTMLElement
    requestFullscreen(): Promise<any>
  }
}

export {}