import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileSubHeader,
  ProfileSectionCard,
  ProfileEmptyState,
  createProfileSubScreenStyles,
} from '../../../../../../components/Profile';
import useUi from '../../../../../../hooks/ui/useUi';
import { useProfile } from '../../../../../../hooks/api/useProfile';

export default function StudentLinkParentScreen({ navigation }: any) {
  const { colors } = useUi();
  const styles = useMemo(() => createProfileSubScreenStyles(colors), [colors]);
  const {
    linkCode,
    linkedParents,
    actionLoading,
    error,
    generateLinkCode,
    refreshLinkedParents,
    removeLinkedParent,
  } = useProfile();

  const [code, setCode] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(20);

  useEffect(() => {
    void refreshLinkedParents();
  }, [refreshLinkedParents]);

  useEffect(() => {
    if (!linkCode) return;
    setCode(linkCode.code);
    setExpiresIn(linkCode.expiresInMinutes || 20);
  }, [linkCode]);

  const handleGenerate = async () => {
    const result = await generateLinkCode();
    if (!result) {
      Alert.alert('Failed', error || 'Could not generate link code.');
      return;
    }
    setCode(result.code);
    setExpiresIn(result.expiresInMinutes || 20);
  };

  const handleCopy = () => {
    if (!code) return;
    Alert.alert('Your link code', code);
  };

  const handleUnlink = (id: string, name: string) => {
    Alert.alert('Unlink parent', `Remove ${name} from linked parents?`, [
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
    <SafeAreaView style={styles.container}>
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
            Generate a one-time code. Your parent enters it in their TutorLink
            app to link your account.
          </Text>
        </View>

        <ProfileSectionCard title="Generate link code">
          {code ? (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  letterSpacing: 2,
                  color: colors.PRIMARY_COLOR,
                }}
              >
                {code}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 12, marginTop: 8 }}>
                Expires in {expiresIn} minutes
              </Text>
              <TouchableOpacity
                onPress={handleCopy}
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
                  name="content-copy"
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
                  Copy code
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ProfileEmptyState
              icon="link-plus"
              title="No active code"
              message="Generate a code to let your parent connect to your learning profile."
            />
          )}

          <TouchableOpacity
            onPress={() => void handleGenerate()}
            disabled={actionLoading}
            style={{
              marginTop: 12,
              backgroundColor: colors.PRIMARY_COLOR,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
            }}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                {code ? 'Generate new code' : 'Generate code'}
              </Text>
            )}
          </TouchableOpacity>
        </ProfileSectionCard>

        <Text style={styles.sectionLabel}>How it works</Text>
        {[
          { step: '1', text: 'Tap Generate code above' },
          { step: '2', text: 'Share the code with your parent' },
          {
            step: '3',
            text: 'Parent opens TutorLink → Link Student → enters code',
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
              title="No parents linked"
              message="Once a parent redeems your code, they will appear here."
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
    </SafeAreaView>
  );
}
