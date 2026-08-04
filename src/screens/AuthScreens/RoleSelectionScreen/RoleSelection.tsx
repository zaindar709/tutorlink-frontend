import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import RoleCard from '../../../components/RoleCard/RoleCard';
import { useRoleController } from '../../../controllers/roleController';
import { roles } from '../../../constants/RoleSelection.data';
import {
  AuthGlassBackground,
  GlassPrimaryButton,
  AUTH_GLASS,
} from '../../../components/AuthGlass';

export default function RoleSelectionScreen({ navigation }: any) {
  const { selectedRole, setSelectedRole, handleContinue } =
    useRoleController(navigation);

  const renderRoleItem = useCallback(
    ({ item }: any) => (
      <RoleCard
        role={item}
        isSelected={selectedRole === item.id}
        onSelect={() => setSelectedRole(item.id as any)}
      />
    ),
    [selectedRole, setSelectedRole],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.logo}>TutorLink</Text>
        <View style={styles.brandAccent} />
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>Tell us how you want to use the app</Text>
      </View>
    ),
    [],
  );

  return (
    <AuthGlassBackground scroll={false} contentStyle={styles.root}>
      <FlatList
        data={roles}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        extraData={selectedRole}
        renderItem={renderRoleItem}
        ListHeaderComponent={listHeader}
        initialNumToRender={roles.length}
        removeClippedSubviews={false}
      />

      <View style={styles.buttonContainer}>
        <GlassPrimaryButton
          title={!selectedRole ? 'Continue' : 'Continue →'}
          onPress={handleContinue}
          disabled={!selectedRole}
        />
      </View>
    </AuthGlassBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 28,
    color: AUTH_GLASS.primary as string,
    fontWeight: '800',
  },
  brandAccent: {
    width: 48,
    height: 3,
    borderRadius: 3,
    backgroundColor: AUTH_GLASS.primary as string,
    marginTop: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: AUTH_GLASS.title,
  },
  subtitle: {
    color: AUTH_GLASS.subtitle,
    marginTop: 6,
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    // Soft fade so cards don’t sit under a hard box
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
});
