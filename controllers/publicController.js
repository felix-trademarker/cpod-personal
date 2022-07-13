

exports.index = async function(req, res, next) {

    console.log("in index controller");
    

        // oauth2Client.credentials = JSON.parse(token);

        res.render('index', {
            layout: 'layout/public-layout', 
            title: '',
            description: '',
            keywords: ''
        });
    
  
}
