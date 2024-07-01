import { FS } from './FS'

export type ErrorCallback = (error: number) => void
export type ListCallback = (error: number, nodes: FSNode[]) => void
export type DataCallback = (error: number, data?: string) => void

export class FSNode {
  isFile: boolean
  name: string
  date: string
  path: string
  mime: string
  size: number

  constructor(public fs: FS, location?: string) {
    if (location) {
      const p = fs.getPath(location)
      this.name = p.name
      this.path = p.path
    } else {
      this.name = ""
      this.path = ""
    }
    this.mime = ""
    this.size = 0
    this.isFile = false
  }

  location(): string {
    return this.path + "/" + this.name
  }

  read(callback: DataCallback) {
    this.fs.read(this.location(), callback)
  }

  readArray(callback: DataCallback) {
    this.read(callback)
  }

  write(data: string, callback: ErrorCallback) {
    this.fs.write(this.location(), data, callback)
  }

  remove(callback: ErrorCallback) {
    this.fs.remove(this.location(), callback)
  }

  list(callback: ListCallback) {
    this.fs.list(this.location(), callback)
  }

  mkdir(callback: ErrorCallback) {
    this.fs.mkdir(this.location(), callback)
  }

  sizeDisplay() {
    if(this.size < 1024) {
      return this.size.toString()
    }
    if(this.size < 1024*1024) {
      return Math.floor(this.size / 1024 * 10)/10 + "Kb"
    }
    if(this.size < 1024*1024*1024) {
      return Math.floor(this.size / (1024*1024) * 10)/10 + "Mb"
    }
    return Math.floor(this.size / (1024*1024*1024) * 10)/10 + "Gb"
  }
}