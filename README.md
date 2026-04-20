# Security Assessment Dashboard

A client-side web dashboard built to document, visualise, and present a security infrastructure analysis and vulnerability assessment dashboard for an enterprise ERP integration system. Developed as part of a Security Research Internship in 2026.

**Live demo →** [IshikaTrony.github.io/security-assessment-dashboard](https://IshikaTrony.github.io/security-assessment-dashboard)

---

## Overview

This dashboard was built to present the results of a black-box security assessment conducted on a UAT/Staging environment. It maps every finding to the **MITRE ATT&CK** framework and **NIST Cybersecurity Framework (CSF)**, and includes CVSS scoring, evidence logs, and remediation guidance for each test.

All findings are embedded directly in the code (`data.js`), so the full report is visible to anyone who visits the link — no login or backend required.

---

## Security Tests Covered

| # | Test | Severity | MITRE Technique |
|---|------|----------|-----------------|
| 01 | SQL Injection | ✅ Pass | T1190 |
| 02 | Credential Bruteforce / DDOS | 🔴 High | T1110 |
| 03 | Ghost Transmissions | 🟡 Medium | T1071 |
| 04 | BOLA / IDOR | 🔴 High | T1078 |
| 05 | Reverse DNS / PTR | 🟡 Medium | T1583 |
| 06 | Missing Security Headers | 🟡 Medium | T1592 |
| 07 | Server Fingerprinting | 🟢 Low | T1595 |
| 08 | Sensitive Data Exposure | 🚨 Critical | T1005 |

---

## Features

- **Interactive cards** — click any test to load its full finding in the detail panel
- **Findings panel** — shows severity, description, evidence, MITRE technique, NIST controls, and remediation steps
- **Evidence log tab** — chronological log of all recorded findings
- **Remediation tab** — consolidated remediation guidance for all non-passing tests
- **CVSS score bars** — visual risk scoring for each finding
- **Add custom test** — form to add new test cases to the dashboard on the fly
- **Export JSON** — downloads the full findings report as a `.json` file

---

## Tools Used in Testing

| Tool | Purpose |
|------|---------|
| Burp Suite Community | Intercepting requests, brute force (Intruder), API inspection |
| OWASP ZAP | Automated scanning, information disclosure detection |
| Wireshark | Network traffic analysis, TCP retransmission inspection |
| Browser DevTools | HTTP response header inspection |
| nslookup / dig | Reverse DNS / PTR record verification |
| curl / Nmap | Server fingerprinting, version detection |

---

## Framework Mapping

- **MITRE ATT&CK** — Each finding is tagged with the relevant technique ID and tactic
- **NIST CSF** — Controls mapped across Identify (ID), Protect (PR), and Detect (DE) functions

---

## Running Locally

No install needed. Clone the repo and open with VS Code Live Server:

```bash
git clone https://github.com/IshikaTrony/security-assessment-dashboard.git
cd security-assessment-dashboard
```

Then right-click `index.html` in VS Code → **Open with Live Server**.

> Note: opening `index.html` by double-clicking will not load styles correctly due to browser local file restrictions. Always use Live Server or any local HTTP server.

---

## Project Structure

```
security-assessment-dashboard/
├── index.html       # Dashboard layout and UI
├── style.css        # Dark theme styling
├── script.js        # All interactivity and rendering logic
└── data.js          # Embedded findings data (staticReport)
```

---

## About

**Analyst:** Ishika Trony  
**Role:** Security Research Intern  
**Environment:** UAT / Staging  
**Assessment date:** February–April 2026  
**Frameworks:** NIST CSF · MITRE ATT&CK · STRIDE Threat Modeling  

> Sensitive information including client name, internal IPs, and endpoint paths have been anonymised in this public version.

