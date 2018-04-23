#!/usr/bin/env node
var record = require('./lib/record')

record.radio({
    url: 'http://painel.serveron.com.br:8110/stream',
    nameRadio: 'Radio Example 92.7 FM',
    outputFolder: 'recordings',
    streamTitle: 'Title of the recording'
});