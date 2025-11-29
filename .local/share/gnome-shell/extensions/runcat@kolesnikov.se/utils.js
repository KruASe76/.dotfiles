import Gio from 'gi://Gio'
import { LOG_PREFIX } from './constants.js'


export const getSpritesPack = (root) => {
	const loadState = (state) => {
		const sprites = []
		let i = 0

		while (true) {
			const path = `${root}/resources/icons/runcat/${state}/sprite-${i}-symbolic.svg`

			if (!Gio.file_new_for_path(path).query_exists(null)) {
				break
			}

			sprites.push(Gio.icon_new_for_string(path))
			i++
		}

		if (sprites.length === 0) {
			console.error(`${LOG_PREFIX}: no sprites found for "${state}" state`)
		}


		return sprites
	}

	return {
		active: loadState('active'),
		idle: loadState('idle'),
	}
}

const formatter = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 0,
	style: 'percent',
})

export const formatNumber = value => formatter.format(value)
