const screens = [...document.querySelectorAll('.screen')];
const navButtons = [...document.querySelectorAll('[data-go]')];
const appState = { sonarFile: null, navigationFile: null, preprocessingComplete: false };
const preprocessingStages = ['Input validation', 'Speckle / noise reduction', 'Contrast normalization', 'Resolution / scale normalization', 'Motion / artifact handling'];
const geoStages = ['Read navigation record', 'Match sonar / ping', 'Obtain vessel / sonar GPS position', 'Determine target-relative position', 'Apply vessel / sonar heading', 'Convert relative offset to global coordinates', 'Resolve target latitude / longitude', 'Plot target on survey map'];
let preprocessingTimer; let geoTimer;

function goTo(id) {
  clearInterval(preprocessingTimer); clearInterval(geoTimer);
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  navButtons.forEach(button => button.classList.toggle('current', button.dataset.go === id));
  if (id === 'processing') resetProcessing();
  if (id === 'geolocation') startGeoPipeline();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateUploadState() { document.getElementById('run-analysis').disabled = !(appState.sonarFile && appState.navigationFile); }
function setUploadedFile(input, file) { const card = input.closest('.upload-card'); if (input.accept.includes('.jpg')) appState.sonarFile = file; else appState.navigationFile = file; card.classList.add('uploaded'); card.querySelector('.file-name').textContent = `✓ ${file.name}`; updateUploadState(); }

navButtons.forEach(button => button.addEventListener('click', () => goTo(button.dataset.go)));
document.querySelectorAll('.upload-card input').forEach(input => input.addEventListener('change', event => { const file = event.target.files?.[0]; if (file) setUploadedFile(input, file); }));
document.querySelectorAll('.upload-card').forEach(card => ['dragover', 'dragleave', 'drop'].forEach(type => card.addEventListener(type, event => { event.preventDefault(); card.classList.toggle('dragging', type === 'dragover'); const file = event.dataTransfer?.files?.[0]; if (type === 'drop' && file) { const input = card.querySelector('input'); const transfer = new DataTransfer(); transfer.items.add(file); input.files = transfer.files; setUploadedFile(input, file); } })));
document.getElementById('run-analysis').addEventListener('click', () => { if (appState.sonarFile && appState.navigationFile) goTo('processing'); });

function renderPreprocessing(active = -1, complete = 0) {
  const pipeline = document.getElementById('pipeline');
  pipeline.innerHTML = `<p class="phase-title">INPUT & PREPROCESSING</p>${preprocessingStages.map((label, index) => { const state = index < complete ? 'done' : index === active ? 'working' : ''; const status = index < complete ? 'COMPLETE' : index === active ? 'RUNNING' : 'QUEUED'; const note = index === 4 ? '<abbr class="artifact-help" title="Heave, pitch, roll and acquisition/dropout artifacts are handled when corresponding survey telemetry is available.">ⓘ</abbr>' : ''; return `<div class="pipe-step compact ${state}"><i>${index + 1}</i><span>${label} ${note}</span><small>${status}</small></div>`; }).join('')}`;
}
function resetProcessing() {
  clearInterval(preprocessingTimer); const status = document.getElementById('processing-status'); const start = document.getElementById('start-preprocessing'); const continueButton = document.getElementById('continue-detection'); const sonar = document.querySelector('.processing-sonar');
  sonar.classList.remove('detecting', 'validating', 'scoring'); sonar.querySelector('.processing-label').textContent = 'PREPROCESSING · RAW SONAR SURVEY';
  if (appState.preprocessingComplete) { document.getElementById('progress-value').textContent = '100'; document.getElementById('progress-bar').style.width = '100%'; status.textContent = '✓ PREPROCESSING COMPLETE'; status.className = 'status-pill confirmed'; renderPreprocessing(-1, 5); start.hidden = true; continueButton.hidden = false; }
  else { document.getElementById('progress-value').textContent = '0'; document.getElementById('progress-bar').style.width = '0%'; status.textContent = '● READY TO START'; status.className = 'status-pill processing'; renderPreprocessing(-1, 0); start.hidden = false; start.disabled = false; continueButton.hidden = true; }
}
document.getElementById('start-preprocessing').addEventListener('click', () => {
  const status = document.getElementById('processing-status'); const start = document.getElementById('start-preprocessing'); const value = document.getElementById('progress-value'); const bar = document.getElementById('progress-bar'); let active = 0;
  start.disabled = true; status.textContent = '● PREPROCESSING IN PROGRESS'; status.className = 'status-pill processing'; renderPreprocessing(0, 0);
  preprocessingTimer = setInterval(() => { active += 1; const progress = active * 20; value.textContent = progress; bar.style.width = `${progress}%`; if (active >= preprocessingStages.length) { clearInterval(preprocessingTimer); appState.preprocessingComplete = true; renderPreprocessing(-1, 5); status.textContent = '✓ PREPROCESSING COMPLETE'; status.className = 'status-pill confirmed'; start.hidden = true; document.getElementById('continue-detection').hidden = false; } else renderPreprocessing(active, active); }, 700);
});
document.getElementById('continue-detection').addEventListener('click', () => goTo('detection'));

function renderGeoPipeline(active = 0, complete = 0) { document.getElementById('geo-pipeline').innerHTML = geoStages.map((label, index) => { const state = index < complete ? 'done' : index === active ? 'working' : ''; const status = index < complete ? '✓' : index === active ? 'RUNNING' : 'QUEUED'; return `<div class="geo-step ${state}"><i>${index + 1}</i><span>${label}</span><small>${status}</small></div>`; }).join(''); }
function startGeoPipeline() { const status = document.getElementById('geo-status'); const results = document.getElementById('geo-results'); const bar = document.getElementById('geo-progress-bar'); let active = 0; results.hidden = true; bar.style.width = '0%'; status.textContent = '● CALCULATING POSITION'; status.className = 'status-pill processing'; renderGeoPipeline(0, 0); geoTimer = setInterval(() => { active += 1; bar.style.width = `${Math.round(active / geoStages.length * 100)}%`; if (active >= geoStages.length) { clearInterval(geoTimer); renderGeoPipeline(-1, geoStages.length); status.textContent = '✓ POSITION RESOLVED'; status.className = 'status-pill confirmed'; results.hidden = false; } else renderGeoPipeline(active, active); }, 430); }

const targets = { wreck: { id: 'T-001', className: 'Shipwreck', confidence: '91%', dimensions: '18.4 × 5.2 m' }, net: { id: 'T-002', className: 'Ghost Net', confidence: '84%', dimensions: '6.8 × 2.1 m' }, natural: { id: '—', className: 'Natural seabed feature', confidence: '32%', dimensions: 'Rejected by validation' } };
document.querySelectorAll('.bbox').forEach(box => box.addEventListener('click', () => { const target = targets[box.dataset.target]; document.querySelectorAll('.bbox').forEach(item => item.classList.remove('selected')); box.classList.add('selected'); document.querySelector('.target-id').textContent = target.id; document.getElementById('target-class').textContent = target.className; document.getElementById('target-confidence').textContent = target.confidence; document.getElementById('target-dimensions').textContent = target.dimensions; }));

function download(format) { const rows = [{ id: 'T-001', classification: 'Shipwreck', confidence: '91%', priority: 'CRITICAL', latitude: '28.6143 N', longitude: '77.2088 E', length: '18.4m', width: '5.2m' }, { id: 'T-002', classification: 'Ghost Net', confidence: '84%', priority: 'HIGH', latitude: '28.6140 N', longitude: '77.2081 E', length: '6.8m', width: '2.1m' }, { id: 'T-003', classification: 'Pipeline', confidence: '88%', priority: 'HIGH', latitude: '28.6136 N', longitude: '77.2093 E', length: '26.2m', width: '1.4m' }, { id: 'T-004', classification: 'Cylinder', confidence: '78%', priority: 'MEDIUM', latitude: '28.6131 N', longitude: '77.2085 E', length: '1.8m', width: '0.6m' }]; const headers = ['Target ID', 'Classification', 'Confidence', 'Priority', 'Latitude', 'Longitude', 'Length', 'Width']; const csv = [headers.join(','), ...rows.map(row => [row.id, row.classification, row.confidence, row.priority, row.latitude, row.longitude, row.length, row.width].join(','))].join('\n'); const blob = new Blob([format === 'json' ? JSON.stringify(rows, null, 2) : csv], { type: format === 'json' ? 'application/json' : 'text/csv' }); const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `blutrace-anomaly-report.${format}` }); link.click(); URL.revokeObjectURL(link.href); }
document.querySelectorAll('[data-download]').forEach(button => button.addEventListener('click', () => download(button.dataset.download)));
goTo('upload');
