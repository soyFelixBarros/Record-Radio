# Grabar Radio
Herramienta NodeJS para extraer transmisiones de radio (SHOUTcast y Icecast) a archivos de audio individuales.

## Instalación

Instalar con `npm`:

``` bash
$ npm install record-radio
```

## Usar

``` javascript
var record = require('record-radio');

record.radio({
    url: 'http://painel.serveron.com.br:8110/stream',
    nameRadio: 'Radio Example 92.7 FM',
    outputFolder: 'recordings',
    streamTitle: 'Title of the recording'
});
```

## Licencia MIT

Por favor, consulte el [archivo de licencia](LICENSE.md) para obtener más información.

------

Desarrollado por [Felix Barros](https://twitter.com/soyFelixBarros)