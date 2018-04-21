var fs = require('fs');
var path = require('path');
var slug = require('slug');
var ffmetadata = require('ffmetadata');
var childProcess = require('child_process');
var log = require('./log');

/**
 * Funcion para formatear los nombre de carpeta y archivos. 
 */
function str_slug(str, lower = true) {
    return slug(str, { lower: lower })
}

var File = (function () {
    function File(folder, nameRadio, streamTitle) {
        this.streamTitle = streamTitle;

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
        var file = this.getUniqueFileName(folder);
        this.file = file;
        this.outStream = fs.createWriteStream(file, { flags: 'w' });
    };
    File.prototype.write = function (data) {
        this.outStream.write(data);
    };
    File.prototype.close = function () {
        this.outStream.close();
    };
    // Preparar el nombre del audio
    File.prototype.getUniqueFileName = function (folder) {
        var name = [Date.now(), this.streamTitle].join(' ');
        name = str_slug(name) + '.mp3';
        return path.join(folder, name);
    };
    return File;
})();

exports.File = File;
