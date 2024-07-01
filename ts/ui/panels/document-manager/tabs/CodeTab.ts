import { DocumentTab } from './DocumentTab'
import { Builder } from '../../../Builder'
import { FSNode } from '../../../../fs/FSNode'
import { commander } from '../../../../main'
import { Commander } from '../../../../tools/Commander'
import { displayError } from '../../../../tools/tools'
import { CodeMirrorEditor } from '../../../../spec/CodeMirror'

export class CodeTab extends DocumentTab {
  private editor: CodeMirrorEditor;

  constructor () {
    super()

    const memo = new Builder().div("doc-code");
    memo.n("textarea").style("flexGrow", 1);
    this._ctl = memo.element;
    this.saved = true;
  }

  init() {}

  open(file: FSNode, asNew: boolean) {
    super.open(file, asNew);

    let mime = null

    const mimes = [
      {ext: /.*\.(js|ts)$/i, mime: "text/javascript"},
      {ext: /.*\.(hws)$/i, mime: "text/hws"},
      {ext: /.*\.(css|scss)$/i, mime: "text/css"}
    ]
    for (const e of mimes) {
      if (file.name.match(e.ext)) {
        mime = e.mime;
        break
      }
    }

    this.editor = CodeMirror.fromTextArea(this._ctl.childNodes[0], {
      lineNumbers: true, // Нумеровать каждую строчку.
      matchBrackets: true,
      mode: mime,
      indentUnit: 4, // Длина отступа в пробелах.
      indentWithTabs: true,
      enterMode: "keep",
      tabMode: "shift"
    });
    this.editor.focus();

    let first = true
    this.editor.on("change", () => {
      if(first) {
        first = false
        return
      }
      this.saved = false
      commander.reset()
    })

    if(file) {
      this.tab.save(true);
      file.read((error, data) => {
        if(error === 0) {
          this.editor.setValue(data);
          this.tab.save(false);
        }
      });
    }

    this.tab.icon = "/img/icons/sha_pas.png";
  }

  updateCommands(commander: Commander) {
    if(!this.saved)
      commander.enabled("save");
  }

  execCommand(cmd: string) {
    switch(cmd) {
      case "save":
        this.save();
        break;
    }
  }

  save() {
    this.tab.save(true);
    this.file.write(this.editor.getValue(), (error) => {
      if(error === 0) {
        this.saved = true;
        commander.reset();
        // __editor.tab.caption = __editor.getTitle();
        // __editor.tab.title = __editor.file.location();
      } else {
        displayError({code: error})
      }
      this.tab.save(false)
    })
  }
}