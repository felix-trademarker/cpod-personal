var rpoMysql = require('./../models/_MySqlModel')
var helpers = require('./../helpers')

exports.getUser = async function(email) {

  if (email === "test@test.cc") {
    email = "felix@bigfoot.com"
  }

  let sqlUser = await rpoMysql.findQuery({email:email})

  // console.log(sqlUser);
  if (sqlUser && sqlUser.length > 0) {
    console.log("fetch in mongo");
    return sqlUser[0]

  } else {
    let users = await rpoMysql.getUser(email)
    let level = 1;
    users = users && users.length > 0 ? users[0] : null
  
    if (users) {

      // FETCHED LEVEL 
      // WE CAN ADD MORE USER OPTIONS LATER
        level = await rpoMysql.getUserLevel(users.id, 'level')
        level = level && level.length > 0 ? level[0].option_value : 1
        level = helpers.convertIntToStringLevel(level)
    }

    // users.level = helpers.convertIntToStringLevel(level)
  
    await rpoMysql.put(users)
  
    console.log('fetch in mysql');

    return users;
  }

  
}
