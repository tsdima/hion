import { UIControl } from './UIControl'
import { FixLayout } from './layouts/FixLayout'

export class UIContainer extends UIControl {
  private readonly child: Set<UIControl>

  public constructor() {
    super()

    this.child = new Set()
    this.layout = new FixLayout(this)
  }

  public getContainer() {
    return this.getControl()
  }

  public add(control: UIControl<any>) {
    control.free();
    this.child.add(control);
    control.parent = this;

    this.getContainer().appendChild(control.getControl());

    this.layout.addChild(control);

    control.changeContainer();

    return this;
  }

  public insert(control: UIControl, before: UIControl) {
    control.free()
    this.child.add(control)
    control.parent = this

    this.getContainer().insertBefore(control.getControl(), before.getControl());

    this.layout.addChild(control);

    control.changeContainer();

    return this;
  }

  public remove(control: UIControl) {
    this.child.delete(control)

    this.getContainer().removeChild(control.getControl())
  }

  public removeAll() {
    for (const item of this.child) {
      this.remove(item)
    }
  }

  public each(callback: (item: UIControl) => boolean|void) {
    for (const item of this.child) {
      if (callback.call(this, item) === true) {
        break;
      }
    }
  }

  public indexOf(ctl: UIControl) {
    let index = 0
    for (const item of this.child) {
      if (item === ctl) {
        return index
      }
      index++
    }

    return -1
  }

  public get(index: number) {
    let _index = 0
    for (const item of this.child) {
      if (_index === index) {
        return item
      }
      _index++
    }

    return null
  }

  public size() { return this.child.size }
}
