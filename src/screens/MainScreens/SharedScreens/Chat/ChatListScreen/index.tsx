import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useUi from '../../../../../hooks/ui/useUi';
import { GlassScreen, GlassSearchBar } from '../../../../../components/Glass';
import { GLASS } from '../../../../../theme/glass';
import { ChatCard } from '../../../../../components/Chat';
import { useChatConversations } from '../../../../../hooks/api/useChatConversations';
import { useTutorSearch } from '../../../../../hooks/api/useTutorSearch';
import { ChatConversation } from '../../../../../types/chat.types';
import { TutorProfile } from '../../../../../types/api.types';
import { getApiErrorMessage } from '../../../../../utils/api/errorHandler';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?u=tutor';

const ChatListScreen = () => {
  const { colors, resp } = useUi();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const role = useSelector((state: any) => state.auth.role as string | null);
  const isStudent = role === 'student';
  const [query, setQuery] = useState('');
  const [startingTutorId, setStartingTutorId] = useState<string | null>(null);

  const {
    conversations,
    loading,
    refreshing,
    error,
    refresh,
    startConversation,
    togglePinLocal,
    archiveLocal,
  } = useChatConversations();

  const {
    tutors,
    loading: tutorsLoading,
    search: searchTutors,
  } = useTutorSearch({}, { autoLoad: true });

  const unreadTotal = useMemo(
    () =>
      conversations
        .filter(c => !c.archived)
        .reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = conversations.filter(c => !c.archived);
    const pinned = list.filter(c => c.pinned);
    const rest = list.filter(c => !c.pinned);
    const merged = [...pinned, ...rest];
    if (!q) return merged;
    return merged.filter(
      c =>
        c.participant.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const existingPeerIds = useMemo(
    () => new Set(conversations.map(c => c.participant.id).filter(Boolean)),
    [conversations]
  );

  const availableTutors = useMemo(() => {
    if (!isStudent) return [];
    const q = query.trim().toLowerCase();
    return tutors
      .filter(tutor => {
        const userId = String(tutor.user?._id || '');
        if (!userId || existingPeerIds.has(userId)) return false;
        if (!q) return true;
        const name = String(tutor.user?.name || '').toLowerCase();
        const subjects = (tutor.subjects || []).join(' ').toLowerCase();
        return name.includes(q) || subjects.includes(q);
      })
      .slice(0, 20);
  }, [existingPeerIds, isStudent, query, tutors]);

  const openChat = useCallback(
    (chat: ChatConversation) => {
      navigation.navigate('HomeNavigator', {
        screen: 'ChatScreen',
        params: {
          chatId: chat.id,
          bookingId: chat.bookingId,
          peerId: chat.participant.id,
          peerName: chat.participant.name,
          peerAvatar: chat.participant.avatar,
          subject: chat.subject,
          isOnline: chat.participant.isOnline,
          isVerified: chat.participant.isVerified,
          lastSeen: chat.participant.lastSeen,
        },
      });
    },
    [navigation]
  );

  const openTutorChat = useCallback(
    async (tutor: TutorProfile) => {
      const participantId = String(tutor.user?._id || '');
      if (!participantId) {
        Alert.alert('Unavailable', 'This tutor cannot be messaged yet.');
        return;
      }

      const subject = tutor.subjects?.[0] || 'General';
      const peerName = tutor.user?.name || 'Tutor';
      const peerAvatar = tutor.user?.avatarUrl || FALLBACK_AVATAR;

      setStartingTutorId(participantId);
      try {
        const conversation = await startConversation({
          participantId,
          tutorId: participantId,
          tutorProfileId: tutor._id,
          subject,
          peerName,
          peerAvatar,
          isVerified: tutor.isVerified,
        });
        openChat({
          ...conversation,
          participant: {
            ...conversation.participant,
            name: conversation.participant.name || peerName,
            avatar: conversation.participant.avatar || peerAvatar,
            isVerified:
              conversation.participant.isVerified ?? tutor.isVerified,
          },
          subject: conversation.subject || subject,
        });
      } catch (err) {
        Alert.alert(
          'Chat unavailable',
          getApiErrorMessage(err, 'Could not start chat with this tutor.')
        );
      } finally {
        setStartingTutorId(null);
      }
    },
    [openChat, startConversation]
  );

  const onRefresh = useCallback(async () => {
    await refresh();
    if (isStudent) {
      await searchTutors({}, { replace: true });
    }
  }, [isStudent, refresh, searchTutors]);

  const listHeader = (
    <View style={styles.listTop}>
      {isStudent && (availableTutors.length > 0 || tutorsLoading) ? (
        <View style={styles.tutorStrip}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Start a chat</Text>
            <Text style={styles.sectionMeta}>Ask before you hire</Text>
          </View>

          {tutorsLoading && availableTutors.length === 0 ? (
            <ActivityIndicator
              color={colors.PRIMARY_COLOR as string}
              style={{ marginVertical: 12 }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tutorScroll}
            >
              {availableTutors.map(tutor => {
                const userId = String(tutor.user?._id || tutor._id);
                const busy = startingTutorId === userId;
                const subject = (tutor.subjects || [])[0] || 'General';
                return (
                  <Pressable
                    key={userId}
                    onPress={() => void openTutorChat(tutor)}
                    disabled={!!startingTutorId}
                    style={styles.tutorChip}
                  >
                    <View style={styles.tutorAvatarWrap}>
                      <Image
                        source={{
                          uri: tutor.user?.avatarUrl || FALLBACK_AVATAR,
                        }}
                        style={styles.tutorAvatar}
                      />
                      {busy ? (
                        <View style={styles.tutorBusy}>
                          <ActivityIndicator size="small" color="#fff" />
                        </View>
                      ) : (
                        <View style={styles.tutorMsgFab}>
                          <MaterialCommunityIcons
                            name="message-plus"
                            size={12}
                            color="#fff"
                          />
                        </View>
                      )}
                    </View>
                    <Text numberOfLines={1} style={styles.tutorName}>
                      {tutor.user?.name || 'Tutor'}
                    </Text>
                    <Text numberOfLines={1} style={styles.tutorSubject}>
                      {subject}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      ) : null}

      {filtered.length > 0 ? (
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Chats</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{filtered.length}</Text>
          </View>
        </View>
      ) : null}
      {filtered.length > 0 ? <View style={styles.chatsDivider} /> : null}
    </View>
  );

  const emptyStudent = (
    <Animated.View entering={FadeIn} style={styles.empty}>
      <LinearGradient
        colors={[...GLASS.buttonGradient]}
        style={styles.emptyIcon}
      >
        <MaterialCommunityIcons
          name="message-text-outline"
          size={30}
          color="#fff"
        />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { fontSize: resp.df(18) }]}>
        No chats yet
      </Text>
      <Text style={[styles.emptyBody, { fontSize: resp.df(13) }]}>
        Pick a tutor above to ask about availability, or search by name and
        subject.
      </Text>
    </Animated.View>
  );

  const emptyTutor = (
    <Animated.View entering={FadeIn} style={styles.empty}>
      <LinearGradient
        colors={[...GLASS.buttonGradient]}
        style={styles.emptyIcon}
      >
        <MaterialCommunityIcons
          name="account-group-outline"
          size={30}
          color="#fff"
        />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { fontSize: resp.df(18) }]}>
        Waiting for students
      </Text>
      <Text style={[styles.emptyBody, { fontSize: resp.df(13) }]}>
        When students message you before or after a booking, their chats will
        appear here.
      </Text>
    </Animated.View>
  );

  return (
    <GlassScreen scroll={false} edges={['bottom']} contentStyle={styles.screen}>
      <LinearGradient
        colors={['#8B6CF6', '#7548F5', '#5B2FD6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: Math.max(insets.top, 10) + 6 }]}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={[styles.heroTitle, { fontSize: resp.df(24) }]}>
              Messages
            </Text>
            <Text style={[styles.heroSubtitle, { fontSize: resp.df(13) }]}>
              {isStudent
                ? 'Chat with tutors before you hire'
                : 'Stay close to your students'}
            </Text>
          </View>

          <View style={styles.heroActions}>
            {unreadTotal > 0 ? (
              <View style={styles.unreadPill}>
                <Text style={styles.unreadPillText}>
                  {unreadTotal > 99 ? '99+' : unreadTotal} new
                </Text>
              </View>
            ) : null}
            <Pressable style={styles.refreshBtn} onPress={() => void onRefresh()}>
              <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        <GlassSearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={
            isStudent
              ? 'Search chats or tutors…'
              : 'Search students or subjects…'
          }
          style={styles.search}
        />
      </LinearGradient>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && conversations.length === 0 && !isStudent ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color={colors.PRIMARY_COLOR as string}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={colors.PRIMARY_COLOR as string}
              colors={[colors.PRIMARY_COLOR as string]}
            />
          }
          ListHeaderComponent={listHeader}
          ListEmptyComponent={isStudent ? emptyStudent : emptyTutor}
          renderItem={({ item, index }) => (
            <ChatCard
              item={item}
              index={index}
              onPress={() => openChat(item)}
              onPin={() => togglePinLocal(item.id)}
              onArchive={() => archiveLocal(item.id)}
            />
          )}
        />
      )}
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: GLASS.space.lg,
    paddingBottom: 18,
    borderBottomLeftRadius: GLASS.radius.xxl,
    borderBottomRightRadius: GLASS.radius.xxl,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroText: {
    flex: 1,
    marginRight: 12,
  },
  heroTitle: {
    color: '#fff',
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
    lineHeight: 18,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  unreadPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  search: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  listContent: {
    paddingHorizontal: GLASS.space.md,
    paddingTop: 10,
    paddingBottom: 120,
  },
  listTop: {
    marginBottom: 2,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  chatsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(148, 163, 184, 0.45)',
    width: '100%',
    marginBottom: 0,
  },
  sectionTitle: {
    color: GLASS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionMeta: {
    color: GLASS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  countPill: {
    minWidth: 24,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.primarySoft,
  },
  countPillText: {
    color: GLASS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  tutorStrip: {
    marginBottom: 18,
  },
  tutorScroll: {
    paddingRight: 8,
    gap: 12,
  },
  tutorChip: {
    width: 92,
    alignItems: 'center',
  },
  tutorAvatarWrap: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  tutorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: GLASS.primarySoft,
    backgroundColor: '#fff',
  },
  tutorBusy: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    backgroundColor: 'rgba(117,72,245,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorMsgFab: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GLASS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f6f7fc',
  },
  tutorName: {
    color: GLASS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  tutorSubject: {
    color: GLASS.textSecondary,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    marginHorizontal: GLASS.space.lg,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: GLASS.textPrimary,
    fontWeight: '800',
    marginTop: 16,
  },
  emptyBody: {
    color: GLASS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ChatListScreen;
