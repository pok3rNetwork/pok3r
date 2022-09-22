const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 13,
};

class Peer {
  constructor() {
    this.connection = new RTCPeerConnection(servers);
    this.videoFeed = null;
    this.remoteVideo = null;
    this.callInput = null;
  }

  // 1. setup media sources
  async setup() {
    let mediaOpts = { video: true, audio: true };
    let localStream = await navigator.mediaDevices.getUserMedia(mediaOpts);
    let remoteStream = new MediaStream();

    localStream.getTracks().forEach((track) => this.connection.addTrack(track));

    this.connection.ontrack = (event) => {
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteStream.addTrack(track));
    };
    this.videoFeed.srcObject = localStream;
    this.remoteVideo.srcObject = remoteStream;

    //   callButton.disabled = false;
    //   answerButton.disabled = false;
    //   webcamButton.disabled = true;
  }

  // 2. create offer & listen for answer (TODO: REMOVE FIREBASE)
  async offer() {
    // Reference Firestore collections for signaling
    const callDoc = firestore.collection('calls').doc();

    this.callInput.value = callDoc.id;
    const offerDescription = await this.connection.createOffer();
    await this.connection.setLocalDescription(offerDescription);

    await callDoc.set({
      offer: {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      },
    });

    // Get candidates for caller, save to db
    this.connection.onicecandidate = (event) =>
      event.candidate &&
      callDoc.collection('offerCandidates').add(event.candidate.toJSON());

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!this.connection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.connection.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    const answerCandidates = callDoc.collection('answerCandidates');
    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.connection.addIceCandidate(candidate);
        }
      });
    });

    // hangupButton.disabled = false;
  }

  // answer the call with unique ID (TODO: REMOVE FIREBASE)
  async answer() {
    const callId = this.callInput.value;
    const callDoc = firestore.collection('calls').doc(callId);
    const offerCandidates = callDoc.collection('offerCandidates');

    this.connection.onicecandidate = (event) =>
      event.candidate &&
      callDoc.collection('answerCandidates').add(event.candidate.toJSON());

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answerDescription);
    const answer = {
      sdp: answerDescription.sdp,
      type: answerDescription.type,
    };
    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === 'added') {
          let data = change.doc.data();
          this.connection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }
}
