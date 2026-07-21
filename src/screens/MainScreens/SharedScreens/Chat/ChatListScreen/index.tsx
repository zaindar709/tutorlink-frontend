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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import useUi from '../../../../../hooks/ui/useUi';
import { ChatCard } from '../../../../../components/Chat';
import {
  ChatConversation,
  MOCK_CONVERSATIONS,
} from '../../../../../constants/chatMockData';

const ChatListScreen = () => {
  const { colors, resp } = useUi();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<ChatConversation[]>(MOCK_CONVERSATIONS);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = chats.filter(c => !c.archived);
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
  }, [chats, query]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  const togglePin = (id: string) => {
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const archiveChat = (id: string) => {
    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, archived: true } : c))
    );
  };

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
            Stay connected with your tutors
          </Text>
        </View>
        <Pressable
          style={[
            styles.headerBtn,
            { backgroundColor: colors.LIGHT_PRIMARY as string },
          ]}
        >
          <MaterialCommunityIcons
            name="filter-variant"
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
          placeholder="Search tutors, subjects…"
          placeholderTextColor={colors.PLACEHOLDER_TEXTCOLOR as string}
          style={[
            styles.searchInput,
            { color: colors.TEXT_PRIMARY as string, fontSize: resp.df(14) },
          ]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.PRIMARY_COLOR as string}
            colors={[colors.PRIMARY_COLOR as string]}
          />
        }
        ListHeaderComponent={
          filtered.some(c => c.pinned) ? (
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
          ) : null
        }
        ListEmptyComponent={
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
              Book a verified tutor and start chatting about sessions, homework,
              and progress.
            </Text>
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <ChatCard
            item={item}
            index={index}
            onPress={() =>
              navigation.navigate('HomeNavigator', {
                screen: 'ChatScreen',
                params: { chatId: item.id },
              })
            }
            onPin={() => togglePin(item.id)}
            onArchive={() => archiveChat(item.id)}
          />
        )}
      />

      <Pressable
        style={[styles.fabWrap, { bottom: 24 + insets.bottom }]}
        onPress={() =>
          navigation.navigate('HomeNavigator', {
            screen: 'ChatScreen',
            params: { chatId: 'c1' },
          })
        }
      >
        <View
          style={[
            styles.fab,
            { backgroundColor: colors.PRIMARY_COLOR as string },
          ]}
        >
          <MaterialCommunityIcons name="message-plus" size={24} color="#fff" />
          <Text style={styles.fabText}>New Chat</Text>
        </View>
      </Pressable>
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
  fabWrap: {
    position: 'absolute',
    right: 20,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    height: 54,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#7548F5',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  fabText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default ChatListScreen;
