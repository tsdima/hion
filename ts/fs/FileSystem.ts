import { FS } from './FS'
import { FSNode } from './FSNode'
import { LocalFS } from './LocalFS'
import { RemoteFS } from './RemoteFS'

export function getFileNode(location: string) {
  if (location === "") {
    return null
  }

  let fs: FS
  if (location.startsWith("/local")) {
    fs = new LocalFS()
  } else {
    fs = new RemoteFS()
  }

  return new FSNode(fs, location)
}