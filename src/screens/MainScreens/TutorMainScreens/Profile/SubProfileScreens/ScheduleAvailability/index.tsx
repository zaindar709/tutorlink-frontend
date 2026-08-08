import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import useUi from '../../../../../../hooks/ui/useUi';
import DayAvailabilityCard from '../../../../../../components/Tutor/ScheduleAvailability/DayAvailabilityCard';
import { GlassScreen } from '../../../../../../components/Glass';
import { GLASS } from '../../../../../../theme/glass';
import { ProfileSubHeader } from '../../../../../../components/Profile';
import { useTutorAvailability } from '../../../../../../hooks/api/useTutorAvailability';
import {
  formatWindowLabel,
  parseWindowLabel,
  WORK_DAY_LABELS,
  WORK_DAYS,
} from '../../../../../../utils/schedule/scheduleHelpers';
import { WeekdayName } from '../../../../../../types/api.types';

type UiDay = {
  id: WeekdayName;
  day: string;
  status: string;
  slots: { id: string; time: string }[];
};

const dayStatus = (slots: { id: string; time: string }[]) =>
  slots.length ? 'Flexible hours' : 'No availability';

const buildUiDays = (
  apiDays?: { day: string; windows: { startTime: string; endTime: string }[] }[]
): UiDay[] => {
  const byDay = new Map(
    (apiDays || []).map(d => [String(d.day).toLowerCase(), d.windows || []])
  );

  return WORK_DAYS.map(day => {
    const windows = byDay.get(day) || [];
    const slots = windows.map((w, index) => ({
      id: `${day}-${index + 1}`,
      time: formatWindowLabel(w.startTime, w.endTime),
    }));
    return {
      id: day,
      day: WORK_DAY_LABELS[day],
      status: dayStatus(slots),
      slots,
    };
  });
};

const ScheduleAvailabilityScreen = () => {
  const { resp } = useUi();
  const styles = useMemo(() => createStyles(resp), [resp]);
  const navigation = useNavigation<any>();
  const { availability, loading, saving, error, refresh, save } =
    useTutorAvailability();
  const [days, setDays] = useState<UiDay[]>(() => buildUiDays());

  useEffect(() => {
    if (availability?.days) {
      setDays(buildUiDays(availability.days));
    }
  }, [availability]);

  const activeDays = days.filter(d => d.slots.length > 0).length;
  const totalSlots = days.reduce((n, d) => n + d.slots.length, 0);

  const handleAddSlot = (dayId: WeekdayName) => {
    setDays(current =>
      current.map(day => {
        if (day.id !== dayId) return day;
        const slotCount = day.slots.length;
        const nextSlot = {
          id: `${dayId}-${slotCount + 1}`,
          time:
            slotCount === 0
              ? '9:00 AM - 5:00 PM'
              : '2:00 PM - 5:00 PM',
        };
        const slots = [...day.slots, nextSlot];
        return {
          ...day,
          slots,
          status: dayStatus(slots),
        };
      })
    );
  };

  const handleRemoveSlot = (dayId: WeekdayName, slotId: string) => {
    setDays(current =>
      current.map(day => {
        if (day.id !== dayId) return day;
        const slots = day.slots.filter(slot => slot.id !== slotId);
        return {
          ...day,
          slots,
          status: dayStatus(slots),
        };
      })
    );
  };

  const saveSchedule = async () => {
    const payloadDays = days
      .map(day => {
        const windows = day.slots
          .map(slot => parseWindowLabel(slot.time))
          .filter((w): w is { startTime: string; endTime: string } =>
            Boolean(w)
          );
        return { day: day.id, windows };
      })
      .filter(d => d.windows.length > 0);

    try {
      await save(payloadDays);
      Alert.alert(
        'Schedule saved',
        'Your Mon–Fri availability is live. Free Time on Schedule will update.'
      );
    } catch (err) {
      Alert.alert(
        'Save failed',
        err instanceof Error ? err.message : 'Could not save availability.'
      );
    }
  };

  return (
    <GlassScreen
      scroll={false}
      edges={['top', 'left', 'right']}
      contentStyle={styles.screen}
    >
      <ProfileSubHeader
        navigation={navigation}
        title="Availability"
        showSaveButton
        onSave={() => void saveSchedule()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.intro}>
          Working days are Monday–Friday. Each window must be at least 90
          minutes. Defaults are 9:00 AM – 5:00 PM until you customize.
        </Text>

        {availability?.usingDefault ? (
          <View style={styles.defaultBanner}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={GLASS.primary}
            />
            <Text style={styles.defaultText}>
              Using default hours. Save to lock in your custom schedule.
            </Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color={GLASS.primary} style={{ marginVertical: 20 }} />
        ) : null}

        {error && !loading ? (
          <TouchableOpacity style={styles.errorCard} onPress={() => void refresh()}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retry}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#EEF2FF' }]}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={18}
                color={GLASS.primary}
              />
            </View>
            <Text style={styles.summaryValue}>{activeDays}</Text>
            <Text style={styles.summaryLabel}>Active days</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#ECFDF3' }]}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={GLASS.success}
              />
            </View>
            <Text style={styles.summaryValue}>{totalSlots}</Text>
            <Text style={styles.summaryLabel}>Windows</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={18}
                color={GLASS.warning}
              />
            </View>
            <Text style={styles.summaryValue}>
              {availability?.lectureSlotMinutes ?? 90}m
            </Text>
            <Text style={styles.summaryLabel}>Lecture</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Weekly hours · Mon–Fri</Text>

        {days.map(day => (
          <DayAvailabilityCard
            key={day.id}
            day={day.day}
            status={day.status}
            slots={day.slots}
            onAddSlot={() => handleAddSlot(day.id)}
            onRemoveSlot={slotId => handleRemoveSlot(day.id, slotId)}
          />
        ))}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => void saveSchedule()}
          style={styles.saveWrap}
          disabled={saving}
        >
          <LinearGradient
            colors={[...GLASS.buttonGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.saveText}>Save schedule</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Omitted days stay closed (no Free Time). After save, refresh Schedule
          to see updated free slots.
        </Text>
      </ScrollView>
    </GlassScreen>
  );
};

export default ScheduleAvailabilityScreen;

const createStyles = (resp: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: {
      paddingHorizontal: resp.dx(16),
      paddingTop: resp.dy(12),
      paddingBottom: resp.dy(36),
    },
    intro: {
      color: GLASS.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 14,
    },
    defaultBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: GLASS.primarySoft,
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
    },
    defaultText: {
      flex: 1,
      color: GLASS.primaryDeep,
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 17,
    },
    errorCard: {
      backgroundColor: '#FEF2F2',
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    errorText: { color: '#B91C1C', fontWeight: '600', fontSize: 13 },
    retry: { color: GLASS.primary, fontWeight: '700', marginTop: 6, fontSize: 12 },
    summaryRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 18,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: GLASS.cardBgStrong,
      borderRadius: GLASS.radius.lg,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      ...GLASS.shadow.soft,
    },
    summaryIcon: {
      width: 32,
      height: 32,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '800',
      color: GLASS.textPrimary,
    },
    summaryLabel: {
      marginTop: 2,
      fontSize: 11,
      color: GLASS.textSecondary,
      fontWeight: '600',
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: GLASS.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
    },
    saveWrap: {
      marginTop: 8,
      ...GLASS.shadow.medium,
    },
    saveBtn: {
      height: 52,
      borderRadius: GLASS.radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    saveText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
    helpText: {
      marginTop: 12,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 18,
      color: GLASS.textMuted,
    },
  });
