#!/usr/bin/env node
require('./lib/record').main({
    url: 'http://painel.serveron.com.br:8110/stream',
    nameRadio: 'Clan 92.7',
    outputFolder: 'recordings',
    streamTitle: 'Felix Barros: Que es la tecnología'
});
