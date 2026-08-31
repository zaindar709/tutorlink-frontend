# TutorLink Release ProGuard / R8 rules
# Keep React Native, Hermes, Firebase, and native modules intact.

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.hermes.**

# OkHttp / Okio (RN networking)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# React Native Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# Reanimated / Worklets / Gesture Handler
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.worklets.** { *; }
-dontwarn com.swmansion.**

# Screens / Safe Area
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Vector icons
-keep class com.oblador.vectoricons.** { *; }
-keep class com.reactnativevectoricons.** { *; }

# MapLibre
-keep class org.maplibre.** { *; }
-keep class com.mapbox.** { *; }
-dontwarn org.maplibre.**
-dontwarn com.mapbox.**

# Google Sign-In
-keep class com.google.android.gms.auth.** { *; }
-keep class com.reactnativegooglesignin.** { *; }

# Image picker / documents
-keep class com.imagepicker.** { *; }
-keep class com.reactnativedocumentpicker.** { *; }

# Notifee (Android system notifications)
-keep class io.invertase.notifee.** { *; }
-dontwarn io.invertase.notifee.**

# react-native-webrtc (required for classroom — keep native module + org.webrtc)
-keep class com.oney.WebRTCModule.** { *; }
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**
-dontwarn com.oney.WebRTCModule.**

# react-native-incall-manager (speaker / proximity during calls)
-keep class com.zxcpoiu.incallmanager.** { *; }
-dontwarn com.zxcpoiu.incallmanager.**

# Kotlin
-dontwarn kotlin.**
-dontwarn kotlinx.**

# Keep line numbers for crash reports (Firebase Crashlytics / App Distribution)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
-keepattributes Signature,*Annotation*,EnclosingMethod,InnerClasses

# Avoid stripping Parcelable CREATOR
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
