// techministry-spotifycontroller

const { InstanceBase, InstanceStatus, Regex, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')

const config = require('./src/config')
const actions = require('./src/actions')
const feedbacks = require('./src/feedbacks')
const variables = require('./src/variables')
const presets = require('./src/presets')

const io = require('socket.io-client')

class moduleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
		})

		this.socket = null

		this.POLLING_INTERVAL = null

		this.STATUS = {
			information: '',
			version: '',
			playbackInfo: {
				name: '',
				artist: '',
				album: '',
				duration: '',
				playbackPosition: '',
				trackId: '',
				playerState: '',
			},
			state: {
				volume: '',
			},
			rampingState: false,
			controlStatus: false,
		}
	}

	async destroy() {
		clearInterval(this.POLLING_INTERVAL)
		this.POLLING_INTERVAL = null
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting)
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		if (this.config.verbose) {
			this.log('info', 'Verbose mode enabled. Log entries will contain detailed information.')
		}

		this.updateStatus(InstanceStatus.Connecting)

		this.initConnection()

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.checkFeedbacks()
		this.checkVariables()
	}

	initConnection() {
		let self = this

		if (this.config.host) {
			this.log('info', `Opening connection to spotify-controller: ${this.config.host}:${this.config.port}`)

			this.socket = io.connect('http://' + this.config.host + ':' + this.config.port, { reconnection: true })
			this.log('info', 'Connecting to spotify-controller...')
			this.STATUS.information = 'Connecting to spotify-controller'
			this.checkVariables()

			// Add listeners
			this.socket.on('connect', function () {
				self.log('info', 'Connected to spotify-controller. Retrieving data.')
				self.updateStatus(InstanceStatus.Ok)
				self.STATUS.information = 'Connected'
				self.sendCommand('version', null, null)
				self.checkVariables()
				self.getState()
				self.initPolling() //init polling, if enabled
			})

			this.socket.on('disconnect', function () {
				self.updateStatus(InstanceStatus.ConnectionFailure)
				self.log('error', 'Disconnected from spotify-controller.')
				self.STATUS.information = 'Disconnected'
				self.checkVariables()

				clearInterval(self.POLLING_INTERVAL)
				self.POLLING_INTERVAL = null
			})

			this.socket.on('version', function (version) {
				self.STATUS.version = version
				self.checkVariables()
			})

			this.socket.on('state_change', function (data) {
				if (data.playbackInfo) {
					self.STATUS.playbackInfo = data.playbackInfo
				}

				if (data.state) {
					self.STATUS.state = data.state
				}

				self.checkVariables()
				self.checkFeedbacks()
			})

			this.socket.on('ramping_state', function (data) {
				self.STATUS.rampingState = data

				self.checkVariables()
				self.checkFeedbacks()
			})

			this.socket.on('control_status', function (status) {
				self.STATUS.controlStatus = status
				if (status == false) {
					self.updateStatus(InstanceStatus.UnknownWarning)
					self.STATUS.information = 'Control has been disabled via spotify-controller.'
					self.log('warning', 'Control has been disabled via spotify-controller.')
				} else {
					self.updateStatus(InstanceStatus.Ok)
					self.STATUS.information = 'Control has been enabled via spotify-controller.'
					self.log('info', 'Control has been enabled via spotify-controller.')
				}
				self.checkVariables()
				self.checkFeedbacks()
			})

			this.socket.on('error', function (error) {
				self.updateStatus(InstanceStatus.ConnectionFailure)
				self.log('error', 'Error from spotify-controller: ' + error)
			})
		}
	}

	initPolling() {
		let self = this

		if (this.config.polling) {
			if (this.config.verbose) {
				this.log('info', 'Starting Polling: Every ' + this.config.pollingrate + ' ms')
			}
			this.POLLING_INTERVAL = setInterval(this.getState.bind(this), parseInt(this.config.pollingrate))
		} else {
			clearInterval(this.POLLING_INTERVAL)
			this.POLLING_INTERVAL = null
		}
	}

	getState() {
		let self = this

		this.sendCommand('state')
	}

	sendCommand(cmd, arg1 = null, arg2 = null, arg3 = null) {
		if (this.socket !== undefined) {
			if (this.config.verbose) {
				this.log('info', 'Sending: ' + cmd)
			}

			if (arg1 !== null) {
				if (arg2 !== null) {
					if (arg3 !== null) {
						this.socket.emit(cmd, arg1, arg2, arg3)
					} else {
						this.socket.emit(cmd, arg1, arg2)
					}
				} else {
					this.socket.emit(cmd, arg1)
				}
			} else {
				this.socket.emit(cmd)
			}
		} else {
			debug('Unable to send: Not connected to spotify-controller.')

			if (this.config.verbose) {
				this.log('warn', 'Unable to send: Not connected to spotify-controller.')
			}
		}
	}
}

runEntrypoint(moduleInstance, UpgradeScripts)
