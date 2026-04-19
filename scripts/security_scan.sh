#!/bin/bash
# ============================================
# Smart City Portal - Security Scan Script
# Runs: OWASP ZAP, Nmap, Nikto, Gitleaks, Trivy, Lynis
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TARGET_URL="${1:-http://localhost}"
REPORT_DIR="./security_reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Smart City Portal - Security Scanner      ${NC}"
echo -e "${BLUE}  Target: ${TARGET_URL}                     ${NC}"
echo -e "${BLUE}  Time: $(date)                             ${NC}"
echo -e "${BLUE}============================================${NC}"

mkdir -p "$REPORT_DIR"

# ── 1. OWASP ZAP Scan ──
echo -e "\n${RED}[1/6] 🔴 OWASP ZAP - Web Application Security Scanner${NC}"
echo "────────────────────────────────────────────"

if command -v docker &> /dev/null; then
    echo "Running ZAP via Docker..."
    docker run --rm -v "$(pwd)/$REPORT_DIR:/zap/wrk:rw" \
        ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
        -t "$TARGET_URL" \
        -r "zap-report-${TIMESTAMP}.html" \
        -J "zap-report-${TIMESTAMP}.json" \
        -l WARN 2>&1 || true

    echo -e "${GREEN}✅ ZAP scan complete → ${REPORT_DIR}/zap-report-${TIMESTAMP}.html${NC}"
elif command -v zap-cli &> /dev/null; then
    echo "Running ZAP CLI..."
    zap-cli quick-scan --self-contained \
        --start-options '-config api.disablekey=true' \
        "$TARGET_URL" 2>&1 || true
    zap-cli report -o "$REPORT_DIR/zap-report-${TIMESTAMP}.html" -f html || true
    echo -e "${GREEN}✅ ZAP CLI scan complete${NC}"
else
    echo -e "${YELLOW}⚠️  ZAP not found. Install Docker or OWASP ZAP CLI.${NC}"
    echo "   Install: docker pull ghcr.io/zaproxy/zaproxy:stable"
fi

# ── 2. Nmap Port Scan ──
echo -e "\n${BLUE}[2/6] 🔵 Nmap - Network & Port Scanner${NC}"
echo "────────────────────────────────────────────"

if command -v nmap &> /dev/null; then
    TARGET_HOST=$(echo "$TARGET_URL" | sed 's|https\?://||' | sed 's|/.*||' | sed 's|:.*||')

    echo "Scanning host: $TARGET_HOST"

    # Basic port scan
    nmap -sV -sC -oN "$REPORT_DIR/nmap-scan-${TIMESTAMP}.txt" \
        -oX "$REPORT_DIR/nmap-scan-${TIMESTAMP}.xml" \
        "$TARGET_HOST" 2>&1 || true

    # Vulnerability scan
    nmap --script vuln -oN "$REPORT_DIR/nmap-vuln-${TIMESTAMP}.txt" \
        "$TARGET_HOST" 2>&1 || true

    echo -e "${GREEN}✅ Nmap scan complete → ${REPORT_DIR}/nmap-scan-${TIMESTAMP}.txt${NC}"
else
    echo -e "${YELLOW}⚠️  Nmap not found.${NC}"
    echo "   Install: sudo apt install nmap (Linux) / brew install nmap (Mac)"
fi

# ── 3. Nikto Web Vulnerability Scanner ──
echo -e "\n${YELLOW}[3/6] 🟡 Nikto - Web Server Scanner${NC}"
echo "────────────────────────────────────────────"

if command -v nikto &> /dev/null; then
    nikto -h "$TARGET_URL" \
        -output "$REPORT_DIR/nikto-report-${TIMESTAMP}.html" \
        -Format htm 2>&1 || true

    echo -e "${GREEN}✅ Nikto scan complete → ${REPORT_DIR}/nikto-report-${TIMESTAMP}.html${NC}"
else
    echo -e "${YELLOW}⚠️  Nikto not found.${NC}"
    echo "   Install: sudo apt install nikto"
fi

# ── 4. Gitleaks - Secret Scanner ──
echo -e "\n${RED}[4/6] 🔑 Gitleaks - Secret Scanning${NC}"
echo "────────────────────────────────────────────"

if command -v gitleaks &> /dev/null; then
    gitleaks detect --source . \
        --report-path "$REPORT_DIR/gitleaks-report-${TIMESTAMP}.json" \
        --report-format json || true
    echo -e "${GREEN}✅ Gitleaks scan complete → ${REPORT_DIR}/gitleaks-report-${TIMESTAMP}.json${NC}"
elif command -v docker &> /dev/null; then
    echo "Running Gitleaks via Docker..."
    docker run --rm -v "$(pwd):/path" \
        zricethezav/gitleaks:latest detect --source /path \
        --report-path "/path/$REPORT_DIR/gitleaks-report-${TIMESTAMP}.json" \
        --report-format json || true
    echo -e "${GREEN}✅ Gitleaks Docker scan complete${NC}"
else
    echo -e "${YELLOW}⚠️  Gitleaks not found.${NC}"
fi

# ── 5. Trivy Container/FS Scanner ──
echo -e "\n${BLUE}[5/6] 🔷 Trivy - Filesystem Vulnerability Scanner${NC}"
echo "────────────────────────────────────────────"

if command -v trivy &> /dev/null; then
    trivy fs --severity HIGH,CRITICAL \
        --format table \
        --output "$REPORT_DIR/trivy-report-${TIMESTAMP}.txt" \
        . 2>&1 || true

    echo -e "${GREEN}✅ Trivy scan complete → ${REPORT_DIR}/trivy-report-${TIMESTAMP}.txt${NC}"
elif command -v docker &> /dev/null; then
    echo "Running Trivy via Docker..."
    docker run --rm -v "$(pwd):/project" \
        aquasec/trivy:latest fs --severity HIGH,CRITICAL \
        --format table \
        /project 2>&1 | tee "$REPORT_DIR/trivy-report-${TIMESTAMP}.txt" || true

    echo -e "${GREEN}✅ Trivy Docker scan complete${NC}"
else
    echo -e "${YELLOW}⚠️  Trivy not found.${NC}"
    echo "   Install: https://aquasecurity.github.io/trivy/"
fi

# ── 6. Lynis System Audit ──
echo -e "\n${GREEN}[6/6] 🟢 Lynis - System Security Audit${NC}"
echo "────────────────────────────────────────────"

if command -v lynis &> /dev/null; then
    lynis audit system --no-colors --quiet \
        --report-file "$REPORT_DIR/lynis-report-${TIMESTAMP}.txt" 2>&1 || true

    echo -e "${GREEN}✅ Lynis audit complete → ${REPORT_DIR}/lynis-report-${TIMESTAMP}.txt${NC}"
else
    echo -e "${YELLOW}⚠️  Lynis not found.${NC}"
    echo "   Install: sudo apt install lynis"
fi

# ── Summary ──
echo -e "\n${BLUE}============================================${NC}"
echo -e "${GREEN}  ✅ SECURITY SCAN COMPLETE                 ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "📁 Reports saved to: ${REPORT_DIR}/"
echo ""
ls -la "$REPORT_DIR/" 2>/dev/null || echo "No reports generated."
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review each report for vulnerabilities"
echo "  2. Fix HIGH/CRITICAL issues"
echo "  3. Re-run scans to verify fixes"
echo "  4. Include before/after reports in submission"
