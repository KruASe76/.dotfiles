import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';

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

const createColorRow = (title, subtitle, settings, schemaKey) => {
    const colorRow = new Adw.ActionRow({
        title,
        subtitle,
    });
    const colorButton = new Gtk.ColorButton({
        title,
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
        use_alpha: true,
    });
    const rgba = new Gdk.RGBA();
    rgba.parse(settings.get_string(schemaKey));
    colorButton.set_rgba(rgba);
    colorButton.connect('color-set', () => {
        const color = colorButton.get_rgba();
        const colorString = color.to_string();
        settings.set_string(schemaKey, colorString);
    });
    colorRow.add_suffix(colorButton);
    colorRow.set_activatable_widget(colorButton);
    const clearButton = new Gtk.Button({
        icon_name: 'edit-clear-symbolic',
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
    });
    const value = settings.get_string(schemaKey);
    const defaultValue = settings.get_default_value(schemaKey)?.get_string()[0];
    if (defaultValue === value) {
        clearButton.sensitive = false;
    }
    settings.connect(`changed::${schemaKey}`, () => {
        const value = settings.get_string(schemaKey);
        if (defaultValue === value) {
            clearButton.sensitive = false;
        }
        else {
            clearButton.sensitive = true;
        }
        const rgba = new Gdk.RGBA();
        rgba.parse(value);
        colorButton.set_rgba(rgba);
    });
    clearButton.connect('clicked', () => {
        settings.reset(schemaKey);
    });
    colorRow.add_suffix(clearButton);
    return colorRow;
};
const createSpinRow = (title, subtitle, settings, schemaKey, increment, lower, upper) => {
    const row = new Adw.ActionRow({
        title,
        subtitle,
    });
    const value = settings.get_int(schemaKey);
    const spinButton = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({ step_increment: increment, lower, upper }),
        value,
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
    });
    settings.bind(schemaKey, spinButton, 'value', Gio.SettingsBindFlags.DEFAULT);
    row.add_suffix(spinButton);
    row.set_activatable_widget(spinButton);
    const clearButton = new Gtk.Button({
        icon_name: 'edit-clear-symbolic',
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
    });
    const defaultValue = settings.get_default_value(schemaKey)?.get_int32();
    if (defaultValue === value) {
        clearButton.sensitive = false;
    }
    settings.connect(`changed::${schemaKey}`, () => {
        const value = settings.get_int(schemaKey);
        if (defaultValue === value) {
            clearButton.sensitive = false;
        }
        else {
            clearButton.sensitive = true;
        }
    });
    clearButton.connect('clicked', () => {
        settings.reset(schemaKey);
    });
    row.add_suffix(clearButton);
    return row;
};
const createFontRow = (title, subtitle, settings, schemaKey) => {
    const getFont = () => `${settings.get_string(`${schemaKey}-family`)} ${settings.get_int(`${schemaKey}-size`)}`;
    const getDefaultFont = () => `${settings.get_default_value(`${schemaKey}-family`)?.get_string()[0]} ${settings
        .get_default_value(`${schemaKey}-size`)
        ?.get_int32()}`;
    const fontRow = new Adw.ActionRow({
        title,
        subtitle,
    });
    const fontButton = new Gtk.FontButton({
        title,
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
        use_font: true,
        font: getFont(),
    });
    fontButton.connect('font-set', () => {
        const fontFamily = fontButton.get_font_family()?.get_name();
        const fontSize = fontButton.get_font_size() / Pango.SCALE;
        settings.set_string(`${schemaKey}-family`, fontFamily || 'Cantarell Regular');
        settings.set_int(`${schemaKey}-size`, fontSize || 11);
    });
    fontRow.add_suffix(fontButton);
    fontRow.set_activatable_widget(fontButton);
    const clearButton = new Gtk.Button({
        icon_name: 'edit-clear-symbolic',
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
    });
    const value = getFont();
    const defaultValue = getDefaultFont();
    if (defaultValue === value) {
        clearButton.sensitive = false;
    }
    const onChange = () => {
        const value = getFont();
        if (defaultValue === value) {
            clearButton.sensitive = false;
        }
        else {
            clearButton.sensitive = true;
        }
        fontButton.set_font(value);
    };
    settings.connect(`changed::${schemaKey}-family`, onChange);
    settings.connect(`changed::${schemaKey}-size`, onChange);
    clearButton.connect('clicked', () => {
        settings.reset(`${schemaKey}-family`);
        settings.reset(`${schemaKey}-size`);
    });
    fontRow.add_suffix(clearButton);
    return fontRow;
};
const createDropdownRow = (title, subtitle, settings, schemaKey, options) => {
    const row = new Adw.ActionRow({
        title,
        subtitle,
    });
    const value = settings.get_uint(schemaKey);
    const dropDown = new Gtk.DropDown({
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
        model: Gtk.StringList.new(options),
    });
    dropDown.set_selected(value);
    dropDown.connect('notify::selected', () => {
        settings.set_uint(schemaKey, dropDown.get_selected());
    });
    row.add_suffix(dropDown);
    row.set_activatable_widget(dropDown);
    const clearButton = new Gtk.Button({
        icon_name: 'edit-clear-symbolic',
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
    });
    const defaultValue = settings.get_default_value(schemaKey)?.get_uint32();
    if (defaultValue === value) {
        clearButton.sensitive = false;
    }
    settings.connect(`changed::${schemaKey}`, () => {
        const value = settings.get_uint(schemaKey);
        if (defaultValue === value) {
            clearButton.sensitive = false;
        }
        else {
            clearButton.sensitive = true;
        }
        dropDown.set_selected(value);
    });
    clearButton.connect('clicked', () => {
        settings.reset(schemaKey);
        dropDown.set_selected(defaultValue || 0);
    });
    row.add_suffix(clearButton);
    return row;
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
const getCachePath = (ext) => `${GLib.get_user_cache_dir()}/${ext.uuid}`;
const moveDbFile = (from, to) => {
    if (from === to) {
        return;
    }
    const oldDb = Gio.File.new_for_path(`${from}/pano.db`);
    const newDb = Gio.File.new_for_path(`${to}/pano.db`);
    if (oldDb.query_exists(null) && !newDb.query_exists(null)) {
        const newDBParent = Gio.File.new_for_path(to);
        if (!newDBParent.query_exists(null)) {
            newDBParent.make_directory_with_parents(null);
        }
        oldDb.move(newDb, Gio.FileCopyFlags.ALL_METADATA, null, null);
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
function gettext(ext) {
    return ext.gettext.bind(ext);
}

let CommonStyleGroup = class CommonStyleGroup extends Adw.PreferencesGroup {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Common'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        this.add(createDropdownRow(_('Icon Pack'), _('You can change the icon pack'), this.settings, 'icon-pack', [
            _('Default Icons'),
            _('Legacy Icons'),
        ]));
        this.add(createSpinRow(_('Item Size'), _('You can change the item size'), this.settings, 'item-size', 5, 200, 1000));
        this.add(createDropdownRow(_('Window Position'), _('You can change position of the Pano'), this.settings, 'window-position', [_('Top'), _('Right'), _('Bottom'), _('Left')]));
        this.add(createColorRow(_('Window Background Color'), _('You can change the window background color'), this.settings, 'window-background-color'));
        this.add(createColorRow(_('Incognito Window Background Color'), _('You can change the incognito window background color'), this.settings, 'incognito-window-background-color'));
        this.add(createFontRow(_('Search Bar Font'), _('You can change the font of the search bar'), this.settings, 'search-bar-font'));
        this.add(createFontRow(_('Item Title Font'), _('You can change the font of the title'), this.settings, 'item-title-font'));
        this.add(createFontRow(_('Item Date Font'), _('You can change the font of the date'), this.settings, 'item-date-font'));
        this.add(createColorRow(_('Active Item Border Color'), _('You can change the active item border color'), this.settings, 'active-item-border-color'));
        this.add(createColorRow(_('Hovered Item Border Color'), _('You can change the hovered item border color'), this.settings, 'hovered-item-border-color'));
    }
};
CommonStyleGroup = __decorate([
    registerGObjectClass
], CommonStyleGroup);

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

let ItemExpanderRow = class ItemExpanderRow extends Adw.ExpanderRow {
    constructor(ext, title, subtitle, iconName) {
        super({
            title,
            subtitle,
        });
        this.extensionSettings = getCurrentExtensionSettings(ext);
        const iconPack = this.extensionSettings.get_uint('icon-pack');
        const image = Gtk.Image.new_from_icon_name(`${ICON_PACKS[iconPack]}-${iconName}`);
        this.extensionSettings.connect('changed::icon-pack', () => {
            const iconPack = this.extensionSettings.get_uint('icon-pack');
            image.set_from_icon_name(`${ICON_PACKS[iconPack]}-${iconName}`);
        });
        this.add_prefix(image);
    }
};
ItemExpanderRow = __decorate([
    registerGObjectClass
], ItemExpanderRow);

let CodeItemStyleRow = class CodeItemStyleRow extends ItemExpanderRow {
    constructor(ext) {
        const _ = gettext(ext);
        super(ext, _('Code Item Style'), _('Change the style of the code item'), getPanoItemTypes(ext).CODE.iconName);
        this.settings = getCurrentExtensionSettings(ext).get_child('code-item');
        // create header background color row
        this.add_row(createColorRow(_('Header Background Color'), _('You can change the background color of the header'), this.settings, 'header-bg-color'));
        // create header text color row
        this.add_row(createColorRow(_('Header Text Color'), _('You can change the text color of the header'), this.settings, 'header-color'));
        // create body background color row
        this.add_row(createColorRow(_('Body Background Color'), _('You can change the background color of the body'), this.settings, 'body-bg-color'));
        // create body font row
        this.add_row(createFontRow(_('Body Font'), _('You can change the font of the body'), this.settings, 'body-font'));
        // create character length row
        this.add_row(createSpinRow(_('Character Length'), _('You can change the character length of the visible text in the body'), this.settings, 'char-length', 50, 50, 5000));
    }
};
CodeItemStyleRow = __decorate([
    registerGObjectClass
], CodeItemStyleRow);

let ColorItemStyleRow = class ColorItemStyleRow extends ItemExpanderRow {
    constructor(ext) {
        const _ = gettext(ext);
        super(ext, _('Color Item Style'), _('Change the style of the color item'), getPanoItemTypes(ext).COLOR.iconName);
        this.settings = getCurrentExtensionSettings(ext).get_child('color-item');
        // create header background color row
        this.add_row(createColorRow(_('Header Background Color'), _('You can change the background color of the header'), this.settings, 'header-bg-color'));
        // create header text color row
        this.add_row(createColorRow(_('Header Text Color'), _('You can change the text color of the header'), this.settings, 'header-color'));
        // create metadata background color row
        this.add_row(createColorRow(_('Metadata Background Color'), _('You can change the background color of the metadata'), this.settings, 'metadata-bg-color'));
        // create metadata text color row
        this.add_row(createColorRow(_('Metadata Text Color'), _('You can change the text color of the metadata'), this.settings, 'metadata-color'));
        // create metadata font row
        this.add_row(createFontRow(_('Body Font'), _('You can change the font of the metadata'), this.settings, 'metadata-font'));
    }
};
ColorItemStyleRow = __decorate([
    registerGObjectClass
], ColorItemStyleRow);

let EmojiItemStyleRow = class EmojiItemStyleRow extends ItemExpanderRow {
    constructor(ext) {
        const _ = gettext(ext);
        super(ext, _('Emoji Item Style'), _('Change the style of the emoji item'), getPanoItemTypes(ext).EMOJI.iconName);
        this.settings = getCurrentExtensionSettings(ext).get_child('emoji-item');
        // create header background color row
        this.add_row(createColorRow(_('Header Background Color'), _('You can change the background color of the header'), this.settings, 'header-bg-color'));
        // create header text color row
        this.add_row(createColorRow(_('Header Text Color'), _('You can change the text color of the header'), this.settings, 'header-color'));
        // create body background color row
        this.add_row(createColorRow(_('Body Background Color'), _('You can change the background color of the body'), this.settings, 'body-bg-color'));
        // create character length row
        this.add_row(createSpinRow(_('Emoji Size'), _('You can change the emoji size'), this.settings, 'emoji-size', 1, 10, 300));
    }
};
EmojiItemStyleRow = __decorate([
    registerGObjectClass
], EmojiItemStyleRow);

let FileItemStyleRow = class FileItemStyleRow extends ItemExpanderRow {
    constructor(ext) {
        const _ = gettext(ext);
        super(ext, _('File Item Style'), _('Change the style of the file item'), getPanoItemTypes(ext).FILE.iconName);
        this.settings = getCurrentExtensionSettings(ext).get_child('file-item');
        // create header background color row
        this.add_row(createColorRow(_('Header Background Color'), _('You can change the background color of the header'), this.settings, 'header-bg-color'));
        // create header text color row
        this.add_row(createColorRow(_('Header Text Color'), _('You can change the text color of the header'), this.settings, 'header-color'));
        // create body background color row
        this.add_row(createColorRow(_('Body Background Color'), _('You can change the background color of the body'), this.settings, 'body-bg-color'));
        // create body text color row
        this.add_row(createColorRow(_('Body Text Color'), _('You can change the text color of the body'), this.settings, 'body-color'));
        // create body font row
        this.add_row(createFontRow(_('Body Font'), _('You can change the font of the body'), this.settings, 'body-font'));
    }
};
FileItemStyleRow = __decorate([
    registerGObjectClass
], FileItemStyleRow);

let ImageItemStyleRow = class ImageItemStyleRow extends ItemExpanderRow {
    constructor(ext) {
        const _ = gettext(ext);
        super(ext, _('Image Item Style'), _('Change the style of the image item'), getPanoItemTypes(ext).IMAGE.iconName);
        this.settings = getCurrentExtensionSettings(ext).get_child('image-item');
        // create header background color row
        this.add_row(createColorRow(_('Header Background Color'), _('You can change the background color of the header'), this.settings, 'header-bg-color'));
        // create header text color row
        this.add_row(createColorRow(_('Header Text Color'), _('You can change the text color of the header'), this.settings, 'header-color'));
        // create body background color row
        this.add_row(createColorRow(_('Body Background Color'), _('You can change the background color of the body'), this.settings, 'body-bg-color'));
        // create metadata background color row
        this.add_row(createColorRow(_('Metadata Background Color'), _('You can change the background color of the metadata'), this.settings, 'metadata-bg-color'));
        // create metadata text color row
        this.add_row(createColorRow(_('Metadata Text Color'), _('You can change the text color of the metadata'), this.settings, 'metadata-color'));
        // create metadata font row
        this.add_row(createFontRow(_('Metadata Font'), _('You can change the font of the metadata'), this.settings, 'metadata-font'));
    }
};
ImageItemStyleRow = __decorate([
    registerGObjectClass
], ImageItemStyleRow);

let LinkItemStyleRow = class LinkItemStyleRow extends ItemExpanderRow {
    constructor(ext) {
        const _ = gettext(ext);
        super(ext, _('Link Item Style'), _('Change the style of the link item'), getPanoItemTypes(ext).LINK.iconName);
        this.settings = getCurrentExtensionSettings(ext).get_child('link-item');
        // create header background color row
        this.add_row(createColorRow(_('Header Background Color'), _('You can change the background color of the header'), this.settings, 'header-bg-color'));
        // create header text color row
        this.add_row(createColorRow(_('Header Text Color'), _('You can change the text color of the header'), this.settings, 'header-color'));
        // create body background color row
        this.add_row(createColorRow(_('Body Background Color'), _('You can change the background color of the body'), this.settings, 'body-bg-color'));
        // create metadata background color row
        this.add_row(createColorRow(_('Metadata Background Color'), _('You can change the background color of the metadata'), this.settings, 'metadata-bg-color'));
        // create metadata title color row
        this.add_row(createColorRow(_('Metadata Title Color'), _('You can change the title color of the metadata'), this.settings, 'metadata-title-color'));
        // create metadata title font row
        this.add_row(createFontRow(_('Metadata Title Font'), _('You can change the font of the metadata title'), this.settings, 'metadata-title-font'));
        // create metadata description color row
        this.add_row(createColorRow(_('Metadata Description Color'), _('You can change the description color of the metadata'), this.settings, 'metadata-description-color'));
        // create metadata description font row
        this.add_row(createFontRow(_('Metadata Description Font'), _('You can change the font of the metadata description'), this.settings, 'metadata-description-font'));
        // create metadata link color row
        this.add_row(createColorRow(_('Metadata Link Color'), _('You can change the link color of the metadata'), this.settings, 'metadata-link-color'));
        // create metadata link font row
        this.add_row(createFontRow(_('Metadata Link Font'), _('You can change the font of the metadata link'), this.settings, 'metadata-link-font'));
    }
};
LinkItemStyleRow = __decorate([
    registerGObjectClass
], LinkItemStyleRow);

let TextItemStyleRow = class TextItemStyleRow extends ItemExpanderRow {
    constructor(ext) {
        const _ = gettext(ext);
        super(ext, _('Text Item Style'), _('Change the style of the text item'), getPanoItemTypes(ext).TEXT.iconName);
        this.settings = getCurrentExtensionSettings(ext).get_child('text-item');
        // create header background color row
        this.add_row(createColorRow(_('Header Background Color'), _('You can change the background color of the header'), this.settings, 'header-bg-color'));
        // create header text color row
        this.add_row(createColorRow(_('Header Text Color'), _('You can change the text color of the header'), this.settings, 'header-color'));
        // create body background color row
        this.add_row(createColorRow(_('Body Background Color'), _('You can change the background color of the body'), this.settings, 'body-bg-color'));
        // create body text color row
        this.add_row(createColorRow(_('Body Text Color'), _('You can change the text color of the body'), this.settings, 'body-color'));
        // create body font row
        this.add_row(createFontRow(_('Body Font'), _('You can change the font of the body'), this.settings, 'body-font'));
        // create character length row
        this.add_row(createSpinRow(_('Character Length'), _('You can change the character length of the visible text in the body'), this.settings, 'char-length', 50, 50, 5000));
    }
};
TextItemStyleRow = __decorate([
    registerGObjectClass
], TextItemStyleRow);

let ItemStyleGroup = class ItemStyleGroup extends Adw.PreferencesGroup {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Item Style'),
            margin_top: 10,
        });
        this.add(new LinkItemStyleRow(ext));
        this.add(new TextItemStyleRow(ext));
        this.add(new EmojiItemStyleRow(ext));
        this.add(new FileItemStyleRow(ext));
        this.add(new ImageItemStyleRow(ext));
        this.add(new CodeItemStyleRow(ext));
        this.add(new ColorItemStyleRow(ext));
    }
};
ItemStyleGroup = __decorate([
    registerGObjectClass
], ItemStyleGroup);

let CustomizationPage = class CustomizationPage extends Adw.PreferencesPage {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Customization'),
            icon_name: 'emblem-photos-symbolic',
        });
        this.add(new CommonStyleGroup(ext));
        this.add(new ItemStyleGroup(ext));
    }
};
CustomizationPage = __decorate([
    registerGObjectClass
], CustomizationPage);

const debug$1 = logger('prefs:dangerZone:clearHistory');
let ClearHistoryRow = class ClearHistoryRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Clear History'),
            subtitle: _('Clears the clipboard database and cache'),
        });
        const clearHistoryButton = new Gtk.Button({
            css_classes: ['destructive-action'],
            label: _('Clear'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        clearHistoryButton.connect('clicked', () => {
            const md = new Gtk.MessageDialog({
                text: _('Are you sure you want to clear history?'),
                transient_for: this.get_root(),
                destroy_with_parent: true,
                modal: true,
                visible: true,
                buttons: Gtk.ButtonsType.OK_CANCEL,
            });
            md.get_widget_for_response(Gtk.ResponseType.OK)?.add_css_class('destructive-action');
            md.connect('response', async (_, response) => {
                if (response === Gtk.ResponseType.OK) {
                    let isDbusRunning = true;
                    try {
                        Gio.DBus.session.call_sync('org.gnome.Shell', '/io/elhan/Pano', 'io.elhan.Pano', 'stop', null, null, Gio.DBusCallFlags.NONE, -1, null);
                    }
                    catch (err) {
                        isDbusRunning = false;
                        debug$1('Extension is not enabled. Clearing db file without stopping the extension.');
                    }
                    await deleteAppDirs(ext);
                    if (isDbusRunning) {
                        Gio.DBus.session.call_sync('org.gnome.Shell', '/io/elhan/Pano', 'io.elhan.Pano', 'start', null, null, Gio.DBusCallFlags.NONE, -1, null);
                    }
                }
                md.destroy();
            });
        });
        this.add_suffix(clearHistoryButton);
    }
};
ClearHistoryRow = __decorate([
    registerGObjectClass
], ClearHistoryRow);

let SessionOnlyModeRow = class SessionOnlyModeRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Session Only Mode'),
            subtitle: _('When enabled, Pano will clear all history on logout/restart/shutdown.'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const sessionOnlySwitch = new Gtk.Switch({
            active: this.settings.get_boolean('session-only-mode'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('session-only-mode', sessionOnlySwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(sessionOnlySwitch);
        this.set_activatable_widget(sessionOnlySwitch);
    }
};
SessionOnlyModeRow = __decorate([
    registerGObjectClass
], SessionOnlyModeRow);

let DangerZonePage = class DangerZonePage extends Adw.PreferencesPage {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Danger Zone'),
            icon_name: 'user-trash-symbolic',
        });
        const dangerZoneGroup = new Adw.PreferencesGroup();
        dangerZoneGroup.add(new SessionOnlyModeRow(ext));
        dangerZoneGroup.add(new ClearHistoryRow(ext));
        this.add(dangerZoneGroup);
    }
};
DangerZonePage = __decorate([
    registerGObjectClass
], DangerZonePage);

let ExclusionGroup = class ExclusionGroup extends Adw.PreferencesGroup {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Manage Exclusions'),
            margin_top: 20,
        });
        this.settings = getCurrentExtensionSettings(ext);
        this.exclusionRow = new Adw.ExpanderRow({
            title: _('Excluded Apps'),
            subtitle: _('Pano will stop tracking if any window from the list is focussed'),
        });
        this.exclusionButton = new Gtk.Button({
            icon_name: 'list-add-symbolic',
            css_classes: ['flat'],
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.exclusionButton.connect('clicked', () => {
            this.exclusionRow.set_expanded(true);
            this.exclusionButton.set_sensitive(false);
            this.exclusionRow.add_row(this.createEntryRow(ext));
        });
        this.set_header_suffix(this.exclusionButton);
        this.add(this.exclusionRow);
        const savedWindowClasses = this.settings.get_strv('exclusion-list');
        savedWindowClasses.forEach((w) => this.exclusionRow.add_row(this.createExcludedApp(w)));
        if (savedWindowClasses.length > 0) {
            this.exclusionRow.set_expanded(true);
        }
    }
    createEntryRow(ext) {
        const entryRow = new Adw.ActionRow();
        const _ = gettext(ext);
        const entry = new Gtk.Entry({
            placeholder_text: _('Window class name'),
            halign: Gtk.Align.FILL,
            valign: Gtk.Align.CENTER,
            hexpand: true,
        });
        entry.connect('map', () => {
            entry.grab_focus();
        });
        const okButton = new Gtk.Button({
            css_classes: ['flat'],
            icon_name: 'emblem-ok-symbolic',
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        okButton.connect('clicked', () => {
            const text = entry.get_text();
            if (text !== null && text.trim() !== '') {
                this.exclusionRow.remove(entryRow);
                this.exclusionRow.add_row(this.createExcludedApp(text.trim()));
                this.exclusionButton.set_sensitive(true);
                this.settings.set_strv('exclusion-list', [...this.settings.get_strv('exclusion-list'), text.trim()]);
            }
        });
        entry.connect('activate', () => {
            okButton.emit('clicked');
        });
        const cancelButton = new Gtk.Button({
            css_classes: ['flat'],
            icon_name: 'window-close-symbolic',
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        cancelButton.connect('clicked', () => {
            this.exclusionRow.remove(entryRow);
            this.exclusionButton.set_sensitive(true);
        });
        entryRow.add_prefix(entry);
        entryRow.add_suffix(okButton);
        entryRow.add_suffix(cancelButton);
        return entryRow;
    }
    createExcludedApp(appClassName) {
        const excludedRow = new Adw.ActionRow({
            title: appClassName,
        });
        const removeButton = new Gtk.Button({
            css_classes: ['destructive-action'],
            icon_name: 'edit-delete-symbolic',
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        removeButton.connect('clicked', () => {
            this.exclusionRow.remove(excludedRow);
            this.settings.set_strv('exclusion-list', this.settings.get_strv('exclusion-list').filter((w) => w !== appClassName));
        });
        excludedRow.add_suffix(removeButton);
        return excludedRow;
    }
};
ExclusionGroup = __decorate([
    registerGObjectClass
], ExclusionGroup);

const debug = logger('prefs:general:dbLocation');
let DBLocationRow = class DBLocationRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Database Location'),
            subtitle: `<b>${getDbPath(ext)}/pano.db</b>`,
        });
        this.settings = getCurrentExtensionSettings(ext);
        this.fileChooser = new Gtk.FileChooserNative({
            modal: true,
            title: _('Choose pano database location'),
            action: Gtk.FileChooserAction.SELECT_FOLDER,
            accept_label: 'Select',
        });
        this.connect('map', () => {
            this.fileChooser.set_transient_for(this.get_root());
        });
        this.fileChooser.set_current_folder(Gio.File.new_for_path(`${getDbPath(ext)}`));
        this.fileChooser.connect('response', (chooser, response) => {
            if (response !== Gtk.ResponseType.ACCEPT) {
                this.fileChooser.hide();
                return;
            }
            const dir = chooser.get_file();
            if (dir && dir.query_exists(null) && !dir.get_child('pano.db').query_exists(null)) {
                const path = dir.get_path();
                if (path) {
                    let isDbusRunning = true;
                    try {
                        Gio.DBus.session.call_sync('org.gnome.Shell', '/io/elhan/Pano', 'io.elhan.Pano', 'stop', null, null, Gio.DBusCallFlags.NONE, -1, null);
                    }
                    catch (err) {
                        isDbusRunning = false;
                        debug('Extension is not enabled. Moving db file without stopping the extension.');
                    }
                    moveDbFile(getDbPath(ext), path);
                    this.settings.set_string('database-location', path);
                    if (isDbusRunning) {
                        Gio.DBus.session.call_sync('org.gnome.Shell', '/io/elhan/Pano', 'io.elhan.Pano', 'start', null, null, Gio.DBusCallFlags.NONE, -1, null);
                    }
                }
            }
            else {
                const md = new Gtk.MessageDialog({
                    text: _('Failed to select directory'),
                    transient_for: this.get_root(),
                    destroy_with_parent: true,
                    modal: true,
                    visible: true,
                    buttons: Gtk.ButtonsType.OK,
                });
                md.connect('response', () => {
                    md.destroy();
                });
            }
            this.fileChooser.hide();
        });
        const dbLocationButton = new Gtk.Button({
            icon_name: 'document-open-symbolic',
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        dbLocationButton.connect('clicked', () => {
            this.fileChooser.show();
        });
        this.add_suffix(dbLocationButton);
        this.set_activatable_widget(dbLocationButton);
        this.settings.connect('changed::database-location', () => {
            this.fileChooser.set_current_folder(Gio.File.new_for_path(`${getDbPath(ext)}`));
            this.set_subtitle(`<b>${getDbPath(ext)}/pano.db</b>`);
        });
    }
};
DBLocationRow = __decorate([
    registerGObjectClass
], DBLocationRow);

let HistoryLengthRow = class HistoryLengthRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('History Length'),
            subtitle: _('You can limit your clipboard history length between 10 - 500'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const historyEntry = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({ step_increment: 10, lower: 10, upper: 500 }),
            value: this.settings.get_int('history-length'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('history-length', historyEntry, 'value', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(historyEntry);
        this.set_activatable_widget(historyEntry);
    }
};
HistoryLengthRow = __decorate([
    registerGObjectClass
], HistoryLengthRow);

function getAcceleratorName(keyval, keycode, mask, key) {
    const globalShortcut = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask);
    //TODO: better error handling
    if (globalShortcut === null) {
        console.error(`Couldn't get keycode for the value '${key}'`);
        return null;
    }
    return globalShortcut;
}

let IncognitoShortcutRow = class IncognitoShortcutRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Incognito Mode Shortcut'),
            subtitle: _('Allows you to toggle incognito mode'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const shortcutLabel = new Gtk.ShortcutLabel({
            disabled_text: _('Select a shortcut'),
            accelerator: this.settings.get_strv('incognito-shortcut')[0],
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.connect('changed::incognito-shortcut', () => {
            shortcutLabel.set_accelerator(this.settings.get_strv('incognito-shortcut')[0]);
        });
        this.connect('activated', () => {
            const ctl = new Gtk.EventControllerKey();
            const content = new Adw.StatusPage({
                title: _('New shortcut'),
                icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic',
            });
            const editor = new Adw.Window({
                modal: true,
                transient_for: this.get_root(),
                hide_on_close: true,
                width_request: 320,
                height_request: 240,
                resizable: false,
                content,
            });
            editor.add_controller(ctl);
            // See https://github.com/tuberry/color-picker/blob/1a278db139f00787e365fce5977d30b535529edb/color-picker%40tuberry/prefs.js
            ctl.connect('key-pressed', (_, keyval, keycode, state) => {
                let mask = state & Gtk.accelerator_get_default_mod_mask();
                mask &= ~Gdk.ModifierType.LOCK_MASK;
                if (!mask && keyval === Gdk.KEY_Escape) {
                    editor.close();
                    return Gdk.EVENT_STOP;
                }
                if (!isValidBinding$1(mask, keycode, keyval) || !isValidAccel$1(mask, keyval)) {
                    return Gdk.EVENT_STOP;
                }
                const incognitoShortcut = getAcceleratorName(keyval, keycode, mask, 'incognito-shortcut');
                if (incognitoShortcut === null) {
                    return Gdk.EVENT_STOP;
                }
                this.settings.set_strv('incognito-shortcut', [incognitoShortcut]);
                editor.destroy();
                return Gdk.EVENT_STOP;
            });
            editor.present();
        });
        this.add_suffix(shortcutLabel);
        this.set_activatable_widget(shortcutLabel);
    }
};
IncognitoShortcutRow = __decorate([
    registerGObjectClass
], IncognitoShortcutRow);
const keyvalIsForbidden$1 = (keyval) => {
    return [
        Gdk.KEY_Home,
        Gdk.KEY_Left,
        Gdk.KEY_Up,
        Gdk.KEY_Right,
        Gdk.KEY_Down,
        Gdk.KEY_Page_Up,
        Gdk.KEY_Page_Down,
        Gdk.KEY_End,
        Gdk.KEY_Tab,
        Gdk.KEY_KP_Enter,
        Gdk.KEY_Return,
        Gdk.KEY_Mode_switch,
    ].includes(keyval);
};
const isValidAccel$1 = (mask, keyval) => {
    return Gtk.accelerator_valid(keyval, mask) || (keyval === Gdk.KEY_Tab && mask !== 0);
};
const isValidBinding$1 = (mask, keycode, keyval) => {
    return !(mask === 0 ||
        (mask === Gdk.ModifierType.SHIFT_MASK &&
            keycode !== 0 &&
            ((keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z) ||
                (keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z) ||
                (keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9) ||
                (keyval >= Gdk.KEY_kana_fullstop && keyval <= Gdk.KEY_semivoicedsound) ||
                (keyval >= Gdk.KEY_Arabic_comma && keyval <= Gdk.KEY_Arabic_sukun) ||
                (keyval >= Gdk.KEY_Serbian_dje && keyval <= Gdk.KEY_Cyrillic_HARDSIGN) ||
                (keyval >= Gdk.KEY_Greek_ALPHAaccent && keyval <= Gdk.KEY_Greek_omega) ||
                (keyval >= Gdk.KEY_hebrew_doublelowline && keyval <= Gdk.KEY_hebrew_taf) ||
                (keyval >= Gdk.KEY_Thai_kokai && keyval <= Gdk.KEY_Thai_lekkao) ||
                (keyval >= Gdk.KEY_Hangul_Kiyeog && keyval <= Gdk.KEY_Hangul_J_YeorinHieuh) ||
                (keyval === Gdk.KEY_space && mask === 0) ||
                keyvalIsForbidden$1(keyval))));
};

let KeepSearchEntryRow = class KeepSearchEntryRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Keep Search Entry'),
            subtitle: _('Keep search entry when Pano hides'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const keepSearchEntrySwitch = new Gtk.Switch({
            active: this.settings.get_boolean('keep-search-entry'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('keep-search-entry', keepSearchEntrySwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(keepSearchEntrySwitch);
        this.set_activatable_widget(keepSearchEntrySwitch);
    }
};
KeepSearchEntryRow = __decorate([
    registerGObjectClass
], KeepSearchEntryRow);

let LinkPreviewsRow = class LinkPreviewsRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Link Previews'),
            subtitle: _('Allow Pano to visit links on your clipboard to generate link previews'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const linkPreviews = new Gtk.Switch({
            active: this.settings.get_boolean('link-previews'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('link-previews', linkPreviews, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(linkPreviews);
        this.set_activatable_widget(linkPreviews);
    }
};
LinkPreviewsRow = __decorate([
    registerGObjectClass
], LinkPreviewsRow);

let OpenLinksInBrowserRow = class OpenLinksInBrowserRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Open Links in Browser'),
            subtitle: _('Allow Pano to open links on your default browser'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const openLinksInBrowser = new Gtk.Switch({
            active: this.settings.get_boolean('open-links-in-browser'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('open-links-in-browser', openLinksInBrowser, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(openLinksInBrowser);
        this.set_activatable_widget(openLinksInBrowser);
    }
};
OpenLinksInBrowserRow = __decorate([
    registerGObjectClass
], OpenLinksInBrowserRow);

let PasteOnSelectRow = class PasteOnSelectRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Paste on Select'),
            subtitle: _('Allow Pano to paste content on select'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const pasteOnSelectSwitch = new Gtk.Switch({
            active: this.settings.get_boolean('paste-on-select'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('paste-on-select', pasteOnSelectSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(pasteOnSelectSwitch);
        this.set_activatable_widget(pasteOnSelectSwitch);
    }
};
PasteOnSelectRow = __decorate([
    registerGObjectClass
], PasteOnSelectRow);

let PlayAudioOnCopyRow = class PlayAudioOnCopyRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Play an Audio on Copy'),
            subtitle: _('Allow Pano to play an audio when copying new content'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const playAudioOnCopySwitch = new Gtk.Switch({
            active: this.settings.get_boolean('play-audio-on-copy'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('play-audio-on-copy', playAudioOnCopySwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(playAudioOnCopySwitch);
        this.set_activatable_widget(playAudioOnCopySwitch);
    }
};
PlayAudioOnCopyRow = __decorate([
    registerGObjectClass
], PlayAudioOnCopyRow);

let SendNotificationOnCopyRow = class SendNotificationOnCopyRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Send Notification on Copy'),
            subtitle: _('Allow Pano to send notification when copying new content'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const sendNotificationOnCopySwitch = new Gtk.Switch({
            active: this.settings.get_boolean('send-notification-on-copy'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('send-notification-on-copy', sendNotificationOnCopySwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(sendNotificationOnCopySwitch);
        this.set_activatable_widget(sendNotificationOnCopySwitch);
    }
};
SendNotificationOnCopyRow = __decorate([
    registerGObjectClass
], SendNotificationOnCopyRow);

let ShortcutRow = class ShortcutRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Global Shortcut'),
            subtitle: _('Allows you to toggle visibility of the clipboard manager'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const shortcutLabel = new Gtk.ShortcutLabel({
            disabled_text: _('Select a shortcut'),
            accelerator: this.settings.get_strv('global-shortcut')[0],
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.connect('changed::global-shortcut', () => {
            shortcutLabel.set_accelerator(this.settings.get_strv('global-shortcut')[0]);
        });
        this.connect('activated', () => {
            const ctl = new Gtk.EventControllerKey();
            const content = new Adw.StatusPage({
                title: _('New shortcut'),
                icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic',
            });
            const editor = new Adw.Window({
                modal: true,
                transient_for: this.get_root(),
                hide_on_close: true,
                width_request: 320,
                height_request: 240,
                resizable: false,
                content,
            });
            editor.add_controller(ctl);
            // See https://github.com/tuberry/color-picker/blob/1a278db139f00787e365fce5977d30b535529edb/color-picker%40tuberry/prefs.js
            ctl.connect('key-pressed', (_, keyval, keycode, state) => {
                let mask = state & Gtk.accelerator_get_default_mod_mask();
                mask &= ~Gdk.ModifierType.LOCK_MASK;
                if (!mask && keyval === Gdk.KEY_Escape) {
                    editor.close();
                    return Gdk.EVENT_STOP;
                }
                if (!isValidBinding(mask, keycode, keyval) || !isValidAccel(mask, keyval)) {
                    return Gdk.EVENT_STOP;
                }
                const globalShortcut = getAcceleratorName(keyval, keycode, mask, 'global-shortcut');
                if (globalShortcut === null) {
                    return Gdk.EVENT_STOP;
                }
                this.settings.set_strv('global-shortcut', [globalShortcut]);
                editor.destroy();
                return Gdk.EVENT_STOP;
            });
            editor.present();
        });
        this.add_suffix(shortcutLabel);
        this.set_activatable_widget(shortcutLabel);
    }
};
ShortcutRow = __decorate([
    registerGObjectClass
], ShortcutRow);
const keyvalIsForbidden = (keyval) => {
    return [
        Gdk.KEY_Home,
        Gdk.KEY_Left,
        Gdk.KEY_Up,
        Gdk.KEY_Right,
        Gdk.KEY_Down,
        Gdk.KEY_Page_Up,
        Gdk.KEY_Page_Down,
        Gdk.KEY_End,
        Gdk.KEY_Tab,
        Gdk.KEY_KP_Enter,
        Gdk.KEY_Return,
        Gdk.KEY_Mode_switch,
    ].includes(keyval);
};
const isValidAccel = (mask, keyval) => {
    return Gtk.accelerator_valid(keyval, mask) || (keyval === Gdk.KEY_Tab && mask !== 0);
};
const isValidBinding = (mask, keycode, keyval) => {
    return !(mask === 0 ||
        (mask === Gdk.ModifierType.SHIFT_MASK &&
            keycode !== 0 &&
            ((keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z) ||
                (keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z) ||
                (keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9) ||
                (keyval >= Gdk.KEY_kana_fullstop && keyval <= Gdk.KEY_semivoicedsound) ||
                (keyval >= Gdk.KEY_Arabic_comma && keyval <= Gdk.KEY_Arabic_sukun) ||
                (keyval >= Gdk.KEY_Serbian_dje && keyval <= Gdk.KEY_Cyrillic_HARDSIGN) ||
                (keyval >= Gdk.KEY_Greek_ALPHAaccent && keyval <= Gdk.KEY_Greek_omega) ||
                (keyval >= Gdk.KEY_hebrew_doublelowline && keyval <= Gdk.KEY_hebrew_taf) ||
                (keyval >= Gdk.KEY_Thai_kokai && keyval <= Gdk.KEY_Thai_lekkao) ||
                (keyval >= Gdk.KEY_Hangul_Kiyeog && keyval <= Gdk.KEY_Hangul_J_YeorinHieuh) ||
                (keyval === Gdk.KEY_space && mask === 0) ||
                keyvalIsForbidden(keyval))));
};

let ShowIndicatorRow = class ShowIndicatorRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Show Indicator'),
            subtitle: _('Shows an indicator on top panel'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const showIndicatorSwitch = new Gtk.Switch({
            active: this.settings.get_boolean('show-indicator'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('show-indicator', showIndicatorSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(showIndicatorSwitch);
        this.set_activatable_widget(showIndicatorSwitch);
    }
};
ShowIndicatorRow = __decorate([
    registerGObjectClass
], ShowIndicatorRow);

let SyncPrimaryRow = class SyncPrimaryRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Sync Primary'),
            subtitle: _('Sync primary selection with clipboard selection'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const pasteOnSelectSwitch = new Gtk.Switch({
            active: this.settings.get_boolean('sync-primary'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('sync-primary', pasteOnSelectSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(pasteOnSelectSwitch);
        this.set_activatable_widget(pasteOnSelectSwitch);
    }
};
SyncPrimaryRow = __decorate([
    registerGObjectClass
], SyncPrimaryRow);

let WatchExclusionsRow = class WatchExclusionsRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Watch Exclusions'),
            subtitle: _('When enabled, Pano will not track clipboard from excluded apps'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const watchExclusionsSwitch = new Gtk.Switch({
            active: this.settings.get_boolean('watch-exclusion-list'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('watch-exclusion-list', watchExclusionsSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(watchExclusionsSwitch);
        this.set_activatable_widget(watchExclusionsSwitch);
    }
};
WatchExclusionsRow = __decorate([
    registerGObjectClass
], WatchExclusionsRow);

let WiggleIndicatorRow = class WiggleIndicatorRow extends Adw.ActionRow {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('Wiggle Indicator'),
            subtitle: _('Wiggles the indicator on panel'),
        });
        this.settings = getCurrentExtensionSettings(ext);
        const wiggleIndicatorSwitch = new Gtk.Switch({
            active: this.settings.get_boolean('wiggle-indicator'),
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
        });
        this.settings.bind('wiggle-indicator', wiggleIndicatorSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add_suffix(wiggleIndicatorSwitch);
        this.set_activatable_widget(wiggleIndicatorSwitch);
    }
};
WiggleIndicatorRow = __decorate([
    registerGObjectClass
], WiggleIndicatorRow);

let GeneralGroup = class GeneralGroup extends Adw.PreferencesGroup {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('General Options'),
        });
        this.add(new DBLocationRow(ext));
        this.add(new HistoryLengthRow(ext));
        this.add(new ShortcutRow(ext));
        this.add(new IncognitoShortcutRow(ext));
        this.add(new SyncPrimaryRow(ext));
        this.add(new PasteOnSelectRow(ext));
        this.add(new SendNotificationOnCopyRow(ext));
        this.add(new PlayAudioOnCopyRow(ext));
        this.add(new KeepSearchEntryRow(ext));
        this.add(new ShowIndicatorRow(ext));
        this.add(new WiggleIndicatorRow(ext));
        this.add(new LinkPreviewsRow(ext));
        this.add(new OpenLinksInBrowserRow(ext));
        this.add(new WatchExclusionsRow(ext));
    }
};
GeneralGroup = __decorate([
    registerGObjectClass
], GeneralGroup);

let GeneralPage = class GeneralPage extends Adw.PreferencesPage {
    constructor(ext) {
        const _ = gettext(ext);
        super({
            title: _('General'),
            icon_name: 'preferences-system-symbolic',
        });
        this.add(new GeneralGroup(ext));
        this.add(new ExclusionGroup(ext));
    }
};
GeneralPage = __decorate([
    registerGObjectClass
], GeneralPage);

class PanoExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.add(new GeneralPage(this));
        window.add(new CustomizationPage(this));
        window.add(new DangerZonePage(this));
        window.search_enabled = true;
        const display = Gdk.Display.get_default();
        if (display) {
            Gtk.IconTheme.get_for_display(display).add_search_path(`${this.path}/icons/`);
        }
    }
}

export { PanoExtensionPreferences as default };
