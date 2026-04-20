<<<<<<< HEAD
// 1. UI Functions
function toggleModal(show) {
  const modal = document.getElementById('add-test-modal');
  if (modal) modal.style.display = show ? 'flex' : 'none';
}

// Optional: Close modal if they click the dark background, not just the cancel button
window.onclick = function(event) {
  const modal = document.getElementById('add-test-modal');
  if (event.target == modal) {
    toggleModal(false);
  }
}

function addNewTest() {
  const name = document.getElementById('new-test-name').value;
  const mitre = document.getElementById('new-test-mitre').value;
  const nist = document.getElementById('new-test-nist').value;
  const rem = document.getElementById('new-test-remediation').value;

  if (!name) { alert("Test name is required"); return; }

  const newIndex = TESTS.length;
  TESTS.push({ name: name, mitre: mitre || 'TBD', cvss_base: 0.0, nist: nist || 'TBD' });
  REMEDIATION.push(rem || 'No remediation provided yet.');

  const scoreRow = document.querySelector('.score-row');
  const newCard = document.createElement('div');
  newCard.className = 'score-card info';
  newCard.id = `card-${newIndex}`;
  newCard.setAttribute('onclick', `selectTest(${newIndex})`);
  newCard.innerHTML = `
    <div class="card-label">Test ${String(newIndex + 1).padStart(2, '0')}</div>
    <div class="card-test-name">${name}</div>
    <div class="card-score pending" id="score-${newIndex}">0.0</div>
    <div class="card-status" id="status-${newIndex}"><span class="status-pill sp-pending">Pending</span></div>
  `;
  scoreRow.appendChild(newCard);

  const mainContainer = document.querySelector('.container');
  const footer = document.querySelector('footer');
  const newToolSection = document.createElement('div');
  newToolSection.className = 'tool-section';
  newToolSection.innerHTML = `
    <div class="tool-header" onclick="toggleGuide(${newIndex})">
      <h3>Test ${String(newIndex + 1).padStart(2, '0')} — ${name}</h3>
      <div class="tool-header-right">
        <span class="tool-tag">Manual Test</span>
        <span class="chevron" id="chev-${newIndex}">▼</span>
      </div>
    </div>
    <div class="tool-body" id="guide-${newIndex}">
      <p style="color:var(--text-muted); margin-bottom:15px;">Custom test case added by user.</p>
      <div class="record-area">
        <div class="record-label">Record Result</div>
        <div class="record-grid">
          <select id="r${newIndex}-severity">
            <option value="">Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">None / Pass</option>
          </select>
          <input type="text" id="r${newIndex}-data" placeholder="Evidence / Observables">
        </div>
        <textarea class="record-note" id="r${newIndex}-notes" placeholder="Notes for this custom test..."></textarea>
        <button class="save-btn" onclick="saveResult(${newIndex})">Save Finding</button>
        <span class="saved-badge" id="saved-${newIndex}" style="display: none;">✓ Saved</span>
      </div>
    </div>
  `;
  mainContainer.insertBefore(newToolSection, footer);
  toggleModal(false);
}

// 2. Constants & Data
const TESTS = [
  { name: 'SQL Injection', mitre: 'T1190 — Exploit Public-Facing Application', cvss_base: 9.8, nist: 'PR.DS-5 · DE.CM-7' },
  { name: 'Credential / DDOS', mitre: 'T1110 — Brute Force', cvss_base: 8.1, nist: 'PR.AC-1 · PR.PT-3' },
  { name: 'Ghost Transmissions', mitre: 'T1071 — Application Layer Protocol', cvss_base: 6.5, nist: 'DE.AE-2 · ID.RA-3' },
  { name: 'BOLA / IDOR', mitre: 'T1078 — Valid Accounts (Abuse)', cvss_base: 9.1, nist: 'PR.AC-3 · PR.AC-4' },
  { name: 'Reverse DNS / PTR', mitre: 'T1583 — Acquire Infrastructure', cvss_base: 5.3, nist: 'ID.AM-3 · PR.PT-4' },
  { name: 'Missing Security Headers', mitre: 'T1592 — Gather Host Information', cvss_base: 6.5, nist: 'PR.DS-1 · PR.PT-4' },
  { name: 'Server Fingerprinting', mitre: 'T1595 — Active Scanning', cvss_base: 5.0, nist: 'ID.AM-3 · PR.PT-3' },
  { name: 'Sensitive Data Exposure', mitre: 'T1005 — Data from Local System', cvss_base: 7.5, nist: 'PR.DS-5 · DE.CM-7' }
];

const MITRE_DESCS = {
  'T1190': 'T1190 — Exploit Public-Facing Application',
  'T1110': 'T1110 — Brute Force: Password Guessing',
  'T1071': 'T1071 — Application Layer Protocol',
  'T1078': 'T1078 — Valid Accounts (Privilege Abuse)',
  'T1557': 'T1557 — Adversary-in-the-Middle',
  'T1583': 'T1583 — Acquire Infrastructure (DNS)',
  'T1595': 'T1595 — Active Scanning',
  'T1592': 'T1592 — Gather Host Information',
};

const REMEDIATION = [
  'Implement parameterized queries / prepared statements on all 18 endpoints. Add server-side input validation middleware. Enable WAF rules for SQL injection patterns.',
  'Implement account lockout after 5 failed attempts. Add API rate limiting (10 req/min on login endpoint). Consider MFA for procurement officer accounts.',
  'Create PTR record via Azure DNS. Implement idempotency keys on confirmation API to prevent duplicate processing.',
  'Enforce server-side ownership checks on every resource endpoint. Add authorization middleware.',
  'Create PTR reverse DNS record for the portal IP. Configure SPF, DKIM, and DMARC.',
  'Add security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security.',
  'Disable server version disclosure. Remove X-Powered-By headers.',
  'Sanitize API responses. Remove debug messages and internal paths. Implement proper encryption.'
];

// 3. Logic & State
let results = {};
const nameToIdMap = {
  "SQL Injection": "0", "Credential / DDOS": "1", "Ghost Transmissions": "2",
  "BOLA / IDOR": "3", "Reverse DNS / PTR": "4", "Missing Security Headers": "5",
  "Server Fingerprinting": "6", "Sensitive Data Exposure": "7"
};

// Always seed results from staticReport in data.js first.
// This means EVERY visitor (not just you) sees the real findings.
function seedFromStaticReport() {
  if (typeof staticReport !== 'undefined' && staticReport.findings) {
    Object.keys(staticReport.findings).forEach(name => {
      const id = nameToIdMap[name];
      if (id !== undefined) { results[id] = staticReport.findings[name]; }
    });
  }
}
seedFromStaticReport();

let activeTest = 0;
let activeTab = 'findings';

function selectTest(i) {
  activeTest = i;
  document.querySelectorAll('.score-card').forEach((c,j) => c.classList.toggle('active', j===i));
  const mitreEl = document.getElementById('mitre-desc');
  if (mitreEl) mitreEl.textContent = TESTS[i].mitre;
  updateFindingsPanel();
  updateCVSS();
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  ['findings','evidence','remediation'].forEach(t => {
    document.getElementById('panel-'+t).style.display = t===tab ? 'block' : 'none';
  });
  if(tab==='evidence') updateEvidenceLog();
  if(tab==='remediation') updateRemediation();
}

function toggleGuide(i) {
  const body = document.getElementById('guide-'+i);
  const chev = document.getElementById('chev-'+i);
  body.classList.toggle('open');
  chev.textContent = body.classList.contains('open') ? '▲' : '▼';
}

function saveResult(i) {
  const sevEl = document.getElementById('r'+i+'-severity');
  const notesEl = document.getElementById('r'+i+'-notes');
  const extra = document.querySelector(`#r${i}-endpoints, #r${i}-lockout, #r${i}-retrans, #r${i}-ptr, #r${i}-headers, #r${i}-server, #r${i}-data`);
  const sev = sevEl ? sevEl.value : '';
  if(!sev) { alert('Please select a severity level first.'); return; }

  results[i] = { severity: sev, notes: notesEl.value, extra: extra ? extra.value : '', timestamp: new Date().toISOString(), test: TESTS[i].name };
  localStorage.setItem("securityResults", JSON.stringify(results));

  const scoreEl = document.getElementById('score-'+i);
  const statusEl = document.getElementById('status-'+i);
  const cvss = { critical:9.8, high:7.5, medium:5.0, low:2.5, none:0 }[sev] || 0;
  scoreEl.textContent = cvss.toFixed(1);
  scoreEl.className = 'card-score ' + { critical:'red', high:'amber', medium:'blue', low:'green', none:'green' }[sev];
  statusEl.innerHTML = `<span class="status-pill sp-${sev==='none'?'low':sev}">${sev==='none'?'Pass':sev.toUpperCase()}</span>`;

  const badge = document.getElementById('saved-'+i);
  badge.style.display = 'inline';
  setTimeout(()=>{ badge.style.display='none'; }, 2500);

  updateFindingsPanel();
  updateCVSS();
}

function updateFindingsPanel() {
  const el = document.getElementById('findings-content');
  if(!results[activeTest]) {
    el.innerHTML = '<div class="no-results"><div class="big">[ ]</div>No findings recorded yet.</div>';
    return;
  }
  const r = results[activeTest];
  const color = { critical:'var(--red)', high:'var(--amber)', medium:'var(--accent)', low:'var(--green)', none:'var(--green)' }[r.severity];
  el.innerHTML = `
    <div class="detail-header">
      <div class="detail-title">${TESTS[activeTest].name}</div>
      <div class="detail-sub">Recorded: ${new Date(r.timestamp).toLocaleString('sv')}</div>
    </div>
    <div class="finding-list">
      <div class="finding">
        <div class="finding-top"><span class="finding-name" style="color:${color}">Severity: ${r.severity.toUpperCase()}</span></div>
        <div class="finding-desc">${r.notes || 'No notes recorded.'}</div>
        ${r.extra ? `<div class="finding-evidence">Detail: ${r.extra}</div>` : ''}
      </div>
    </div>`;
}

function updateCVSS() {
  const el = document.getElementById('cvss-panel');
  const entries = Object.entries(results);
  if(!entries.length) return;
  el.innerHTML = entries.map(([i, r]) => {
    const cvss = { critical:9.8, high:7.5, medium:5.0, low:2.5, none:0.0 }[r.severity] || 0;
    const pct = (cvss/10)*100;
    const col = cvss>=9?'var(--red)':cvss>=7?'var(--amber)':cvss>=4?'var(--accent)':'var(--green)';
    return `<div class="cvss-item">
      <div class="cvss-label"><span>${TESTS[i].name}</span><span style="color:${col}">${cvss.toFixed(1)}</span></div>
      <div class="cvss-bar"><div class="cvss-fill" style="width:${pct}%;background:${col}"></div></div>
    </div>`;
  }).join('');
}

function updateEvidenceLog() {
  const el = document.getElementById('evidence-log');
  const entries = Object.entries(results);
  if(!entries.length) return;
  el.innerHTML = entries.map(([i,r]) =>
    `<div class="finding" style="margin-bottom:10px">
      <div class="finding-top"><span class="finding-name">${TESTS[i].name}</span></div>
      <div class="finding-desc">${r.notes||'—'}</div>
    </div>`
  ).join('');
}

function updateRemediation() {
  const el = document.getElementById('remediation-content');
  const entries = Object.entries(results);
  if(!entries.length) return;
  el.innerHTML = entries.filter(([,r])=>r.severity!=='none').map(([i]) =>
    `<div class="finding" style="margin-bottom:10px">
      <div class="finding-name">${TESTS[i].name}</div>
      <div class="finding-desc">${REMEDIATION[i]}</div>
    </div>`
  ).join('');
}

function exportReport() {
  const report = {
    title: 'Security Assessment Report',
    date: new Date().toISOString(),
    findings: results
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'security_report.json';
  a.click();
}

// 4. Initialization
window.onload = function () {
  // Step 1: staticReport is already seeded above (visible to ALL visitors)
  // Step 2: If YOU have saved local overrides, layer them on top
  const saved = localStorage.getItem("securityResults");
  if (saved) {
    try { Object.assign(results, JSON.parse(saved)); } catch(e) {}
  }

  // Step 3: Render all score cards with the correct severity colours
  Object.keys(results).forEach(i => {
    const r = results[i];
    const scoreEl = document.getElementById('score-' + i);
    const statusEl = document.getElementById('status-' + i);
    if (!scoreEl || !statusEl) return;
    const cvssMap = { critical:9.8, high:7.5, medium:5.0, low:2.5, none:0.0 };
    const colMap  = { critical:'red', high:'amber', medium:'blue', low:'green', none:'green' };
    const pillMap = { critical:'sp-critical', high:'sp-high', medium:'sp-medium', low:'sp-low', none:'sp-low' };
    const labelMap = { critical:'CRITICAL', high:'HIGH', medium:'MEDIUM', low:'LOW', none:'Pass' };
    const sev = r.severity || 'medium';
    const cvss = cvssMap[sev] ?? 0;
    scoreEl.textContent = cvss.toFixed(1);
    scoreEl.className = 'card-score ' + (colMap[sev] || 'blue');
    statusEl.innerHTML = `<span class="status-pill ${pillMap[sev] || 'sp-medium'}">${labelMap[sev] || sev.toUpperCase()}</span>`;

    // Also colour the top border of the card to match severity
    const cardEl = document.getElementById('card-' + i);
    if (cardEl) {
      cardEl.className = cardEl.className.replace(/\b(critical|high|medium|low|info)\b/, sev === 'none' ? 'low' : sev);
    }
  });

  // Step 4: Select first test so the detail panel is populated on load
  selectTest(0);
  updateCVSS();
=======
// 1. UI Functions
function toggleModal(show) {
  const modal = document.getElementById('add-test-modal');
  if (modal) modal.style.display = show ? 'flex' : 'none';
}

// Optional: Close modal if they click the dark background, not just the cancel button
window.onclick = function(event) {
  const modal = document.getElementById('add-test-modal');
  if (event.target == modal) {
    toggleModal(false);
  }
}

function addNewTest() {
  const name = document.getElementById('new-test-name').value;
  const mitre = document.getElementById('new-test-mitre').value;
  const nist = document.getElementById('new-test-nist').value;
  const rem = document.getElementById('new-test-remediation').value;

  if (!name) { alert("Test name is required"); return; }

  const newIndex = TESTS.length;
  TESTS.push({ name: name, mitre: mitre || 'TBD', cvss_base: 0.0, nist: nist || 'TBD' });
  REMEDIATION.push(rem || 'No remediation provided yet.');

  const scoreRow = document.querySelector('.score-row');
  const newCard = document.createElement('div');
  newCard.className = 'score-card info';
  newCard.id = `card-${newIndex}`;
  newCard.setAttribute('onclick', `selectTest(${newIndex})`);
  newCard.innerHTML = `
    <div class="card-label">Test ${String(newIndex + 1).padStart(2, '0')}</div>
    <div class="card-test-name">${name}</div>
    <div class="card-score pending" id="score-${newIndex}">0.0</div>
    <div class="card-status" id="status-${newIndex}"><span class="status-pill sp-pending">Pending</span></div>
  `;
  scoreRow.appendChild(newCard);

  const mainContainer = document.querySelector('.container');
  const footer = document.querySelector('footer');
  const newToolSection = document.createElement('div');
  newToolSection.className = 'tool-section';
  newToolSection.innerHTML = `
    <div class="tool-header" onclick="toggleGuide(${newIndex})">
      <h3>Test ${String(newIndex + 1).padStart(2, '0')} — ${name}</h3>
      <div class="tool-header-right">
        <span class="tool-tag">Manual Test</span>
        <span class="chevron" id="chev-${newIndex}">▼</span>
      </div>
    </div>
    <div class="tool-body" id="guide-${newIndex}">
      <p style="color:var(--text-muted); margin-bottom:15px;">Custom test case added by user.</p>
      <div class="record-area">
        <div class="record-label">Record Result</div>
        <div class="record-grid">
          <select id="r${newIndex}-severity">
            <option value="">Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">None / Pass</option>
          </select>
          <input type="text" id="r${newIndex}-data" placeholder="Evidence / Observables">
        </div>
        <textarea class="record-note" id="r${newIndex}-notes" placeholder="Notes for this custom test..."></textarea>
        <button class="save-btn" onclick="saveResult(${newIndex})">Save Finding</button>
        <span class="saved-badge" id="saved-${newIndex}" style="display: none;">✓ Saved</span>
      </div>
    </div>
  `;
  mainContainer.insertBefore(newToolSection, footer);
  toggleModal(false);
}

// 2. Constants & Data
const TESTS = [
  { name: 'SQL Injection', mitre: 'T1190 — Exploit Public-Facing Application', cvss_base: 9.8, nist: 'PR.DS-5 · DE.CM-7' },
  { name: 'Credential / DDOS', mitre: 'T1110 — Brute Force', cvss_base: 8.1, nist: 'PR.AC-1 · PR.PT-3' },
  { name: 'Ghost Transmissions', mitre: 'T1071 — Application Layer Protocol', cvss_base: 6.5, nist: 'DE.AE-2 · ID.RA-3' },
  { name: 'BOLA / IDOR', mitre: 'T1078 — Valid Accounts (Abuse)', cvss_base: 9.1, nist: 'PR.AC-3 · PR.AC-4' },
  { name: 'Reverse DNS / PTR', mitre: 'T1583 — Acquire Infrastructure', cvss_base: 5.3, nist: 'ID.AM-3 · PR.PT-4' },
  { name: 'Missing Security Headers', mitre: 'T1592 — Gather Host Information', cvss_base: 6.5, nist: 'PR.DS-1 · PR.PT-4' },
  { name: 'Server Fingerprinting', mitre: 'T1595 — Active Scanning', cvss_base: 5.0, nist: 'ID.AM-3 · PR.PT-3' },
  { name: 'Sensitive Data Exposure', mitre: 'T1005 — Data from Local System', cvss_base: 7.5, nist: 'PR.DS-5 · DE.CM-7' }
];

const MITRE_DESCS = {
  'T1190': 'T1190 — Exploit Public-Facing Application',
  'T1110': 'T1110 — Brute Force: Password Guessing',
  'T1071': 'T1071 — Application Layer Protocol',
  'T1078': 'T1078 — Valid Accounts (Privilege Abuse)',
  'T1557': 'T1557 — Adversary-in-the-Middle',
  'T1583': 'T1583 — Acquire Infrastructure (DNS)',
  'T1595': 'T1595 — Active Scanning',
  'T1592': 'T1592 — Gather Host Information',
};

const REMEDIATION = [
  'Implement parameterized queries / prepared statements on all 18 endpoints. Add server-side input validation middleware. Enable WAF rules for SQL injection patterns.',
  'Implement account lockout after 5 failed attempts. Add API rate limiting (10 req/min on login endpoint). Consider MFA for procurement officer accounts.',
  'Create PTR record via Azure DNS. Implement idempotency keys on confirmation API to prevent duplicate processing.',
  'Enforce server-side ownership checks on every resource endpoint. Add authorization middleware.',
  'Create PTR reverse DNS record for the portal IP. Configure SPF, DKIM, and DMARC.',
  'Add security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security.',
  'Disable server version disclosure. Remove X-Powered-By headers.',
  'Sanitize API responses. Remove debug messages and internal paths. Implement proper encryption.'
];

// 3. Logic & State
let results = {};
const nameToIdMap = {
  "SQL Injection": "0", "Credential / DDOS": "1", "Ghost Transmissions": "2",
  "BOLA / IDOR": "3", "Reverse DNS / PTR": "4", "Missing Security Headers": "5",
  "Server Fingerprinting": "6", "Sensitive Data Exposure": "7"
};

// Always seed results from staticReport in data.js first.
// This means EVERY visitor (not just you) sees the real findings.
function seedFromStaticReport() {
  if (typeof staticReport !== 'undefined' && staticReport.findings) {
    Object.keys(staticReport.findings).forEach(name => {
      const id = nameToIdMap[name];
      if (id !== undefined) { results[id] = staticReport.findings[name]; }
    });
  }
}
seedFromStaticReport();

let activeTest = 0;
let activeTab = 'findings';

function selectTest(i) {
  activeTest = i;
  document.querySelectorAll('.score-card').forEach((c,j) => c.classList.toggle('active', j===i));
  const mitreEl = document.getElementById('mitre-desc');
  if (mitreEl) mitreEl.textContent = TESTS[i].mitre;
  updateFindingsPanel();
  updateCVSS();
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  ['findings','evidence','remediation'].forEach(t => {
    document.getElementById('panel-'+t).style.display = t===tab ? 'block' : 'none';
  });
  if(tab==='evidence') updateEvidenceLog();
  if(tab==='remediation') updateRemediation();
}

function toggleGuide(i) {
  const body = document.getElementById('guide-'+i);
  const chev = document.getElementById('chev-'+i);
  body.classList.toggle('open');
  chev.textContent = body.classList.contains('open') ? '▲' : '▼';
}

function saveResult(i) {
  const sevEl = document.getElementById('r'+i+'-severity');
  const notesEl = document.getElementById('r'+i+'-notes');
  const extra = document.querySelector(`#r${i}-endpoints, #r${i}-lockout, #r${i}-retrans, #r${i}-ptr, #r${i}-headers, #r${i}-server, #r${i}-data`);
  const sev = sevEl ? sevEl.value : '';
  if(!sev) { alert('Please select a severity level first.'); return; }

  results[i] = { severity: sev, notes: notesEl.value, extra: extra ? extra.value : '', timestamp: new Date().toISOString(), test: TESTS[i].name };
  localStorage.setItem("securityResults", JSON.stringify(results));

  const scoreEl = document.getElementById('score-'+i);
  const statusEl = document.getElementById('status-'+i);
  const cvss = { critical:9.8, high:7.5, medium:5.0, low:2.5, none:0 }[sev] || 0;
  scoreEl.textContent = cvss.toFixed(1);
  scoreEl.className = 'card-score ' + { critical:'red', high:'amber', medium:'blue', low:'green', none:'green' }[sev];
  statusEl.innerHTML = `<span class="status-pill sp-${sev==='none'?'low':sev}">${sev==='none'?'Pass':sev.toUpperCase()}</span>`;

  const badge = document.getElementById('saved-'+i);
  badge.style.display = 'inline';
  setTimeout(()=>{ badge.style.display='none'; }, 2500);

  updateFindingsPanel();
  updateCVSS();
}

function updateFindingsPanel() {
  const el = document.getElementById('findings-content');
  if(!results[activeTest]) {
    el.innerHTML = '<div class="no-results"><div class="big">[ ]</div>No findings recorded yet.</div>';
    return;
  }
  const r = results[activeTest];
  const color = { critical:'var(--red)', high:'var(--amber)', medium:'var(--accent)', low:'var(--green)', none:'var(--green)' }[r.severity];
  el.innerHTML = `
    <div class="detail-header">
      <div class="detail-title">${TESTS[activeTest].name}</div>
      <div class="detail-sub">Recorded: ${new Date(r.timestamp).toLocaleString('sv')}</div>
    </div>
    <div class="finding-list">
      <div class="finding">
        <div class="finding-top"><span class="finding-name" style="color:${color}">Severity: ${r.severity.toUpperCase()}</span></div>
        <div class="finding-desc">${r.notes || 'No notes recorded.'}</div>
        ${r.extra ? `<div class="finding-evidence">Detail: ${r.extra}</div>` : ''}
      </div>
    </div>`;
}

function updateCVSS() {
  const el = document.getElementById('cvss-panel');
  const entries = Object.entries(results);
  if(!entries.length) return;
  el.innerHTML = entries.map(([i, r]) => {
    const cvss = { critical:9.8, high:7.5, medium:5.0, low:2.5, none:0.0 }[r.severity] || 0;
    const pct = (cvss/10)*100;
    const col = cvss>=9?'var(--red)':cvss>=7?'var(--amber)':cvss>=4?'var(--accent)':'var(--green)';
    return `<div class="cvss-item">
      <div class="cvss-label"><span>${TESTS[i].name}</span><span style="color:${col}">${cvss.toFixed(1)}</span></div>
      <div class="cvss-bar"><div class="cvss-fill" style="width:${pct}%;background:${col}"></div></div>
    </div>`;
  }).join('');
}

function updateEvidenceLog() {
  const el = document.getElementById('evidence-log');
  const entries = Object.entries(results);
  if(!entries.length) return;
  el.innerHTML = entries.map(([i,r]) =>
    `<div class="finding" style="margin-bottom:10px">
      <div class="finding-top"><span class="finding-name">${TESTS[i].name}</span></div>
      <div class="finding-desc">${r.notes||'—'}</div>
    </div>`
  ).join('');
}

function updateRemediation() {
  const el = document.getElementById('remediation-content');
  const entries = Object.entries(results);
  if(!entries.length) return;
  el.innerHTML = entries.filter(([,r])=>r.severity!=='none').map(([i]) =>
    `<div class="finding" style="margin-bottom:10px">
      <div class="finding-name">${TESTS[i].name}</div>
      <div class="finding-desc">${REMEDIATION[i]}</div>
    </div>`
  ).join('');
}

function exportReport() {
  const report = {
    title: 'Security Assessment Report',
    date: new Date().toISOString(),
    findings: results
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'security_report.json';
  a.click();
}

// 4. Initialization
window.onload = function () {
  // Step 1: staticReport is already seeded above (visible to ALL visitors)
  // Step 2: If YOU have saved local overrides, layer them on top
  const saved = localStorage.getItem("securityResults");
  if (saved) {
    try { Object.assign(results, JSON.parse(saved)); } catch(e) {}
  }

  // Step 3: Render all score cards with the correct severity colours
  Object.keys(results).forEach(i => {
    const r = results[i];
    const scoreEl = document.getElementById('score-' + i);
    const statusEl = document.getElementById('status-' + i);
    if (!scoreEl || !statusEl) return;
    const cvssMap = { critical:9.8, high:7.5, medium:5.0, low:2.5, none:0.0 };
    const colMap  = { critical:'red', high:'amber', medium:'blue', low:'green', none:'green' };
    const pillMap = { critical:'sp-critical', high:'sp-high', medium:'sp-medium', low:'sp-low', none:'sp-low' };
    const labelMap = { critical:'CRITICAL', high:'HIGH', medium:'MEDIUM', low:'LOW', none:'Pass' };
    const sev = r.severity || 'medium';
    const cvss = cvssMap[sev] ?? 0;
    scoreEl.textContent = cvss.toFixed(1);
    scoreEl.className = 'card-score ' + (colMap[sev] || 'blue');
    statusEl.innerHTML = `<span class="status-pill ${pillMap[sev] || 'sp-medium'}">${labelMap[sev] || sev.toUpperCase()}</span>`;

    // Also colour the top border of the card to match severity
    const cardEl = document.getElementById('card-' + i);
    if (cardEl) {
      cardEl.className = cardEl.className.replace(/\b(critical|high|medium|low|info)\b/, sev === 'none' ? 'low' : sev);
    }
  });

  // Step 4: Select first test so the detail panel is populated on load
  selectTest(0);
  updateCVSS();
>>>>>>> dcdc8a5a5093b1db4b3a4b2a323ebd909abbddf1
};