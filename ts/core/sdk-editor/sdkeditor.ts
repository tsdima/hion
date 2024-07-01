import { UIControl } from '../../ui/controls/UIControl'
import { MouseOperation, MouseOperationData } from './operations/MouseOperation'
import { LineInfo, Point, PointPosition } from '../point'
import { GetPos, toStep } from '../../tools/tools'
import { Builder } from '../../ui/Builder'
import {
  FLAG_USE_RUN, MSDK,
  OBJ_TYPE_ELEMENT,
  OBJ_TYPE_HINT,
  OBJ_TYPE_POINT,
  SDK,
  SDK_PARSE_FILE,
  SDK_PARSE_PASTE
} from '../sdk'
import { Hint } from '../../ui/overlay/Hint'
import { ElementProperty } from '../property'
import { SelectManager } from '../SelectManager'
import { UndoManager } from '../UndoManager'
import { Hion } from '../element'
import { makeHandlers } from './operations/Handlers'

export const ME_NONE       			= 0;  // no operation
	export const ME_ELEMENT				= 1;  // move element
	export const ME_POINTLINK			= 2;  // link two points
	export const ME_ADDELEMENT			= 3;  // create new element
	export const ME_SELRECT				= 4;  // select elements
	export const ME_LINEPOINT			= 5;  // move point of line
	export const ME_SLIDE_DOWN			= 6;  // select elements after horizont line
	export const ME_SLIDE_RIGHT			= 7;  // select elements after horizont line
	export const ME_ELEMENT_MOUSE		= 8;  // handle by element
	export const ME_MAKE_LH				= 9;  // make link hint
	export const ME_REMOVE_LH			= 10; // remove link hint
	export const ME_MOVE_LH				= 11; // move link hint
	export const ME_ADDELEMENT_POINT	= 12; // add new element and link with point
	export const ME_POPUP_MENU			= 13; // show popup menu
	export const ME_SCROLL_EDITOR		= 14; // change scroll bars positions
	export const ME_SCALE_EDITOR		= 15; // change editor scale factor

	export const enum PopupMenuType {
		POPUP_MENU_ELEMENT,
		POPUP_MENU_SDK,
		POPUP_MENU_HINT_LINK,
		POPUP_MENU_LINE
	}

	interface MouseState {
		obj: any
		sobj: any
	}
	interface PasteObject {
		point: Point;
		obj: PointPosition;
	}

	//***************************************************************************

	export class SdkEditor extends UIControl {

		private canvas: Builder<HTMLCanvasElement>
		sdk: SDK;
		scale: number;
		private hint: Hint;
		emouse: MouseState;
		private oldSelection: any;
		public pasteObj: PasteObject;

		private old_cursor: string;
		private readonly ctx: CanvasRenderingContext2D;

		mouseHandlers: Array<MouseOperation>;
		private mouseOperationIndex: number;
		private mouseOperation: MouseOperation;
		private scaleFactor: number = 1;

		public cursorNormal: string;
		public cursorLine: string;
		public cursorPoint: string;

		pasteX = 0;
		pasteY = 0;

		// events ------------------------------------------------------------------
		onstatuschange = (text) => {};
		onpopupmenu = (type, x, y, obj) => {};
		oneditprop = (prop: ElementProperty) => {};
		onselectelement = (selMan: SelectManager) => {};
		onsdkchange = () => {};
		onsdkselect = () => {};

		constructor () {
			super();

			const c = new Builder().div("canvas")
			this._ctl = c.element;
			this.canvas = c.div("scrollbox").n("canvas");

			this.sdk = null;
			this.old_cursor = "";
			this.oldSelection = null;
			this.scale = 1;

			this.emouse = { obj: null, sobj: null };

			this.ctx = this.canvas.element.getContext('2d');

			this.initHandlers();

			this.hint = new Hint();

			this.mouseHandlers = makeHandlers(this)
			this.beginOperation(ME_NONE);

			window.addEventListener('popstate', (e) => {
				if(e.state && e.state.eid) {
					const element = this.sdk.findElementById(e.state.eid);
					if(element) {
						this.sdk.selMan.select(element);
						this.draw();
						this.forward();
					} else {
						this.back();
					}
				} else {
					this.back();
				}
			}, false);
		}

		private initHandlers() {
			this.canvas.on("oncontextmenu", (e: Event) => { e.preventDefault(); return false; })
			this.canvas.on("ontouchstart", (event: TouchEvent) => {
				event.preventDefault();
				const p1 = GetPos(this.canvas.element)
				const x = event.touches[0].clientX - p1.left - document.body.scrollLeft
				const y = event.touches[0].clientY - p1.top - document.body.scrollTop
				// move editor if two finger detected
				if (event.touches.length >= 2) {
					const dx = event.touches[0].clientX - event.touches[1].clientX
					const dy = event.touches[0].clientY - event.touches[1].clientY
					this.scaleFactor = Math.sqrt(dx*dx + dy*dy);
					this.beginOperation(ME_SCALE_EDITOR, null);
				}
				event.preventDefault();

				return this.onmousedown({layerX: x, layerY: y, button: 0} as MouseEvent);
			})
			this.canvas.on("ontouchmove", (event: TouchEvent) => {
				event.preventDefault();
				const p1 = GetPos(this.canvas.element)
				const x = event.touches[0].clientX - p1.left - document.body.scrollLeft
				const y = event.touches[0].clientY - p1.top - document.body.scrollTop
				// scale editor if two finger detected
				if (event.touches.length >= 2) {
					const dx = event.touches[0].clientX - event.touches[1].clientX
					const dy = event.touches[0].clientY - event.touches[1].clientY
					const scaleFactor = Math.sqrt(dx*dx + dy*dy)
					const ds = (scaleFactor - this.scaleFactor)/200
					const step = 0.0001
					if (ds > step && this.scale < 4 || ds < -step && this.scale > 0.2) {
						let newScale = this.scale + ds;
						if (Math.abs(1 - newScale) < step)
							newScale = 1;
						this.scaleFactor = scaleFactor;
						this.zoom(newScale);
					}
				}

				this.onmousemove({layerX: x, layerY: y, button: 0} as MouseEvent);
			});
			this.canvas.on("ontouchend", (event: TouchEvent) => {
				event.preventDefault();
				const p1 = GetPos(this.canvas.element)
				const x = event.changedTouches[0].clientX - p1.left
				const y = event.changedTouches[0].clientY - p1.top
				this.onmouseup({layerX: x, layerY: y, button: 0} as MouseEvent)
			})

			this.canvas.on("onmousedown", (e: MouseEvent) => this.onmousedown(e));
			this.canvas.on("onmousemove", (e: MouseEvent) => this.onmousemove(e));
			this.canvas.on("onmouseup", (e: MouseEvent) => this.onmouseup(e));
			this.canvas.on("ondblclick", () => this.ondblclick());
		}

		private isObjEqual(obj1, obj2) {
			return obj1 === null && obj2 === null || obj1 !== null && obj2 !== null && obj1.obj === obj2.obj;
		}

		private onmousedown(event: MouseEvent) {
			const x = event.layerX/this.scale
			const y = event.layerY/this.scale
			const b = event.button

			this.pasteX = toStep(x);
			this.pasteY = toStep(y);

			const obj = this.sdk.getObjectAtPos(x, y);
			this.mouseOperation.moveCursorStart(x, y);
			this.mouseOperation.down(x, y, b, obj, this.makeFlags(event));

			this.draw();

			return false;
		}

		private onmousemove(event: MouseEvent) {
			const x = event.layerX/this.scale
			const y = event.layerY/this.scale

			const obj = this.sdk.getObjectAtPos(x, y)
			this.showHintObject(obj, x, y)
			this.mouseOperation.move(x, y, obj)

			if (!this.isObjEqual(this.oldSelection, obj)) {
				if (this.oldSelection) {
					this.oldSelection.obj.unselect();
					this.oldSelection = null;
				}
				if (obj && obj.type === OBJ_TYPE_POINT) {
					obj.obj.select()
					this.oldSelection = obj
				}
				this.draw();
			}

			const cur = this.mouseOperation.cursor(x, y, obj)
			if (cur !== this.old_cursor) {
				this.cursor(cur)
				this.old_cursor = cur
			}
		}

		private onmouseup(event: MouseEvent) {
			// var p1 = GetPos(this.control);
			// var x = (event.clientX - p1.left)/this.scale;
			// var y = (event.clientY - p1.top)/this.scale;
			const x = event.layerX/this.scale
			const y = event.layerY/this.scale
			const b = event.button

			const obj = this.sdk.getObjectAtPos(x, y)
			if (this.mouseOperation.up(x, y, b, obj, this.makeFlags(event)))
				this.endOperation();
			this.updateScrolls();
			this.draw();

			this.cursor(this.mouseOperation.cursor(x, y, obj));
		}

		private ondblclick() {
			if (this.sdk.selMan.size() === 1) {
				const element = this.sdk.selMan.items[0]
				if (element.sdk) {
					this.forward();
				} else {
					for (const i in element.props) {
						const prop = element.props[i]
						if (prop.isDefaultEdit()) {
							this.oneditprop(prop);
						}
					}
				}
			}
		}

		private cursor(value: string) {
			this.canvas.style("cursor", value);
		}

		edit(sdk: SDK) {
			if(this.sdk) {
				this.sdk.selMan.onselect = function(){};
				this.sdk.ondraw = function(){};
				this.sdk.scrollX = this.canvas.parent().scrollTop()
				this.sdk.scrollY = this.canvas.parent().scrollLeft()
			}
			this.sdk = sdk;
			if (sdk) {
				if (!sdk.undo) {
					sdk.undo = new UndoManager(sdk);
				}
				this.sdk.selMan.onselect = () => this.onselectelement(this.sdk.selMan);
				this.sdk.selMan.onselect();
				this.sdk.ondraw = () => this.draw();
				this.updateScrolls();
				this.canvas.parent().scrollTop(this.sdk.scrollX || 0);
				this.canvas.parent().scrollLeft(this.sdk.scrollY || 0);
				this.draw();
			} else {
				this.onselectelement(null);
			}
			this.onsdkselect();
		}

		makeFlags(event: KeyboardEvent|MouseEvent) {
			return (event.shiftKey ? 0x1 : 0) | (event.ctrlKey ? 0x2 : 0) | (event.altKey ? 0x4 : 0);
		}

		showHintObject(obj: MouseOperationData, x: number, y: number) {
			if (obj) {
				if (obj.type === OBJ_TYPE_ELEMENT) {
					const h = this.hint.body();
					const element = obj.obj;
					h.div("header").html(element.name);
					h.n("div").html(this.sdk.pack.translate(element.info));
					let footer: Builder = null;
					for (const i in element.props) {
						const prop = element.props[i];
						if (!prop.isDef()) {
							if (!footer) {
								footer = h.div("footer");
							}
							let text = prop.getText();
							if (text.length > 300) {
								text = text.substring(0, 300) + "...";
							}
							footer.n("div").html("<u>" + i + "</u> = " + text.replace(/\n/g, "<br>"));
						}
					}
				} else if(obj.type === OBJ_TYPE_POINT) {
					const h = this.hint.body();
					const header = h.div("header");
					header.n("img").class("icon").attr("src", obj.obj.getIcon());
					header.n("span").html(obj.obj.name);
					if (obj.obj.args) {
						header.n("span").style("fontWeight", "normal").html(" (" + obj.obj.args + ")");
					}
					h.n("div").html(this.sdk.pack.translate(obj.obj.parent.getPointInfo(obj.obj)));
				} else if(obj.type === OBJ_TYPE_HINT) {
					this.hint.body().html(obj.obj.prop ? obj.obj.prop.name : "not selected");
				} else {
					this.hint.body().html(obj.point.name + " -> " + obj.point.point.name);
				}
				this.showHint(x, y);
			} else {
				this.hint.close();
			}
		}

		draw() {
			this.ctx.clearRect(0, 0, this.canvas.element.offsetWidth, this.canvas.element.offsetHeight);

			this.ctx.save();
			if(this.scale != 1) {
				this.ctx.scale(this.scale, this.scale);
			}

			this.ctx.translate(0.5, 0.5);
			this.sdk.draw(this.ctx);
			this.mouseOperation.draw(this.ctx);

			this.ctx.restore();
		}

		beginAddElement(obj) {
			this.beginOperation(ME_ADDELEMENT, obj);

			if (this.sdk) {
				const c = document.createElement("canvas");
				const ctx = c.getContext("2d");
				c.width = c.height = 32;
				ctx.translate(0.5, 0.5);
				ctx.strokeStyle = "#000";
				ctx.moveTo(3, 0);
				ctx.lineTo(3, 17);
				ctx.moveTo(0, 3);
				ctx.lineTo(17, 3);
				ctx.stroke();
				ctx.drawImage(this.sdk.pack.elements[obj].icon, 7, 7);
				this.cursorNormal = "url('" + c.toDataURL("image/png") + "') 3 3, auto";

				ctx.beginPath();
				ctx.fillStyle = "white";
				ctx.rect(1, 1, 4, 4);
				ctx.fill();
				ctx.stroke();
				this.cursorLine = "url('" + c.toDataURL("image/png") + "') 3 3, auto";

				ctx.fillStyle = "lime";
				ctx.fill();
				ctx.stroke();
				this.cursorPoint = "url('" + c.toDataURL("image/png") + "') 3 3, auto";
			}
		}

		beginOperation(operation: number, obj?) {
			this.mouseOperationIndex = operation;
			this.emouse.obj = obj;
			this.mouseOperation = this.mouseHandlers[operation];
			this.mouseOperation.begin();
		}

		endOperation() {
			this.emouse.obj = null;
			this.mouseOperationIndex = ME_NONE;
			this.mouseOperation = this.mouseHandlers[ME_NONE];
		}

		isOperation(operation: number): boolean {
			return this.mouseOperationIndex === operation;
		}

		loadFromText(text: string, fileName: string) {
			this.setFileName(fileName);
			this.sdk.load(text, 0, SDK_PARSE_FILE);
			this.endOperation();
			this.updateScrolls();
			this.draw();
		}

		getFileName() {
			const msdk = this.getMainSDK();
			return msdk.fileName;
		}

		setFileName(fileName: string) {
			this.getMainSDK().fileName = fileName;
		}

		showPopup(type: PopupMenuType, x: number, y: number, obj?: any) {
			const p1 = GetPos(this.canvas.element);
			this.onpopupmenu(type, x*this.scale + p1.left, y*this.scale + p1.top, obj);
			this.hint.close();
		}

		showHint(x: number, y: number) {
			const p1 = GetPos(this.canvas.element);
			this.hint.show(x*this.scale + 16 + p1.left, y*this.scale + 16 + p1.top);
		}

		createNew() {
			this.sdk.clearProject();
			this.draw();
		}

		deleteSelected() {
			if (!this.isOperation(ME_NONE))
				return;

			if (this.sdk.undo) {
				this.sdk.undo.delElement(this.sdk.selMan);
			}
			this.sdk.selMan.erase();
			this.draw();
			this.onsdkchange();
		}

		shiftIDs(sdk: SDK) {
			for (const e of sdk.imgs) {
				e.eid = this.sdk.getNextID();
				if (e.sdk) {
					this.shiftIDs(e.sdk);
				}
			}
		}

		pasteFromText(text: string) {
			this.sdk.selMan.clear();
			const count = this.sdk.imgs.length;
			this.sdk.load(text, 0, SDK_PARSE_PASTE);
			let dx = 32768, dy = 32768;
			for (let i = count; i < this.sdk.imgs.length; i++) {
				const e = this.sdk.imgs[i];
				this.sdk.selMan.add(e);
				if (e.x < dx) {
					dx = e.x;
				}
				if (e.y < dy) {
					dy = e.y;
				}
			}
			dx = this.pasteX - dx;
			dy = this.pasteY - dy;
			this.sdk.selMan.move(dx, dy);
			this.draw();
			this.onsdkchange();

			this.pasteX += Hion.POINT_SPACE;
			this.pasteY += Hion.POINT_SPACE;
		}

		addElement(name: string, x: number, y: number): Hion.SdkElement {
			const element = this.sdk.add(name, toStep(x), toStep(y));
			element.place(x, y);

			this.sdk.selMan.select(element);
			if(this.sdk.undo) {
				this.sdk.undo.addElement(element);
			}
			this.onsdkchange();
			return element;
		}

		selectAll() {
			this.sdk.selMan.selectAll();
			this.draw();
		}

		back() {
			if(this.canBack()) {
				this.edit(this.sdk.parent);
			}
		}

		forward() {
			if(this.canForward()) {
				const e = this.sdk.selMan.items[0];
				if(e.sdk) {
					this.edit(e.sdk);
					if(!window.history.state || window.history.state.eid !== e.eid) {
						window.history.pushState({eid: e.eid}, e.name);
					}
				}
			}
		}

		canBack() {
			return this.sdk && this.sdk.parent;
		}

		canForward() {
			if (this.sdk && this.sdk.selMan.size() === 1) {
				const e = this.sdk.selMan.items[0];
				if(e.sdk) {
					return true;
				}
			}

			return false;
		}

		canBringToFront() {
			return this.sdk.selMan.size() === 1 && this.sdk.imgs[this.sdk.imgs.length-1] !== this.sdk.selMan.items[0] && !(this.sdk.selMan.items[0].flags & Hion.IS_PARENT);
		}

		canSendToBack() {
			if(this.sdk.selMan.size() === 1) {
				const prevIndex = this.sdk.indexOf(this.sdk.selMan.items[0]);
				return prevIndex > 0 && !(this.sdk.selMan.items[0].flags & Hion.IS_PARENT) && !(this.sdk.imgs[prevIndex-1].flags & Hion.IS_PARENT);
			}

			return false;
		}

		bringToFront() {
			if(this.canBringToFront()) {
				let e: Hion.SdkElement = null;
				for (let i = 0; i < this.sdk.imgs.length-1; i++) {
					if (this.sdk.imgs[i].isSelect()) {
						e = this.sdk.imgs[i];
					}
					if (e) {
						this.sdk.imgs[i] = this.sdk.imgs[i+1];
					}
				}
				this.sdk.imgs[this.sdk.imgs.length-1] = e;
				this.draw();
			}
		}

		sendToBack() {
			if (this.canSendToBack()) {
				let e: Hion.SdkElement = null;
				let i
				for(i = this.sdk.imgs.length-1; i > 1 && !(this.sdk.imgs[i-1].flags & Hion.IS_PARENT); i--) {
					if(this.sdk.imgs[i].isSelect()) {
						e = this.sdk.imgs[i];
					}
					if(e) {
						this.sdk.imgs[i] = this.sdk.imgs[i-1];
					}
				}
				this.sdk.imgs[i] = e;
				this.draw();
			}
		}

		run() {
			this.getMainSDK().run(FLAG_USE_RUN);
		}

		getMainSDK(): MSDK {
			let s = this.sdk;
			while(s.parent) {
				s = s.parent;
			}
			return s as MSDK;
		}

		canZoomIn(){
			return this.scale < 8;
		}

		canZoomOut(){
			return this.scale > 0.3;
		}

		zoomIn() {
			this.scale *= 2;
			this.draw();
		}

		zoomOut() {
			this.scale /= 2;
			this.updateScrolls();
			this.draw();
		}

		zoom(value: number) {
			const dx = value - this.scale
			const oW = this.canvas.parent().element.offsetWidth/2*dx
			const oH = this.canvas.parent().element.offsetHeight/2*dx
			this.scale = value;
			if (dx < 0) {
				this.canvas.parent().element.scrollLeft += oW;
				this.canvas.parent().element.scrollTop += oH;
			}
			this.updateScrolls();
			if (dx > 0) {
				this.canvas.parent().element.scrollLeft += oW;
				this.canvas.parent().element.scrollTop += oH;
			}
			this.draw();
		}

		/**
		 * Download current project to local computer
		 * @param file downloaded file name
		 */
		download(file: string) {
			var saveData = (function () {
				var a = document.createElement("a");
				a.style.display = "none";
				document.body.appendChild(a);
				return function (data, fileName) {
					var url = window.URL.createObjectURL(new window.Blob([data], {type: "octet/stream"}));
					a.href = url;
					a.download = fileName;
					a.click();
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				};
			}());

			saveData(this.getMainSDK().save(false), file.split("/").pop());
		}

		/**
		 * Save current project as PNG file
		 */
		saveAsPNG() {
			let tmp = document.createElement("canvas");
			let r = this.sdk.getParams();
			tmp.width = r.width() + 20;
			tmp.height = r.height() + 20;
			let buffer = tmp.getContext("2d");
			buffer.drawImage(this.canvas.element, r.x1 - 5, r.y1 - 5, r.width() + 10, r.height() + 10, 5, 5, r.width() + 10, r.height() + 10);
			window.open(tmp.toDataURL("image/png"));
		}

		/**
		 * Paste element at line and select them
		 * @param id Element code name
		 */
		pasteLineElement(id: string) {
			const element = this.sdk.add(id, this.pasteX, this.pasteY);
			this.sdk.selMan.select(element);

			element.insertInLine(this.pasteObj.point, this.pasteObj.obj);

			this.onsdkchange();
			this.draw();
		}

		/**
		 * Set line color
		 * @param color
		 */
		setLineColor(color: string) {
			this.pasteObj.point.setColor(color);
			this.onsdkchange();
			this.draw();
		}

		setLineInfo(data: LineInfo) {
			this.pasteObj.point.setInfo(data);
			this.onsdkchange();
			this.draw();
		}

		resize(){
			if(this.sdk) {
				this.updateScrolls();
				this.draw();
			}
		}

		updateScrolls() {
			const params = this.sdk.getParams();
			const parent = this.canvas.parent().element;

			this.canvas.element.height = Math.max(params.y2*this.scale + Hion.POINT_SPACE*10, parent.offsetHeight - 20);
			this.canvas.element.width = Math.max(params.x2*this.scale + Hion.POINT_SPACE*10, parent.offsetWidth - 20);
		}

		scrollBy(dx: number, dy: number) {
			this.canvas.parent().element.scrollLeft += dx;
			this.canvas.parent().element.scrollTop += dy;
		}

		canUndo(){ return this.sdk.undo.canUndo(); };
		canRedo(){ return this.sdk.undo.canRedo(); };

		undo(){ this.sdk.undo.undo(); this.draw(); };
		redo(){ this.sdk.undo.redo(); this.draw(); };

		canFormEdit() {
			if(this.sdk.imgs.length && this.sdk.imgs[0].flags & Hion.IS_PARENT) {
				return true;
			}
			if(this.sdk.imgs.length > 1 && this.sdk.imgs[1].flags & Hion.IS_PARENT) {
				return true;
			}

			return false;
		}

		getBuild() {
			const sdk = this.getMainSDK();
			return sdk.buildCounter || 0;
		}

		build() {
			const sdk = this.getMainSDK();
			if(sdk.buildCounter)
				sdk.buildCounter++;
			else
				sdk.buildCounter = 1;
		}
	}
