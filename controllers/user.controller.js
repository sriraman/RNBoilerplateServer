var https = require('https')
var md5 = require('MD5')
var models = require('../models')
var request = require('request')

export function authenticate (req, res) {

	// Store the body data in local variable

	var token = req.body.token // Server Auth Code

	// Send the Server Auth Code to Google Server to authenticate

	request({
		method: 'POST',
		url: 'https://www.googleapis.com/oauth2/v4/token',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			'cache-control': 'no-cache'
		},
		form: {
			code: token,
			client_id: '887619117671-2mc3kscvn9kogr9s2pi482e4cipdn9hv.apps.googleusercontent.com',
			client_secret: '3DrPBFzSKk9R1Vn2KGZWz9UF',
			grant_type: 'authorization_code'
		}
	}, function (error, response, body) {
		if (error) throw new Error(error)

		body = JSON.parse(body)

		// If Google return error
		if (body.error) {
			res.send({
				error: body.error,
				error_description: body.error_description
			})
			return
		}

		console.log('Response from the Google Server' + body)

		var idToken = body.id_token
		var accessToken = body.access_token
		var refreshToken = (body.refresh_token) ? body.refresh_token : null

		// Send the id_token to Google server to verify User Info

		https.get({
			host: 'www.googleapis.com',
			path: '/oauth2/v3/tokeninfo?id_token=' + idToken
		}, function (response) {
			var body = ''

			// Collect all the data in body variable
			response.on('data', function (d) {
				body += d
			})

			// When the Collection ends

			response.on('end', function () {
				body = JSON.parse(body)

				// If the name is not available
				if (!body.name) {
					res.send({
						'error': 'Something went wrong'
					})
				}

				var id = body.id
				var name = body.name
				var email = body.email

				// Check the Database for User in the database

				models.User.find({
					where: {
						email: email
					}
				}).then(function (user) {
					if (user == null) { // New User
						// Register the User
						models.User.create({ name: name, email: email }).then(function (user) { // Create User
							// Generate token with Random string
							var token = md5(user.id + new Date().getTime())

							// will get refresh token only once
							if (refreshToken === null) {
								// Update the access token, google access token and GCM
								models.User.update({token: token, googleAccessToken: accessToken}, {where: { id: user.id }}).then(function (user) {
									// New User and authenticating google for second time. This will not happen technically
									res.send({
										token: token,
										googleAccessToken: accessToken,
										id: user.id,
										name,
										email
									})
								})
							} else {
								// Update the access token, google access token
								models.User.update({accessToken: token, gcmId: gcmId, googleAccessToken: accessToken, refreshToken: refreshToken}, { where: { id: user.id } }).then(function (user) {
									// New User and authenticate google for first time.
									res.send({
										token: token,
										googleAccessToken: accessToken,
										id: user.id,
										name,
										email
									})
								})
							}
						})
					} else { // Existing User

						// Generate token
						var token = md5(user.id + new Date().getTime())

						let userData

						models.User.update({ token: token, gcmId: gcmId, googleAccessToken: accessToken }, { where: { id: user.id } }).then(function (result) {
							// Old User who is authenticating with Google for second time
							var response = {
								token: token,
								googleAccessToken: accessToken,
								connectedWatches: connectedWatches,
								id: user.id,
								name,
								email
							}

							res.send(response)
						})
					}
				})
			})
		})
	})
}

