export class $ {
  public static get(id: string) {
    return document.getElementById(id)
  }

  public static appendChild(child: HTMLElement) {
    document.getElementsByTagName("body")[0].appendChild(child)
  }

  public static insertBefore(parent: HTMLElement, child: HTMLElement) {
    document.getElementsByTagName("body")[0].insertBefore(child, parent)
  }

  public static removeChildById(id: string) {
    document.getElementsByTagName("body")[0].removeChild($.get(id))
  }

  public static removeChild(child: HTMLElement) {
    document.getElementsByTagName("body")[0].removeChild(child)
  }

  public static appendScript(source: string, onload: () => void) {
    const sc = document.createElement("script")
    sc.src = source;
    sc.nonce = window['API_NONCE'];
    sc.type="text/javascript"
    if (onload) {
      sc.onload = onload
    }
    document.getElementsByTagName("head")[0].appendChild(sc)
  }

  public static cursor(cursor: string) {
    document.getElementsByTagName("body")[0].style.cursor = cursor
  }
}

