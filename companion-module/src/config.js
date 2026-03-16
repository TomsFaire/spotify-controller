const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				label: 'Information',
				width: 12,
				value: `This module connects to a free program called "spotify-controller" which will run on the computer that uses Spotify you wish to control.`,
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Mac IP Address',
				width: 3,
				default: '127.0.0.1',
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				width: 3,
				default: 8801,
				regex: Regex.Port,
			},
			{
				type: 'static-text',
				id: 'dummy1',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'static-text',
				id: 'info2',
				label: 'Polling',
				width: 12,
				value: `Enabling polling unlocks these features: (mac only)
							- Current Volume Level/Feedbacks
							- Current Playback Position/Duration
						Enabling polling will tell spotify-controller to continuously execute an AppleScript to request the current playback state of Spotify. This could have an undesired performance effect on your machine, depending on the polling rate.`,
			},
			{
				type: 'checkbox',
				id: 'polling',
				label: 'Enable Polling (experimental)',
				default: false,
				width: 3,
			},
			{
				type: 'textinput',
				id: 'pollingrate',
				label: 'Polling Rate (in ms)',
				default: 1000,
				width: 3,
				isVisible: (configValues) => configValues.polling === true,
			},
			{
				type: 'static-text',
				id: 'dummy1',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'static-text',
				id: 'info3',
				label: 'Verbose Logging',
				width: 12,
				value: `Enabling this option will put more detail in the log, which can be useful for troubleshooting purposes.`,
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable Verbose Logging',
				default: false,
			},
		]
	},
}
