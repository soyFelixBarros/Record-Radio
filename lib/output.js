var fs = require('fs');
var path = require('path');
var slug = require('slug');
var ffmetadata = require('ffmetadata');
var log = require('./log');

/**
 * Funcion para formatear los nombre de carpeta y archivos. 
 */
function str_slug(str, lower = true) {
    return slug(str, { lower: lower })
}

class File {
    constructor(nameRadio, streamTitle) {
        this.streamTitle = streamTitle;
        
        var folder = path.join('recordings', str_slug(nameRadio));
        
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        this.trackNumber = fs.readdirSync(folder).length + 1;
        this.createStream(folder)
    }
    
    get fileName() {
        return path.basename(this.file)
    }

    createStream(folder) {
        var _this = this;
        var index = 0;
        var file = this.getUniqueFileName(folder);
        this.file = file;
        this.outStream = fs.createWriteStream(file, { flags: 'w' });
    }

    write(data) {
        this.outStream.write(data);
    }

    close() {
        this.outStream.close();
    }
    
    // Preparar el nombre del audio
    getUniqueFileName(folder) {
        var name = [Date.now(), this.streamTitle].join(' ');
        name = str_slug(name) + '.mp3';
        return path.join(folder, name);
    }
}

exports.File = File;
