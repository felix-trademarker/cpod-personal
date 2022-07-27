
var ENV = process.env.ENVIRONMENT || 'prod';

module.exports = { 
    mongoURL        : process.env.MongoURL,
    mongoOptions    : { 
                        useNewUrlParser: true, 
                        useUnifiedTopology: true 
                      },
    mongoDB         : process.env.mongoDB ? process.env.mongoDB : 'chinesepod',
    filePathUpload  : (ENV === 'prod' ? process.env.uploadFilePath : process.env.uploadFilePathDev),
    ipAddresses     : ['103.104.17','211.20.18','211.72.53','122.116.227','122.52.119','61.244.218','50.74.20','127.0.0','::1'],
    
};
