import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.daig.logistix.express',
  appName: 'DAIG Logistix Express',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '618628258891-0k11mbjiuv3lrg8gsjlldv6p4qg1p06b.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
