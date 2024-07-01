import { DocumentTab } from './DocumentTab'
import { Panel } from '../../../controls/Panel'
import { UIImage } from '../../../controls/UIImage'
import { FSNode } from '../../../../fs/FSNode'

export class ImageTab extends DocumentTab {
  private readonly panel: Panel
  private readonly image: UIImage

  constructor () {
    super()

    this.panel = new Panel({theme: "doc-image"})
    this.setLayoutOptions({grow:1})
    this.image = new UIImage({mode: 1})
    this.panel.add(this.image)
    this._ctl = this.panel.getControl()
  }

  open(file: FSNode, asNew: boolean) {
    super.open(file, asNew)

    file.readArray((error, data) => {
      if (error === 0) {
        const blob = new Blob([data], {type : file.mime})
        this.image.url = URL.createObjectURL(blob)
      }
    })
  }
}