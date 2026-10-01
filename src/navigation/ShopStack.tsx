import React from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@screens/HomeScreen';
import DetailScreen from '@screens/DetailScreen';
import { VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';

/** Route Params của Stack trong tab Cửa hàng — Detail chỉ nhận { id: string } (Phần 5.3) */
export type ShopStackParamList = {
  Home: undefined;
  Detail: { id: string };
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

/** Stack lồng trong Tab (Chương 5 – Bước 4): Home (lưới 2 cột) -> Chi tiết */
const ShopStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerTitleStyle: styles.headerTitle,
        headerStyle: styles.header,
        contentStyle: styles.content,
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          title: 'Chi tiết món',
          // Presentation theo bảng số cuối: 0–4 = 'card', 5–9 = 'modal'
          presentation: VARIANT.detailPresentation,
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerTitle: { color: COLORS.primary, fontWeight: '800' },
  header: { backgroundColor: COLORS.surface },
  content: { backgroundColor: COLORS.background },
});

export default ShopStack;
