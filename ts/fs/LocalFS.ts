import { FS } from './FS'
import { FSNode, ListCallback, ErrorCallback, DataCallback } from './FSNode'

export class LocalFS extends FS {

  private __getKey(dir: string) {
    return dir.replace(/\//g, "_");
  }

  private _loadList(folder: string, data: string): Array<FSNode> {
    const nodes = []
    const lines = JSON.parse(data)
    for (const i in lines) {
      const node = new FSNode(this)
      node.name = i
      node.isFile = lines[i] == 0
      node.path = folder
      node.size = 0
      node.date = ""
      nodes.push(node)
      node.read(function(error, data){
        if (error === 0) {
          node.size = data.length
        }
      })
    }
    return nodes;
  }

  list(dir: string, callback: ListCallback) {
    const key = this.__getKey(dir)
    if (window.localStorage[key]) {
      callback(0, this._loadList(dir, window.localStorage[key]))
    }
  }

  mkdir(dir: string, callback: ErrorCallback) {
    const node = this.getPath(dir)
    const key = this.__getKey(node.path)
    const list = window.localStorage[key] ? JSON.parse(window.localStorage[key]) : {}
    list[node.name] = 1
    window.localStorage[key] = JSON.stringify(list)
    callback(0)
  }

  rmdir(dir: string, callback: ErrorCallback) {
    const node = this.getPath(dir)
    const key1 = this.__getKey(dir)
    if (!window.localStorage[key1] || window.localStorage[key1] === "{}") {
      const key2 = this.__getKey(node.path)

      if (window.localStorage[key2]) {
        const list = JSON.parse(window.localStorage[key2])
        delete list[node.name]
        window.localStorage[key2] = JSON.stringify(list)
        callback(0)
      } else {
        callback(2)
      }
    } else {
      callback(1)
    }
  }

  remove(file: string, callback: ErrorCallback) {
    const node = this.getPath(file)
    let key = this.__getKey(node.path)
    const folder = window.localStorage[key]
    if (folder) {
      const list = JSON.parse(window.localStorage[key])
      delete list[node.name]
      window.localStorage[key] = JSON.stringify(list)
      key = this.__getKey(file)
      delete window.localStorage[key]
      callback(0)
    } else {
      callback(1)
    }
  }

  read(file: string, callback: DataCallback) {
    const key = this.__getKey(file)
    const data = window.localStorage[key]
    if(data) {
      callback(0, data)
    } else {
      callback(1)
    }
  }

  write(file: string, data: string, callback: ErrorCallback) {
    const node = this.getPath(file)
    const key1 = this.__getKey(node.path)
    let fList = window.localStorage[key1] || "{}"

    const list = JSON.parse(fList)
    if(!list[node.name]) {
      list[node.name] = 0
      window.localStorage[key1] = JSON.stringify(list)
    }
    const key2 = this.__getKey(file)
    window.localStorage[key2] = data
    callback(0)
  }
}