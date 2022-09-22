const fs = require('fs');

// stream
const PassThrough = require('stream').PassThrough;
const performance = require('perf_hooks').performance;
const { RTCAudioSink, RTCVideoSink, RTCVideoSource, i420ToRgba, rgbaToI420 } =
  require('wrtc').nonstandard;

// ffmpeg
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const { StreamInput } = require('./fluent-ffmpeg-multistream.js');
ffmpeg.setFfmpegPath(ffmpegPath);

// composite
const { createCanvas, createImageData } = require('canvas');
const { hsv } = require('color-convert');
const width = 640;
const height = 480;

function beforeOffer(peerConnection) {
  const audioTransceiver = peerConnection.addTransceiver('audio');
  const videoTransceiver = peerConnection.addTransceiver('video');

  const audioSink = new RTCAudioSink(audioTransceiver.receiver.track);
  const videoSink = new RTCVideoSink(videoTransceiver.receiver.track);

  const streams = [];

  videoSink.addEventListener('frame', ({ frame: { width, height, data } }) => {
    const size = width + 'x' + height;
    if (!streams[0] || (streams[0] && streams[0].size !== size)) {
      UID++;

      const stream = {
        recordPath: './recording-' + size + '-' + UID + '.mp4',
        size,
        video: new PassThrough(),
        audio: new PassThrough(),
      };

      const onAudioData = ({ samples: { buffer } }) => {
        if (!stream.end) stream.audio.push(Buffer.from(buffer));
      };

      audioSink.addEventListener('data', onAudioData);

      stream.audio.on('end', () =>
        audioSink.removeEventListener('data', onAudioData)
      );

      streams.unshift(stream);

      streams.forEach((item) => {
        if (item !== stream && !item.end) {
          item.end = true;
          if (item.audio) item.audio.end();
          item.video.end();
        }
      });

      stream.proc = ffmpeg()
        .addInput(new StreamInput(stream.video).url)
        .addInputOptions([
          '-f',
          'rawvideo',
          '-pix_fmt',
          'yuv420p',
          '-s',
          stream.size,
          '-r',
          '30',
        ])
        .addInput(new StreamInput(stream.audio).url)
        .addInputOptions(['-f s16le', '-ar 48k', '-ac 1'])
        .on('start', () =>
          console.log('Start recording >> ', stream.recordPath)
        )
        .on('end', () => {
          stream.recordEnd = true;
          console.log('Stop recording >> ', stream.recordPath);
        })
        .size(VIDEO_OUTPUT_SIZE)
        .output(stream.recordPath);

      stream.proc.run();
    }

    streams[0].video.push(Buffer.from(data));
  });

  const { close } = peerConnection;

  peerConnection.close = function () {
    audioSink.stop();
    videoSink.stop();

    streams.forEach(({ audio, video, end, proc, recordPath }) => {
      if (!end) {
        if (audio) audio.end();
        video.end();
      }
    });

    let totalEnd = 0;
    const timer = setInterval(() => {
      streams.forEach((stream) => {
        if (stream.recordEnd) {
          totalEnd++;
          if (totalEnd === streams.length) {
            clearTimeout(timer);

            const mergeProc = ffmpeg()
              .on('start', () =>
                console.log('Merging Into' + VIDEO_OUTPUT_FILE)
              )
              .on('end', () => {
                streams.forEach(({ recordPath }) => fs.unlinkSync(recordPath));
                console.log('Merge Complete' + VIDEO_OUTPUT_FILE);
              });

            streams.forEach(({ recordPath }) => mergeProc.addInput(recordPath));

            mergeProc.output(VIDEO_OUTPUT_FILE).run();
          }
        }
      });
    }, 1000);

    return close.apply(this, arguments);
  };
}

module.exports = { beforeOffer };
