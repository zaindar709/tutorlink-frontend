import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import useUi from '../../../../../hooks/ui/useUi';
import { GlassScreen, GlassHeader } from '../../../../../components/Glass';
import { GLASS } from '../../../../../theme/glass';
import { AppNotification } from '../../../../../types/notification.types';
import {
  clearNotificationInbox,
  deleteNotification,
  getNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotificationInbox,
} from '../../../../../services/notifications/notificationInboxStore';
import {
  handleNotificationNavigation,
  sendTestSystemNotification,
} from '../../../../../services/notifications/pushNotificationService';

const TYPE_LABEL: Record<string, string> = {
  chat: 'Chat',
  message: 'Message',
  booking: 'Booking',
  session: 'Session',
  schedule: 'Schedule',
  payment: 'Payment',
  reminder: 'Reminder',
  verification: 'Verification',
  request: 'Request',
  certificate: 'Certificate',
  welcome: 'Welcome',
  general: 'General',
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StudentNotificationInboxScreen = ({ navigation }: any) => {
  const { colors } = useUi();
  const styles = useMemo(() => createStyles(), []);

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await getNotificationInbox();
    setItems(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load().finally(() => setLoading(false));
    }, [load])
  );

  useEffect(() => subscribeNotificationInbox(() => void load()), [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onOpenItem = async (item: AppNotification) => {
    await markNotificationRead(item.id);
    handleNotificationNavigation({
      ...item.data,
      type: String(item.type),
      notificationId: item.id,
      title: item.title,
      body: item.body,
    });
  };

  const onDeleteItem = (item: AppNotification) => {
    Alert.alert('Delete notification?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void deleteNotification(item.id),
      },
    ]);
  };

  const onMarkAllRead = () => {
    void markAllNotificationsRead();
  };

  const onClearAll = () => {
    Alert.alert('Clear all notifications?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => void clearNotificationInbox(),
      },
    ]);
  };

  const onSendTest = async () => {
    await sendTestSystemNotification();
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      activeOpacity={0.85}
      onPress={() => void onOpenItem(item)}
      onLongPress={() => onDeleteItem(item)}
    >
      <View style={styles.cardTop}>
        {!item.read ? <View style={styles.unreadDot} /> : <View style={styles.readSpacer} />}
        <View style={styles.cardText}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.badge}>
              {TYPE_LABEL[String(item.type)] || String(item.type)}
            </Text>
          </View>
          <Text style={styles.cardBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.meta}>{formatTime(item.createdAt)}</Text>
        </View>
        <IconButton
          icon="delete-outline"
          size={18}
          onPress={() => onDeleteItem(item)}
          iconColor={GLASS.textMuted}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <GlassScreen scroll={false} contentStyle={styles.screen}>
      <GlassHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        right={
          <IconButton
            icon="refresh"
            size={20}
            onPress={() => void onRefresh()}
            iconColor={GLASS.primary}
            style={{ margin: 0 }}
          />
        }
      />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onMarkAllRead}>
          <Text style={styles.toolbarAction}>Mark all read</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => void onSendTest()}>
          <Text style={styles.toolbarAction}>Send test</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClearAll}>
          <Text style={[styles.toolbarAction, styles.toolbarDanger]}>Clear</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 24 }}
          color={colors.PRIMARY_COLOR as string}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={GLASS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon source="bell-off-outline" size={40} color={GLASS.textMuted} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyBody}>
                Push notifications from chat, bookings, and payments will appear
                here after they show on your device.
              </Text>
            </View>
          }
        />
      )}
    </GlassScreen>
  );
};

export default StudentNotificationInboxScreen;

const createStyles = () =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 0,
    },
    toolbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: GLASS.space.lg,
      paddingVertical: GLASS.space.md,
      backgroundColor: GLASS.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: GLASS.cardBorder,
    },
    toolbarAction: {
      fontSize: 13,
      fontWeight: '600',
      color: GLASS.primary,
    },
    toolbarDanger: {
      color: GLASS.error,
    },
    list: {
      paddingHorizontal: GLASS.space.lg,
      paddingTop: GLASS.space.md,
      paddingBottom: GLASS.space.xxxl,
      flexGrow: 1,
    },
    card: {
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.lg,
      paddingVertical: 6,
      paddingLeft: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },
    cardUnread: {
      borderColor: GLASS.cardBorderStrong,
      backgroundColor: GLASS.cardBgStrong,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: GLASS.primary,
      marginTop: 14,
      marginRight: 8,
    },
    readSpacer: {
      width: 8,
      marginRight: 8,
      marginTop: 14,
    },
    cardText: {
      flex: 1,
      paddingVertical: 8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    cardTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: GLASS.textPrimary,
    },
    badge: {
      fontSize: 10,
      fontWeight: '700',
      color: GLASS.primary,
      textTransform: 'uppercase',
      backgroundColor: GLASS.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      overflow: 'hidden',
    },
    cardBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: GLASS.textSecondary,
    },
    meta: {
      marginTop: 6,
      fontSize: 11,
      color: GLASS.textMuted,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 48,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: '700',
      color: GLASS.textPrimary,
    },
    emptyBody: {
      marginTop: 8,
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 20,
      color: GLASS.textSecondary,
    },
  });
