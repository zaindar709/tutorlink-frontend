import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';
import CustomInput from '../CustomInput/CustomInput';
import CustomButton from '../CustomButton';
import { useBookings } from '../../hooks/api/useBookings';
import { TutorProfile } from '../../types/api.types';
import { formatDateParam } from '../../utils/api/userId';

interface BookTutorModalProps {
  visible: boolean;
  tutor: TutorProfile | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const BookTutorModal: React.FC<BookTutorModalProps> = ({
  visible,
  tutor,
  onClose,
  onSuccess,
}) => {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const { createBooking, actionLoading } = useBookings('active');

  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('2:00 PM');
  const [endTime, setEndTime] = useState('3:00 PM');

  const tutorUserId = tutor?.user?._id || tutor?.user?.id;
  const tutorName = tutor?.user?.name || 'Tutor';
  const defaultSubject = (tutor?.subjects || [])[0] || 'General';

  const handleSubmit = async () => {
    if (!tutorUserId) {
      Alert.alert('Error', 'Tutor information is unavailable.');
      return;
    }

    const success = await createBooking({
      tutor: tutorUserId,
      subject: subject.trim() || defaultSubject,
      date: formatDateParam(new Date()),
      startTime,
      endTime,
    });

    if (success) {
      Alert.alert(
        'Request Sent',
        `Your request was saved for ${tutorName}. They can accept it from Requests — class will use ${startTime}–${endTime}.`
      );
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Book {tutorName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon source="close" size={22} color={colors.BLACK_COLOR as string} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Choose any preferred time. The tutor gets this on Requests and can
            accept — class then starts at that time.
          </Text>

          <CustomInput
            label="Subject"
            value={subject || defaultSubject}
            onChangeText={setSubject}
            placeholder={defaultSubject}
          />
          <CustomInput
            label="Start Time"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="2:00 PM"
          />
          <CustomInput
            label="End Time"
            value={endTime}
            onChangeText={setEndTime}
            placeholder="3:00 PM"
          />

          <CustomButton
            title="Send Booking Request"
            onPress={handleSubmit}
            loading={actionLoading}
            style={{ marginTop: resp.dy(12) }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default BookTutorModal;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.WHITE_COLOR,
      borderTopLeftRadius: resp.dx(24),
      borderTopRightRadius: resp.dx(24),
      padding: resp.dx(20),
      paddingBottom: resp.dy(32),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: resp.dy(8),
    },
    title: {
      fontSize: resp.df(18),
      fontWeight: '700',
      color: colors.BLACK_COLOR,
    },
    subtitle: {
      fontSize: resp.df(13),
      color: colors.LIGHT_GRAY,
      marginBottom: resp.dy(16),
    },
  });
