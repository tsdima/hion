import { Hion } from './element'

export interface Position2D {
  x: number
  y: number
}

interface PositionVector extends Position2D {
  side: number
  l: number
}

export interface PointPosition {
  x: number
  y: number
  next: PointPosition
  prev: PointPosition
}

export interface LineInfo {
  text: string
  direction: number
  /** internal */
  wl?: number[]
  maxW?: number
}

export class Point {
  point: Point = null
  pos: PointPosition
  selected: boolean
  color: string
  info: LineInfo
  args: string
  inherit: string
  /** Contain information about user point */
  _dplInfo: string
  call:(data?: any) => void
  onevent:(data?: any) => any

  constructor (public parent: Hion.SdkElement, public name: string, public type: number) {
    this.pos = {x: 0, y: 0, next: null, prev: null};
    if (type < 3) {
      this.pos.x = parent.x + ((type === 1) ? 0 : parent.w);
      this.pos.y = parent.y + 6 + parent.psize[type - 1] * 7;
    } else {
      this.pos.x = parent.x + 6 + parent.psize[type - 1] * 7;
      this.pos.y = parent.y + ((type === 4) ? 0 : parent.h);
    }

    if(type === 2 || type === 4) {
      this.call = data => on_event(this.point, data === undefined ? "" : data)
    }
  }

  getPair(): number { return this.type + (this.isPrimary() ? -1 : 1); }
  isPrimary(): boolean { return this.type % 2 == 0; }
  isFree(): boolean { return this.point === null; }

  connect(pair: Point): Point {
    if (this.isPrimary()) {
      this.point = pair;
      pair.point = this;
      this.pos.next = pair.pos;
      pair.pos.prev = this.pos;
    } else {
      pair.connect(this);
    }

    return this;
  }

  // find best link
  connectWithPath(pairs: Point[]) {
    let best = null
    let bestLevel = 0
    for (const pair of pairs) {
      if (pair.isFree()) {
        this.clear();
        this.connect(pair).createPath();
        let pp = this.pos;
        let bl = 0
        while(pp.next) {
          bl++;
          pp = pp.next;
        }
        if (!best || bl < bestLevel) {
          best = pair;
          bestLevel = bl;
        }
      }
    }

    if(best && best != this.point) {
      this.clear();
      this.connect(best).createPath();
    }
  }

  createPath() {
    if(!this.point.point) return;

    const point1 = this.isPrimary() ? this : this.point;
    const point2 = point1.point;

    const v1: PositionVector = {x: point1.pos.x, y: point1.pos.y, side: 0, l: 0}

    if (point1.parent.name === "HubEx" || point1.parent.name === "GetDataEx") {
      v1.side = point1.parent.calcSide(point1);
      v1.l = 2*Hion.POINT_OFF;
    } else {
      v1.l = Hion.POINT_SPACE*2;
      switch (point1.type) {
        case Hion.PT_EVENT: v1.side = 0; break;
        case Hion.PT_DATA: v1.side = 3; break;
        case Hion.PT_WORK: v1.side = 2; break;
        case Hion.PT_VAR: v1.side = 1; break;
      }
    }

    const v2: PositionVector = {x: point2.pos.x, y: point2.pos.y, side: 0, l: 0};

    if (point2.parent.name === "HubEx" || point2.parent.name === "GetDataEx") {
      v2.side = point2.parent.calcSide(point2);
      v2.l = 2*Hion.POINT_OFF;
    } else {
      v2.l = Hion.POINT_SPACE*2;
      switch(point2.type) {
        case Hion.PT_EVENT: v2.side = 0; break;
        case Hion.PT_DATA: v2.side = 3; break;
        case Hion.PT_WORK: v2.side = 2; break;
        case Hion.PT_VAR: v2.side = 1; break;
      }
    }
    tracePath(point1.pos, v1, v2);
  }

  clearPath() {
    if(!this.isFree()) {
      this.pos.next = this.point.pos;
      this.point.pos.prev = this.pos;
    }
  }

  clear() {
    if(this.point) {
      const p = this.point;
      this.point = null;
      this.pos.next = null;
      p.pos.prev = null;
      p.point = null;
    }
  }

  getIcon() {
    const items = ["sc_func", "sc_event", "sc_var", "sc_prop"];
    return "img/icons/" + items[this.type-1] + ".png";
  }

  getNodes(): Position2D[] {
    const nodes: Position2D[] = [];
    let pp = this.pos.next;
    while(pp && pp.next) {
      nodes.push({x: pp.x, y: pp.y});
      pp = pp.next;
    }
    return nodes;
  }

  select() {
    if (this.selected)
      return;
    this.selected = true;
    let p = this.point;
    if (p) {
      const res = p.parent.getLinkedPoint(p)
      if (res && res !== p) {
        res.select()
      }
    }
  }

  unselect() {
    if (this.selected) {
      delete this.selected;
      let p = this.point;
      if(p) {
        const res = p.parent.getLinkedPoint(p);
        if(res && res !== p) {
          res.unselect();
        }
      }
    }
  }

  setColor(value: string) {
    value = value.toLowerCase();
    if(value === this.getDefaultColor())
      delete this.color;
    else
      this.color = value;
    let p = this.isPrimary() ? this.point : this;
    if(p) {
      const res = p.parent.getLinkedPoint(p);
      if(res !== p) {
        res.setColor(value);
      }
    }
  }

  getDefaultColor() {
    return this.type < 3 ? "#00c" : "#c00"
  }

  getColor() {
    return this.color || this.getDefaultColor();
  }

  setInfo(data: LineInfo) {
    if (data.text)
      this.info = data;
    else if(this.info)
      delete this.info;
  }

  getInfo() {
    return this.info || {text:"", direction: 0};
  }
}

export function addLinePoint(lp: PointPosition, x: number, y: number): PointPosition {
  let np: PointPosition = {x: 0, y: 0, next: null, prev: null};

  if (lp) {
    np.next = lp.next;
    np.prev = lp;
    lp.next = np;
    if (np.next) np.next.prev = np;
  } else {
    np.next = null;
    np.prev = null;
  }

  np.x = x;
  np.y = y;

  return np;
}

const kx = [1,0,-1,0];
const ky = [0,1,0,-1];

function moveVector(v: PositionVector, l: number) {
  if(l*kx[v.side] > 0) v.x += l;
  if(l*ky[v.side] > 0) v.y += l;
}

function crossVectors(v1: PositionVector, v2: PositionVector, cxy: Position2D) {
  cxy.x = 0;
  cxy.y = 0;

  if(Math.abs(v1.side - v2.side) % 2 == 0)
    return false;

  // todo
  if(kx[v1.side] == 0) {
    cxy.x = Math.round((v1.x - v2.x)/kx[v2.side]);
    if(cxy.x == 0) cxy.x = -Hion.POINT_SPACE;
    if(cxy.x < 0) return false;
  }
  else {
    cxy.x = Math.round((v2.x - v1.x)/kx[v1.side]);
    if(cxy.x == 0) cxy.x = -Hion.POINT_SPACE;
    if(cxy.x < 0) return false;
  }

  if(ky[v1.side] == 0) {
    cxy.y = Math.round((v1.y - v2.y)/ky[v2.side]);
    if(cxy.y == 0) cxy.y = -Hion.POINT_SPACE;
    if(cxy.y < 0) return false;
  }
  else {
    cxy.y = Math.round((v2.y - v1.y)/ky[v1.side]);
    if(cxy.y == 0) cxy.y = -Hion.POINT_SPACE;
    if(cxy.y < 0) return false;
  }

  return true;
}

function rotateRight(v: PositionVector) {
  if (v.side == 3)
    v.side = 0;
  else v.side++;
}

function rotateLeft(v: PositionVector) {
  if (v.side == 0)
    v.side = 3;
  else v.side--;
}

function calcIncX(v1: PositionVector, v2: PositionVector) {
  if (v1.side == v2.side && v2.y != v1.y)
    return v2.x + kx[v2.side]*v2.l - v1.x;
  else
    return Math.round((v2.x - v1.x)/2);
}

function calcIncY(v1: PositionVector, v2: PositionVector) {
  if (v1.side == v2.side && v2.x != v1.x)
    return v2.y + ky[v2.side]*v2.l - v1.y;
  else
    return Math.round((v2.y - v1.y)/2);
}

function tracePath(p: PointPosition, v1: PositionVector, v2: PositionVector) {
  if (v1.side != v2.side) {
    if (v1.x == v2.x) {
      if ((ky[v1.side] == 1 && v1.y < v2.y) ||
        (ky[v2.side] == 1 && v2.y < v1.y)) return;
    } else if(v1.y == v2.y) {
      if ((kx[v1.side] == 1 && v1.x < v2.x) ||
        (kx[v2.side] == 1 && v2.x < v1.x)) return;
    }
  }

  const t = v1
  //unsigned char step = 0;
  const cxy = {x: 0, y: 0};
  while(!crossVectors(t, v2, cxy)) {
    const old = {x: t.x, y: t.y};
    if(kx[t.side]) moveVector(t, calcIncX(t, v2));
    if(ky[t.side]) moveVector(t, calcIncY(t, v2));
    if(/*step == 0 &&*/ old.x == t.x && old.y == t.y) {
      t.x += t.l*kx[t.side];
      t.y += t.l*ky[t.side];
    }
    p = addLinePoint(p, t.x, t.y);
    switch(t.side) {
      case 0:	if(v2.y > t.y) rotateRight(t); else rotateLeft(t); break;
      case 1:	if(v2.x > t.x) rotateLeft(t); else rotateRight(t); break;
      case 2:	if(v2.y > t.y) rotateLeft(t); else rotateRight(t); break;
      case 3: if(v2.x > t.x) rotateRight(t); else rotateLeft(t); break;
    }
  }
  t.x += cxy.x*kx[t.side];
  t.y += cxy.y*ky[t.side];
  addLinePoint(p, t.x, t.y);
}

function on_event(point: Point, data: any = '') {
  if (point) {
    if (point.onevent)
      return point.onevent(data);
    console.error('onevent undefined', point)
  }
  return "";
}
