package com.tutorlink

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

import com.oney.WebRTCModule.WebRTCModulePackage

class MainApplication : Application(), ReactApplication {

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages.apply {

                // Manually add WebRTC package
                add(WebRTCModulePackage())
            },
        )
    }

    override fun onCreate() {
        super.onCreate()

        createDefaultNotificationChannel()

        loadReactNative(this)
    }

    private fun createDefaultNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val channelId = getString(R.string.default_notification_channel_id)

        val channel = NotificationChannel(
            channelId,
            "TutorLink Notifications",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Messages, bookings, and account updates"
            enableVibration(true)
            setShowBadge(true)
        }

        val manager = getSystemService(NotificationManager::class.java)
        manager?.createNotificationChannel(channel)
    }
}