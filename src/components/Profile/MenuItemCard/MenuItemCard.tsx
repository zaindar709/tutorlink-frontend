import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';

export default function MenuItemCard({
  title,
  description,
  icon,
  onPress,
  iconColor = '#000',
}: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      
      <View style={styles.left}>
        
        {/* ICON */}
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: `${iconColor}20`,
            },
          ]}
        >
          <Icon source={icon} size={20} color={iconColor} />
        </View>

        {/* TEXT CONTAINER */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>
      </View>

      <Icon source="chevron-right" size={22} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '95%',
    minHeight: 75,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },

  description: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
});