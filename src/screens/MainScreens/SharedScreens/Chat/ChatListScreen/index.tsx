import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import useUi from '../../../../../hooks/ui/useUi';
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
    <>
      {filtered.some(c => c.pinned) ? (
        <Text
          style={{
            color: colors.TEXT_SECONDARY as string,
            fontSize: 12,
            fontWeight: '700',
            marginLeft: 20,
            marginBottom: 8,
            letterSpacing: 0.4,
          }}
        >
          PINNED
        </Text>
      ) : null}
      {filtered.length > 0 ? (
        <Text
          style={{
            color: colors.TEXT_SECONDARY as string,
            fontSize: 12,
            fontWeight: '700',
            marginLeft: 20,
            marginBottom: 8,
            marginTop: filtered.some(c => c.pinned) ? 4 : 0,
            letterSpacing: 0.4,
          }}
        >
          CONVERSATIONS
        </Text>
      ) : null}
    </>
  );

  const listFooter =
    isStudent ? (
      <View style={styles.tutorSection}>
        <Text
          style={{
            color: colors.TEXT_SECONDARY as string,
            fontSize: 12,
            fontWeight: '700',
            marginLeft: 4,
            marginBottom: 4,
            letterSpacing: 0.4,
          }}
        >
          AVAILABLE TUTORS
        </Text>
        <Text
          style={{
            color: colors.TEXT_SECONDARY as string,
            fontSize: resp.df(12),
            marginLeft: 4,
            marginBottom: 12,
          }}
        >
          Ask about slots before you hire
        </Text>

        {tutorsLoading && availableTutors.length === 0 ? (
          <ActivityIndicator color={colors.PRIMARY_COLOR as string} />
        ) : availableTutors.length === 0 ? (
          <Text
            style={{
              color: colors.TEXT_SECONDARY as string,
              fontSize: resp.df(13),
              marginLeft: 4,
            }}
          >
            No available tutors right now.
          </Text>
        ) : (
          availableTutors.map(tutor => {
            const userId = String(tutor.user?._id || tutor._id);
            const busy = startingTutorId === userId;
            return (
              <Pressable
                key={userId}
                onPress={() => void openTutorChat(tutor)}
                disabled={!!startingTutorId}
                style={[
                  styles.tutorCard,
                  {
                    backgroundColor: colors.CARD_COLOR as string,
                    borderColor: colors.BORDER_COLOR as string,
                  },
                ]}
              >
                <Image
                  source={{
                    uri: tutor.user?.avatarUrl || FALLBACK_AVATAR,
                  }}
                  style={styles.tutorAvatar}
                />
                <View style={styles.tutorBody}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.TEXT_PRIMARY as string,
                      fontSize: resp.df(15),
                      fontWeight: '700',
                    }}
                  >
                    {tutor.user?.name || 'Tutor'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.TEXT_SECONDARY as string,
                      fontSize: resp.df(12),
                      marginTop: 2,
                    }}
                  >
                    {(tutor.subjects || []).slice(0, 2).join(' · ') ||
                      'General'}
                    {tutor.hourlyRate != null
                      ? ` · Rs. ${tutor.hourlyRate}/hr`
                      : ''}
                  </Text>
                </View>
                {busy ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.PRIMARY_COLOR as string}
                  />
                ) : (
                  <View
                    style={[
                      styles.messageChip,
                      { backgroundColor: colors.LIGHT_PRIMARY as string },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="message-text-outline"
                      size={16}
                      color={colors.PRIMARY_COLOR as string}
                    />
                    <Text
                      style={{
                        color: colors.PRIMARY_COLOR as string,
                        fontWeight: '700',
                        fontSize: 12,
                        marginLeft: 4,
                      }}
                    >
                      Ask
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </View>
    ) : null;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.BACKGROUND as string,
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.BACKGROUND as string}
      />

      <View style={styles.header}>
        <View>
          <Text
            style={{
              color: colors.TEXT_PRIMARY as string,
              fontSize: resp.df(26),
              fontWeight: '800',
            }}
          >
            Messages
          </Text>
          <Text
            style={{
              color: colors.TEXT_SECONDARY as string,
              fontSize: resp.df(13),
              marginTop: 2,
            }}
          >
            {isStudent
              ? 'Chat before you hire — ask about open slots'
              : 'Stay connected with your students'}
          </Text>
        </View>
        <Pressable
          style={[
            styles.headerBtn,
            { backgroundColor: colors.LIGHT_PRIMARY as string },
          ]}
          onPress={() => void onRefresh()}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={20}
            color={colors.PRIMARY_COLOR as string}
          />
        </Pressable>
      </View>

      <View
        style={[
          styles.search,
          {
            backgroundColor: colors.CARD_COLOR as string,
            borderColor: colors.BORDER_COLOR as string,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.PLACEHOLDER_TEXTCOLOR as string}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={
            isStudent
              ? 'Search conversations or tutors…'
              : 'Search students, subjects…'
          }
          placeholderTextColor={colors.PLACEHOLDER_TEXTCOLOR as string}
          style={[
            styles.searchInput,
            { color: colors.TEXT_PRIMARY as string, fontSize: resp.df(14) },
          ]}
        />
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: '#DC2626' }]}>{error}</Text>
      ) : null}

      {loading && conversations.length === 0 && !isStudent ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color={colors.PRIMARY_COLOR as string}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={colors.PRIMARY_COLOR as string}
              colors={[colors.PRIMARY_COLOR as string]}
            />
          }
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            isStudent ? (
              <View style={{ height: 8 }} />
            ) : (
              <Animated.View entering={FadeIn} style={styles.empty}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: colors.PRIMARY_COLOR as string },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={32}
                    color="#fff"
                  />
                </View>
                <Text
                  style={{
                    color: colors.TEXT_PRIMARY as string,
                    fontSize: resp.df(18),
                    fontWeight: '800',
                    marginTop: 16,
                  }}
                >
                  No conversations yet
                </Text>
                <Text
                  style={{
                    color: colors.TEXT_SECONDARY as string,
                    fontSize: resp.df(13),
                    textAlign: 'center',
                    marginTop: 8,
                    lineHeight: 20,
                    paddingHorizontal: 32,
                  }}
                >
                  When students book you, conversations will show up here.
                </Text>
              </Animated.View>
            )
          }
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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
  },
  errorText: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tutorSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tutorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  tutorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  tutorBody: {
    flex: 1,
    marginHorizontal: 12,
  },
  messageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
});

export default ChatListScreen;
