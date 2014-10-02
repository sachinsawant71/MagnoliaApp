var fs = require('fs');
var path = require('path');
var TasksProvider = require('../models/Tasks.js').TasksProvider;
var tasksProvider = new TasksProvider();

module.exports = {
    add: function(req, res) {
			var task = req.body;
			tasksProvider.add(task, function(error, newTask) {
			  if (error) {
					res.send(error, 500);
			  } else {
				   res.send(newTask);
			  }
			});

    },

    findById: function(req, res) {
        tasksProvider.findById(req.params.id, function (error, task) {
		  if (error) {
			res.send(error, 500);
		  } else {
			res.send(task);
		  }
        });

    },

    findAll: function(req, res) {

	   tasksProvider.count(function(error,count){
		  if (error) {
			  console.log(error);
		  } 
		  tasksProvider.findAll(req.query.offset,req.query.limit,function(error,tasks){
			res.setHeader('record-count', count);
			res.send(tasks);
		  });
	   });
    },

    delete: function(req, res) {		
        tasksProvider.findById(req.params.id, function (error, task) {
		  if (error) {
			res.send(error, 500);
		  } else {
			tasksProvider.delete(req.params.id, function(error, result) {
				res.send('ok', 200);
			});
		  }
        });
    },

    update: function(req, res) {
		var task = req.body;
		tasksProvider.update(task, function(error, updatedTask) {			  
		  if (error) {
			res.send(error, 500);
		  } else {
			res.send(updatedTask,200);
		  }
		}); 
    }
};