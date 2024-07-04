import { UIContainer } from '../controls/UIContainer'
import { SelectManager } from '../../core/SelectManager'
import { ListBox, ListBoxItem } from '../controls/ListBox'
import { Label } from '../controls/Label'
import { Builder, BuilderElementType } from '../Builder'
import { ElementProperty } from '../../core/property'
import { UIControlOptions } from '../controls/UIControl'
import { VLayout } from '../controls/layouts/VLayout'
import { ToolBar } from '../controls/ToolBar'
import { getOptionInt, setOptionInt } from '../../tools/tools'
import { Panel } from '../controls/Panel'
import { Splitter } from '../controls/Splitter'
import { Hion } from '../../core/element'
import { translate } from '../../main'
import { PropertyEditorItem, UIPropertyEditor } from './UIPropertyEditor'
import { PointTemplate } from '../../core/pack/Pack'

  interface ListBoxItemPoint extends ListBoxItem {
    point: PointTemplate
  }

	export class PropertyEditor extends UIContainer {
		showSysProps: boolean = true;

		private currentSelectProp = null;
		private groupState = {};

		private selMan: SelectManager;

		private editor: UIPropertyEditor
		private points: ListBox<ListBoxItemPoint>
		private readonly infoBox: Label
		private panel: BuilderElementType

		onpropchange: (prop: ElementProperty) => void = () => {}
		onadveditor: (item: PropertyEditorItem) => void = () => {}

		constructor (options: UIControlOptions) {
			super()

			this._ctl = new Builder().div("props").element;

			this.setOptions(options);
			this.layout = new VLayout(this, {});

			this.editor = new UIPropertyEditor({});

			const tb = new ToolBar([
				{
					title: "",
					tag: "props",
					icon: 40,
					click: () => {
						if (tb.getButtonByTag("props").checked)
							this.visible = false;
						this.points.hide();
						this.editor.show();
						tb.getButtonByTag("props").checked = true;
						tb.getButtonByTag("events").checked = false;
					}
				},
				{
					title: "",
					tag: "events",
					icon: 48,
					click: () => {
						this.points.show();
						this.editor.hide();
						tb.getButtonByTag("events").checked = true;
						tb.getButtonByTag("props").checked = false;
					}
				}
			])
			tb.getButtonByTag("props").checked = true;
			this.add(tb);
			this.panel = new Builder(this._ctl).div("pan").div("content").element;

			this.points = new ListBox({checkboxes: true})
			this.points.hide();
			this.points.oncheck = (item) => {
				const e = this.selMan.items[0]
				if(e.findPointByName(item.point.name)) {
					e.removePoint(item.point.name);
				} else {
					e.showDefaultPoint(item.point.name);
				}
				this.onpropchange(null);
			}
			this.points.onselect = (item) => {
				const e = this.selMan.items[0]
				this.infoBox.caption = this.editor.translator.translate(e.getPointInfo(item.point));
			}
			this.panel.appendChild(this.points.getControl());

			const iPanel = new Panel({ height: getOptionInt("prop_info_height", 50) })
			iPanel.layout.setOptions({padding: 3});
			this.infoBox = new Label({});
			iPanel.add(this.infoBox);
			this.add(iPanel);

			const splitter = new Splitter({ edge: 0 })
			splitter.setManage(iPanel);
			splitter.onresize = () => setOptionInt("prop_info_height", iPanel.height);

			this.editor.oncheck = (item, checked) => {
				this.selMan.changePoint(item.name, checked);
				this.onpropchange(null);
			}
			this.editor.onchange = (item, value) => {
				if(item.type === Hion.DATA_STR || item.type === Hion.DATA_LIST) {
					item.value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
				} else {
					item.value = value;
				}
				this.selMan.setProp(item.name, item.value);
				this.selMan.each((e) => this.onpropchange(e.props[item.name] || e.sys[item.name]));
			};
			this.editor.onadveditor = (item) => this.onadveditor(item);
			this.editor.onselect = (item) => {
				this.infoBox.caption = item ? this.editor.translator.translate(item.info) : "";
			};
			this.panel.appendChild(this.editor.getControl());
		}

		edit(selMan: SelectManager) {
			this.selMan = selMan;

			this.points.clear();
			this.editor.clear();
			this.infoBox.caption = "";
			if(selMan === null || selMan.size() === 0) {
				return;
			}
			this.editor.translator = selMan.sdk.pack;

			// properties
			function getSimilarProps(sys: boolean): Array<ElementProperty> {
				const items = {}
				let init = true;
				selMan.each(function(e: Hion.SdkElement){
					const props = sys ? e.sys : e.props
					if (init) {
						for (const i in props) {
							const p = props[i]
							items[p.name] = p
						}
						init = false
					} else {
						for (const i in items) {
              const p = items[i]
							if (!props[p.name]) {
								delete items[p.name]
							}
						}
					}
				})
				const arr = []
				for (const i in items) {
					arr.push(items[i])
				}
				return arr
			}

			const e = selMan.items[0]
			const makeProp = (prop: ElementProperty) => {
				return {
					name: prop.name,
					title: prop.title || prop.name,
					value: prop.value,
					type: prop.type,
					check: prop.isPoint(),
					checked: prop.parent.findPointByName("do" + prop.name) != null,
					defvalue: prop.def,
					default: prop.isDefaultEdit(),
					list: prop.getList(),
					group: prop.group ? prop.inherit + "." + prop.group : null,
					info: prop.getInfo(),
					header: false
				} as PropertyEditorItem
			}

      let items: Array<PropertyEditorItem> = [{title: translate.translate("ui.self_props"), header: true, info: ""}]
			for (const p of getSimilarProps(false)) {
				items.push(makeProp(p))
			}
			items.push({title: translate.translate("ui.sys_props"), header: true, info: ""});
			for (const p of getSimilarProps(true)) {
				items.push(makeProp(p))
			}
			this.editor.edit(items);

			// points
			const names = ["func", "event", "var", "prop"]
			for (const pName in e.pointsEx) {
				const point = e.pointsEx[pName];
				const item = this.points.addIcon("img/icons/sc_" + names[point.type-1] + ".png", point.name);
				item.point = point
				this.points.checked(item, !!e.findPointByName(point.name))
			}
		}
	}
