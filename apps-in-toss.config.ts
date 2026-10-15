import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'zero-spend',
  brand: {
    primaryColor: '#3182F6', // 앱 아이콘(assets/icon/app-icon.png) 배경색과 같은 토스 블루
  },
  permissions: [],
  webBundleDir: 'dist',
});
