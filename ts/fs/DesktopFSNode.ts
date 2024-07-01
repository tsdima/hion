import { DataCallback, FSNode } from './FSNode'

export class DesktopFSNode extends FSNode {
  constructor(private readonly desktopFile: File) {
    super(null);

    this.isFile = true;
    this.name = desktopFile.name
    this.size = desktopFile.size
    this.mime = desktopFile.type
    this.desktopFile = desktopFile
  }

  read(callback: DataCallback) {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      callback(0, e.target.result)
    }
    reader.readAsText(this.desktopFile)
  }

  readArray(callback: DataCallback) {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      callback(0, e.target.result)
    }
    reader.readAsArrayBuffer(this.desktopFile)
  }
}