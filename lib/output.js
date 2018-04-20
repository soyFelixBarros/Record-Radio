var fs = require('fs');
var path = require('path');
var slug = require('slug');
var ffmetadata = require('ffmetadata');
var childProcess = require('child_process');
var log = require('./log');
var DELETE_SMALL_FILES = true; // may set to true when debugging
var MIN_FILE_SIZE = 1024 * 1000; // 1M
exports.onFileCompleted = function () { };
var ffmpegReady = undefined;

function ffmpegTest(callback) {
    if (ffmpegReady !== undefined) {
        callback(ffmpegReady);
        return;
    }
    var cp = childProcess.spawn('ffmpeg', ['-version']);
    var ok = true;
    cp.on('error', function (err) {
        log('\'ffmpeg\' was not found. You may need to install it or ensure that it is found in the path. ID3 tagging will be disabled (' + err + ')');
        ok = false;
    });
    cp.on('close', function () {
        ffmpegReady = ok;
        callback(ok);
    });
}

/**
 * Funcion para formatear los nombre de carpeta y archivos. 
 */
function str_slug(str, lower = true) {
    return slug(str, { lower: lower })
}

var File = (function () {
    function File(folder, nameRadio, streamTitle) {
        this.streamTitle = streamTitle;
        this.artist = 'artist';
        this.title = 'track';
        this.isInitialFileWithoutMetadata = false;
        this.deleteOnClose = false;

        var albumFolder = path.join(folder, str_slug(nameRadio));
        if (!fs.existsSync(albumFolder)) {
            fs.mkdirSync(albumFolder);
        }
        this.trackNumber = fs.readdirSync(albumFolder).length + 1;
        this.createStream(albumFolder);
    }
    Object.defineProperty(File.prototype, "fileName", {
        get: function () {
            return path.basename(this.file);
        },
        enumerable: true,
        configurable: true
    });
    File.prototype.createStream = function (folder) {
        var _this = this;
        var index = 0;
        var file;
        do {
            file = this.getUniqueFileName(folder, index);
            index++;
        } while (fs.existsSync(file));
        this.file = file;
        this.outStream = fs.createWriteStream(file, { flags: 'w' });
        this.outStream.once('close', function () {
            if (_this.deleteOnClose || DELETE_SMALL_FILES && fs.statSync(_this.file).size < MIN_FILE_SIZE) {
                fs.unlinkSync(_this.file);
                exports.onFileCompleted();
            }
            else {
                _this.writeId3Tags(function (err) {
                    if (err) {
                        log('Error writing ID3 tags: ' + err);
                    }
                    exports.onFileCompleted();
                });
            }
        });
    };
    File.prototype.write = function (data) {
        this.outStream.write(data);
    };
    File.prototype.close = function () {
        this.outStream.close();
    };
    File.prototype.writeId3Tags = function (callback) {
        var _this = this;
        ffmpegTest(function (ok) {
            if (!ok) {
                return;
            }
            setTimeout(function () {
                // http://wiki.multimedia.cx/index.php?title=FFmpeg_Metadata
                var data = {
                    title: _this.title,
                    artist: _this.artist,
                    album: _this.album,
                    genre: _this.genre,
                    track: _this.trackNumber,
                    date: new Date().getFullYear()
                };
                ffmetadata.write(_this.file, data, { 'id3v2.3': true }, callback);
            }, 800);
        });
    };
    // Preparar el nombre del audio
    File.prototype.getUniqueFileName = function (folder, index) {
        var name = [this.trackNumber, this.streamTitle].join(' ');
        name = str_slug(name) + '.mp3';
        return path.join(folder, name);
    };
    return File;
})();

exports.File = File;
