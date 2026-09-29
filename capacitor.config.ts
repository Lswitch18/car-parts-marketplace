import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.daig.marketplace',
  appName: 'DAIG Marketplace',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#020617',
    // Deep links Stripe: capacitor://checkout/success?session_id={CHECKOUT_SESSION_ID}
    // + universal links se configurar APPLINKS no futuro
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '606997989793-k2cuig6n7v5iiddc2sqfp6acm7st62t9.apps.googleusercontent.com',
      iosClientId: '606997989793-k2cuig6n7v5iiddc2sqfp6acm7st62t9.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
