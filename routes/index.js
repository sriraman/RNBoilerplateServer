'use strict'

var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')

import * as UserController from '../controllers/user.controller'
import * as TaskController from '../controllers/task.controller'
import auth from '../middleware/auth'

router.use(bodyParser.raw())

/**
 * @api {post} /auth Authenticate
 *
 * @apiGroup User
 *
 * @apiParam {String} token Token
 *
 * @apiSuccess {String} token Token
 */
router.route('/auth').post(UserController.authenticate)

router.use(auth)

/**
 * @api {post} /tasks Add a new task
 *
 * @apiGroup Task
 *
 * @apiHeader {String} x-access-token Access Token
 *
 * @apiParam {String} title Title
 *
 * @apiSuccess {String} id
 * @apiSuccess {String} title
 */
router.route('/tasks').post(TaskController.create)


/**
 * @api {get} /tasks Get the list of tasks for the User
 *
 * @apiGroup Task
 *
 * @apiHeader {String} x-access-token Access Token
 *
 * @apiSuccess {Array} tasks
 */
router.route('/tasks').get(TaskController.getTasks)

export default router
