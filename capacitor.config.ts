import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.daig.logistix.express',
  appName: 'DAIG Logistix Express',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
