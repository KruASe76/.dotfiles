import Adw from 'gi://Adw'
import Gio from 'gi://Gio'
import Gtk from 'gi://Gtk'
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'
import { SettingsSchemaKeys } from './constants.js'


Gio._promisify(Gtk.UriLauncher.prototype, 'launch', 'launch_finish')
export default class RunCatPreferences extends ExtensionPreferences {
	#settings = null
	#builder = null
	#window = null

	get #headerBar() {
		const stack = [this.#window]
		let widget

		while (stack.length > 0) {
			if (!(widget = stack.pop()))
				continue
			if (widget instanceof Adw.HeaderBar) {
				return widget
			}

			stack.push(widget.get_next_sibling(), widget.get_first_child())
		}


		return null
	}

	async fillPreferencesWindow(window) {
		this.#window = window
		this.#settings = this.getSettings()
		this.#builder = new Gtk.Builder({ translationDomain: this.uuid })
		this.#builder.add_from_file(`${this.path}/resources/ui/preferences.ui`)
		this.#setupPage()
		this.#setupMenu()

		const page = this.#builder.get_object('preferences-general')
		this.#window.add(page)
		this.#window.title = _('RunCat Settings')
		this.#window.connect('close-request', () => {
			this.#settings = null
			this.#builder = null
			this.#window = null
		})
	}

	#setupPage() {
		this.#settings.bind(SettingsSchemaKeys.IDLE_THRESHOLD, this.#builder.get_object(SettingsSchemaKeys.IDLE_THRESHOLD), 'value', Gio.SettingsBindFlags.DEFAULT)
		this.#settings.bind(SettingsSchemaKeys.INVERT_SPEED, this.#builder.get_object(SettingsSchemaKeys.INVERT_SPEED), 'active', Gio.SettingsBindFlags.DEFAULT)
		this.#settings.bind(SettingsSchemaKeys.SMOOTH_SPEED_CHANGES, this.#builder.get_object(SettingsSchemaKeys.SMOOTH_SPEED_CHANGES), 'active', Gio.SettingsBindFlags.DEFAULT)

		const combo = this.#builder.get_object(SettingsSchemaKeys.DISPLAYING_ITEMS)
		combo.set_selected(this.#settings.get_enum(SettingsSchemaKeys.DISPLAYING_ITEMS))
		combo.connect('notify::selected', ({ selected }) => {
			this.#settings.set_enum(SettingsSchemaKeys.DISPLAYING_ITEMS, selected)
		})

		this.#settings.bind(SettingsSchemaKeys.CUSTOM_SYSTEM_MONITOR.ENABLED, this.#builder.get_object(SettingsSchemaKeys.CUSTOM_SYSTEM_MONITOR.ENABLED), 'enable-expansion', Gio.SettingsBindFlags.DEFAULT)
		this.#settings.bind(SettingsSchemaKeys.CUSTOM_SYSTEM_MONITOR.COMMAND, this.#builder.get_object(SettingsSchemaKeys.CUSTOM_SYSTEM_MONITOR.COMMAND), 'text', Gio.SettingsBindFlags.DEFAULT)
		this.#builder.get_object('reset').connect('clicked', () => {
			this.#settings.reset(SettingsSchemaKeys.IDLE_THRESHOLD)
			this.#settings.reset(SettingsSchemaKeys.INVERT_SPEED)
			this.#settings.reset(SettingsSchemaKeys.SMOOTH_SPEED_CHANGES)
			this.#settings.reset(SettingsSchemaKeys.CUSTOM_SYSTEM_MONITOR.ENABLED)
			this.#settings.reset(SettingsSchemaKeys.CUSTOM_SYSTEM_MONITOR.COMMAND)
			this.#settings.reset(SettingsSchemaKeys.DISPLAYING_ITEMS)
			combo.set_selected(this.#settings.get_enum(SettingsSchemaKeys.DISPLAYING_ITEMS))
		})
	}

	#setupMenu() {
		if (!this.#builder)
			return

		const homepageAction = Gio.SimpleAction.new('homepage', null)
		homepageAction.connect('activate', () => new Gtk.UriLauncher({ uri: this.metadata.url })
			.launch(this.#window, null)
			.catch(console.error))

		const aboutAction = Gio.SimpleAction.new('about', null)
		aboutAction.connect('activate', () => {
			const logo = Gtk.Image.new_from_file(`${this.path}/resources/se.kolesnikov.runcat.svg`)
			const aboutDialog = this.#builder.get_object('about-dialog')
			aboutDialog.set_property('logo', logo.get_paintable())
			aboutDialog.set_property('version', `${_('Version')} ${this.metadata.version}`)
			aboutDialog.set_property('transient_for', this.#window)
			aboutDialog.show()
		})

		const group = Gio.SimpleActionGroup.new()
		group.add_action(homepageAction)
		group.add_action(aboutAction)

		const menu = this.#builder.get_object('menu-button')
		menu.insert_action_group('prefs', group)
		this.#headerBar?.pack_end(menu)
	}
}
