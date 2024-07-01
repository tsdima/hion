type LoaderEvent = (state: string, complete: boolean) => void

export class LoaderTask {
  private event: LoaderEvent = null

  constructor (private handler:(task: LoaderTask) => void) {
  }

  public run() {
    this.handler(this)
  }

  public taskComplete(text: string) {
    console.log(text)
    if (this.event) {
      this.event(text, true)
    }
  }

  public setHandle(loader: LoaderEvent) {
    this.event = loader
  }

  public state(text: string) {
    if (this.event) {
      this.event(text, false)
    }
  }
}