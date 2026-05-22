import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Chip, Menu, IconButton, Icon } from 'react-native-paper';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { subjectOptions } from '../../../../constants/SubjectSelection.data';
import { createStyles } from './styles';
import { useSubjectSelection } from './useSubjectSelection';
import BackButton from '../../../../components/BackButton/BackButton';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setRole } from '../../../../store/auth/authSlice';

const classOptions = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];

const StudentSubjectSelection = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const {
    selectedSubjects,
    selectedClass,
    searchQuery,
    filteredSubjects,
    selectedLabel,
    isButtonDisabled,
    setSearchQuery,
    setSelectedClass,
    toggleSubject,
  } = useSubjectSelection();

  const [menuVisible, setMenuVisible] = useState(false);
  const searchInputRef = useRef<any>(null);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <TouchableWithoutFeedback onPress={() => searchInputRef.current?.blur()}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={{ marginTop: resp.dy(12) }}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>What do you want to learn?</Text>
          <Text style={styles.subtitle}>Select subjects that interest you</Text>
        </View>

        {/* SEARCH */}
        <CustomInput
          ref={searchInputRef}
          placeholder="Search subjects"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchField}
          leftIcon={
            <Icon
              source="magnify"
              size={20}
              color={colors.PLACEHOLDER_TEXTCOLOR as string}
            />
          }
          rightIcon={
            searchQuery ? <Icon source="close" size={20} /> : undefined
          }
          onRightIconPress={() => setSearchQuery('')}
        />

        {/* SUBJECTS */}
        <View style={styles.card}>
          <View style={styles.chipGrid}>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(subject => {
                const isSelected = selectedSubjects.includes(subject);

                return (
                  <Chip
                    key={subject}
                    mode="outlined"
                    selected={isSelected}
                    onPress={() => toggleSubject(subject)}
                    style={[
                      styles.subjectChip,
                      isSelected && styles.subjectChipSelected,
                    ]}
                    textStyle={
                      isSelected
                        ? styles.subjectTextSelected
                        : styles.subjectText
                    }
                  >
                    {subject}
                  </Chip>
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                No subjects match your search.
              </Text>
            )}
          </View>

          <Text style={styles.selectionText}>{selectedLabel}</Text>
        </View>

        {/* CLASS SELECT */}
        <View style={styles.classCard}>
          <Text style={styles.classCardTitle}>Select a class</Text>

          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity style={styles.classTrigger} onPress={openMenu}>
                <Text
                  style={
                    selectedClass
                      ? styles.classTriggerText
                      : styles.classTriggerPlaceholder
                  }
                >
                  {selectedClass || 'Select a class'}
                </Text>

                <IconButton
                  icon={menuVisible ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  iconColor={colors.PLACEHOLDER_TEXTCOLOR as string}
                  style={styles.menuIcon}
                />
              </TouchableOpacity>
            }
            style={styles.menuContainer}
            contentStyle={styles.menuContent}
          >
            {classOptions.map(option => (
              <Menu.Item
                key={option}
                onPress={() => {
                  setSelectedClass(option);
                  closeMenu();
                }}
                title={option}
                titleStyle={styles.menuItemText}
              />
            ))}
          </Menu>
        </View>

        {/* BUTTON */}
        <CustomButton
          title="Finish & Explore"
          onPress={() => {
            dispatch(setRole('student'));
            navigation.replace('MyTabs', {
              screen: 'Home',
            });
          }}
          disabled={isButtonDisabled}
          textStyle={{ fontSize: 16 }}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default StudentSubjectSelection;
