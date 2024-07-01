import { ListCallback, ErrorCallback, DataCallback } from './FSNode'

interface LocationPath {
  name: string
  path: string
}

export class FS {
  getPath(location: string): LocationPath {
    if (location.charAt(location.length-1) === "/") {
      location = location.substring(0, location.length-1)
    }
    const i = location.lastIndexOf("/")
    return {
      path: location.substring(0, i),
      name: location.substring(i+1)
    }
  }

  private __supportError = function() { console.error("Not supported"); }

  list(dir: string, callback: ListCallback) { this.__supportError(); }
  mkdir(dir: string, callback: ErrorCallback) { this.__supportError(); }
  rmdir(dir: string, callback: ErrorCallback) { this.__supportError(); }

  remove(file: string, callback: ErrorCallback) { this.__supportError(); }
  move(fileOld: string, fileNew: string, callback: ErrorCallback) {
    this.read(fileOld, (error, data) => {
      if(error === 0) {
        this.remove(fileOld, error => {
          if(error === 0) {
            this.write(fileNew, data, error => {
              if(error === 0) {
                callback(0)
              } else {
                callback(3)
              }
            })
          } else {
            callback(2)
          }
        })
      } else {
        callback(1)
      }
    })
  }
  read(file: string, callback: DataCallback) { this.__supportError(); }
  write(file: string, data: string, callback: ErrorCallback) { this.__supportError(); }
}