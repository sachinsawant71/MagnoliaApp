var mongo = require('mongodb');
var Db = mongo.Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var BSON = mongo.BSONPure;
var config = require('../config.js');

TasksProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(error, db){
	db.authenticate(config.db_user, config.db_password, function(error, result) {});
  });
};


TasksProvider.prototype.getCollection= function(callback) {
  this.db.collection('tasks', function(error, tasks_collection) {
    if( error ) callback(error);
    else callback(null, tasks_collection);
  });
};

TasksProvider.prototype.count = function(callback) {
    this.getCollection(function(error, tasks_collection) {
      if( error ) callback(error)
      else {
        tasks_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};

TasksProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, tasks_collection) {
      if( error ) callback(error)
      else {
        tasks_collection.findOne({"_id": tasks_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) {
			  console.log(error);
		  }
          else {
			  callback(null, result)
		  }
        });
      }
    });
};


TasksProvider.prototype.findAll = function(offset,limit,callback) {

    var options = {sort: [['createdDate','desc']]};
	if (offset && limit) {
		options = {skip:offset, limit:limit,"sort": [['createdDate','desc']]};
	}

    this.getCollection(function(error, tasks_collection) {
      if( error ) callback(error)
      else {
        tasks_collection.find({},options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

TasksProvider.prototype.add = function(task, callback) {
    this.getCollection(function(error, tasks_collection) {
      if( error ) callback(error)
      else {
        tasks_collection.insert(task, function() {
					callback(null, task);
		});
      }
    });
};

TasksProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, tasks_collection) {
      if( error ) callback(error)
      else {
		tasks_collection.remove({"_id": tasks_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) {
			  console.log(error);
		  }
          else {
			 callback(null,result)
		  }
        });
      }
    });
};


TasksProvider.prototype.update = function(task, callback) {
    this.getCollection(function(error, tasks_collection) {
      if( error ) callback(error);
      else {
			   tasks_collection.update( {_id: new BSON.ObjectID(task._id)},
							{$set: {
									details: task.details,
									priority: task.priority,
									status: task.status,
									startDate: task.plannedStartDate,
									assignedTo: task.assignedTo,
									notes: task.notes,
									endDate: task.endDate,	
									createdBy: tasks.createdBy
								}
							},
						function(error, result) {
								if(error) {
									console.log(error);
								}
								else {
									callback(null, result);       
								}
				});
      }
    });

};


exports.TasksProvider = TasksProvider;