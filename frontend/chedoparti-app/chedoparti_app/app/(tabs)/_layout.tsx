import { Tabs, Slot } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Home, Calendar, User, Search } from 'lucide-react-native';
import { useWindowDimensions, View, Platform } from 'react-native';
import { DesktopHeader } from '../../components/DesktopHeader';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768 && Platform.OS === 'web';

  if (isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
         <DesktopHeader />
         <View style={{ flex: 1 }}>
            {/* The Slot renders the child route (home, bookings, etc.) */}
            <Slot /> 
         </View>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondaryLight,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.divider,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Mis Reservas',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
