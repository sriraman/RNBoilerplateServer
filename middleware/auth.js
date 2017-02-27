'use strict'
import User from '../models/user';
import sanitizeHtml from 'sanitize-html';
var https = require('https');
var md5 = require('MD5');
var models = require("../models");
var express = require('express');
var app = express();
var request = require("request");

module.exports = function(req,res,next) {


  var token = req.headers['x-access-token'];

	if(token){

		models.User.find({
			where: {
				token: token
			}
		}).then(function(user){
			if(user){
				req.user = user;
				next();
			}else{
				return res.status(403).send({
			        success: false,
			        message: 'Token Expired or Invalid Token'
			    });
			}

		});

	}else{
		return res.status(401).send({
	        success: false,
	        message: 'Unauthorized. No token provided.'
	    });
	}
};

