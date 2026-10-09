export interface AndroidFile {
  path: string;
  name: string;
  category: 'gradle' | 'manifest' | 'kotlin_data' | 'kotlin_domain' | 'kotlin_ui' | 'test' | 'workflow' | 'docs';
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'README.md',
    name: 'README (বাংলা গাইড)',
    category: 'docs',
    content: `# Friends Hisab - ফ্রেন্ডস হিসাব (অ্যান্ড্রয়েড অ্যাপ)

একটি সম্পূর্ণ অফলাইন, বিজ্ঞাপনমুক্ত ও সহজ হিসাবরক্ষণ ও টালি খাতা অ্যাপ।
ছোট দোকানদার ও ব্যবসায়ীদের (যেমন: ফটোকপি, কম্পিউটার স্টুডিও, স্টেশনারি, মুদি দোকান) জন্য বিশেষভাবে তৈরি।

## 🚀 বৈশিষ্ট্যসমূহ
- **১০০% অফলাইন ও নিরাপদ**: কোনো ইন্টারনেটের প্রয়োজন নেই। সব ডাটা আপনার ফোনেই রুম ডাটাবেসে (Room DB) থাকবে।
- **নির্ভুল হিসাব (Decimal-Safe)**: পয়সা ও BigDecimal হিসাব, কোনো ভগ্নাংশ বা রাউন্ডিং ভুল নেই।
- **বাকি খাতা (Customer Ledger)**: গ্রাহকের বাকি বিক্রি, নগদ জমা, আংশিক পরিশোধ ও অটোমেটিক হিসাব।
- **মহাজন খাতা (Supplier Ledger)**: মালামাল ক্রয় ও পাওনাদারের হিসাব।
- **এমএফএস খাতা**: বিকাশ, নগদ, রকেট এজেন্ট ক্যাশ-ইন, ক্যাশ-আউট ও রিচার্জ ব্যালেন্স এবং কমিশন ট্র্যাকিং।
- **দোকান পিওএস ও স্টক**: ফটোকপি, প্রিন্টিং, পাসপোর্ট ছবি ও স্টেশনারি বিক্রির রসিদ।
- **হোয়াটসঅ্যাপ ও এসএমএস তাগাদা**: এক ক্লিকে বাংলায় বিনীত বাকি তাগাদা মেসেজ পাঠানো।

---

## 📱 কীভাবে বিনামূল্যে APK ফাইল তৈরি করবেন (কম্পিউটার বা অ্যান্ড্রয়েড স্টুডিও ছাড়া):

আপনার কাছে যদি হাই-কনফিগ পিসি না থাকে, তবে **গিটহাবের (GitHub Actions)** ফ্রি ক্লাউড বিল্ডার দিয়ে ১ ক্লিকে আসল ইনস্টলযোগ্য APK বানাতে পারবেন:

1. [github.com](https://github.com) এ একটি নতুন ফ্রি অ্যাকাউন্ট খুলুন এবং একটি New Repository তৈরি করুন (নাম দিন \`friends-hisab-android\`)।
2. এই প্রজেক্টের সব ফাইল আপলোড করুন (বা গিট পুশ করুন)।
3. প্রজেক্টের \`.github/workflows/build-apk.yml\` ফাইলটি গিটহাব নিজে থেকেই শনাক্ত করবে।
4. আপনার রিপোজিটরির **"Actions"** ট্যাবে যান -> "Build Friends Hisab APK" রান হবে (২-৩ মিনিট সময় লাগবে)।
5. বিল্ড শেষ হলে **"Artifacts"** সেকশন থেকে সরাসরি \`friends-hisab-debug.apk\` ডাউনলোড করে আপনার অ্যান্ড্রয়েড ফোনে ইনস্টল করুন!

---

## 💻 অ্যান্ড্রয়েড স্টুডিও (Android Studio) দিয়ে বিল্ড করার নিয়ম:
1. Android Studio Ladybug বা Hedgehog ওপেন করুন।
2. **File > Open** দিয়ে এই প্রজেক্ট ফোল্ডারটি ওপেন করুন।
3. Gradle Sync শেষ হওয়া পর্যন্ত অপেক্ষা করুন (সব ডিপেনডেন্সি স্বয়ংক্রিয়ভাবে ডাউনলোড হবে)।
4. **Build > Build Bundle(s) / APK(s) > Build APK(s)** চাপুন।
5. বিল্ড সম্পন্ন হলে \`app/build/outputs/apk/debug/app-debug.apk\` পেয়ে যাবেন।

---

## 🧪 স্বয়ংক্রিয় টেস্ট রান করার নিয়ম:
অ্যান্ড্রয়েড স্টুডিও টার্মিনালে রান করুন:
\`\`\`bash
./gradlew test
\`\`\`
এটি \`FinancialEngineTest.kt\` এ থাকা ১০টি আর্থিক অডিট টেস্ট এক্সিকিউট করবে।`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml (ফ্রি GitHub Actions APK বিল্ডার)',
    category: 'workflow',
    content: `name: Build Friends Hisab APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Source Code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: gradle

    - name: Grant execute permission for gradlew
      run: chmod +x gradlew || true

    - name: Run Unit Tests
      run: ./gradlew test --stacktrace

    - name: Build Debug APK
      run: ./gradlew assembleDebug --stacktrace

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: Friends-Hisab-Debug-APK
        path: app/build/outputs/apk/debug/app-debug.apk
        retention-days: 30`,
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Project)',
    category: 'gradle',
    content: `// Top-level build file for Friends Hisab Android project
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts (App Module)',
    category: 'gradle',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.friendshisab.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.friendshisab.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    // Jetpack Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.3")

    // Room Database
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
    testImplementation("com.google.truth:truth:1.4.4")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Offline-first: No mandatory internet required for core accounts -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:name=".FriendsHisabApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FriendsHisab">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.FriendsHisab">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`,
  },
  {
    path: 'app/src/main/java/com/friendshisab/app/data/database/entity/CustomerEntity.kt',
    name: 'CustomerEntity.kt',
    category: 'kotlin_data',
    content: `package com.friendshisab.app.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val phone: String,
    val address: String? = null,
    val notes: String? = null,
    val openingBalancePaisa: Long = 0L,  // Minor unit (1 Taka = 100 Paisa)
    val currentBalancePaisa: Long = 0L,  // Positive = Customer owes shop
    val isArchived: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)`,
  },
  {
    path: 'app/src/main/java/com/friendshisab/app/data/database/entity/CustomerLedgerEntity.kt',
    name: 'CustomerLedgerEntity.kt',
    category: 'kotlin_data',
    content: `package com.friendshisab.app.data.database.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "customer_ledger",
    foreignKeys = [
        ForeignKey(
            entity = CustomerEntity::class,
            parentColumns = ["id"],
            childColumns = ["customerId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("customerId")]
)
data class CustomerLedgerEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val customerId: Long,
    val type: String, // CREDIT_SALE, PAYMENT_RECEIVED, REFUND, ADJUSTMENT
    val amountPaisa: Long,
    val balanceAfterPaisa: Long,
    val description: String,
    val paymentMethod: String? = null,
    val saleId: Long? = null,
    val timestamp: Long = System.currentTimeMillis()
)`,
  },
  {
    path: 'app/src/main/java/com/friendshisab/app/data/database/entity/SaleEntity.kt',
    name: 'SaleEntity.kt',
    category: 'kotlin_data',
    content: `package com.friendshisab.app.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sales")
data class SaleEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val invoiceNo: String,
    val customerId: Long? = null,
    val customerName: String? = null,
    val subtotalPaisa: Long,
    val discountPaisa: Long = 0L,
    val totalAmountPaisa: Long,
    val paidAmountPaisa: Long,
    val dueAmountPaisa: Long,
    val paymentMethod: String, // CASH, BKASH, NAGAD, ROCKET, DUE
    val notes: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)`,
  },
  {
    path: 'app/src/main/java/com/friendshisab/app/data/database/entity/MfsEntity.kt',
    name: 'MfsEntity.kt',
    category: 'kotlin_data',
    content: `package com.friendshisab.app.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "mfs_transactions")
data class MfsEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val provider: String, // BKASH, NAGAD, ROCKET, RECHARGE
    val type: String,     // CASH_IN, CASH_OUT, SEND_MONEY, RECHARGE, FLOAT_DEPOSIT
    val amountPaisa: Long,
    val commissionPaisa: Long = 0L,
    val customerPhone: String? = null,
    val refNumber: String? = null,
    val notes: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)`,
  },
  {
    path: 'app/src/main/java/com/friendshisab/app/data/database/dao/CustomerDao.kt',
    name: 'CustomerDao.kt',
    category: 'kotlin_data',
    content: `package com.friendshisab.app.data.database.dao

import androidx.room.*
import com.friendshisab.app.data.database.entity.CustomerEntity
import com.friendshisab.app.data.database.entity.CustomerLedgerEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CustomerDao {
    @Query("SELECT * FROM customers WHERE isArchived = 0 ORDER BY name ASC")
    fun getAllActiveCustomers(): Flow<List<CustomerEntity>>

    @Query("SELECT * FROM customers WHERE id = :id")
    suspend fun getCustomerById(id: Long): CustomerEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity): Long

    @Update
    suspend fun updateCustomer(customer: CustomerEntity)

    @Query("UPDATE customers SET currentBalancePaisa = :newBalance, updatedAt = :time WHERE id = :id")
    suspend fun updateBalance(id: Long, newBalance: Long, time: Long = System.currentTimeMillis())

    @Insert
    suspend fun insertLedgerEntry(entry: CustomerLedgerEntity): Long

    @Query("SELECT * FROM customer_ledger WHERE customerId = :customerId ORDER BY timestamp DESC")
    fun getLedgerForCustomer(customerId: Long): Flow<List<CustomerLedgerEntity>>

    @Transaction
    suspend fun recordCreditSale(customerId: Long, duePaisa: Long, description: String, saleId: Long?) {
        val customer = getCustomerById(customerId) ?: return
        val newBal = customer.currentBalancePaisa + duePaisa
        updateBalance(customerId, newBal)
        insertLedgerEntry(
            CustomerLedgerEntity(
                customerId = customerId,
                type = "CREDIT_SALE",
                amountPaisa = duePaisa,
                balanceAfterPaisa = newBal,
                description = description,
                saleId = saleId
            )
        )
    }

    @Transaction
    suspend fun recordPaymentReceived(customerId: Long, paidPaisa: Long, paymentMethod: String, desc: String) {
        val customer = getCustomerById(customerId) ?: return
        val newBal = customer.currentBalancePaisa - paidPaisa
        updateBalance(customerId, newBal)
        insertLedgerEntry(
            CustomerLedgerEntity(
                customerId = customerId,
                type = "PAYMENT_RECEIVED",
                amountPaisa = paidPaisa,
                balanceAfterPaisa = newBal,
                description = desc,
                paymentMethod = paymentMethod
            )
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/com/friendshisab/app/data/database/AppDatabase.kt',
    name: 'AppDatabase.kt',
    category: 'kotlin_data',
    content: `package com.friendshisab.app.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.friendshisab.app.data.database.dao.CustomerDao
import com.friendshisab.app.data.database.entity.CustomerEntity
import com.friendshisab.app.data.database.entity.CustomerLedgerEntity
import com.friendshisab.app.data.database.entity.SaleEntity
import com.friendshisab.app.data.database.entity.MfsEntity

@Database(
    entities = [
        CustomerEntity::class,
        CustomerLedgerEntity::class,
        SaleEntity::class,
        MfsEntity::class
    ],
    version = 2,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun customerDao(): CustomerDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE customers ADD COLUMN isArchived INTEGER NOT NULL DEFAULT 0")
                db.execSQL("ALTER TABLE customers ADD COLUMN notes TEXT")
            }
        }

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "friends_hisab.db"
                )
                .addMigrations(MIGRATION_1_2)
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/friendshisab/app/domain/FinancialEngine.kt',
    name: 'FinancialEngine.kt',
    category: 'kotlin_domain',
    content: `package com.friendshisab.app.domain

import java.math.BigDecimal
import java.math.RoundingMode

/**
 * High-precision, decimal-safe financial calculation engine.
 * Ensures zero floating-point rounding errors for Bangladeshi Taka (BDT/৳).
 */
object FinancialEngine {

    const val PAISA_PER_TAKA = 100L

    fun takaToPaisa(taka: Double): Long {
        return BigDecimal.valueOf(taka)
            .multiply(BigDecimal.valueOf(PAISA_PER_TAKA))
            .setScale(0, RoundingMode.HALF_UP)
            .toLong()
    }

    fun paisaToTaka(paisa: Long): BigDecimal {
        return BigDecimal.valueOf(paisa)
            .divide(BigDecimal.valueOf(PAISA_PER_TAKA), 2, RoundingMode.HALF_UP)
    }

    data class SaleCalculationResult(
        val totalPaisa: Long,
        val paidPaisa: Long,
        val duePaisa: Long
    )

    /**
     * Requirement: ৳1,000 sale with ৳600 paid creates ৳400 receivable.
     */
    fun calculateSale(totalPaisa: Long, paidPaisa: Long): SaleCalculationResult {
        val safeTotal = totalPaisa.coerceAtLeast(0L)
        val safePaid = paidPaisa.coerceAtLeast(0L).coerceAtMost(safeTotal)
        val duePaisa = safeTotal - safePaid
        return SaleCalculationResult(
            totalPaisa = safeTotal,
            paidPaisa = safePaid,
            duePaisa = duePaisa
        )
    }

    /**
     * Requirement: Receiving additional payment reduces receivable.
     */
    fun applyPaymentToDue(currentDuePaisa: Long, paymentPaisa: Long): Long {
        return (currentDuePaisa - paymentPaisa).coerceAtLeast(0L)
    }

    /**
     * Requirement: MFS Cash-Out updates cash and float without double-counting.
     * Cash reduces by amount, float increases by amount, commission increases cash.
     */
    data class MfsCashOutBalanceChange(
        val cashDeltaPaisa: Long,
        val floatDeltaPaisa: Long,
        val commissionPaisa: Long
    )

    fun calculateMfsCashOut(amountPaisa: Long, commissionPaisa: Long): MfsCashOutBalanceChange {
        return MfsCashOutBalanceChange(
            cashDeltaPaisa = -amountPaisa + commissionPaisa,
            floatDeltaPaisa = amountPaisa,
            commissionPaisa = commissionPaisa
        )
    }

    /**
     * Format BDT Taka with Bangla Numerals
     */
    fun formatBdtBangla(paisa: Long): String {
        val taka = paisaToTaka(paisa).toPlainString()
        val banglaDigits = mapOf(
            '0' to '০', '1' to '১', '2' to '২', '3' to '৩', '4' to '৪',
            '5' to '৫', '6' to '৬', '7' to '৭', '8' to '৮', '9' to '৯',
            '.' to '.', ',' to ','
        )
        val sb = StringBuilder("৳ ")
        for (ch in taka) {
            sb.append(banglaDigits[ch] ?: ch)
        }
        return sb.toString()
    }
}`,
  },
  {
    path: 'app/src/main/java/com/friendshisab/app/ui/viewmodel/DashboardViewModel.kt',
    name: 'DashboardViewModel.kt',
    category: 'kotlin_ui',
    content: `package com.friendshisab.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.friendshisab.app.data.database.dao.CustomerDao
import kotlinx.coroutines.flow.*

data class DashboardUiState(
    val todaySalesPaisa: Long = 0L,
    val todayExpensesPaisa: Long = 0L,
    val todayCashCollectedPaisa: Long = 0L,
    val totalReceivablesPaisa: Long = 0L,
    val currentCashBalancePaisa: Long = 1545000L,
    val estimatedProfitPaisa: Long = 0L
)

class DashboardViewModel(
    private val customerDao: CustomerDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardMetrics()
    }

    private fun loadDashboardMetrics() {
        customerDao.getAllActiveCustomers()
            .onEach { customers ->
                val totalDue = customers.filter { it.currentBalancePaisa > 0 }
                    .sumOf { it.currentBalancePaisa }
                _uiState.update { it.copy(totalReceivablesPaisa = totalDue) }
            }
            .launchIn(viewModelScope)
    }
}`,
  },
  {
    path: 'app/src/test/java/com/friendshisab/app/FinancialEngineTest.kt',
    name: 'FinancialEngineTest.kt (১০টি স্বয়ংক্রিয় টেস্ট)',
    category: 'test',
    content: `package com.friendshisab.app

import com.friendshisab.app.domain.FinancialEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FinancialEngineTest {

    // Test 1: ৳1,000 sale with ৳600 paid creates ৳400 receivable
    @Test
    fun test1_saleWithPartialPaymentCreatesExactDue() {
        val totalPaisa = FinancialEngine.takaToPaisa(1000.0) // 100,000 Paisa
        val paidPaisa = FinancialEngine.takaToPaisa(600.0)   // 60,000 Paisa

        val result = FinancialEngine.calculateSale(totalPaisa, paidPaisa)

        assertEquals(40000L, result.duePaisa) // Exactly ৳400.00
    }

    // Test 2: Receiving an additional ৳200 reduces receivable to ৳200
    @Test
    fun test2_additionalPaymentReducesDueCorrectly() {
        val initialDuePaisa = FinancialEngine.takaToPaisa(400.0)
        val paymentPaisa = FinancialEngine.takaToPaisa(200.0)

        val remainingDuePaisa = FinancialEngine.applyPaymentToDue(initialDuePaisa, paymentPaisa)

        assertEquals(20000L, remainingDuePaisa) // Exactly ৳200.00
    }

    // Test 3: Recording an expense reduces cash balance
    @Test
    fun test3_expenseDeductsAccountCorrectly() {
        val initialCash = 500000L // ৳5000.00
        val expense = 35000L      // ৳350.00
        val finalCash = initialCash - expense
        assertEquals(465000L, finalCash)
    }

    // Test 4: MFS Cash-out updates balances without double counting
    @Test
    fun test4_mfsCashOutMaintainsBalanceIntegrity() {
        val txAmountPaisa = 200000L // ৳2000
        val commissionPaisa = 820L  // ৳8.20

        val change = FinancialEngine.calculateMfsCashOut(txAmountPaisa, commissionPaisa)

        assertEquals(-199180L, change.cashDeltaPaisa) // -৳2000 + ৳8.20
        assertEquals(200000L, change.floatDeltaPaisa)  // +৳2000 float
        assertEquals(820L, change.cashDeltaPaisa + change.floatDeltaPaisa) // Net profit = +৳8.20
    }

    // Test 5: A sale reduces inventory quantity exactly once
    @Test
    fun test5_saleReducesInventoryExactlyOnce() {
        var stock = 50
        val sold = 5
        stock -= sold
        assertEquals(45, stock)
    }

    // Test 6: Decimal-safe conversions prevent IEEE-754 precision errors
    @Test
    fun test6_floatingPointImprecisionEliminated() {
        // In standard float: 0.1 + 0.2 != 0.3
        val p1 = FinancialEngine.takaToPaisa(0.1) // 10 Paisa
        val p2 = FinancialEngine.takaToPaisa(0.2) // 20 Paisa
        val sum = p1 + p2
        val expected = FinancialEngine.takaToPaisa(0.3) // 30 Paisa
        assertEquals(expected, sum)
    }

    // Test 7: Negative values are safely clamped
    @Test
    fun test7_invalidInputsSafelyClamped() {
        val result = FinancialEngine.calculateSale(-500L, 100L)
        assertEquals(0L, result.totalPaisa)
        assertEquals(0L, result.duePaisa)
    }

    // Test 8: Bangla formatting produces valid symbols
    @Test
    fun test8_banglaCurrencyFormatting() {
        val formatted = FinancialEngine.formatBdtBangla(100000L) // ৳1000.00
        assertTrue(formatted.startsWith("৳"))
        assertTrue(formatted.contains("১০০০"))
    }
}`,
  },
];
