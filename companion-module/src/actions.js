module.exports = {
	// ##########################
	// #### Instance Actions ####
	// ##########################
	initActions: function () {
		let self = this
		let actions = {}

		actions.play = {
			name: 'Play',
			options: [],
			callback: async (action) => {
				self.sendCommand('play')
			},
		}

		actions.pause = {
			name: 'Pause',
			options: [],
			callback: async (action) => {
				self.sendCommand('pause')
			},
		}

		actions.playToggle = {
			name: 'Play/Pause Toggle',
			options: [],
			callback: async (action) => {
				self.sendCommand('playToggle')
			},
		}

		actions.movePlayerPosition = {
			name: 'Move Player Position',
			options: [
				{
					type: 'textinput',
					label: 'Seconds',
					id: 'seconds',
					tooltip: 'Number of seconds to move forward or backward (use negative number). Supports variables, e.g. $(google-sheets:D3)',
					default: '10',
					useVariables: true,
				},
			],
			callback: async (action) => {
				let secondsStr = await self.parseVariablesInString(action.options.seconds || '0')
				let seconds = parseFloat(secondsStr, 10)
				if (Number.isNaN(seconds)) seconds = 0
				self.sendCommand('movePlayerPosition', seconds)
			},
		}

		actions.setPlayerPosition = {
			name: 'Set Player Position',
			options: [
				{
					type: 'textinput',
					label: 'Position (seconds, mm:ss, or hh:mm:ss)',
					id: 'seconds',
					tooltip: 'Position: seconds (e.g. 90), mm:ss (e.g. 1:30), or hh:mm:ss (e.g. 1:30:00). Supports variables.',
					default: '0',
					useVariables: true,
				},
			],
			callback: async (action) => {
				let value = await self.parseVariablesInString(action.options.seconds || '0')
				value = (value || '0').toString().trim()
				self.sendCommand('setPlayerPosition', value)
			},
		}

		actions.playTrack = {
			name: 'Play Track By ID',
			options: [
				{
					type: 'textinput',
					id: 'track',
					label: 'Track ID',
					default: 'spotify:track:',
					useVariables: true,
				},
			],
			callback: async (action) => {
				let track = await self.parseVariablesInString(action.options.track)

				self.sendCommand('playtrack', track)
			},
		}

		actions.playTrackInContext = {
			name: 'Play Track In Context By ID',
			options: [
				{
					type: 'textinput',
					id: 'track',
					label: 'Track ID',
					default: 'spotify:track:',
					useVariables: true,
				},
				{
					type: 'textinput',
					id: 'context',
					label: 'Context ID',
					default: 'spotify:album:',
					useVariables: true,
				},
			],
			callback: async (action) => {
				let track = await self.parseVariablesInString(action.options.track)
				let context = await self.parseVariablesInString(action.options.context)

				self.sendCommand('playtrackincontext', track, context)
			},
		}

		actions.next = {
			name: 'Next Track',
			options: [],
			callback: async (action) => {
				self.sendCommand('next')
			},
		}

		actions.previous = {
			name: 'Previous Track',
			options: [],
			callback: async (action) => {
				self.sendCommand('previous')
			},
		}

		actions.volumeUp = {
			name: 'Volume Up',
			options: [],
			callback: async (action) => {
				self.sendCommand('volumeUp')
			},
		}

		actions.volumeDown = {
			name: 'Volume Down',
			options: [],
			callback: async (action) => {
				self.sendCommand('volumeDown')
			},
		}

		actions.setVolume = {
			name: 'Set Volume',
			options: [
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					tooltip: 'Sets the volume level by percent (0-100)',
					min: 0,
					max: 100,
					default: 50,
					step: 1,
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				let volume = action.options.volume
				self.sendCommand('setVolume', volume)
			},
		}

		actions.rampVolume = {
			name: 'Ramp Volume',
			options: [
				{
					type: 'number',
					label: 'Set Volume Level To (0-100)',
					id: 'volume',
					tooltip: 'Ramp the volume level to this percent (0-100)',
					min: 0,
					max: 100,
					default: 50,
					step: 1,
					required: true,
					range: false,
				},
				{
					type: 'number',
					label: 'Change Percent',
					id: 'changePercent',
					tooltip: 'The percent to change the volume in each step',
					min: 1,
					max: 10,
					default: 5,
					step: 1,
					required: true,
					range: false,
				},
				{
					type: 'number',
					label: 'Ramp Time',
					id: 'rampTime',
					tooltip: 'The amount of time (in seconds) to take to complete the ramp',
					min: 3,
					max: 30,
					default: 5,
					step: 1,
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				let volume = parseInt(action.options.volume)
				let changePercent = parseInt(action.options.changePercent)
				let rampTime = parseInt(action.options.rampTime)
				self.sendCommand('rampVolume', volume, changePercent, rampTime)
			},
		}

		actions.mute = {
			name: 'Volume Mute',
			options: [],
			callback: async (action) => {
				self.sendCommand('mute')
			},
		}

		actions.unmute = {
			name: 'Volume Unmute',
			options: [],
			callback: async (action) => {
				self.sendCommand('unmute')
			},
		}

		actions.repeatOn = {
			name: 'Repeat On',
			options: [],
			callback: async (action) => {
				self.sendCommand('repeatOn')
			},
		}

		actions.repeatOff = {
			name: 'Repeat Off',
			options: [],
			callback: async (action) => {
				self.sendCommand('repeatOff')
			},
		}

		actions.shuffleOn = {
			name: 'Shuffle On',
			options: [],
			callback: async (action) => {
				self.sendCommand('shuffleOn')
			},
		}

		actions.shuffleOff = {
			name: 'Shuffle Off',
			options: [],
			callback: async (action) => {
				self.sendCommand('shuffleOff')
			},
		}

		this.setActionDefinitions(actions)
	},
}
