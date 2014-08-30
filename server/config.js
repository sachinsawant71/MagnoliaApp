var db_host = 'localhost';
var db_port = '27017';
var db_name = 'magnolia';

var app_ip = '127.0.0.1';
var app_port = '8000';

if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
    db_host = process.env.OPENSHIFT_MONGODB_DB_HOST;
}

if (process.env.OPENSHIFT_MONGODB_DB_PORT) {
    db_port = process.env.OPENSHIFT_MONGODB_DB_PORT;
}

if (process.env.OPENSHIFT_APP_NAME) {
    db_name = process.env.OPENSHIFT_APP_NAME;
}

if (process.env.OPENSHIFT_NODEJS_IP) {
    app_ip = process.env.OPENSHIFT_NODEJS_IP;
}

if (process.env.OPENSHIFT_NODEJS_PORT) {
    app_port = process.env.OPENSHIFT_NODEJS_PORT;
}


module.exports = {
	"db_host"  : db_host,
	"db_port"  : db_port,
	"db_name"  : db_name,
	"app_ip"   : app_ip,
	"app_port" : app_port 
};