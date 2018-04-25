var icy = require('icy');
var fs = require('fs');
var path = require('path');
var output = require('./output');
var discover = require('./discover');
var log = require('./log');
var homedir = require('homedir');

function radio(args) {
    if (!args) {
        return;
    }
    var terminate = false;
    var sigInts = 0;
    var doNothing = function () { };

    discover.discoverIcyUrl(args.url, function (url, err) {
        if (err) {
            log('Discover says: ' + err);
        }

        // Conectarse a la transmisión remota
        icy.get(url, function (res) {
            var outFile;
            var doOutput = true;
            
            log("Recording from " + url);
            res.on('data', function (data) {
                if (doOutput) {
                    if (!outFile) {
                        // Crear el archivo con el bufer campturado
                        outFile = new output.File(args.radio, args.title);
                    }
                    outFile.write(data);
                }
                if (terminate) {
                    output.onFileCompleted = process.exit;
                    if (outFile) {
                        outFile.close();
                    }
                    else {
                        output.onFileCompleted();
                    }
                }
            });
        });
    });
}

exports.radio = radio;
