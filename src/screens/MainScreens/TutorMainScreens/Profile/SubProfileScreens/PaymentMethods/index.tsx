import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Icon } from 'react-native-paper'
import { GlassScreen } from '../../../../../../components/Glass'
import { GLASS } from '../../../../../../theme/glass'
import { useNavigation } from '@react-navigation/native'
import useUi from '../../../../../../hooks/ui/useUi'
import CustomButton from '../../../../../../components/CustomButton'
import CustomHeader from '../../../../../../components/Tutor/CustomHeader'

const defaultMethods = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    number: '0300-1234567',
    icon: 'credit-card-outline',
    bgColor: '#EAF0FF',
  },
  {
    id: 'easypaisa',
    name: 'Easypaisa',
    number: '0321-9876543',
    icon: 'cellphone',
    bgColor: '#F9E9FF',
  },
]

const PaymentMethodScreen = () => {
  const { colors, resp } = useUi()
  const navigation = useNavigation<any>()
  const [methods, setMethods] = useState(defaultMethods)
  const [selectedId, setSelectedId] = useState('easypaisa')

  const handleSelect = (id: string) => {
    setSelectedId(id)
  }

  const handleDelete = (id: string) => {
    if (methods.length === 1) {
      return Alert.alert(
        'Cannot remove',
        'At least one payment method must remain active.',
      )
    }

    setMethods(current => current.filter(method => method.id !== id))

    if (selectedId === id) {
      const nextMethod = methods.find(method => method.id !== id)
      if (nextMethod) {
        setSelectedId(nextMethod.id)
      }
    }
  }

  const handleAddMethod = () => {
    Alert.alert('Add Payment Method', 'This action is not implemented yet.')
  }

  return (
    <GlassScreen scroll={false}>
      <CustomHeader navigation={navigation} title="Payment Methods" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <View style={[styles.infoBadge, { backgroundColor: '#E6F7F0' }]}> 
            <Icon
              source="shield-lock"
              size={resp.df(18)}
              color={String(colors.PRIMARY_COLOR)}
            />
            <Text style={[styles.infoBadgeText, { color: colors.PRIMARY_COLOR }]}> 
              Secure & Encrypted
            </Text>
          </View>
          <Text style={[styles.infoTitle, { color: colors.BLACK_COLOR }]}> 
            Manage withdrawal options
          </Text>
          <Text style={[styles.infoSubtitle, { color: colors.SECONDARY_COLOR }]}> 
            Tutorlink never stores your complete account details. Your payment information is encrypted and secure.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.BLACK_COLOR }]}>Your Payment Methods</Text>

        {methods.map(method => {
          const isSelected = selectedId === method.id

          return (
            <TouchableOpacity
              key={method.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(method.id)}
              style={[
                styles.methodCard,
                {
                  borderColor: isSelected ? colors.PRIMARY_COLOR : GLASS.cardBorder,
                  backgroundColor: isSelected ? GLASS.primarySoft : GLASS.cardBg,
                },
              ]}
            >
              <View style={[styles.methodIconWrapper, { backgroundColor: method.bgColor }]}> 
                <Icon
                  source={method.icon}
                  size={resp.df(24)}
                  color={String(colors.PRIMARY_COLOR)}
                />
              </View>
              <View style={styles.methodTextGroup}>
                <Text style={[styles.methodName, { color: colors.BLACK_COLOR }]}> 
                  {method.name}
                </Text>
                <Text style={[styles.methodNumber, { color: colors.SECONDARY_COLOR }]}> 
                  {method.number}
                </Text>
              </View>

              <View style={styles.methodMeta}>
                {isSelected && (
                  <View style={[styles.defaultTag, { backgroundColor: colors.PRIMARY_COLOR }]}> 
                    <Text style={[styles.defaultTagText, { color: colors.WHITE_COLOR }]}>Default</Text>
                  </View>
                )}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDelete(method.id)}
                  style={styles.deleteButton}
                >
                  <Icon
                    source="trash-can-outline"
                    size={resp.df(20)}
                    color={String(colors.RED)}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )
        })}

        <CustomButton
          title="+ Add Payment Method"
          onPress={handleAddMethod}
          style={styles.addButton}
        />

        <View style={styles.noteCard}>
          <Text style={[styles.noteTitle, { color: colors.BLACK_COLOR }]}>Withdrawal Information</Text>
          <Text style={[styles.noteText, { color: colors.SECONDARY_COLOR }]}>Minimum withdrawal amount is PKR 1,000</Text>
          <Text style={[styles.noteText, { color: colors.SECONDARY_COLOR }]}>Withdrawals are processed within 24-48 hours</Text>
          <Text style={[styles.noteText, { color: colors.SECONDARY_COLOR }]}>Platform fee of 10% applies to all earnings</Text>
        </View>
      </ScrollView>
    </GlassScreen>
  )
}

export default PaymentMethodScreen

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 18,
  },
  infoCard: {
    borderRadius: GLASS.radius.xxl,
    padding: 20,
    marginTop: 16,
    backgroundColor: GLASS.cardBg,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    ...GLASS.shadow.soft,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  methodCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: GLASS.radius.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...GLASS.shadow.soft,
  },
  methodIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodTextGroup: {
    flex: 1,
    marginLeft: 14,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 13,
    lineHeight: 20,
  },
  methodMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 52,
  },
  defaultTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-end',
  },
  defaultTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 8,
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 20,
  },
  noteCard: {
    borderRadius: GLASS.radius.xxl,
    padding: 20,
    borderWidth: 1,
    backgroundColor: GLASS.cardBg,
    borderColor: GLASS.cardBorder,
    ...GLASS.shadow.soft,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
})