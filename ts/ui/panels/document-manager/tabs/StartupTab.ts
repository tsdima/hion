import { DocumentTab } from './DocumentTab'
import { Builder } from '../../../Builder'
import { commander } from '../../../../main'

export class StartupTab extends DocumentTab {
  constructor () {
    super()

    const startup = new Builder().div("startup")
    startup.div("button")
      .style("backgroundImage", "url('img/new.png')")
      .on("onclick", () => commander.execCommand('new'))
      .html("Create New...")
    startup.div("button")
      .style("backgroundImage", "url('img/folder.png')")
      .on("onclick", () => commander.execCommand('open'))
      .html("Open exists")
    this._ctl = startup.element
  }
}