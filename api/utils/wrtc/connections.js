const broadcaster = require('./connections/broadcaster');
const viewer = require('./connections/viewer');
const vodStream = require('./connections/vodStream');
// const compositeVideo = require('./connections/compositeVideo');
let compositeVideo;

const avLoopback = require('./connections/avLoopback');
const dataChannelBufferLimits = require('./connections/dataChannelBufferLimits');
const pitchDetector = require('./connections/pitchDetector');
const pingPong = require('./connections/pingPong');
const sineWaveStereo = require('./connections/sineWaveStereo');
const sineWaveBase = require('./connections/sineWave');

module.exports = {
  broadcaster,
  viewer,
  vodStream,
  compositeVideo,

  avLoopback,
  dataChannelBufferLimits,
  pitchDetector,
  pingPong,
  sineWaveBase,
  sineWaveStereo,
};
