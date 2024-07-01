import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface AudioPlayerOptions extends UIControlOptions {
  url?: string
  controls?: boolean
  autoplay?: boolean
}

export class AudioPlayer extends UIControl<HTMLAudioElement> {
  public constructor(options: AudioPlayerOptions) {
    super()

    this._ctl = new Builder().n("audio").element

    if (options?.url) {
      this.load(options.url)
    }
    if (options?.controls) {
      this._ctl.setAttribute("controls", "controls")
    }
    if (options?.autoplay) {
      this._ctl.setAttribute("autoplay", "autoplay")
    }

    this.setOptions(options)
  }

  public load(url: string) {
    this._ctl.src = url
  }

  public play() {
    return this._ctl.play()
  }

  public pause() {
    this._ctl.pause()
  }

  public paused() {
    return this._ctl.paused
  }
}
