export const ANIMATION_SMOOTHING_TAU_MS = 500

export const MAX_FRAME_DELTA_MS = 250

export const getAnimationCycleDurationMs = cpuUtilization => Math.ceil(250 + 850 * (1 - cpuUtilization) ** 2)

export const createAnimationTicker = (tauMs = ANIMATION_SMOOTHING_TAU_MS) => {
	let targetDurationMs = 0
	let smoothedDurationMs = 0
	let phase = 0
	let lastTickMs = Number.NaN

	const getSpriteIndex = (phase, framesCount) => framesCount > 0
		? Math.max(0, Math.floor(phase * framesCount) % framesCount)
		: 0

	return {
		setTargetDuration: (durationMs, immediate = false) => {
			if (!Number.isFinite(durationMs) || durationMs <= 0) {
				return
			}

			targetDurationMs = durationMs
			if (immediate || smoothedDurationMs <= 0) {
				smoothedDurationMs = durationMs
			}
		},
		advanceTo: (nowMs, framesCount) => {
			const dt = nowMs - lastTickMs
			lastTickMs = nowMs

			const stallThresholdMs = Math.max(MAX_FRAME_DELTA_MS, smoothedDurationMs / framesCount)

			if (Number.isFinite(dt) && dt > 0 && dt <= stallThresholdMs && smoothedDurationMs > 0) {
				const alpha = 1 - Math.exp(-dt / tauMs)
				smoothedDurationMs += alpha * (targetDurationMs - smoothedDurationMs)
				phase = (phase + dt / smoothedDurationMs) % 1
			}

			const index = getSpriteIndex(phase, framesCount)
			const nextFramePhase = (Math.floor(phase * framesCount) + 1) / framesCount

			const nextDelayMs = smoothedDurationMs > 0
				? Math.max(1, Math.ceil((nextFramePhase - phase) * smoothedDurationMs))
				: MAX_FRAME_DELTA_MS

			return { index, nextDelayMs }
		},
	}
}
