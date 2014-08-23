// In charge of managing the Accounts collection

exports.findById = function(req, res) {
    var id = req.params.id;

    db.collection('accounts', function(err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('accounts', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.add = function(req, res) {
    var account = req.body;

    db.collection('accounts', function(err, collection) {
        collection.insert(account, {safe: true}, function(err, result) {
            if (err) {
                res.send({'error': 'An error has occurred' + err});
            } else {
                res.send(result[0]);
            }
        });
    });
};

exports.update = function(req, res) {
    var id = req.params.id;
    var account = req.body;

    db.collection('accounts', function(err, collection) {
        collection.update({'_id': new BSON.ObjectID(id)}, account, {safe: true}, function(err, result) {
            if (err) {
                res.send({'error': 'An error has occurred' + err});
            } else {
                res.send(account);
            }
        });
    });
};

exports.delete = function(req, res) {
    var id = req.params.id;

    db.collection('accounts', function(err, collection) {
        collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                res.send(String(result));
            }
        });
    });
};

exports.findByEmail = function(email, callback) {
    db.collection('accounts', function(err, collection) {
        if (err) {
            callback(err);
        }

        collection.findOne({'email': email}, function(err, item) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, item);
            }
        });
    });
};