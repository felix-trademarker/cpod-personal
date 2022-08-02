let _table = "users";
var Model = require('./_model')
var defaultModel = new Model(_table)

// MYSQL
var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
});

module.exports = {

    // BASE FUNCTIONS LOCATED IN _model
    get : async function() {
        return await defaultModel.get()
    },
    find : async function(id) {
        return await defaultModel.find(id)
	},
	findQuery : async function(query) {
        return await defaultModel.findQuery(query)
	},
	update : async function(id,data) {
        return await defaultModel.update(id,data)
    },
	put : async function(data) {
        return await defaultModel.put(data)
    },
    remove : async function(id) {
        return await defaultModel.remove(id)
    },

    // ADD CUSTOM FUNCTION BELOW ========================
    // ==================================================

    getUser : async function(email){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT * FROM users WHERE email='${email}'`
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    getUserLevel : async function(id, key){
        return new Promise(function(resolve, reject) {
            var sql = `SELECT * FROM user_options WHERE user_id='${id}' and option_key='${key}'`
            con.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
        });
    },

    
    
}