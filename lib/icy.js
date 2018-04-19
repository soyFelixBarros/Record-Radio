var icecast = require('icy');
var fs = require('fs');
var path = require('path');
var output = require('./output');
var discover = require('./discover');
var progress = require('./progress');
var log = require('./log');
var homedir = require('homedir');
var SETTINGS_FILE = '.icy-rip';

function getSettingsFiles() {
    return [process.cwd(), homedir()].map(function (it) { return path.join(it, SETTINGS_FILE); });
}

function loadFilters() {
    return getSettingsFiles().map(function (it) {
        try {
            var settings = require(it);
            return settings.filter;
        }
        catch (err) {
            if (err.code !== 'MODULE_NOT_FOUND') {
                log("Error while loading settings file '" + it + "': " + err + ".");
            }
            return null;
        }
    }).filter(function (it) { return !!it; });
}

function matches(headers, filters) {
    for (var i = 0, n = filters.length; i < n; i++) {
        if (!filters[i](headers)) {
            return false;
        }
    }
    return true;
}

function main(args) {
    args = args || parseProcessArgs();
    if (!args) {
        log('Usage: icy-rip <url> [optional output folder][-t writes audio data to stdout]');
        return;
    }
    var terminate = false;
    var sigInts = 0;
    var doNothing = function () { };
    var writeToStdout = args.teeToStdout ? function (data) { return process.stdout.write(data); } : doNothing;
    var progressTask = args.teeToStdout ? doNothing : progress.task;
    var filters = loadFilters();
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
    discover.discoverIcyUrl(args.url, function (icyUrl, err) {
        if (err) {
            log('Discover says: ' + err);
        }
        icecast.get(icyUrl, function (res) {
            log("Recording from " + icyUrl);
            // log("Headers:");
            // log(formatHeaders(res.headers));
            var genre = res.headers['icy-genre'] || '';
            // var album = res.headers['icy-name'] || '';
            var album = 'mocovi-800';
            var outFile;
            var doOutput = true;
            // res.on('metadata', function (metadata) {
            //     var meta = icecast.parse(metadata);
            //     var newTitle = meta.StreamTitle;
            //     var trackNumberOffset = 0;
            //     if (outFile && outFile.streamTitle !== newTitle) {
            //         if (outFile.isInitialFileWithoutMetadata) {
            //             outFile.deleteOnClose = true;
            //             trackNumberOffset = -1;
            //         }
            //         outFile.close();
            //         outFile = undefined;
            //     }
            //     if (!outFile) {
            //         doOutput = matches({ title: newTitle }, filters);
            //         if (doOutput) {
            //             outFile = new output.File(args.outputFolder, trackNumberOffset, album, genre, newTitle);
            //         }
            //         else {
            //             log("\nSkipping " + newTitle + ".");
            //         }
            //     }
            // });
            res.on('data', function (data) {
                if (doOutput) {
                    if (!outFile) {
                        outFile = new output.File(args.outputFolder, 0, album, genre, args.fileName);
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

exports.main = main;

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
