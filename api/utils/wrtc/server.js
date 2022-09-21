const { mount } = require('./lib/server/rest/connectionsapi');
const WebRtcConnectionManager = require('./lib/server/connections/webrtcconnectionmanager');
const cType = require('./connections.js');

const broadcaster = () => {
  return WebRtcConnectionManager.create(cType.broadcaster);
};
const viewer = () => {
  return WebRtcConnectionManager.create(cType.viewer);
};
const vodStream = () => {
  return WebRtcConnectionManager.create(cType.vodStream);
};
const compositeVideo = () => {
  return WebRtcConnectionManager.create(cType.compositeVideo);
};

const avLoopback = () => {
  return WebRtcConnectionManager.create(cType.avLoopback);
};
const dataChannelBufferLimits = () => {
  return WebRtcConnectionManager.create(cType.dataChannelBufferLimits);
};
const pitchDetector = () => {
  return WebRtcConnectionManager.create(cType.pitchDetector);
};
const pingPong = () => {
  return WebRtcConnectionManager.create(cType.pingPong);
};
const sineWaveBase = () => {
  return WebRtcConnectionManager.create(cType.sineWaveBase);
};
const sineWaveStereo = () => {
  return WebRtcConnectionManager.create(cType.sineWaveStereo);
};

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

  mount,
};
