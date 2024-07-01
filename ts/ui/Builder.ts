export type BuilderElementType = HTMLElement

export class Builder<T extends HTMLElementTagNameMap[keyof HTMLElementTagNameMap] = HTMLElement> {
  constructor(public element: T = undefined) {
  }

  public n<T extends keyof HTMLElementTagNameMap>(tag: T) {
    const element = document.createElement(tag)
    if (this.element) {
      this.element.appendChild(element)
    }
    return new Builder<HTMLElementTagNameMap[T]>(element)
  }

  public class(className: string) {
    this.element.className = className
    return this
  }

  public div(className: string) {
    return this.n('div').class(className)
  }

  public span(className: string) {
    return this.n("span").class(className)
  }

  public checkbox(className: string) {
    return this.n("input").attr("type", "checkbox").class(className)
  }

  public inputbox(className: string) {
    return this.n("input").attr("type", "text").class(className)
  }

  public html(text: string) {
    this.element.innerHTML = text
    return this
  }

  public id(id: string) {
    this.element.id = id
    return this
  }

  public checked(): boolean
  public checked(value: boolean): this
  public checked(value: boolean|undefined = undefined) {
    if (value === undefined) {
      return (this.element as HTMLInputElement).checked
    }
    (this.element as HTMLInputElement).checked = value
    return this
  }

  public value(): string
  public value(value: string|number): this
  public value(value: string|number|undefined = undefined) {
    if (value === undefined) {
      return (this.element as HTMLInputElement).value
    }
    (this.element as HTMLInputElement).value = value.toString()
    return this
  }

  public scrollLeft(): number
  public scrollLeft(value: number): this
  public scrollLeft(value: number = undefined) {
    if (value === undefined) {
      return this.element.scrollLeft
    }
    this.element.scrollLeft = value
    return this
  }

  public scrollTop(): number
  public scrollTop(value: number): this
  public scrollTop(value: number = undefined): number|this {
    if(value === undefined) {
      return this.element.scrollTop
    }
    this.element.scrollTop = value
    return this
  }

  public attr(name: string, value: any) {
    this.element[name] = value
    return this
  }

  public htmlAttr(name: string, value: string|boolean|number) {
    this.element.setAttribute(name, value.toString())
    return this
  }

  public style(name: string, value: string|number) {
    this.element.style[name] = value
    return this
  }

  public append(node: Node) {
    this.element.appendChild(node)
    return this
  }

  public on(name: string, proc: any) {
    this.element[name] = proc
    return this
  }

  public childs() {
    return this.element.childNodes.length
  }

  public child(index: number) {
    return this.element.childNodes[index] as HTMLElement
  }

  public parent() {
    return new Builder(this.element.parentNode as HTMLElement)
  }

  public hide() {
    this.element.setAttribute("visible", 'false')
    return this
  }

  public show() {
    this.element.removeAttribute("visible")
    return this
  }

  public render() {
    document.body.appendChild(this.element)
    return this
  }

  public erase() {
    document.body.removeChild(this.element)
    return this
  }

  public move(x: number, y: number) {
    this.element.style.left = `${x}px`
    this.element.style.top = `${y}px`
    return this
  }

  public size(width: number, height: number) {
    this.element.style.width = `${width}px`
    this.element.style.height = `${height}px`
    return this
  }

  public width(value: number) {
    this.element.style.width = `${value}px`
    return this
  }

  public height(value: number) {
    this.element.style.height = `${value}px`
    return this
  }

  public get offsetLeft(): number {
    return this.element.offsetLeft
  }

  public get offsetTop(): number {
    return this.element.offsetTop
  }

  public get offsetWidth(): number {
    return this.element.offsetWidth
  }

  public get offsetHeight(): number {
    return this.element.offsetHeight
  }
}
