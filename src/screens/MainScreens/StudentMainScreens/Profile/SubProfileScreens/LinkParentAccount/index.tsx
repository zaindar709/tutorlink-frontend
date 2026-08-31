import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { GlassScreen } from '../../../../../../components/Glass';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileEmptyState,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useProfile } from '../../../../../../hooks/api/useProfile';
import { parentDashboardShareHint } from '../../../../../../config/parentDashboard';
import {
  DemoParentLinkEntry,
  issueParentLinkForStudent,
} from '../../../../../../constants/parentLinkCodes';
import { getDisplayName } from '../../../../../../utils/api/bookingHelpers';

const buildShareMessage = (code: string, studentName: string) =>
  [
    'TutorLink — Parent link code',
    '',
    'Student: ' + studentName,
    'Code: ' + code,
    '',
    parentDashboardShareHint({ code, studentName }),
  ].join('\n');
export default function StudentLinkParentScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const authUser = useSelector((state: any) => state.auth.user);
  const {
    linkedParents,
    error,
    refreshLinkedParents,
    removeLinkedParent,
    actionLoading,
  } = useProfile();

  const cursorRef = useRef(0);
  const [entry, setEntry] = useState<DemoParentLinkEntry | null>(null);
  const studentName =
    getDisplayName(authUser) || entry?.studentName || 'Student';

  useEffect(() => {
    void refreshLinkedParents();
  }, [refreshLinkedParents]);

  const handleGenerate = () => {
    cursorRef.current += 1;
    const nameAtGenerate =
      getDisplayName(authUser) || String(studentName || '').trim() || 'Student';
    setEntry(
      issueParentLinkForStudent(nameAtGenerate, Date.now() + cursorRef.current)
    );
  };

  const handleShare = async () => {
    if (!entry?.code) return;
    const nameForShare = entry.studentName || studentName;
    try {
      await Share.share({
        message: buildShareMessage(entry.code, nameForShare),
        title: 'TutorLink parent link code',
      });
    } catch {
      Alert.alert('Share failed', 'Could not open the share sheet.');
    }
  };

  const handleUnlink = (id: string, name: string) => {
    Alert.alert('Unlink parent', 'Remove ' + name + ' from linked parents?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unlink',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const ok = await removeLinkedParent(id);
            if (!ok) {
              Alert.alert('Failed', error || 'Could not unlink parent.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <GlassScreen scroll={false} contentStyle={{ flex: 1 }}>
      <ProfileSubHeader navigation={navigation} title="Link Parent Account" />
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[styles.heroCard, { backgroundColor: colors.PRIMARY_COLOR }]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <MaterialCommunityIcons name="link-variant" size={22} color="#fff" />
            <Text
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: 16,
                marginLeft: 8,
              }}
            >
              Share progress with parents
            </Text>
          </View>
          <Text
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            Generate a demo code, share it, and your parent enters it on the
            web Parent Dashboard to see your name with a fresh progress start.
          </Text>
        </View>

        <ProfileSectionCard title="Generate link code">
          {entry ? (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '700' }}>
                Student
              </Text>
              <Text
                style={{
                  color: '#0F172A',
                  fontWeight: '800',
                  fontSize: 15,
                  marginTop: 4,
                }}
              >
                {entry.studentName || studentName}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  letterSpacing: 1,
                  color: colors.PRIMARY_COLOR,
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                {entry.code}
              </Text>
              <TouchableOpacity
                onPress={() => void handleShare()}
                style={{
                  marginTop: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.LIGHT_PRIMARY,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                }}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={18}
                  color={colors.PRIMARY_COLOR}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    color: colors.PRIMARY_COLOR,
                    fontWeight: '700',
                  }}
                >
                  Share code
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ProfileEmptyState
              icon="link-plus"
              title="No active code"
              message="Tap Generate to create a shareable parent link code."
            />
          )}

          <TouchableOpacity
            onPress={handleGenerate}
            style={{
              marginTop: 12,
              backgroundColor: colors.PRIMARY_COLOR,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {entry ? 'Generate new code' : 'Generate code'}
            </Text>
          </TouchableOpacity>
        </ProfileSectionCard>

        <Text style={styles.sectionLabel}>How it works</Text>
        {[
          { step: '1', text: 'Tap Generate code above' },
          { step: '2', text: 'Share the code with your parent' },
          {
            step: '3',
            text: 'Parent opens web Parent Dashboard and enters the code',
          },
          {
            step: '4',
            text: 'Parent sees your name with progress starting at 0%',
          },
        ].map(item => (
          <View
            key={item.step}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.LIGHT_PRIMARY,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Text style={{ color: colors.PRIMARY_COLOR, fontWeight: '700' }}>
                {item.step}
              </Text>
            </View>
            <Text style={{ flex: 1, color: '#475569', fontSize: 13 }}>
              {item.text}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
          Linked parents
        </Text>
        {linkedParents.length === 0 ? (
          <ProfileSectionCard>
            <ProfileEmptyState
              icon="account-group-outline"
              title="No parents linked yet"
              message="After a parent redeems your code on the web, they can appear here."
            />
          </ProfileSectionCard>
        ) : (
          linkedParents.map(parent => (
            <ProfileSectionCard key={parent.id}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>
                    {parent.name}
                  </Text>
                  {parent.email ? (
                    <Text
                      style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}
                    >
                      {parent.email}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  disabled={actionLoading}
                  onPress={() => handleUnlink(parent.id, parent.name)}
                >
                  <Text style={{ color: '#DC2626', fontWeight: '700' }}>
                    Unlink
                  </Text>
                </TouchableOpacity>
              </View>
            </ProfileSectionCard>
          ))
        )}
      </ScrollView>
    </GlassScreen>
  );
}
