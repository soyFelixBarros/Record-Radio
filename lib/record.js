var icy = require('icy');
var fs = require('fs');
var path = require('path');
var output = require('./output');
var discover = require('./discover');
var progress = require('./progress');
var log = require('./log');
var homedir = require('homedir');

function radio(args) {
    args = args || parseProcessArgs();
    if (!args) {
        return;
    }
    var terminate = false;
    var sigInts = 0;
    var doNothing = function () { };
    var writeToStdout = args.teeToStdout ? function (data) { return process.stdout.write(data); } : doNothing;
    var progressTask = args.teeToStdout ? doNothing : progress.task;
    if (args.teeToStdout) {
        process.stdout.on('error', doNothing);
    }
    log.enabled = !args.teeToStdout;
    fixMaxEventListenersWarning();
    process.on('SIGINT', function () {
        terminate = true;
        log('\nWriting last packet before terminating.\n');
        if (sigInts++ > 3) {
            process.exit();
        }
    });
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
                        outFile = new output.File(args.outputFolder, args.nameRadio, args.streamTitle);
                        outFile.isInitialFileWithoutMetadata = true;
                    }
                    progressTask(outFile.fileName);
                    outFile.write(data);
                    writeToStdout(data);
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

function findTee(args) {
    var all = [];
    var tee = false;
    args.forEach(function (it) {
        if (it === '-t') {
            tee = true;
        }
        else {
            all.push(it);
        }
    });
    return { args: all, tee: tee };
}

function parseProcessArgs() {
    var parsed = findTee(process.argv);
    var args = parsed.args;
    if (args.length < 3) {
        return undefined;
    }
    var folder = args[3];
    if (!folder) {
        folder = path.join(process.cwd(), 'recordings');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }
    return { url: args[2], outputFolder: folder, teeToStdout: parsed.tee };
}
exports.parseProcessArgs = parseProcessArgs;

function formatHeaders(headers) {
    return Object.keys(headers).sort().map(function (k) { return ("    " + k + ": " + headers[k]); }).join('\n');
}

function fixMaxEventListenersWarning() {
    try {
        // http://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
        require('events').EventEmitter.prototype._maxListeners = 100;
    }
    catch (e) {
        log(e);
    }
}
