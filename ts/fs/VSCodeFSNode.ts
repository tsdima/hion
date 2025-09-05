import { FS } from './FS'
import { DataCallback, ErrorCallback, FSNode } from './FSNode'
import { API } from '../tools/api'

export class VSCodeFSNode extends FSNode {
  constructor(name: string, private contents: string) {
    super(new FS(), name);

    this.isFile = true;
    this.size = contents.length;
  }

  read(callback: DataCallback): void {
    callback(0, this.contents);
  }

  write(data: string, callback: ErrorCallback): void {
    this.contents = data;
    this.size = data.length;
    API.postMessage({type:'onsavefile',text:data});
    callback(0);
  }
}