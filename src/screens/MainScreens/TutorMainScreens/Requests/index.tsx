import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const requests = [
  {
    id: '1',
    name: 'Sarah Ahmed',
    subject: 'Organic Chemistry',
    board: 'O-Levels',
    rate: 'Rs. 1500/hr',
    time: '2 hours ago',
  },
  {
    id: '2',
    name: 'Hassan Khan',
    subject: 'Advanced Physics',
    board: 'A-Levels',
    rate: 'Rs. 2000/hr',
    time: '5 hours ago',
  },
];

const TutorRequestsScreen = () => {
  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        {/* TOP SECTION */}
        <View style={styles.topRow}>
          <View style={styles.avatar} />

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>

              <View style={styles.newBadge}>
                <Text style={styles.newText}>NEW</Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={14} color="#9CA3AF" />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.levelTag}>
                <Text style={styles.levelText}>{item.board}</Text>
              </View>

              <View style={styles.rateTag}>
                <Text style={styles.rateText}>{item.rate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SUBJECT BOX */}
        <View style={styles.subjectBox}>
          <View style={styles.iconBox}>
            <Ionicons name="flask-outline" size={22} color="#6C5CE7" />
          </View>

          <View>
            <Text style={styles.subjectLabel}>Subject Requested</Text>
            <Text style={styles.subjectName}>{item.subject}</Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.descriptionRow}>
          <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
          <Text style={styles.descriptionText}>
            Student needs help understanding concepts and problem solving techniques.
          </Text>
        </View>

        {/* PREFERRED TIME */}
        <View style={styles.preferredRow}>
          <Ionicons name="calendar-outline" size={15} color="#9CA3AF" />
          <Text style={styles.preferredText}>
            Preferred: Mon, Wed 4:00 PM
          </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.acceptBtn}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.declineBtn}>
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>New Opportunities</Text>
          <Text style={styles.subHeading}>
            Review and respond to booking requests
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>2 New</Text>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 30,
        }}
      />
    </SafeAreaView>
  );
};

export default TutorRequestsScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },

  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  subHeading: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 13,
  },

  countBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  countText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  /* CARD */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 16,
    marginBottom: 18,

    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  /* TOP */
  topRow: {
    flexDirection: 'row',
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  newBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },

  newText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  timeText: {
    marginLeft: 6,
    color: '#9CA3AF',
    fontSize: 12,
  },

  tagsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  levelTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 10,
  },

  levelText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 11,
  },

  rateTag: {
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  rateText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 11,
  },

  /* SUBJECT */
  subjectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
  },

  subjectLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  subjectName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 3,
  },

  /* DESCRIPTION */
  descriptionRow: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'flex-start',
  },

  descriptionText: {
    flex: 1,
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
  },

  /* TIME */
  preferredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  preferredText: {
    marginLeft: 8,
    color: '#9CA3AF',
    fontSize: 12,
  },

  /* BUTTONS */
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: '#00C853',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',

    shadowColor: '#00C853',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },

  acceptText: {
    color: '#fff',
    fontWeight: '800',
  },

  declineBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',

    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },

  declineText: {
    color: '#EF4444',
    fontWeight: '800',
  },
});