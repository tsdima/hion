import { Hion } from './element'
import { SDK } from './sdk'

  export class Rect {
		constructor(public x1: number, public y1: number, public x2: number, public y2: number) {}

    width(): number {
			return this.x2 - this.x1
		}

    height(): number {
			return this.y2 - this.y1
		}
	}

	export class SelectManager {
		items: Hion.SdkElement[] = []
		selectEvent: boolean = true;
		onselect = () => {};

		constructor (public sdk: SDK) {}

		doSelect() {
			if(this.selectEvent) {
				this.onselect();
			}
		}

		beginSelect() {
			this.selectEvent = false;
		}

		endSelect() {
			this.selectEvent = true;
			this.doSelect();
		}

		add(e: Hion.SdkElement) {
			this.items.push(e);
			e.flags |= Hion.IS_SELECT;
			this.doSelect();
		}

		select(e: Hion.SdkElement) {
			this.beginSelect();
			this.clear();
			this.add(e);
			this.endSelect();
		}

		unselect(e: Hion.SdkElement) {
			for (let i = 0; i < this.items.length; i++) {
				if (this.items[i] === e) {
					e.flags ^= Hion.IS_SELECT;
					this.items.splice(i, 1);
					this.doSelect();
					break;
				}
			}
		}

		selRect(ox1: number, oy1: number, ox2: number, oy2: number) {
			this.beginSelect();
			const x1 = Math.min(ox1, ox2)
			const y1 = Math.min(oy1, oy2)
			const x2 = Math.max(ox1, ox2)
			const y2 = Math.max(oy1, oy2)
			for (const e of this.sdk.imgs) {
				if (!e.isSelect() && e.inRect(x1, y1, x2, y2)) {
          this.add(e);
        }
			}
			this.endSelect();
		}

		selectAll() {
			this.beginSelect();
			this.clear();
			for (let e of this.sdk.imgs) {
				this.add(e);
			}
			this.endSelect();
		}

		clear() {
			for (let e of this.items) {
        e.flags ^= Hion.IS_SELECT;
      }
			this.items = [];
			this.doSelect();
		}

		setProp(name: string, value: any) {
			for (let e of this.items) {
        e.setProperty(name, value);
      }
		}

		changePoint(name: string, checked: boolean) {
			let pName = "do" + name
			for (let e of this.items) {
				if (checked && !e.points[pName]) {
					e.addPoint(pName, Hion.PT_WORK)
				} else {
					if (e.points[pName]) {
						e.removePoint(pName)
					}
				}
			}
		}

		move(dx: number, dy: number) {
			for (let e of this.items) {
				e.move(dx, dy);
			}
		}

		erase() {
			for (let e of this.items) {
				if (e.canDelete()) {
					for (let j = 0; j < this.sdk.imgs.length; j++) {
						if (e === this.sdk.imgs[j]) {
							this.sdk.deleteElement(j);
							break;
						}
					}
				} else {
					e.flags ^= Hion.IS_SELECT;
				}
			}
			this.items = [];
			this.doSelect();
		}

		isEmpty(): boolean {
			return this.items.length === 0;
		}

		size(): number {
			return this.items.length;
		}

		each(callback: (element: Hion.SdkElement) => void) {
			for (let e of this.items) {
				callback(e);
			}
		}

		normalizePosition() {
			let minX = 0, minY = 0;
			for (let e of this.items) {
				if (e.x < minX) {
					minX = e.x;
				}
				if (e.y < minY) {
					minY = e.y;
				}
			}

			if (minX || minY) {
				this.move(-minX + Hion.POINT_SPACE, -minY + Hion.POINT_SPACE);
			}
		}

		normalizeLinks() {
			for (const e of this.items) {
				for (const p in e.points) {
					let point = e.points[p]
					if (!point.isFree()) {
						if (!point.isPrimary()) {
							point = point.point
						}

						// create new path
						if (point.pos.next === point.point.pos) {
							point.createPath();
							continue;
						}

						// clear old path
						let n = point.pos.next
						let inLine = true
						while (n) {
							if (point.type === Hion.PT_EVENT && n.y != point.pos.y) {
								inLine = false;
							} else if (point.type === Hion.PT_DATA && n.x != point.pos.x) {
								inLine = false;
							}
							n = n.next;
						}
						if (inLine) {
							point.clearPath();
						}
					}
				}
			}
		}

		getRect(): Rect {
			let minX = 32768
			let minY = 32768
			let maxX = -32768
			let maxY = -32768
			for (const item of this.items) {
				if (item.x < minX) minX = item.x;
				if (item.y < minY) minY = item.y;
				if (item.x + item.w > maxX) maxX = item.x + item.w;
				if (item.y + item.h > maxY) maxY = item.y + item.h;
			}

			return new Rect(minX, minY, maxX, maxY)
		}
	}
