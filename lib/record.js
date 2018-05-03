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

    discover.discoverIcyUrl(args.url, function (url, err) {
        // Conectarse a la transmisión remota
        icy.get(url, function (res) {
            var outFile;
            var doOutput = true;
            
            // Recording from url
            res.on('data', function (data) {
                if (doOutput) {
                    if (!outFile) {
                        // Crear el archivo con el bufer campturado
                        outFile = new output.File(args.radio);
                        console.log(process.pid);
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
