import { Pack } from './Pack'

interface PackList {
  [name: string]: Pack
}

export class PackManager {
  packs: PackList = {}

  public setPacks(packs: any, cb: () => void, onload:() => void)
  {
    let count = 0
    let base: Pack
    for(let i=0; i<packs.length; ++i) {
      ++count;
      let packName: string = packs[i].name;
      let p = new Pack(packName)
      if (i==0) base = p; else p.parent = base;
      p.onload = onload;
      p.setLang(packs[i].lang)
      p.setPack(packs[i].pack)
      p.setElements(packs[i].elements)
      p.loadCore(() => { if(--count==0) cb() })
      this.packs[packName] = p
    }
  }

  public getPack(name: string): Pack {
    return this.packs[name]
  }
}