const staticReport = {

  "title": "Security Assessment Report — Enterprise Integration MVP",
  "analyst": "Ishika Trony",
  "environment": "UAT / Staging",
  "date": "2026-04-13T08:54:34.402Z",
  "framework": "NIST CSF · MITRE ATT&CK",
  "findings": {
    "SQL Injection": {
      "severity": "none",
      "notes": "Scanned port 1443 (SQL Database port) to verify it is not directly accessible from external network, SQL Database is in Private Secured zone, not directly accessible from internet",
      "extra": "port 1443",
      "timestamp": "2026-03-30T12:02:11.403Z",
      "test": "SQL Injection",
      "mitre": "T1190 — Exploit Public-Facing Application",
      "nist": "PR.DS-5 · DE.CM-7",
      "remediation": "Implement parameterized queries / prepared statements on all 18 endpoints. Add server-side input validation middleware. Enable WAF rules for SQL injection patterns."
    },
    "Credential / DDOS": {
      "severity": "high",
      "notes": "Confirmed lack of API Rate limiting and Account Lockout on the authentication endpoint. Automated attack using Burp Intruder (90+ payloads) resulted in no '429 Too many Requests' responses.",
      "extra": "90 + attempts",
      "timestamp": "2026-03-30T08:47:45.628Z",
      "test": "Credential Bruteforce",
      "mitre": "T1110 — Brute Force",
      "nist": "PR.AC-1 · PR.PT-3",
      "remediation": "Implement account lockout after 5 failed attempts. Add API rate limiting (10 req/min on login endpoint). Consider MFA for procurement officer accounts."
    },
    "Ghost Transmissions": {
      "severity": "medium",
      "notes": "Confirmed Ghost Transmission vulnerability during PO 'Partly Confirm' actions. Flow graph analysis shows a cluster of mDNS broadcasts followed by multiple TCP [SYN] retransmissions (gray arrows) and application-layer retries (pink arrows) from 10.23.102.172 to 52.178.214.89. This indicates a handshake timeout that triggers the browser to send duplicate requests, leading to potential duplicate records in the IFS ERP.",
      "extra": "5+",
      "timestamp": "2026-03-30T09:17:25.919Z",
      "test": "Ghost Transmissions",
      "mitre": "T1071 — Application Layer Protocol",
      "nist": "DE.AE-2 · ID.RA-3",
      "remediation": "Create PTR record for 52.178.214.89 via Azure DNS. Implement idempotency keys on PO confirmation API to prevent duplicate processing."
    },
    "BOLA / IDOR": {
      "severity": "high",
      "notes": "Confirmed BOLA and Fail-open Input Validation on the API/v1/BlomsterlandetGateway endpoint. The API erroneously returns 200 OK for invalid or empty payloads - triggering full database scans and raw data dumps , while lacking server side authorization ( should be 403/404) allowing user to access unauthorized data by guessing IDs.",
      "extra": "API/v1/BlomsterlandetGateway, Purchase order.",
      "timestamp": "2026-03-30T08:55:24.180Z",
      "test": "BOLA / IDOR",
      "mitre": "T1078 — Valid Accounts (Abuse)",
      "nist": "PR.AC-3 · PR.AC-4",
      "remediation": "Enforce server-side ownership checks on every resource endpoint. Add authorization middleware that verifies resource belongs to authenticated user before returning data."
    },
    "Reverse DNS / PTR": {
      "severity": "medium",
      "notes": "Performed reverse DNS lookup on gateway IP 52.178.214.89. Result returned NXDOMAIN, confirming a missing PTR record in the Azure/DNS configuration. This missing record causes external security gateways to distrust the traffic, dropping response packets and serving as the root cause for the TCP retransmissions observed in Test 03.",
      "extra": "NXDOMAIN",
      "timestamp": "2026-03-30T09:25:53.115Z",
      "test": "Reverse DNS / PTR",
      "mitre": "T1583 — Acquire Infrastructure",
      "nist": "ID.AM-3 · PR.PT-4",
      "remediation": "Create PTR reverse DNS record for the portal IP. Configure SPF, DKIM, and DMARC for iwizardsolutions.com. Verify FCrDNS resolves correctly after changes."
    },
    "Missing Security Headers": {
      "severity": "medium",
      "notes": "Inspected all HTTP response headers via Browser DevTools. Identified critical missing security headers: HSTS (Strict-Transport-Security), X-Frame Options, and Content-Security-Policy (CSP). These omissions expose the portal to man-in-the-middle attacks, MIME sniffing, and Clickjacking.",
      "extra": "HSTS, CSP, X-content type options, X-frame options",
      "timestamp": "2026-03-30T13:19:59.561Z",
      "test": "Missing Security Headers",
      "mitre": "T1592 — Gather Host Information",
      "nist": "PR.DS-1 · PR.PT-4",
      "remediation": "Add security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security. Configure via server or reverse proxy."
    },
    "Server Fingerprinting": {
      "severity": "low",
      "notes": "Vulnerability identified through server response header inspection. The application reveals specific server software: Microsoft-IIS/10.0. This information disclosure helps attackers identify version-specific exploits and known vulnerabilities targeting Windows Server",
      "extra": "Microsft IIS/10.0",
      "timestamp": "2026-03-30T09:36:16.749Z",
      "test": "Server Fingerprinting",
      "mitre": "T1595 — Active Scanning",
      "nist": "ID.AM-3 · PR.PT-3",
      "remediation": "Disable server version disclosure. Remove X-Powered-By headers. Configure server to hide version (Apache: ServerTokens Prod, Nginx: server_tokens off)."
    },
    "Sensitive Data Exposure": {
      "severity": "critical",
      "notes": "Multi-vector data exposure confirmed. 1)API JSON inspection returned passwords in plaintext2) Confidential Business Data: Integration logs (Kibana) explicitly capture and store LIST_PRICE fields in plaintext. 3) Technical Disclosure: HTTP headers reveal the exact server version (Microsoft-IIS/10.0). ",
      "extra": "Server Version disclosed, Credentials and business Data  stored as Plain text.",
      "timestamp": "2026-03-30T09:56:36.295Z",
      "test": "Sensitive Data Exposure",
      "mitre": "T1005 — Data from Local System",
      "nist": "PR.DS-5 · DE.CM-7",
      "remediation": "Sanitize API responses. Remove debug messages, stack traces, and internal paths. Implement proper error handling and logging on server side only."
    }
  }
}
