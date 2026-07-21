# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in xtoolbox, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please report via [GitHub Security Advisories](https://github.com/anomalyco/xtoolbox/security/advisories/new).

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Assessment:** Within 1 week
- **Fix or mitigation:** Within 30 days for critical/high severity

## Scope

xtoolbox is a 100% client-side application. The following are in scope:

- Cross-site scripting (XSS)
- Prototype pollution
- Dependency vulnerabilities with known exploits
- File handling vulnerabilities (e.g., path traversal in file uploads)
- WebAssembly security issues
- Service worker cache poisoning
- Local storage sensitive data exposure

## Out of Scope

- Server-side vulnerabilities (no server exists)
- Social engineering attacks
- Denial of service
- Issues in third-party services or APIs used by tools

## Supported Versions

| Version  | Supported |
| -------- | --------- |
| latest   | Yes       |
| < latest | No        |

## Security Best Practices

This project follows these security practices:

- Content Security Policy (CSP) headers enforced in production
- Subresource Integrity (SRI) for critical external resources
- Automated dependency scanning via Dependabot
- `npm audit` runs in CI and fails on high/critical vulnerabilities
- No server-side code or API keys in the codebase
