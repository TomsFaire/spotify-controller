const { combineRgb } = require('@companion-module/base')

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

		this.setFeedbackDefinitions(feedbacks)
	},
}
