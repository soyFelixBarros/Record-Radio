#!/usr/bin/env node
var record = require('./lib/record')

record.radio({
    url: 'http://server.ohradio.com.ar:9906/stream',
    radio: '9 de Julio 102.3 FM',
    title: 'Título de la nota'
});