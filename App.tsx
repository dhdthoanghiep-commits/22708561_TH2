// TH2 | 22708561 | LE NGUYEN HOANG HIEP | #392230
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '@navigation/RootNavigator';

// Server State (Chương 6 – Phần 6.5). staleTime đặt ở từng useQuery = STALE_TIME_MS (student.ts)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // mất mạng: thử lại 2 lần rồi mới rơi vào nhánh error (nút Thử lại)
    },
  },
});

// Thứ tự bọc theo đề: SafeAreaProvider → QueryClientProvider → NavigationContainer → RootNavigator
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {/* RN 0.87 bật edge-to-edge: thanh trạng thái trong suốt, nền lấy từ SafeAreaView của từng màn */}
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
