#!/usr/bin/env node
require('./lib/icy').main({
    url: 'http://23.111.184.195:8100/mocovi.mp3',
    nameRadio: 'Mocovi 800',
    outputFolder: 'recordings',
    streamTitle: 'Felix Barros: Que es la tecnología'
});
