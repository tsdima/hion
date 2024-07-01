import { UIControl } from '../../../controls/UIControl'
import { Tab } from '../../../controls/Tab'
import { FSNode } from '../../../../fs/FSNode'
import { Commander } from '../../../../tools/Commander'
import { DocumentManager } from '../DocumentManager'

export class DocumentTab extends UIControl {
  protected manager: DocumentManager;
  protected tab: Tab;
  public saved: boolean;
  public file: FSNode;

  constructor () {
    super();

    this.manager = null;
    this.tab = null;
    this.saved = true;
  }

  open(file: FSNode, asNew: boolean) { if(!asNew) this.file = file; }
  save(file: FSNode) { this.file = file; }
  init() {}
  resize() {}
  close(): boolean {
    if(this.saved || confirm("Are you sure?")) {
      this.hide();
      return true;
    }
    return false;
  }
  getTitle(): string {
    if(this.file) {
      const fName = this.file.name;
      const i = fName.indexOf(".");
      return i > 0 ? fName.substring(0, i) : fName;
    }

    return "";
  }

  updateCommands(commander: Commander) {}
  execCommand(cmd, data) {}
}