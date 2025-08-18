const lame = require('node-lame');

const encoder = new lame.Lame({
    output: 'C:/Game/Kiwi farm/kiwi_game-/src/assets/audio/sfx/ui-click.mp3',
    bitrate: 128,
}).setFile('C:/Game/Kiwi farm/kiwi_game-/src/assets/audio/sfx/ui-click.wav');

encoder.encode()
    .then(() => {
        console.log('Conversion finished!');
    })
    .catch((error) => {
        console.log('Something went wrong');
        console.log(error);
    });
