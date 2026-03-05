const STORAGE_KEY = "utc_clock_language";

const dictionary = {
  en: {
    now: "Current UTC time",
    settings: "Settings",
    settingsClose: "Close settings",
    language: "Language",
    openUtc: "Open UTC"
  },
  uk: {
    now: "Поточний час UTC",
    settings: "Налаштування",
    settingsClose: "Закрити налаштування",
    language: "Мова",
    openUtc: "Відкрити UTC"
  }
};

let currentLanguage = "en";
let settingsOpen = false;

const el = {
  labelNow: document.getElementById("labelNow"),
  utcTime: document.getElementById("utcTime"),
  utcDate: document.getElementById("utcDate"),
  settingsPanel: document.getElementById("settingsPanel"),
  settingsTitle: document.getElementById("settingsTitle"),
  toggleSettings: document.getElementById("toggleSettings"),
  openUtcLink: document.getElementById("openUtcLink"),
  langEn: document.getElementById("langEn"),
  langUk: document.getElementById("langUk")
};

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

  el.utcTime.textContent = `${h}:${m}:${s}`;
  el.utcDate.textContent = getDateFormatter(currentLanguage).format(now);
}

function updateLanguageUi() {
  const t = dictionary[currentLanguage];
  el.labelNow.textContent = t.now;
  el.settingsTitle.textContent = t.language;
  el.openUtcLink.textContent = t.openUtc;
  el.toggleSettings.textContent = settingsOpen ? t.settingsClose : t.settings;

  el.langEn.classList.toggle("active", currentLanguage === "en");
  el.langUk.classList.toggle("active", currentLanguage === "uk");

  document.documentElement.lang = currentLanguage;
  updateClock();
}

function setLanguage(language) {
  currentLanguage = language;
  chrome.storage.sync.set({ [STORAGE_KEY]: language });
  updateLanguageUi();
}

function setSettingsOpen(value) {
  settingsOpen = value;
  el.settingsPanel.classList.toggle("visible", settingsOpen);
  updateLanguageUi();
}

function initLanguage() {
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    const saved = result[STORAGE_KEY];
    if (saved === "uk" || saved === "en") {
      currentLanguage = saved;
    }

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

initLanguage();
