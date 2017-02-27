var models = require('../models')

export function create (req, res) {
	models.Task.create({
		title: req.body.title,
		userId: req.user.id
	}).then(function (task) {
		res.send(task)
	})
}

export function getTasks (req, res) {
	models.Task.findAll({
		where: {
			userId: req.user.id
		}
	}).then(function (tasks) {
		res.send(tasks)
	})
}
