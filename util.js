'use strict'

const { Notification, nativeImage } = require('electron')

const _ = require('lodash')

const config = require('./config.js')
const API = require('./api.js')

// 1x1 transparent PNG – used when stored icon is missing or invalid (e.g. corrupted config)
const FALLBACK_ICON_DATA_URL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function getIcon() {
	const raw = config.get('icon')
	if (
		typeof raw === 'string' &&
		raw.startsWith('data:image') &&
		raw.length > 0 &&
		raw.length < 500000
	) {
		try {
			return nativeImage.createFromDataURL(raw)
		} catch (_) {
			// invalid data URL, use fallback
		}
	}
	return nativeImage.createFromDataURL(FALLBACK_ICON_DATA_URL)
}

function showNotification() {
	const icon = getIcon()

	if (global.STATUS.playbackInfo.playerState === 'Playing' && config.get('showNotifications')) {
		const NOTIFICATION_TITLE = global.STATUS.playbackInfo.name
		const NOTIFICATION_BODY = global.STATUS.playbackInfo.artist
		new Notification({
			title: NOTIFICATION_TITLE,
			subtitle: NOTIFICATION_BODY,
			icon: icon,
			silent: true,
		}).show()
	}
}

module.exports = {
	getIcon,
	processNotification: function (event, info) {
		try {
			if (config.get('allowedEvents').includes(event)) {
				//do the stuff with the things
				switch (event) {
					case 'com.spotify.client.PlaybackStateChanged':
						global.STATUS.playbackInfo = _.mapKeys(info, (v, k) => _.camelCase(k))
						API.sendUpdates()
						showNotification()
						break
					default:
						break
				}
			}
		} catch (error) {
			console.log(error)
		}
	},
}
