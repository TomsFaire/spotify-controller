var spotify = require('spotify-node-applescript')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const config = require('./config.js')

const package_json = require('./package.json')
const VERSION = package_json.version

const osascript = require('osascript-promise')

var server = null
var httpServer = null
var io = null

const os = require('os')
const { exec } = require('child_process')

const isMac = os.platform() === 'darwin'
const isWindows = os.platform() === 'win32'

// macOS system volume (Spotify's AppleScript "sound volume" is broken on many versions)
function systemVolumeUp() {
	const script = `set v to output volume of (get volume settings)
	if v < 100 then set volume output volume (v + 10)`
	return osascript(script)
}
function systemVolumeDown() {
	const script = `set v to output volume of (get volume settings)
	if v > 0 then set volume output volume (v - 10)`
	return osascript(script)
}
function setSystemVolume(percent) {
	const p = Math.min(100, Math.max(0, Math.round(Number(percent))))
	const script = `set volume output volume ${p}`
	return osascript(script)
}
function setSystemMuted(muted) {
	const script = `set volume output muted ${muted ? 'true' : 'false'}`
	return osascript(script)
}

function openSpotifyUri(uri) {
	if (isWindows) {
		exec(`start ${uri}`, (err) => {
			if (err) console.error('Failed to open Spotify URI:', err)
		})
	}
}

function updateClients() {
	if (io && io.sockets) {
		io.sockets.emit('state_change', global.STATUS)
		io.sockets.emit('ramping_state', global.RAMPING)
	}
}

function getState(callback) {
	updateClients()

	spotify.getState(function (err, state) {
		if (state && state.position) {
			global.STATUS.playbackInfo.playbackPosition = state.position
			global.STATUS.state = state

			spotify.isRepeating(function (err, repeating) {
				global.STATUS.state.isRepeating = repeating

				spotify.isShuffling(function (err, shuffling) {
					global.STATUS.state.isShuffling = shuffling
					updateClients()
					if (typeof callback === 'function') callback()
				})
			})
		} else {
			if (typeof callback === 'function') callback()
		}
	})
}

// Serialize Spotify/AppleScript commands to prevent overlapping runs and crashes
const commandQueue = []
let queueRunning = false
function runSerial(fn) {
	commandQueue.push(fn)
	if (!queueRunning) processNext()
}
function processNext() {
	if (commandQueue.length === 0) {
		queueRunning = false
		return
	}
	queueRunning = true
	const fn = commandQueue.shift()
	fn(function () {
		processNext()
	})
}

// Ramp system output volume (same volume system as up/down/set)
function rampVolume(volume, changePercent = 5, rampTime = 3, callback) {
	if (global.RAMPING == true) {
		if (typeof callback === 'function') callback()
		return Promise.resolve()
	}
	global.RAMPING = true
	updateClients()

	const desired = Math.min(100, Math.max(0, Math.round(Number(volume))))
	const step = Math.max(1, Math.min(10, Math.round(Number(changePercent))))
	const rampSecs = Math.max(1, Math.min(60, Number(rampTime)))

	const rampScript = `
		set currentVol to output volume of (get volume settings)
		set desiredVol to ${desired}
		set stepSize to ${step}
		set rampTime to ${rampSecs}
		if stepSize < 1 then set stepSize to 1
		set diff to desiredVol - currentVol
		if diff < 0 then set stepSize to -stepSize
		set totalSteps to (diff / stepSize) as integer
		if totalSteps < 0 then set totalSteps to -totalSteps
		if totalSteps < 1 then set totalSteps to 1
		set delayTime to rampTime / totalSteps
		if delayTime < 0.05 then set delayTime to 0.05
		repeat with i from 1 to totalSteps
			set currentVol to output volume of (get volume settings)
			if stepSize > 0 then
				if currentVol < desiredVol then set volume output volume (currentVol + stepSize)
			else
				if currentVol > desiredVol then set volume output volume (currentVol + stepSize)
			end if
			delay delayTime
		end repeat
		set volume output volume desiredVol
	`

	return osascript(rampScript)
		.then(function (response) {
			global.RAMPING = false
			updateClients()
			if (typeof callback === 'function') {
				getState(callback)
			} else {
				getState()
			}
			return response
		})
		.catch(function (err) {
			global.RAMPING = false
			updateClients()
			if (typeof callback === 'function') callback()
			throw err
		})
}

function movePlayerPosition(seconds) {
	const delta = Number(seconds)
	if (Number.isNaN(delta)) {
		return Promise.reject(new Error('Invalid seconds for move position'))
	}
	const positionScript = `tell application "Spotify"
		set currentPosition to get player position
		set desiredPosition to (currentPosition + ${delta})
		set player position to desiredPosition
	end tell`

	global.STATUS.playbackInfo.playerState = `Moving Player Position ${delta} seconds`

	return osascript(positionScript).then(function (response) {
		return response
	})
}

function setPlayerPosition(seconds) {
	const pos = Math.max(0, Math.floor(Number(seconds))) || 0
	const positionScript = `tell application "Spotify"
		set player position to ${pos}
	end tell`

	global.STATUS.playbackInfo.playerState = `Setting Player Position ${pos} seconds`

	return osascript(positionScript).then(function (response) {
		return response
	})
}

module.exports = {
	start: function (port) {
		//starts the REST API
		server = express()

		httpServer = new http.Server(server)
		io = new socketio.Server(httpServer, { allowEIO3: true })

		server.get('/version', function (req, res) {
			res.send({ version: VERSION })
		})

		server.get('/control_status', function (req, res) {
			res.send({ control_status: config.get('allowControl') })
		})

		server.get('/state', function (req, res) {
			res.send({ playbackInfo: global.STATUS.playbackInfo, state: global.STATUS.state })
		})

		server.get('/play', function (req, res) {
			if (config.get('allowControl')) {
				try {
					if (isMac) {
						spotify.play()
					} else if (isWindows) {
						openSpotifyUri('spotify:app')
					}
					res.send({ status: 'playing' })
				} catch (error) {
					res.send({ error: error })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/playTrack/:track', function (req, res) {
			if (config.get('allowControl')) {
				try {
					let track = req.params.track
					if (isMac) {
						spotify.playTrack(track)
					} else if (isWindows) {
						openSpotifyUri(`spotify:track:${track}`)
					}
					res.send({ status: 'playing' })
				} catch (error) {
					res.send({ error: error })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/playTrackInContext/:track/:context', function (req, res) {
			if (config.get('allowControl')) {
				try {
					let track = req.params.track
					let context = req.params.context
					if (isMac) {
						spotify.playTrackInContext(track, context)
					} else if (isWindows) {
						openSpotifyUri(`spotify:${context}:${track}`)
					}
					res.send({ status: 'playing' })
				} catch (error) {
					res.send({ error: error })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/pause', function (req, res) {
			if (config.get('allowControl')) {
				try {
					if (isMac) {
						spotify.pause()
						res.send({ status: 'paused' })
					} else if (isWindows) {
						res.send({ error: 'Pause not supported on Windows.' })
					}
				} catch (error) {
					res.send({ error: error })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/playToggle', function (req, res) {
			if (config.get('allowControl')) {
				try {
					if (isMac) {
						spotify.playPause()
						res.send({ status: 'play-pause-toggled' })
					} else if (isWindows) {
						res.send({ error: 'Play/Pause toggle not supported on Windows.' })
					}
				} catch (error) {
					res.send({ error: error })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/movePlayerPosition/:seconds', function (req, res) {
			if (config.get('allowControl')) {
				try {
					if (isMac) {
						movePlayerPosition(req.params.seconds)
						res.send({ status: 'player-position-changed' })
					} else if (isWindows) {
						res.send({ error: 'Seek not supported on Windows.' })
					}
				} catch (error) {
					res.send({ error: error })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/setPlayerPosition/:seconds', function (req, res) {
			if (config.get('allowControl')) {
				try {
					if (isMac) {
						setPlayerPosition(req.params.seconds)
						res.send({ status: 'player-position-changed' })
					} else if (isWindows) {
						res.send({ error: 'Seek not supported on Windows.' })
					}
				} catch (error) {
					res.send({ error: error })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/next', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) {
					spotify.next()
					res.send({ status: 'next' })
				} else if (isWindows) {
					res.send({ error: 'Next track not supported on Windows.' })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/previous', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) {
					spotify.previous()
					res.send({ status: 'previous' })
				} else if (isWindows) {
					res.send({ error: 'Previous track not supported on Windows.' })
				}
			} else {
				res.send({ status: 'not-allowed' })
			}
		})

		server.get('/volumeUp', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac && global.RAMPING == false) spotify.volumeUp()
				else return res.send({ error: 'Volume control not supported on this platform.' })
				res.send({ status: 'volume-up' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/volumeDown', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac && global.RAMPING == false) spotify.volumeDown()
				else return res.send({ error: 'Volume control not supported on this platform.' })
				res.send({ status: 'volume-down' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/setVolume/:volume', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac && global.RAMPING == false) spotify.setVolume(req.params.volume)
				else return res.send({ error: 'Volume control not supported on this platform.' })
				res.send({ status: 'setvolume' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/rampVolume/:volume/:changepercent/:ramptime', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac && global.RAMPING == false) {
					let volume = parseInt(req.params.volume)
					let changePercent = parseInt(req.params.changepercent)
					let rampTime = parseInt(req.params.ramptime)
					rampVolume(volume, changePercent, rampTime)
				} else return res.send({ error: 'Ramp volume not supported on this platform.' })
				res.send({ status: 'rampvolume' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/mute', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) spotify.muteVolume()
				else return res.send({ error: 'Mute not supported on this platform.' })
				res.send({ status: 'volume-mute' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/unmute', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) spotify.unmuteVolume()
				else return res.send({ error: 'Unmute not supported on this platform.' })
				res.send({ status: 'volume-unmute' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/repeatOn', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) spotify.setRepeating(true)
				else return res.send({ error: 'Repeat not supported on this platform.' })
				res.send({ status: 'repeat-on' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/repeatOff', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) spotify.setRepeating(false)
				else return res.send({ error: 'Repeat not supported on this platform.' })
				res.send({ status: 'repeat-off' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/repeatToggle', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) spotify.toggleRepeating()
				else return res.send({ error: 'Repeat toggle not supported on this platform.' })
				res.send({ status: 'repeat-toggle' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/shuffleOn', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) spotify.setShuffling(true)
				else return res.send({ error: 'Shuffle not supported on this platform.' })
				res.send({ status: 'shuffle-on' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/shuffleOff', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) spotify.setShuffling(false)
				else return res.send({ error: 'Shuffle not supported on this platform.' })
				res.send({ status: 'shuffle-off' })
			} else res.send({ status: 'not-allowed' })
		})

		server.get('/shuffleToggle', function (req, res) {
			if (config.get('allowControl')) {
				if (isMac) spotify.toggleShuffling()
				else return res.send({ error: 'Shuffle toggle not supported on this platform.' })
				res.send({ status: 'shuffle-toggle' })
			} else res.send({ status: 'not-allowed' })
		})

		server.use(function (req, res) {
			res.status(404).send({ error: true, url: req.originalUrl + ' not found.' })
		})

		io.sockets.on('connection', (socket) => {
			let ipAddr = socket.handshake.address
			socket.emit('control_status', config.get('allowControl'))

			socket.on('version', function () {
				socket.emit('version', VERSION)
			})

			socket.on('control_status', function () {
				socket.emit('control_status', config.get('allowControl'))
			})

			socket.on('state', function () {
				runSerial(function (done) {
					getState(done)
				})
			})

			socket.on('play', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.play(function () {
							getState(done)
						})
					} else if (isWindows) {
						openSpotifyUri('spotify:app')
						done()
					} else {
						socket.emit('error', 'Platform not supported')
						done()
					}
				})
			})

			socket.on('pause', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.pause(function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Pause not supported on Windows')
						done()
					}
				})
			})

			socket.on('playToggle', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.playPause(function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Play/Pause toggle not supported on Windows')
						done()
					}
				})
			})

			socket.on('movePlayerPosition', function (seconds) {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						const delta = typeof seconds === 'number' ? seconds : parseFloat(seconds, 10)
						if (Number.isNaN(delta)) {
							socket.emit('error', 'Move Player Position: invalid seconds')
							done()
							return
						}
						movePlayerPosition(delta)
							.then(function () {
								// Delay before getState so Spotify can finish seeking
								setTimeout(function () {
									getState(done)
								}, 600)
							})
							.catch(function (err) {
								console.error('Move player position failed:', err)
								socket.emit('error', 'Move position failed: ' + (err && err.message ? err.message : err))
								done()
							})
					} else {
						socket.emit('error', 'Seek not supported on Windows')
						done()
					}
				})
			})

			socket.on('setPlayerPosition', function (seconds) {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						const pos = typeof seconds === 'number' ? seconds : parseFloat(seconds, 10)
						if (Number.isNaN(pos) || pos < 0) {
							socket.emit('error', 'Set Player Position: invalid seconds (use 0 or a positive number)')
							done()
							return
						}
						setPlayerPosition(pos)
							.then(function () {
								// Delay before getState so Spotify can finish seeking; calling getState
								// too soon can cause the position to jump back to 0
								setTimeout(function () {
									getState(done)
								}, 600)
							})
							.catch(function (err) {
								console.error('Set player position failed:', err)
								socket.emit('error', 'Set position failed: ' + (err && err.message ? err.message : err))
								done()
							})
					} else {
						socket.emit('error', 'Seek not supported on Windows')
						done()
					}
				})
			})

			socket.on('playtrack', function (track) {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.playTrack(track, function () {
							getState(done)
						})
					} else if (isWindows) {
						openSpotifyUri(`spotify:track:${track}`)
						done()
					} else {
						socket.emit('error', 'Platform not supported')
						done()
					}
				})
			})

			socket.on('playtrackincontext', function (track, context) {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.playTrackInContext(track, context, function () {
							getState(done)
						})
					} else if (isWindows) {
						openSpotifyUri(`spotify:${context}:${track}`)
						done()
					} else {
						socket.emit('error', 'Platform not supported')
						done()
					}
				})
			})

			socket.on('next', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.next(function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Next not supported on Windows')
						done()
					}
				})
			})

			socket.on('previous', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.previous(function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Previous not supported on Windows')
						done()
					}
				})
			})

			socket.on('volumeUp', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				if (!isMac || global.RAMPING === true) {
					socket.emit('error', 'Volume control not supported on this platform')
					return
				}
				runSerial(function (done) {
					// Spotify's AppleScript "sound volume" is broken on many macOS/Spotify versions.
					// Use system output volume so Volume Up/Down always have an effect.
					systemVolumeUp()
						.then(function () {
							getState(done)
						})
						.catch(function (err) {
							console.error('Volume up failed:', err)
							socket.emit('error', 'Volume up failed: ' + (err && err.message ? err.message : err))
							getState(done)
						})
				})
			})

			socket.on('volumeDown', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				if (!isMac || global.RAMPING === true) {
					socket.emit('error', 'Volume control not supported on this platform')
					return
				}
				runSerial(function (done) {
					systemVolumeDown()
						.then(function () {
							getState(done)
						})
						.catch(function (err) {
							console.error('Volume down failed:', err)
							socket.emit('error', 'Volume down failed: ' + (err && err.message ? err.message : err))
							getState(done)
						})
				})
			})

			socket.on('setVolume', function (volume) {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				if (!isMac || global.RAMPING === true) {
					socket.emit('error', 'Volume control not supported on this platform')
					return
				}
				runSerial(function (done) {
					setSystemVolume(volume)
						.then(function () {
							getState(done)
						})
						.catch(function (err) {
							console.error('Set volume failed:', err)
							socket.emit('error', 'Set volume failed: ' + (err && err.message ? err.message : err))
							getState(done)
						})
				})
			})

			socket.on('rampVolume', function (volume, changePercent, rampTime) {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				if (!isMac || global.RAMPING === true) {
					socket.emit('error', 'Ramp volume not supported on this platform')
					return
				}
				runSerial(function (done) {
					rampVolume(volume, changePercent, rampTime, done)
				})
			})

			socket.on('mute', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				if (!isMac) {
					socket.emit('error', 'Mute not supported on this platform')
					return
				}
				runSerial(function (done) {
					setSystemMuted(true)
						.then(function () {
							getState(done)
						})
						.catch(function (err) {
							console.error('Mute failed:', err)
							getState(done)
						})
				})
			})

			socket.on('unmute', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				if (!isMac) {
					socket.emit('error', 'Unmute not supported on this platform')
					return
				}
				runSerial(function (done) {
					setSystemMuted(false)
						.then(function () {
							getState(done)
						})
						.catch(function (err) {
							console.error('Unmute failed:', err)
							getState(done)
						})
				})
			})

			socket.on('repeatOn', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.setRepeating(true, function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Repeat not supported on this platform')
						done()
					}
				})
			})

			socket.on('repeatOff', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.setRepeating(false, function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Repeat not supported on this platform')
						done()
					}
				})
			})

			socket.on('repeatToggle', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.toggleRepeating(function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Repeat toggle not supported on this platform')
						done()
					}
				})
			})

			socket.on('shuffleOn', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.setShuffling(true, function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Shuffle not supported on this platform')
						done()
					}
				})
			})

			socket.on('shuffleOff', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.setShuffling(false, function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Shuffle not supported on this platform')
						done()
					}
				})
			})

			socket.on('shuffleToggle', function () {
				if (!config.get('allowControl')) {
					socket.emit('control_status', false)
					return
				}
				runSerial(function (done) {
					if (isMac) {
						spotify.toggleShuffling(function () {
							getState(done)
						})
					} else {
						socket.emit('error', 'Shuffle toggle not supported on this platform')
						done()
					}
				})
			})
		})

		httpServer.listen(port)
		console.log('REST/Socket.io API server started on: ' + port)
	},

	sendUpdates: function () {
		getState()
	},

	sendControlStatus: function () {
		io.sockets.emit('control_status', config.get('allowControl'))
	},
}
