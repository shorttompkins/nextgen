var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express();

app.set('port', process.env.PORT || 3500);

app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('some-secret-value-here'));
app.use(app.router);
app.use('/', express.static(path.join(__dirname, '/')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//finally boot up the server:
http.createServer(app).listen(app.get('port'), function() {
    console.log('Server up: http://localhost:' + app.get('port'));
});
