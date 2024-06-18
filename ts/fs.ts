namespace Hion {
	export function getFileNode(location: string) {
		if(location === "") {
			return null
		}
		
		let fs: FS
		if(location.startsWith("/local")) {
			fs = new LocalFS()
		} else {
			fs = new RemoteFS()
		}
		
		return new FSNode(fs, location)
	}

	declare type ErrorCallback = (error: number) => void
	declare type ListCallback = (error: number, nodes: FSNode[]) => void
	declare type DataCallback = (error: number, data?: string) => void

	export class FSNode {
		isFile: boolean
		name: string
		date: string
		path: string
		mime: string
		size: number

		constructor(public fs: FS, location?: string) {
			if (location) {
				const p = fs.getPath(location)
				this.name = p.name
				this.path = p.path
			} else {
				this.name = ""
				this.path = ""
			}
			this.mime = ""
			this.size = 0
			this.isFile = false
		}

		location(): string {
			return this.path + "/" + this.name
		}

		read(callback: DataCallback) {
			this.fs.read(this.location(), callback)
		}

		readArray(callback: DataCallback) {
			this.read(callback)
		}

		write(data: string, callback: ErrorCallback) {
			this.fs.write(this.location(), data, callback)
		}

		remove(callback: ErrorCallback) {
			this.fs.remove(this.location(), callback)
		}

		list(callback: ListCallback) {
			this.fs.list(this.location(), callback)
		}

		mkdir(callback: ErrorCallback) {
			this.fs.mkdir(this.location(), callback)
		}

		sizeDisplay() {
			if(this.size < 1024) {
				return this.size.toString()
			}
			if(this.size < 1024*1024) {
				return Math.floor(this.size / 1024 * 10)/10 + "Kb"
			}
			if(this.size < 1024*1024*1024) {
				return Math.floor(this.size / (1024*1024) * 10)/10 + "Mb"
			}
			return Math.floor(this.size / (1024*1024*1024) * 10)/10 + "Gb"
		}
	}

	export class DesktopFSNode extends FSNode {
		constructor(private readonly desktopFile: File) {
			super(null);

			this.isFile = true;
			this.name = desktopFile.name
			this.size = desktopFile.size
			this.mime = desktopFile.type
			this.desktopFile = desktopFile
		}

		read(callback: DataCallback) {
			const reader = new FileReader()
			reader.onload = (e: any) => {
				callback(0, e.target.result)
			}
			reader.readAsText(this.desktopFile)
		}

		readArray(callback: DataCallback) {
			const reader = new FileReader()
			reader.onload = (e: any) => {
				callback(0, e.target.result)
			}
			reader.readAsArrayBuffer(this.desktopFile)
		}
	}

	//------------------------------------------------------------------------------
	interface LocationPath {
		name: string
		path: string
	}

	export class FS {
		getPath(location: string): LocationPath {
			if (location.charAt(location.length-1) === "/") {
				location = location.substring(0, location.length-1)
			}
			const i = location.lastIndexOf("/")
			return {
				path: location.substring(0, i),
				name: location.substring(i+1)
			}
		}

		private __supportError = function() { console.error("Not supported"); }

		list(dir: string, callback: ListCallback) { this.__supportError(); }
		mkdir(dir: string, callback: ErrorCallback) { this.__supportError(); }
		rmdir(dir: string, callback: ErrorCallback) { this.__supportError(); }

		remove(file: string, callback: ErrorCallback) { this.__supportError(); }
		move(fileOld: string, fileNew: string, callback: ErrorCallback) {
			this.read(fileOld, (error, data) => {
				if(error === 0) {
					this.remove(fileOld, error => {
						if(error === 0) {
							this.write(fileNew, data, error => {
								if(error === 0) {
									callback(0)
								} else {
									callback(3)
								}
							})
						} else {
							callback(2)
						}
					})
				} else {
					callback(1)
				}
			})
		}
		read(file: string, callback: DataCallback) { this.__supportError(); }
		write(file: string, data: string, callback: ErrorCallback) { this.__supportError(); }
	}

	export class LocalFS extends FS {
		
		private __getKey(dir: string) {
			return dir.replace(/\//g, "_");
		}

		private _loadList(folder: string, data: string): Array<FSNode> {
			const nodes = []
			const lines = JSON.parse(data)
			for (const i in lines) {
				const node = new FSNode(this)
				node.name = i
				node.isFile = lines[i] == 0
				node.path = folder
				node.size = 0
				node.date = ""
				nodes.push(node)
				node.read(function(error, data){
					if (error === 0) {
						node.size = data.length
					}
				})
			}
			return nodes;
		}

		list(dir: string, callback: ListCallback) {
			const key = this.__getKey(dir)
			if (window.localStorage[key]) {
				callback(0, this._loadList(dir, window.localStorage[key]))
			}
		}

		mkdir(dir: string, callback: ErrorCallback) {
			const node = this.getPath(dir)
			const key = this.__getKey(node.path)
			const list = window.localStorage[key] ? JSON.parse(window.localStorage[key]) : {}
			list[node.name] = 1
			window.localStorage[key] = JSON.stringify(list)
			callback(0)
		}

		rmdir(dir: string, callback: ErrorCallback) {
			const node = this.getPath(dir)
			const key1 = this.__getKey(dir)
			if (!window.localStorage[key1] || window.localStorage[key1] === "{}") {
				const key2 = this.__getKey(node.path)
				
				if (window.localStorage[key2]) {
					const list = JSON.parse(window.localStorage[key2])
					delete list[node.name]
					window.localStorage[key2] = JSON.stringify(list)
					callback(0)
				} else {
					callback(2)
				}
			} else {
				callback(1)
			}
		}

		remove(file: string, callback: ErrorCallback) {
			const node = this.getPath(file)
			let key = this.__getKey(node.path)
			const folder = window.localStorage[key]
			if (folder) {
				const list = JSON.parse(window.localStorage[key])
				delete list[node.name]
				window.localStorage[key] = JSON.stringify(list)
				key = this.__getKey(file)
				delete window.localStorage[key]
				callback(0)
			} else {
				callback(1)
			}
		}

		read(file: string, callback: DataCallback) {
			const key = this.__getKey(file)
			const data = window.localStorage[key]
			if(data) {
				callback(0, data)
			} else {
				callback(1)
			}
		}

		write(file: string, data: string, callback: ErrorCallback) {
			const node = this.getPath(file)
			const key1 = this.__getKey(node.path)
			let fList = window.localStorage[key1] || "{}"

			const list = JSON.parse(fList)
			if(!list[node.name]) {
				list[node.name] = 0
				window.localStorage[key1] = JSON.stringify(list)
			}
			const key2 = this.__getKey(file)
			window.localStorage[key2] = data
			callback(0)
		}
	}

	export class RemoteFS extends FS {
		
		private _loadList(folder: string, data: string): FSNode[] {
			const nodes = []
			const files = JSON.parse(data)
			for (const file of files) {
				const node = new FSNode(this)
				node.name = file.name
				node.isFile = file.folder === 0
				node.path = folder
				node.size = file.size
				node.date = file.date
				nodes.push(node)
			}
			return nodes
		}

		list(dir: string, callback: ListCallback) {
			$.get(API_FS_URL + "?dir=" + dir, (data: string) =>{
				callback(0, this._loadList(dir, data))
			})
		}

		mkdir(dir: string, callback: ErrorCallback) {
			$.post(API_FS_URL, {mkdir: dir}, (data: string) => {
				if(data) {
					const error = JSON.parse(data)
					callback(error.code)
				} else {
					callback(0)
				}
			})
		}

		rmdir(dir: string, callback: ErrorCallback) {
			$.post(API_FS_URL, { rm: dir }, (data: string) =>{
				if (data) {
					const error = JSON.parse(data)
					callback(error.code)
				} else {
					callback(0)
				}	
			})
		}

		remove(file: string, callback: ErrorCallback) {
			this.rmdir(file, callback)
		}

		read(file: string, callback: DataCallback) {
			$.post(API_FS_URL, {name: file, load: true}, function (data: string) {
				if(this.status == 200) {
					callback(0, data)
				} else {
					const error = JSON.parse(data)
					callback(error.code)
				}
			})
		}

		write(file: string, data: string, callback: ErrorCallback) {
			$.post(API_FS_URL, {name: file, sha: data, save: true}, function(data: string){
				if(data) {
					const error = JSON.parse(data)
					callback(error.code)
				} else {
					callback(0)
				}
			})
		}
	}
}