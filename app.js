var icy = require('icy');
var fs = require('fs');
var path = require('path');
var output = require('./lib/output');
var discover = require('./lib/discover');
var log = require('./lib/log');
var homedir = require('homedir');
var express = require('express');
var app = express();
var outFile;

app.use('/recordings', express.static('recordings'));

app.get('/', function (req, res) {
    res.send('Url y radio para comenzar');
});

app.get('/record', function (req, res) {
    
    discover.discoverIcyUrl(req.query.url, function (url, err) {
            
        // Conectarse a la transmisión remota    
        icy.get(url, function (res) {
            // Recording from url  
            res.on('data', function (data) {
                if (!outFile) {
                    // Crear el archivo con el bufer campturado
                    outFile = new output.File(req.query.radio);
                }
                outFile.write(data);
            });
        });
    });

    res.send('<audio src="'+req.query.url+'"></audio>Recording ' + req.query.radio+'<a href="/stop">Detener</a>');
});

app.get('/stop', function (req, res) {
    res.send(outFile.file+'<br><audio src="'+outFile.file+'" controls autoplay></audio>');
});

app.listen(3000);