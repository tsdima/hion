import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

export class DropBox extends UIControl {
  private ondrop: (file: File) => void
  private onenddrop: () => void

  public constructor(options: UIControlOptions) {
    super()

    this.ondrop = () => {}
    this.onenddrop = () => {}

    this._ctl = new Builder().div("ui-dropbox")
      .on("ondragover", () => {
        this._ctl.setAttribute("over", 'true')
        return false
      })
      .on("ondragleave", () => {
        this._ctl.setAttribute("over", 'false')
        return false
      })
      .on("ondrop", (event: DragEvent) => {
        event.preventDefault()

        for (const file of event.dataTransfer.files) {
          this.ondrop(file)
        }
        this.onenddrop()

        this._ctl.setAttribute("over", 'false')

        return false
      }).element

    this.setOptions(options)
  }

  public addListener(name: string, func: any) {
    if(name === "drop") {
      this.ondrop = func
    } else if(name === "enddrop") {
      this.onenddrop = func
    } else {
      super.addListener(name, func)
    }
  }
}
