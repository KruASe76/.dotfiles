import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import * as ExtensionUtils from "resource:///org/gnome/shell/misc/extensionUtils.js";
import * as WindowMenu from "resource:///org/gnome/shell/ui/windowMenu.js";
import {Extension, InjectionManager, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

let old_buildMenu;
var unmess;

export default class Unmess extends Extension {
	constructor(metadata) {
		super(metadata);
	}

	enable() {
		this._injectionManager = new InjectionManager();
		unmess = this;
		this._seen = new Map();
		this._settings = this.getSettings();
		this.applyRules();
		this._restacked = global.display.connect('restacked', () => this.applyRules());

		this._injectionManager.overrideMethod(WindowMenu.WindowMenu.prototype, '_buildMenu',
			originalMethod => {
				return function(window) {
					originalMethod.call(this, window);
					let assign = new PopupMenu.PopupSubMenuMenuItem(_('Assign To'), true, {});
					assign.icon.icon_name = 'view-grid-symbolic';

					let item = {};
					let wks = unmess.assignedWorkspace(window);
					item = assign.menu.addAction(_('All Workspaces'), () => { assignAll(window); });
					if(wks == "all" || wks == "*") {
						item.setSensitive(false);
						item.setOrnament(PopupMenu.Ornament.DOT);
					}
					item = assign.menu.addAction(_('This Workspace'), () => { assignThis(window); });
					if(wks == window.get_workspace().index()+1) {
						item.setSensitive(false);
						item.setOrnament(PopupMenu.Ornament.DOT);
					}
					item = assign.menu.addAction(_('None'), () => { assignNone(window); });
					if(wks == "none" || wks == "" || wks == null) {
						item.setSensitive(false);
					}

					let pos = this.numMenuItems - 2;	// add our menu just before the separator before "Close"
					if(pos < 0) { pos = 0; }		// or, if the menu looks weird, add our menu at the top
					pos = 0;	// don't try to be clever
					this.addMenuItem(assign, pos);
				}
			});
	}

	disable() {
		this._injectionManager.clear();
		global.display.disconnect(this._restacked);
		this._seen.clear();
		this._settings = null;
		this._injectionManager = null;
		unmess = null;
	}

	applyRules() {
		let tracker = Shell.WindowTracker.get_default();

		for ( let wks=0; wks<global.workspace_manager.n_workspaces; ++wks ) {
			// construct a list with all windows
			let workspace_name = Meta.prefs_get_workspace_name(wks);
			let metaWorkspace = global.workspace_manager.get_workspace_by_index(wks);
			let windows = metaWorkspace.list_windows();             
			windows = windows.filter(
				function(w) {
					return !w.is_skip_taskbar();
				}
			);

			if(windows.length) {
				for ( let i = 0; i < windows.length; ++i ) {
					let metaWindow = windows[i];
					if(!this._seen.get(metaWindow.get_id())) {
						//this._seen.set(metaWindow.get_id(), metaWindow.connect('workspace-changed', (w) => this.monitorWindow(w)));
						this.moveWindow(metaWindow);
					}
					this._seen.set(metaWindow.get_id(), true);
				}
			}
		}
	}

	monitorWindow(metaWindow) {
		//global.log("workspace changed:" + metaWindow.get_gtk_application_id() + " name:" + metaWindow.get_title() + " class:" + metaWindow.get_wm_class() + " class_instance:" + metaWindow.get_wm_class_instance() + " type:" + metaWindow.get_window_type());
	}

	moveWindow(metaWindow) {
		const _name = JSON.parse(this._settings.get_string("name"));
		const _application = JSON.parse(this._settings.get_string("application"));
		const _classgroup = JSON.parse(this._settings.get_string("classgroup"));
		const _classinstance = JSON.parse(this._settings.get_string("classinstance"));
		const _type = JSON.parse(this._settings.get_string("type"));

		//global.log("moving application:" + metaWindow.get_gtk_application_id() + " name:" + metaWindow.get_title() + " class:" + metaWindow.get_wm_class() + " class_instance:" + metaWindow.get_wm_class_instance());
		let wks = null;

		wks = matchworkspace(_type, typeName(metaWindow.get_window_type()));
		if((wks==null) || !moveTo(metaWindow, wks)) {
			wks = matchworkspace(_application, metaWindow.get_gtk_application_id());
			if((wks==null) || !moveTo(metaWindow, wks)) {
				wks = matchworkspace(_classinstance, metaWindow.get_wm_class_instance());
				if((wks==null) || !moveTo(metaWindow, wks)) {
					wks = matchworkspace(_classgroup, metaWindow.get_wm_class());
					if((wks==null) || !moveTo(metaWindow, wks)) {
						wks = matchworkspace(_name, metaWindow.get_title());
						if((wks==null) || !moveTo(metaWindow, wks)) {
						}
					}
				}
			}
		}
	}

	assignedWorkspace(metaWindow) {
		const _name = JSON.parse(this._settings.get_string("name"));
		const _application = JSON.parse(this._settings.get_string("application"));
		const _classgroup = JSON.parse(this._settings.get_string("classgroup"));
		const _classinstance = JSON.parse(this._settings.get_string("classinstance"));
		const _type = JSON.parse(this._settings.get_string("type"));

		//global.log("application:" + metaWindow.get_gtk_application_id() + " name:" + metaWindow.get_title() + " class:" + metaWindow.get_wm_class() + " class_instance:" + metaWindow.get_wm_class_instance());
		let wks = null;

		wks = matchworkspace(_type, typeName(metaWindow.get_window_type()));
		if(wks!=null) { return wks; }
		wks = matchworkspace(_application, metaWindow.get_gtk_application_id());
		if(wks!=null) { return wks; }
		wks = matchworkspace(_classinstance, metaWindow.get_wm_class_instance());
		if(wks!=null) { return wks; }
		wks = matchworkspace(_classgroup, metaWindow.get_wm_class());
		if(wks!=null) { return wks; }

		return "none";
	}

	assignWorkspace(window, wks) {
		let _name = JSON.parse(this._settings.get_string("name"));
		let _application = JSON.parse(this._settings.get_string("application"));
		let _classgroup = JSON.parse(this._settings.get_string("classgroup"));
		let _classinstance = JSON.parse(this._settings.get_string("classinstance"));
		let _type = JSON.parse(this._settings.get_string("type"));
		//global.log("assign application:" + window.get_gtk_application_id() + " name:" + window.get_title() + " class:" + window.get_wm_class() + " class_instance:" + window.get_wm_class_instance() + " to " + wks);

		let app = window.get_gtk_application_id();
		if (app) {
			_application[app] = wks;
			this._settings.set_string("application", JSON.stringify(_application));
		}
		let classgroup = window.get_wm_class();
		if (classgroup) {
			_classgroup[classgroup] = wks;
			this._settings.set_string("classgroup", JSON.stringify(_classgroup));
		}
		let classinstance = window.get_wm_class_instance();
		if (classinstance) {
			_classinstance[classinstance] = wks;
			this._settings.set_string("classinstance", JSON.stringify(_classinstance));
		}
	}

	activateWindow(metaWorkspace, metaWindow) {
		if(!metaWindow.is_on_all_workspaces()) { metaWorkspace.activate(global.get_current_time()); }
		metaWindow.unminimize();
		metaWindow.activate(0);
	}
}

function moveTo(metaWindow, wks) {
	if(wks==null || metaWindow.is_on_all_workspaces()) { return false; } // nothing to do

	//global.log("moving application:" + metaWindow.get_gtk_application_id() + " name:" + metaWindow.get_title() + " class:" + metaWindow.get_wm_class() + " class_instance:" + metaWindow.get_wm_class_instance() + " to " + wks);

	if(wks == "" || wks == "none") {
		return true;
	}
	if(wks <= 0 || wks == "*" || wks == "all") {
		metaWindow.stick();
	} else {
		metaWindow.change_workspace_by_index(wks-1, true);
		metaWindow.get_workspace().activate_with_focus(metaWindow, 0);
	}

	return true;
}

function assignAll(window) {
	unmess.assignWorkspace(window, "all");
	window.stick();
}

function assignThis(window) {
	unmess.assignWorkspace(window, window.get_workspace().index() + 1);
	window.unstick();
}

function assignNone(window) {
	unmess.assignWorkspace(window, "none");
	window.unstick();
}

function matchworkspace(rules, p) {
	if(rules == undefined) { return null; }

	if(p in rules) {
		return rules[p];	// exact match
	}

	p = String(p);
	for(let r in rules) {
		if(p.match(glob(r))) {	// pattern matching
			return rules[r];
		}
	}

	return null;
}

function typeName(t) {
	switch(t) {
		case Meta.WindowType.NORMAL: return "normal";
		case Meta.WindowType.DESKTOP: return "desktop";
		case Meta.WindowType.DOCK: return "dock";
		case Meta.WindowType.DIALOG: return "dialog";
		case Meta.WindowType.MODAL_DIALOG: return "modal";
		case Meta.WindowType.TOOLBAR: return "toolbar";
		case Meta.WindowType.MENU: return "menu";
		case Meta.WindowType.UTILITY: return "utility";
		case Meta.WindowType.SPLASHSCREEN: return "splashscreen";
		case Meta.WindowType.DROPDOWN_MENU: return "dropdown";
		case Meta.WindowType.POPUP_MENU: return "popup";
		case Meta.WindowType.TOOLTIP: return "tooltip";
		case Meta.WindowType.NOTIFICATION: return "notification";
		case Meta.WindowType.COMBO: return "combo";
		case Meta.WindowType.DND: return "dnd";
		default:
			return "";
	}
}

// convert a bash-like glob ( *.txt, {*.jpeg,*.jpg}...) into regular expression
function glob(str) {
	let regex = "";
	let group = false;

	for (var i = 0, len = str.length; i < len; i++) {
		let c = str[i];

		switch (c) {
			case "/":
			case "$":
			case "^":
			case "+":
			case ".":
			case "(":
			case ")":
			case "=":
			case "!":
			case "|":
				regex += "\\" + c;	// escape special chars
				break;
			case "*":
				regex += ".*";
				break;
			case "?":
				regex += ".";
				break;
			case "{":
				group = true;
				regex += "(";
				break;
			case "}":
				group = false;
				regex += ")";
				break;
			case ",":
				if (group) {
					regex += "|";
					break;
				}
				regex += "\\" + c;
				break;
			default:
				regex += c;
		}
	}

	return "^" + regex + "$";
}
