import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface MemoOptions extends UIControlOptions {
  text?: string
}

export class Memo extends UIControl<HTMLTextAreaElement> {
  public constructor(options: MemoOptions) {
    super()

    this._ctl = new Builder().n("textarea").class("ui-memo").element

    if (options?.text) {
      this.text = options.text
    }

    this.setOptions(options)
  }

  public add(value: string) {
    this.text += value + "\n"
  }

  public set caretStart(value: number) {
    this._ctl.selectionStart = value
  }

  public get caretStart(): number {
    return this._ctl.selectionStart
  }

  public set text(value: string) {
    this._ctl.value = value
  }
}
