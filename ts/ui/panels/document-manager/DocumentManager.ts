import { DocumentTab } from './tabs/DocumentTab'
import { UIContainer } from '../../controls/UIContainer'
import { TabControl } from '../../controls/TabControl'
import { Tab } from '../../controls/Tab'
import { ShaGraph } from './ShaGraph'
import { Splitter } from '../../controls/Splitter'
import { StatePanel } from './StatePanel'
import { UIControlOptions } from '../../controls/UIControl'
import { Builder } from '../../Builder'
import { VLayout } from '../../controls/layouts/VLayout'
import { getOption, getOptionBool, getOptionInt, setOption, setOptionInt } from '../../../tools/tools'
import { commander, packMan } from '../../../main'
import { DesktopFSNode } from '../../../fs/DesktopFSNode'
import { FSNode } from '../../../fs/FSNode'
import { SHATab } from './tabs/SHATab'
import { OggTab } from './tabs/OggTab'
import { CodeTab } from './tabs/CodeTab'
import { ImageTab } from './tabs/ImageTab'
import { getFileNode } from '../../../fs/FileSystem'
import { Runner } from '../../../tools/Runner'
import { Commander } from '../../../tools/Commander'
import { StartupTab } from './tabs/StartupTab'
import { API } from '../../../tools/api'

const extMap = [
  { ext: /.*\.sha$/i, tab: SHATab },
  { ext: /.*\.(txt|js|hws|sql|php|ini|html|css|scss|json)$/i, tab: CodeTab },
  { ext: /.*\.ogg$/i, tab: OggTab },
  { ext: /.*\.(png|jpg|ico|gif|jpeg|bmp)$/i, tab: ImageTab }
]

interface ContentTab extends Tab {
  content: DocumentTab
}

export class DocumentManager extends UIContainer {

  private readonly tabs: TabControl;
  private currentTab: DocumentTab;
  private readonly startup: StartupTab;
  private readonly graph: ShaGraph;
  private splitter: Splitter;
  private readonly splitter2: Splitter;
  public state: StatePanel;
  ontabselect: (tab: DocumentTab) => void = () => {}
  ontabopen: (tab: DocumentTab) => void = () => {}

  constructor (options: UIControlOptions) {
    super();

    this._ctl = new Builder().div("docmanager").element;

    this.setOptions(options);
    this.layout = new VLayout(this, {});

    this.tabs = new TabControl({});
    this.add(this.tabs);
    this.tabs.onclose = (tab: ContentTab) => {
      if (tab.content.close()) {
        this.remove(tab.content);
        return true;
      }

      return false;
    };
    this.tabs.onselect = (tab: ContentTab) => {
      this.currentTab.hide();
      this.currentTab = tab ? tab.content : this.startup;
      if(this.currentTab) {
        this.currentTab.show();
        commander.reset();
        if(this.graph.visible === true)
          this.showGraph(true);
      }

      this.saveOpenTabs();
      this.ontabselect(tab ? tab.content : null);
    };

    this.graph = new ShaGraph({height: getOptionInt("prop_graph_height", 140)});
    this.add(this.graph);
    this.splitter2 = new Splitter({edge: 0});
    this.splitter2.setManage(this.graph);
    this.splitter2.onresize = () => setOptionInt("prop_graph_height", this.graph.height);
    this.graph.visible = this.splitter2.visible = false;

    this.state = new StatePanel({height: getOptionInt("prop_state_height", 140)});
    this.add(this.state);
    this.splitter = new Splitter({edge: 0});
    this.splitter.setManage(this.state);
    this.splitter.onresize = () => setOptionInt("prop_state_height", this.state.height);
    this.state.visible = this.splitter.visible = false;

    this.startup = new StartupTab();
    this._showTab(this.startup);

    document.body['onbeforeunload'] = () => {
      let saved = true;
      this.tabs.each(function(tab: ContentTab){
        if(tab.content) {
          saved = saved && tab.content.saved;
        }
      });

      return saved ? null : 'Your most recent changes have not been saved. If you leave before saving, your changes will be lost.';
    };

    window.addEventListener("resize", () => this.resize());

    document.addEventListener("paste", function(e: ClipboardEvent) {
      if((!document.activeElement || document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {
        commander.execCommand("paste", e.clipboardData);
        e.preventDefault();
        return false;
      }
      return true;
    });
    document.addEventListener("copy", function(e: ClipboardEvent) {
      if((!document.activeElement || document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {
        commander.execCommand("copy", e.clipboardData);
        e.preventDefault();
        return false;
      }
      return true;
    });
    document.addEventListener("cut", function(e: ClipboardEvent) {
      if((!document.activeElement || document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {
        commander.execCommand("copy", e.clipboardData);
        commander.execCommand("delete");
        e.preventDefault();
        return false;
      }
      return true;
    });

    // drop files
    this.getControl().ondrop = (event) => {
      event.preventDefault();
      for(let i = 0; i < event.dataTransfer.files.length; i++) {
        this.openFile(new DesktopFSNode(event.dataTransfer.files[i]), "")
      }

      this.getControl().removeAttribute("drop")
      return false
    }
    this.getControl().ondragover = () =>{
      this.getControl().setAttribute("drop", "")
      return false;
    }
    this.getControl().ondragleave = () =>{
      this.getControl().removeAttribute("drop")
      return false;
    }
  }

  _ontabopen(tab: DocumentTab) {
    if(this.currentTab == tab)
      this.ontabopen(tab);
  }

  private _showTab(tab: DocumentTab) {
    this.currentTab = tab;
    this.insert(tab, this.splitter2);
  }

  openByType(Class: any, file: FSNode, title: string, asNew: boolean) {
    if(file && !asNew) {
      console.log("Open: ", file.location());
    }

    const content = new Class(file)
    content.manager = this;
    const tab = this.tabs.addTab("", "") as ContentTab
    tab.content = content;
    content.tab = tab;
    this._showTab(tab.content);
    tab.content.init();
    tab.content.open(file, asNew);
    tab.content.show();
    tab.title = file ? file.location() : "";
    tab.caption = title || content.getTitle();

    this.ontabselect(content);

    commander.reset();
    this.saveOpenTabs();
  }

  openFile(file: FSNode, title: string) {
    // tab is already open?
    let fTab: ContentTab = null
    this.tabs.each(function(tab: ContentTab){
      if(tab.content?.file?.location() == file.location()) {
        fTab = tab
      }
    })

    if(fTab) {
      fTab.content.open(file, false);
    } else {
      for (const obj of extMap) {
        if (file.name.match(obj.ext)) {
          this.openByType(obj.tab, file, title, false);
          return;
        }
      }

      this.openByType(SHATab, file, title, false);
    }
  }

  open(fileName: string, title: string) {
    // tab is already open?
    let fTab = null
    this.tabs.each(function(tab: ContentTab){
      if(tab.content && tab.content.file && tab.content.file.location() == fileName) {
        fTab = tab
      }
    })

    if(fTab) {
      this.tabs.select(fTab);
    } else {
      this.openFile(getFileNode(fileName), title)
    }
  }

  save(file: string) {
    this.currentTab.save(getFileNode(file));
  }

  resize() {
    this.tabs.each(function(tab: ContentTab) {
      tab.content.resize()
    })
  }

  execCommand(cmd: string, data) {
    this.currentTab.execCommand(cmd, data);

    switch(cmd) {
      case "new": this.openNew(); break;
      case "output": this.showState(!this.state.visible); break;
      case "build": if(!this.state.visible) this.showState(true); break;
      case "showgraph": this.showGraph(!this.graph.visible); break;
    }
  }

  updateCommands(commander: Commander) {
    commander.enabled("output");
    commander.enabled("showgraph");
    if(this.graph.visible)
      commander.checked("showgraph");
    if(this.state.visible)
      commander.checked("output");

    this.currentTab.updateCommands(commander);
  }

  openNew() {
    const args = []
    for (const packName in packMan.packs) {
      const pack = packMan.packs[packName]
      if(pack.projects.length) {
        const proj = []
        for (const p of pack.projects) {
          proj.push({entry: p, info: pack.translate("el." + p)})
        }
        args.push({
          name: packName,
          title: pack.title,
          info: pack.translate("pack.info." + packName),
          projects: proj
        });
      }
    }
    new Runner("new", (data: string[]) => {
      API.postMessage({type:'new', pack:data[0], item:data[1]});
    }).run(args);
  }

  saveOpenTabs() {
    /*if(getOptionBool("opt_save_tabs", 1)) {
      const openFiles = []
      this.tabs.each(function(tab: ContentTab){
        if (tab.content && tab.content.file) {
          openFiles.push(tab.content.file.location());
        }
      })
      setOption('opentabs', JSON.stringify(openFiles))
    }*/
  }

  init() {
    /*if(getOptionBool("opt_save_tabs", 1)) {
      const data = getOption('opentabs', '')
      if (data) {
        const openFiles = JSON.parse(data)
        for (const file of openFiles) {
          this.open(file, "")
        }
      }
    } else {
      if (getOptionBool("opt_new_project", 0)) {
        commander.execCommand("new")
      }
    }*/
  }

  showState(value) {
    this.state.visible = value;
    this.splitter.visible = value;
    commander.reset();
  }

  showGraph(value) {
    if(value && this.currentTab instanceof SHATab) {
      this.graph.parse((this.currentTab as SHATab).sdkEditor.getMainSDK());
      this.graph.sdkTab = this.currentTab as SHATab;
    }
    else
      this.graph.clear();
    this.graph.visible = value;
    this.splitter2.visible = value;
    commander.reset();
  }
}