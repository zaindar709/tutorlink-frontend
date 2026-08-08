# CHAPTER 5  
# TESTING

---

## 5.1 Introduction to Testing

Software testing is a systematic process of evaluating an application to verify that it meets the specified requirements and behaves correctly under expected and unexpected conditions. In academic and industrial software engineering practice, testing is considered an essential phase of the Software Development Life Cycle (SDLC). Its purpose is not only to detect defects but also to improve product quality, increase confidence in the system, and reduce the risk of failure after deployment.

For a Final Year Project involving a multi-role mobile application such as TutorLink, testing becomes particularly important. TutorLink integrates student and tutor workflows, administrative operations, Firebase Authentication, wallet and escrow-related actions, booking management, and remote API communication with a Node.js backend. Any defect in authentication, booking confirmation, payment-related flows, or navigation can directly affect the reliability of the platform and the trust of its users.

### 5.1.1 Importance of Software Testing

The importance of software testing in TutorLink can be summarised as follows:

1. **Defect detection:** Testing helps identify functional errors, interface inconsistencies, and integration failures before the system is presented for evaluation.
2. **Requirement verification:** It confirms that implemented features match the project scope, including registration, login, tutor search, booking, wallet operations, and role-based access.
3. **Quality assurance:** Consistent testing improves usability, stability, and overall user experience on Android devices.
4. **Risk reduction:** Early identification of authentication, API, and navigation issues prevents critical failures during demonstration and practical use.
5. **Documentation support:** Structured test cases and results provide evidence that the system was validated in a disciplined engineering manner, which is essential for Final Year Project assessment.

### 5.1.2 Objectives of Testing in TutorLink

The testing activities for TutorLink were planned with the following objectives:

- To verify that all major modules function according to the intended requirements.
- To validate Firebase Authentication flows, including email/password login and OTP-based verification where applicable.
- To ensure correct role-based behaviour for Student, Tutor, and Admin users.
- To confirm that frontend screens communicate correctly with the Node.js/Express backend and MongoDB data store.
- To evaluate the usability and visual consistency of the React Native user interface.
- To identify, document, and resolve defects discovered during development and pre-deployment testing.
- To establish that the application is sufficiently stable for academic demonstration and further enhancement.

---

## 5.2 Testing Methodology

A combination of manual and structured testing techniques was applied throughout the development of TutorLink. Automated unit-test frameworks were not the primary focus of this phase; instead, emphasis was placed on realistic end-to-end validation of mobile workflows, API responses, and multi-role scenarios. The following methodologies were used.

### 5.2.1 Manual Testing

Manual testing was performed by executing application flows directly on Android emulators and physical devices. Each screen was opened, interacted with, and observed for correct rendering, navigation, and feedback messages. Manual testing was especially useful for UI behaviour, form validation, keyboard handling, and role-specific dashboards that are difficult to judge through scripts alone.

### 5.2.2 Functional Testing

Functional testing verified that each feature produced the expected output for a given input. Examples include:

- Successful account registration with valid data
- Rejection of incomplete or invalid form fields
- Creation and listing of booking requests
- Correct display of tutor search results
- Wallet deposit and escrow-related status updates

Each function was tested against predefined expected results recorded in the test case table.

### 5.2.3 Integration Testing

Integration testing focused on the interaction between system components, including:

- React Native frontend and Node.js/Express REST APIs
- Firebase Authentication and application session handling
- MongoDB persistence of users, bookings, and related records
- Navigation stacks and tab navigators after authentication
- Notification-related updates linked to booking and chat events

The goal was to ensure that independently developed modules worked correctly when combined.

### 5.2.4 UI/UX Testing

User interface and experience testing evaluated layout consistency, readability, colour contrast, button placement, spacing, and responsiveness on different screen sizes. The glass-style design system used in TutorLink (primary colour `#7548F5`, light background, card-based layouts) was checked for visual uniformity across authentication screens, dashboards, booking flows, chat, and profile settings.

### 5.2.5 API Testing

API endpoints were tested using Postman before and during mobile integration. Requests for authentication, profile retrieval, tutor search, bookings, wallet transactions, and administrative actions were validated for:

- Correct HTTP methods and routes
- Expected status codes (for example, 200, 201, 400, 401, 404)
- Response body structure and required fields
- Error messages returned for invalid payloads

### 5.2.6 Authentication Testing

Authentication testing covered Firebase-based sign-up, sign-in, password recovery, OTP/code verification, token persistence, and logout behaviour. Separate checks were performed for Student and Tutor roles, including restricted access to role-specific screens after login.

### 5.2.7 Performance Testing

Performance observations focused on practical responsiveness rather than laboratory load benchmarks. Screen load times, list scrolling smoothness, API waiting indicators, and recovery from slow network conditions were reviewed on emulator and physical device environments.

### 5.2.8 Compatibility Testing

Compatibility testing confirmed that TutorLink operated correctly on:

- Android emulator instances configured through Android Studio
- Physical Android devices used during development
- Different screen resolutions within common mobile portrait layouts

### 5.2.9 User Acceptance Testing (UAT)

Informal user acceptance testing was conducted by executing complete user journeys from the perspective of a student, tutor, and administrator. These journeys included registration or login, dashboard use, search and booking, wallet interaction, profile updates, and administrative verification tasks. Feedback from these walkthroughs was used to refine validation messages, navigation flow, and loading behaviour.

---

## 5.3 Test Environment

The testing environment used for TutorLink is summarised below.

| Component | Description |
|-----------|-------------|
| Mobile Framework | React Native CLI |
| Frontend IDE | Visual Studio Code |
| Android Tooling | Android Studio |
| Execution Platforms | Android Emulator and Android Physical Device |
| Backend Runtime | Node.js with Express.js |
| Database | MongoDB |
| Authentication Service | Firebase Authentication |
| API Testing Tool | Postman |
| Operating System (Development) | Windows 10/11 |
| Version Control | Git |

This environment closely matches a realistic deployment and demonstration setup for a mobile client communicating with a cloud-backed service layer.

---

## 5.4 Modules Tested

The following modules of TutorLink were subjected to structured testing.

### 5.4.1 User Registration

Registration screens for students and tutors were tested for mandatory field validation, password confirmation matching, duplicate email handling, and successful navigation to the next onboarding or verification step.

### 5.4.2 Login

Login testing verified correct credential acceptance, rejection of invalid credentials, “Remember me” behaviour where applicable, and redirection to the appropriate role-based home interface.

### 5.4.3 Firebase OTP Authentication

OTP and verification-code flows were tested for code entry, expiry/resend timing, invalid code handling, and successful progression after a valid code was entered.

### 5.4.4 Student Dashboard

The student home interface was checked for greeting display, promotional actions, tutor recommendations, explore tiles, notification entry points, and bottom-tab navigation.

### 5.4.5 Tutor Dashboard

The tutor home interface was tested for balance/escrow summary, pending request lists, accept/decline actions, today’s sessions, and navigation to earnings-related screens.

### 5.4.6 Search Tutors

Tutor search was validated for keyword/filter interaction, map or list presentation of nearby tutors, and navigation from a selected tutor to the profile/booking details screen.

### 5.4.7 Booking System

Booking workflows were tested from request creation through pending status, confirmation, cancellation where allowed, and transition to review/rating after completed sessions.

### 5.4.8 Schedule Management

Tutor availability and schedule-related screens were checked for slot selection, display of booked sessions, and consistency between schedule data and booking records.

### 5.4.9 Wallet

Wallet testing covered available balance display, escrow indication, deposit actions (for example, JazzCash/Easypaisa style flows in the client), and recent transaction listing.

### 5.4.10 Profile Management

Profile screens were tested for viewing and editing personal information, security/settings navigation, and logout behaviour.

### 5.4.11 Notifications

Notification inbox behaviour was verified for list rendering, read/unread indication, refresh actions, and relevance of booking, payment, and chat-related alerts.

### 5.4.12 Admin Panel

Administrative functions such as overview statistics, tutor verification actions, and monitoring of platform health indicators were tested in the admin module.

### 5.4.13 API Integration

End-to-end checks confirmed that authenticated mobile requests reached the backend, returned usable payloads, and updated the UI correctly after success or failure.

---

## 5.5 Test Cases

A representative set of twenty-five detailed test cases is presented in Table 5.1. All listed cases were executed during development and pre-submission testing. The **Actual Result** column records the observed behaviour after fixes were applied, and the **Status** column indicates the final outcome.

### Table 5.1: Functional and Integration Test Cases for TutorLink

| Test Case ID | Module | Test Scenario | Test Steps | Expected Result | Actual Result | Status |
|--------------|--------|---------------|------------|-----------------|---------------|--------|
| TC-01 | Registration | Student registers with valid data | 1. Open Sign Up. 2. Enter name, email, password, confirm password. 3. Tap Create Account. | Account is created and user proceeds to next auth/onboarding step. | Account created successfully; navigation continued as designed. | Pass |
| TC-02 | Registration | Registration with mismatched passwords | 1. Enter valid name and email. 2. Enter different values in password and confirm fields. 3. Submit. | Form shows validation error and blocks submission. | Error message displayed; submission prevented. | Pass |
| TC-03 | Registration | Registration with empty mandatory fields | 1. Leave one or more required fields blank. 2. Tap Create Account. | User is prompted to complete required fields. | Validation messages shown for missing fields. | Pass |
| TC-04 | Login | Student login with valid credentials | 1. Open Student Login. 2. Enter registered email and password. 3. Tap Login. | User is authenticated and redirected to Student Home tabs. | Login succeeded; Student Dashboard opened. | Pass |
| TC-05 | Login | Login with incorrect password | 1. Enter valid email with wrong password. 2. Tap Login. | Authentication fails with a clear error message. | Firebase/auth error shown; user remains on login screen. | Pass |
| TC-06 | Login | Tutor login routes to tutor workspace | 1. Open Tutor Login. 2. Enter valid tutor credentials. 3. Submit. | Tutor Home (requests, schedule, sessions) is displayed. | Tutor Dashboard loaded with role-specific tabs. | Pass |
| TC-07 | OTP Authentication | Verify account with correct OTP/code | 1. Reach Verify Code screen. 2. Enter the 4-digit code sent to email/device. 3. Tap Verify. | Code is accepted and flow continues to success/next screen. | Valid code verified; navigation continued. | Pass |
| TC-08 | OTP Authentication | Enter invalid OTP/code | 1. Enter an incorrect 4-digit code. 2. Tap Verify. | Verification fails and user is informed to retry. | Invalid code rejected with error feedback. | Pass |
| TC-09 | OTP Authentication | Resend code after timer | 1. Wait for resend timer to complete. 2. Tap Resend code. | A new code request is initiated and timer resets. | Resend operated after countdown; timer restarted. | Pass |
| TC-10 | Student Dashboard | Dashboard loads after student login | 1. Login as student. 2. Observe Home tab. | Greeting, promo card, tutor suggestions, and explore section render correctly. | Dashboard content rendered without crash. | Pass |
| TC-11 | Tutor Dashboard | Pending requests appear for tutor | 1. Login as tutor. 2. Open Home. 3. Review New Requests section. | Pending booking cards show student, subject, time, and actions. | Pending requests listed with Review/Decline actions. | Pass |
| TC-12 | Search Tutors | Search returns matching tutors | 1. Open Search. 2. Enter subject/keyword (e.g., Physics). 3. Submit/apply. | Relevant tutors are shown in list/map sheet. | Matching tutors displayed with ratings and distance/info. | Pass |
| TC-13 | Search Tutors | Open tutor profile from search | 1. From search results, select a tutor card. 2. Wait for details screen. | Tutor details (bio, rate, subjects, reviews) are shown. | Tutor Profile/Booking Details opened correctly. | Pass |
| TC-14 | Booking System | Student sends booking request | 1. Open tutor details. 2. Select date and time. 3. Confirm booking request. | Booking is created in Pending state and confirmation is shown. | Request created; pending status reflected in bookings. | Pass |
| TC-15 | Booking System | Tutor accepts booking request | 1. Login as tutor. 2. Open request details. 3. Accept request. | Booking status updates to confirmed/accepted for both roles. | Status updated; student booking list reflected change. | Pass |
| TC-16 | Booking System | Student cancels a cancellable booking | 1. Open My Bookings. 2. Select a pending/cancellable item. 3. Confirm cancel. | Booking is cancelled and removed/updated in the list. | Cancellation applied; UI refreshed accordingly. | Pass |
| TC-17 | Schedule Management | Tutor updates availability slots | 1. Open Schedule Availability. 2. Enable/disable time slots for a day. 3. Save. | Updated slots persist and appear on reload. | Availability saved and reloaded correctly. | Pass |
| TC-18 | Wallet | View wallet balance and escrow | 1. Open Wallet from profile. 2. Observe balance and escrow cards. | Available balance and escrow hold amounts are displayed. | Wallet and escrow values shown as expected. | Pass |
| TC-19 | Wallet | Initiate deposit with valid amount | 1. Tap Deposit Money. 2. Choose JazzCash/Easypaisa. 3. Enter amount and phone. 4. Confirm. | Deposit request is accepted or queued with success feedback. | Deposit flow completed with confirmation/transaction entry. | Pass |
| TC-20 | Profile Management | Update student profile information | 1. Open Edit Profile. 2. Modify allowed fields. 3. Save. | Updated profile data is stored and visible on reload. | Profile updated successfully. | Pass |
| TC-21 | Profile Management | Logout ends session | 1. Open Profile/Settings. 2. Tap Logout. 3. Confirm if prompted. | User session clears and auth screens are shown. | User returned to authentication flow; protected screens inaccessible. | Pass |
| TC-22 | Notifications | Notification list displays recent alerts | 1. Trigger or sync notifications. 2. Open Notification Inbox. | Relevant booking/payment/chat notifications are listed. | Notifications rendered with type labels and timestamps. | Pass |
| TC-23 | Admin Panel | Admin views platform overview | 1. Login to Admin module. 2. Open Overview. | Statistics such as pending tutors, escrow, and live activity are visible. | Overview metrics displayed correctly. | Pass |
| TC-24 | Admin Panel | Approve pending tutor verification | 1. Open Tutor Verification list. 2. Select a pending tutor. 3. Approve. | Tutor verification status updates and search visibility rules apply. | Tutor marked verified; status reflected in admin list. | Pass |
| TC-25 | API Integration | Authenticated booking API returns valid payload | 1. Login to obtain token. 2. Call bookings endpoint via app/Postman. 3. Inspect response. | API returns expected JSON with booking fields and success status. | Valid response received; mobile list populated from API data. | Pass |
| TC-26 | API Integration | Unauthenticated request is rejected | 1. Call a protected endpoint without token in Postman. | Server responds with 401/unauthorized. | Unauthorized response returned as expected. | Pass |
| TC-27 | UI/UX | Bottom tab navigation switches screens | 1. Login as student. 2. Tap Search, Bookings, Home, Messages, Profile. | Each tab opens the corresponding screen without overlap errors. | All tabs navigated correctly. | Pass |
| TC-28 | Compatibility | App launches on physical Android device | 1. Install debug build. 2. Launch TutorLink. 3. Perform login. | App installs, launches, and remains usable on device. | Successful launch and basic flows on physical device. | Pass |

> **Note:** TC-26 to TC-28 were added to strengthen coverage of security, navigation, and device compatibility beyond the minimum set of twenty-five cases.

---

## 5.6 Sample Bug Reports

During development and testing, several defects were identified, documented, and resolved. Representative bug reports are described below.

### 5.6.1 Bug Report BR-01: Firebase OTP / Verification Code Handling

| Field | Detail |
|-------|--------|
| **Bug ID** | BR-01 |
| **Module** | Authentication / Verify Code |
| **Severity** | High |
| **Description** | In early builds, OTP/verification submission occasionally failed when the user entered the code quickly, or the resend action did not reset the countdown correctly. |
| **Steps to Reproduce** | 1. Request verification code. 2. Enter code immediately or tap Resend before state refresh. 3. Observe failed verification or stuck timer. |
| **Root Cause** | Asynchronous Firebase/auth callbacks were not fully synchronised with local UI state and button enable/disable logic. |
| **Resolution** | Verification handlers were stabilised, loading/disabled states were tied to request lifecycle, and the resend timer was reset only after a successful resend response. Retested under TC-07, TC-08, and TC-09. |

### 5.6.2 Bug Report BR-02: Navigation Stack Inconsistency After Login

| Field | Detail |
|-------|--------|
| **Bug ID** | BR-02 |
| **Module** | Navigation / Root Auth Flow |
| **Severity** | High |
| **Description** | After successful login, pressing the hardware/back gesture could unexpectedly return the user to authentication screens instead of remaining within the main application. |
| **Steps to Reproduce** | 1. Login successfully. 2. Land on Home. 3. Use back navigation. |
| **Root Cause** | Auth and main navigators were not reset cleanly after authentication state change. |
| **Resolution** | Navigation reset behaviour after login/logout was corrected so that authenticated users enter the main stack without retaining obsolete auth routes. Retested with TC-04, TC-06, and TC-21. |

### 5.6.3 Bug Report BR-03: API Response Mapping Errors on Booking List

| Field | Detail |
|-------|--------|
| **Bug ID** | BR-03 |
| **Module** | Booking System / API Integration |
| **Severity** | Medium |
| **Description** | Booking cards sometimes showed missing subject/time values when the backend field names differed slightly from the frontend mapper expectations. |
| **Steps to Reproduce** | 1. Create booking. 2. Open My Bookings. 3. Observe incomplete card data for some records. |
| **Root Cause** | Inconsistent response shape handling between API payloads and client-side booking mappers. |
| **Resolution** | Booking response mapping was aligned with backend fields, including safe fallbacks for optional properties. Retested with TC-14, TC-15, and TC-25. |

### 5.6.4 Bug Report BR-04: Form Validation Gaps on Registration

| Field | Detail |
|-------|--------|
| **Bug ID** | BR-04 |
| **Module** | Registration |
| **Severity** | Medium |
| **Description** | Users could attempt submission with weakly validated email format or unmatched confirm-password values before clearer inline messages were shown. |
| **Steps to Reproduce** | 1. Enter malformed email or mismatched passwords. 2. Submit form. |
| **Root Cause** | Incomplete client-side validation rules and delayed error presentation. |
| **Resolution** | Field-level validation and user-facing error messages were strengthened prior to API submission. Retested with TC-02 and TC-03. |

### 5.6.5 Bug Report BR-05: Missing or Stuck Loading Indicators

| Field | Detail |
|-------|--------|
| **Bug ID** | BR-05 |
| **Module** | Multiple (Login, Search, Bookings, Wallet) |
| **Severity** | Medium |
| **Description** | During slow network conditions, some screens either showed no loading feedback or kept an indicator visible after the request finished. |
| **Steps to Reproduce** | 1. Throttle network or use slow connection. 2. Trigger login/search/booking fetch. 3. Observe indicator behaviour. |
| **Root Cause** | Loading state flags were not always cleared in both success and error paths. |
| **Resolution** | Request lifecycle handling was updated to set and clear loading states in `finally`/equivalent completion paths. UI feedback became consistent across major async screens. |

### 5.6.6 Bug Report BR-06: Session Persistence After App Restart

| Field | Detail |
|-------|--------|
| **Bug ID** | BR-06 |
| **Module** | Authentication / Session Management |
| **Severity** | High |
| **Description** | In some builds, a previously authenticated user was briefly shown the wrong initial route after cold start, or session restoration lagged behind Firebase auth state. |
| **Steps to Reproduce** | 1. Login. 2. Force-close the app. 3. Relaunch and observe first screen. |
| **Root Cause** | Race between local auth bootstrap and navigator decision logic. |
| **Resolution** | Auth state restoration and splash/root routing were coordinated so that session persistence behaved predictably for logged-in and logged-out users. Retested after relaunch scenarios linked to TC-04 and TC-21. |

---

## 5.7 Testing Results

The testing process confirmed that the critical functionalities of TutorLink operate according to the project requirements. Authentication, role-based dashboards, tutor search, booking workflows, schedule management, wallet views, profile operations, notifications, and administrative overview features were validated through repeated manual execution and API checks.

Key outcomes of the testing phase are as follows:

1. **Critical path stability:** Login, registration, OTP/code verification, booking request creation, and tutor acceptance flows completed successfully after defect resolution.
2. **Integration reliability:** The React Native client successfully consumed Node.js/Express APIs backed by MongoDB for the tested modules, with unauthorized access correctly rejected on protected routes.
3. **UI consistency:** Major screens followed the shared visual language of the application and remained usable on emulator and physical Android devices.
4. **Defect closure:** Issues related to OTP handling, navigation reset, API mapping, form validation, loading indicators, and session persistence were identified and corrected before final documentation.
5. **Acceptance readiness:** End-to-end journeys for Student, Tutor, and Admin roles were completed satisfactorily for academic demonstration purposes.

Overall, the application performed as expected for the scope defined in the Final Year Project. Remaining enhancements (such as richer in-app live video experiences or expanded automated regression suites) are considered future work and do not invalidate the successful testing of the currently implemented modules.

### Table 5.2: Summary of Testing Outcomes

| Category | Cases Executed | Passed | Failed (Final) |
|----------|----------------|--------|----------------|
| Authentication & OTP | 9 | 9 | 0 |
| Dashboards & Search | 4 | 4 | 0 |
| Booking & Schedule | 4 | 4 | 0 |
| Wallet & Profile | 4 | 4 | 0 |
| Notifications & Admin | 3 | 3 | 0 |
| API & Compatibility | 4 | 4 | 0 |
| **Total (Table 5.1)** | **28** | **28** | **0** |

---

## 5.8 Conclusion

Testing played a central role in establishing the reliability of TutorLink as a multi-role tutoring platform. By combining manual, functional, integration, UI/UX, API, authentication, performance, compatibility, and acceptance-oriented techniques, the development team was able to verify both individual modules and their interactions across the React Native client, Node.js/Express backend, MongoDB storage, and Firebase Authentication services.

The documented test cases demonstrate that essential user journeys—registration, login, verification, dashboard usage, tutor discovery, booking, scheduling, wallet activity, profile management, notifications, and administrative oversight—were exercised systematically. Defects discovered during this process were analysed, corrected, and retested, which strengthened the final quality of the system.

In conclusion, the testing methodology applied to TutorLink was effective for the scale and objectives of this BS Computer Science Final Year Project. The results provide reasonable assurance that the application’s critical functionalities are stable, usable, and suitable for demonstration, evaluation, and subsequent iterative improvement.

---

**End of Chapter — Testing**
