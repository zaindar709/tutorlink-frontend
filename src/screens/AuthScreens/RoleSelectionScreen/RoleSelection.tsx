import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import RoleCard from '../../../components/RoleCard/RoleCard';
import CustomButton from '../../../components/CustomButton';

import { useRoleController } from '../../../controllers/roleController';
import useUi from '../../../ui/useUi';
import { roles } from '../../../constants/RoleSelection.data';


export default function RoleSelectionScreen({ navigation }: any) {
  const { selectedRole, setSelectedRole, handleContinue } =
    useRoleController(navigation);
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const renderRoleItem = useCallback(
    ({ item, index }: any) => (
      <Animated.View
        entering={FadeInDown.duration(400).delay(index * 80)}
      >
        <RoleCard
          role={item}
          isSelected={selectedRole === item.id}
          onSelect={() => setSelectedRole(item.id as any)}
        />
      </Animated.View>
    ),
    [selectedRole, setSelectedRole],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>TutorLink</Text>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>Tell us how you want to use app</Text>
      </View>
      <View style={{ marginTop: 0 }}>
        <FlatList
          data={roles}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          extraData={selectedRole}
          renderItem={renderRoleItem}
          initialNumToRender={roles.length}
          removeClippedSubviews={true}
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          title={!selectedRole ? 'Continue' : 'Continue →'}
          onPress={handleContinue}
          disabled={!selectedRole}
        />
      </View>
    </SafeAreaView>
  );
}
const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.WHITE_COLOR,
    },

    header: {
      padding: resp.dx(20),
    },

    logo: {
      fontSize: resp.df(26),
      color: colors.PRIMARY_COLOR,
      fontWeight: '700',
    },

    title: {
      fontSize: resp.df(20),
      marginTop: resp.dy(10),
      fontWeight: '600',
      color: colors.TEXT_PRIMARY || '#000',
    },

    subtitle: {
      color: colors.TEXT_SECONDARY || '#666',
      marginTop: resp.dy(4),
      fontSize: resp.df(14),
    },

    listContainer: {
      paddingHorizontal: resp.dx(20),
      paddingBottom: resp.dy(100),
    },

    buttonContainer: {
      padding: resp.dx(20),
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
  });
