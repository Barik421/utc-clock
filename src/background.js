const ALARM_NAME = "update_utc_badge";
const ALARM_PERIOD_MINUTES = 1;
const STORAGE_TOOLBAR_TIME_KEY = "utc_clock_toolbar_time_enabled";

function getUtcBadgeTime() {
  const now = new Date();
  const hours = now.getUTCHours();
  const mins = String(now.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${mins}`;
}

function updateToolbarClock() {
  const badgeTime = getUtcBadgeTime();
  chrome.storage.sync.get([STORAGE_TOOLBAR_TIME_KEY], (result) => {
    const enabled = result[STORAGE_TOOLBAR_TIME_KEY] !== false;
    if (!enabled) {
      chrome.action.setBadgeText({ text: "" });
      chrome.action.setTitle({ title: "UTC Clock" });
      return;
    }

    chrome.action.setBadgeBackgroundColor({ color: "#efe7d0" });
    if (typeof chrome.action.setBadgeTextColor === "function") {
      chrome.action.setBadgeTextColor({ color: "#1f2128" });
    }
    chrome.action.setBadgeText({ text: badgeTime });
    chrome.action.setTitle({ title: `UTC ${badgeTime}` });
  });
}

function ensureAlarm() {
  const now = new Date();
  const nextMinute = new Date(now);
  nextMinute.setUTCSeconds(0, 0);
  nextMinute.setUTCMinutes(nextMinute.getUTCMinutes() + 1);

  chrome.alarms.create(ALARM_NAME, {
    when: nextMinute.getTime(),
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

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "toolbar-time-updated") {
    updateToolbarClock();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes[STORAGE_TOOLBAR_TIME_KEY]) {
    updateToolbarClock();
  }
});

updateToolbarClock();
