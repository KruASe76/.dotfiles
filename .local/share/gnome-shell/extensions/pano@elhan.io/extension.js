import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as extension_js from 'resource:///org/gnome/shell/extensions/extension.js';
import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import Clutter from 'gi://Clutter';
import { Button } from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { PopupSwitchMenuItem, PopupDummyMenu, PopupSeparatorMenuItem, PopupMenuItem } from 'resource:///org/gnome/shell/ui/popupMenu.js';
import GObject from 'gi://GObject';
import St from 'gi://St';
import { MessageDialogContent } from 'resource:///org/gnome/shell/ui/dialog.js';
import { ModalDialog } from 'resource:///org/gnome/shell/ui/modalDialog.js';
import GSound from 'gi://GSound';
import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import * as animationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';
import { MonitorConstraint } from 'resource:///org/gnome/shell/ui/layout.js';
import * as main from 'resource:///org/gnome/shell/ui/main.js';
import { Notification, Source } from 'resource:///org/gnome/shell/ui/messageTray.js';
import { Lightbox } from 'resource:///org/gnome/shell/ui/lightbox.js';
import Gda from 'gi://Gda?version>=5.0';
import Pango from 'gi://Pango';
import Graphene from 'gi://Graphene';
import formatDistanceToNow from './thirdparty/date_fns_formatDistanceToNow.js';
import * as dateLocale from './thirdparty/date_fns_locale.js';
import PrismJS from './thirdparty/prismjs.js';
import prettyBytes from './thirdparty/pretty_bytes.js';
import Soup from 'gi://Soup';
import * as htmlparser2 from './thirdparty/htmlparser2.js';
import convert from './thirdparty/hex_color_converter.js';
import hljs from './thirdparty/highlight_js_lib_core.js';
import bash from './thirdparty/highlight_js_lib_languages_bash.js';
import c from './thirdparty/highlight_js_lib_languages_c.js';
import cpp from './thirdparty/highlight_js_lib_languages_cpp.js';
import csharp from './thirdparty/highlight_js_lib_languages_csharp.js';
import dart from './thirdparty/highlight_js_lib_languages_dart.js';
import go from './thirdparty/highlight_js_lib_languages_go.js';
import groovy from './thirdparty/highlight_js_lib_languages_groovy.js';
import haskell from './thirdparty/highlight_js_lib_languages_haskell.js';
import java from './thirdparty/highlight_js_lib_languages_java.js';
import javascript from './thirdparty/highlight_js_lib_languages_javascript.js';
import julia from './thirdparty/highlight_js_lib_languages_julia.js';
import kotlin from './thirdparty/highlight_js_lib_languages_kotlin.js';
import lua from './thirdparty/highlight_js_lib_languages_lua.js';
import markdown from './thirdparty/highlight_js_lib_languages_markdown.js';
import perl from './thirdparty/highlight_js_lib_languages_perl.js';
import php from './thirdparty/highlight_js_lib_languages_php.js';
import python from './thirdparty/highlight_js_lib_languages_python.js';
import ruby from './thirdparty/highlight_js_lib_languages_ruby.js';
import rust from './thirdparty/highlight_js_lib_languages_rust.js';
import scala from './thirdparty/highlight_js_lib_languages_scala.js';
import shell from './thirdparty/highlight_js_lib_languages_shell.js';
import sql from './thirdparty/highlight_js_lib_languages_sql.js';
import swift from './thirdparty/highlight_js_lib_languages_swift.js';
import typescript from './thirdparty/highlight_js_lib_languages_typescript.js';
import yaml from './thirdparty/highlight_js_lib_languages_yaml.js';
import isUrl from './thirdparty/is_url.js';
import { validateHTMLColorRgb, validateHTMLColorHex, validateHTMLColorName } from './thirdparty/validate_color.js';

function _mergeNamespaces(n, m) {
    for (let i = 0; i < m.length; i++) {
        const e = m[i];
        if (typeof e !== 'string' && !Array.isArray(e)) { for (const k in e) {
            if (k !== 'default' && !(k in n)) {
                const d = Object.getOwnPropertyDescriptor(e, k);
                if (d) {
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            }
        } }
    }
    return Object.freeze(n);
}

const extension = /*#__PURE__*/_mergeNamespaces({
    __proto__: null
}, [extension_js]);

function __decorate(decorators, target, key, desc) {
    let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (let i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    let e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// Taken from https://github.com/material-shell/material-shell/blob/main/src/utils/gjs.ts
/// Decorator function to call `GObject.registerClass` with the given class.
/// Use like
/// ```
/// @registerGObjectClass
/// export class MyThing extends GObject.Object { ... }
/// ```
function registerGObjectClass(target) {
    // Note that we use 'hasOwnProperty' because otherwise we would get inherited meta infos.
    // This would be bad because we would inherit the GObjectName too, which is supposed to be unique.
    if (Object.prototype.hasOwnProperty.call(target, 'metaInfo')) {
        // eslint-disable-next-line
        // @ts-ignore
        // eslint-disable-next-line
        return GObject.registerClass(target.metaInfo, target);
    }
    else {
        // eslint-disable-next-line
        // @ts-ignore
        return GObject.registerClass(target);
    }
}

const logger = (prefix) => (content) => console.log(`[pano] [${prefix}] ${content}`);
const debug$8 = logger('shell-utils');
const deleteFile = (file) => {
    return new Promise((resolve, reject) => {
        file.delete_async(GLib.PRIORITY_DEFAULT, null, (_file, res) => {
            try {
                resolve(file.delete_finish(res));
            }
            catch (e) {
                reject(e);
            }
        });
    });
};
const deleteDirectory = async (file) => {
    try {
        const iter = await new Promise((resolve, reject) => {
            file.enumerate_children_async('standard::type', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null, (file, res) => {
                try {
                    resolve(file?.enumerate_children_finish(res));
                }
                catch (e) {
                    reject(e);
                }
            });
        });
        if (!iter) {
            return;
        }
        const branches = [];
        while (true) {
            const infos = await new Promise((resolve, reject) => {
                iter.next_files_async(10, GLib.PRIORITY_DEFAULT, null, (it, res) => {
                    try {
                        resolve(it ? it.next_files_finish(res) : []);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
            if (infos.length === 0) {
                break;
            }
            for (const info of infos) {
                const child = iter.get_child(info);
                const type = info.get_file_type();
                let branch;
                switch (type) {
                    case Gio.FileType.REGULAR:
                    case Gio.FileType.SYMBOLIC_LINK:
                        branch = deleteFile(child);
                        break;
                    case Gio.FileType.DIRECTORY:
                        branch = deleteDirectory(child);
                        break;
                    default:
                        continue;
                }
                branches.push(branch);
            }
        }
        await Promise.all(branches);
    }
    catch (e) {
    }
    finally {
        return deleteFile(file);
    }
};
const getAppDataPath = (ext) => `${GLib.get_user_data_dir()}/${ext.uuid}`;
const getImagesPath = (ext) => `${getAppDataPath(ext)}/images`;
const getCachePath = (ext) => `${GLib.get_user_cache_dir()}/${ext.uuid}`;
const setupAppDirs = (ext) => {
    const imagePath = Gio.File.new_for_path(getImagesPath(ext));
    if (!imagePath.query_exists(null)) {
        imagePath.make_directory_with_parents(null);
    }
    const cachePath = Gio.File.new_for_path(getCachePath(ext));
    if (!cachePath.query_exists(null)) {
        cachePath.make_directory_with_parents(null);
    }
    const dbPath = Gio.File.new_for_path(`${getDbPath(ext)}`);
    if (!dbPath.query_exists(null)) {
        dbPath.make_directory_with_parents(null);
    }
};
const deleteAppDirs = async (ext) => {
    const appDataPath = Gio.File.new_for_path(getAppDataPath(ext));
    if (appDataPath.query_exists(null)) {
        await deleteDirectory(appDataPath);
    }
    const cachePath = Gio.File.new_for_path(getCachePath(ext));
    if (cachePath.query_exists(null)) {
        await deleteDirectory(cachePath);
    }
    const dbPath = Gio.File.new_for_path(`${getDbPath(ext)}/pano.db`);
    if (dbPath.query_exists(null)) {
        dbPath.delete(null);
    }
};
const getDbPath = (ext) => {
    const path = getCurrentExtensionSettings(ext).get_string('database-location');
    if (!path) {
        return getAppDataPath(ext);
    }
    return path;
};
const getCurrentExtensionSettings = (ext) => ext.getSettings();
const loadInterfaceXML = (ext, iface) => {
    const uri = `file:///${ext.path}/dbus/${iface}.xml`;
    const file = Gio.File.new_for_uri(uri);
    try {
        const [, bytes] = file.load_contents(null);
        return new TextDecoder().decode(bytes);
    }
    catch (e) {
        debug$8(`Failed to load D-Bus interface ${iface}`);
    }
    return null;
};
let soundContext = null;
const playAudio = () => {
    try {
        if (!soundContext) {
            soundContext = new GSound.Context();
            soundContext.init(null);
        }
        const attr_event_id = GSound.ATTR_EVENT_ID;
        //TODO: log this in a better way!
        if (attr_event_id == null) {
            console.error("Can't use GSound.ATTR_EVENT_ID since it's null!");
            return;
        }
        soundContext.play_simple({
            [attr_event_id]: 'message',
        }, null);
    }
    catch (err) {
        debug$8(`failed to play audio: ${err}`);
    }
};
const removeSoundContext = () => {
    soundContext = null;
};
let debounceIds = [];
function debounce(func, wait) {
    let sourceId;
    return function (...args) {
        const debouncedFunc = function () {
            debounceIds = debounceIds.filter((id) => id !== sourceId);
            sourceId = null;
            func.apply(this, args);
            return GLib.SOURCE_REMOVE;
        };
        if (sourceId) {
            GLib.Source.remove(sourceId);
            debounceIds = debounceIds.filter((id) => id !== sourceId);
        }
        sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, wait, debouncedFunc);
        debounceIds.push(sourceId);
    };
}
const openLinkInBrowser = (url) => {
    try {
        Gio.app_info_launch_default_for_uri(url, null);
    }
    catch (e) {
        debug$8(`Failed to open url ${url}`);
    }
};
function gettext(ext) {
    return ext.gettext.bind(ext);
}

const debug$7 = logger('clear-history-dialog');
let ClearHistoryDialog = class ClearHistoryDialog extends ModalDialog {
    constructor(ext, onClear) {
        super();
        const _ = gettext(ext);
        this.onClear = onClear;
        this.cancelButton = this.addButton({
            label: _('Cancel'),
            action: this.onCancelButtonPressed.bind(this),
            key: Clutter.KEY_Escape,
            default: true,
        });
        this.clearButton = this.addButton({
            label: _('Clear'),
            action: this.onClearButtonPressed.bind(this),
        });
        const content = new MessageDialogContent({
            title: _('Clear History'),
            description: _('Are you sure you want to clear history?'),
        });
        this.contentLayout.add_child(content);
    }
    onCancelButtonPressed() {
        this.close();
    }
    async onClearButtonPressed() {
        this.cancelButton.set_reactive(false);
        this.clearButton.set_reactive(false);
        this.clearButton.set_label('Clearing...');
        try {
            await this.onClear();
        }
        catch (err) {
            debug$7(`err: ${err}`);
        }
        this.close();
    }
};
ClearHistoryDialog = __decorate([
    registerGObjectClass
], ClearHistoryDialog);

function getPanoItemTypes(ext) {
    const _ = gettext(ext);
    return {
        LINK: { classSuffix: 'link', title: _('Link'), iconPath: 'link-symbolic.svg', iconName: 'link-symbolic' },
        TEXT: { classSuffix: 'text', title: _('Text'), iconPath: 'text-symbolic.svg', iconName: 'text-symbolic' },
        EMOJI: { classSuffix: 'emoji', title: _('Emoji'), iconPath: 'emoji-symbolic.svg', iconName: 'emoji-symbolic' },
        FILE: { classSuffix: 'file', title: _('File'), iconPath: 'file-symbolic.svg', iconName: 'file-symbolic' },
        IMAGE: { classSuffix: 'image', title: _('Image'), iconPath: 'image-symbolic.svg', iconName: 'image-symbolic' },
        CODE: { classSuffix: 'code', title: _('Code'), iconPath: 'code-symbolic.svg', iconName: 'code-symbolic' },
        COLOR: { classSuffix: 'color', title: _('Color'), iconPath: 'color-symbolic.svg', iconName: 'color-symbolic' },
    };
}
const ICON_PACKS = ['default', 'legacy'];

// compatibility functions for Gda 5.0 and 6.0
function isGda6Builder(builder) {
    return builder.add_expr_value.length === 1;
}
/**
 * This is hack for libgda6 <> libgda5 compatibility.
 *
 * @param value any
 * @returns expr id
 */
function add_expr_value(builder, value) {
    if (isGda6Builder(builder)) {
        return builder.add_expr_value(value);
    }
    return builder.add_expr_value(null, value);
}
// compatibility functions for gnome-shell 45 / 46
function isGnome45Notifications() {
    return Source.prototype.addNotification === undefined;
}
function newNotification(source, text, banner, transient_, params) {
    if (isGnome45Notifications()) {
        // @ts-expect-error gnome 45 type
        const notification = new Notification(source, text, banner, {
            datetime: GLib.DateTime.new_now_local(),
            ...params,
        });
        notification.setTransient(transient_);
        return notification;
    }
    return new Notification({
        source: source,
        title: text,
        body: banner,
        datetime: GLib.DateTime.new_now_local(),
        isTransient: transient_,
        ...params,
    });
}
function newMessageTraySource(title, iconName) {
    if (isGnome45Notifications()) {
        // @ts-expect-error gnome 45 type
        return new Source(title, iconName);
    }
    return new Source({ title, iconName });
}
function addNotification(source, notification) {
    if (source.showNotification !== undefined) {
        // @ts-expect-error gnome 45 type, can also be in some earlier versions of gnome 46, so using an explicit check for undefined, so that it works everywhere
        source.showNotification(notification);
    }
    else {
        source.addNotification(notification);
    }
}
function scrollViewAddChild(scrollView, actor) {
    if (scrollView.add_actor !== undefined) {
        // @ts-expect-error gnome 45 type, or even some gnome 46 distros do support that, so using this check, instead of isGnome45()!
        scrollView.add_actor(actor);
    }
    else {
        scrollView.set_child(actor);
    }
}
function getScrollViewAdjustment(scrollView, type) {
    if (scrollView.vadjustment !== undefined) {
        if (type === 'v') {
            return scrollView.vadjustment;
        }
        return scrollView.hadjustment;
    }
    else {
        if (type === 'v') {
            return scrollView.vscroll.adjustment;
        }
        return scrollView.hscroll.adjustment;
    }
}

const global$2 = Shell.Global.get();
const notify = (ext, text, body, iconOrPixbuf, pixelFormat) => {
    const _ = gettext(ext);
    const source = newMessageTraySource(_('Pano'), 'edit-copy-symbolic');
    main.messageTray.add(source);
    let notification;
    if (iconOrPixbuf) {
        if (iconOrPixbuf instanceof GdkPixbuf.Pixbuf) {
            const content = St.ImageContent.new_with_preferred_size(iconOrPixbuf.width, iconOrPixbuf.height);
            content.set_bytes(iconOrPixbuf.read_pixel_bytes(), pixelFormat || Cogl.PixelFormat.RGBA_8888, iconOrPixbuf.width, iconOrPixbuf.height, iconOrPixbuf.rowstride);
            notification = newNotification(source, text, body, true, { gicon: content });
        }
        else {
            notification = newNotification(source, text, body, true, { gicon: iconOrPixbuf });
        }
    }
    else {
        notification = newNotification(source, text, body, true, {});
    }
    addNotification(source, notification);
};
const wiggle = (actor, { offset, duration, wiggleCount }) => animationUtils.wiggle(actor, { offset, duration, wiggleCount });
const wm = main.wm;
const getMonitors = () => main.layoutManager.monitors;
const getMonitorIndexForPointer = () => {
    const [x, y] = global$2.get_pointer();
    const monitors = getMonitors();
    for (let i = 0; i <= monitors.length; i++) {
        const monitor = monitors[i];
        //TODO: debug this issue, sometimes (around 20% of the time) monitor[1] (on my dual monitor setup) is undefined
        if (!monitor) {
            continue;
        }
        if (x >= monitor.x && x < monitor.x + monitor.width && y >= monitor.y && y < monitor.y + monitor.height) {
            return i;
        }
    }
    return main.layoutManager.primaryIndex;
};
const getMonitorConstraint = () => new MonitorConstraint({
    index: getMonitorIndexForPointer(),
});
const addTopChrome = (actor, options) => main.layoutManager.addTopChrome(actor, options);
const removeChrome = (actor) => main.layoutManager.removeChrome(actor);
let virtualKeyboard = null;
const getVirtualKeyboard = () => {
    if (virtualKeyboard) {
        return virtualKeyboard;
    }
    virtualKeyboard = Clutter.get_default_backend()
        .get_default_seat()
        .create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
    return virtualKeyboard;
};
const removeVirtualKeyboard = () => {
    virtualKeyboard = null;
};
const addToStatusArea = (ext, button) => {
    main.panel.addToStatusArea(ext.uuid, button, 1, 'right');
};
const openExtensionPreferences = (ext) => ext.openPreferences();
const WINDOW_POSITIONS = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
};
const getAlignment = (position) => {
    switch (position) {
        case WINDOW_POSITIONS.TOP:
            return [Clutter.ActorAlign.FILL, Clutter.ActorAlign.START];
        case WINDOW_POSITIONS.RIGHT:
            return [Clutter.ActorAlign.END, Clutter.ActorAlign.FILL];
        case WINDOW_POSITIONS.BOTTOM:
            return [Clutter.ActorAlign.FILL, Clutter.ActorAlign.END];
        case WINDOW_POSITIONS.LEFT:
            return [Clutter.ActorAlign.START, Clutter.ActorAlign.FILL];
    }
    return [Clutter.ActorAlign.FILL, Clutter.ActorAlign.END];
};
const isVertical = (position) => {
    return position === WINDOW_POSITIONS.LEFT || position === WINDOW_POSITIONS.RIGHT;
};

const debug$6 = logger('settings-menu');
let SettingsMenu = class SettingsMenu extends Button {
    constructor(ext, onClear, onToggle) {
        const _ = gettext(ext);
        super(0.5, 'Pano Indicator', false);
        this.ext = ext;
        this.onToggle = onToggle;
        this.settings = getCurrentExtensionSettings(this.ext);
        const isInIncognito = this.settings.get_boolean('is-in-incognito');
        this.icon = new St.Icon({
            gicon: Gio.icon_new_for_string(`${this.ext.path}/icons/hicolor/scalable/actions/${ICON_PACKS[this.settings.get_uint('icon-pack')]}-indicator${isInIncognito ? '-incognito-symbolic' : '-symbolic'}.svg`),
            styleClass: 'system-status-icon indicator-icon',
        });
        this.add_child(this.icon);
        const switchMenuItem = new PopupSwitchMenuItem(_('Incognito Mode'), this.settings.get_boolean('is-in-incognito'));
        switchMenuItem.connect('toggled', (item) => {
            this.settings.set_boolean('is-in-incognito', item.state);
        });
        this.incognitoChangeId = this.settings.connect('changed::is-in-incognito', () => {
            const isInIncognito = this.settings.get_boolean('is-in-incognito');
            switchMenuItem.setToggleState(isInIncognito);
            this.icon.set_gicon(Gio.icon_new_for_string(`${this.ext.path}/icons/hicolor/scalable/actions/${ICON_PACKS[this.settings.get_uint('icon-pack')]}-indicator${isInIncognito ? '-incognito-symbolic' : '-symbolic'}.svg`));
        });
        this.settings.connect('changed::icon-pack', () => {
            const isInIncognito = this.settings.get_boolean('is-in-incognito');
            this.icon.set_gicon(Gio.icon_new_for_string(`${this.ext.path}/icons/hicolor/scalable/actions/${ICON_PACKS[this.settings.get_uint('icon-pack')]}-indicator${isInIncognito ? '-incognito-symbolic' : '-symbolic'}.svg`));
        });
        if (this.menu instanceof PopupDummyMenu) {
            debug$6('error: menu us PopupDummyMenu, but it should be a normal menu!');
        }
        else {
            this.menu.addMenuItem(switchMenuItem);
            this.menu.addMenuItem(new PopupSeparatorMenuItem());
            const clearHistoryItem = new PopupMenuItem(_('Clear History'));
            clearHistoryItem.connect('activate', () => {
                const dialog = new ClearHistoryDialog(this.ext, onClear);
                dialog.open();
            });
            this.menu.addMenuItem(clearHistoryItem);
            this.menu.addMenuItem(new PopupSeparatorMenuItem());
            const settingsItem = new PopupMenuItem(_('Settings'));
            settingsItem.connect('activate', () => {
                openExtensionPreferences(this.ext);
            });
            this.menu.addMenuItem(settingsItem);
        }
    }
    animate() {
        if (this.settings.get_boolean('wiggle-indicator')) {
            wiggle(this.icon, { duration: 100, offset: 2, wiggleCount: 3 });
        }
    }
    vfunc_event(event) {
        if (event.type() === Clutter.EventType.BUTTON_PRESS) {
            if ([Clutter.BUTTON_PRIMARY, Clutter.BUTTON_MIDDLE].includes(event.get_button())) {
                this.onToggle();
                return Clutter.EVENT_STOP;
            }
            else if (this.menu && event.get_button() === Clutter.BUTTON_SECONDARY) {
                this.menu.toggle();
                return Clutter.EVENT_STOP;
            }
        }
        return super.vfunc_event(event);
    }
    destroy() {
        if (this.incognitoChangeId) {
            this.settings.disconnect(this.incognitoChangeId);
            this.incognitoChangeId = null;
        }
        super.destroy();
    }
};
SettingsMenu.metaInfo = {
    GTypeName: 'SettingsButton',
    Signals: {
        'item-selected': {},
        'menu-state-changed': {
            param_types: [GObject.TYPE_BOOLEAN],
            accumulator: 0,
        },
    },
};
SettingsMenu = __decorate([
    registerGObjectClass
], SettingsMenu);

class PanoIndicator {
    constructor(ext, onClear, onToggle) {
        this.indicatorChangeSignalId = null;
        this.settingsMenu = null;
        this.extension = ext;
        this.onClear = onClear;
        this.onToggle = onToggle;
    }
    createIndicator() {
        if (this.extension.getSettings().get_boolean('show-indicator')) {
            this.settingsMenu = new SettingsMenu(this.extension, this.onClear, this.onToggle);
            addToStatusArea(this.extension, this.settingsMenu);
        }
    }
    removeIndicator() {
        this.settingsMenu?.destroy();
        this.settingsMenu = null;
    }
    animate() {
        this.settingsMenu?.animate();
    }
    enable() {
        this.indicatorChangeSignalId = this.extension.getSettings().connect('changed::show-indicator', () => {
            if (this.extension.getSettings().get_boolean('show-indicator')) {
                this.createIndicator();
            }
            else {
                this.removeIndicator();
            }
        });
        if (this.extension.getSettings().get_boolean('show-indicator')) {
            this.createIndicator();
        }
        else {
            this.removeIndicator();
        }
    }
    disable() {
        if (this.indicatorChangeSignalId) {
            this.extension.getSettings().disconnect(this.indicatorChangeSignalId);
            this.indicatorChangeSignalId = null;
        }
        this.removeIndicator();
    }
}

let MonitorBox = class MonitorBox extends St.BoxLayout {
    constructor() {
        super({
            name: 'PanoMonitorBox',
            visible: false,
            reactive: true,
            x: 0,
            y: 0,
        });
        this.connect('button-press-event', () => {
            this.emit('hide_window');
            return Clutter.EVENT_STOP;
        });
        const constraint = new Clutter.BindConstraint({
            source: Shell.Global.get().stage,
            coordinate: Clutter.BindCoordinate.ALL,
        });
        this.add_constraint(constraint);
        const backgroundStack = new St.Widget({
            layoutManager: new Clutter.BinLayout(),
            xExpand: true,
            yExpand: true,
        });
        const _backgroundBin = new St.Bin({ child: backgroundStack });
        const _monitorConstraint = new MonitorConstraint({});
        _backgroundBin.add_constraint(_monitorConstraint);
        this.add_child(_backgroundBin);
        this._lightbox = new Lightbox(this, {
            inhibitEvents: true,
            radialEffect: false,
        });
        this._lightbox.highlight(_backgroundBin);
        this._lightbox.styleClass = 'pano-monitor-box';
        const _eventBlocker = new Clutter.Actor({ reactive: true });
        backgroundStack.add_child(_eventBlocker);
        main.uiGroup.add_child(this);
    }
    open() {
        this._lightbox.lightOn();
        this.show();
    }
    close() {
        this._lightbox.lightOff();
        this.hide();
    }
    vfunc_touch_event(event) {
        if (event.type() === Clutter.EventType.TOUCH_END) {
            this.emit('hide_window');
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    }
    destroy() {
        super.destroy();
    }
};
MonitorBox.metaInfo = {
    GTypeName: 'MonitorBox',
    Signals: {
        hide_window: {},
    },
};
MonitorBox = __decorate([
    registerGObjectClass
], MonitorBox);

const debug$5 = logger('database');
class ClipboardQuery {
    constructor(statement) {
        this.statement = statement;
    }
}
class ClipboardQueryBuilder {
    constructor() {
        this.conditions = [];
        this.builder = new Gda.SqlBuilder({
            stmt_type: Gda.SqlStatementType.SELECT,
        });
        this.builder.select_add_field('id', 'clipboard', 'id');
        this.builder.select_add_field('itemType', 'clipboard', 'itemType');
        this.builder.select_add_field('content', 'clipboard', 'content');
        this.builder.select_add_field('copyDate', 'clipboard', 'copyDate');
        this.builder.select_add_field('isFavorite', 'clipboard', 'isFavorite');
        this.builder.select_add_field('matchValue', 'clipboard', 'matchValue');
        this.builder.select_add_field('searchValue', 'clipboard', 'searchValue');
        this.builder.select_add_field('metaData', 'clipboard', 'metaData');
        this.builder.select_order_by(this.builder.add_field_id('copyDate', 'clipboard'), false, null);
        this.builder.select_add_target('clipboard', null);
    }
    withLimit(limit, offset) {
        this.builder.select_set_limit(add_expr_value(this.builder, limit), add_expr_value(this.builder, offset));
        return this;
    }
    withId(id) {
        if (id !== null && id !== undefined) {
            this.conditions.push(this.builder.add_cond(Gda.SqlOperatorType.EQ, this.builder.add_field_id('id', 'clipboard'), add_expr_value(this.builder, id), 0));
        }
        return this;
    }
    withItemTypes(itemTypes) {
        if (itemTypes !== null && itemTypes !== undefined) {
            const orConditions = itemTypes.map((itemType) => this.builder.add_cond(Gda.SqlOperatorType.EQ, this.builder.add_field_id('itemType', 'clipboard'), add_expr_value(this.builder, itemType), 0));
            this.conditions.push(this.builder.add_cond_v(Gda.SqlOperatorType.OR, orConditions));
        }
        return this;
    }
    withContent(content) {
        if (content !== null && content !== undefined) {
            this.conditions.push(this.builder.add_cond(Gda.SqlOperatorType.EQ, this.builder.add_field_id('content', 'clipboard'), add_expr_value(this.builder, content), 0));
        }
        return this;
    }
    withMatchValue(matchValue) {
        if (matchValue !== null && matchValue !== undefined) {
            this.conditions.push(this.builder.add_cond(Gda.SqlOperatorType.EQ, this.builder.add_field_id('matchValue', 'clipboard'), add_expr_value(this.builder, matchValue), 0));
        }
        return this;
    }
    withContainingContent(content) {
        if (content !== null && content !== undefined) {
            this.conditions.push(this.builder.add_cond(Gda.SqlOperatorType.LIKE, this.builder.add_field_id('content', 'clipboard'), add_expr_value(this.builder, `%${content}%`), 0));
        }
        return this;
    }
    withContainingSearchValue(searchValue) {
        if (searchValue !== null && searchValue !== undefined) {
            this.conditions.push(this.builder.add_cond(Gda.SqlOperatorType.LIKE, this.builder.add_field_id('searchValue', 'clipboard'), add_expr_value(this.builder, `%${searchValue}%`), 0));
        }
        return this;
    }
    withFavorites(include) {
        if (include !== null && include !== undefined) {
            this.conditions.push(this.builder.add_cond(Gda.SqlOperatorType.EQ, this.builder.add_field_id('isFavorite', 'clipboard'), add_expr_value(this.builder, +include), 0));
        }
        return this;
    }
    build() {
        if (this.conditions.length > 0) {
            this.builder.set_where(this.builder.add_cond_v(Gda.SqlOperatorType.AND, this.conditions));
        }
        return new ClipboardQuery(this.builder.get_statement());
    }
}
class Database {
    constructor() {
        this.connection = null;
    }
    init(ext) {
        this.connection = new Gda.Connection({
            provider: Gda.Config.get_provider('SQLite'),
            cncString: `DB_DIR=${getDbPath(ext)};DB_NAME=pano`,
        });
        this.connection.open();
    }
    setup(ext) {
        this.init(ext);
        if (!this.connection || !this.connection.is_opened()) {
            debug$5('connection is not opened');
            return;
        }
        this.connection.execute_non_select_command(`
      create table if not exists clipboard
      (
          id          integer not null constraint clipboard_pk primary key autoincrement,
          itemType    text not null,
          content     text not null,
          copyDate    text not null,
          isFavorite  integer not null,
          matchValue  text not null,
          searchValue text,
          metaData    text
      );
    `);
        this.connection.execute_non_select_command(`
      create unique index if not exists clipboard_id_uindex on clipboard (id);
    `);
    }
    save(dbItem) {
        if (!this.connection || !this.connection.is_opened()) {
            debug$5('connection is not opened');
            return null;
        }
        const builder = new Gda.SqlBuilder({
            stmt_type: Gda.SqlStatementType.INSERT,
        });
        builder.set_table('clipboard');
        //Note: casting required, since this is a gjs convention, that you don't have to pass a  GObject.Value, this is needed for teh C API, but GJS constructs it on the fly
        builder.add_field_value_as_gvalue('itemType', dbItem.itemType);
        builder.add_field_value_as_gvalue('content', dbItem.content);
        builder.add_field_value_as_gvalue('copyDate', dbItem.copyDate.toISOString());
        builder.add_field_value_as_gvalue('isFavorite', +dbItem.isFavorite);
        builder.add_field_value_as_gvalue('matchValue', dbItem.matchValue);
        if (dbItem.searchValue) {
            builder.add_field_value_as_gvalue('searchValue', dbItem.searchValue);
        }
        if (dbItem.metaData) {
            builder.add_field_value_as_gvalue('metaData', dbItem.metaData);
        }
        const [_, row] = this.connection.statement_execute_non_select(builder.get_statement(), null);
        const id = row?.get_nth_holder(0).get_value();
        if (!id) {
            return null;
        }
        return {
            id,
            itemType: dbItem.itemType,
            content: dbItem.content,
            copyDate: dbItem.copyDate,
            isFavorite: dbItem.isFavorite,
            matchValue: dbItem.matchValue,
            searchValue: dbItem.searchValue,
            metaData: dbItem.metaData,
        };
    }
    update(dbItem) {
        if (!this.connection || !this.connection.is_opened()) {
            debug$5('connection is not opened');
            return null;
        }
        const builder = new Gda.SqlBuilder({
            stmt_type: Gda.SqlStatementType.UPDATE,
        });
        builder.set_table('clipboard');
        //Note: casting required, since this is a gjs convention, that you don't have to pass a  GObject.Value, this is needed for teh C API, but GJS constructs it on the fly
        builder.add_field_value_as_gvalue('itemType', dbItem.itemType);
        builder.add_field_value_as_gvalue('content', dbItem.content);
        builder.add_field_value_as_gvalue('copyDate', dbItem.copyDate.toISOString());
        builder.add_field_value_as_gvalue('isFavorite', +dbItem.isFavorite);
        builder.add_field_value_as_gvalue('matchValue', dbItem.matchValue);
        if (dbItem.searchValue) {
            builder.add_field_value_as_gvalue('searchValue', dbItem.searchValue);
        }
        if (dbItem.metaData) {
            builder.add_field_value_as_gvalue('metaData', dbItem.metaData);
        }
        builder.set_where(builder.add_cond(Gda.SqlOperatorType.EQ, builder.add_field_id('id', 'clipboard'), add_expr_value(builder, dbItem.id), 0));
        this.connection.statement_execute_non_select(builder.get_statement(), null);
        return dbItem;
    }
    delete(id) {
        if (!this.connection || !this.connection.is_opened()) {
            debug$5('connection is not opened');
            return;
        }
        const builder = new Gda.SqlBuilder({
            stmt_type: Gda.SqlStatementType.DELETE,
        });
        builder.set_table('clipboard');
        builder.set_where(builder.add_cond(Gda.SqlOperatorType.EQ, builder.add_field_id('id', 'clipboard'), add_expr_value(builder, id), 0));
        this.connection.statement_execute_non_select(builder.get_statement(), null);
    }
    query(clipboardQuery) {
        if (!this.connection || !this.connection.is_opened()) {
            return [];
        }
        // debug(`${clipboardQuery.statement.to_sql_extended(this.connection, null, StatementSqlFlag.PRETTY)}`);
        const dm = this.connection.statement_execute_select(clipboardQuery.statement, null);
        const iter = dm.create_iter();
        const itemList = [];
        while (iter.move_next()) {
            //Note: casting required, since this is a gjs convention, that any GObject.Value is just the value (e.g. string, number etc.) this types are from C, so there is no dynamic return value so they have to use GObject.Value
            const id = iter.get_value_for_field('id');
            const itemType = iter.get_value_for_field('itemType');
            const content = iter.get_value_for_field('content');
            const contentUnescaped = Gda.default_unescape_string(content) ?? content;
            const copyDate = iter.get_value_for_field('copyDate');
            const isFavorite = iter.get_value_for_field('isFavorite');
            const matchValue = iter.get_value_for_field('matchValue');
            const matchValueUnescaped = Gda.default_unescape_string(matchValue) ?? matchValue;
            const searchValue = iter.get_value_for_field('searchValue');
            const searchValueUnescaped = searchValue ? Gda.default_unescape_string(searchValue) ?? searchValue : undefined;
            const metaData = iter.get_value_for_field('metaData');
            itemList.push({
                id,
                itemType,
                content: contentUnescaped,
                copyDate: new Date(copyDate),
                isFavorite: !!isFavorite,
                matchValue: matchValueUnescaped,
                searchValue: searchValueUnescaped,
                metaData,
            });
        }
        return itemList;
    }
    start(ext) {
        if (!this.connection) {
            this.init(ext);
        }
        if (this.connection && !this.connection.is_opened()) {
            this.connection.open();
        }
    }
    shutdown() {
        if (this.connection && this.connection.is_opened()) {
            this.connection.close();
            this.connection = null;
        }
    }
}
const db = new Database();

const langs = GLib.get_language_names_with_category('LC_MESSAGES').map((l) => l.replaceAll('_', '').replaceAll('-', '').split('.')[0]);
const localeKey = Object.keys(dateLocale).find((key) => langs.includes(key));
let PanoItemHeader = class PanoItemHeader extends St.BoxLayout {
    constructor(ext, itemType, date) {
        super({
            styleClass: `pano-item-header pano-item-header-${itemType.classSuffix}`,
            vertical: false,
        });
        this.itemType = itemType;
        this.titleContainer = new St.BoxLayout({
            styleClass: 'pano-item-title-container',
            vertical: true,
            xExpand: true,
        });
        this.iconContainer = new St.BoxLayout({
            styleClass: 'pano-icon-container',
        });
        this.settings = getCurrentExtensionSettings(ext);
        const themeContext = St.ThemeContext.get_for_stage(Shell.Global.get().get_stage());
        this.set_height(56 * themeContext.scaleFactor);
        themeContext.connect('notify::scale-factor', () => {
            this.set_height(56 * themeContext.scaleFactor);
        });
        const icon = new St.Icon({
            styleClass: 'pano-item-title-icon',
            gicon: Gio.icon_new_for_string(`${ext.path}/icons/hicolor/scalable/actions/${ICON_PACKS[this.settings.get_uint('icon-pack')]}-${itemType.iconPath}`),
        });
        this.iconContainer.add_child(icon);
        this.settings.connect('changed::icon-pack', () => {
            icon.set_gicon(Gio.icon_new_for_string(`${ext.path}/icons/hicolor/scalable/actions/${ICON_PACKS[this.settings.get_uint('icon-pack')]}-${itemType.iconPath}`));
        });
        this.titleLabel = new St.Label({
            text: itemType.title,
            styleClass: 'pano-item-title',
            xExpand: true,
        });
        this.titleContainer.add_child(this.titleLabel);
        const options = {
            addSuffix: true,
        };
        if (localeKey !== undefined) {
            const locale = dateLocale[localeKey];
            if (locale) {
                options.locale = locale;
            }
        }
        this.dateLabel = new St.Label({
            text: formatDistanceToNow(date, options),
            styleClass: 'pano-item-date',
            xExpand: true,
            yExpand: true,
            xAlign: Clutter.ActorAlign.FILL,
            yAlign: Clutter.ActorAlign.CENTER,
        });
        this.dateUpdateIntervalId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
            this.dateLabel.set_text(formatDistanceToNow(date, options));
            return GLib.SOURCE_CONTINUE;
        });
        this.titleContainer.add_child(this.dateLabel);
        this.actionContainer = new St.BoxLayout({
            styleClass: 'pano-item-actions',
            xExpand: true,
            yExpand: true,
            xAlign: Clutter.ActorAlign.END,
            yAlign: Clutter.ActorAlign.START,
        });
        const favoriteIcon = new St.Icon({
            styleClass: 'pano-item-action-button-icon',
            iconName: 'starred-symbolic',
        });
        this.favoriteButton = new St.Button({
            styleClass: 'pano-item-action-button pano-item-favorite-button',
            child: favoriteIcon,
        });
        this.favoriteButton.connect('clicked', () => {
            this.emit('on-favorite');
            return Clutter.EVENT_PROPAGATE;
        });
        const removeIcon = new St.Icon({
            styleClass: 'pano-item-action-button-icon pano-item-action-button-remove-icon',
            iconName: 'window-close-symbolic',
        });
        const removeButton = new St.Button({
            styleClass: 'pano-item-action-button pano-item-remove-button',
            child: removeIcon,
        });
        removeButton.connect('clicked', () => {
            this.emit('on-remove');
            return Clutter.EVENT_PROPAGATE;
        });
        this.actionContainer.add_child(this.favoriteButton);
        this.actionContainer.add_child(removeButton);
        this.add_child(this.iconContainer);
        this.add_child(this.titleContainer);
        this.add_child(this.actionContainer);
        this.setStyle();
        this.settings.connect('changed::item-title-font-family', this.setStyle.bind(this));
        this.settings.connect('changed::item-title-font-size', this.setStyle.bind(this));
        this.settings.connect('changed::item-date-font-family', this.setStyle.bind(this));
        this.settings.connect('changed::item-date-font-size', this.setStyle.bind(this));
    }
    setStyle() {
        const itemTitleFontFamily = this.settings.get_string('item-title-font-family');
        const itemTitleFontSize = this.settings.get_int('item-title-font-size');
        const itemDateFontFamily = this.settings.get_string('item-date-font-family');
        const itemDateFontSize = this.settings.get_int('item-date-font-size');
        this.titleLabel.set_style(`font-family: ${itemTitleFontFamily}; font-size: ${itemTitleFontSize}px;`);
        this.dateLabel.set_style(`font-family: ${itemDateFontFamily}; font-size: ${itemDateFontSize}px;`);
    }
    setFavorite(isFavorite) {
        if (isFavorite) {
            this.favoriteButton.add_style_pseudo_class('active');
        }
        else {
            this.favoriteButton.remove_style_pseudo_class('active');
        }
    }
    destroy() {
        if (this.dateUpdateIntervalId) {
            GLib.source_remove(this.dateUpdateIntervalId);
            this.dateUpdateIntervalId = null;
        }
        super.destroy();
    }
};
PanoItemHeader.metaInfo = {
    GTypeName: 'PanoItemHeader',
    Signals: {
        'on-remove': {},
        'on-favorite': {},
    },
};
PanoItemHeader = __decorate([
    registerGObjectClass
], PanoItemHeader);

let PanoItem = class PanoItem extends St.BoxLayout {
    constructor(ext, clipboardManager, dbItem) {
        super({
            name: 'pano-item',
            visible: true,
            pivotPoint: Graphene.Point.alloc().init(0.5, 0.5),
            reactive: true,
            styleClass: 'pano-item',
            vertical: true,
            trackHover: true,
        });
        this.selected = null;
        this.clipboardManager = clipboardManager;
        this.dbItem = dbItem;
        this.settings = getCurrentExtensionSettings(ext);
        this.connect('key-focus-in', () => this.setSelected(true));
        this.connect('key-focus-out', () => this.setSelected(false));
        this.connect('enter-event', () => {
            Shell.Global.get().display.set_cursor(Meta.Cursor.POINTING_HAND);
            if (!this.selected) {
                this.set_style(`border: 4px solid ${this.settings.get_string('hovered-item-border-color')}`);
            }
        });
        this.connect('leave-event', () => {
            Shell.Global.get().display.set_cursor(Meta.Cursor.DEFAULT);
            if (!this.selected) {
                this.set_style('');
            }
        });
        this.connect('activated', () => {
            this.get_parent()?.get_parent()?.get_parent()?.hide();
            if (this.dbItem.itemType === 'LINK' && this.settings.get_boolean('open-links-in-browser')) {
                return;
            }
            if (this.settings.get_boolean('paste-on-select') && this.clipboardManager.isTracking) {
                // See https://github.com/SUPERCILEX/gnome-clipboard-history/blob/master/extension.js#L606
                this.timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, () => {
                    getVirtualKeyboard().notify_keyval(Clutter.get_current_event_time(), Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
                    getVirtualKeyboard().notify_keyval(Clutter.get_current_event_time(), Clutter.KEY_Control_L, Clutter.KeyState.PRESSED);
                    getVirtualKeyboard().notify_keyval(Clutter.get_current_event_time(), Clutter.KEY_v, Clutter.KeyState.PRESSED);
                    getVirtualKeyboard().notify_keyval(Clutter.get_current_event_time(), Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
                    getVirtualKeyboard().notify_keyval(Clutter.get_current_event_time(), Clutter.KEY_v, Clutter.KeyState.RELEASED);
                    if (this.timeoutId) {
                        GLib.Source.remove(this.timeoutId);
                    }
                    this.timeoutId = undefined;
                    return GLib.SOURCE_REMOVE;
                });
            }
        });
        this.header = new PanoItemHeader(ext, getPanoItemTypes(ext)[dbItem.itemType], dbItem.copyDate);
        this.header.setFavorite(this.dbItem.isFavorite);
        this.header.connect('on-remove', () => {
            this.emit('on-remove', JSON.stringify(this.dbItem));
            return Clutter.EVENT_PROPAGATE;
        });
        this.header.connect('on-favorite', () => {
            this.dbItem = { ...this.dbItem, isFavorite: !this.dbItem.isFavorite };
            this.emit('on-favorite', JSON.stringify(this.dbItem));
            return Clutter.EVENT_PROPAGATE;
        });
        this.connect('on-favorite', () => {
            this.header.setFavorite(this.dbItem.isFavorite);
            return Clutter.EVENT_PROPAGATE;
        });
        this.body = new St.BoxLayout({
            styleClass: 'pano-item-body',
            clipToAllocation: true,
            vertical: true,
            xAlign: Clutter.ActorAlign.FILL,
            yAlign: Clutter.ActorAlign.FILL,
            xExpand: true,
            yExpand: true,
        });
        this.add_child(this.header);
        this.add_child(this.body);
        const themeContext = St.ThemeContext.get_for_stage(Shell.Global.get().get_stage());
        themeContext.connect('notify::scale-factor', () => {
            this.setBodyDimensions();
        });
        this.settings.connect('changed::item-size', () => {
            this.setBodyDimensions();
        });
        this.settings.connect('changed::window-position', () => {
            this.setBodyDimensions();
        });
        this.setBodyDimensions();
    }
    setBodyDimensions() {
        const pos = this.settings.get_uint('window-position');
        if (pos === WINDOW_POSITIONS.LEFT || pos === WINDOW_POSITIONS.RIGHT) {
            this.set_x_align(Clutter.ActorAlign.FILL);
            this.set_y_align(Clutter.ActorAlign.START);
        }
        else {
            this.set_x_align(Clutter.ActorAlign.START);
            this.set_y_align(Clutter.ActorAlign.FILL);
        }
        const { scaleFactor } = St.ThemeContext.get_for_stage(Shell.Global.get().get_stage());
        this.body.set_height(this.settings.get_int('item-size') * scaleFactor - this.header.get_height());
        this.body.set_width(this.settings.get_int('item-size') * scaleFactor);
    }
    setSelected(selected) {
        if (selected) {
            const activeItemBorderColor = this.settings.get_string('active-item-border-color');
            this.set_style(`border: 4px solid ${activeItemBorderColor} !important;`);
            this.grab_key_focus();
        }
        else {
            this.set_style('');
        }
        this.selected = selected;
    }
    vfunc_key_press_event(event) {
        if (event.get_key_symbol() === Clutter.KEY_Return ||
            event.get_key_symbol() === Clutter.KEY_ISO_Enter ||
            event.get_key_symbol() === Clutter.KEY_KP_Enter) {
            this.emit('activated');
            return Clutter.EVENT_STOP;
        }
        if (event.get_key_symbol() === Clutter.KEY_Delete || event.get_key_symbol() === Clutter.KEY_KP_Delete) {
            this.emit('on-remove', JSON.stringify(this.dbItem));
            return Clutter.EVENT_STOP;
        }
        if ((event.get_key_symbol() === Clutter.KEY_S || event.get_key_symbol() === Clutter.KEY_s) &&
            event.get_state() === Clutter.ModifierType.CONTROL_MASK) {
            this.dbItem = { ...this.dbItem, isFavorite: !this.dbItem.isFavorite };
            this.emit('on-favorite', JSON.stringify(this.dbItem));
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    }
    vfunc_button_release_event(event) {
        if (event.get_button() === 1) {
            this.emit('activated');
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    }
    vfunc_touch_event(event) {
        if (event.type() === Clutter.EventType.TOUCH_END) {
            this.emit('activated');
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    }
    destroy() {
        if (this.timeoutId) {
            GLib.Source.remove(this.timeoutId);
            this.timeoutId = undefined;
        }
        this.header.destroy();
        super.destroy();
    }
};
PanoItem.metaInfo = {
    GTypeName: 'PanoItem',
    Signals: {
        activated: {},
        'on-remove': {
            param_types: [GObject.TYPE_STRING],
            accumulator: 0,
        },
        'on-favorite': {
            param_types: [GObject.TYPE_STRING],
            accumulator: 0,
        },
    },
};
PanoItem = __decorate([
    registerGObjectClass
], PanoItem);

const global$1 = Shell.Global.get();
const debug$4 = logger('clipboard-manager');
const MimeType = {
    TEXT: ['text/plain', 'text/plain;charset=utf-8', 'UTF8_STRING'],
    IMAGE: ['image/png'],
    GNOME_FILE: ['x-special/gnome-copied-files'],
    SENSITIVE: ['x-kde-passwordManagerHint'],
};
let ContentType;
(function (ContentType) {
    ContentType[ContentType["IMAGE"] = 0] = "IMAGE";
    ContentType[ContentType["FILE"] = 1] = "FILE";
    ContentType[ContentType["TEXT"] = 2] = "TEXT";
})(ContentType || (ContentType = {}));
const FileOperation = {
    CUT: 'cut',
    COPY: 'copy',
};
let ClipboardContent = class ClipboardContent extends GObject.Object {
    constructor(content) {
        super();
        this.content = content;
    }
};
ClipboardContent.metaInfo = {
    GTypeName: 'ClipboardContent',
};
ClipboardContent = __decorate([
    registerGObjectClass
], ClipboardContent);
const arraybufferEqual = (buf1, buf2) => {
    if (buf1 === buf2) {
        return true;
    }
    if (buf1.byteLength !== buf2.byteLength) {
        return false;
    }
    const view1 = new DataView(buf1.buffer);
    const view2 = new DataView(buf2.buffer);
    let i = buf1.byteLength;
    while (i--) {
        if (view1.getUint8(i) !== view2.getUint8(i)) {
            return false;
        }
    }
    return true;
};
const compareClipboardContent = (content1, content2) => {
    if (!content2) {
        return false;
    }
    if (content1.type !== content2.type) {
        return false;
    }
    if (content1.type === ContentType.TEXT) {
        return content1.value === content2.value;
    }
    if (content1.type === ContentType.IMAGE && content2.type === ContentType.IMAGE) {
        return arraybufferEqual(content1.value, content2.value);
    }
    if (content1.type === ContentType.FILE && content2.type === ContentType.FILE) {
        return (content1.value.operation === content2.value.operation &&
            content1.value.fileList.length === content2.value.fileList.length &&
            content1.value.fileList.every((file, index) => file === content2.value.fileList[index]));
    }
    return false;
};
let ClipboardManager = class ClipboardManager extends GObject.Object {
    constructor(ext) {
        super();
        this.settings = getCurrentExtensionSettings(ext);
        this.clipboard = St.Clipboard.get_default();
        this.selection = global$1.get_display().get_selection();
        this.lastCopiedContent = null;
    }
    startTracking() {
        this.lastCopiedContent = null;
        this.isTracking = true;
        const primaryTracker = debounce(async () => {
            const result = await this.getContent(St.ClipboardType.PRIMARY);
            if (!result) {
                return;
            }
            if (compareClipboardContent(result.content, this.lastCopiedContent?.content)) {
                return;
            }
            this.lastCopiedContent = result;
            this.emit('changed', result);
        }, 500);
        this.selectionChangedId = this.selection.connect('owner-changed', async (_selection, selectionType, _selectionSource) => {
            if (this.settings.get_boolean('is-in-incognito')) {
                return;
            }
            const focussedWindow = Shell.Global.get().display.focusWindow;
            const wmClass = focussedWindow?.get_wm_class();
            if (wmClass &&
                this.settings.get_boolean('watch-exclusion-list') &&
                this.settings
                    .get_strv('exclusion-list')
                    .map((s) => s.toLowerCase())
                    .indexOf(wmClass.toLowerCase()) >= 0) {
                return;
            }
            if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
                try {
                    const result = await this.getContent(St.ClipboardType.CLIPBOARD);
                    if (!result) {
                        return;
                    }
                    if (compareClipboardContent(result.content, this.lastCopiedContent?.content)) {
                        return;
                    }
                    this.lastCopiedContent = result;
                    this.emit('changed', result);
                }
                catch (err) {
                    debug$4(`error: ${err}`);
                }
            }
            else if (selectionType === Meta.SelectionType.SELECTION_PRIMARY) {
                try {
                    if (this.settings.get_boolean('sync-primary')) {
                        primaryTracker();
                    }
                }
                catch (err) {
                    debug$4(`error: ${err}`);
                }
            }
        });
    }
    stopTracking() {
        if (this.selectionChangedId) {
            this.selection.disconnect(this.selectionChangedId);
        }
        this.isTracking = false;
        this.lastCopiedContent = null;
    }
    setContent({ content }) {
        const syncPrimary = this.settings.get_boolean('sync-primary');
        if (content.type === ContentType.TEXT) {
            if (syncPrimary) {
                this.clipboard.set_text(St.ClipboardType.PRIMARY, content.value);
            }
            this.clipboard.set_text(St.ClipboardType.CLIPBOARD, content.value);
        }
        else if (content.type === ContentType.IMAGE) {
            if (syncPrimary) {
                this.clipboard.set_content(St.ClipboardType.PRIMARY, MimeType.IMAGE[0], new GLib.Bytes(content.value));
            }
            this.clipboard.set_content(St.ClipboardType.CLIPBOARD, MimeType.IMAGE[0], new GLib.Bytes(content.value));
        }
        else if (content.type === ContentType.FILE) {
            if (syncPrimary) {
                this.clipboard.set_content(St.ClipboardType.PRIMARY, MimeType.GNOME_FILE[0], new GLib.Bytes(new TextEncoder().encode([content.value.operation, ...content.value.fileList].join('\n'))));
            }
            this.clipboard.set_content(St.ClipboardType.CLIPBOARD, MimeType.GNOME_FILE[0], new GLib.Bytes(new TextEncoder().encode([content.value.operation, ...content.value.fileList].join('\n'))));
        }
    }
    haveMimeType(clipboardMimeTypes, targetMimeTypes) {
        return clipboardMimeTypes.find((m) => targetMimeTypes.indexOf(m) >= 0) !== undefined;
    }
    getCurrentMimeType(clipboardMimeTypes, targetMimeTypes) {
        return clipboardMimeTypes.find((m) => targetMimeTypes.indexOf(m) >= 0);
    }
    async getContent(clipboardType) {
        return new Promise((resolve) => {
            const cbMimeTypes = this.clipboard.get_mimetypes(clipboardType);
            if (this.haveMimeType(cbMimeTypes, MimeType.SENSITIVE)) {
                resolve(null);
                return;
            }
            else if (this.haveMimeType(cbMimeTypes, MimeType.GNOME_FILE)) {
                const currentMimeType = this.getCurrentMimeType(cbMimeTypes, MimeType.GNOME_FILE);
                if (!currentMimeType) {
                    resolve(null);
                    return;
                }
                this.clipboard.get_content(clipboardType, currentMimeType, (_, bytes) => {
                    const data = bytes instanceof GLib.Bytes ? bytes.get_data() : bytes;
                    if (data && data.length > 0) {
                        const content = new TextDecoder().decode(data);
                        const fileContent = content.split('\n').filter((c) => !!c);
                        const hasOperation = fileContent[0] === FileOperation.CUT || fileContent[0] === FileOperation.COPY;
                        resolve(new ClipboardContent({
                            type: ContentType.FILE,
                            value: {
                                operation: hasOperation ? fileContent[0] : FileOperation.COPY,
                                fileList: hasOperation ? fileContent.slice(1) : fileContent,
                            },
                        }));
                        return;
                    }
                    resolve(null);
                });
            }
            else if (this.haveMimeType(cbMimeTypes, MimeType.IMAGE)) {
                const currentMimeType = this.getCurrentMimeType(cbMimeTypes, MimeType.IMAGE);
                if (!currentMimeType) {
                    resolve(null);
                    return;
                }
                this.clipboard.get_content(clipboardType, currentMimeType, (_, bytes) => {
                    const data = bytes instanceof GLib.Bytes ? bytes.get_data() : bytes;
                    if (data && data.length > 0) {
                        resolve(new ClipboardContent({
                            type: ContentType.IMAGE,
                            value: data,
                        }));
                        return;
                    }
                    resolve(null);
                });
            }
            else if (this.haveMimeType(cbMimeTypes, MimeType.TEXT)) {
                this.clipboard.get_text(clipboardType, (_, text) => {
                    if (text && text.trim()) {
                        resolve(new ClipboardContent({
                            type: ContentType.TEXT,
                            value: text,
                        }));
                        return;
                    }
                    resolve(null);
                });
            }
            else {
                resolve(null);
            }
        });
    }
};
ClipboardManager.metaInfo = {
    GTypeName: 'PanoClipboardManager',
    Signals: {
        changed: {
            param_types: [ClipboardContent.$gtype],
            accumulator: 0,
        },
    },
};
ClipboardManager = __decorate([
    registerGObjectClass
], ClipboardManager);

const debug$3 = logger('pango');
const INVISIBLE_SPACE = '​';
const CLASS_NAMES = [
    { classNames: 'comment', fgcolor: '#636f88' },
    { classNames: 'prolog', fgcolor: '#636f88' },
    { classNames: 'doctype', fgcolor: '#636f88' },
    { classNames: 'cdata', fgcolor: '#636f88' },
    { classNames: 'punctuation', fgcolor: '#81A1C1' },
    { classNames: 'interpolation-punctuation', fgcolor: '#81A1C1' },
    { classNames: 'template-punctuation', fgcolor: '#81A1C1' },
    { classNames: 'property', fgcolor: '#81A1C1' },
    { classNames: 'string-property', fgcolor: '#81A1C1' },
    { classNames: 'parameter', fgcolor: '#81A1C1' },
    { classNames: 'literal-property', fgcolor: '#81A1C1' },
    { classNames: 'tag', fgcolor: '#81A1C1' },
    { classNames: 'constant', fgcolor: '#81A1C1' },
    { classNames: 'symbol', fgcolor: '#81A1C1' },
    { classNames: 'deleted', fgcolor: '#81A1C1' },
    { classNames: 'number', fgcolor: '#B48EAD' },
    { classNames: 'boolean', fgcolor: '#81A1C1' },
    { classNames: 'selector', fgcolor: '#A3BE8C' },
    { classNames: 'attr-name', fgcolor: '#A3BE8C' },
    { classNames: 'string', fgcolor: '#A3BE8C' },
    { classNames: 'template-string', fgcolor: '#A3BE8C' },
    { classNames: 'char', fgcolor: '#A3BE8C' },
    { classNames: 'builtin', fgcolor: '#A3BE8C' },
    { classNames: 'interpolation', fgcolor: '#A3BE8C' },
    { classNames: 'inserted', fgcolor: '#A3BE8C' },
    { classNames: 'operator', fgcolor: '#81A1C1' },
    { classNames: 'entity', fgcolor: '#81A1C1' },
    { classNames: 'url', fgcolor: '#81A1C1' },
    { classNames: 'variable', fgcolor: '#81A1C1' },
    { classNames: 'function-variable', fgcolor: '#81A1C1' },
    { classNames: 'atrule', fgcolor: '#88C0D0' },
    { classNames: 'attr-value', fgcolor: '#88C0D0' },
    { classNames: 'function', fgcolor: '#88C0D0' },
    { classNames: 'class-name', fgcolor: '#88C0D0' },
    { classNames: 'keyword', fgcolor: '#81A1C1' },
    { classNames: 'regex', fgcolor: '#EBCB8B' },
    { classNames: 'regex-delimiter', fgcolor: '#EBCB8B' },
    { classNames: 'regex-source', fgcolor: '#EBCB8B' },
    { classNames: 'regex-flags', fgcolor: '#EBCB8B' },
    { classNames: 'important', fgcolor: '#EBCB8B' },
];
const getColor = (classNames) => {
    const item = CLASS_NAMES.find((n) => classNames === n.classNames);
    if (!item) {
        debug$3(`class names not found: ${classNames}`);
        return '#fff';
    }
    return item.fgcolor;
};
const stringify = (o, language) => {
    if (typeof o == 'string') {
        return o;
    }
    if (Array.isArray(o)) {
        let s = '';
        o.forEach(function (e) {
            s += stringify(e, language);
        });
        return s;
    }
    const env = {
        type: o.type,
        content: stringify(o.content, language),
        tag: 'span',
        classes: [o.type],
        attributes: {},
        language: language,
    };
    let attributes = '';
    for (const name in env.attributes) {
        attributes += ` ${name}="${(env.attributes[name] || '').replace(/"/g, '&quot;')}"`;
    }
    return `<${env.tag} fgcolor="${getColor(env.classes.join(' '))}" ${attributes}>${env.content}</${env.tag}>`;
};
const markupCode = (text, charLength) => {
    const result = INVISIBLE_SPACE +
        stringify(PrismJS.util.encode(PrismJS.tokenize(text.slice(0, charLength), PrismJS.languages['javascript'])), 'javascript');
    return result;
};

let CodePanoItem = class CodePanoItem extends PanoItem {
    constructor(ext, clipboardManager, dbItem) {
        super(ext, clipboardManager, dbItem);
        this.codeItemSettings = this.settings.get_child('code-item');
        this.label = new St.Label({
            styleClass: 'pano-item-body-code-content',
            clipToAllocation: true,
        });
        this.label.clutterText.useMarkup = true;
        this.label.clutterText.ellipsize = Pango.EllipsizeMode.END;
        this.body.add_child(this.label);
        this.connect('activated', this.setClipboardContent.bind(this));
        this.setStyle();
        this.codeItemSettings.connect('changed', this.setStyle.bind(this));
    }
    setStyle() {
        const headerBgColor = this.codeItemSettings.get_string('header-bg-color');
        const headerColor = this.codeItemSettings.get_string('header-color');
        const bodyBgColor = this.codeItemSettings.get_string('body-bg-color');
        const bodyFontFamily = this.codeItemSettings.get_string('body-font-family');
        const bodyFontSize = this.codeItemSettings.get_int('body-font-size');
        const characterLength = this.codeItemSettings.get_int('char-length');
        this.header.set_style(`background-color: ${headerBgColor}; color: ${headerColor};`);
        this.body.set_style(`background-color: ${bodyBgColor}`);
        this.label.set_style(`font-size: ${bodyFontSize}px; font-family: ${bodyFontFamily};`);
        this.label.clutterText.set_markup(markupCode(this.dbItem.content.trim(), characterLength));
    }
    setClipboardContent() {
        this.clipboardManager.setContent(new ClipboardContent({
            type: ContentType.TEXT,
            value: this.dbItem.content,
        }));
    }
};
CodePanoItem = __decorate([
    registerGObjectClass
], CodePanoItem);

let ColorPanoItem = class ColorPanoItem extends PanoItem {
    constructor(ext, clipboardManager, dbItem) {
        super(ext, clipboardManager, dbItem);
        this.body.add_style_class_name('pano-item-body-color');
        this.colorItemSettings = this.settings.get_child('color-item');
        const colorContainer = new St.BoxLayout({
            vertical: false,
            xExpand: true,
            yExpand: true,
            yAlign: Clutter.ActorAlign.FILL,
            xAlign: Clutter.ActorAlign.FILL,
            styleClass: 'color-container',
            style: `background-color: ${this.dbItem.content};`,
        });
        this.label = new St.Label({
            xAlign: Clutter.ActorAlign.CENTER,
            yAlign: Clutter.ActorAlign.CENTER,
            xExpand: true,
            yExpand: true,
            text: this.dbItem.content,
            styleClass: 'color-label',
        });
        colorContainer.add_child(this.label);
        colorContainer.add_constraint(new Clutter.AlignConstraint({
            source: this,
            alignAxis: Clutter.AlignAxis.Y_AXIS,
            factor: 0.005,
        }));
        this.body.add_child(colorContainer);
        this.connect('activated', this.setClipboardContent.bind(this));
        this.setStyle();
        this.colorItemSettings.connect('changed', this.setStyle.bind(this));
    }
    setStyle() {
        const headerBgColor = this.colorItemSettings.get_string('header-bg-color');
        const headerColor = this.colorItemSettings.get_string('header-color');
        const metadataBgColor = this.colorItemSettings.get_string('metadata-bg-color');
        const metadataColor = this.colorItemSettings.get_string('metadata-color');
        const metadataFontFamily = this.colorItemSettings.get_string('metadata-font-family');
        const metadataFontSize = this.colorItemSettings.get_int('metadata-font-size');
        this.header.set_style(`background-color: ${headerBgColor}; color: ${headerColor};`);
        this.label.set_style(`background-color: ${metadataBgColor}; color: ${metadataColor}; font-family: ${metadataFontFamily}; font-size: ${metadataFontSize}px;`);
    }
    setClipboardContent() {
        this.clipboardManager.setContent(new ClipboardContent({
            type: ContentType.TEXT,
            value: this.dbItem.content,
        }));
    }
};
ColorPanoItem = __decorate([
    registerGObjectClass
], ColorPanoItem);

let EmojiPanoItem = class EmojiPanoItem extends PanoItem {
    constructor(ext, clipboardManager, dbItem) {
        super(ext, clipboardManager, dbItem);
        this.body.add_style_class_name('pano-item-body-emoji');
        this.emojiItemSettings = this.settings.get_child('emoji-item');
        const emojiContainer = new St.BoxLayout({
            vertical: false,
            xExpand: true,
            yExpand: true,
            yAlign: Clutter.ActorAlign.FILL,
            xAlign: Clutter.ActorAlign.FILL,
            styleClass: 'emoji-container',
        });
        this.label = new St.Label({
            xAlign: Clutter.ActorAlign.CENTER,
            yAlign: Clutter.ActorAlign.CENTER,
            xExpand: true,
            yExpand: true,
            text: this.dbItem.content,
            styleClass: 'pano-item-body-emoji-content',
        });
        this.label.clutterText.lineWrap = true;
        this.label.clutterText.lineWrapMode = Pango.WrapMode.WORD_CHAR;
        this.label.clutterText.ellipsize = Pango.EllipsizeMode.END;
        emojiContainer.add_child(this.label);
        this.body.add_child(emojiContainer);
        this.connect('activated', this.setClipboardContent.bind(this));
        this.setStyle();
        this.emojiItemSettings.connect('changed', this.setStyle.bind(this));
    }
    setStyle() {
        const headerBgColor = this.emojiItemSettings.get_string('header-bg-color');
        const headerColor = this.emojiItemSettings.get_string('header-color');
        const bodyBgColor = this.emojiItemSettings.get_string('body-bg-color');
        const emojiSize = this.emojiItemSettings.get_int('emoji-size');
        this.header.set_style(`background-color: ${headerBgColor}; color: ${headerColor};`);
        this.body.set_style(`background-color: ${bodyBgColor};`);
        this.label.set_style(`font-size: ${emojiSize}px;`);
    }
    setClipboardContent() {
        this.clipboardManager.setContent(new ClipboardContent({
            type: ContentType.TEXT,
            value: this.dbItem.content,
        }));
    }
};
EmojiPanoItem = __decorate([
    registerGObjectClass
], EmojiPanoItem);

let FilePanoItem = class FilePanoItem extends PanoItem {
    constructor(ext, clipboardManager, dbItem) {
        super(ext, clipboardManager, dbItem);
        this.fileList = JSON.parse(this.dbItem.content);
        this.operation = this.dbItem.metaData || 'copy';
        this.body.add_style_class_name('pano-item-body-file');
        this.fileItemSettings = this.settings.get_child('file-item');
        const container = new St.BoxLayout({
            styleClass: 'copied-files-container',
            vertical: true,
            xExpand: true,
            yExpand: false,
            yAlign: Clutter.ActorAlign.FILL,
        });
        this.fileList
            .map((f) => {
            const items = f.split('://').filter((c) => !!c);
            return decodeURIComponent(items[items.length - 1]);
        })
            .forEach((uri) => {
            const bl = new St.BoxLayout({
                vertical: false,
                styleClass: 'copied-file-name',
                xExpand: true,
                xAlign: Clutter.ActorAlign.FILL,
                clipToAllocation: true,
                yAlign: Clutter.ActorAlign.FILL,
            });
            bl.add_child(new St.Icon({
                iconName: this.operation === FileOperation.CUT ? 'edit-cut-symbolic' : 'edit-copy-symbolic',
                xAlign: Clutter.ActorAlign.START,
                iconSize: 14,
                styleClass: 'file-icon',
            }));
            const uriLabel = new St.Label({
                text: uri,
                styleClass: 'pano-item-body-file-name-label',
                xAlign: Clutter.ActorAlign.FILL,
                xExpand: true,
            });
            uriLabel.clutterText.ellipsize = Pango.EllipsizeMode.MIDDLE;
            bl.add_child(uriLabel);
            container.add_child(bl);
        });
        this.body.add_child(container);
        this.connect('activated', this.setClipboardContent.bind(this));
        this.setStyle();
        this.fileItemSettings.connect('changed', this.setStyle.bind(this));
    }
    setStyle() {
        const headerBgColor = this.fileItemSettings.get_string('header-bg-color');
        const headerColor = this.fileItemSettings.get_string('header-color');
        const bodyBgColor = this.fileItemSettings.get_string('body-bg-color');
        const bodyColor = this.fileItemSettings.get_string('body-color');
        const bodyFontFamily = this.fileItemSettings.get_string('body-font-family');
        const bodyFontSize = this.fileItemSettings.get_int('body-font-size');
        this.header.set_style(`background-color: ${headerBgColor}; color: ${headerColor};`);
        this.body.set_style(`background-color: ${bodyBgColor}; color: ${bodyColor}; font-family: ${bodyFontFamily}; font-size: ${bodyFontSize}px;`);
    }
    setClipboardContent() {
        this.clipboardManager.setContent(new ClipboardContent({
            type: ContentType.FILE,
            value: { fileList: this.fileList, operation: this.operation },
        }));
    }
};
FilePanoItem = __decorate([
    registerGObjectClass
], FilePanoItem);

const NO_IMAGE_FOUND_FILE_NAME = 'no-image-found.svg';
let ImagePanoItem = class ImagePanoItem extends PanoItem {
    constructor(ext, clipboardManager, dbItem) {
        super(ext, clipboardManager, dbItem);
        this.ext = ext;
        this.body.add_style_class_name('pano-item-body-image');
        this.imageItemSettings = this.settings.get_child('image-item');
        const { width, height, size } = JSON.parse(dbItem.metaData || '{}');
        this.metaContainer = new St.BoxLayout({
            styleClass: 'pano-item-body-meta-container',
            vertical: true,
            xExpand: true,
            yExpand: true,
            yAlign: Clutter.ActorAlign.END,
            xAlign: Clutter.ActorAlign.FILL,
        });
        const resolutionContainer = new St.BoxLayout({
            vertical: false,
            xExpand: true,
            yAlign: Clutter.ActorAlign.FILL,
            xAlign: Clutter.ActorAlign.FILL,
            styleClass: 'pano-item-body-image-resolution-container',
        });
        this.resolutionTitle = new St.Label({
            text: 'Resolution',
            xAlign: Clutter.ActorAlign.START,
            xExpand: true,
            styleClass: 'pano-item-body-image-meta-title',
        });
        this.resolutionValue = new St.Label({
            text: `${width} x ${height}`,
            xAlign: Clutter.ActorAlign.END,
            xExpand: false,
            styleClass: 'pano-item-body-image-meta-value',
        });
        resolutionContainer.add_child(this.resolutionTitle);
        resolutionContainer.add_child(this.resolutionValue);
        const sizeContainer = new St.BoxLayout({
            vertical: false,
            xExpand: true,
            yAlign: Clutter.ActorAlign.FILL,
            xAlign: Clutter.ActorAlign.FILL,
            styleClass: 'pano-item-body-image-size-container',
        });
        this.sizeLabel = new St.Label({
            text: 'Size',
            xAlign: Clutter.ActorAlign.START,
            xExpand: true,
            styleClass: 'pano-item-body-image-meta-title',
        });
        this.sizeValue = new St.Label({
            text: prettyBytes(size),
            xAlign: Clutter.ActorAlign.END,
            xExpand: false,
            styleClass: 'pano-item-body-image-meta-value',
        });
        sizeContainer.add_child(this.sizeLabel);
        sizeContainer.add_child(this.sizeValue);
        this.metaContainer.add_child(resolutionContainer);
        this.metaContainer.add_child(sizeContainer);
        this.metaContainer.add_constraint(new Clutter.AlignConstraint({
            source: this,
            alignAxis: Clutter.AlignAxis.Y_AXIS,
            factor: 0.001,
        }));
        this.body.add_child(this.metaContainer);
        this.connect('activated', this.setClipboardContent.bind(this));
        this.setStyle();
        this.imageItemSettings.connect('changed', this.setStyle.bind(this));
    }
    setStyle() {
        const headerBgColor = this.imageItemSettings.get_string('header-bg-color');
        const headerColor = this.imageItemSettings.get_string('header-color');
        const bodyBgColor = this.imageItemSettings.get_string('body-bg-color');
        const metadataBgColor = this.imageItemSettings.get_string('metadata-bg-color');
        const metadataColor = this.imageItemSettings.get_string('metadata-color');
        const metadataFontFamily = this.imageItemSettings.get_string('metadata-font-family');
        const metadataFontSize = this.imageItemSettings.get_int('metadata-font-size');
        let imageFilePath = `file://${getImagesPath(this.ext)}/${this.dbItem.content}.png`;
        let backgroundSize = 'contain';
        const imageFile = Gio.File.new_for_uri(imageFilePath);
        if (!imageFile.query_exists(null)) {
            imageFilePath = `file://${this.ext.path}/images/${NO_IMAGE_FOUND_FILE_NAME}`;
            backgroundSize = 'cover';
        }
        this.body.set_style(`background-color: ${bodyBgColor}; background-image: url(${imageFilePath}); background-size: ${backgroundSize};`);
        this.header.set_style(`background-color: ${headerBgColor}; color: ${headerColor};`);
        this.resolutionTitle.set_style(`color: ${metadataColor}; font-family: ${metadataFontFamily}; font-size: ${metadataFontSize}px;`);
        this.resolutionValue.set_style(`color: ${metadataColor}; font-family: ${metadataFontFamily}; font-size: ${metadataFontSize}px; font-weight: bold;`);
        this.sizeLabel.set_style(`color: ${metadataColor}; font-family: ${metadataFontFamily}; font-size: ${metadataFontSize}px;`);
        this.sizeValue.set_style(`color: ${metadataColor}; font-family: ${metadataFontFamily}; font-size: ${metadataFontSize}px; font-weight: bold;`);
        this.metaContainer.set_style(`background-color: ${metadataBgColor};`);
    }
    setClipboardContent() {
        const imageFile = Gio.File.new_for_path(`${getImagesPath(this.ext)}/${this.dbItem.content}.png`);
        if (!imageFile.query_exists(null)) {
            return;
        }
        const [bytes] = imageFile.load_bytes(null);
        const data = bytes.get_data();
        if (!data) {
            return;
        }
        this.clipboardManager.setContent(new ClipboardContent({
            type: ContentType.IMAGE,
            value: data,
        }));
    }
};
ImagePanoItem = __decorate([
    registerGObjectClass
], ImagePanoItem);

const DEFAULT_LINK_PREVIEW_IMAGE_NAME = 'link-preview.svg';
let LinkPanoItem = class LinkPanoItem extends PanoItem {
    constructor(ext, clipboardManager, dbItem) {
        super(ext, clipboardManager, dbItem);
        const _ = gettext(ext);
        this.linkItemSettings = this.settings.get_child('link-item');
        const { title, description, image } = JSON.parse(dbItem.metaData || '{"title": "", "description": ""}');
        let titleText = title;
        let descriptionText = description;
        if (!title) {
            titleText = GLib.uri_parse(dbItem.content, GLib.UriFlags.NONE).get_host() || this.dbItem.content;
        }
        else {
            titleText = decodeURI(title);
        }
        if (!description) {
            descriptionText = _('No Description');
        }
        else {
            descriptionText = decodeURI(description);
        }
        this.body.add_style_class_name('pano-item-body-link');
        this.metaContainer = new St.BoxLayout({
            styleClass: 'pano-item-body-meta-container',
            vertical: true,
            xExpand: true,
            yExpand: false,
            yAlign: Clutter.ActorAlign.END,
            xAlign: Clutter.ActorAlign.FILL,
        });
        this.titleLabel = new St.Label({
            text: titleText,
            styleClass: 'link-title-label',
        });
        this.descriptionLabel = new St.Label({
            text: descriptionText,
            styleClass: 'link-description-label',
        });
        this.descriptionLabel.clutterText.singleLineMode = true;
        this.linkLabel = new St.Label({
            text: this.dbItem.content,
            styleClass: 'link-label',
        });
        let imageFilePath = `file:///${ext.path}/images/${DEFAULT_LINK_PREVIEW_IMAGE_NAME}`;
        if (image && Gio.File.new_for_uri(`file://${getCachePath(ext)}/${image}.png`).query_exists(null)) {
            imageFilePath = `file://${getCachePath(ext)}/${image}.png`;
        }
        const imageContainer = new St.BoxLayout({
            vertical: true,
            xExpand: true,
            yExpand: true,
            yAlign: Clutter.ActorAlign.FILL,
            xAlign: Clutter.ActorAlign.FILL,
            styleClass: 'image-container',
            style: `background-image: url(${imageFilePath});`,
        });
        this.metaContainer.add_child(this.titleLabel);
        this.metaContainer.add_child(this.descriptionLabel);
        this.metaContainer.add_child(this.linkLabel);
        this.body.add_child(imageContainer);
        this.body.add_child(this.metaContainer);
        this.connect('activated', this.setClipboardContent.bind(this));
        this.setStyle();
        this.linkItemSettings.connect('changed', this.setStyle.bind(this));
        const openLinkIcon = new St.Icon({
            iconName: 'web-browser-symbolic',
            styleClass: 'pano-item-action-button-icon',
        });
        const openLinkButton = new St.Button({
            styleClass: 'pano-item-action-button pano-item-open-link-button',
            child: openLinkIcon,
        });
        openLinkButton.connect('clicked', () => {
            this.emit('activated');
            openLinkInBrowser(this.dbItem.content);
            return Clutter.EVENT_PROPAGATE;
        });
        if (this.settings.get_boolean('open-links-in-browser')) {
            this.header.actionContainer.insert_child_at_index(openLinkButton, 0);
        }
        this.settings.connect('changed::open-links-in-browser', () => {
            if (this.header.actionContainer.get_child_at_index(0) === openLinkButton) {
                this.header.actionContainer.remove_child(openLinkButton);
            }
            if (this.settings.get_boolean('open-links-in-browser')) {
                this.header.actionContainer.insert_child_at_index(openLinkButton, 0);
            }
        });
    }
    setStyle() {
        const headerBgColor = this.linkItemSettings.get_string('header-bg-color');
        const headerColor = this.linkItemSettings.get_string('header-color');
        const bodyBgColor = this.linkItemSettings.get_string('body-bg-color');
        const metadataBgColor = this.linkItemSettings.get_string('metadata-bg-color');
        const metadataTitleColor = this.linkItemSettings.get_string('metadata-title-color');
        const metadataDescriptionColor = this.linkItemSettings.get_string('metadata-description-color');
        const metadataLinkColor = this.linkItemSettings.get_string('metadata-link-color');
        const metadataTitleFontFamily = this.linkItemSettings.get_string('metadata-title-font-family');
        const metadataDescriptionFontFamily = this.linkItemSettings.get_string('metadata-description-font-family');
        const metadataLinkFontFamily = this.linkItemSettings.get_string('metadata-link-font-family');
        const metadataTitleFontSize = this.linkItemSettings.get_int('metadata-title-font-size');
        const metadataDescriptionFontSize = this.linkItemSettings.get_int('metadata-description-font-size');
        const metadataLinkFontSize = this.linkItemSettings.get_int('metadata-link-font-size');
        this.header.set_style(`background-color: ${headerBgColor}; color: ${headerColor};`);
        this.body.set_style(`background-color: ${bodyBgColor};`);
        this.metaContainer.set_style(`background-color: ${metadataBgColor};`);
        this.titleLabel.set_style(`color: ${metadataTitleColor}; font-family: ${metadataTitleFontFamily}; font-size: ${metadataTitleFontSize}px;`);
        this.descriptionLabel.set_style(`color: ${metadataDescriptionColor}; font-family: ${metadataDescriptionFontFamily}; font-size: ${metadataDescriptionFontSize}px;`);
        this.linkLabel.set_style(`color: ${metadataLinkColor}; font-family: ${metadataLinkFontFamily}; font-size: ${metadataLinkFontSize}px;`);
    }
    setClipboardContent() {
        this.clipboardManager.setContent(new ClipboardContent({
            type: ContentType.TEXT,
            value: this.dbItem.content,
        }));
    }
    vfunc_key_press_event(event) {
        super.vfunc_key_press_event(event);
        if (this.settings.get_boolean('open-links-in-browser') &&
            event.get_state() === Clutter.ModifierType.CONTROL_MASK &&
            (event.get_key_symbol() === Clutter.KEY_Return ||
                event.get_key_symbol() === Clutter.KEY_ISO_Enter ||
                event.get_key_symbol() === Clutter.KEY_KP_Enter)) {
            openLinkInBrowser(this.dbItem.content);
        }
        return Clutter.EVENT_PROPAGATE;
    }
    vfunc_button_release_event(event) {
        super.vfunc_button_release_event(event);
        if (event.get_button() === 1 &&
            event.get_state() === Clutter.ModifierType.CONTROL_MASK &&
            this.settings.get_boolean('open-links-in-browser')) {
            openLinkInBrowser(this.dbItem.content);
        }
        return Clutter.EVENT_PROPAGATE;
    }
};
LinkPanoItem = __decorate([
    registerGObjectClass
], LinkPanoItem);

let TextPanoItem = class TextPanoItem extends PanoItem {
    constructor(ext, clipboardManager, dbItem) {
        super(ext, clipboardManager, dbItem);
        this.textItemSettings = this.settings.get_child('text-item');
        this.label = new St.Label({
            styleClass: 'pano-item-body-text-content',
        });
        this.label.clutterText.lineWrap = true;
        this.label.clutterText.lineWrapMode = Pango.WrapMode.WORD_CHAR;
        this.label.clutterText.ellipsize = Pango.EllipsizeMode.END;
        this.body.add_child(this.label);
        this.connect('activated', this.setClipboardContent.bind(this));
        this.setStyle();
        this.textItemSettings.connect('changed', this.setStyle.bind(this));
    }
    setStyle() {
        const headerBgColor = this.textItemSettings.get_string('header-bg-color');
        const headerColor = this.textItemSettings.get_string('header-color');
        const bodyBgColor = this.textItemSettings.get_string('body-bg-color');
        const bodyColor = this.textItemSettings.get_string('body-color');
        const bodyFontFamily = this.textItemSettings.get_string('body-font-family');
        const bodyFontSize = this.textItemSettings.get_int('body-font-size');
        const characterLength = this.textItemSettings.get_int('char-length');
        // Set header styles
        this.header.set_style(`background-color: ${headerBgColor}; color: ${headerColor};`);
        // Set body styles
        this.body.set_style(`background-color: ${bodyBgColor}`);
        // set label styles
        this.label.set_text(this.dbItem.content.trim().slice(0, characterLength));
        this.label.set_style(`color: ${bodyColor}; font-family: ${bodyFontFamily}; font-size: ${bodyFontSize}px;`);
    }
    setClipboardContent() {
        this.clipboardManager.setContent(new ClipboardContent({
            type: ContentType.TEXT,
            value: this.dbItem.content,
        }));
    }
};
TextPanoItem = __decorate([
    registerGObjectClass
], TextPanoItem);

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const session = new Soup.Session();
session.timeout = 5;
const decoder = new TextDecoder();
const debug$2 = logger('link-parser');
const getDocument = async (url) => {
    const defaultResult = {
        title: '',
        description: '',
        imageUrl: '',
    };
    try {
        const message = Soup.Message.new('GET', url);
        message.requestHeaders.append('User-Agent', DEFAULT_USER_AGENT);
        //note: casting required, since this is a gjs convention, to return an promise, instead of accepting a 4. value as callback (thats a C convention, since there's no Promise out of the box, but a callback works)
        const response = (await session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null));
        if (response == null) {
            debug$2(`no response from ${url}`);
            return defaultResult;
        }
        const bytes = response.get_data();
        if (bytes == null) {
            debug$2(`no data from ${url}`);
            return defaultResult;
        }
        const data = decoder.decode(bytes);
        let titleMatch = false;
        let titleTag = '';
        let title;
        let description;
        let imageUrl;
        const p = new htmlparser2.Parser({
            onopentag(name, attribs) {
                if (name === 'meta') {
                    if (!title &&
                        (attribs['property'] === 'og:title' ||
                            attribs['property'] === 'twitter:title' ||
                            attribs['property'] === 'title' ||
                            attribs['name'] === 'og:title' ||
                            attribs['name'] === 'twitter:title' ||
                            attribs['name'] === 'title')) {
                        title = attribs['content'];
                    }
                    else if (!description &&
                        (attribs['property'] === 'og:description' ||
                            attribs['property'] === 'twitter:description' ||
                            attribs['property'] === 'description' ||
                            attribs['name'] === 'og:description' ||
                            attribs['name'] === 'twitter:description' ||
                            attribs['name'] === 'description')) {
                        description = attribs['content'];
                    }
                    else if (!imageUrl &&
                        (attribs['property'] === 'og:image' ||
                            attribs['property'] === 'twitter:image' ||
                            attribs['property'] === 'image' ||
                            attribs['name'] === 'og:image' ||
                            attribs['name'] === 'twitter:image' ||
                            attribs['name'] === 'image')) {
                        imageUrl = attribs['content'];
                        if (imageUrl && imageUrl.startsWith('/')) {
                            const uri = GLib.uri_parse(url, GLib.UriFlags.NONE);
                            imageUrl = `${uri.get_scheme()}://${uri.get_host()}${imageUrl}`;
                        }
                    }
                }
                if (name === 'title') {
                    titleMatch = true;
                }
            },
            ontext(data) {
                if (titleMatch && !title) {
                    titleTag += data;
                }
            },
            onclosetag(name) {
                if (name === 'title') {
                    titleMatch = false;
                }
            },
        }, {
            decodeEntities: true,
            lowerCaseTags: true,
            lowerCaseAttributeNames: true,
        });
        p.write(data);
        p.end();
        title = title || titleTag;
        return {
            title,
            description,
            imageUrl,
        };
    }
    catch (err) {
        debug$2(`failed to parse link ${url}. err: ${err}`);
    }
    return defaultResult;
};
const getImage = async (ext, imageUrl) => {
    if (imageUrl && imageUrl.startsWith('http')) {
        try {
            const checksum = GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, imageUrl, imageUrl.length);
            const cachedImage = Gio.File.new_for_path(`${getCachePath(ext)}/${checksum}.png`);
            if (cachedImage.query_exists(null)) {
                return [checksum, cachedImage];
            }
            const message = Soup.Message.new('GET', imageUrl);
            message.requestHeaders.append('User-Agent', DEFAULT_USER_AGENT);
            //note: casting required, since this is a gjs convention, to return an promise, instead of accepting a 4. value as callback (thats a C convention, since there's no Promise out of the box, but a callback works)
            const response = (await session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null));
            if (!response) {
                debug$2('no response while fetching the image');
                return [null, null];
            }
            const data = response.get_data();
            if (!data || data.length == 0) {
                debug$2('empty response while fetching the image');
                return [null, null];
            }
            cachedImage.replace_contents(data, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
            return [checksum, cachedImage];
        }
        catch (err) {
            debug$2(`failed to load image: ${imageUrl}. err: ${err}`);
        }
    }
    return [null, null];
};

hljs.registerLanguage('python', python);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('php', php);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('dart', dart);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('groovy', groovy);
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('julia', julia);
hljs.registerLanguage('haskell', haskell);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
const SUPPORTED_LANGUAGES = [
    'python',
    'markdown',
    'yaml',
    'java',
    'javascript',
    'csharp',
    'cpp',
    'c',
    'php',
    'typescript',
    'swift',
    'kotlin',
    'go',
    'rust',
    'ruby',
    'scala',
    'dart',
    'sql',
    'lua',
    'groovy',
    'perl',
    'julia',
    'haskell',
    'bash',
    'shell',
];
const debug$1 = logger('pano-item-factory');
const isValidUrl = (text) => {
    try {
        return isUrl(text) && GLib.uri_parse(text, GLib.UriFlags.NONE) !== null;
    }
    catch (err) {
        return false;
    }
};
const findOrCreateDbItem = async (ext, clip) => {
    const { value, type } = clip.content;
    const queryBuilder = new ClipboardQueryBuilder();
    switch (type) {
        case ContentType.FILE:
            queryBuilder.withItemTypes(['FILE']).withMatchValue(`${value.operation}${value.fileList.sort().join('')}`);
            break;
        case ContentType.IMAGE:
            queryBuilder
                .withItemTypes(['IMAGE'])
                .withMatchValue(GLib.compute_checksum_for_bytes(GLib.ChecksumType.MD5, new GLib.Bytes(value)));
            break;
        case ContentType.TEXT:
            queryBuilder.withItemTypes(['LINK', 'TEXT', 'CODE', 'COLOR', 'EMOJI']).withMatchValue(value).build();
            break;
        default:
            return null;
    }
    const result = db.query(queryBuilder.build());
    if (getCurrentExtensionSettings(ext).get_boolean('play-audio-on-copy')) {
        playAudio();
    }
    if (result.length > 0) {
        return db.update({
            ...result[0],
            copyDate: new Date(),
        });
    }
    switch (type) {
        case ContentType.FILE:
            return db.save({
                content: JSON.stringify(value.fileList),
                copyDate: new Date(),
                isFavorite: false,
                itemType: 'FILE',
                matchValue: `${value.operation}${value.fileList.sort().join('')}`,
                searchValue: `${value.fileList
                    .map((f) => {
                    const items = f.split('://').filter((c) => !!c);
                    return items[items.length - 1];
                })
                    .join('')}`,
                metaData: value.operation,
            });
        case ContentType.IMAGE:
            const checksum = GLib.compute_checksum_for_bytes(GLib.ChecksumType.MD5, new GLib.Bytes(value));
            if (!checksum) {
                return null;
            }
            const imageFilePath = `${getImagesPath(ext)}/${checksum}.png`;
            const imageFile = Gio.File.new_for_path(imageFilePath);
            imageFile.replace_contents(value, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
            const [, width, height] = GdkPixbuf.Pixbuf.get_file_info(imageFilePath);
            return db.save({
                content: checksum,
                copyDate: new Date(),
                isFavorite: false,
                itemType: 'IMAGE',
                matchValue: checksum,
                metaData: JSON.stringify({
                    width,
                    height,
                    size: value.length,
                }),
            });
        case ContentType.TEXT:
            const trimmedValue = value.trim();
            if (trimmedValue.toLowerCase().startsWith('http') && isValidUrl(trimmedValue)) {
                const linkPreviews = getCurrentExtensionSettings(ext).get_boolean('link-previews');
                let description;
                let imageUrl;
                let title;
                let checksum;
                const copyDate = new Date();
                let linkDbItem = db.save({
                    content: trimmedValue,
                    copyDate,
                    isFavorite: false,
                    itemType: 'LINK',
                    matchValue: trimmedValue,
                    searchValue: `${title}${description}${trimmedValue}`,
                    metaData: JSON.stringify({
                        title: title ? encodeURI(title) : '',
                        description: description ? encodeURI(description) : '',
                        image: checksum ?? '',
                    }),
                });
                if (linkPreviews && linkDbItem) {
                    const document = await getDocument(trimmedValue);
                    description = document.description;
                    title = document.title;
                    imageUrl = document.imageUrl;
                    checksum = (await getImage(ext, imageUrl))[0] ?? undefined;
                    linkDbItem = db.update({
                        id: linkDbItem.id,
                        content: trimmedValue,
                        copyDate: copyDate,
                        isFavorite: false,
                        itemType: 'LINK',
                        matchValue: trimmedValue,
                        searchValue: `${title}${description}${trimmedValue}`,
                        metaData: JSON.stringify({
                            title: title ? encodeURI(title) : '',
                            description: description ? encodeURI(description) : '',
                            image: checksum ?? '',
                        }),
                    });
                }
                return linkDbItem;
            }
            if (validateHTMLColorHex(trimmedValue) ||
                validateHTMLColorRgb(trimmedValue) ||
                validateHTMLColorName(trimmedValue)) {
                return db.save({
                    content: trimmedValue,
                    copyDate: new Date(),
                    isFavorite: false,
                    itemType: 'COLOR',
                    matchValue: trimmedValue,
                    searchValue: trimmedValue,
                });
            }
            const highlightResult = hljs.highlightAuto(trimmedValue.slice(0, 2000), SUPPORTED_LANGUAGES);
            if (highlightResult.relevance < 10) {
                if (/^\p{Extended_Pictographic}*$/u.test(trimmedValue)) {
                    return db.save({
                        content: trimmedValue,
                        copyDate: new Date(),
                        isFavorite: false,
                        itemType: 'EMOJI',
                        matchValue: trimmedValue,
                        searchValue: trimmedValue,
                    });
                }
                else {
                    return db.save({
                        content: value,
                        copyDate: new Date(),
                        isFavorite: false,
                        itemType: 'TEXT',
                        matchValue: value,
                        searchValue: value,
                    });
                }
            }
            else {
                return db.save({
                    content: value,
                    copyDate: new Date(),
                    isFavorite: false,
                    itemType: 'CODE',
                    matchValue: value,
                    searchValue: value,
                });
            }
        default:
            return null;
    }
};
const createPanoItem = async (ext, clipboardManager, clip) => {
    let dbItem = null;
    try {
        dbItem = await findOrCreateDbItem(ext, clip);
    }
    catch (err) {
        debug$1(`err: ${err}`);
        return null;
    }
    if (dbItem) {
        if (getCurrentExtensionSettings(ext).get_boolean('send-notification-on-copy')) {
            try {
                sendNotification(ext, dbItem);
            }
            catch (err) {
                console.error('PANO: ' + err.toString());
            }
        }
        return createPanoItemFromDb(ext, clipboardManager, dbItem);
    }
    return null;
};
const createPanoItemFromDb = (ext, clipboardManager, dbItem) => {
    if (!dbItem) {
        return null;
    }
    let panoItem;
    switch (dbItem.itemType) {
        case 'TEXT':
            panoItem = new TextPanoItem(ext, clipboardManager, dbItem);
            break;
        case 'CODE':
            panoItem = new CodePanoItem(ext, clipboardManager, dbItem);
            break;
        case 'LINK':
            panoItem = new LinkPanoItem(ext, clipboardManager, dbItem);
            break;
        case 'COLOR':
            panoItem = new ColorPanoItem(ext, clipboardManager, dbItem);
            break;
        case 'FILE':
            panoItem = new FilePanoItem(ext, clipboardManager, dbItem);
            break;
        case 'IMAGE':
            panoItem = new ImagePanoItem(ext, clipboardManager, dbItem);
            break;
        case 'EMOJI':
            panoItem = new EmojiPanoItem(ext, clipboardManager, dbItem);
            break;
        default:
            return null;
    }
    panoItem.connect('on-remove', (_, dbItemStr) => {
        const dbItem = JSON.parse(dbItemStr);
        removeItemResources(ext, dbItem);
    });
    panoItem.connect('on-favorite', (_, dbItemStr) => {
        const dbItem = JSON.parse(dbItemStr);
        db.update({
            ...dbItem,
            copyDate: new Date(dbItem.copyDate),
        });
    });
    return panoItem;
};
function converter(color) {
    try {
        return convert(color);
    }
    catch (_err) {
        return null;
    }
}
const removeItemResources = (ext, dbItem) => {
    db.delete(dbItem.id);
    if (dbItem.itemType === 'LINK') {
        const { image } = JSON.parse(dbItem.metaData || '{}');
        if (image && Gio.File.new_for_uri(`file://${getCachePath(ext)}/${image}.png`).query_exists(null)) {
            Gio.File.new_for_uri(`file://${getCachePath(ext)}/${image}.png`).delete(null);
        }
    }
    else if (dbItem.itemType === 'IMAGE') {
        const imageFilePath = `file://${getImagesPath(ext)}/${dbItem.content}.png`;
        const imageFile = Gio.File.new_for_uri(imageFilePath);
        if (imageFile.query_exists(null)) {
            imageFile.delete(null);
        }
    }
};
const sendNotification = (ext, dbItem) => {
    const _ = gettext(ext);
    if (dbItem.itemType === 'IMAGE') {
        const { width, height, size } = JSON.parse(dbItem.metaData || '{}');
        notify(ext, _('Image Copied'), _('Width: %spx, Height: %spx, Size: %s').format(width, height, prettyBytes(size)), GdkPixbuf.Pixbuf.new_from_file(`${getImagesPath(ext)}/${dbItem.content}.png`));
    }
    else if (dbItem.itemType === 'TEXT') {
        notify(ext, _('Text Copied'), dbItem.content.trim());
    }
    else if (dbItem.itemType === 'CODE') {
        notify(ext, _('Code Copied'), dbItem.content.trim());
    }
    else if (dbItem.itemType === 'EMOJI') {
        notify(ext, _('Emoji Copied'), dbItem.content);
    }
    else if (dbItem.itemType === 'LINK') {
        const { title, description, image } = JSON.parse(dbItem.metaData || '{}');
        const pixbuf = image ? GdkPixbuf.Pixbuf.new_from_file(`${getCachePath(ext)}/${image}.png`) : undefined;
        notify(ext, decodeURI(`${_('Link Copied')}${title ? ` - ${title}` : ''}`), `${dbItem.content}${description ? `\n\n${decodeURI(description)}` : ''}`, pixbuf, Cogl.PixelFormat.RGB_888);
    }
    else if (dbItem.itemType === 'COLOR') {
        // Create pixbuf from color
        const pixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, 1, 1);
        let color = null;
        // check if content has alpha
        if (dbItem.content.includes('rgba')) {
            color = converter(dbItem.content);
        }
        else if (validateHTMLColorRgb(dbItem.content)) {
            color = `${converter(dbItem.content)}ff`;
        }
        else if (validateHTMLColorHex(dbItem.content)) {
            color = `${dbItem.content}ff`;
        }
        if (color) {
            pixbuf.fill(parseInt(color.replace('#', '0x'), 16));
            notify(ext, _('Color Copied'), dbItem.content, pixbuf);
        }
    }
    else if (dbItem.itemType === 'FILE') {
        const operation = dbItem.metaData;
        const fileListSize = JSON.parse(dbItem.content).length;
        notify(ext, _('File %s').format(operation === FileOperation.CUT ? 'cut' : 'copied'), _('There are %s file(s)').format(fileListSize));
    }
};

//TODO: the list member of St.BoxLayout are of type Clutter.Actor and we have to cast constantly from PanoItem to Clutter.Actor and reverse, fix that somehow
let PanoScrollView = class PanoScrollView extends St.ScrollView {
    constructor(ext, clipboardManager, searchBox) {
        super({
            overlayScrollbars: true,
            xExpand: true,
            yExpand: true,
        });
        this.currentFocus = null;
        this.currentFilter = null;
        this.currentItemTypeFilter = null;
        this.showFavorites = null;
        this.clipboardChangedSignalId = null;
        this.ext = ext;
        this.clipboardManager = clipboardManager;
        this.searchBox = searchBox;
        this.settings = getCurrentExtensionSettings(this.ext);
        this.setScrollbarPolicy();
        this.list = new St.BoxLayout({
            vertical: isVertical(this.settings.get_uint('window-position')),
            xExpand: true,
            yExpand: true,
        });
        this.settings.connect('changed::window-position', () => {
            this.setScrollbarPolicy();
            this.list.set_vertical(isVertical(this.settings.get_uint('window-position')));
        });
        scrollViewAddChild(this, this.list);
        const shouldFocusOut = (symbol) => {
            const isPanoVertical = isVertical(this.settings.get_uint('window-position'));
            const currentItemIndex = this.getVisibleItems().findIndex((item) => item.dbItem.id === this.currentFocus?.dbItem.id);
            if (isPanoVertical) {
                return (symbol === Clutter.KEY_Up && currentItemIndex === 0) || symbol === Clutter.KEY_Left;
            }
            else {
                return (symbol === Clutter.KEY_Left && currentItemIndex === 0) || symbol === Clutter.KEY_Up;
            }
        };
        this.connect('key-press-event', (_, event) => {
            if (event.get_key_symbol() === Clutter.KEY_Tab ||
                event.get_key_symbol() === Clutter.KEY_ISO_Left_Tab ||
                event.get_key_symbol() === Clutter.KEY_KP_Tab) {
                this.emit('scroll-tab-press', event.has_shift_modifier());
                return Clutter.EVENT_STOP;
            }
            if (event.has_control_modifier() && event.get_key_symbol() >= 49 && event.get_key_symbol() <= 57) {
                this.selectItemByIndex(event.get_key_symbol() - 49);
                return Clutter.EVENT_STOP;
            }
            if (event.get_state()) {
                return Clutter.EVENT_PROPAGATE;
            }
            if (shouldFocusOut(event.get_key_symbol())) {
                this.emit('scroll-focus-out');
                return Clutter.EVENT_STOP;
            }
            if (event.get_key_symbol() === Clutter.KEY_Alt_L || event.get_key_symbol() === Clutter.KEY_Alt_R) {
                this.emit('scroll-alt-press');
                return Clutter.EVENT_PROPAGATE;
            }
            if (event.get_key_symbol() == Clutter.KEY_BackSpace) {
                this.emit('scroll-backspace-press');
                return Clutter.EVENT_STOP;
            }
            const unicode = Clutter.keysym_to_unicode(event.get_key_symbol());
            if (unicode === 0) {
                return Clutter.EVENT_PROPAGATE;
            }
            this.emit('scroll-key-press', String.fromCharCode(unicode));
            return Clutter.EVENT_STOP;
        });
        db.query(new ClipboardQueryBuilder().build()).forEach((dbItem) => {
            const panoItem = createPanoItemFromDb(ext, this.clipboardManager, dbItem);
            if (panoItem) {
                panoItem.connect('motion-event', () => {
                    if (this.isHovering(this.searchBox)) {
                        this.searchBox.focus();
                    }
                });
                this.connectOnRemove(panoItem);
                this.connectOnFavorite(panoItem);
                this.list.add_child(panoItem);
            }
        });
        const firstItem = this.list.get_first_child();
        if (firstItem !== null) {
            firstItem.emit('activated');
        }
        this.settings.connect('changed::history-length', () => {
            this.removeExcessiveItems();
        });
        this.clipboardChangedSignalId = this.clipboardManager.connect('changed', async (_, content) => {
            const panoItem = await createPanoItem(ext, this.clipboardManager, content);
            if (panoItem && this) {
                this.prependItem(panoItem);
                this.filter(this.currentFilter, this.currentItemTypeFilter, this.showFavorites);
            }
        });
    }
    setScrollbarPolicy() {
        if (isVertical(this.settings.get_uint('window-position'))) {
            this.set_policy(St.PolicyType.NEVER, St.PolicyType.EXTERNAL);
        }
        else {
            this.set_policy(St.PolicyType.EXTERNAL, St.PolicyType.NEVER);
        }
    }
    prependItem(panoItem) {
        const existingItem = this.getItem(panoItem);
        if (existingItem) {
            this.removeItem(existingItem);
        }
        this.connectOnRemove(panoItem);
        this.connectOnFavorite(panoItem);
        panoItem.connect('motion-event', () => {
            if (this.isHovering(this.searchBox)) {
                this.searchBox.focus();
            }
        });
        this.list.insert_child_at_index(panoItem, 0);
        this.removeExcessiveItems();
    }
    isHovering(actor) {
        const [x, y] = Shell.Global.get().get_pointer();
        const [x1, y1] = [actor.get_abs_allocation_vertices()[0].x, actor.get_abs_allocation_vertices()[0].y];
        const [x2, y2] = [actor.get_abs_allocation_vertices()[3].x, actor.get_abs_allocation_vertices()[3].y];
        return x1 <= x && x <= x2 && y1 <= y && y <= y2;
    }
    connectOnFavorite(panoItem) {
        panoItem.connect('on-favorite', () => {
            this.currentFocus = panoItem;
            this.focusOnClosest();
            this.emit('scroll-update-list');
        });
    }
    connectOnRemove(panoItem) {
        panoItem.connect('on-remove', () => {
            if (this.currentFocus === panoItem) {
                this.focusNext() || this.focusPrev();
            }
            this.removeItem(panoItem);
            this.filter(this.currentFilter, this.currentItemTypeFilter, this.showFavorites);
            if (this.getVisibleItems().length === 0) {
                this.emit('scroll-focus-out');
            }
            else {
                this.focusOnClosest();
            }
        });
    }
    removeItem(item) {
        item.hide();
        this.list.remove_child(item);
    }
    getItem(panoItem) {
        return this.getItems().find((item) => item.dbItem.id === panoItem.dbItem.id);
    }
    getItems() {
        return this.list.get_children();
    }
    getVisibleItems() {
        return this.getItems().filter((item) => item.is_visible());
    }
    removeExcessiveItems() {
        const historyLength = this.settings.get_int('history-length');
        const items = this.getItems().filter((i) => i.dbItem.isFavorite === false);
        if (historyLength < items.length) {
            items.slice(historyLength).forEach((item) => {
                this.removeItem(item);
            });
        }
        db.query(new ClipboardQueryBuilder().withFavorites(false).withLimit(-1, this.settings.get_int('history-length')).build()).forEach((dbItem) => {
            removeItemResources(this.ext, dbItem);
        });
    }
    focusNext() {
        const lastFocus = this.currentFocus;
        if (!lastFocus) {
            return this.focusOnClosest();
        }
        const items = this.getVisibleItems();
        const index = items.findIndex((item) => item.dbItem.id === lastFocus.dbItem.id);
        if (index + 1 < items.length) {
            this.currentFocus = items[index + 1];
            this.currentFocus.grab_key_focus();
            return true;
        }
        return false;
    }
    focusPrev() {
        const lastFocus = this.currentFocus;
        if (!lastFocus) {
            return this.focusOnClosest();
        }
        const items = this.getVisibleItems();
        const index = items.findIndex((item) => item.dbItem.id === lastFocus.dbItem.id);
        if (index - 1 >= 0) {
            this.currentFocus = items[index - 1];
            this.currentFocus.grab_key_focus();
            return true;
        }
        return false;
    }
    filter(text, itemType, showFavorites) {
        this.currentFilter = text;
        this.currentItemTypeFilter = itemType;
        this.showFavorites = showFavorites;
        if (!text && !itemType && null === showFavorites) {
            this.getItems().forEach((i) => i.show());
            return;
        }
        const builder = new ClipboardQueryBuilder();
        if (showFavorites) {
            builder.withFavorites(showFavorites);
        }
        if (itemType) {
            builder.withItemTypes([itemType]);
        }
        if (text) {
            builder.withContainingSearchValue(text);
        }
        const result = db.query(builder.build()).map((dbItem) => dbItem.id);
        this.getItems().forEach((item) => (result.indexOf(item.dbItem.id) >= 0 ? item.show() : item.hide()));
    }
    focusOnClosest() {
        const lastFocus = this.currentFocus;
        const items = this.getVisibleItems();
        if (lastFocus !== null) {
            if (lastFocus.get_parent() === this.list && lastFocus.is_visible()) {
                lastFocus.grab_key_focus();
                return true;
            }
            else {
                let nextFocus = items.find((item) => item.dbItem.copyDate <= lastFocus.dbItem.copyDate);
                if (!nextFocus) {
                    nextFocus = items.reverse().find((item) => item.dbItem.copyDate >= lastFocus.dbItem.copyDate);
                }
                if (nextFocus) {
                    this.currentFocus = nextFocus;
                    nextFocus.grab_key_focus();
                    return true;
                }
            }
        }
        else if (this.currentFilter && items.length > 0) {
            this.currentFocus = items[0];
            this.currentFocus.grab_key_focus();
            return true;
        }
        else if (!this.currentFilter && items.length > 1) {
            this.currentFocus = items[1];
            this.currentFocus.grab_key_focus();
            return true;
        }
        else if (items.length > 0) {
            this.currentFocus = items[0];
            this.currentFocus.grab_key_focus();
            return true;
        }
        return false;
    }
    scrollToFirstItem() {
        const items = this.getVisibleItems();
        if (items.length === 0) {
            return;
        }
        this.scrollToItem(items[0]);
    }
    scrollToFocussedItem() {
        if (!this.currentFocus || !this.currentFocus.is_visible()) {
            return;
        }
        this.scrollToItem(this.currentFocus);
    }
    focusAndScrollToFirst() {
        const items = this.getVisibleItems();
        if (items.length === 0) {
            this.emit('scroll-focus-out');
            this.currentFocus = null;
            return;
        }
        this.currentFocus = items[0];
        this.currentFocus.grab_key_focus();
        if (isVertical(this.settings.get_uint('window-position'))) {
            this.vscroll.adjustment.set_value(this.get_allocation_box().y1);
        }
        else {
            this.hscroll.adjustment.set_value(this.get_allocation_box().x1);
        }
    }
    beforeHide() {
        this.currentFocus = null;
        this.scrollToFirstItem();
        this.emit('scroll-focus-out');
    }
    scrollToItem(item) {
        const box = item.get_allocation_box();
        let adjustment;
        let value;
        if (isVertical(this.settings.get_uint('window-position'))) {
            adjustment = getScrollViewAdjustment(this, 'v');
            value = box.y1 + adjustment.stepIncrement / 2.0 - adjustment.pageSize / 2.0;
        }
        else {
            adjustment = getScrollViewAdjustment(this, 'h');
            value = box.x1 + adjustment.stepIncrement / 2.0 - adjustment.pageSize / 2.0;
        }
        if (!Number.isFinite(value)) {
            return;
        }
        adjustment.ease(value, {
            duration: 150,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
    }
    selectFirstItem() {
        const visibleItems = this.getVisibleItems();
        if (visibleItems.length > 0) {
            const item = visibleItems[0];
            item.emit('activated');
        }
    }
    selectItemByIndex(index) {
        const visibleItems = this.getVisibleItems();
        if (visibleItems.length > index) {
            const item = visibleItems[index];
            item.emit('activated');
        }
    }
    vfunc_key_press_event(event) {
        const isPanoVertical = isVertical(this.settings.get_uint('window-position'));
        if (isPanoVertical && event.get_key_symbol() === Clutter.KEY_Up) {
            this.focusPrev();
            this.scrollToFocussedItem();
        }
        else if (isPanoVertical && event.get_key_symbol() === Clutter.KEY_Down) {
            this.focusNext();
            this.scrollToFocussedItem();
        }
        else if (!isPanoVertical && event.get_key_symbol() === Clutter.KEY_Left) {
            this.focusPrev();
            this.scrollToFocussedItem();
        }
        else if (!isPanoVertical && event.get_key_symbol() === Clutter.KEY_Right) {
            this.focusNext();
            this.scrollToFocussedItem();
        }
        return Clutter.EVENT_PROPAGATE;
    }
    vfunc_scroll_event(event) {
        let adjustment;
        if (isVertical(this.settings.get_uint('window-position'))) {
            adjustment = this.vscroll.adjustment;
        }
        else {
            adjustment = this.hscroll.adjustment;
        }
        let value = adjustment.value;
        if (event.get_scroll_direction() === Clutter.ScrollDirection.SMOOTH) {
            return Clutter.EVENT_STOP;
        }
        if (event.get_scroll_direction() === Clutter.ScrollDirection.UP ||
            event.get_scroll_direction() === Clutter.ScrollDirection.LEFT) {
            value -= adjustment.stepIncrement * 2;
        }
        else if (event.get_scroll_direction() === Clutter.ScrollDirection.DOWN ||
            event.get_scroll_direction() === Clutter.ScrollDirection.RIGHT) {
            value += adjustment.stepIncrement * 2;
        }
        adjustment.remove_transition('value');
        adjustment.ease(value, {
            duration: 150,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
        return Clutter.EVENT_STOP;
    }
    destroy() {
        if (this.clipboardChangedSignalId) {
            this.clipboardManager.disconnect(this.clipboardChangedSignalId);
            this.clipboardChangedSignalId = null;
        }
        this.getItems().forEach((item) => {
            item.destroy();
        });
        super.destroy();
    }
};
PanoScrollView.metaInfo = {
    GTypeName: 'PanoScrollView',
    Signals: {
        'scroll-focus-out': {},
        'scroll-update-list': {},
        'scroll-alt-press': {},
        'scroll-tab-press': {
            param_types: [GObject.TYPE_BOOLEAN],
            accumulator: 0,
        },
        'scroll-backspace-press': {},
        'scroll-key-press': {
            param_types: [GObject.TYPE_STRING],
            accumulator: 0,
        },
    },
};
PanoScrollView = __decorate([
    registerGObjectClass
], PanoScrollView);

let SearchBox = class SearchBox extends St.BoxLayout {
    constructor(ext) {
        super({
            xAlign: Clutter.ActorAlign.CENTER,
            styleClass: 'search-entry-container',
            vertical: false,
            trackHover: true,
            reactive: true,
        });
        this.currentIndex = null;
        this.showFavorites = false;
        this.ext = ext;
        const _ = gettext(ext);
        this.settings = getCurrentExtensionSettings(ext);
        const themeContext = St.ThemeContext.get_for_stage(Shell.Global.get().get_stage());
        this.search = new St.Entry({
            canFocus: true,
            hintText: _('Type to search, Tab to cycle'),
            naturalWidth: 300 * themeContext.scaleFactor,
            height: 40 * themeContext.scaleFactor,
            trackHover: true,
            primaryIcon: this.createSearchEntryIcon('edit-find-symbolic', 'search-entry-icon'),
            secondaryIcon: this.createSearchEntryIcon('starred-symbolic', 'search-entry-fav-icon'),
        });
        themeContext.connect('notify::scale-factor', () => {
            this.search.naturalWidth = 300 * themeContext.scaleFactor;
            this.search.set_height(40 * themeContext.scaleFactor);
        });
        this.search.connect('primary-icon-clicked', () => {
            this.focus();
            this.toggleItemType(false);
        });
        this.search.connect('secondary-icon-clicked', () => {
            this.focus();
            this.toggleFavorites();
        });
        this.search.clutterText.connect('text-changed', () => {
            this.emitSearchTextChange();
        });
        this.search.clutterText.connect('key-press-event', (_, event) => {
            if (event.get_key_symbol() === Clutter.KEY_Down ||
                (event.get_key_symbol() === Clutter.KEY_Right &&
                    (this.search.clutterText.cursorPosition === -1 || this.search.text?.length === 0))) {
                this.emit('search-focus-out');
                return Clutter.EVENT_STOP;
            }
            else if (event.get_key_symbol() === Clutter.KEY_Right &&
                this.search.clutterText.get_selection() !== null &&
                this.search.clutterText.get_selection() === this.search.text) {
                this.search.clutterText.set_cursor_position(this.search.text?.length ?? 0);
                return Clutter.EVENT_STOP;
            }
            if (event.get_key_symbol() === Clutter.KEY_Return ||
                event.get_key_symbol() === Clutter.KEY_ISO_Enter ||
                event.get_key_symbol() === Clutter.KEY_KP_Enter) {
                this.emit('search-submit');
                return Clutter.EVENT_STOP;
            }
            if (event.has_control_modifier() && event.get_key_symbol() >= 49 && event.get_key_symbol() <= 57) {
                this.emit('search-item-select-shortcut', event.get_key_symbol() - 49);
                return Clutter.EVENT_STOP;
            }
            if (event.get_key_symbol() === Clutter.KEY_Tab ||
                event.get_key_symbol() === Clutter.KEY_ISO_Left_Tab ||
                event.get_key_symbol() === Clutter.KEY_KP_Tab) {
                this.toggleItemType(event.has_shift_modifier());
                return Clutter.EVENT_STOP;
            }
            if (event.get_key_symbol() === Clutter.KEY_BackSpace && this.search.text?.length === 0) {
                this.search.set_primary_icon(this.createSearchEntryIcon('edit-find-symbolic', 'search-entry-icon'));
                this.currentIndex = null;
                this.emitSearchTextChange();
                return Clutter.EVENT_STOP;
            }
            if (event.get_key_symbol() === Clutter.KEY_Alt_L || event.get_key_symbol() === Clutter.KEY_Alt_R) {
                this.toggleFavorites();
                this.emitSearchTextChange();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
        this.add_child(this.search);
        this.setStyle();
        this.settings.connect('changed::search-bar-font-family', this.setStyle.bind(this));
        this.settings.connect('changed::search-bar-font-size', this.setStyle.bind(this));
    }
    setStyle() {
        const searchBarFontFamily = this.settings.get_string('search-bar-font-family');
        const searchBarFontSize = this.settings.get_int('search-bar-font-size');
        this.search.set_style(`font-family: ${searchBarFontFamily}; font-size: ${searchBarFontSize}px;`);
    }
    toggleItemType(hasShift) {
        const panoItemTypes = getPanoItemTypes(this.ext);
        // increment or decrement the current index based on the shift modifier
        if (hasShift) {
            this.currentIndex = this.currentIndex === null ? Object.keys(panoItemTypes).length - 1 : this.currentIndex - 1;
        }
        else {
            this.currentIndex = this.currentIndex === null ? 0 : this.currentIndex + 1;
        }
        // if the index is out of bounds, set it to the other end
        if (this.currentIndex < 0 || this.currentIndex >= Object.keys(panoItemTypes).length) {
            this.currentIndex = null;
        }
        if (this.currentIndex === null) {
            this.search.set_primary_icon(this.createSearchEntryIcon('edit-find-symbolic', 'search-entry-icon'));
        }
        else {
            this.search.set_primary_icon(this.createSearchEntryIcon(Gio.icon_new_for_string(`${this.ext.path}/icons/hicolor/scalable/actions/${ICON_PACKS[this.settings.get_uint('icon-pack')]}-${panoItemTypes[Object.keys(panoItemTypes)[this.currentIndex]].iconPath}`), 'search-entry-icon'));
        }
        this.settings.connect('changed::icon-pack', () => {
            if (null == this.currentIndex) {
                this.search.set_primary_icon(this.createSearchEntryIcon('edit-find-symbolic', 'search-entry-icon'));
            }
            else {
                this.search.set_primary_icon(this.createSearchEntryIcon(Gio.icon_new_for_string(`${this.ext.path}/icons/hicolor/scalable/actions/${ICON_PACKS[this.settings.get_uint('icon-pack')]}-${panoItemTypes[Object.keys(panoItemTypes)[this.currentIndex]].iconPath}`), 'search-entry-icon'));
            }
        });
        this.emitSearchTextChange();
    }
    createSearchEntryIcon(iconNameOrProto, styleClass) {
        const icon = new St.Icon({
            styleClass: styleClass,
            iconSize: 13,
            trackHover: true,
        });
        if (typeof iconNameOrProto === 'string') {
            icon.set_icon_name(iconNameOrProto);
        }
        else {
            icon.set_gicon(iconNameOrProto);
        }
        icon.connect('enter-event', () => {
            Shell.Global.get().display.set_cursor(Meta.Cursor.POINTING_HAND);
        });
        icon.connect('motion-event', () => {
            Shell.Global.get().display.set_cursor(Meta.Cursor.POINTING_HAND);
        });
        icon.connect('leave-event', () => {
            Shell.Global.get().display.set_cursor(Meta.Cursor.DEFAULT);
        });
        return icon;
    }
    toggleFavorites() {
        const icon = this.search.get_secondary_icon();
        if (this.showFavorites) {
            icon.remove_style_class_name('active');
        }
        else {
            icon.add_style_class_name('active');
        }
        this.showFavorites = !this.showFavorites;
        this.emitSearchTextChange();
    }
    emitSearchTextChange() {
        const panoItemTypes = getPanoItemTypes(this.ext);
        let itemType = null;
        if (this.currentIndex !== null) {
            itemType = Object.keys(panoItemTypes)[this.currentIndex] ?? null;
        }
        this.emit('search-text-changed', this.search.text, itemType || '', this.showFavorites);
    }
    focus() {
        this.search.grab_key_focus();
    }
    removeChar() {
        this.search.text = this.search.text?.slice(0, -1) ?? '';
    }
    appendText(text) {
        this.search.text += text;
    }
    selectAll() {
        this.search.clutterText.set_selection(0, this.search.text?.length ?? 0);
    }
    clear() {
        this.search.text = '';
    }
    getText() {
        return this.search.text || '';
    }
};
SearchBox.metaInfo = {
    GTypeName: 'SearchBox',
    Signals: {
        'search-text-changed': {
            param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING, GObject.TYPE_BOOLEAN],
            accumulator: 0,
        },
        'search-item-select-shortcut': {
            param_types: [GObject.TYPE_INT],
            accumulator: 0,
        },
        'search-focus-out': {},
        'search-submit': {},
    },
};
SearchBox = __decorate([
    registerGObjectClass
], SearchBox);

let PanoWindow = class PanoWindow extends St.BoxLayout {
    constructor(ext, clipboardManager) {
        super({
            name: 'pano-window',
            constraints: getMonitorConstraint(),
            styleClass: 'pano-window',
            visible: false,
            vertical: true,
            reactive: true,
            opacity: 0,
            canFocus: true,
        });
        this.settings = getCurrentExtensionSettings(ext);
        this.setAlignment();
        const themeContext = St.ThemeContext.get_for_stage(Shell.Global.get().get_stage());
        this.setWindowDimensions(themeContext.scaleFactor);
        themeContext.connect('notify::scale-factor', () => {
            this.setWindowDimensions(themeContext.scaleFactor);
        });
        this.settings.connect('changed::item-size', () => {
            this.setWindowDimensions(themeContext.scaleFactor);
        });
        this.settings.connect('changed::window-position', () => {
            this.setWindowDimensions(themeContext.scaleFactor);
            this.setAlignment();
        });
        this.settings.connect('changed::window-background-color', () => {
            if (this.settings.get_boolean('is-in-incognito')) {
                this.set_style(`background-color: ${this.settings.get_string('incognito-window-background-color')} !important;`);
            }
            else {
                this.set_style(`background-color: ${this.settings.get_string('window-background-color')}`);
            }
        });
        this.settings.connect('changed::incognito-window-background-color', () => {
            if (this.settings.get_boolean('is-in-incognito')) {
                this.set_style(`background-color: ${this.settings.get_string('incognito-window-background-color')} !important;`);
            }
            else {
                this.set_style(`background-color: ${this.settings.get_string('window-background-color')}`);
            }
        });
        this.monitorBox = new MonitorBox();
        this.searchBox = new SearchBox(ext);
        this.scrollView = new PanoScrollView(ext, clipboardManager, this.searchBox);
        this.setupMonitorBox();
        this.setupScrollView();
        this.setupSearchBox();
        this.add_child(this.searchBox);
        this.add_child(this.scrollView);
        this.settings.connect('changed::is-in-incognito', () => {
            if (this.settings.get_boolean('is-in-incognito')) {
                this.add_style_class_name('incognito');
                this.set_style(`background-color: ${this.settings.get_string('incognito-window-background-color')} !important;`);
            }
            else {
                this.remove_style_class_name('incognito');
                this.set_style(`background-color: ${this.settings.get_string('window-background-color')}`);
            }
        });
        if (this.settings.get_boolean('is-in-incognito')) {
            this.add_style_class_name('incognito');
            this.set_style(`background-color: ${this.settings.get_string('incognito-window-background-color')} !important;`);
        }
        else {
            this.set_style(`background-color: ${this.settings.get_string('window-background-color')}`);
        }
    }
    setWindowDimensions(scaleFactor) {
        this.remove_style_class_name('vertical');
        if (isVertical(this.settings.get_uint('window-position'))) {
            this.add_style_class_name('vertical');
            this.set_width((this.settings.get_int('item-size') + 20) * scaleFactor);
        }
        else {
            this.set_height((this.settings.get_int('item-size') + 90) * scaleFactor);
        }
    }
    setAlignment() {
        const [x_align, y_align] = getAlignment(this.settings.get_uint('window-position'));
        this.set_x_align(x_align);
        this.set_y_align(y_align);
    }
    setupMonitorBox() {
        this.monitorBox.connect('hide_window', () => this.hide());
    }
    setupSearchBox() {
        this.searchBox.connect('search-focus-out', () => {
            this.scrollView.focusOnClosest();
            this.scrollView.scrollToFocussedItem();
        });
        this.searchBox.connect('search-submit', () => {
            this.scrollView.selectFirstItem();
        });
        this.searchBox.connect('search-text-changed', (_, text, itemType, showFavorites) => {
            this.scrollView.filter(text, itemType, showFavorites);
        });
        this.searchBox.connect('search-item-select-shortcut', (_, index) => {
            this.scrollView.selectItemByIndex(index);
        });
    }
    setupScrollView() {
        this.scrollView.connect('scroll-update-list', () => {
            this.searchBox.focus();
            this.searchBox.emitSearchTextChange();
            this.scrollView.focusOnClosest();
            this.scrollView.scrollToFocussedItem();
        });
        this.scrollView.connect('scroll-focus-out', () => {
            this.searchBox.focus();
        });
        this.scrollView.connect('scroll-backspace-press', () => {
            this.searchBox.removeChar();
            this.searchBox.focus();
        });
        this.scrollView.connect('scroll-alt-press', () => {
            this.searchBox.focus();
            this.searchBox.toggleFavorites();
            this.scrollView.focusAndScrollToFirst();
        });
        this.scrollView.connect('scroll-tab-press', (_, hasShift) => {
            this.searchBox.focus();
            this.searchBox.toggleItemType(hasShift);
            this.scrollView.focusAndScrollToFirst();
        });
        this.scrollView.connect('scroll-key-press', (_, text) => {
            this.searchBox.focus();
            this.searchBox.appendText(text);
        });
    }
    toggle() {
        this.is_visible() ? this.hide() : this.show();
    }
    show() {
        this.clear_constraints();
        this.setAlignment();
        this.add_constraint(getMonitorConstraint());
        super.show();
        if (this.settings.get_boolean('keep-search-entry')) {
            this.searchBox.selectAll();
        }
        else {
            this.searchBox.clear();
        }
        this.searchBox.focus();
        this.ease({
            opacity: 255,
            duration: 250,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
        this.monitorBox.open();
        return Clutter.EVENT_PROPAGATE;
    }
    hide() {
        this.monitorBox.close();
        this.ease({
            opacity: 0,
            duration: 200,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                if (!this.settings.get_boolean('keep-search-entry')) {
                    this.searchBox.clear();
                }
                this.scrollView.beforeHide();
                super.hide();
            },
        });
        return Clutter.EVENT_PROPAGATE;
    }
    vfunc_key_press_event(event) {
        if (event.get_key_symbol() === Clutter.KEY_Escape) {
            this.hide();
        }
        return Clutter.EVENT_PROPAGATE;
    }
    destroy() {
        this.monitorBox.destroy();
        this.searchBox.destroy();
        this.scrollView.destroy();
        super.destroy();
    }
};
PanoWindow = __decorate([
    registerGObjectClass
], PanoWindow);

class KeyManager {
    constructor(ext) {
        this.settings = getCurrentExtensionSettings(ext);
    }
    stopListening(gsettingsField) {
        wm.removeKeybinding(gsettingsField);
    }
    listenFor(gsettingsField, callback) {
        wm.addKeybinding(gsettingsField, this.settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, callback);
    }
}

const { Extension } = extension;
const debug = logger('extension');
const global = Shell.Global.get();
class PanoExtension extends Extension {
    constructor(props) {
        super(props);
        this.keyManager = null;
        this.clipboardManager = null;
        this.panoWindow = null;
        this.indicator = null;
        this.dbus = null;
        this.settings = null;
        this.windowTrackerId = null;
        this.timeoutId = null;
        this.shutdownSignalId = null;
        this.logoutSignalId = null;
        this.rebootSignalId = null;
        this.systemdSignalId = null;
        this.clipboardChangedSignalId = null;
        debug('extension is initialized');
    }
    enable() {
        this.settings = getCurrentExtensionSettings(this);
        this.setupResources();
        this.keyManager = new KeyManager(this);
        this.clipboardManager = new ClipboardManager(this);
        this.indicator = new PanoIndicator(this, this.clearHistory.bind(this), () => this.panoWindow?.toggle());
        this.start();
        this.indicator.enable();
        this.enableDbus();
        Meta.disable_unredirect_for_display(global.display);
        debug('extension is enabled');
    }
    disable() {
        this.stop();
        this.disableDbus();
        this.indicator?.disable();
        this.settings = null;
        this.keyManager = null;
        this.clipboardManager = null;
        this.indicator = null;
        Meta.enable_unredirect_for_display(global.display);
        debug('extension is disabled');
    }
    // for dbus
    start() {
        if (this.clipboardManager !== null && this.keyManager !== null) {
            this.clipboardChangedSignalId = this.clipboardManager.connect('changed', () => this.indicator?.animate());
            this.connectSessionDbus();
            this.panoWindow = new PanoWindow(this, this.clipboardManager);
            this.trackWindow();
            addTopChrome(this.panoWindow);
            this.keyManager.listenFor('global-shortcut', () => this.panoWindow?.toggle());
            this.keyManager.listenFor('incognito-shortcut', () => {
                this.settings?.set_boolean('is-in-incognito', !this.settings?.get_boolean('is-in-incognito'));
            });
            this.clipboardManager.startTracking();
        }
    }
    // for dbus
    stop() {
        this.clipboardManager?.stopTracking();
        this.keyManager?.stopListening('incognito-shortcut');
        this.keyManager?.stopListening('global-shortcut');
        this.untrackWindow();
        if (this.panoWindow) {
            removeChrome(this.panoWindow);
        }
        this.panoWindow?.destroy();
        this.panoWindow = null;
        db.shutdown();
        this.disconnectSessionDbus();
        if (this.clipboardChangedSignalId) {
            this.clipboardManager?.disconnect(this.clipboardChangedSignalId);
            this.clipboardChangedSignalId = null;
        }
        debounceIds.forEach((debounceId) => {
            GLib.Source.remove(debounceId);
        });
        removeVirtualKeyboard();
        removeSoundContext();
    }
    // for dbus
    show() {
        this.panoWindow?.show();
    }
    // for dbus
    hide() {
        this.panoWindow?.hide();
    }
    // for dbus
    toggle() {
        this.panoWindow?.toggle();
    }
    setupResources() {
        setupAppDirs(this);
        db.setup(this);
    }
    async clearHistory() {
        this.stop();
        await deleteAppDirs(this);
        this.start();
    }
    async clearSessionHistory() {
        if (this.settings?.get_boolean('session-only-mode')) {
            debug('clearing session history');
            db.shutdown();
            this.clipboardManager?.stopTracking();
            await deleteAppDirs(this);
            debug('deleted session cache and db');
            this.clipboardManager?.setContent(new ClipboardContent({
                type: ContentType.TEXT,
                value: '',
            }));
            debug('cleared last clipboard content');
        }
    }
    enableDbus() {
        const iface = loadInterfaceXML(this, 'io.elhan.Pano');
        this.dbus = Gio.DBusExportedObject.wrapJSObject(iface, this);
        this.dbus.export(Gio.DBus.session, '/io/elhan/Pano');
    }
    disableDbus() {
        this.dbus?.unexport();
        this.dbus = null;
    }
    connectSessionDbus() {
        this.logoutSignalId = Gio.DBus.session.signal_subscribe(null, 'org.gnome.SessionManager.EndSessionDialog', 'ConfirmedLogout', '/org/gnome/SessionManager/EndSessionDialog', null, Gio.DBusSignalFlags.NONE, this.clearSessionHistory.bind(this));
        this.rebootSignalId = Gio.DBus.session.signal_subscribe(null, 'org.gnome.SessionManager.EndSessionDialog', 'ConfirmedReboot', '/org/gnome/SessionManager/EndSessionDialog', null, Gio.DBusSignalFlags.NONE, this.clearSessionHistory.bind(this));
        this.shutdownSignalId = Gio.DBus.session.signal_subscribe(null, 'org.gnome.SessionManager.EndSessionDialog', 'ConfirmedShutdown', '/org/gnome/SessionManager/EndSessionDialog', null, Gio.DBusSignalFlags.NONE, this.clearSessionHistory.bind(this));
        this.systemdSignalId = Gio.DBus.system.signal_subscribe(null, 'org.freedesktop.login1.Manager', 'PrepareForShutdown', '/org/freedesktop/login1', null, Gio.DBusSignalFlags.NONE, this.clearSessionHistory.bind(this));
    }
    disconnectSessionDbus() {
        if (this.logoutSignalId) {
            Gio.DBus.session.signal_unsubscribe(this.logoutSignalId);
            this.logoutSignalId = null;
        }
        if (this.shutdownSignalId) {
            Gio.DBus.session.signal_unsubscribe(this.shutdownSignalId);
            this.shutdownSignalId = null;
        }
        if (this.rebootSignalId) {
            Gio.DBus.session.signal_unsubscribe(this.rebootSignalId);
            this.rebootSignalId = null;
        }
        if (this.systemdSignalId) {
            Gio.DBus.system.signal_unsubscribe(this.systemdSignalId);
            this.systemdSignalId = null;
        }
    }
    trackWindow() {
        this.windowTrackerId = Shell.Global.get().display.connect('notify::focus-window', () => {
            const focussedWindow = Shell.Global.get().display.focusWindow;
            if (focussedWindow && this.panoWindow?.is_visible()) {
                this.panoWindow.hide();
            }
            const wmClass = focussedWindow?.get_wm_class();
            if (wmClass &&
                this.settings?.get_boolean('watch-exclusion-list') &&
                this.settings
                    .get_strv('exclusion-list')
                    .map((s) => s.toLowerCase())
                    .indexOf(wmClass.toLowerCase()) >= 0) {
                this.clipboardManager?.stopTracking();
            }
            else if (this.clipboardManager?.isTracking === false) {
                this.timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
                    this.clipboardManager?.startTracking();
                    if (this.timeoutId) {
                        GLib.Source.remove(this.timeoutId);
                    }
                    this.timeoutId = null;
                    return GLib.SOURCE_REMOVE;
                });
            }
        });
    }
    untrackWindow() {
        if (this.windowTrackerId) {
            Shell.Global.get().display.disconnect(this.windowTrackerId);
            this.windowTrackerId = null;
        }
        if (this.timeoutId) {
            GLib.Source.remove(this.timeoutId);
            this.timeoutId = null;
        }
    }
}

export { PanoExtension as default };
