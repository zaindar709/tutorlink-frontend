import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import useUi from '../../../../hooks/ui/useUi';
import ParentLinkCard from '../../../../components/Profile/ParentLinkCard/ParentLinkCard';
import MenuItemCard from '../../../../components/Profile/MenuItemCard/MenuItemCard';
import CustomButton from '../../../../components/CustomButton';
import { logout } from '../../../../store/auth/authSlice';
import { logoutUser } from '../../../../services/auth/authService';
import { useProfile } from '../../../../hooks/api/useProfile';

export default function ProfileScreen() {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { profile, loading, actionLoading, generateLinkCode } = useProfile();

  const header = profile?.header || profile;
  const displayName = header?.name || 'Student';
  const displayGrade = header?.grade || profile?.grade || 'Not set';
  const displayId = header?.publicId || profile?.publicId || '—';

  const menuItems = [
    {
      title: 'My Interests',
      description: 'Subjects and topics',
      icon: 'history',
      iconColor: '#f457b8',
    },
    {
      title: 'Certificates',
      description: 'Your achievements',
      icon: 'history',
      iconColor: '#3bbef6',
    },
    {
      title: 'Session History',
      description: 'Your past sessions',
      icon: 'history',
      iconColor: '#3B82F6',
    },
    {
      title: 'Notifications',
      description: 'Manage your alerts',
      icon: 'bell-outline',
      iconColor: '#F59E0B',
    },
    {
      title: 'Privacy & Security',
      description: 'Account protection',
      icon: 'shield-lock-outline',
      iconColor: '#10B981',
    },
    {
      title: 'App Settings',
      description: 'Preferences',
      icon: 'cog-outline',
      iconColor: '#8B5CF6',
    },
    {
      title: 'Help & Support',
      description: 'Get assistance',
      icon: 'help-circle-outline',
      iconColor: '#EF4444',
    },
    {
      title: 'Terms & Policies',
      description: 'Legal information',
      icon: 'file-document-outline',
      iconColor: '#06B6D4',
    },
  ];

  const handleGenerateCode = async () => {
    const codeData = await generateLinkCode();
    if (codeData) {
      Alert.alert(
        'Parent Link Code',
        `Share this code with your parent:\n\n${codeData.code}\n\nExpires in ${codeData.expiresInMinutes} minutes.`
      );
    }
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <Icon source="account-outline" size={38} color="#1D4ED8" />
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.classText}>{displayGrade}</Text>

          <View style={styles.studentCard}>
            <Text style={styles.studentLabel}>Student ID</Text>
            <Text style={styles.studentId}>{displayId}</Text>
          </View>
        </View>
      </View>

      <ParentLinkCard
        onGenerateCode={handleGenerateCode}
        loading={actionLoading}
      />

      <View style={styles.menuWrapper}>
        {menuItems.map((item, index) => (
          <MenuItemCard
            key={index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            iconColor={item.iconColor}
          />
        ))}
      </View>
      <View style={{ marginBottom: resp.dy(10), marginTop: resp.dy(10) }}>
        <CustomButton
          title="Logout"
          icon="logout"
          backgroundColor="#faeeee"
          textColor="#f99595"
          borderColor="#f4adad"
          borderWidth={0.5}
          iconPosition="left"
          onPress={async () => {
            await logoutUser();
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthNavigator' }],
            });
          }}
        />
      </View>
      <Text style={styles.version}>TUTORLINK V1.1.0 @ 2026</Text>
    </ScrollView>
  );
}

const createStyles = ({ colors, resp }: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      height: resp.dy(400),
      padding: resp.dx(16),
      paddingTop: resp.dy(40),
      backgroundColor: '#1D4ED8',
      borderBottomLeftRadius: resp.dx(20),
      borderBottomRightRadius: resp.dx(20),
    },
    headerTitle: {
      color: '#fff',
      fontSize: resp.df(18),
      fontWeight: '700',
      marginBottom: resp.dy(10),
    },
    profileBox: {
      alignItems: 'center',
      marginTop: resp.dy(10),
    },
    avatar: {
      width: resp.dx(80),
      height: resp.dx(80),
      borderRadius: resp.dx(40),
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: resp.dy(10),
    },
    name: {
      color: '#fff',
      fontSize: resp.df(18),
      fontWeight: '700',
    },
    classText: {
      color: '#DBEAFE',
      fontSize: resp.df(13),
      marginBottom: resp.dy(10),
    },
    studentCard: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: resp.dx(10),
      borderRadius: resp.dx(12),
      alignItems: 'center',
      marginTop: resp.dy(10),
    },
    studentLabel: {
      color: '#DBEAFE',
      fontSize: resp.df(12),
    },
    studentId: {
      color: '#fff',
      fontSize: resp.df(16),
      fontWeight: '700',
    },
    menuWrapper: {
      paddingHorizontal: resp.dx(16),
      marginTop: resp.dy(10),
    },
    version: {
      textAlign: 'center',
      color: '#94A3B8',
      fontSize: resp.df(12),
      marginBottom: resp.dy(30),
    },
  });
