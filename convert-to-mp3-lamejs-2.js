const fs = require('fs');
const vm = require('vm');
const WaveFile = require('wavefile').WaveFile;

// Read the lame.min.js file
const lamejs_script = fs.readFileSync('C:/Game/Kiwi farm/kiwi_game-/lame.min.js', 'utf8');

// Create a new context for the script
const context = { module: {} };
vm.runInNewContext(lamejs_script, context);
const lamejs = context.lamejs;

// Read the wav file
const wav_buffer = fs.readFileSync('C:/Game/Kiwi farm/kiwi_game-/src/assets/audio/sfx/ui-click.wav');
const wav = new WaveFile(wav_buffer);

// Get the raw audio samples
const samples = wav.getSamples();

// Encode the samples to mp3
const mp3encoder = new lamejs.Mp3Encoder(1, wav.fmt.sampleRate, 128);
const mp3Data = [];
const blockSize = 1152;
for (let i = 0; i < samples.length; i += blockSize) {
    const sampleChunk = samples.subarray(i, i + blockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
}
const mp3buf = mp3encoder.flush();
if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
}

// Write the mp3 file
fs.writeFileSync('C:/Game/Kiwi farm/kiwi_game-/src/assets/audio/sfx/ui-click.mp3', Buffer.concat(mp3Data));

console.log('Conversion finished!');