import { DocumentTab } from './DocumentTab'
import { UI } from '../../../controls'
import {
  ME_MAKE_LH, ME_REMOVE_LH,
  ME_SLIDE_DOWN,
  ME_SLIDE_RIGHT,
  PopupMenuType,
  SdkEditor
} from '../../../../core/sdk-editor/sdkeditor'
import { FormEditor } from '../../FormEditor'
import {
  commander,
  fileManager,
  packMan,
  popupElement,
  popupLine,
  popupSDK,
  propEditor,
  translate,
  user
} from '../../../../main'
import { MSDK, SDK } from '../../../../core/sdk'
import { FSNode } from '../../../../fs/FSNode'
import { displayError, getOptionBool } from '../../../../tools/tools'
import { $ } from '../../../Helpers'
import { PopupMenu } from '../../../menu/PopupMenu'
import { PropertyEditorItem } from '../../UIPropertyEditor'
import { Runner } from '../../../../tools/Runner'
import { Builder } from '../../../Builder'
import { Hion } from '../../../../core/element'
import { Commander } from '../../../../tools/Commander'
import { API_BUILD_URL } from '../../../../config'
import { API } from '../../../../tools/api'

let buffer = ""
let hintLink: PopupMenu = null

export class SHATab extends DocumentTab {
  private readonly container: UI.Panel
  private readonly loader: UI.UILoader
  private readonly statusBar: UI.Panel
  private readonly address: UI.Panel
  private readonly zoom: UI.TrackBar
  public sdkEditor: SdkEditor
  private fEditor: FormEditor

  private bindFlags: number
  private runners: { [name: string]: Runner } = {}
  private runapp: Window

  constructor() {
    super()

    this.container = new UI.Panel({theme: "doc-sha"});
    this.container.layout = new UI.VLayout(this.container, {});
    this.sdkEditor = new SdkEditor();
    this.sdkEditor.hide();
    this._ctl = this.container.getControl();
    this.container.add(this.sdkEditor);
    this.loader = new UI.UILoader({size: 64, radius: 5});
    this.container.add(this.loader);

    this.statusBar = new UI.Panel({theme: "statusbar"});
    this.statusBar.hide();
    this.container.add(this.statusBar);
    this.address = new UI.Panel({theme: "panel-clear"});
    this.address.setLayoutOptions({grow: 1});
    this.statusBar.add(this.address);

    // this.statusBar.add(new Button({caption: "+", width: 20}));
    // this.statusBar.add(new Label({caption: "100%", width: 40, halign: 1}));
    // this.statusBar.add(new Button({caption: "-", width: 20}));
    this.zoom = new UI.TrackBar({min: 0, max: 5, step: 1, width: 60});
    this.zoom.position = 2;

    this.zoom.addListener("input", () => {
      this.sdkEditor.zoom(0.25 * (1 << this.zoom.position));
      commander.reset();
    });
    this.statusBar.add(this.zoom);

    this.bindFlags = 0;
  }

  getTitle(): string {
    return super.getTitle() || "Project";
  }

  private createFromData(data: string) {
    const sdk = new MSDK(packMan.getPack("webapp"))
    this.sdkEditor.edit(sdk);
    //this.sdkEditor.createNew();
    if(data) {
      this.sdkEditor.loadFromText(data, "");
    }
    this.loader.free();
    this.sdkEditor.show();
    this.statusBar.show();
    this.resize();
  }

  open(file: FSNode, asNew: boolean) {
    super.open(file, asNew);

    this.tab.load(true);
    file.read((error: number, data: string) => {
      if(error === 0) {
        this.createFromData(data);
        this.tab.load(false);
        this.tab.icon = this.sdkEditor.sdk.pack.getSmallIcon();
        commander.reset();
        this.manager._ontabopen(this);
      } else {
        displayError({code: error, info: file.location()});
      }
    });
  }

  save(file: FSNode) {
    super.save(file);

    this.saveSDKtoFile();
  }

  init() {
    this.resize();

    this.sdkEditor.onselectelement = (selMan) => {
      propEditor.edit(selMan);
      if (this.fEditor) {
        this.fEditor.update();
      }
      commander.reset();
    }
    this.sdkEditor.onstatuschange = (text) => {
      $.get("state").innerHTML = text;
    }
    this.sdkEditor.onpopupmenu = (type: PopupMenuType, x, y, obj) => {
      switch(type) {
        case PopupMenuType.POPUP_MENU_ELEMENT:
          popupElement.up(x, y);
          break;
        case PopupMenuType.POPUP_MENU_SDK:
          popupSDK.up(x, y);
          break;
        case PopupMenuType.POPUP_MENU_HINT_LINK:
          const items = []
          for (const collection of [obj.e.props, obj.e.sys]) {
            for(let p in collection) {
              let prop = collection[p];
              items.push({
                title: prop.name,
                click: () => {
                  obj.prop = prop; //obj.e.props[this.title] || obj.e.sys[this.title];
                  this.sdkEditor.draw();
                }
              })
            }
            if (collection === obj.e.props) {
              items.push({title: "-"})
            }
          }
          hintLink = new PopupMenu(items);
          hintLink.up(x, y);
          break;
        case PopupMenuType.POPUP_MENU_LINE:
          popupLine.up(x, y);
          break;
      }
    };
    this.sdkEditor.oneditprop = (prop) => propEditor.onadveditor(prop as any);
    this.sdkEditor.onsdkchange = () => {
      if (this.saved) {
        this.saved = false
        commander.reset()
      }
    }
    this.sdkEditor.onsdkselect = () => this.updateAddress()
  }

  resize() {
    this.sdkEditor.resize();
  }

  show() {
    super.show();

    this.sdkEditor.getControl().focus();
    //setTimeout(function(){console.log(__editor__.sdkEditor.getControl()); __editor__.sdkEditor.getControl().focus();}, 2);

    propEditor.onpropchange = () => {
      this.sdkEditor.draw();
      this.sdkEditor.onsdkchange();

      if(this.fEditor) {
        this.fEditor.update();
      }
    }
    const __editor__ = this
    propEditor.onadveditor = function(item: PropertyEditorItem) {
      let e = __editor__.sdkEditor.sdk.selMan.items[0];
      const prop = e.props[item.name] || e.sys[item.name];
      let customEditor = null;
      // check self editor
      if (prop.editor)
        customEditor = {name: prop.editor, path: __editor__.sdkEditor.sdk.pack.getEditorsPath()};
      // check property type editor
      if (!customEditor) {
        customEditor = __editor__.sdkEditor.sdk.pack.getPropertyEditor(item.type);
      }
      if (customEditor && customEditor.name.indexOf(":") != 0) {
        const key: string = customEditor.path + customEditor.name;
        if (!__editor__.runners[key]) {
          __editor__.runners[key] = new Runner(customEditor.path + customEditor.name);
        }
        __editor__.runners[key].run([item.name, item.value, e.props], function(data) {
          __editor__.sdkEditor.sdk.selMan.setProp(item.name, data[0]);
          __editor__.sdkEditor.onselectelement(__editor__.sdkEditor.sdk.selMan);
          propEditor.onpropchange(null);
        })
      } else {
        const dialog = new UI.Dialog({
          title: "Edit property " + item.name,
          resize: true,
          modal: true,
          destroy: true,
          buttons: [{
            text: "Save",
            click: function (dialog) {
              __editor__.sdkEditor.sdk.selMan.setProp(item.name, editor.getValue());
              dialog.close();
              __editor__.sdkEditor.onselectelement(__editor__.sdkEditor.sdk.selMan);
              propEditor.onpropchange(null);
            }
          }]
        })
        dialog.width = 700
        dialog.height = 400
        dialog.show()

        const m = new Builder(dialog.getContainer())
        let e = m.n("div").style("flexGrow", 1);
        // TODO переделать
        const editor = CodeMirror(e.element, {
          value: item.value.toString(),
          lineNumbers: getOptionBool("opt_ce_line_numbers", 1),
          lineWrapping: getOptionBool("opt_ce_line_wrapping", 0),
          matchBrackets: true,
          mode: {name: customEditor ? customEditor.name.substring(1) : ''},
          extraKeys: {"Ctrl-Space": "autocomplete"},
          indentUnit: 4, // Длина отступа в пробелах.
          indentWithTabs: true,
          enterMode: "keep",
          tabMode: "shift"
        })

        editor.focus();
      }
    }

    if (this.sdkEditor.sdk) {
      this.sdkEditor.onselectelement(this.sdkEditor.sdk.selMan)
    }
    this.resize()

    return this
  }

  hide() {
    super.hide();

    propEditor.onpropchange = () => {}
    propEditor.onadveditor = () => {}
    propEditor.edit(null)

    return this
  }

  goInto(element: Hion.SdkElement) {
    // return into root
    while (this.sdkEditor.canBack())
      this.sdkEditor.back();

    // create path from elements
    const path: Hion.SdkElement[] = []
    const sdk = element.parent
    while (element) {
      path.push(element);
      element = element.parent.parentElement;
    }

    // goto container
    for (let i = path.length-1; i >= 0; i--) {
      this.sdkEditor.sdk.selMan.select(path[i])
      commander.execCommand("forward")
    }
  }

  updateAddress() {
    let sdk = this.sdkEditor.sdk

    this.address.removeAll();

    let last = null
    while (sdk) {
      let c = sdk.parentElement ? sdk.parentElement.sys.Comment.value : "ROOT"
      if (!c) {
        c = "Container";
      }

      const l = new UI.Label({caption: c, theme: sdk !== this.sdkEditor.sdk ? "link" : ""})
      last ? this.address.insert(l, last) : this.address.add(l);
      if (sdk.parentElement) {
        this.address.insert(last = new UI.Label({width: 10, caption: "\\", halign: 1}), l);
      }

      if (sdk !== this.sdkEditor.sdk) {
        const currentSdk = sdk
        l.addListener("click", () => {
          if (this.fEditor) {
            this.formEditor()
          }
          this.sdkEditor.edit(currentSdk)
        })
      }
      sdk = sdk.parent
    }
  }

  updateCommands(commander: Commander) {
    if (this.sdkEditor.sdk) {
      commander.enabled("addelement");

      commander.enabled("saveas");
      commander.enabled("run");
      commander.enabled("selectall");
      commander.enabled("slidedown");
      commander.enabled("slideright");
      commander.enabled("makehint");
      commander.enabled("remove_lh");
      commander.enabled("capture");
      commander.enabled("sha_source");
      commander.enabled("statistic");
      commander.enabled("paste");
      commander.enabled("linecolor");

      if (this.sdkEditor.canFormEdit()) {
        commander.enabled("formedit");
        if (this.fEditor) {
          commander.checked("formedit");
        }
      }

      if(this.file && this.file.path.startsWith("/home")) {
        if (user.plan.share == 1)
          commander.enabled("share")
        if (user.plan.history == 1)
          commander.enabled("history")
        if (user.plan.catalog == 1)
          commander.enabled("addcatalog")
      }

      if (this.sdkEditor.canZoomIn()) commander.enabled("zoomin");
      if (this.sdkEditor.canZoomOut()) commander.enabled("zoomout");

      if (this.sdkEditor.canUndo()) commander.enabled("undo");
      if (this.sdkEditor.canRedo()) commander.enabled("redo");

      if (!this.saved) commander.enabled("save");
      if (this.sdkEditor.canBringToFront()) commander.enabled("bringtofront");
      if (this.sdkEditor.canSendToBack()) commander.enabled("sendtoback");

      if (!this.sdkEditor.sdk.selMan.isEmpty()) commander.enabled("moveto");

      if (this.fEditor) {
        commander.enabled("bind_rect");
        if (this.bindFlags & 0x1)
          commander.checked("bind_rect");
        commander.enabled("bind_center");
        if (this.bindFlags & 0x2)
          commander.checked("bind_center");
        commander.enabled("bind_padding");
        if (this.bindFlags & 0x4)
          commander.checked("bind_padding");
      }

      if (this.sdkEditor.sdk.pack.getSelectedMake()) {
        commander.enabled("build");
        commander.enabled("make");
      }
    }

    if (this.sdkEditor.sdk && !this.sdkEditor.sdk.selMan.isEmpty()) {
      commander.enabled("cut");
      commander.enabled("copy");
      commander.enabled("delete");
      if (this.sdkEditor.sdk.selMan.size() == 1) {
        commander.enabled("comment");
        commander.enabled("copy_link");
      }
      commander.enabled("sha_pas");
    }

    if (this.sdkEditor.canBack()) {
      commander.enabled("back");
    }
    if (this.sdkEditor.canForward()) {
      commander.enabled("forward");
    }
  }

  private saveSDKtoFile() {
    this.tab.save(true);
    this.file.write(this.sdkEditor.getMainSDK().save(false), (error) => {
      if (error === 0) {
        this.saved = true;
        commander.reset();
        this.tab.caption = this.getTitle();
        this.tab.title = this.file.location();
      } else {
        displayError({code: error})
        if (error == 6) {
          new Runner("plan").run()
        }
      }
      this.tab.save(false)
    })
  }

  formEditor() {
    if(this.fEditor) {
      this.fEditor.edit(null);
      this.fEditor = null;
      this.sdkEditor.show();
      this.resize();
    } else {
      this.fEditor = new FormEditor(this.sdkEditor);
      this.fEditor.setBindFlags(this.bindFlags);
      const ctl = this.fEditor.edit(this.sdkEditor.sdk);
      if(ctl) {
        this.sdkEditor.hide();
        this.container.insert(ctl, this.container.get(1));
        this.fEditor.update();
      }
    }
    commander.reset();
  }

  showStatistic() {
    const stat: Array<[string, number]> = [
      [translate.translate("ui.statecount"), 0],
      [translate.translate("ui.statincursdk"), 0],
      [translate.translate("ui.statsdknum"), 0],
      [translate.translate("ui.statintel"), 0],
      [translate.translate("ui.statlinkednum"), 0],
      [translate.translate("ui.statlinkedpoints"), 0]
    ];

    const fill = (sdk: SDK) => {
      if (sdk) {
        stat[0][1] += sdk.imgs.length;
        for (let e of sdk.imgs) {
          if (e instanceof Hion.ITElement || e instanceof Hion.HubsEx || e instanceof Hion.Debug) {
            stat[3][1]++;
          }
          if (e.isLink() && !e.isMainLink()) {
            stat[4][1]++;
          }
          for (const p in e.points) {
            if (!e.points[p].isFree()) {
              stat[5][1] ++;
            }
          }
          if (e.sdk) {
            stat[2][1] ++;
            fill(e.sdk);
          }
        }
      }
    }

    stat[1][1] = this.sdkEditor.sdk.imgs.length
    fill(this.sdkEditor.getMainSDK())

    new Runner("statistic").run(stat)
  }

  moveto() {
    const list: Array<[string, string, string]> = []
    for (const e in this.sdkEditor.sdk.pack.elements) {
      const element = this.sdkEditor.sdk.pack.elements[e]
      if (element.class == "MultiElement" || element.class == "MultiElementEx") {
        list.push([this.sdkEditor.sdk.pack.getRoot() + "/icons/" + e + ".ico", e, this.sdkEditor.sdk.pack.translate("el." + e)])
      }
    }

    new Runner("movein", (data: Array<string[]>) => {
      const cont = data[0][1]
      let rect = this.sdkEditor.sdk.selMan.getRect()
      const saved = this.sdkEditor.sdk.save(true)
      const links = [{count:0, points:{}}, {count:0, points:{}}, {count:0, points:{}}, {count:0, points:{}}];

      this.sdkEditor.sdk.selMan.each(item => {
        for (const p in item.points) {
          const point = item.points[p]
          if (!point.isFree() && !point.point.parent.isSelect()) {
            const lnk = links[point.type-1]
            let pn = point.name
            if (lnk.points[pn]) {
              pn += lnk.count
            }
            lnk.points[pn] = {point: point.point, id: point.parent.eid, name: point.name}
            lnk.count ++
          }
        }
      })

      this.sdkEditor.deleteSelected()
      const e = this.sdkEditor.addElement(cont, (rect.x1 + rect.x2 - 32)/2, (rect.y1 + rect.y2 - 32)/2)
      const size = e.sdk.imgs.length
      e.sdk.load(saved);
      e.sdk.selMan.selectAll();
      if (size) {
        e.sdk.selMan.unselect(e.sdk.imgs[0])
      }
      rect = e.sdk.selMan.getRect();
      e.sdk.selMan.move(-rect.x1 + Hion.POINT_SPACE*5, -rect.y1 + Hion.POINT_SPACE*5);
      e.sdk.selMan.clear();

      const arr = {WorkCount: 0, EventCount: 1, VarCount: 2, DataCount: 3}
      for (const p in arr) {
        if (e.sdk.imgs[0].props[p].type === 1) {
          e.sdk.imgs[0].props[p].value = links[arr[p]].count
        } else {
          let val = ""
          for (const i in links[arr[p]].points) {
            val += i + "\n"
          }
          e.sdk.imgs[0].props[p].value = val
        }
        e.sdk.imgs[0].onpropchange(e.sdk.imgs[0].props[p])

        for (const i in links[arr[p]].points) {
          const point = links[arr[p]].points[i]
          const newe = e.sdk.findElementById(point.id)
          const newp = newe.findPointByName(point.name)
          newp.connect(e.sdk.imgs[0].getFirstFreePoint(newp.getPair())).createPath()

          point.point.clear()
          point.point.connect(e.getFirstFreePoint(point.point.getPair())).createPath()
        }
      }

      this.sdkEditor.draw()
    }).run(list)
  }

  build(mode: string, callback?:() => void) {
    if(user.plan.builds <= user.plan.totalbuilds) {
      new Runner("plan").run()
      return;
    }

    this.manager.state.set("Build...")
    const state = this.manager.state
    const name = this.file ? this.file.name : "Project.sha"
    this.sdkEditor.build();
    API.post(API_BUILD_URL, {
        build: name,
        mode: mode,
        code: this.sdkEditor.getMainSDK().save(false)
      },
      function(data: string) {
        state.clear();
        if (this.status === 200) {
          for (const line of data.split("\n")) {
            if (line.startsWith("CODEGEN")) {
              const text = line.substring(9)
              let color = ""
              if (text.startsWith("~")) {
                color = "gray";
              } else if(text.startsWith("@")) {
                color = "silver";
              } else if(text.startsWith("!")) {
                color = "red";
              } else if(text.startsWith("#")) {
                color = "blue";
              }
              state.add(text.substring(1), color)
            } else {
              state.add(line);
            }
          }
          if (callback) {
            callback()
          }
        } else {
          state.add(this.statusText, "red")
        }
      },
      // name.substring(0, name.length - 4)
    )
  }

  run() {
    const run = this.sdkEditor.sdk.pack.run
    if (run.mode == "internal") {
      this.sdkEditor.run()
    } else if(run.mode == "url") {
      const url = run.url
        .replace("%uid%", user.uid.toString())
        .replace("%pname%", this.getTitle().toLowerCase())

      this.build(this.sdkEditor.sdk.pack.getSelectedMake(), () => {
        if (!this.runapp || this.runapp.closed) {
          this.runapp = window.open(window.location.origin + url + "?b=" + this.sdkEditor.getBuild())
        } else {
          this.runapp.location.href = window.location.origin + url + "?b=" + this.sdkEditor.getBuild()
        }
      })
    }
  }

  setLineColor() {
    new Runner("coloreditor", (data: string[]) => {
      this.sdkEditor.setLineColor(data[0])
    }).run(this.sdkEditor.pasteObj.point.getColor())
  }

  setLineInfo() {
    const info = this.sdkEditor.pasteObj.point.getInfo()
    new Runner("lineinfo", (data: any[]) => {
      this.sdkEditor.setLineInfo({text: data[0], direction: data[1]})
    }).run([info.text, info.direction])
  }

  loadFromHistory() {
    new Runner("history", (data: string[]) => {
      this.manager.open("/history/" + data[0], this.file.name + "(rev: " + data[0] + ")");
    }).run([this.file.location()]);
  }

  execCommand(cmd: string, data: any) {
    switch(cmd) {
      case "addelement":
        this.sdkEditor.beginAddElement(data);
        if (this.fEditor) {
          this.fEditor.beginAddElement(data, this.sdkEditor.cursorNormal);
          this.sdkEditor.endOperation();
        }
        break

      case "run":
        this.run();
        if (this.file && !this.saved && getOptionBool("opt_save_edit", 0)) {
          this.saveSDKtoFile();
        }
        break;
      case "save":
        if (this.file) {
          this.saveSDKtoFile();
        } else {
          commander.execCommand("saveas");
        }
        break;
      case "saveas":
        fileManager.save(this.file ? this.file.location() : "Project.sha")
        break;

      case "back":
        if (this.fEditor) {
          this.formEditor();
        }
        window.history.back();
        commander.reset();
        break;
      case "forward":
        this.sdkEditor.forward()
        commander.reset()
        break;

      case "formedit":
        this.formEditor()
        break

      case "delete":
        this.sdkEditor.deleteSelected()
        break;
      case "copy":
        buffer = this.sdkEditor.sdk.save(true)
        if (data) {
          data.setData('text/plain', buffer)
        }
        commander.reset()
        break;
      case "copy_link":
        buffer = this.sdkEditor.sdk.saveLink()
        if (data) {
          data.setData('text/plain', buffer)
        }
        commander.reset();
        break
      case "paste":
        const text = data ? data.getData("text/plain") : buffer
        if (text.substring(0, 4) == "Make" || text.substring(0, 4) == "Add(") {
          this.sdkEditor.pasteFromText(text)
        }
        break;

      case "comment": this.sdkEditor.oneditprop(this.sdkEditor.sdk.selMan.items[0].sys["Comment"]); break;

      case "slidedown": this.sdkEditor.beginOperation(ME_SLIDE_DOWN); break;
      case "slideright": this.sdkEditor.beginOperation(ME_SLIDE_RIGHT); break;
      case "selectall": this.sdkEditor.selectAll(); break;

      case "bringtofront": this.sdkEditor.bringToFront(); commander.reset(); break;
      case "sendtoback": this.sdkEditor.sendToBack(); commander.reset(); break;

      case "makehint": this.sdkEditor.beginOperation(ME_MAKE_LH); break;
      case "remove_lh": this.sdkEditor.beginOperation(ME_REMOVE_LH); break;

      case "zoomin": this.sdkEditor.zoomIn(); this.zoom.position++; commander.reset(); break;
      case "zoomout": this.sdkEditor.zoomOut(); this.zoom.position--; commander.reset(); break;

      case "capture": this.sdkEditor.saveAsPNG(); break;
      case "sha_source": this.sdkEditor.download(this.file ? this.file.location() : "Project.sha"); break;

      case "paste_debug": this.sdkEditor.pasteLineElement("Debug"); break;
      case "paste_dodata": this.sdkEditor.pasteLineElement("DoData"); break;
      case "paste_hub": this.sdkEditor.pasteLineElement("Hub"); break;

      case "linecolor": this.setLineColor(); break;
      case "lineinfo": this.setLineInfo(); break;

      case "share": new Runner("share", function(){}).run([this.file.location(), 0]); break;
      case "addcatalog": new Runner("catalog", function(){}).run(this.file.location()); break;

      case "undo": this.sdkEditor.undo(); commander.reset(); break;
      case "redo": this.sdkEditor.redo(); commander.reset(); break;

      case "statistic": this.showStatistic(); break;

      case "build": this.build(this.sdkEditor.sdk.pack.getSelectedMake()); break;
      case "make": this.sdkEditor.sdk.pack.selectMake(data); commander.reset(); break;

      case "moveto": this.moveto(); break;

      case "bind_rect": this.bindFlags ^= 0x1; this.fEditor.setBindFlags(this.bindFlags); commander.reset(); break;
      case "bind_center": this.bindFlags ^= 0x2; this.fEditor.setBindFlags(this.bindFlags); commander.reset(); break;
      case "bind_padding": this.bindFlags ^= 0x4; this.fEditor.setBindFlags(this.bindFlags); commander.reset(); break;

      case "history": this.loadFromHistory(); break;

      case "sha_pas": this.manager.open(this.sdkEditor.sdk.pack.getCodeFilename(this.sdkEditor.sdk.selMan.items[0].name), ""); break;

      default:
        super.execCommand(cmd, data);
    }
  }
}