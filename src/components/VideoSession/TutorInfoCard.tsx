import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CLASSROOM_BRAND } from '../../constants/webrtc';

type Props = {
  name: string;
  subject: string;
  avatarUrl?: string;
  verified?: boolean;
  roleLabel?: string;
};

const TutorInfoCard = ({
  name,
  subject,
  avatarUrl,
  verified = true,
  roleLabel = 'Tutor',
}: Props) => {
  return (
    <View style={styles.wrap}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.letter}>{name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.meta}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {verified ? (
            <MaterialCommunityIcons
              name="check-decagram"
              size={16}
              color={CLASSROOM_BRAND.primary}
            />
          ) : null}
        </View>
        <Text style={styles.subject} numberOfLines={1}>
          {subject}
        </Text>
        <Text style={styles.role}>{roleLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CLASSROOM_BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    maxWidth: '86%',
  },
  subject: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    marginTop: 1,
  },
  role: {
    color: CLASSROOM_BRAND.primary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

export default TutorInfoCard;
