# iOS / Swift Security (Universal)

## Keychain for Secrets — NOT UserDefaults or Plist

```swift
// BAD — secrets in UserDefaults or plist (plaintext, no access control)
UserDefaults.standard.set("sk-proj-xxxxx", forKey: "apiKey")
try? JSONEncoder().encode(secrets).write(to: plistURL)

// GOOD — Keychain via Security framework
import Security

struct KeychainManager {
    static func save(key: String, data: Data) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        SecItemDelete(query as CFDictionary)  // remove existing
        SecItemAdd(query as CFDictionary, nil)
    }

    static func read(key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        SecItemCopyMatching(query as CFDictionary, &result)
        return result as? Data
    }
}
```

## Hardcoded API Keys / Secrets

```swift
// BAD — hardcoded in source, committed to git
let apiKey = "sk-proj-A1B2C3D4E5F6G7H8I9J0"

// BAD — in Info.plist (plaintext visible in binary)
// Info.plist: <key>API_KEY</key><string>sk-xxxxx</string>

// GOOD — fetched from server at first launch, stored in Keychain
func fetchAndStoreAPIKey() async throws {
    let config = try await api.fetchAppConfig()
    try KeychainManager.save(key: "apiKey", data: Data(config.apiKey.utf8))
}

// GOOD — injected at build time via environment + stripped from binary
// Build Settings: OTHER_SWIFT_FLAGS = -DAPI_KEY=$(API_KEY)
#if API_KEY
let apiKey = "\(API_KEY)"
#else
let apiKey = ""  // fail at runtime if not configured
#endif
```

## ATS (App Transport Security) — No Exceptions in Production

```xml
<!-- BAD — disabling ATS entirely (MITM vulnerable) -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

<!-- GOOD — ATS enabled with minimal, audited exceptions -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>api.trusted-cdn.example.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSIncludesSubdomains</key>
            <false/>
            <key>NSRequiresCertificateTransparency</key>
            <true/>
        </dict>
    </dict>
</dict>

<!-- GOOD — per-domain exception for development only (Debug build) -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>  <!-- allows localhost for dev, no external bypass -->
</dict>
```

## Data Protection Levels

```swift
// BAD — no file protection (accessible when locked or backed up unencrypted)
try data.write(to: fileURL)

// BAD — Keychain item accessible after device unlock, no backup protection
kSecAttrAccessible as String: kSecAttrAccessibleAlways

// GOOD — complete protection when device is locked
try data.write(to: fileURL, options: .completeFileProtection)

// GOOD — Keychain accessible only when unlocked, not backed up
kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly

// GOOD — Keychain item deleted on device lock (ephemeral tokens)
kSecAttrAccessible as String: kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
```

## Biometric Auth (FaceID / TouchID)

```swift
// BAD — no biometric protection for sensitive operations
deleteAllUserData()  // no auth prompt

// BAD — storing biometric state in UserDefaults (can be toggled by attacker)
UserDefaults.standard.set(true, forKey: "biometric_enabled")

// GOOD — LAContext with biometric evaluation
import LocalAuthentication

func authenticateUser(reason: String) async -> Bool {
    let context = LAContext()
    context.localizedReason = reason
    context.localizedFallbackTitle = "Enter Passcode"

    var error: NSError?
    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        return false  // biometrics not available
    }

    return await withCheckedContinuation { continuation in
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                               localizedReason: reason) { success, error in
            if let error = error {
                // Log auth failure, do NOT expose error details to user
                os_log("Biometric auth failed: %{public}@", log: .default, type: .error,
                       error.localizedDescription)
            }
            continuation.resume(returning: success)
        }
    }
}
```

## Code Injection Prevention

```swift
// BAD — evaluateJavaScript with user-controlled input (XSS vector)
webView.evaluateJavaScript("document.body.innerHTML = '\(userInput)'")

// BAD — UIWebView (deprecated, no modern security)
let webView = UIWebView()

// BAD — JSContext from user-controlled data (full code execution)
let context = JSContext()
context?.evaluateScript("\(userInput)")

// GOOD — WKWebView with JavaScript disabled if not needed
import WebKit

let config = WKWebViewConfiguration()
config.preferences.javaScriptEnabled = false  // disable unless required
// If JS is required, use content-world isolation:
let userScript = WKUserScript(source: sanitizedScript,
                              injectionTime: .atDocumentEnd,
                              forMainFrameOnly: true)
config.userContentController.addUserScript(userScript)

// GOOD — parameterized JavaScript (never interpolate user input)
let safeArg = (userInput as NSString).addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
webView.evaluateJavaScript("updateData('\(safeArg)')")

// GOOD — validate and sandbox received data
func handleJSMessage(_ message: WKScriptMessage) {
    guard message.name == "validHandler",
          let dict = message.body as? [String: Any],
          let action = dict["action"] as? String,
          allowedActions.contains(action) else {
        return  // reject unknown messages
    }
}
```

## URL Scheme Validation

```swift
// BAD — opening URL without validation (universal link hijacking)
UIApplication.shared.open(url)

// BAD — accepting any URL scheme (including untrusted custom schemes)
func application(_ app: UIApplication, open url: URL,
                 options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    // Processes url without checking if it's a trusted source
    handleDeepLink(url)
}

// GOOD — validate URL scheme, host, and path before opening
func handleIncomingURL(_ url: URL) -> Bool {
    guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
        return false
    }

    // Validate scheme
    guard components.scheme == "myapp" || components.scheme == "https" else {
        os_log("Rejected URL with untrusted scheme: %{public}@",
               log: .default, type: .error, components.scheme ?? "nil")
        return false
    }

    // Validate host for universal links
    if components.scheme == "https" {
        guard components.host == "myapp.example.com" else {
            return false  // reject universal link from unknown host
        }
    }

    // Validate path against allowlist
    let allowedPaths: Set = ["/profile", "/settings", "/order"]
    guard allowedPaths.contains(components.path) else {
        return false
    }

    return handleDeepLink(url)
}
```

## WebView Security

```swift
// BAD — no restrictions on WebView content
let webView = WKWebView()

// GOOD — secure WKWebView configuration
func createSecureWebView() -> WKWebView {
    let config = WKWebViewConfiguration()

    // Disable auto-loading of remote content
    config.websiteDataStore = .nonPersistent()

    // Disable 3rd party cookie access
    config.preferences.javaScriptCanOpenWindowsAutomatically = false

    // Set up content controller with validated message handlers
    let controller = WKUserContentController()
    controller.add(LeakAvoider(delegate: self), name: "validHandler")
    config.userContentController = controller

    // Only allow HTTPS
    let webView = WKWebView(frame: .zero, configuration: config)
    webView.navigationDelegate = self
    return webView
}

// GOOD — reject non-HTTPS loads
func webView(_ webView: WKWebView,
             decidePolicyFor navigationAction: WKNavigationAction,
             decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    guard let url = navigationAction.request.url else {
        decisionHandler(.cancel)
        return
    }

    guard url.scheme == "https" || url.scheme == "file" else {
        decisionHandler(.cancel)
        return
    }

    decisionHandler(.allow)
}
```
