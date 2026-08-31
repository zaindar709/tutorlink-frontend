// Lazy-require `react-native-webrtc` at runtime so the app can surface
// a friendly error when the native module is not installed or linked.
let _webrtc: any | null = null;
const getWebRTC = () => {
  if (_webrtc) return _webrtc;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    _webrtc = require('react-native-webrtc');
    return _webrtc;
  } catch (err) {
    // Native module missing. In development, return a lightweight JS shim
    // so the app UI can run without a native rebuild. The shim does NOT
    // provide real media or peer connectivity — it's only for local UI testing.
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const devShim = {
        mediaDevices: {
          async getUserMedia(_opts: any) {
            // Return a minimal fake MediaStream-like object
            return {
              getVideoTracks() {
                return [];
              },
              getAudioTracks() {
                return [];
              },
              getTracks() {
                return [];
              },
            };
          },
        },
        RTCPeerConnection: class {
          onicecandidate: any = null;
          ontrack: any = null;
          onconnectionstatechange: any = null;
          oniceconnectionstatechange: any = null;
          onnegotiationneeded: any = null;
          localDescription: any = null;
          constructor(_opts: any) {
            // no-op
          }
          addTrack() {}
          async createOffer() {
            return { type: 'offer', sdp: '' };
          }
          async setLocalDescription(_d: any) {
            this.localDescription = _d;
          }
          async createAnswer() {
            return { type: 'answer', sdp: '' };
          }
          async setRemoteDescription(_d: any) {
            // no-op
          }
          async addIceCandidate() {}
          async getStats() {
            return new Map();
          }
          getSenders() {
            return [];
          }
          close() {}
          restartIce() {}
        },
        RTCIceCandidate: function (c: any) {
          return c;
        },
        RTCSessionDescription: function (d: any) {
          return d;
        },
      };
      _webrtc = devShim as any;
      return _webrtc;
    }

    // Keep _webrtc as null to indicate module missing in production.
    _webrtc = null;
    return null;
  }
};
import InCallManager from 'react-native-incall-manager';
import { ICE_SERVERS, WEBRTC_CONSTRAINTS } from '../../constants/webrtc';
import type { ConnectionQuality } from '../../types/webrtc.types';

// Type aliases used when `react-native-webrtc` types are not available at
// compile time (we resolve the actual constructors at runtime).
type MediaStream = any;
type RTCPeerConnection = any;
type RTCIceCandidate = any;
type RTCSessionDescription = any;
type RTCSessionDescriptionInit = any;
type RTCIceCandidateInit = any;

type AnyTrack = {
  kind: string;
  id: string;
  enabled: boolean;
  stop: () => void;
  onended?: (() => void) | null;
  _switchCamera?: () => void;
};

type PeerListener = {
  onLocalStream?: (stream: MediaStream | null) => void;
  onRemoteStream?: (stream: MediaStream | null) => void;
  onConnectionState?: (state: string) => void;
  onIceConnectionState?: (state: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onNegotiationNeeded?: () => void;
  onQuality?: (quality: ConnectionQuality) => void;
  onError?: (message: string) => void;
};

/**
 * Low-level WebRTC peer manager for TutorLink 1:1 classroom sessions.
 * Handles media, ICE, screen-share track replacement, and stats-based quality.
 */
class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private cameraVideoTrack: AnyTrack | null = null;
  private screenStream: MediaStream | null = null;
  private listeners: PeerListener = {};
  private qualityTimer: ReturnType<typeof setInterval> | null = null;
  private makingOffer = false;
  private polite = false;
  private ignoreOffer = false;

  setListeners(listeners: PeerListener) {
    this.listeners = listeners;
  }

  /** Polite peer answers glare; impolite peer creates the offer (tutor). */
  setPolite(polite: boolean) {
    this.polite = polite;
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  getPeerConnection() {
    return this.pc;
  }

  async initLocalMedia(audio = true, video = true): Promise<MediaStream> {
    const webrtc = getWebRTC();
    if (!webrtc || !webrtc.mediaDevices) {
      throw new Error(
        'WebRTC native module not found. Ensure react-native-webrtc is installed and the app was rebuilt.'
      );
    }

    const stream = (await webrtc.mediaDevices.getUserMedia({
      audio: audio ? WEBRTC_CONSTRAINTS.audio : false,
      video: video ? WEBRTC_CONSTRAINTS.video : false,
    })) as unknown as MediaStream;

    this.localStream = stream;
    const videoTrack = stream.getVideoTracks()[0] as unknown as
      | AnyTrack
      | undefined;
    this.cameraVideoTrack = videoTrack || null;
    this.listeners.onLocalStream?.(stream);

    try {
      InCallManager.start({ media: 'video' });
      InCallManager.setForceSpeakerphoneOn(true);
    } catch {
      // non-fatal on unsupported platforms
    }

    return stream;
  }

  createPeerConnection(): RTCPeerConnection {
    if (this.pc) {
      return this.pc;
    }

    const webrtc = getWebRTC();
    if (!webrtc || !webrtc.RTCPeerConnection) {
      throw new Error(
        'WebRTC native module not found. Ensure react-native-webrtc is installed and the app was rebuilt.'
      );
    }

    const pc = new webrtc.RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 4,
    });

    this.pc = pc;

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        // react-native-webrtc addTrack typing is loose across versions
        (pc as any).addTrack(track, this.localStream);
      });
    }

    (pc as any).onicecandidate = (event: { candidate: RTCIceCandidate | null }) => {
      if (event.candidate) {
        this.listeners.onIceCandidate?.(event.candidate);
      }
    };

    (pc as any).ontrack = (event: { streams: MediaStream[] }) => {
      const [stream] = event.streams;
      if (stream) {
        this.remoteStream = stream;
        this.listeners.onRemoteStream?.(stream);
      }
    };

    (pc as any).onconnectionstatechange = () => {
      const state = (pc as any).connectionState as string;
      this.listeners.onConnectionState?.(state);
      if (state === 'connected') {
        this.startQualityMonitor();
      }
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        this.stopQualityMonitor();
      }
    };

    (pc as any).oniceconnectionstatechange = () => {
      const iceState = (pc as any).iceConnectionState as string;
      this.listeners.onIceConnectionState?.(iceState);
      if (iceState === 'failed') {
        this.listeners.onError?.('ICE connection failed. Trying to reconnect…');
        void this.restartIce();
      }
    };

    (pc as any).onnegotiationneeded = () => {
      this.listeners.onNegotiationNeeded?.();
    };

    return pc;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const pc = this.createPeerConnection();
    this.makingOffer = true;
    try {
      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);
      const local = pc.localDescription;
      return {
        type: (local?.type as RTCSessionDescriptionInit['type']) || 'offer',
        sdp: local?.sdp || undefined,
      };
    } finally {
      this.makingOffer = false;
    }
  }

  async handleRemoteOffer(
    sdp: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | null> {
    const pc = this.createPeerConnection();
    const offerCollision =
      this.makingOffer || (pc as any).signalingState !== 'stable';

    this.ignoreOffer = !this.polite && offerCollision;
    if (this.ignoreOffer) {
      return null;
    }

    const webrtc = getWebRTC();
    await pc.setRemoteDescription(new webrtc.RTCSessionDescription(sdp as never));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    const local = pc.localDescription;
    return {
      type: (local?.type as RTCSessionDescriptionInit['type']) || 'answer',
      sdp: local?.sdp || undefined,
    };
  }

  async handleRemoteAnswer(sdp: RTCSessionDescriptionInit) {
    const pc = this.pc;
    if (!pc) return;
    if ((pc as any).signalingState === 'have-local-offer') {
      const webrtc = getWebRTC();
      await pc.setRemoteDescription(new webrtc.RTCSessionDescription(sdp as never));
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    const pc = this.pc;
    if (!pc || !candidate?.candidate) return;
    try {
      const webrtc = getWebRTC();
      await pc.addIceCandidate(new webrtc.RTCIceCandidate(candidate as never));
    } catch (err) {
      if (!this.ignoreOffer) {
        console.warn('[WebRTC] addIceCandidate failed', err);
      }
    }
  }

  async setMicEnabled(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach(track => {
      (track as unknown as AnyTrack).enabled = enabled;
    });
  }

  async setCameraEnabled(enabled: boolean) {
    if (this.screenStream) return;
    this.localStream?.getVideoTracks().forEach(track => {
      (track as unknown as AnyTrack).enabled = enabled;
    });
  }

  async switchCamera() {
    if (this.screenStream) return;
    const videoTrack = this.localStream?.getVideoTracks()[0] as unknown as
      | AnyTrack
      | undefined;
    if (videoTrack && typeof videoTrack._switchCamera === 'function') {
      videoTrack._switchCamera();
    }
  }

  setSpeakerOn(on: boolean) {
    try {
      InCallManager.setForceSpeakerphoneOn(on);
    } catch {
      // ignore
    }
  }

  /**
   * Tutor-only screen share via Android MediaProjection (getDisplayMedia).
   * Replaces the outbound camera track; student receives the screen automatically.
   */
  async startScreenShare(): Promise<boolean> {
    if (!this.pc) {
      this.listeners.onError?.('Peer connection not ready for screen share');
      return false;
    }

    try {
      const webrtc = getWebRTC();
      if (!webrtc || !webrtc.mediaDevices) {
        this.listeners.onError?.(
          'WebRTC native module not found. Screen sharing unavailable.'
        );
        return false;
      }

      const getDisplayMedia = (
        webrtc.mediaDevices as unknown as {
          getDisplayMedia?: (c: object) => Promise<MediaStream>;
        }
      ).getDisplayMedia;

      if (typeof getDisplayMedia !== 'function') {
        this.listeners.onError?.(
          'Screen sharing is not supported on this device yet.'
        );
        return false;
      }

      const displayStream = (await getDisplayMedia.call(webrtc.mediaDevices, {
        video: true,
        audio: false,
      })) as unknown as MediaStream;

      const screenTrack = displayStream.getVideoTracks()[0] as unknown as
        | AnyTrack
        | undefined;
      if (!screenTrack) {
        this.listeners.onError?.('Could not capture screen track');
        return false;
      }

      this.screenStream = displayStream;
      const sender = (this.pc as any)
        .getSenders()
        .find((s: { track?: AnyTrack | null }) => s.track && s.track.kind === 'video');

      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      if (this.localStream) {
        const oldVideo = this.localStream.getVideoTracks()[0];
        if (oldVideo) {
          (this.localStream as any).removeTrack(oldVideo);
        }
        (this.localStream as any).addTrack(screenTrack);
        this.listeners.onLocalStream?.(this.localStream);
      }

      screenTrack.onended = () => {
        void this.stopScreenShare();
      };

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Screen share permission denied';
      this.listeners.onError?.(message);
      return false;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.pc) return;

    const cameraTrack = this.cameraVideoTrack;
    const sender = (this.pc as any)
      .getSenders()
      .find((s: { track?: AnyTrack | null }) => s.track && s.track.kind === 'video');

    if (sender && cameraTrack) {
      await sender.replaceTrack(cameraTrack);
    }

    if (this.localStream && cameraTrack) {
      const currentVideo = this.localStream.getVideoTracks()[0] as unknown as
        | AnyTrack
        | undefined;
      if (currentVideo && currentVideo.id !== cameraTrack.id) {
        (this.localStream as any).removeTrack(currentVideo);
        (this.localStream as any).addTrack(cameraTrack);
      }
      this.listeners.onLocalStream?.(this.localStream);
    }

    this.screenStream?.getTracks().forEach(t => t.stop());
    this.screenStream = null;
  }

  isScreenSharing() {
    return Boolean(this.screenStream);
  }

  private async restartIce() {
    try {
      const pc = this.pc as any;
      if (!pc) return;
      if (typeof pc.restartIce === 'function') {
        pc.restartIce();
      }
    } catch (err) {
      console.warn('[WebRTC] restartIce failed', err);
    }
  }

  private startQualityMonitor() {
    this.stopQualityMonitor();
    this.qualityTimer = setInterval(() => {
      void this.sampleQuality();
    }, 4000);
  }

  private stopQualityMonitor() {
    if (this.qualityTimer) {
      clearInterval(this.qualityTimer);
      this.qualityTimer = null;
    }
  }

  private async sampleQuality() {
    const pc = this.pc;
    if (!pc) return;
    try {
      const stats = await pc.getStats();
      let packetsLost = 0;
      let packetsReceived = 0;
      let rtt = 0;

      stats.forEach((report: any) => {
        if (report.type === 'inbound-rtp' && typeof report.packetsLost === 'number') {
          packetsLost += report.packetsLost;
          packetsReceived += report.packetsReceived || 0;
        }
        if (report.type === 'candidate-pair' && report.currentRoundTripTime) {
          rtt = Math.max(rtt, report.currentRoundTripTime);
        }
      });

      const lossRate =
        packetsReceived + packetsLost > 0
          ? packetsLost / (packetsReceived + packetsLost)
          : 0;

      let quality: ConnectionQuality = 'excellent';
      if (lossRate > 0.08 || rtt > 0.4) quality = 'poor';
      else if (lossRate > 0.03 || rtt > 0.2) quality = 'good';

      this.listeners.onQuality?.(quality);
    } catch {
      // stats optional
    }
  }

  async cleanup() {
    this.stopQualityMonitor();
    await this.stopScreenShare().catch(() => undefined);

    this.localStream?.getTracks().forEach(track => track.stop());
    this.remoteStream?.getTracks().forEach(track => track.stop());
    this.localStream = null;
    this.remoteStream = null;
    this.cameraVideoTrack = null;

    if (this.pc) {
      try {
        this.pc.close();
      } catch {
        // ignore
      }
      this.pc = null;
    }

    try {
      InCallManager.stop();
    } catch {
      // ignore
    }

    this.listeners.onLocalStream?.(null);
    this.listeners.onRemoteStream?.(null);
  }
}

export const webrtcService = new WebRTCService();
export default webrtcService;

// Runtime diagnostic: report whether the native `react-native-webrtc` bindings are available.
export const getWebRTCInfo = () => {
  const webrtc = getWebRTC();
  return {
    present: Boolean(webrtc),
    hasMediaDevices: Boolean(webrtc && webrtc.mediaDevices),
    hasPeerConnection: Boolean(webrtc && webrtc.RTCPeerConnection),
  };
};
