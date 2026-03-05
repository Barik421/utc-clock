const ALARM_NAME = "update_utc_badge";
const ALARM_PERIOD_MINUTES = 1;

function getUtcBadgeTime() {
  const now = new Date();
  const hours = now.getUTCHours();
  const mins = String(now.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${mins}`;
}

function updateToolbarClock() {
  const badgeTime = getUtcBadgeTime();

  chrome.action.setBadgeBackgroundColor({ color: "#efe7d0" });
  if (typeof chrome.action.setBadgeTextColor === "function") {
    chrome.action.setBadgeTextColor({ color: "#1f2128" });
  }
  chrome.action.setBadgeText({ text: badgeTime });
  chrome.action.setTitle({ title: `UTC ${badgeTime}` });
}

function ensureAlarm() {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: ALARM_PERIOD_MINUTES
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureAlarm();
  updateToolbarClock();
});

chrome.runtime.onStartup.addListener(() => {
  ensureAlarm();
  updateToolbarClock();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    updateToolbarClock();
  }
});

updateToolbarClock();
