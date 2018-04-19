var NULL_LOGGER = function () { };
var DEFAULT_LOGGER = console.log;
var logger = DEFAULT_LOGGER;
var log = function () {
    var s = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        s[_i - 0] = arguments[_i];
    }
    logger(s.join(''));
};
Object.defineProperty(log, 'enabled', {
    set: function (enabled) {
        logger = enabled ? DEFAULT_LOGGER : NULL_LOGGER;
    }
});
var casted = log;
module.exports = casted;
