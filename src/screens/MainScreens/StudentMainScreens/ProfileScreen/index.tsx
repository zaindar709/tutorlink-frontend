import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../../../hooks/ui/useUi';
import ParentLinkCard from '../../../../components/Profile/ParentLinkCard/ParentLinkCard';
import MenuItemCard from '../../../../components/Profile/MenuItemCard/MenuItemCard';
import CustomButton from '../../../../components/CustomButton';

export default function ProfileScreen() {
  const { colors, resp } = useUi();
  const styles = createStyles({ colors, resp });

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <Icon source="account-outline" size={38} color="#1D4ED8" />
          </View>

          <Text style={styles.name}>Zain</Text>
          <Text style={styles.classText}>Class 10</Text>

          <View style={styles.studentCard}>
            <Text style={styles.studentLabel}>Student ID</Text>
            <Text style={styles.studentId}>TL-9980</Text>
          </View>
        </View>
      </View>

      {/* OVERLAPPING PARENT CARD */}
      <ParentLinkCard />

      {/* MENU */}
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
          onPress={() => console.log('logout')}
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

    parentCard: {
      margin: resp.dx(16),
      padding: resp.dx(14),
      borderRadius: resp.dx(18),
      backgroundColor: '#10B981',
      flexDirection: 'row',
      alignItems: 'center',
    },

    parentIcon: {
      width: resp.dx(38),
      height: resp.dx(38),
      borderRadius: resp.dx(12),
      backgroundColor: 'rgba(255,255,255,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(10),
    },

    parentTitle: {
      color: '#fff',
      fontSize: resp.df(14),
      fontWeight: '700',
    },

    parentDesc: {
      color: '#E7FFF5',
      fontSize: resp.df(12),
    },

    parentBtn: {
      backgroundColor: '#fff',
      paddingHorizontal: resp.dx(10),
      paddingVertical: resp.dy(8),
      borderRadius: resp.dx(10),
    },

    parentBtnText: {
      color: '#059669',
      fontSize: resp.df(12),
      fontWeight: '700',
    },

    menuWrapper: {
      paddingHorizontal: resp.dx(16),
      marginTop: resp.dy(10),
    },

    menuCard: {
      backgroundColor: '#fff',
      padding: resp.dx(14),
      borderRadius: resp.dx(14),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: resp.dy(12),

      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },

    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    menuIcon: {
      width: resp.dx(34),
      height: resp.dx(34),
      borderRadius: resp.dx(10),
      backgroundColor: '#FEF3C7',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(10),
    },

    menuText: {
      color: '#0F172A',
      fontSize: resp.df(14),
      fontWeight: '600',
    },

    logoutBtn: {
      margin: resp.dx(16),
      backgroundColor: '#FEE2E2',
      borderWidth: 1,
      borderColor: '#EF4444',
      padding: resp.dx(14),
      borderRadius: resp.dx(14),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    logoutText: {
      color: '#EF4444',
      fontSize: resp.df(14),
      fontWeight: '700',
      marginLeft: resp.dx(8),
    },

    version: {
      textAlign: 'center',
      color: '#94A3B8',
      fontSize: resp.df(12),
      marginBottom: resp.dy(30),
    },
  });
