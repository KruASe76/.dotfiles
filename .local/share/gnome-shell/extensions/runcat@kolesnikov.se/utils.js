import Gio from 'gi://Gio'


export const spritesGenerator = function* (extensionRootPath, state) {
	const getPathForIdx = idx => `${extensionRootPath}/resources/icons/runcat/${state}/sprite-${idx}-symbolic.svg`
	const sprites = []

	for (let i = 0, path = getPathForIdx(i); Gio.file_new_for_path(path).query_exists(null); i++, path = getPathForIdx(i)) {
		sprites.push(Gio.icon_new_for_string(path))
	}

	while (true) {
		for (let i = 0; i < sprites.length; i++) {
			yield [sprites[i], sprites.length]
		}
	}
}

export const getAnimationInterval = (cpuUtilization, spritesCount) => Math.ceil((25 / Math.sqrt(cpuUtilization * 100 + 30) - 2) * 1_000 / spritesCount)
