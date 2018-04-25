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
    url: 'http://server.ohradio.com.ar:9906/stream',
    radio: '9 de Julio 102.3 FM',
    title: 'Título de la nota'
});
```

## Licencia MIT

Por favor, consulte el [archivo de licencia](LICENSE.md) para obtener más información.

------

Desarrollado por [Felix Barros](https://twitter.com/soyFelixBarros)