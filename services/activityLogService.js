var Model = require('./../models/_model')
let geoip = require('geoip-lite');
let variables = require('./../config/variables')
let moment = require('moment')

exports.logActivity = function(req, description) {

    let ip = req.ip

    var ipArr = ip.split(".")
    var subnetIp = ip.replace("."+ipArr[ipArr.length -1], '')

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    if (variables.ipAddresses.includes(subnetIp)) return;

    var rpoLogs = new Model("logs")

    let geo = geoip.lookup(ip);

    if (geo) {

        geo.ip = ip
        geo.logs = description
        geo.createdAt = moment().format()
        rpoLogs.put(geo)
    }
    

}