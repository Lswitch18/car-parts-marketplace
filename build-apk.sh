#!/bin/bash
set -e

echo "Using SDKMAN Java 17..."
source "$HOME/.sdkman/bin/sdkman-init.sh"



echo "Setting up Android SDK..."
mkdir -p $HOME/Android/cmdline-tools
cd $HOME/Android

if [ ! -d "cmdline-tools/latest" ]; then
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
    unzip -q cmdline-tools.zip -d cmdline-tools/
    mv cmdline-tools/cmdline-tools cmdline-tools/latest
    rm cmdline-tools.zip
fi

export ANDROID_HOME=$HOME/Android
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

echo "Accepting licenses..."
yes | sdkmanager --licenses > /dev/null

echo "Installing SDK components..."
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null

echo "Building APK..."
cd /home/lswitch/car-parts-marketplce
npm run cap:sync:driver
cd android
./gradlew assembleDebug

cd /home/lswitch/car-parts-marketplce
mkdir -p apks
cp android/app/build/outputs/apk/debug/app-debug.apk apks/ai-scanner-debug.apk

echo "Build complete. AI Scanner APK is at: /home/lswitch/car-parts-marketplce/apks/ai-scanner-debug.apk"
