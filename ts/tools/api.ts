type ResponseData = (data: string, object?: object) => void

export class API {
  public static get(url: string, callback: ResponseData, object?: object) {
    if (url.match(/^\/server\//)) {
      callback("{}", object);
      return;
    }
    if (url.match(/^\//)) url = url.substring(1);
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.send()

    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return

      callback.call(xhr, xhr.responseText, object)
    }
  }

  public static post(url: string, data: object, callback: ResponseData, object?: object) {
    if (url.match(/^\/server\//)) {
      if (data['load']) {
        API.get(data['name'], callback, object);
        return;
      } else {
        callback("{}", object);
        return;
      }
    }
    if (url.match(/^\//)) url = url.substring(1);
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    //xhr.responseType    = "arraybuffer"
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    let require = ""
    for (const name in data) {
      if (require) {
        require += "&"
      }
      require += name + "=" + encodeURIComponent(data[name])
    }
    xhr.send(require)

    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return

      callback.call(xhr, xhr.responseText, object)
    }
  }
}
