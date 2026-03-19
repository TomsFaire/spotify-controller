function convertHMS(value) {
	const sec = parseInt(value, 10) // convert value to number if it's string
	let hours = Math.floor(sec / 3600) // get hours
	let minutes = Math.floor((sec - hours * 3600) / 60) // get minutes
	let seconds = sec - hours * 3600 - minutes * 60 //  get seconds
	// add 0 if value < 10; Example: 2 => 02
	if (hours < 10) {
		hours = '0' + hours
	}
	if (minutes < 10) {
		minutes = '0' + minutes
	}
	if (seconds < 10) {
		seconds = '0' + seconds
	}
	return hours + ':' + minutes + ':' + seconds // Return is HH : MM : SS
}

function formatVolumeValue(raw) {
	if (raw === '' || raw === undefined || raw === null) return { volume: '', volume_percent: '' }
	const n = Number(raw)
	if (!Number.isFinite(n)) return { volume: '', volume_percent: '' }
	const v = Math.round(Math.min(100, Math.max(0, n)))
	return { volume: String(v), volume_percent: `${v}%` }
}

module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	initVariables: function () {
		let variables = []

		variables.push({ variableId: 'information', name: 'Information' })
		variables.push({ variableId: 'version', name: 'spotify-controller Version' })
		variables.push({ variableId: 'name', name: 'Track Name' })
		variables.push({ variableId: 'artist', name: 'Artist' })
		variables.push({ variableId: 'album', name: 'Album' })
		variables.push({ variableId: 'duration_hms', name: 'Track Duration (HMS)' })
		variables.push({ variableId: 'position_hms', name: 'Playback Position (HMS)' })
		variables.push({ variableId: 'trackid', name: 'Track ID' })
		variables.push({ variableId: 'player_state', name: 'Player State' })
		variables.push({ variableId: 'volume', name: 'Volume (0–100)' })
		variables.push({ variableId: 'volume_percent', name: 'Volume with % (e.g. 72%)' })
		variables.push({ variableId: 'rampingState', name: 'Volume Ramping State' })
		variables.push({ variableId: 'repeat', name: 'Repeat On/Off' })
		variables.push({ variableId: 'shuffle', name: 'Shuffle On/Off' })
		variables.push({ variableId: 'control_status', name: 'Control Status' })

		this.setVariableDefinitions(variables)
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function () {
		let self = this

		try {
			const volFmt = formatVolumeValue(this.STATUS.state && this.STATUS.state.volume)
			this.setVariableValues({
				information: this.STATUS.information,
				version: this.STATUS.version,
				name: this.STATUS.playbackInfo.name,
				artist: this.STATUS.playbackInfo.artist,
				album: this.STATUS.playbackInfo.album,
				duration_hms: convertHMS(Math.round(this.STATUS.playbackInfo.duration / 1000)),
				position_hms: convertHMS(Math.round(this.STATUS.playbackInfo.playbackPosition)),
				trackid: this.STATUS.playbackInfo.trackId,
				player_state: this.STATUS.playbackInfo.playerState,
				volume: volFmt.volume,
				volume_percent: volFmt.volume_percent,
				rampingState: this.STATUS.rampingState ? 'Currently Ramping' : 'Not Ramping',
				repeat: this.STATUS.state.isRepeating ? 'True' : 'False',
				shuffle: this.STATUS.state.isShuffling ? 'True' : 'False',
				control_status: this.STATUS.controlStatus ? 'True' : 'False',
			})
		} catch (error) {
			this.log('error', 'Error setting Variables: ' + String(error))
		}
	},
}
