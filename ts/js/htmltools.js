window.HTMLElement.prototype.show = function() {
	this.removeAttribute("visible")
	return this
}
window.HTMLElement.prototype.hide = function() {
	this.setAttribute("visible", false)
	return this
}
window.HTMLElement.prototype.move = function(x, y) {
	this.style.left = x.toString() + "px"
	this.style.top = y.toString() + "px"
	return this;
}
window.HTMLElement.prototype.left = function(x) {
	this.style.left = x.toString() + "px"
	return this
}
window.HTMLElement.prototype.top = function(y) {
	this.style.top = y.toString() + "px"
	return this
}
window.HTMLElement.prototype.width = function(w) {
	this.style.width = w.toString() + "px"
	return this
}
window.HTMLElement.prototype.height = function(h) {
	this.style.height = h.toString() + "px"
	return this
}

window.HTMLElement.prototype.append = function(html) {
	return this
}
