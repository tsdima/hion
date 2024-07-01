import { FS } from './FS'
import { FSNode, ListCallback, ErrorCallback, DataCallback } from './FSNode'
import { API_FS_URL } from '../config'
import { API } from '../tools/api'

export class RemoteFS extends FS {

  private _loadList(folder: string, data: string): FSNode[] {
    const nodes = []
    const files = JSON.parse(data)
    for (const file of files) {
      const node = new FSNode(this)
      node.name = file.name
      node.isFile = file.folder === 0
      node.path = folder
      node.size = file.size
      node.date = file.date
      nodes.push(node)
    }
    return nodes
  }

  list(dir: string, callback: ListCallback) {
    API.get(API_FS_URL + "?dir=" + dir, (data: string) => {
      callback(0, this._loadList(dir, data))
    })
  }

  mkdir(dir: string, callback: ErrorCallback) {
    API.post(API_FS_URL, {mkdir: dir}, (data: string) => {
      if(data) {
        const error = JSON.parse(data)
        callback(error.code)
      } else {
        callback(0)
      }
    })
  }

  rmdir(dir: string, callback: ErrorCallback) {
    API.post(API_FS_URL, { rm: dir }, (data: string) =>{
      if (data) {
        const error = JSON.parse(data)
        callback(error.code)
      } else {
        callback(0)
      }
    })
  }

  remove(file: string, callback: ErrorCallback) {
    this.rmdir(file, callback)
  }

  read(file: string, callback: DataCallback) {
    API.post(API_FS_URL, {name: file, load: true}, function (data: string) {
      if(this.status == 200) {
        callback(0, data)
      } else {
        const error = JSON.parse(data)
        callback(error.code)
      }
    })
  }

  write(file: string, data: string, callback: ErrorCallback) {
    API.post(API_FS_URL, {name: file, sha: data, save: true}, function(data: string){
      if(data) {
        const error = JSON.parse(data)
        callback(error.code)
      } else {
        callback(0)
      }
    })
  }
}