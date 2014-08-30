var db_host = 'localhost';
var db_port = '27017';
var db_name = 'magnolia';

var app_ip = '127.0.0.1';
var app_port = '8000';

var db_user = "";
var db_password = "";

var connectionString = 'localhost:27017';

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

if (process.env.OPENSHIFT_MONGODB_DB_USERNAME) {
    db_user = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
}

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    db_password = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
}

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
	connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
		process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
		process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
		process.env.OPENSHIFT_MONGODB_DB_PORT;
}

module.exports = {
	"db_host"  : db_host,
	"db_port"  : parseInt(db_port),
	"db_name"  : db_name,
	"app_ip"   : app_ip,
	"app_port" : app_port,
	"db_user"  : db_user,
	"db_password" : db_password,
	"db_url" : connectionString
};