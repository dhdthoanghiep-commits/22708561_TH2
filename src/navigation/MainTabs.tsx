import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ShopStack, { type ShopStackParamList } from '@navigation/ShopStack';
import CartScreen from '@screens/CartScreen';
import MeScreen from '@screens/MeScreen';
import { VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';
import { useCartStore } from '@stores/cartStore';

export type MainTabParamList = {
  ShopTab: NavigatorScreenParams<ShopStackParamList>;
  CartTab: undefined;
  MeTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconProps = { color: string; size: number };

// Hàm vẽ icon khai báo NGOÀI component (react-native-vector-icons, Chương 5 – Bước 4.5)
const ShopIcon = ({ color, size }: TabIconProps) => (
  <Icon name="storefront-outline" color={color} size={size} />
);
const CartIcon = ({ color, size }: TabIconProps) => (
  <Icon name="cart-outline" color={color} size={size} />
);
const MeIcon = ({ color, size }: TabIconProps) => (
  <Icon name="account-circle-outline" color={color} size={size} />
);

/** Luồng 2 — ĐÃ ĐĂNG NHẬP: Bottom Tabs Cửa hàng · Giỏ · Tôi */
const MainTabs = () => {
  // Badge giỏ = tổng số lượng trong Zustand (đọc thẳng store, không Prop Drilling)
  const totalQuantity = useCartStore(state => state.totalQuantity());

  const shopTab = (
    <Tab.Screen
      key="ShopTab"
      name="ShopTab"
      component={ShopStack}
      options={{ title: 'Cửa hàng', tabBarIcon: ShopIcon }}
    />
  );
  const cartTab = (
    <Tab.Screen
      key="CartTab"
      name="CartTab"
      component={CartScreen}
      options={{
        title: 'Giỏ',
        tabBarIcon: CartIcon,
        // undefined (không phải 0) để React Navigation ẨN hẳn badge khi giỏ trống
        tabBarBadge: totalQuantity > 0 ? totalQuantity : undefined,
      }}
    />
  );
  const meTab = (
    <Tab.Screen
      key="MeTab"
      name="MeTab"
      component={MeScreen}
      options={{ title: 'Tôi', tabBarIcon: MeIcon }}
    />
  );

  // Thứ tự Tab đọc VARIANT.tabOrder: shopFirst = Shop→Giỏ→Tôi | cartFirst = Giỏ→Shop→Tôi
  const tabs =
    VARIANT.tabOrder === 'cartFirst'
      ? [cartTab, shopTab, meTab]
      : [shopTab, cartTab, meTab];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarBadgeStyle: styles.badge,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      }}>
      {tabs}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: { backgroundColor: COLORS.secondary, color: COLORS.surface },
  label: { fontSize: 12, fontWeight: '700' },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
  },
});

export default MainTabs;
