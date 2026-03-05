const STORAGE_KEY = "utc_clock_language";
const STORAGE_THEME_KEY = "utc_clock_theme";
const STORAGE_TOOLBAR_TIME_KEY = "utc_clock_toolbar_time_enabled";
const POPUP_MIN_WIDTH = 320;
const POPUP_MAX_WIDTH = 400;

const dictionary = {
  en: {
    now: "Current UTC time",
    settings: "Settings",
    settingsClose: "Close settings",
    language: "Language",
    theme: "Theme",
    toolbarTime: "Toolbar time",
    on: "On",
    off: "Off",
    light: "Light",
    dark: "Dark",
    openUtc: "Open UTC"
  },
  uk: {
    now: "Поточний час UTC",
    settings: "Налаштування",
    settingsClose: "Закрити налаштування",
    language: "Мова",
    theme: "Тема",
    toolbarTime: "Час на іконці",
    on: "Увімкнено",
    off: "Вимкнено",
    light: "Світла",
    dark: "Темна",
    openUtc: "Відкрити UTC"
  }
};

let currentLanguage = "en";
let currentTheme = "light";
let toolbarTimeEnabled = true;
let settingsOpen = false;
let lastToolbarMinute = "";

const el = {
  labelNow: document.getElementById("labelNow"),
  utcTime: document.getElementById("utcTime"),
  utcDate: document.getElementById("utcDate"),
  settingsPanel: document.getElementById("settingsPanel"),
  settingsTitle: document.getElementById("settingsTitle"),
  languageTitle: document.getElementById("languageTitle"),
  themeTitle: document.getElementById("themeTitle"),
  toolbarTimeTitle: document.getElementById("toolbarTimeTitle"),
  toggleSettings: document.getElementById("toggleSettings"),
  openUtcLink: document.getElementById("openUtcLink"),
  langEn: document.getElementById("langEn"),
  langUk: document.getElementById("langUk"),
  themeLight: document.getElementById("themeLight"),
  themeDark: document.getElementById("themeDark"),
  toolbarTimeOn: document.getElementById("toolbarTimeOn"),
  toolbarTimeOff: document.getElementById("toolbarTimeOff")
};

function ensurePopupWidth() {
  const safeWidth = Math.max(
    POPUP_MIN_WIDTH,
    Math.min(POPUP_MAX_WIDTH, window.screen?.availWidth ? window.screen.availWidth - 32 : POPUP_MAX_WIDTH)
  );
  document.documentElement.style.width = `${safeWidth}px`;
}

function getDateFormatter(language) {
  return new Intl.DateTimeFormat(language === "uk" ? "uk-UA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}

function updateClock() {
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2, "0");
  const m = String(now.getUTCMinutes()).padStart(2, "0");
  const s = String(now.getUTCSeconds()).padStart(2, "0");
  const minuteKey = `${now.getUTCHours()}:${m}`;

  el.utcTime.textContent = `${h}:${m}:${s}`;
  el.utcDate.textContent = getDateFormatter(currentLanguage).format(now);

  if (minuteKey !== lastToolbarMinute) {
    lastToolbarMinute = minuteKey;
    notifyToolbarUpdate();
  }
}

function updateLanguageUi() {
  const t = dictionary[currentLanguage];
  el.labelNow.textContent = t.now;
  el.settingsTitle.textContent = t.settings;
  el.languageTitle.textContent = t.language;
  el.themeTitle.textContent = t.theme;
  el.toolbarTimeTitle.textContent = t.toolbarTime;
  el.openUtcLink.textContent = t.openUtc;
  el.toggleSettings.textContent = settingsOpen ? t.settingsClose : t.settings;
  el.themeLight.textContent = t.light;
  el.themeDark.textContent = t.dark;
  el.toolbarTimeOn.textContent = t.on;
  el.toolbarTimeOff.textContent = t.off;

  el.langEn.classList.toggle("active", currentLanguage === "en");
  el.langUk.classList.toggle("active", currentLanguage === "uk");
  el.themeLight.classList.toggle("active", currentTheme === "light");
  el.themeDark.classList.toggle("active", currentTheme === "dark");
  el.toolbarTimeOn.classList.toggle("active", toolbarTimeEnabled);
  el.toolbarTimeOff.classList.toggle("active", !toolbarTimeEnabled);

  document.documentElement.lang = currentLanguage;
  updateClock();
}

function setLanguage(language) {
  currentLanguage = language;
  chrome.storage.sync.set({ [STORAGE_KEY]: language });
  updateLanguageUi();
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
}

function setTheme(theme) {
  currentTheme = theme;
  applyTheme(theme);
  chrome.storage.sync.set({ [STORAGE_THEME_KEY]: theme });
  updateLanguageUi();
}

function notifyToolbarUpdate() {
  try {
    chrome.runtime.sendMessage({ type: "toolbar-time-updated" }, () => {
      void chrome.runtime.lastError;
    });
  } catch (_error) {
    // Ignore transient messaging errors when background is unavailable.
  }
}

function setToolbarTimeEnabled(enabled) {
  toolbarTimeEnabled = enabled;
  chrome.storage.sync.set({ [STORAGE_TOOLBAR_TIME_KEY]: enabled }, () => {
    notifyToolbarUpdate();
  });
  updateLanguageUi();
}

function setSettingsOpen(value) {
  settingsOpen = value;
  el.settingsPanel.classList.toggle("visible", settingsOpen);
  updateLanguageUi();
}

function initState() {
  ensurePopupWidth();
  chrome.storage.sync.get([STORAGE_KEY, STORAGE_THEME_KEY, STORAGE_TOOLBAR_TIME_KEY], (result) => {
    const saved = result[STORAGE_KEY];
    const savedTheme = result[STORAGE_THEME_KEY];
    const savedToolbarTime = result[STORAGE_TOOLBAR_TIME_KEY];

    if (saved === "uk" || saved === "en") {
      currentLanguage = saved;
    }
    if (savedTheme === "dark" || savedTheme === "light") {
      currentTheme = savedTheme;
    }
    if (typeof savedToolbarTime === "boolean") {
      toolbarTimeEnabled = savedToolbarTime;
    }

    applyTheme(currentTheme);
    updateLanguageUi();
    updateClock();
    setInterval(updateClock, 1000);
  });
}

el.toggleSettings.addEventListener("click", () => {
  setSettingsOpen(!settingsOpen);
});

el.langEn.addEventListener("click", () => setLanguage("en"));
el.langUk.addEventListener("click", () => setLanguage("uk"));
el.themeLight.addEventListener("click", () => setTheme("light"));
el.themeDark.addEventListener("click", () => setTheme("dark"));
el.toolbarTimeOn.addEventListener("click", () => setToolbarTimeEnabled(true));
el.toolbarTimeOff.addEventListener("click", () => setToolbarTimeEnabled(false));

initState();
