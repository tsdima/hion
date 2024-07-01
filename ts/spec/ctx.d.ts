declare global {
  interface HTMLElement {
    width(value: number): HTMLElement
    height(value: number): HTMLElement
    requestFullscreen(): Promise<any>
  }
}

export {}