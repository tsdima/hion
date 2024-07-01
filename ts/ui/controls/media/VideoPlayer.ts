import { UIControl, UIControlOptions } from '../UIControl'
import { Builder } from '../../Builder'

interface VideoPlayerOptions extends UIControlOptions {
  url?: string
  controls?: boolean
  autoplay?: boolean
}

export class VideoPlayer extends UIControl<HTMLVideoElement> {
  public constructor(options: VideoPlayerOptions) {
    super()

    this._ctl = new Builder().n("video").element
    // this._ctl.setAttribute("frameborder", "0");
    // this._ctl.setAttribute("allowfullscreen", "");

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
