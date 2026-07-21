import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import useUi from '../../../hooks/ui/useUi';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'Urdu',
  'Islamiyat',
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
  selectedValue: string;
  onSelect: (value: string) => void;
}

const ExpertiseModal = ({
  visible,
  onDismiss,
  selectedValue,
  onSelect,
}: Props) => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/* BACKDROP */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      />

      {/* MODAL */}
      <View style={styles.centeredView}>
        <View style={styles.modalContainer}>

          {/* ✅ HEADER WITH CROSS */}
          <View style={styles.header}>
            <Text style={styles.heading}>Select Expertise</Text>

            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {subjects.map(item => {
              const selected = selectedValue === item;

              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  style={[
                    styles.subjectCard,
                    selected && styles.selectedCard,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onDismiss();
                  }}
                >
                  <Text
                    style={[
                      styles.subjectText,
                      selected && styles.selectedText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

export default ExpertiseModal;
const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },

    centeredView: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },

    modalContainer: {
      width: '90%',
      maxHeight: '70%',
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dxy(20),
      padding: resp.dx(20),
      elevation: 10,
    },

    // ✅ HEADER ROW
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: resp.dy(15),
    },

    heading: {
      fontSize: resp.df(18),
      fontWeight: '700',
      color: colors.BLACK_COLOR,
    },

    // ✅ CLOSE BUTTON (CUSTOM CROSS)
    closeBtn: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
      backgroundColor: colors.PRIMARY_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
    },

    closeText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '700',
    //   lineHeight: 15,
    },

    subjectCard: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: resp.dxy(12),
      paddingVertical: resp.dy(16),
      paddingHorizontal: resp.dx(15),
      marginBottom: resp.dy(10),
      backgroundColor: colors.WHITE_COLOR,
    },

    selectedCard: {
      borderColor: '#1E4ED8',
      backgroundColor: '#EEF4FF',
    },

    subjectText: {
      fontSize: resp.df(14),
      color: colors.BLACK_COLOR,
      fontWeight: '500',
    },

    selectedText: {
      color: '#1E4ED8',
      fontWeight: '700',
    },
  });