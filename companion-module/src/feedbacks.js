const { combineRgb } = require('@companion-module/base')

function parseVolumePercent(self) {
	const raw = self.STATUS.state && self.STATUS.state.volume
	const v = parseInt(raw, 10)
	if (Number.isNaN(v)) return null
	return Math.min(100, Math.max(0, v))
}

/** Map prefixed feedback options to advanced feedback style (Companion merges multiple feedbacks). */
function buildAdvancedStyleFromOptions(opt, idPrefix) {
	const g = (k) => opt[`${idPrefix}_${k}`]
	const out = {}
	const bg = g('bgcolor')
	const fg = g('color')
	const size = g('size')
	const alignment = g('alignment')
	const showTop = g('show_topbar')
	const text = g('text')
	if (bg !== undefined && bg !== null && bg !== '') out.bgcolor = bg
	if (fg !== undefined && fg !== null && fg !== '') out.color = fg
	if (size !== undefined && size !== null && size !== '') out.size = size
	if (alignment) out.alignment = alignment
	if (showTop !== undefined) out.show_topbar = showTop
	if (text !== undefined && String(text).trim() !== '') {
		out.text = String(text)
		out.textExpression = false
	}
	return out
}

function alignmentChoices() {
	const positions = [
		['left', 'Left'],
		['center', 'Center'],
		['right', 'Right'],
	]
	const vpos = [
		['top', 'Top'],
		['center', 'Middle'],
		['bottom', 'Bottom'],
	]
	const choices = []
	for (const [h, hLabel] of positions) {
		for (const [v, vLabel] of vpos) {
			const id = `${h}:${v}`
			choices.push({ id, label: `${hLabel} / ${vLabel}` })
		}
	}
	return choices
}

/** @param {string} idPrefix unique prefix per feedback (Companion option ids) */
function volumeStyleOptionFields(idPrefix) {
	return [
		{
			type: 'static-text',
			id: `${idPrefix}_style_hdr`,
			label: 'Style when this feedback matches (use several feedbacks on one button for multiple zones)',
		},
		{
			type: 'colorpicker',
			id: `${idPrefix}_bgcolor`,
			label: 'Background color',
			default: combineRgb(0, 0, 0),
		},
		{
			type: 'colorpicker',
			id: `${idPrefix}_color`,
			label: 'Text color',
			default: combineRgb(255, 255, 255),
		},
		{
			type: 'dropdown',
			id: `${idPrefix}_size`,
			label: 'Text size',
			default: 'auto',
			choices: [
				{ id: 'auto', label: 'Auto' },
				{ id: '7', label: '7' },
				{ id: '14', label: '14' },
				{ id: '18', label: '18' },
				{ id: '24', label: '24' },
				{ id: '30', label: '30' },
				{ id: '44', label: '44' },
			],
		},
		{
			type: 'dropdown',
			id: `${idPrefix}_alignment`,
			label: 'Text alignment',
			default: 'center:center',
			choices: alignmentChoices(),
		},
		{
			type: 'checkbox',
			id: `${idPrefix}_show_topbar`,
			label: 'Show topbar',
			default: true,
		},
		{
			type: 'textinput',
			id: `${idPrefix}_text`,
			label: 'Button text (optional)',
			default: '',
			tooltip: 'Leave empty to keep the button’s existing text; expressions are not used unless you enable expression mode in Companion for this field',
		},
	]
}

module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	initFeedbacks: function () {
		let feedbacks = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red

		feedbacks.playbackState = {
			type: 'boolean',
			name: 'Show Player State On Button',
			description: 'Indicate if Playback is in X Status',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Indicate in X Status',
					id: 'state',
					default: 'Playing',
					choices: [
						{ id: 'Playing', label: 'Playing' },
						{ id: 'Paused', label: 'Paused' },
						{ id: 'Stopped', label: 'Stopped' },
					],
				},
			],
			callback: async (event) => {
				let opt = event.options

				if (this.STATUS.playbackInfo && this.STATUS.playbackInfo.playerState) {
					if (this.STATUS.playbackInfo.playerState == opt.state) {
						return true
					}
				}

				return false
			},
		}

		feedbacks.shuffling = {
			type: 'boolean',
			name: 'Show Shuffling State On Button',
			description: 'Indicate if Shuffle is in X Status',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Indicate in X Status',
					id: 'state',
					default: true,
					choices: [
						{ id: false, label: 'Off' },
						{ id: true, label: 'On' },
					],
				},
			],
			callback: async (event) => {
				let opt = event.options

				if (this.STATUS.state.isShuffling == opt.state) {
					return true
				}

				return false
			},
		}

		feedbacks.repeating = {
			type: 'boolean',
			name: 'Show Repeating State On Button',
			description: 'Indicate if Repeat is in X Status',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Indicate in X Status',
					id: 'state',
					default: true,
					choices: [
						{ id: false, label: 'Off' },
						{ id: true, label: 'On' },
					],
				},
			],
			callback: async (event) => {
				let opt = event.options

				if (this.STATUS.state.isRepeating == opt.state) {
					return true
				}

				return false
			},
		}

		feedbacks.volumeBelow = {
			type: 'advanced',
			name: 'Volume: below',
			description:
				'When macOS system output volume is strictly below the threshold, apply the style below. Stack with “Volume: between” and “Volume: above” for multi-zone buttons.',
			options: [
				{
					type: 'static-text',
					id: 'vol_below_match_hdr',
					label: 'Match when volume is less than (strictly below):',
				},
				{
					type: 'number',
					id: 'threshold',
					label: 'Below (%)',
					default: 50,
					min: 0,
					max: 100,
					range: true,
				},
				...volumeStyleOptionFields('vb'),
			],
			callback: async (event) => {
				const v = parseVolumePercent(this)
				if (v === null) return {}
				let t = Number(event.options.threshold)
				if (Number.isNaN(t)) t = 50
				t = Math.min(100, Math.max(0, t))
				if (v >= t) return {}
				return buildAdvancedStyleFromOptions(event.options, 'vb')
			},
		}

		feedbacks.volumeBetween = {
			type: 'advanced',
			name: 'Volume: between',
			description:
				'When volume is between the low and high values (inclusive on both ends), apply the style. Stack multiple instances for different bands.',
			options: [
				{
					type: 'static-text',
					id: 'vol_between_match_hdr',
					label: 'Match when volume is in this range (%), inclusive:',
				},
				{
					type: 'number',
					id: 'low',
					label: 'Low (%)',
					default: 50,
					min: 0,
					max: 100,
					range: true,
				},
				{
					type: 'number',
					id: 'high',
					label: 'High (%)',
					default: 75,
					min: 0,
					max: 100,
					range: true,
				},
				...volumeStyleOptionFields('vbt'),
			],
			callback: async (event) => {
				const v = parseVolumePercent(this)
				if (v === null) return {}
				let low = Number(event.options.low)
				let high = Number(event.options.high)
				if (Number.isNaN(low)) low = 50
				if (Number.isNaN(high)) high = 75
				low = Math.min(100, Math.max(0, low))
				high = Math.min(100, Math.max(0, high))
				if (low > high) {
					const x = low
					low = high
					high = x
				}
				if (v < low || v > high) return {}
				return buildAdvancedStyleFromOptions(event.options, 'vbt')
			},
		}

		feedbacks.volumeAbove = {
			type: 'advanced',
			name: 'Volume: above',
			description:
				'When volume is strictly greater than the threshold, apply the style. Stack with “Volume: below” and “Volume: between”.',
			options: [
				{
					type: 'static-text',
					id: 'vol_above_match_hdr',
					label: 'Match when volume is greater than (strictly above):',
				},
				{
					type: 'number',
					id: 'threshold',
					label: 'Above (%)',
					default: 75,
					min: 0,
					max: 100,
					range: true,
				},
				...volumeStyleOptionFields('va'),
			],
			callback: async (event) => {
				const v = parseVolumePercent(this)
				if (v === null) return {}
				let t = Number(event.options.threshold)
				if (Number.isNaN(t)) t = 75
				t = Math.min(100, Math.max(0, t))
				if (v <= t) return {}
				return buildAdvancedStyleFromOptions(event.options, 'va')
			},
		}

		this.setFeedbackDefinitions(feedbacks)
	},
}
