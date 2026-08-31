import { useCallback, useEffect, useRef, useState } from 'react';
import webrtcService from '../services/webrtc/webrtcService';
import {
  connectClassroomSocket,
  disconnectClassroomSocket,
  emitAnswer,
  emitCallEnded,
  emitConnectionQuality,
  emitIceCandidate,
  emitJoinClassroom,
  emitLeaveClassroom,
  emitOffer,
  emitScreenShareStarted,
  emitScreenShareStopped,
  emitSessionChat,
  emitToggleCamera,
  emitToggleMic,
} from '../services/webrtc/socketService';
import { CLASSROOM_ERROR_MESSAGES } from '../constants/webrtc';
import {
  requestClassroomPermissions,
  openAppPermissionSettings,
} from '../utils/webrtc/permissions';
import type {
  CallState,
  ConnectionQuality,
  JoinedClassroomPayload,
  SessionChatPayload,
  SessionErrorPayload,
  UseWebRTCResult,
  VideoSessionParams,
} from '../types/webrtc.types';
import type { MediaStream } from 'react-native-webrtc';

type Options = {
  autoJoin?: boolean;
};

const friendlyClassroomError = (err: SessionErrorPayload): string =>
  CLASSROOM_ERROR_MESSAGES[err.code] ||
  err.message ||
  'Classroom signaling error';

export const useWebRTC = (
  params: VideoSessionParams,
  options: Options = {}
): UseWebRTCResult => {
  const { autoJoin = false } = options;
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [connectionQuality, setConnectionQuality] =
    useState<ConnectionQuality>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chatMessages, setChatMessages] = useState<SessionChatPayload[]>([]);
  const [peerPresent, setPeerPresent] = useState(false);

  const joinedRef = useRef(false);
  const offerSentRef = useRef(false);
  const selfUserIdRef = useRef(params.self.userId);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectedAtRef = useRef<number | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  selfUserIdRef.current = params.self.userId;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    connectedAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (!connectedAtRef.current) return;
      setElapsedSeconds(
        Math.floor((Date.now() - connectedAtRef.current) / 1000)
      );
    }, 1000);
  }, []);

  const markConnected = useCallback(() => {
    setCallState('connected');
    setError(null);
    startTimer();
  }, [startTimer]);

  const leave = useCallback(async () => {
    const p = paramsRef.current;
    if (joinedRef.current) {
      emitLeaveClassroom({ sessionId: p.sessionId });
      emitCallEnded({
        sessionId: p.sessionId,
        endedBy: p.self.userId,
        reason: 'user_left',
      });
    }
    joinedRef.current = false;
    offerSentRef.current = false;
    stopTimer();
    setCallState('ended');
    setPeerPresent(false);
    setIsScreenSharing(false);
    await webrtcService.cleanup();
    disconnectClassroomSocket();
  }, [stopTimer]);

  const createAndSendOffer = useCallback(async () => {
    if (offerSentRef.current) return;
    const p = paramsRef.current;
    webrtcService.setPolite(p.role === 'student');
    webrtcService.createPeerConnection();
    const offer = await webrtcService.createOffer();
    offerSentRef.current = true;
    emitOffer({
      sessionId: p.sessionId,
      fromUserId: p.self.userId,
      sdp: offer,
    });
  }, []);

  const handleJoinedClassroom = useCallback(
    async (ack: JoinedClassroomPayload) => {
      const peers = ack.peers || [];
      const hasPeer = peers.length > 0;
      setPeerPresent(hasPeer);
      setCallState(hasPeer ? 'peer_joined' : 'waiting_for_peer');

      // Tutor is the offerer once the other participant is already in the room.
      if (ack.role === 'tutor' && hasPeer) {
        await createAndSendOffer();
      } else {
        webrtcService.createPeerConnection();
      }
    },
    [createAndSendOffer]
  );

  const handleClassroomError = useCallback((err: SessionErrorPayload) => {
    setError(friendlyClassroomError(err));
    if (
      err.code === 'SESSION_FORBIDDEN' ||
      err.code === 'SESSION_NOT_FOUND' ||
      err.code === 'SESSION_NOT_ACCEPTED' ||
      err.code === 'ROOM_FULL' ||
      err.code === 'AUTH_REQUIRED'
    ) {
      setCallState('failed');
    }
  }, []);

  const join = useCallback(async () => {
    if (joinedRef.current) return;
    setError(null);
    offerSentRef.current = false;
    setCallState('requesting_permissions');

    const perms = await requestClassroomPermissions();
    if (!perms.camera || !perms.microphone) {
      setCallState('failed');
      setError(perms.message || 'Camera and microphone are required');
      if (perms.deniedForever) {
        void openAppPermissionSettings();
      }
      return;
    }

    setCallState('connecting');

    try {
      const stream = await webrtcService.initLocalMedia(true, true);
      setLocalStream(stream);

      webrtcService.setListeners({
        onLocalStream: setLocalStream,
        onRemoteStream: streamRemote => {
          setRemoteStream(streamRemote);
          if (streamRemote) markConnected();
        },
        onIceCandidate: candidate => {
          const p = paramsRef.current;
          emitIceCandidate({
            sessionId: p.sessionId,
            fromUserId: p.self.userId,
            candidate: candidate
              ? {
                  candidate: candidate.candidate,
                  sdpMLineIndex: candidate.sdpMLineIndex,
                  sdpMid: candidate.sdpMid,
                }
              : null,
          });
        },
        onConnectionState: state => {
          if (state === 'connected') markConnected();
          if (state === 'connecting') setCallState('connecting');
          if (state === 'disconnected') setCallState('reconnecting');
          if (state === 'failed') {
            setCallState('failed');
            setError('WebRTC connection failed');
          }
        },
        onIceConnectionState: state => {
          if (state === 'disconnected' || state === 'checking') {
            setCallState(prev =>
              prev === 'connected' || prev === 'reconnecting'
                ? 'reconnecting'
                : prev
            );
          }
          if (state === 'failed') {
            setError('Network issue — ICE failed. Reconnecting…');
            setCallState('reconnecting');
          }
        },
        onQuality: quality => {
          setConnectionQuality(quality);
          const p = paramsRef.current;
          emitConnectionQuality({
            sessionId: p.sessionId,
            userId: p.self.userId,
            quality,
          });
        },
        onError: message => setError(message),
        onNegotiationNeeded: () => {
          const p = paramsRef.current;
          if (p.role === 'tutor' && joinedRef.current) {
            offerSentRef.current = false;
            void createAndSendOffer();
          }
        },
      });

      webrtcService.setPolite(paramsRef.current.role === 'student');

      const socket = await connectClassroomSocket({
        onConnect: () => {
          if (!joinedRef.current) return;
          const p = paramsRef.current;
          offerSentRef.current = false;
          emitJoinClassroom({ sessionId: p.sessionId });
          setCallState(prev =>
            prev === 'connected' ? 'reconnecting' : 'connecting'
          );
        },
        onDisconnect: () => {
          setCallState(prev =>
            prev === 'ended' || prev === 'failed' ? prev : 'reconnecting'
          );
        },
        onJoinedClassroom: payload => {
          void handleJoinedClassroom(payload);
        },
        onPeerJoined: payload => {
          if (payload.userId === selfUserIdRef.current) return;
          setPeerPresent(true);
          setCallState('peer_joined');
          // Tutor creates the offer when the student arrives.
          if (paramsRef.current.role === 'tutor') {
            void createAndSendOffer();
          }
        },
        onPeerLeft: () => {
          setPeerPresent(false);
          setRemoteStream(null);
          offerSentRef.current = false;
          setCallState('waiting_for_peer');
        },
        onOffer: async payload => {
          if (payload.fromUserId === selfUserIdRef.current) return;
          const answer = await webrtcService.handleRemoteOffer(payload.sdp);
          if (answer) {
            emitAnswer({
              sessionId: paramsRef.current.sessionId,
              fromUserId: paramsRef.current.self.userId,
              sdp: answer,
            });
          }
        },
        onAnswer: async payload => {
          if (payload.fromUserId === selfUserIdRef.current) return;
          await webrtcService.handleRemoteAnswer(payload.sdp);
        },
        onIceCandidate: async payload => {
          if (payload.fromUserId === selfUserIdRef.current) return;
          if (payload.candidate == null) return;
          await webrtcService.addIceCandidate(payload.candidate);
        },
        onCallEnded: () => {
          void leave();
        },
        onScreenShareStarted: () => {
          // Remote screen arrives via replaced track
        },
        onScreenShareStopped: () => {
          // Remote camera restored via renegotiation
        },
        onSessionChat: msg => {
          setChatMessages(prev => [...prev, msg]);
        },
        onClassroomError: handleClassroomError,
        onSessionError: handleClassroomError,
      });

      if (!socket) {
        setCallState('failed');
        setError('Unable to connect to classroom signaling');
        await webrtcService.cleanup();
        return;
      }

      const p = paramsRef.current;
      joinedRef.current = true;
      emitJoinClassroom({ sessionId: p.sessionId }, response => {
        if (!response) return;
        const asError = response as SessionErrorPayload;
        if (asError.success === false || (asError.code && !('peers' in response))) {
          handleClassroomError(asError);
          return;
        }
        void handleJoinedClassroom(response as JoinedClassroomPayload);
      });
      setCallState('waiting_for_peer');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start classroom media';
      setError(message);
      setCallState('failed');
      await webrtcService.cleanup();
    }
  }, [
    createAndSendOffer,
    handleClassroomError,
    handleJoinedClassroom,
    leave,
    markConnected,
  ]);

  const toggleMic = useCallback(async () => {
    const next = !isMicEnabled;
    await webrtcService.setMicEnabled(next);
    setIsMicEnabled(next);
    emitToggleMic({
      sessionId: params.sessionId,
      userId: params.self.userId,
      enabled: next,
    });
  }, [isMicEnabled, params.sessionId, params.self.userId]);

  const toggleCamera = useCallback(async () => {
    const next = !isCameraEnabled;
    await webrtcService.setCameraEnabled(next);
    setIsCameraEnabled(next);
    emitToggleCamera({
      sessionId: params.sessionId,
      userId: params.self.userId,
      enabled: next,
    });
  }, [isCameraEnabled, params.sessionId, params.self.userId]);

  const switchCamera = useCallback(async () => {
    await webrtcService.switchCamera();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  const toggleSpeaker = useCallback(() => {
    const next = !isSpeakerOn;
    webrtcService.setSpeakerOn(next);
    setIsSpeakerOn(next);
  }, [isSpeakerOn]);

  const startScreenShare = useCallback(async () => {
    if (params.role !== 'tutor') {
      setError('Only tutors can share their screen');
      return;
    }
    const ok = await webrtcService.startScreenShare();
    if (ok) {
      setIsScreenSharing(true);
      emitScreenShareStarted({
        sessionId: params.sessionId,
        userId: params.self.userId,
      });
    }
  }, [params.role, params.sessionId, params.self.userId]);

  const stopScreenShare = useCallback(async () => {
    await webrtcService.stopScreenShare();
    setIsScreenSharing(false);
    emitScreenShareStopped({
      sessionId: params.sessionId,
      userId: params.self.userId,
    });
  }, [params.sessionId, params.self.userId]);

  const sendChatMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const payload: SessionChatPayload = {
        sessionId: params.sessionId,
        userId: params.self.userId,
        name: params.self.name,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      emitSessionChat(payload);
      setChatMessages(prev => [...prev, payload]);
    },
    [params.sessionId, params.self.name, params.self.userId]
  );

  useEffect(() => {
    if (autoJoin) {
      void join();
    }
    return () => {
      stopTimer();
      if (joinedRef.current) {
        emitLeaveClassroom({ sessionId: paramsRef.current.sessionId });
      }
      void webrtcService.cleanup();
      disconnectClassroomSocket();
      joinedRef.current = false;
      offerSentRef.current = false;
    };
    // intentionally once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    isMicEnabled,
    isCameraEnabled,
    isSpeakerOn,
    isScreenSharing,
    facingMode,
    connectionQuality,
    error,
    elapsedSeconds,
    chatMessages,
    peerPresent,
    join,
    leave,
    toggleMic,
    toggleCamera,
    switchCamera,
    toggleSpeaker,
    startScreenShare,
    stopScreenShare,
    sendChatMessage,
  };
};

export default useWebRTC;
