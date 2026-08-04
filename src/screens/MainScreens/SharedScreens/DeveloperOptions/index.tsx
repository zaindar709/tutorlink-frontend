import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommonActions } from '@react-navigation/native';
import { GlassScreen } from '../../../../components/Glass';
import { ProfileSubHeader } from '../../../../components/Profile';
import { GLASS } from '../../../../theme/glass';
import {
  AuthRole,
  loginWithEmail,
  logoutUser,
} from '../../../../services/auth/authService';
import { setUser, logout } from '../../../../store/auth/authSlice';
import { getApiErrorMessage } from '../../../../utils/api/errorHandler';
import { getTutorOnboardingStatus } from '../../../../services/tutor/tutorOnboardingService';
import { getTutorResetRoute } from '../../../../utils/tutor/tutorNavigation';
import {
  DevAccount,
  loadDevAccounts,
  removeDevAccount,
  upsertDevAccount,
} from '../../../../services/dev/devAccountsStore';
import { navigationRef } from '../../../../navigation/navigationRef';
import { API_BASE_URL } from '../../../../config/api';

type JumpItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  tab?: string;
  stackScreen?: string;
  roles?: AuthRole[];
};

const JUMP_ITEMS: JumpItem[] = [
  {
    key: 'messages',
    title: 'Messages',
    subtitle: 'Chat list — check student ↔ tutor chats',
    icon: 'message-text-outline',
    tab: 'Messages',
  },
  {
    key: 'bookings',
    title: 'Bookings',
    subtitle: 'Student booking requests & status',
    icon: 'calendar-check-outline',
    tab: 'Bookings',
    roles: ['student', 'parent'],
  },
  {
    key: 'requests',
    title: 'Requests',
    subtitle: 'Tutor incoming booking requests',
    icon: 'inbox-outline',
    tab: 'Request',
    roles: ['tutor'],
  },
  {
    key: 'schedule',
    title: 'Schedule',
    subtitle: 'Tutor calendar & availability',
    icon: 'calendar-month-outline',
    tab: 'Schedule',
    roles: ['tutor'],
  },
  {
    key: 'search',
    title: 'Search tutors',
    subtitle: 'Find tutors / start booking',
    icon: 'magnify',
    tab: 'Search',
    roles: ['student', 'parent'],
  },
  {
    key: 'home',
    title: 'Home',
    subtitle: 'Role home dashboard',
    icon: 'home-outline',
    tab: 'Home',
  },
  {
    key: 'profile',
    title: 'Profile tab',
    subtitle: 'Back to profile menu',
    icon: 'account-outline',
    tab: 'Profile',
  },
  {
    key: 'wallet',
    title: 'Wallet',
    subtitle: 'Student balance & escrow',
    icon: 'wallet-outline',
    stackScreen: 'WalletScreen',
    roles: ['student', 'parent'],
  },
  {
    key: 'earnings',
    title: 'Earnings',
    subtitle: 'Tutor balance & withdraw',
    icon: 'cash-multiple',
    stackScreen: 'TutorEarningsScreen',
    roles: ['tutor'],
  },
];

const AUTH_EXITS = [
  {
    key: 'student-login',
    title: 'Logout → Student Login',
    icon: 'login',
    screen: 'StudentLoginScreen',
  },
  {
    key: 'tutor-login',
    title: 'Logout → Tutor Login',
    icon: 'account-tie-outline',
    screen: 'TutorLoginScreen',
  },
  {
    key: 'student-signup',
    title: 'Logout → Student Signup',
    icon: 'account-plus-outline',
    screen: 'StudentSignUpScreen',
  },
  {
    key: 'tutor-signup',
    title: 'Logout → Tutor Signup',
    icon: 'school-outline',
    screen: 'TutorSignUpScreen',
  },
  {
    key: 'role',
    title: 'Logout → Role Selection',
    icon: 'account-switch-outline',
    screen: 'RoleSelectionScreen',
  },
] as const;

const DevRow = ({
  icon,
  title,
  subtitle,
  onPress,
  danger,
  right,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}) => (
  <TouchableOpacity
    style={styles.row}
    activeOpacity={0.75}
    onPress={onPress}
  >
    <View
      style={[
        styles.rowIcon,
        { backgroundColor: danger ? '#FEE2E2' : GLASS.primarySoft },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={danger ? '#DC2626' : GLASS.primary}
      />
    </View>
    <View style={styles.rowBody}>
      <Text style={[styles.rowTitle, danger && { color: '#DC2626' }]}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
    </View>
    {right || (
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={GLASS.textMuted}
      />
    )}
  </TouchableOpacity>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const DeveloperOptionsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);
  const role = (auth.role || 'student') as AuthRole;
  const user = auth.user;

  const [accounts, setAccounts] = useState<DevAccount[]>([]);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<AuthRole>(
    role === 'tutor' ? 'tutor' : 'student'
  );
  const [label, setLabel] = useState('');

  const refreshAccounts = useCallback(async () => {
    setAccounts(await loadDevAccounts());
  }, []);

  useEffect(() => {
    void refreshAccounts();
  }, [refreshAccounts]);

  const sessionLines = useMemo(() => {
    const id = user?.id || user?._id || user?.uid || '—';
    return [
      `Role: ${role}`,
      `Email: ${user?.email || '—'}`,
      `Name: ${user?.name || user?.fullName || '—'}`,
      `User ID: ${id}`,
      `API: ${API_BASE_URL}`,
    ];
  }, [role, user]);

  const jumpItems = useMemo(
    () =>
      JUMP_ITEMS.filter(
        item => !item.roles || item.roles.includes(role)
      ),
    [role]
  );

  const goToTab = (tab: string) => {
    if (!navigationRef.isReady()) return;
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MyTabs',
            params: { role, screen: tab },
          },
        ],
      })
    );
  };

  const goToStack = (screen: string) => {
    navigation.navigate(screen);
  };

  const copySession = () => {
    void Share.share({ message: sessionLines.join('\n') });
  };

  const applySession = async (
    session: Awaited<ReturnType<typeof loginWithEmail>>
  ) => {
    const sessionRole = (session.role || loginRole) as AuthRole;
    dispatch(
      setUser({
        user: session.user,
        token: session.token,
        role: sessionRole,
      })
    );

    if (sessionRole === 'tutor') {
      try {
        const status = await getTutorOnboardingStatus();
        navigation.reset(getTutorResetRoute(status) as any);
        return;
      } catch {
        // fall through to home tabs
      }
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MyTabs',
          params: { role: sessionRole, screen: 'Home' },
        },
      ],
    });
  };

  const quickLogin = async (
    nextEmail: string,
    nextPassword: string,
    nextRole: AuthRole
  ) => {
    if (!nextEmail.trim() || !nextPassword) {
      Alert.alert('Missing fields', 'Email and password are required.');
      return;
    }
    setBusy(true);
    try {
      await logoutUser();
      dispatch(logout());
      const session = await loginWithEmail({
        email: nextEmail.trim(),
        password: nextPassword,
        role: nextRole,
      });
      await applySession(session);
    } catch (error) {
      Alert.alert('Login failed', getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const saveCurrentAccount = async () => {
    const currentEmail = String(user?.email || email || '').trim();
    if (!currentEmail) {
      Alert.alert(
        'No email',
        'Enter the password below and save, or fill email + password first.'
      );
      return;
    }
    if (!password) {
      Alert.alert(
        'Password needed',
        'Enter this account’s password in the Quick Login fields so you can switch back later.'
      );
      return;
    }
    setBusy(true);
    try {
      const list = await upsertDevAccount({
        label:
          label ||
          `${role} · ${user?.name || user?.fullName || currentEmail}`,
        email: currentEmail,
        password,
        role,
      });
      setAccounts(list);
      Alert.alert('Saved', 'Account saved for quick switch.');
    } finally {
      setBusy(false);
    }
  };

  const logoutToAuth = async (screen: string) => {
    setBusy(true);
    try {
      await logoutUser();
      dispatch(logout());
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'AuthNavigator',
            state: {
              index: 0,
              routes: [{ name: screen }],
            },
          },
        ],
      });
    } catch (error) {
      Alert.alert('Logout failed', getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassScreen scroll={false} contentStyle={styles.screen}>
      <ProfileSubHeader navigation={navigation} title="Developer Options" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.banner}>
          <MaterialCommunityIcons
            name="code-tags"
            size={22}
            color={GLASS.primary}
          />
          <Text style={styles.bannerText}>
            QA helpers — switch student ↔ tutor accounts and jump to Messages,
            Bookings / Requests to verify both sides.
          </Text>
        </View>

        {busy ? (
          <ActivityIndicator
            color={GLASS.primary}
            style={{ marginVertical: 8 }}
          />
        ) : null}

        <Section title="Current session">
          {sessionLines.map(line => (
            <Text key={line} style={styles.mono}>
              {line}
            </Text>
          ))}
          <TouchableOpacity style={styles.copyBtn} onPress={copySession}>
            <MaterialCommunityIcons
              name="content-copy"
              size={16}
              color={GLASS.primary}
            />
            <Text style={styles.copyText}>Share session</Text>
          </TouchableOpacity>
        </Section>

        <Section title="Jump to (check the other side)">
          {jumpItems.map((item, index) => (
            <View key={item.key}>
              <DevRow
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={() =>
                  item.tab
                    ? goToTab(item.tab)
                    : item.stackScreen
                      ? goToStack(item.stackScreen)
                      : undefined
                }
              />
              {index < jumpItems.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </Section>

        <Section title="Quick login / switch account">
          <Text style={styles.hint}>
            Save a student + tutor account, then tap one to switch instantly
            after student sends a message or booking.
          </Text>

          <View style={styles.roleToggle}>
            {(['student', 'tutor'] as AuthRole[]).map(r => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleChip,
                  loginRole === r && styles.roleChipActive,
                ]}
                onPress={() => setLoginRole(r)}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    loginRole === r && styles.roleChipTextActive,
                  ]}
                >
                  {r === 'student' ? 'Student' : 'Tutor'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Label (optional)"
            placeholderTextColor={GLASS.placeholder}
            value={label}
            onChangeText={setLabel}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={GLASS.placeholder}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={GLASS.placeholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            disabled={busy}
            onPress={() => void quickLogin(email, password, loginRole)}
          >
            <Text style={styles.primaryBtnText}>
              Login as {loginRole === 'tutor' ? 'Tutor' : 'Student'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            disabled={busy}
            onPress={() => void saveCurrentAccount()}
          >
            <Text style={styles.secondaryBtnText}>
              Save current / form account
            </Text>
          </TouchableOpacity>
        </Section>

        {accounts.length > 0 ? (
          <Section title="Saved test accounts">
            {accounts.map((account, index) => (
              <View key={account.id}>
                <DevRow
                  icon={
                    account.role === 'tutor'
                      ? 'account-tie-outline'
                      : 'school-outline'
                  }
                  title={account.label}
                  subtitle={`${account.role} · ${account.email}`}
                  onPress={() =>
                    void quickLogin(
                      account.email,
                      account.password,
                      account.role
                    )
                  }
                  right={
                    <TouchableOpacity
                      hitSlop={10}
                      onPress={() => {
                        Alert.alert(
                          'Remove account?',
                          account.email,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: () => {
                                void removeDevAccount(account.id).then(
                                  setAccounts
                                );
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={20}
                        color="#DC2626"
                      />
                    </TouchableOpacity>
                  }
                />
                {index < accounts.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))}
          </Section>
        ) : null}

        <Section title="Auth shortcuts">
          {AUTH_EXITS.map((item, index) => (
            <View key={item.key}>
              <DevRow
                icon={item.icon}
                title={item.title}
                onPress={() => void logoutToAuth(item.screen)}
                danger
              />
              {index < AUTH_EXITS.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </Section>

        <Text style={styles.footer}>
          Tip: keep one student + one tutor saved. Message from student → open
          Developer Options → tap tutor account → Messages / Requests.
        </Text>
      </ScrollView>
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: GLASS.primarySoft,
    borderRadius: GLASS.radius.lg,
    padding: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  bannerText: {
    flex: 1,
    color: GLASS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    color: GLASS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: GLASS.radius.lg,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    paddingVertical: 4,
    ...GLASS.shadow.soft,
  },
  mono: {
    color: GLASS.textPrimary,
    fontSize: 12,
    fontFamily: 'monospace',
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  copyText: {
    color: GLASS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: {
    color: GLASS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  rowSub: {
    color: GLASS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(148,163,184,0.35)',
    marginLeft: 58,
  },
  hint: {
    color: GLASS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  roleToggle: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: GLASS.primarySoft,
    borderWidth: 1,
    borderColor: GLASS.cardBorderStrong,
  },
  roleChipText: {
    color: GLASS.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  roleChipTextActive: {
    color: GLASS.primary,
  },
  input: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GLASS.inputBorder,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: GLASS.textPrimary,
    fontSize: 14,
  },
  primaryBtn: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: GLASS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryBtn: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: GLASS.primarySoft,
  },
  secondaryBtnText: {
    color: GLASS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    color: GLASS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
  },
});

export default DeveloperOptionsScreen;
