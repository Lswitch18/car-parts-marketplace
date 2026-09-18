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
      serverClientId: '618628258891-0k11mbjiuv3lrg8gsjlldv6p4qg1p06b.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
