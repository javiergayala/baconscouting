const DB_NAME = 'exploding-bacon-scouting';
const STORE_NAME = 'submissions';

const form = document.getElementById('scoutForm');
const saveBtn = document.getElementById('saveBtn');
const formMessage = document.getElementById('formMessage');
const savedCount = document.getElementById('savedCount');
const savedList = document.getElementById('savedList');
const savedEmpty = document.getElementById('savedEmpty');
const installDetails = document.getElementById('installDetails');
const installContext = document.getElementById('installContext');
const netBadge = document.getElementById('netBadge');
const netText = document.getElementById('netText');
const modeText = document.getElementById('modeText');
const otherDriveWrap = document.getElementById('otherDriveWrap');
const drivetrainOther = document.getElementById('drivetrainOther');
const updateBanner = document.getElementById('updateBanner');
const reloadAppBtn = document.getElementById('reloadAppBtn');

let swRegistration = null;
let refreshing = false;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllSubmissions() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
    req.onerror = () => reject(req.error);
  });
}

async function putSubmission(record) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearSubmissions() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function detectPlatform() {
  const ua = navigator.userAgent || navigator.vendor || '';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  return 'other';
}

function updateInstallPanel() {
  const platform = detectPlatform();
  const standalone = isStandaloneMode();
  installDetails.open = !standalone;
  if (standalone) {
    installContext.textContent = 'You launched this from the Home Screen, so the install steps start collapsed by default.';
    modeText.textContent = 'Home Screen app';
  } else if (platform === 'ios') {
    installContext.textContent = 'You are on iPhone/iPad. Use Safari, then Share → Add to Home Screen.';
    modeText.textContent = 'Safari browser';
  } else if (platform === 'android') {
    installContext.textContent = 'You are on Android. Use Chrome or Edge, then Install app / Add to Home screen.';
    modeText.textContent = 'Android browser';
  } else {
    installContext.textContent = 'Open this on your phone to install it to the Home Screen.';
    modeText.textContent = 'Browser mode';
  }
}

function selectedValue(name) {
  const checked = form.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : '';
}

function normalizeFormData() {
  const drivetrain = selectedValue('drivetrain');
  return {
    scoutName: document.getElementById('scoutName').value.trim(),
    team: document.getElementById('team').value.trim(),
    drivetrain,
    drivetrainOther: drivetrain === 'Other' ? drivetrainOther.value.trim() : '',
    intake: selectedValue('intake'),
    auto: selectedValue('auto'),
    bumpers: selectedValue('bumpers'),
    climbAuto: selectedValue('climbAuto'),
    needChute: selectedValue('needChute'),
    teleopClimb: selectedValue('teleopClimb'),
    weight: document.getElementById('weight').value.trim(),
    fuelHold: document.getElementById('fuelHold').value.trim(),
    neutralZone: selectedValue('neutralZone'),
    defense: selectedValue('defense'),
    underTrench: selectedValue('underTrench'),
    notes: document.getElementById('notes').value.trim()
  };
}

function validateForm() {
  const data = normalizeFormData();
  const requiredFields = { ...data };
  delete requiredFields.notes;
  if (requiredFields.drivetrain !== 'Other') {
    delete requiredFields.drivetrainOther;
  }
  const complete = Object.values(requiredFields).every(v => String(v || '').trim() !== '');
  saveBtn.disabled = !complete;
  return complete;
}

function toggleOtherDrivetrain() {
  const isOther = selectedValue('drivetrain') === 'Other';
  otherDriveWrap.style.display = isOther ? 'block' : 'none';
  drivetrainOther.required = isOther;
  if (!isOther) drivetrainOther.value = '';
  validateForm();
}

function showMessage(text, type = 'ok') {
  formMessage.textContent = text;
  formMessage.className = type === 'error' ? 'message error' : 'message';
  formMessage.style.display = 'block';
}
function hideMessage() { formMessage.style.display = 'none'; }

function updateConnectivity() {
  const online = navigator.onLine;
  netBadge.classList.toggle('online', online);
  netText.textContent = online ? 'Connectivity detected' : 'Offline — using cached app files';
  if (online) checkForUpdates();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
}

async function renderSubmissions() {
  const items = await getAllSubmissions();
  savedCount.textContent = items.length;
  savedList.innerHTML = '';
  savedEmpty.style.display = items.length ? 'none' : 'block';

  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'saved-item';
    card.innerHTML = `
      <h4>Team ${escapeHtml(item.team)} • ${escapeHtml(item.scoutName)}</h4>
      <p><strong>Saved:</strong> ${new Date(item.createdAt).toLocaleString()}</p>
      <p><strong>Drive:</strong> ${escapeHtml(item.drivetrain === 'Other' ? `${item.drivetrain} (${item.drivetrainOther})` : item.drivetrain)}</p>
      <p><strong>Teleop climb:</strong> ${escapeHtml(item.teleopClimb)} • <strong>Defense:</strong> ${escapeHtml(item.defense)}</p>
      <p class="tiny">${escapeHtml(item.notes || 'No notes')}</p>
    `;
    savedList.appendChild(card);
  }
}

function toCsv(records) {
  const headers = [
    'Saved At','Scout Name','Team','Drivetrain Type','Other Drivetrain','Intake',
    'Do they have auto?','Bumpers?','Climb in auto?','Need chute?','Teleop climb',
    'Weight','How many fuel can they hold?','Feed from the neutral zone?',
    'Can they play defense?','Fit under trench','Notes'
  ];
  const escape = value => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [headers.join(',')];
  for (const item of records) {
    lines.push([
      item.createdAt, item.scoutName, item.team, item.drivetrain, item.drivetrainOther,
      item.intake, item.auto, item.bumpers, item.climbAuto, item.needChute,
      item.teleopClimb, item.weight, item.fuelHold, item.neutralZone,
      item.defense, item.underTrench, item.notes
    ].map(escape).join(','));
  }
  return lines.join('\n');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportCsv() {
  const records = await getAllSubmissions();
  if (!records.length) return alert('No saved submissions to export.');
  downloadBlob(new Blob([toCsv(records)], { type: 'text/csv;charset=utf-8' }), 'exploding-bacon-pit-scouting.csv');
}

async function shareCsv() {
  const records = await getAllSubmissions();
  if (!records.length) return alert('No saved submissions to share.');
  const file = new File([toCsv(records)], 'exploding-bacon-pit-scouting.csv', { type: 'text/csv' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ title: 'Exploding Bacon scouting export', text: 'Offline scouting submissions export', files: [file] });
  } else {
    await exportCsv();
  }
}

async function exportJson() {
  const records = await getAllSubmissions();
  if (!records.length) return alert('No saved submissions to export.');
  downloadBlob(new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }), 'exploding-bacon-pit-scouting.json');
}

async function draftEmail() {
  const count = (await getAllSubmissions()).length;
  const subject = encodeURIComponent(`Exploding Bacon pit scouting export (${count} submissions)`);
  const body = encodeURIComponent('Attach the exported CSV or JSON file from the scouting app before sending this email.');
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function showUpdateAvailable() {
  updateBanner.style.display = 'block';
}
function hideUpdateAvailable() {
  updateBanner.style.display = 'none';
}

async function checkForUpdates() {
  if (!swRegistration) return;
  try {
    await swRegistration.update();
    if (swRegistration.waiting) showUpdateAvailable();
  } catch (err) {
    console.debug('SW update check skipped', err);
  }
}

function trackServiceWorker(reg) {
  swRegistration = reg;
  if (reg.waiting) showUpdateAvailable();
  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing;
    if (!newWorker) return;
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        showUpdateAvailable();
      }
    });
  });
}

form.addEventListener('input', validateForm);
form.addEventListener('change', (event) => {
  if (event.target.name === 'drivetrain') toggleOtherDrivetrain();
  validateForm();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMessage();
  if (!validateForm()) {
    showMessage('Please fill in every required field before saving.', 'error');
    return;
  }
  const record = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...normalizeFormData() };
  try {
    await putSubmission(record);
    form.reset();
    otherDriveWrap.style.display = 'none';
    saveBtn.disabled = true;
    showMessage('Submission saved locally on this device.');
    await renderSubmissions();
  } catch (error) {
    console.error(error);
    showMessage('Could not save the submission locally.', 'error');
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  form.reset();
  toggleOtherDrivetrain();
  hideMessage();
});
document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
document.getElementById('shareCsvBtn').addEventListener('click', () => shareCsv().catch(async () => exportCsv()));
document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
document.getElementById('emailBtn').addEventListener('click', draftEmail);
document.getElementById('clearBtn').addEventListener('click', async () => {
  if (!confirm('Delete all saved scouting submissions on this device?')) return;
  await clearSubmissions();
  await renderSubmissions();
});
reloadAppBtn.addEventListener('click', () => {
  if (swRegistration?.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    window.location.reload();
  }
});

window.addEventListener('online', updateConnectivity);
window.addEventListener('offline', updateConnectivity);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkForUpdates();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
      trackServiceWorker(reg);
      setInterval(checkForUpdates, 60000);
    } catch (err) {
      console.error('Service worker registration failed', err);
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    hideUpdateAvailable();
    window.location.reload();
  });

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'NEW_VERSION_READY') showUpdateAvailable();
  });
}

(async function init() {
  updateConnectivity();
  updateInstallPanel();
  toggleOtherDrivetrain();
  validateForm();
  await renderSubmissions();
})();
