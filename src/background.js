const ALARM_NAME = "update_utc_toolbar_icon";
const ALARM_PERIOD_MINUTES = 1;
const ICON_SIZES = [16, 32];

function pad2(value) {
  return String(value).padStart(2, "0");
}

function getUtcTimeLabel() {
  const now = new Date();
  return `${pad2(now.getUTCHours())}:${pad2(now.getUTCMinutes())}`;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawIcon(size, label) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  const margin = Math.max(1, Math.floor(size * 0.04));
  const boxH = Math.floor(size * 0.78);
  const boxY = Math.floor((size - boxH) / 2);

  roundRectPath(ctx, margin, boxY, size - margin * 2, boxH, Math.floor(size * 0.22));
  ctx.fillStyle = "#efe7d0";
  ctx.fill();
  ctx.lineWidth = Math.max(1, Math.floor(size * 0.06));
  ctx.strokeStyle = "#7d654d";
  ctx.stroke();

  const dotR = Math.max(1, Math.floor(size * 0.06));
  ctx.beginPath();
  ctx.arc(size / 2, Math.floor(size * 0.12), dotR, 0, Math.PI * 2);
  ctx.fillStyle = "#de2040";
  ctx.fill();

  ctx.fillStyle = "#1f2128";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.floor(size * 0.34)}px "Segoe UI", Arial, sans-serif`;
  ctx.fillText(label, size / 2, size / 2 + Math.floor(size * 0.06));

  return ctx.getImageData(0, 0, size, size);
}

function updateToolbarTime() {
  const label = getUtcTimeLabel();
  const imageData = {};
  for (const size of ICON_SIZES) {
    imageData[size] = drawIcon(size, label);
  }

  chrome.action.setIcon({ imageData });
  chrome.action.setTitle({ title: `UTC ${label}` });
}

function ensureAlarm() {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: ALARM_PERIOD_MINUTES
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureAlarm();
  updateToolbarTime();
});

chrome.runtime.onStartup.addListener(() => {
  ensureAlarm();
  updateToolbarTime();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    updateToolbarTime();
  }
});

updateToolbarTime();
