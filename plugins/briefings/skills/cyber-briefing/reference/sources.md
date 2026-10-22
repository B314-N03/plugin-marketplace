# Cyber Briefing Source Strategy

## Primary Search Queries

Run these searches in parallel to cover the landscape. Always append a time qualifier like "2025" or "this week" or "March 2025" based on the current date.

### Core queries (always run)

1. `data breach OR security incident disclosed site:bleepingcomputer.com OR site:therecord.media OR site:krebsonsecurity.com`
2. `critical CVE OR zero-day vulnerability actively exploited`
3. `ransomware attack OR ransomware group new`
4. `CISA advisory OR CISA known exploited vulnerabilities`

### Focused queries (pick based on user interest or run all)

5. `supply chain attack software` (dev-relevant)
6. `cloud security vulnerability AWS OR Azure OR GCP` (cloud focus)
7. `new cybersecurity tool open source` (tools focus)
8. `nation-state cyber attack APT` (geopolitical focus)
9. `NIST OR GDPR OR SOC2 cybersecurity regulation update` (compliance focus)
10. `npm OR PyPI OR malicious package supply chain` (developer supply chain)

## Key Sources to Track

### Advisory & threat intel
- CISA — cisa.gov/known-exploited-vulnerabilities-catalog
- NVD / NIST — nvd.nist.gov
- MITRE ATT&CK — attack.mitre.org
- Mandiant / Google Threat Intelligence — cloud.google.com/blog/topics/threat-intelligence
- Microsoft Threat Intelligence — microsoft.com/en-us/security/blog

### News & analysis
- BleepingComputer — bleepingcomputer.com
- The Record by Recorded Future — therecord.media
- Krebs on Security — krebsonsecurity.com
- Dark Reading — darkreading.com
- The Hacker News — thehackernews.com
- Ars Technica Security — arstechnica.com/security

### Research & community
- Project Zero (Google) — googleprojectzero.blogspot.com
- Rapid7 Blog — rapid7.com/blog
- Qualys Threat Research — blog.qualys.com
- CrowdStrike Blog — crowdstrike.com/blog
- SentinelOne Labs — sentinelone.com/labs
- Wiz Research — wiz.io/blog

### Developer-relevant
- GitHub Security Advisories — github.com/advisories
- Snyk Vulnerability DB — security.snyk.io
- Socket.dev (npm/PyPI supply chain) — socket.dev/blog

## Evaluation Criteria

When deciding what to include in the briefing:

- **Severity**: Prioritize actively exploited vulns, large-scale breaches, and critical CVEs (CVSS 9+)
- **Recency**: Focus on the last 2-4 weeks unless user specifies otherwise
- **Relevance**: Weight toward the user's stack — web dev vulns, npm/JS ecosystem, cloud services
- **Actionability**: Include items where the user should patch, update, or change behavior
- **Verification**: Cross-reference claims; don't repeat unconfirmed attributions as fact
