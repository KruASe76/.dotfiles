import Gio from 'gi://Gio'
import GObject from 'gi://GObject'


export const LOG_PREFIX = 'RuncatExtension'

export const displayingItemsOptions = {
	CHARACTER_AND_PERCENTAGE: 0,
	PERCENTAGE_ONLY: 1,
	CHARACTER_ONLY: 2,
}

export const enumToDisplayingItems = {
	[displayingItemsOptions.CHARACTER_AND_PERCENTAGE]: { character: true, percentage: true },
	[displayingItemsOptions.PERCENTAGE_ONLY]: { character: false, percentage: true },
	[displayingItemsOptions.CHARACTER_ONLY]: { character: true, percentage: false },
}

export const gioSettingsKeys = {
	IDLE_THRESHOLD: 'idle-threshold',
	DISPLAYING_ITEMS: 'displaying-items',
	INVERT_SPEED: 'invert-speed',
	customSystemMonitor: {
		ENABLED: 'custom-system-monitor-enabled',
		COMMAND: 'custom-system-monitor-command',
	},
}

export const SYSTEM_MONITOR_COMMAND = 'gnome-system-monitor -r'

export const gObjectPropertyNames = {
	currentText: 'currentText',
	currentIcon: 'currentIcon',
	displayingItems: 'displayingItems',
	isSpeedInverted: 'isSpeedInverted',
	idleThreshold: 'idleThreshold',
	useCustomSystemMonitor: 'useCustomSystemMonitor',
	customSystemMonitorCommand: 'customSystemMonitorCommand',
}

export const gObjectProperties = {
	currentText: GObject.ParamSpec.string('currentText', '', '', GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, '...'),
	currentIcon: GObject.ParamSpec.object('currentIcon', '', '', GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, Gio.Icon.$gtype),
	displayingItems: GObject.ParamSpec.jsobject('displayingItems', '', '', GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT),
	isSpeedInverted: GObject.ParamSpec.boolean('isSpeedInverted', '', '', GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
	idleThreshold: GObject.ParamSpec.int('idleThreshold', '', '', GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 100, 0),
	useCustomSystemMonitor: GObject.ParamSpec.boolean('useCustomSystemMonitor', '', '', GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
	customSystemMonitorCommand: GObject.ParamSpec.string('customSystemMonitorCommand', '', '', GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, SYSTEM_MONITOR_COMMAND),
}
