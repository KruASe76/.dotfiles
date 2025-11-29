import Adw from 'gi://Adw'
import Gio from 'gi://Gio'
import Gtk from 'gi://Gtk'
import Gdk from 'gi://Gdk'
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'
import { gioSettingsKeys } from './constants.js'


export default class RunCatPreferences extends ExtensionPreferences {
	#settings = null
	#builder = null
	#window = null

	get #headerBar() {
		const queue = [this.#window?.get_content()]

		while (queue.length > 0) {
			const child = queue.pop()

			if (child instanceof Adw.HeaderBar) {
				return child
			}

			queue.push(...child)
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
		this.#settings.bind(gioSettingsKeys.IDLE_THRESHOLD, this.#builder.get_object(gioSettingsKeys.IDLE_THRESHOLD), 'value', Gio.SettingsBindFlags.DEFAULT)
		this.#settings.bind(gioSettingsKeys.INVERT_SPEED, this.#builder.get_object(gioSettingsKeys.INVERT_SPEED), 'active', Gio.SettingsBindFlags.DEFAULT)

		const combo = this.#builder.get_object(gioSettingsKeys.DISPLAYING_ITEMS)

		combo.set_selected(this.#settings.get_enum(gioSettingsKeys.DISPLAYING_ITEMS))
		combo.connect('notify::selected', ({ selected }) => {
			this.#settings.set_enum(gioSettingsKeys.DISPLAYING_ITEMS, selected)
		})

		this.#settings.bind(gioSettingsKeys.customSystemMonitor.ENABLED, this.#builder.get_object(gioSettingsKeys.customSystemMonitor.ENABLED), 'enable-expansion', Gio.SettingsBindFlags.DEFAULT)
		this.#settings.bind(gioSettingsKeys.customSystemMonitor.COMMAND, this.#builder.get_object(gioSettingsKeys.customSystemMonitor.COMMAND), 'text', Gio.SettingsBindFlags.DEFAULT)
		this.#builder.get_object('reset').connect('clicked', () => {
			this.#settings.reset(gioSettingsKeys.IDLE_THRESHOLD)
			this.#settings.reset(gioSettingsKeys.INVERT_SPEED)
			this.#settings.reset(gioSettingsKeys.customSystemMonitor.ENABLED)
			this.#settings.reset(gioSettingsKeys.customSystemMonitor.COMMAND)
			this.#settings.reset(gioSettingsKeys.DISPLAYING_ITEMS)
			combo.set_selected(this.#settings.get_enum(gioSettingsKeys.DISPLAYING_ITEMS))
		})
	}

	#setupMenu() {
		if (!this.#builder)
			return

		const homepageAction = Gio.SimpleAction.new('homepage', null)

		homepageAction.connect('activate', () => Gtk.show_uri(this.#window, this.metadata.url, Gdk.CURRENT_TIME))

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
