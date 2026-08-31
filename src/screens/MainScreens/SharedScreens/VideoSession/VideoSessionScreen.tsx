import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useWebRTC } from '../../../../hooks/useWebRTC';
import { getWebRTCInfo } from '../../../../services/webrtc/webrtcService';
import {
  CallControls,
  ConnectionIndicator,
  JoinSessionCard,
  LocalVideo,
  RemoteVideo,
  SessionChatSheet,
  SessionTimer,
  TutorInfoCard,
} from '../../../../components/VideoSession';
import { CALL_STATE_LABELS, CLASSROOM_BRAND } from '../../../../constants/webrtc';
import type { VideoSessionParams } from '../../../../types/webrtc.types';
import { leaveHomeStackToTabs } from '../../../../navigation/navigationRef';
import { useAppDispatch } from '../../../../store/hooks';
import { endSessionSummaryThunk } from '../../../../store/summary/summarySlice';
import { ensureSummarySocket } from '../../../../services/summaries/summarySocket';
import { openRateTutorModal } from '../../../../store/rating/ratingSlice';

type Route = RouteProp<{ VideoSessionScreen: VideoSessionParams }, 'VideoSessionScreen'>;

const VideoSessionScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const params = route.params;
  const dispatch = useAppDispatch();

  const [hasJoined, setHasJoined] = useState(Boolean(params.autoStart));
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const seenChatCountRef = React.useRef(0);
  const autoStartedRef = React.useRef(false);

  const webrtc = useWebRTC(params, { autoJoin: false });

  const headerPeer = useMemo(() => {
    // Student sees tutor; tutor sees student — both use params.peer
    return params.peer;
  }, [params.peer]);

  const stateLabel =
    params.role === 'student' && webrtc.callState === 'waiting_for_peer'
      ? 'Waiting for Tutor…'
      : params.role === 'tutor' && webrtc.callState === 'waiting_for_peer'
        ? 'Waiting for Student…'
        : CALL_STATE_LABELS[webrtc.callState] || webrtc.callState;

  const handleJoin = async () => {
    setHasJoined(true);
    await webrtc.join();
  };

  React.useEffect(() => {
    if (!params.autoStart || autoStartedRef.current) return;
    autoStartedRef.current = true;
    void handleJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishClassAndOpenSummaryFlow = async () => {
    // Capture in-class chat as caption chunks before leaving (preferred FYP path without STT).
    const chunks = webrtc.chatMessages
      .map(m => ({
        text: String(m.text || '').trim(),
        at: m.createdAt,
        speaker: m.name || m.userId,
      }))
      .filter(c => c.text.length > 0);

    await webrtc.leave();
    void ensureSummarySocket();
    // Backend owns AI — FE only notifies session end then shows processing UI.
    void dispatch(
      endSessionSummaryThunk({
        sessionId: params.sessionId,
        payload: {
          reason: 'call_ended',
          endedBy: params.role,
          ...(chunks.length ? { chunks } : {}),
        },
      })
    );

    // Student: open Rate Your Tutor modal (Redux) before/with summary flow.
    if (params.role === 'student') {
      dispatch(
        openRateTutorModal({
          bookingId: params.bookingId || params.sessionId,
          sessionId: params.sessionId,
          tutorId: params.peer?.userId || 'tutor',
          tutorName: params.peer?.name || 'Tutor',
          subject: params.subject || '',
          studentName: params.self?.name,
        })
      );
    }

    navigation.replace('SessionSummaryProcessingScreen', {
      sessionId: params.sessionId,
      bookingId: params.bookingId,
      role: params.role,
    });
  };

  const handleLeave = () => {
    Alert.alert('End class?', 'Ending will prepare your AI learning summary.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'End class',
        style: 'destructive',
        onPress: () => {
          void finishClassAndOpenSummaryFlow();
        },
      },
    ]);
  };

  const handleBack = () => {
    if (hasJoined && webrtc.callState !== 'ended' && webrtc.callState !== 'idle') {
      handleLeave();
      return;
    }
    if (navigation.canGoBack()) navigation.goBack();
    else leaveHomeStackToTabs('Home');
  };

  const openChat = () => {
    setChatOpen(true);
    setUnreadChat(0);
    seenChatCountRef.current = webrtc.chatMessages.length;
  };

  React.useEffect(() => {
    const count = webrtc.chatMessages.length;
    if (chatOpen) {
      seenChatCountRef.current = count;
      return;
    }
    const unread = Math.max(0, count - seenChatCountRef.current);
    setUnreadChat(unread);
  }, [webrtc.chatMessages.length, chatOpen]);

  if (!hasJoined) {
    return (
      <LinearGradient
        colors={['#EEF5FF', '#F7FAFF', '#E8F1FF']}
        style={[styles.lobby, { paddingTop: insets.top + 12 }]}
      >
        <StatusBar barStyle="dark-content" />
        <Pressable style={styles.lobbyBack} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#0F172A" />
          <Text style={styles.lobbyBackText}>Back</Text>
        </Pressable>
        <Text style={styles.lobbyTitle}>Ready for class?</Text>
        <Text style={styles.lobbySub}>
          Join your private TutorLink classroom. Camera and mic are requested
          only when you join.
        </Text>
        <JoinSessionCard
          tutorName={params.peer.name}
          subject={params.subject}
          date={params.date}
          startTime={params.startTime}
          endTime={params.endTime}
          avatarUrl={params.peer.avatarUrl}
          verified={params.peer.verified ?? params.peer.role === 'tutor'}
          loading={webrtc.callState === 'requesting_permissions' || webrtc.callState === 'connecting'}
          error={webrtc.error}
          onJoin={() => void handleJoin()}
          onCancel={handleBack}
        />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#07111F', '#0B1B3A', '#061028']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <TutorInfoCard
          name={headerPeer.name}
          subject={params.subject}
          avatarUrl={headerPeer.avatarUrl}
          verified={headerPeer.verified ?? headerPeer.role === 'tutor'}
          roleLabel={headerPeer.role === 'tutor' ? 'Tutor' : 'Student'}
        />
        <View style={styles.headerRight}>
          <SessionTimer
            seconds={webrtc.elapsedSeconds}
            active={webrtc.callState === 'connected'}
          />
          <ConnectionIndicator
            quality={webrtc.connectionQuality}
            callStateLabel={stateLabel}
          />
          {__DEV__ ? (
            <Pressable
              style={{ marginLeft: 8 }}
              onPress={() => {
                const info = getWebRTCInfo();
                Alert.alert(
                  'WebRTC diagnostics',
                  `present: ${info.present}\nmediaDevices: ${info.hasMediaDevices}\nRTCPeerConnection: ${info.hasPeerConnection}`
                );
              }}
            >
              <MaterialCommunityIcons name="debug-step-over" size={18} color="#fff" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.stage}>
        <RemoteVideo
          stream={webrtc.remoteStream}
          peerName={headerPeer.name}
          peerAvatar={headerPeer.avatarUrl}
          isScreenShare={false}
          placeholderLabel={stateLabel}
        />
        <LocalVideo
          stream={webrtc.localStream}
          mutedVisual={!webrtc.isMicEnabled}
          cameraOff={!webrtc.isCameraEnabled && !webrtc.isScreenSharing}
        />

        {webrtc.error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{webrtc.error}</Text>
          </View>
        ) : null}

        {webrtc.callState === 'ended' ? (
          <View style={styles.endedOverlay}>
            <Text style={styles.endedTitle}>Call ended</Text>
            <Pressable style={styles.endedBtn} onPress={handleBack}>
              <Text style={styles.endedBtnText}>Back to home</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <CallControls
        isMicEnabled={webrtc.isMicEnabled}
        isCameraEnabled={webrtc.isCameraEnabled}
        isSpeakerOn={webrtc.isSpeakerOn}
        isScreenSharing={webrtc.isScreenSharing}
        showScreenShare={params.role === 'tutor'}
        unreadChat={unreadChat}
        onToggleMic={() => void webrtc.toggleMic()}
        onToggleCamera={() => void webrtc.toggleCamera()}
        onSwitchCamera={() => void webrtc.switchCamera()}
        onToggleSpeaker={webrtc.toggleSpeaker}
        onToggleScreenShare={() => {
          if (webrtc.isScreenSharing) void webrtc.stopScreenShare();
          else void webrtc.startScreenShare();
        }}
        onOpenChat={openChat}
        onEndCall={handleLeave}
      />

      <SessionChatSheet
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={webrtc.chatMessages}
        selfUserId={params.self.userId}
        onSend={webrtc.sendChatMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  lobby: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lobbyBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  lobbyBackText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  lobbyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  lobbySub: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    zIndex: 5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: CLASSROOM_BRAND.glassBorder,
  },
  headerRight: {
    gap: 6,
    alignItems: 'flex-end',
  },
  stage: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 118,
  },
  errorBanner: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(239,68,68,0.92)',
    borderRadius: 14,
    padding: 12,
  },
  errorText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  endedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,17,31,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  endedTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  endedBtn: {
    backgroundColor: CLASSROOM_BRAND.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  endedBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
});

export default VideoSessionScreen;
