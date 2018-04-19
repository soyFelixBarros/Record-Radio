#!/usr/bin/env node
require('./lib/icy').main({
    url: 'http://23.111.184.195:8100/mocovi.mp3',
    outputFolder: 'recordings',
    fileName: 'name-audio'
});
