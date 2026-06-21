#!/usr/bin/env node
/**
 * Desktop notification — sends system notification when agent completes
 * Uses node-notifier or osascript (macOS) / notify-send (Linux)
 */
const { execSync } = require('child_process');

const title = process.argv[2] || 'Agent Response Ready';
const message = process.argv[3] || 'OpenCode agent has completed.';
const platform = process.platform;

function notify() {
  try {
    // Try node-notifier first
    const notifier = require('node-notifier');
    notifier.notify({ title, message, sound: true });
    return true;
  } catch {
    // Fallback to OS-native
    if (platform === 'darwin') {
      execSync(`osascript -e 'display notification "${message}" with title "${title}"'`);
    } else if (platform === 'linux') {
      execSync(`notify-send "${title}" "${message}"`);
    } else if (platform === 'win32') {
      execSync(`powershell -c "New-BurntToastNotification -Text '${title}', '${message}'"`);
    }
    return true;
  }
}

try {
  notify();
  console.log(`Notification sent: ${title}`);
} catch (e) {
  console.log(`Notification failed: ${e.message}`);
}
