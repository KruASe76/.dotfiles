import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {PopupMenu, PopupMenuBase, PopupSeparatorMenuItem, PopupSubMenuMenuItem} from 'resource:///org/gnome/shell/ui/popupMenu.js';

/* exported ScrollablePopupMenu */
export class ScrollablePopupMenu extends PopupMenu {
    constructor(sourceActor, arrowAlignment, arrowSide, logger) {
        super(sourceActor, arrowAlignment, arrowSide);
        this._topSection = null;
        this._bottomSection = null;
        this._validSections = ['top', 'bottom'];
        this._logger = logger;

        this._boxPointer.bin.set_child(null);

        this.scroller = new St.ScrollView({
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC
        });

        this.boxlayout = new St.BoxLayout({
            orientation: Clutter.Orientation.VERTICAL
        });

        this._boxPointer.bin.style_class = 'popup-menu-content';

        this.scroller.add_child(this.box);
        this.boxlayout.add_child(this.scroller);
        this.box.style_class = '';

        this.style_class = 'popup-menu-boxpointer';

        this._boxPointer.bin.add_child(this.boxlayout);
        this._boxPointer.bin.style_class = 'popup-menu-content';
        this.box.set_style('padding-bottom: 0');
        // global.focus_manager.add_group(this);
        this.reactive = true;

        this._openedSubMenu = null;
        this._childMenus = [];
    }

    _isValidSection(name) {
        if (this._validSections.includes(name)) {
            return true;
        }
        return false;
    }

    _getSectionName(name) {
        return `_${this._getStyleName(name)}`;
    }

    _getStyleName(name) {
        if (!this._isValidSection(name)) {
            this._logger.error(`Tried to get invalid style name: ${name}`);
            return 'invalidSection';
        }
        return `${name}Section`;
    }

    _addSectionBefore(name, sibling) {
        this._addSection(name, true, sibling);
    }

    _addSectionAfter(name, sibling) {
        this._addSection(name, false, sibling);
    }

    _addSection(name, before, sibling) {
        if (!this._isValidSection(name)) {
            this._logger.error(`Tried to add invalid section: ${name}`);
            return;
        }
        const sectionName = this._getSectionName(name);
        this[sectionName] = new St.BoxLayout({
            orientation: Clutter.Orientation.VERTICAL,
            style_class: this._getStyleName(name)
        });
        if (before === true) {
            this.boxlayout.insert_child_below(this[sectionName], sibling);
        } else {
            this.boxlayout.insert_child_above(this[sectionName], sibling);
        }
    }

    clearSection(name) {
        if (!this._isValidSection(name)) {
            this._logger.error(`Tried to clear invalid section: ${name}`);
            return;
        }
        const sectionName = this._getSectionName(name);
        if (this[sectionName] !== null) {
            this[sectionName].destroy();
            this[sectionName] = null;
        }
    }

    _sectionHasVisibleChildren(name) {
        if (!this._isValidSection(name)) {
            this._logger.error(`Tried to get visibility for invalid section: ${name}`);
            return false;
        }
        if (this[this._getSectionName(name)] === null) {
            return false;
        }
        return this[this._getSectionName(name)].get_children().some((child) => {
            return child.visible;
        });
    }

    isEmpty() {
        const bottomHasVisibleChildren = this._sectionHasVisibleChildren('bottom');
        const topHasVisibleChildren = this._sectionHasVisibleChildren('top');
        return !bottomHasVisibleChildren && !topHasVisibleChildren &&
            PopupMenuBase.prototype.isEmpty.call(this);
    }

    _addSectionDelimiter(name) {
        if (!this._isValidSection(name)) {
            this._logger.error(`Tried to add delimiter to invalid section ${name}`);
            return;
        }
        this[this._getSectionName(name)].add_child((new PopupSeparatorMenuItem()));
    }

    addToSection(section, actor) {
        if (!this._isValidSection(section)) {
            this._logger.error(`Tried to add actor to invalid section ${section}`);
            return;
        }
        if (this[this._getSectionName(section)] === null) {
            if (section === 'bottom') {
                this._addSectionAfter('bottom', this.scroller);
            } else if (section === 'top') {
                this._addSectionBefore('top', this.scroller);
            }
        }
        if (!this._sectionHasVisibleChildren(section)) {
            this._addSectionDelimiter(section);
        }
        if (section === 'bottom') {
            this._bottomSection.add_child(actor);
            return;
        }
        if (section === 'top') {
            const lastChild = this._topSection.get_last_child();
            this._topSection.insert_child_below(actor, lastChild);
        }
    }


    _getHeight(preferred, parent_before, parent_after) {
        if ((preferred < parent_after) && (parent_before !== parent_after)) {
            this._logger.debug(`Using preferred height ${preferred}`);
            return preferred;
        }
        const diff = parent_after - parent_before;
        const third = Math.floor(parent_after / 3);
        if (diff > 0) {
            if (third > diff) {
                this._logger.debug(`Using third of parent instead of diff ${third}`);
                return third;
            }
            this._logger.debug(`Using parent diff ${diff}`);
            return diff;
        }
        if (preferred < third) {
            this._logger.debug(`Using preferred height ${preferred} because it is smaller than third`);
            return preferred;
        }
        this._logger.debug(`Using third of parent ${third}`);
        return third;
    }

    itemActivated(_animate) { }

    addMenuItem(menuItem, position) {
        super.addMenuItem(menuItem, position);
        if (menuItem instanceof PopupSubMenuMenuItem) {
            const menu = menuItem.menu;
            menu.connect('open-state-changed', (item, open) => {
                if (open === true) {
                    const NO_WIDTH_DEFINED = -1;
                    const NO_HEIGHT_DEFINED = -1;
                    const NATURAL_VALUE = 1;
                    const parent_preferred_height_before =
                        menu._parent.actor.get_preferred_height(NO_WIDTH_DEFINED)[NATURAL_VALUE];
                    menu.actor.show();
                    const parent_preferred_height =
                        menu._parent.actor.get_preferred_height(NO_HEIGHT_DEFINED)[NATURAL_VALUE];
                    menu.actor.hide();
                    const preferred_height = menu.actor.get_preferred_height(NO_WIDTH_DEFINED)[NATURAL_VALUE];

                    menu.actor.set_height(this._getHeight(preferred_height,
                        parent_preferred_height_before, parent_preferred_height));
                }
            });
            menu.itemActivated = function(_animate) { };
            menu.actor.connect('scroll-event', (_event) => {
                if (!menu.actor.vscrollbar_visible) {
                    // scroll the parent if the child menu has no scrollbar
                    menu.actor.enable_mouse_scrolling = false;
                    return false;
                }
                if (menu.actor.enable_mouse_scrolling === false) {
                    menu.actor.enable_mouse_scrolling = true;
                }
                return false;
            });
        }
    }
}

/* vi: set expandtab tabstop=4 shiftwidth=4: */
