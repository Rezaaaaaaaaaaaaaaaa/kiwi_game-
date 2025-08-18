const fs = require('fs');
const WaveFile = require('wavefile').WaveFile;

// Create a new wave file
let wav = new WaveFile();

// Create a short click sound
const duration = 0.05; // seconds
const sampleRate = 44100;
const numSamples = duration * sampleRate;
const samples = new Int16Array(numSamples);

for (let i = 0; i < numSamples; i++) {
  let x = i / numSamples;
  samples[i] = Math.sin(1.5 * Math.PI * x) * 32767 * Math.pow(1-x, 4);
}

// 16-bit mono audio at 44100 Hz
wav.fromScratch(1, 44100, '16', samples);

// Write the wave file to disk
fs.writeFileSync('C:/Game/Kiwi farm/kiwi_game-/src/assets/audio/sfx/ui-click.wav', wav.toBuffer());

console.log('ui-click.wav created successfully!');