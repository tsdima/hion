import { DocumentTab } from './DocumentTab'
import { Builder } from '../../../Builder'
import { FSNode } from '../../../../fs/FSNode'

export class OggTab extends DocumentTab {
  constructor () {
    super()

    const audio = new Builder().n("audio").attr("controls", "controls")
    this._ctl = audio.element
  }

  open(file: FSNode, asNew: boolean) {
    super.open(file, asNew);

    file.readArray((error, data) => {
      if(error === 0) {
        const blob = new Blob([data], {type : 'audio/ogg'});
        (this._ctl as HTMLAudioElement).src = URL.createObjectURL(blob)
      }
    })
  }
}