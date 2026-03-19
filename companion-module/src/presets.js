const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let presets = []

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red

		presets.push({
			type: 'button',
			category: 'Playback',
			name: 'Play',
			style: {
				text: 'PLAY',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'play',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'playbackState',
					options: {
						state: 'Playing',
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorRed,
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Playback',
			name: 'Pause',
			style: {
				text: 'PAUSE',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'pause',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'playbackState',
					options: {
						state: 'Paused',
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorRed,
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Playback',
			name: 'Playback Position',
			style: {
				text: '$(spotify-controller:position_hms)',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		})

		presets.push({
			type: 'button',
			category: 'Volume',
			name: 'Volume Up',
			style: {
				text: 'VOL +',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'volumeUp',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		})

		presets.push({
			type: 'button',
			category: 'Volume',
			name: 'Volume Down',
			style: {
				text: 'VOL -',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'volumeDown',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		})

		presets.push({
			type: 'button',
			category: 'Volume',
			name: 'Volume 50%',
			style: {
				text: 'VOL 50%',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'setVolume',
							options: {
								volume: 50,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		})

		presets.push({
			type: 'button',
			category: 'Volume',
			name: 'Volume 100%',
			style: {
				text: 'VOL 100%',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'setVolume',
							options: {
								volume: 100,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		})

		presets.push({
			type: 'button',
			category: 'Volume',
			name: 'Volume Level',
			style: {
				text: 'VOL:\\n$(spotify-controller:volume_percent)',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'volumeBelow',
					options: {
						threshold: 50,
						vb_bgcolor: combineRgb(22, 163, 74),
						vb_color: combineRgb(255, 255, 255),
						vb_size: '18',
						vb_alignment: 'center:center',
						vb_show_topbar: true,
						vb_text: '',
					},
				},
				{
					feedbackId: 'volumeBetween',
					options: {
						low: 50,
						high: 75,
						vbt_bgcolor: combineRgb(234, 88, 12),
						vbt_color: combineRgb(255, 255, 255),
						vbt_size: '18',
						vbt_alignment: 'center:center',
						vbt_show_topbar: true,
						vbt_text: '',
					},
				},
				{
					feedbackId: 'volumeAbove',
					options: {
						threshold: 75,
						va_bgcolor: combineRgb(220, 38, 38),
						va_color: combineRgb(255, 255, 255),
						va_size: '18',
						va_alignment: 'center:center',
						va_show_topbar: true,
						va_text: '',
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Track',
			name: 'Track Name',
			style: {
				text: 'TRACK:\\n$(spotify-controller:track)',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		})

		this.setPresetDefinitions(presets)
	},
}
