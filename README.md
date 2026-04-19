# 🏙️ Smart City Services Portal — Full DevSecOps Project

> A production-grade, full-stack Smart City web application with a complete DevSecOps CI/CD pipeline using Jenkins, Terraform, Ansible, OWASP ZAP, and AWS Blue-Green deployment.

---

## 🗂️ Project Structure

```
smart-city-portal/
├── index.html              # Home page
├── complaint.html          # Register complaints
├── bill.html               # Pay bills
├── parking.html            # Smart parking
├── traffic.html            # Traffic updates
├── dashboard.html          # Admin portal
├── login.html / register.html
├── css/                    # Stylesheets
├── js/                     # JavaScript modules
├── backend/
│   └── server.js           # Express + MongoDB API
├── terraform/
│   ├── main.tf             # VPC, EC2, ALB, Security Groups
│   ├── variables.tf
│   └── outputs.tf
├── ansible/
│   ├── inventory.ini       # Server IPs
│   ├── install_apache.yml  # Server setup
│   └── deploy_app.yml      # App deployment
├── scripts/
│   ├── security_scan.sh    # OWASP ZAP, Nmap, Nikto, Trivy
│   ├── cloudwatch_setup.sh # AWS monitoring
│   └── blue_green_switch.sh
├── Jenkinsfile             # CI/CD pipeline
└── .github/workflows/      # GitHub Actions
```

---

## 🚀 Features

| Feature | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JS |
| Backend API | Node.js, Express |
| Database | MongoDB Atlas |
| Infrastructure | Terraform (AWS) |
| Configuration | Ansible |
| CI/CD | Jenkins |
| Deployment | Blue-Green on AWS ALB |
| Security | OWASP ZAP, Nmap, Nikto, Trivy |
| Monitoring | AWS CloudWatch |

---

## 🔧 Step-by-Step Setup Guide

### Step 1 — Run Backend Locally
```bash
npm install
npm run backend     # Starts Express server on port 5000
npm run dev         # Starts Vite frontend on port 5174
```

**Admin Login:** `admin` / `admin123`

---

### Step 2 — Terraform (AWS Infrastructure)

**Prerequisites:** AWS CLI configured, Terraform installed

```bash
cd terraform/

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Create infrastructure
terraform apply

# Save outputs
terraform output > ../terraform_outputs.txt
```

**What gets created:**
- ✅ VPC with 2 public subnets
- ✅ EC2 Blue instance (subnet-a)
- ✅ EC2 Green instance (subnet-b)
- ✅ Security Group (SSH + HTTP)
- ✅ Application Load Balancer
- ✅ Blue & Green Target Groups
- ✅ ALB Listener (initially → Blue)

---

### Step 3 — Ansible (Server Setup)

**Prerequisites:** Ansible installed, EC2 key pair downloaded

```bash
# Update inventory with Terraform outputs
# Edit ansible/inventory.ini → replace <BLUE_IP> and <GREEN_IP>

# Install Apache on both servers
ansible-playbook -i ansible/inventory.ini ansible/install_apache.yml \
  --private-key ~/.ssh/smart-city-key.pem

# Deploy application to Green first
ansible-playbook -i ansible/inventory.ini ansible/deploy_app.yml \
  --extra-vars "target_env=green" \
  --private-key ~/.ssh/smart-city-key.pem
```

---

### Step 4 — Jenkins Setup

1. Install Jenkins on a separate EC2 or local machine
2. Install plugins: **Git, Pipeline, AWS Credentials, Ansible, SSH Agent**
3. Add these credentials in Jenkins:
   - `blue-server-ip` — IP of Blue EC2
   - `green-server-ip` — IP of Green EC2
   - `alb-listener-arn` — From Terraform output
   - `blue-tg-arn` — From Terraform output
   - `green-tg-arn` — From Terraform output
   - `ec2-ssh-key` — PEM key file
4. Create a new **Pipeline** job → point to this repo's `Jenkinsfile`
5. Run the pipeline

---

### Step 5 — Security Scanning

```bash
# Run all scans against the Green server
chmod +x scripts/security_scan.sh
./scripts/security_scan.sh http://<GREEN_IP>

# Reports saved to ./reports/
```

**Tools used:**
- 🔴 **OWASP ZAP** — XSS, SQL Injection, CSRF detection
- 🔵 **Nmap** — Open port & service scan
- 🟡 **Nikto** — Web server misconfiguration
- 🔷 **Trivy** — Filesystem vulnerability scan
- 🟢 **Lynis** — System security audit

---

### Step 6 — Blue-Green Traffic Switch

```bash
# After verifying Green is healthy, switch traffic
export ALB_LISTENER_ARN="<from terraform output>"
export GREEN_TARGET_GROUP_ARN="<from terraform output>"
export BLUE_TARGET_GROUP_ARN="<from terraform output>"

chmod +x scripts/blue_green_switch.sh

# Switch to Green (go live)
./scripts/blue_green_switch.sh green

# Rollback to Blue (if issues)
./scripts/blue_green_switch.sh blue
```

---

### Step 7 — CloudWatch Monitoring

```bash
# Run on each EC2 instance
chmod +x scripts/cloudwatch_setup.sh
./scripts/cloudwatch_setup.sh ap-south-1
```

**Monitors:**
- CPU, Memory, Disk usage
- Apache access & error logs
- System logs
- CloudWatch Alarms for high CPU

---

## 🔄 Complete Pipeline Flow

```
Push to GitHub
      ↓
Jenkins Checkout
      ↓
Build (Validate files)
      ↓
Test (HTML/JS syntax)
      ↓
🔐 Security Scan (ZAP + Nmap + Nikto)
      ↓
Deploy to GREEN server (Ansible)
      ↓
Health Check (HTTP 200 + content verify)
      ↓
Switch ALB → GREEN ✅
      ↓
    (if fail)
      ↓
Rollback to BLUE 🔴
```

---

## 📸 Submission Checklist

- [ ] Terraform `apply` output screenshot
- [ ] EC2 Blue & Green running in AWS Console
- [ ] ALB DNS working in browser
- [ ] Jenkins pipeline all stages green
- [ ] OWASP ZAP HTML report (before fix)
- [ ] OWASP ZAP HTML report (after fix)
- [ ] Nmap scan results
- [ ] Nikto scan results
- [ ] Burp Suite intercept screenshots
- [ ] Wireshark traffic capture
- [ ] CloudWatch metrics screenshot
- [ ] Blue-Green switch working

---

## 👩‍💻 Developer

**Navya Reddy** — Final Year Engineering Project  
Smart City Services Portal — DevSecOps Pipeline
