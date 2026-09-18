import React, { useEffect, useMemo, useState } from 'react';
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
import { parentDashboardShareHint, unusedCodeExpiryHint } from '../../../../../../config/parentDashboard';
import { getDisplayName } from '../../../../../../utils/api/bookingHelpers';
import { getUserId } from '../../../../../../utils/api/userId';

const buildShareMessage = (
  code: string,
  studentName: string,
  studentId?: string
) =>
  [
    'TutorLink — Parent link code',
    '',
    'Student: ' + studentName,
    'Code: ' + code,
    '',
    parentDashboardShareHint({ code, studentName, studentId }),
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
    generateLinkCode,
    actionLoading,
  } = useProfile();

  const [entry, setEntry] = useState<{
    code: string;
    studentName: string;
    studentId?: string;
    expiresInMinutes?: number;
  } | null>(null);
  const studentName =
    getDisplayName(authUser) || entry?.studentName || 'Student';
  const studentId = getUserId(authUser) || undefined;

  useEffect(() => {
    void refreshLinkedParents();
  }, [refreshLinkedParents]);

  const runGenerate = async () => {
    const nameAtGenerate =
      getDisplayName(authUser) || String(studentName || '').trim() || 'Student';
    const code = await generateLinkCode();
    if (!code?.code) {
      Alert.alert(
        'Could not generate code',
        error || 'Check your connection and try again.'
      );
      return;
    }
    setEntry({
      code: code.code,
      studentName: code.studentName || nameAtGenerate,
      studentId: code.studentId || studentId,
      expiresInMinutes: code.expiresInMinutes,
    });
  };

  const handleGenerate = () => {
    if (entry?.code) {
      Alert.alert(
        'Generate a new code?',
        'This will disconnect any parent using the current code.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Generate', onPress: () => void runGenerate() },
        ]
      );
      return;
    }
    void runGenerate();
  };

  const handleShare = async () => {
    if (!entry?.code) return;
    const nameForShare = entry.studentName || studentName;
    try {
      await Share.share({
        message: buildShareMessage(
          entry.code,
          nameForShare,
          entry.studentId || studentId
        ),
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
            Generate a code, share it, and your parent enters it on the
            web Parent Dashboard to see your name with a fresh progress start.
            Unused codes last 7 days. After a parent opens it, it stays valid
            until you generate a new one.
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
              <Text
                style={{
                  color: '#64748B',
                  fontSize: 12,
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                {unusedCodeExpiryHint(entry.expiresInMinutes)}
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
            disabled={actionLoading}
            style={{
              marginTop: 12,
              backgroundColor: colors.PRIMARY_COLOR,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {actionLoading
                ? 'Generating…'
                : entry
                  ? 'Generate new code'
                  : 'Generate code'}
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
            text: 'Parent sees your sessions and progress on the web dashboard',
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
