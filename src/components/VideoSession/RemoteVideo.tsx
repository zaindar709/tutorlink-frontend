import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';
import LinearGradient from 'react-native-linear-gradient';
import { CLASSROOM_BRAND } from '../../constants/webrtc';

type Props = {
  stream: MediaStream | null;
  peerName?: string;
  peerAvatar?: string;
  isScreenShare?: boolean;
  placeholderLabel?: string;
};

const RemoteVideo = ({
  stream,
  peerName,
  peerAvatar,
  isScreenShare,
  placeholderLabel = 'Waiting for video…',
}: Props) => {
  const streamURL = stream ? (stream as unknown as { toURL: () => string }).toURL() : null;

  return (
    <View style={styles.wrap}>
      {streamURL ? (
        <RTCView
          streamURL={streamURL}
          style={styles.video}
          objectFit={isScreenShare ? 'contain' : 'cover'}
          mirror={false}
        />
      ) : (
        <LinearGradient
          colors={['#0B1B3A', '#0F2A5C', '#001A4D']}
          style={styles.placeholder}
        >
          {peerAvatar ? (
            <Image source={{ uri: peerAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>
                {(peerName || 'T').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.placeholderTitle}>{peerName || 'Peer'}</Text>
          <Text style={styles.placeholderSub}>{placeholderLabel}</Text>
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0B1220',
    shadowColor: '#0066FF',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0B1220',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: 16,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: CLASSROOM_BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },
  placeholderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  placeholderSub: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    fontSize: 14,
  },
});

export default RemoteVideo;
