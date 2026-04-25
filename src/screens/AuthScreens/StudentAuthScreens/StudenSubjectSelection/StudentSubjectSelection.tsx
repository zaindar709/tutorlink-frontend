import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Chip, Menu, TextInput, IconButton } from 'react-native-paper';
import useUi from '../../../../hooks/ui/useUi';
import CustomButton from '../../../../components/CustomButton';
import { subjectOptions } from '../../../../constants/SubjectSelection.data';

const classOptions = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];

const StudentSubjectSelection = () => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<any>(null);

  const filteredSubjects = useMemo(
    () =>
      subjectOptions.filter(subject =>
        subject.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(item => item !== subject)
        : [...prev, subject],
    );
  };

  const selectedLabel =
    selectedSubjects.length === 0
      ? 'No subjects selected'
      : `${selectedSubjects.length} subject${selectedSubjects.length > 1 ? 's' : ''} selected`;

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <TouchableWithoutFeedback onPress={() => searchInputRef.current?.blur()}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>What do you want to learn?</Text>
          <Text style={styles.subtitle}>Select subjects that interest you</Text>
        </View>

        <TextInput
          ref={searchInputRef}
          mode="outlined"
          placeholder="Search subjects"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchField}
          theme={{
            colors: {
              primary: colors.PRIMARY_COLOR as string,
            },
          }}
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchQuery ? (
              <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} />
            ) : undefined
          }
        />

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
                    isSelected ? styles.subjectTextSelected : styles.subjectText
                  }
                  selectedColor={colors.WHITE_COLOR as string}
                >
                  {subject}
                </Chip>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No subjects match your search.</Text>
          )}
        </View>

        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>{selectedLabel}</Text>
        </View>
      </View>

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

        <CustomButton
          title="Continue"
          onPress={() => console.log('Continue with', selectedClass, selectedSubjects)}
          disabled={selectedSubjects.length === 0}
          style={styles.button}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default StudentSubjectSelection;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    screen: {
      flexGrow: 1,
      padding: resp.dx(24),
      backgroundColor: colors.BACKGROUND || '#F8FAFF',
    },
    header: {
      marginBottom: resp.dy(24),
    },
    title: {
      fontSize: resp.df(24),
      fontWeight: '700',
      color: colors.TEXT_PRIMARY || '#111827',
      marginBottom: resp.dy(8),
    },
    subtitle: {
      fontSize: resp.df(15),
      lineHeight: resp.dy(22),
      color: colors.TEXT_SECONDARY || '#6B7280',
    },
    searchField: {
      marginBottom: resp.dy(20),
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dxy(14),
    },
    card: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dxy(24),
      padding: resp.dx(20),
      marginBottom: resp.dy(24),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: resp.dx(12),
      justifyContent: 'space-between',
    },
    subjectChip: {
      minWidth: resp.dx(140),
      marginBottom: resp.dy(12),
      borderColor: colors.GRAY_COLOR || '#D1D5DB',
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dxy(18),
      height: resp.dy(44),
      justifyContent: 'center',
      alignContent: 'center',
    },
    subjectChipSelected: {
      backgroundColor: colors.PRIMARY_COLOR,
      borderColor: colors.PRIMARY_COLOR,
    },
    subjectText: {
      color: colors.TEXT_PRIMARY || '#111827',
      fontSize: resp.df(14),
    },
    subjectTextSelected: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(14),
      fontWeight: '600',
    },
    selectionInfo: {
      marginTop: resp.dy(16),
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      paddingTop: resp.dy(16),
    },
    selectionText: {
      color: colors.TEXT_SECONDARY || '#6B7280',
      fontSize: resp.df(13),
    },
    classCard: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dxy(24),
      padding: resp.dx(20),
      marginBottom: resp.dy(24),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
      overflow: 'visible',
    },
    classCardTitle: {
      fontSize: resp.df(16),
      fontWeight: '700',
      color: colors.TEXT_PRIMARY || '#111827',
      marginBottom: resp.dy(12),
    },
    classTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: resp.dy(14),
      paddingHorizontal: resp.dx(16),
      borderWidth: 1,
      borderColor: colors.GRAY_COLOR || '#D1D5DB',
      borderRadius: resp.dxy(18),
      backgroundColor: colors.BACKGROUND || '#F8FAFF',
    },
    classTriggerText: {
      color: colors.TEXT_PRIMARY || '#111827',
      fontSize: resp.df(15),
    },
    classTriggerPlaceholder: {
      color: colors.TEXT_SECONDARY || '#6B7280',
      fontSize: resp.df(15),
    },
    menuContainer: {
      width: '80%',
      backgroundColor: 'transparent',
      marginLeft: resp.dx(0),
    },
    menuContent: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dxy(18),
      elevation: 4,
    },
    menuIcon: {
      margin: 0,
    },
    menuItemText: {
      color: colors.TEXT_PRIMARY || '#111827',
      fontSize: resp.df(15),
    },
    emptyText: {
      width: '100%',
      textAlign: 'center',
      color: colors.TEXT_SECONDARY || '#6B7280',
      fontSize: resp.df(14),
      marginTop: resp.dy(12),
    },
    button: {
      marginBottom: resp.dy(16),
    },
  });
