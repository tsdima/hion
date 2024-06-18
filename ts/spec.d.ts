declare namespace Hion {

	interface ElementLayoutOptions {
		grow?: number;
		shrink?: number;
		alignSelf?: number;
		margin?: number;
	}

	class UIControl {
		layout: any;
		left: number;
		top: number;
		width: number;
		height: number;
		tabIndex: number;
		visible: boolean;
		parent: UIContainer;
		protected _ctl: BuilderElementType;

		constructor(options);

		setOptions(options);

		setLayoutOptions(options: ElementLayoutOptions);

		free();

		show();

		hide();

		addListener(event, callback);

		getControl(): BuilderElementType;

		setDisabled(value);

		place(x, y, w, h);

		appendTo(node: BuilderElementType);
	}

	class UIContainer extends UIControl {
		add(control);

		getContainer(): BuilderElementType;

		remove(control);

		removeAll();

		insert(control: UIControl, before: UIControl);

		each(callback);

		get(index: number): UIControl;
	}

	class Panel extends UIContainer {
	}

	class Dialog extends UIContainer {
		caption: string;
		form: HTMLElement;

		getButton(index: number): HTMLElement;
		close(): void
	}

	class Edit extends UIControl {
		text: string;
	}

	class Label extends UIControl {
		caption: string;
	}

	class Button extends UIControl {
	}

	class UIImage extends UIControl {
		url: string;
	}

	class TabControl extends UIContainer {
		onclose: (tab: Tab) => void;
		onselect: (tab: Tab) => void;

		addTab(name, title);

		select(tab: Tab);
	}

	class UILoader extends UIControl {
	}

	class TrackBar extends UIControl {
		position: number;
	}

	class Tab extends UIControl {
		icon: string;
		caption: string;
		title: string;

		save(value);

		load(value);
	}

	class Spoiler extends UIControl {
		opened: boolean;

		body(): Builder;

		onchange: () => void;
	}

	class Splitter extends UIControl {
		onresize: () => void;

		setManage(control: UIControl);
	}

	class ToolButton extends UIControl {
		enabled: boolean;
		checked: boolean;
		tag: any;
	}

	class ToolBar extends UIControl {
		constructor(buttons: Array<any>);

		getButtonByTag(name: string);

		each(callback: (item: ToolButton) => void);
	}

	class ListBox extends UIControl {
		items: Array<string>;
		onselect: (item, text) => any;
		oncheck: (item, text) => any;

		clear();

		size();

		addIcon(text, icon);

		selectIndex(index);

		checked(item, value);
	}

	interface UISimpleTableRow {
		index: number
		data: Array<any>
	}

	class UISimpleTable extends UIControl {
		onrowselect: (item: any, index: number) => any;
		onrowclick: (item: any, index: number) => any;

		getSelectionRow(): UISimpleTableRow

		clear(): void

		addRow(data: Array<any>): void

		selectIndex(index: number): void
		removeSelection(): void
		size(): number
	}

	class InfoPanel {
		error(text: string);

		info(text: string);
	}

	interface LayoutOptions {
		wrap?: number;
		justifyContent?: number;
		alignItems?: number;
		alignContent?: number;
		padding?: number;
	}

	class VLayout {
		constructor(element: any, options: LayoutOptions);
	}

	class HLayout {
		constructor(element: any, options: LayoutOptions);
	}

	class FixLayout {
		constructor(element: any);
	}

	type BuilderElementType = HTMLElement|HTMLCanvasElement|HTMLImageElement

	class Builder {
		element: BuilderElementType;

		constructor(element: BuilderElementType);
		constructor();

		n(element: string): Builder;

		div(className: string): Builder;

		span(className: string): Builder;

		checkbox(className: string): Builder;

		inputbox(className: string): Builder;

		class(name: string): Builder;

		html(name: string): Builder;

		id(name: string): Builder;

		checked(value: boolean): Builder;
		checked(): boolean;

		value(value: string): Builder;
		value(): string;

		scrollLeft(value: number): Builder;
		scrollLeft(): number;

		scrollTop(value: number): Builder;
		scrollTop(): number;

		attr(name: string, value: any): Builder;

		htmlAttr(name: string, value: any): Builder;

		style(name: string, value: any): Builder;

		on(name: string, func: any): Builder;

		append(node: BuilderElementType): Builder;

		childs(): number;

		child(index: number): BuilderElementType;

		parent(): Builder;

		show(): Builder;

		hide(): Builder;

		render(): Builder;

		erase(): Builder;

		move(x: number, y: number): Builder;

		size(w: number, h: number): Builder;
	}

	let $: any;
// declare var $: { get: any; appendScript: any; }
}