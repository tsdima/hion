import { Pack } from './pack/Pack'
import { Hion } from './element'
import { Rect, SelectManager } from './SelectManager'
import { UndoManager } from './UndoManager'
import { Point, PointPosition } from './point'
import { packMan } from '../main'
import { printError } from '../tools/tools'
import { UIContainer } from '../ui/controls/UIContainer'

  /** Run flags */
	export const FLAG_USE_RUN  = 0x01;
	export const FLAG_USE_EDIT = 0x02;
	export const FLAG_USE_CHILD= 0x04;

	/** Howto sha paste to sdk */
	export const SDK_PARSE_FILE = 0x01;
	export const SDK_PARSE_PASTE = 0x02;

	/** Object types */
	export const OBJ_TYPE_ELEMENT	= 1;
	export const OBJ_TYPE_POINT		= 2;
	export const OBJ_TYPE_LINE		= 3;
	export const OBJ_TYPE_LINEPOINT	= 4;
	export const OBJ_TYPE_HINT		= 5;

	function Test(v1: number, v2: number, tp: number) {
		if (v2 < v1) {
      return (v2 - 4 < tp) && (tp < v1 + 4)
    }
		return (v1-4 < tp) && (tp < v2+4)
	}

	function isLine(x: number, y: number, lx1: number, ly1: number, lx2: number, ly2: number) {
		if (Test(lx1,lx2,x) && Test(ly1,ly2,y)) {
			const p = ly2 - ly1
			const k = lx2 - lx1
			const C = ly1*k - lx1*p
			return Math.abs(p*x - k*y + C)
		}
		return 500
	}

  interface FoundObject<Type extends number, T> {
    type: Type
    obj: T
  }

  interface FoundObjectPoint extends FoundObject<typeof OBJ_TYPE_POINT, Point> {}
  interface FoundObjectElement extends FoundObject<typeof OBJ_TYPE_ELEMENT, Hion.SdkElement> {}
  interface FoundObjectHint extends FoundObject<typeof OBJ_TYPE_HINT, Hion.PropertyHint> {}
  interface FoundObjectPointPosition extends FoundObject<typeof OBJ_TYPE_LINEPOINT, PointPosition> {
    point: Point
  }
  interface FoundObjectLine extends FoundObject<typeof OBJ_TYPE_LINE, PointPosition> {
    point: Point
  }

  type FoundObjectType = FoundObjectPoint | FoundObjectElement | FoundObjectHint | FoundObjectPointPosition | FoundObjectLine

	export class SDK {
		imgs: Hion.SdkElement[] = []
		buildCounter: number = 0
		selMan: SelectManager
		parent: SDK
		parentElement: Hion.SdkElement
		scrollX: number
		scrollY: number
		undo: UndoManager

		ondraw = () => {};
		onaddelement = (element: Hion.SdkElement) => {};
		onremoveelement = (element: Hion.SdkElement) => {};

		constructor(public pack: Pack) {
			this.selMan = new SelectManager(this);
			this.resetID();
		}

		deleteElement(index: number) {
			let e = this.imgs.splice(index, 1);
			e[0].erase();
			this.onremoveelement(e[0]);
		}

		deleteElementById(eid: number) {
			for (let i = 0; i < this.imgs.length; i++) {
				if (this.imgs[i].eid === eid) {
					this.deleteElement(i);
					break;
				}
			}
		}

		linebypos(p: Point, x: number, y: number) {
			if (p.point === null)
				return null;
			let fp = p.pos
			let sp = fp.next
			while (sp) {
				if (isLine(x,y, fp.x, fp.y, sp.x, sp.y) < 200)
					return fp;
				fp = sp;
				sp = sp.next;
			}

			return null
		}

		getElementById(id: string): Hion.SdkElement {
			for (const e of this.imgs) {
				if (e.name === id) {
					return e;
				}
			}
			return null;
		}

		findElementById(eid: number): Hion.SdkElement {
			for (const e of this.imgs) {
				if (e.eid === eid)
					return e;
			}
			return null;
		}

		getObjectAtPos(x: number, y: number): FoundObjectType {
			for (let i = this.imgs.length - 1; i >= 0; i--) {
				let element = this.imgs[i];
				// point
				if (element.mouseGetPoint()) {
					for (const pIndex in element.points) {
						const p = element.points[pIndex]
						const dx = x - p.pos.x
						const dy = y - p.pos.y
						if (dx <= 4 && dx >= -3 && dy <= 4 && dy >= -3)
							return {type: OBJ_TYPE_POINT, obj: p};
					}
				}

				// element
				if (element.inPoint(x, y)) {
					return {type: OBJ_TYPE_ELEMENT, obj: this.imgs[i]};
				}

				// element hint
				for (const h of element.hints) {
					if (x > element.x + h.x && x < element.x + h.x + h.width && y > element.y + h.y && y < element.y + h.y + h.height)
						return {type: OBJ_TYPE_HINT, obj: h};
				}
			}

			for (let i = this.imgs.length - 1; i >= 0; i--) {
				for (const j in this.imgs[i].points) {
					const p = this.imgs[i].points[j];
					if (p.type % 2 === 0 && p.point) {
						// line point
						let pt = p.pos;
						while (pt) {
							if (Math.abs(x - pt.x) <= 3 && Math.abs(y - pt.y) <= 3)
								return {type: OBJ_TYPE_LINEPOINT, obj: pt, point: p};
							pt = pt.next;
						}

						// line
						const line = this.linebypos(p, x, y);
						if (line)
							return {type: OBJ_TYPE_LINE, obj: line, point: p};
					}
				}
			}
			return null;
		}

		draw(ctx: CanvasRenderingContext2D) {
			//links
			for (const e of this.imgs) {
				for (const i in e.points) {
					const p = e.points[i]
					if (p.type % 2 === 0 && p.point) {
						if (p.selected || p.point.selected) {
							ctx.lineWidth = 2;
						}
						ctx.strokeStyle = p.getColor();
						ctx.beginPath();
						ctx.moveTo(p.pos.x, p.pos.y);
						let n = p.pos.next;
						while (n) {
							ctx.lineTo(n.x, n.y);
							n = n.next;
						}
						ctx.stroke();
						if (p.selected || p.point.selected) {
							ctx.lineWidth = 1;
						}

						if (p.info) {
							ctx.font = "9px monospace";
							const lines = p.info.text.split("\n");
							let wl = [];
							let maxW = 0;
							if(p.info.wl) {
								wl = p.info.wl;
								maxW = p.info.maxW;
							} else {
								for (const line of lines) {
									const m = ctx.measureText(line);
									wl.push(m.width);
									if (m.width > maxW)
										maxW = m.width;
								}
								p.info.wl = wl;
								p.info.maxW = maxW;
							}
							let n = p.pos;
							do {
								const delta = Math.abs(n.next.x - n.x);
								if (maxW + 4 < delta) {
									let y = n.y;
									for (const l in lines) {
										let x = Math.min(n.next.x, n.x);
										if (p.info.direction == 1) {
											x += delta/2 - wl[l]/2;
										} else if(p.info.direction == 2) {
											x += delta - wl[l] - 4;
										}
										ctx.fillStyle = "white";
										ctx.fillRect(x + 2, y - 9, wl[l], 8);
										ctx.fillStyle = "black";
										ctx.fillText(lines[l], x + 2, y - 2);
										y += 10;
									}
									break;
								}
								n = n.next
							} while(n.next);
						}
					}
				}
			}

			//elements
			for (const e of this.imgs) {
				e.draw(ctx);
			}
		}

		clearProject() {
			this.imgs = []
			this.add(this.pack.projects[0], 56, 56);
		}

		getRootSDK(): MSDK {
			let sdk: SDK = this;
			while (sdk.parent) {
				sdk = sdk.parent;
			}
			return sdk as MSDK;
		}

		getNextID(): number {
			return this.getRootSDK().eids++;
		}

		getCurrentID() {
			return this.getRootSDK().eids;
		}

		resetID() {
			this.setID(1);
		}

		setID(value: number) {
			this.getRootSDK().eids = value;
		}

		add(id: string, x: number, y: number): Hion.SdkElement {
			const e = Hion.createElement(this, this.pack.mapElementName(id), x, y)
			e.eid = this.getNextID();
			this.imgs.push(e);
			this.onaddelement(e);
			return e;
		}

		save(selection: boolean = false): string {
			const savePart = this.parent || selection;
			let text = savePart ? "" : "Make(" + this.pack.name + ")\n";
			if (this.buildCounter && !savePart) {
        text += "Build(" + this.buildCounter + ")\n";
      }

			for (const e of this.imgs) {
				if(selection && !e.isSelect()) {
					continue;
				}
				text += e.save(selection, "");
			}
			return text;
		}

		saveLink(): string {
			const e = this.selMan.items[0];
			return (e.getMainLink() || e).save(true, "", true);
		}

		load(text: string, start?: number, flags?: number): number {
			let arr = text.split("\r\n"); // opera like...
			if (arr.length < 2) {
        arr = text.split("\n");
      }
			const links: Array<{ srce: Hion.SdkElement, srcp: string, dste: number, dstp: string, links: string }> = [];
			const pointColors = [];
			const pointInfo = [];
			let e: Hion.SdkElement = null;
			let index = start ? start : 0;

			const replacedIDS: { [id: number]: Hion.SdkElement } = {};
			const getElementById = (id: number) => flags & SDK_PARSE_PASTE ? replacedIDS[id] : this.findElementById(id)

			if (index === 0 && (flags & SDK_PARSE_FILE)) {
				this.resetID();
			}

			for (; index < arr.length; index++) {
				const line = arr[index].trim();
				if (line.length === 0)
					continue;

				if (line.substring(0, 5) === "Make(") {
					let packName = line.substring(5, line.length - 1);
					//----------------- TEMP
					if (packName == "base")
						packName = "webapp";
					//---------------------
					this.pack = packMan.getPack(packName);
					if (!this.pack) {
            console.error("Pack", packName, "not found!")
          }
				} else if (line.startsWith("Build(")) {
					this.buildCounter = parseInt(line.substring(6, line.length - 1));
				} else if (line.substring(0, 4) === "Add(") {
					const l = line.substring(4, line.length - 1).split(",");
					const isEntry = this.pack.isEntry(l[0]);
					if (isEntry && this.imgs.length && this.imgs[0].name === l[0]) {
						e = this.imgs[0];
						e.move(parseInt(l[2]) - e.x, parseInt(l[3]) - e.y);
					} else {
						e = this.add(l[0], parseInt(l[2]), parseInt(l[3]));
						if(isEntry && !this.parent)
							e.flags |= Hion.IS_PARENT;
					}
					if (flags & SDK_PARSE_PASTE) {
            replacedIDS[parseInt(l[1])] = e;
          } else {
						e.eid = parseInt(l[1]);
						if (e.eid >= this.getCurrentID())
							this.setID(e.eid + 1);
					}
				} else if (line.substring(0, 5) === "link(") {
					const pa = line.substring(5, line.length - 1).split(",");
					const sp = pa[1].split(":");
					let s = "";
					for (let j = 2; j < pa.length; j++) // TODO: realgoritmic
						s += pa[j] + ",";
					links[links.length] = {srce: e, srcp: pa[0], dste: parseInt(sp[0]), dstp: sp[1], links: s};
				} else if (line.substring(0, 1) === "{") {
				} else if (line.substring(0, 1) === "}") {

				} else if (line === "BEGIN_SDK") {
					e.sdk.imgs = [];
					index = e.sdk.load(text, index + 1, flags);
					e.sdk.imgs[0].parentElement = e;
				} else if (line === "END_SDK") {
					break;
				} else if(line.substring(0, 1) === "@") {
					const pSys = line.substring(1).split("=");
					let name = pSys[0];
					// support hiasm4
					if (name == "Hint")
						name = "Comment";

					if (e.sys[name]) {
            e.sys[name].parse(pSys[1]);
          } else {
            printError("System property not found: " + name + ", " + line);
          }
				} else if(line.substring(0, 7) === "AddHint") {
					const name = line.substring(8, line.length - 1);
					const hintParams = name.split(",");
					let propName = hintParams[4];

					// support hiasm4
					if (propName === "@Hint")
						propName = "@Comment";

					const prop = propName.startsWith("@") ? e.sys[propName.substring(1)] : e.props[propName];
					e.addHint(parseInt(hintParams[0]), parseInt(hintParams[1]), prop);
				} else if(line.substring(0, 5) === "Point") {
					const name = line.substring(6, line.length - 1);

					if (!e.showDefaultPoint(name)) {
						e.addPoint(name, Hion.PT_WORK);
					}
				} else if(line.startsWith("PColor")) {
					const val = line.substring(7, line.length - 1);
					const i = val.indexOf(",");
					pointColors.push({name: val.substring(0, i), color: val.substring(i+1), element: e})
				} else if(line.startsWith("PInfo")) {
					const val = line.substring(6, line.length - 1);
					const i = val.indexOf(",");
					pointInfo.push({name: val.substring(0, i), direction: val.substring(i+1, 1), text: val.substring(i+3).replace("\\n", "\n"), element: e})
				} else if(line.startsWith("elink")) {
					const eid = parseInt(line.substring(6, line.length - 1));
					const le = this.findElementById(eid);
					e.makeLink(le);
				} else if (e) {
					const ind = line.indexOf("=");
					const name = line.substring(0, ind).trim();
					if (e.props[name]) {
						e.props[name].parse(line.substring(ind+1));
					} else if(e.loadFromText(line)) {
						// do nothing
					} else {
						// hiasm 4 support
						if(e.sys[name]) {
              e.sys[name].parse(line.substring(ind + 1));
            } else {
							printError("Property not found: " + name + ", " + line);
							console.log("Property not found:", name, e.name)
						}
					}
				}
			}

			// restore links
			for (let i in links) {
				const e1 = links[i].srce
				const e2 = getElementById(links[i].dste)
				if (e1 && e2) {
					const p1 = e1.findPointByName(links[i].srcp)
					const p2 = e2.findPointByName(links[i].dstp)
					if (p1 && p2) {
						p1.connect(p2)
						const lk = links[i].links.length > 4 ? links[i].links.substring(2, links[i].links.length - 3) : ''
						if (lk) {
							const pts = lk.split(")(");
							let n = p1.pos;
							for (let j = 0; j < pts.length; j++) {
								const coord = pts[j].split(",")
								n.next = {x: parseInt(coord[0]), y: parseInt(coord[1]), next: n.next, prev: n}
								n.next.next.prev = n.next;
								n = n.next;
							}
						}
					} else {
            printError("Point not found! " + links[i].dstp);
          }
				} else {
          printError("Element not found! " + links[i].dste);
        }
			}

			// restore point colors
			for (const rec of pointColors) {
				if (rec.element.points[rec.name]) {
					if (rec.color.charAt(0) >= '0' && rec.color.charAt(0) <= '9') {
						const v = parseInt(rec.color);
						rec.color = 'rgb(' + (v & 0xff) + ',' + ((v >> 8) & 0xff) + ',' + (v >> 16) + ')';
					}
					rec.element.points[rec.name].color = rec.color;
				} else {
					console.log("Point for color", rec.name, "not found", rec.element.name);
				}
			}

			// restore point info
			for (const rec of pointInfo) {
				if (rec.element.points[rec.name]) {
					rec.element.points[rec.name].info = {text: rec.text, direction: rec.direction};
				} else {
					console.log("Point for info", rec.name, "not found", rec.element.name);
				}
			}

			return index;
		}

		run(flags: number): UIContainer {
			let prn: Hion.SdkElement = null
			for (const i of this.imgs) {
				if (i.flags & Hion.IS_PARENT) {
					prn = i;
					break;
				}
			}
			let parent: UIContainer = null
			if (prn) {
				parent = prn.run(flags) as UIContainer;
			}
			for (const e of this.imgs) {
				if (e !== prn) {
					const ctl = e.run(flags)
					if (ctl && parent) {
						parent.add(ctl);
					}
				}
			}
			for(const e of this.imgs) {
				if(e !== prn) {
          e.oninit();
        }
			}
			if (prn) {
        prn.oninit();
      }
			return prn ? prn.getChild() : parent;
		}

		stop(flags: number) {
			for (const e of this.imgs) {
				e.onfree(flags);
			}
		}

		getParams(): Rect {
			let minX = 32768
			let minY = 32768
			let maxX = -32768
			let maxY = -32768
			for (const i of this.imgs) {
				if(i.x < minX) minX = i.x;
				if(i.y < minY) minY = i.y;
				if(i.x + i.w > maxX) maxX = i.x + i.w;
				if(i.y + i.h > maxY) maxY = i.y + i.h;
			}

			return new Rect(minX, minY, maxX, maxY);
		}

		indexOf(element: Hion.SdkElement): number {
			for (let i = 0; i < this.imgs.length; i++) {
				if (this.imgs[i] === element) {
					return i;
				}
			}

			return -1;
		}
	}

	interface SdkElementList {
		[uid: number]: Hion.SdkElement
	}
	class SDKLib {
		items:SdkElementList

		add(element: Hion.SdkElement) {
			this.items[element.eid] = element
		}

		getElementById(eid: number): Hion.SdkElement {
			return this.items[eid]
		}

		remove(element: Hion.SdkElement) {
			delete this.items[element.eid]
		}
	}

	export class MSDK extends SDK {
		sdkLib: SDKLib
		eids: number
		fileName: string

		constructor(pack: Pack) {
			super(pack)
			this.sdkLib = new SDKLib()
			this.eids = 0
		}
	}
