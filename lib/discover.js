var http = require('./follow-redirects').http;
var parsers = require('playlist-parser');
function discoverIcyUrl(url, callback) {
    tryPlaylist(url, function (icyUrl, err) {
        var req = http.get(icyUrl, function (res) {
            req.abort();
            callback(http.lastRedirectUrl || icyUrl);
        });
        req.on('error', function (err) {
            if (err['code'] === 'HPE_INVALID_CONSTANT') {
                callback(icyUrl);
            }
            else {
                callback(url, err);
            }
        });
    });
}
exports.discoverIcyUrl = discoverIcyUrl;
function parserFromContentType(contentType) {
    if (contentType.indexOf('pls') >= 0) {
        return parsers.PLS;
    }
    else if (contentType.indexOf('m3u') >= 0 || contentType.indexOf('audio/x-mpegurl') >= 0) {
        return parsers.M3U;
    }
    else {
        return undefined;
    }
}
function tryPlaylist(url, callback) {
    var req = http.get(url, function (response) {
        var contentType = response.headers['content-type'] || '';
        var parser = parserFromContentType(contentType);
        if (!parser) {
            callback(url); // not a known playlist.
            req.abort();
            return;
        }
        var buf = '';
        response.on('data', function (data) {
            buf += data;
        });
        response.on('end', function () {
            var playlist = parser.parse(buf);
            if (playlist && playlist[0] && playlist[0].file) {
                callback(playlist[0].file);
            }
            else {
                callback(url, new Error('no file in pls.'));
            }
        });
        response.on('error', function (err) {
            callback(url, err);
        });
    });
    req.on('error', function (err) {
        callback(url, new Error('not a pls (' + err + ')'));
    });
}
