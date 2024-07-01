import { Pack } from './Pack'
import { LoaderTask } from '../../tools/loader/LoaderTask'
import { packMan } from '../../main'

interface PackList {
  [name: string]: Pack
}

export class PackManager {
  packs: PackList = {}
  private counter: number
  onload = () => {}

  task: LoaderTask

  public load(packs: string[]) {
    this.counter = 0
    let packName = packs[this.counter]
    let p = new Pack(packName)
    let base = p
    this.state(packName)

    p.onload = () => {
      this.packs[packName] = p
      this.counter++

      if (this.counter < packs.length) {
        packName = packs[this.counter]
        let np = new Pack(packName)
        np.parent = base
        np.onload = p.onload
        p = np
        this.state(packName)
        np.load()
      } else {
        this.onload()
      }
    }
    p.load()
  }

  public state(text: string) {
    this.task.state("Load " + text + "...")
  }

  public getPack(name: string): Pack {
    return this.packs[name]
  }
}