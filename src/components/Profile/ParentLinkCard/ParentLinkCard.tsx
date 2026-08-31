import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../../theme/glass';
import {
  PARENT_DASHBOARD_URL,
  parentDashboardShareHint,
} from '../../../config/parentDashboard';
import {
  DemoParentLinkEntry,
  issueParentLinkForStudent,
} from '../../../constants/parentLinkCodes';

type Props = {
  /** Logged-in student display name (shown in share text). */
  studentName?: string;
  onOpenDetails?: () => void;
};

const buildShareMessage = (code: string, studentName: string) =>
  [
    'TutorLink — Parent link code',
    '',
    `Student: ${studentName}`,
    `Code: ${code}`,
    '',
    parentDashboardShareHint({ code, studentName }),
  ].join('\n');

export default function ParentLinkCard({ studentName, onOpenDetails }: Props) {
  const cursorRef = useRef(0);
  const [entry, setEntry] = useState<DemoParentLinkEntry | null>(null);
  const [showCodeUi, setShowCodeUi] = useState(false);

  const resolvedName =
    String(studentName || '').trim() || entry?.studentName || 'Student';

  const handleGenerate = () => {
    cursorRef.current += 1;
    const nameAtGenerate = String(studentName || '').trim() || 'Student';
    setEntry(
      issueParentLinkForStudent(nameAtGenerate, Date.now() + cursorRef.current)
    );
    setShowCodeUi(true);
  };

  const handleShare = async () => {
    if (!entry?.code) return;
    const nameForShare = entry.studentName || resolvedName;
    try {
      await Share.share({
        message: buildShareMessage(entry.code, nameForShare),
        title: 'TutorLink parent link code',
      });
    } catch {
      Alert.alert('Share failed', 'Could not open the share sheet.');
    }
  };

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['#34D399', '#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.iconBox}>
          <Icon source="account-child-outline" size={22} color="#fff" />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.title}>Link a parent</Text>
          <Text style={styles.desc}>
            {showCodeUi && entry
              ? 'Code ready — share with your parent'
              : 'Generate a shareable code for the Parent web dashboard'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={handleGenerate}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {showCodeUi ? 'New code' : 'Generate'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {showCodeUi && entry ? (
        <View style={styles.codePanel}>
          <Text style={styles.codeLabel}>Your shareable code</Text>
          <Text style={styles.studentLine} numberOfLines={1}>
            Student: {entry.studentName || resolvedName}
          </Text>
          <Text style={styles.codeValue}>{entry.code}</Text>
          <Text style={styles.codeHint}>
            Parent enters this exact code on the web dashboard to see{' '}
            {entry.studentName || resolvedName} with 0% progress.
          </Text>
          <Text style={styles.urlHint} numberOfLines={1}>
            {PARENT_DASHBOARD_URL}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => void handleShare()}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={18}
                color="#fff"
              />
              <Text style={styles.shareText}>Share code</Text>
            </TouchableOpacity>
            {onOpenDetails ? (
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={onOpenDetails}
                activeOpacity={0.85}
              >
                <Text style={styles.manageText}>Manage</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginHorizontal: 16,
  },
  container: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: GLASS.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#10B981',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  desc: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 92,
    alignItems: 'center',
  },
  btnText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  codePanel: {
    marginTop: 10,
    borderRadius: GLASS.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.28)',
    backgroundColor: 'rgba(236,253,245,0.85)',
    padding: 16,
    alignItems: 'center',
  },
  codeLabel: {
    color: GLASS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  studentLine: {
    marginTop: 8,
    color: GLASS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  codeValue: {
    marginTop: 10,
    color: '#047857',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  codeHint: {
    marginTop: 10,
    color: GLASS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  urlHint: {
    marginTop: 8,
    color: GLASS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  shareBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: GLASS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  manageBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: {
    color: GLASS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
});
