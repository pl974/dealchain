# 🚀 Push DealChain to GitHub - Step by Step Guide

This guide will help you push your DealChain project to GitHub.

---

## 📋 Prerequisites

- [ ] GitHub account created
- [ ] Git installed locally (✅ Already done)
- [ ] GitHub CLI installed (optional but recommended)

---

## 🎯 Option 1: Using GitHub CLI (Recommended)

### Step 1: Install GitHub CLI (if not installed)

**Windows:**
```powershell
winget install --id GitHub.cli
```

**Or download from**: https://cli.github.com/

### Step 2: Login to GitHub

```bash
gh auth login
```

Follow the prompts:
1. Choose "GitHub.com"
2. Choose "HTTPS"
3. Authenticate with browser or token

### Step 3: Create Repository on GitHub

```bash
cd /c/Users/payet/dealchain

# Create public repository
gh repo create dealchain --public --source=. --remote=origin --push

# This will:
# - Create repo on GitHub
# - Add remote 'origin'
# - Push your code
```

### Step 4: Done! 🎉

Your repository should now be live at:
`https://github.com/YOUR_USERNAME/dealchain`

---

## 🎯 Option 2: Manual Setup via GitHub Web

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `dealchain`
3. Description: `Web3 Discount Marketplace - NFT Coupons on Solana`
4. Visibility: **Public** ✅
5. **DO NOT** initialize with README (we already have one)
6. **DO NOT** add .gitignore (we already have one)
7. **DO NOT** choose a license (we already have MIT)
8. Click **"Create repository"**

### Step 2: Add Remote and Push

```bash
cd /c/Users/payet/dealchain

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/dealchain.git

# Push code
git push -u origin master
```

### Step 3: Verify

Visit: `https://github.com/YOUR_USERNAME/dealchain`

You should see all 29 files!

---

## 🌿 Setup Branch Strategy

### Create and Push Develop Branch

```bash
# Create develop branch
git checkout -b develop

# Push develop branch
git push -u origin develop

# Set develop as default branch (recommended)
# Go to: Settings > Branches > Default branch > Change to 'develop'
```

### Recommended Branch Structure

```
master (main)    - Production releases only
develop          - Development integration
feature/*        - New features
fix/*            - Bug fixes
hotfix/*         - Emergency fixes
```

---

## 🔒 Configure Repository Settings

### 1. Branch Protection Rules

Go to: **Settings > Branches > Add rule**

**For `master` branch:**
- [x] Require pull request reviews before merging
- [x] Require status checks to pass (CI)
- [x] Require branches to be up to date
- [x] Include administrators
- [ ] Allow force pushes (❌ Never!)

**For `develop` branch:**
- [x] Require status checks to pass
- [x] Require branches to be up to date

### 2. Secrets Configuration

Go to: **Settings > Secrets and variables > Actions**

Add these secrets for CI/CD:

**Required Secrets:**
```
VERCEL_TOKEN              # For frontend deployment
VERCEL_ORG_ID            # Vercel organization ID
VERCEL_PROJECT_ID        # Vercel project ID
SOLANA_RPC_URL           # Solana RPC endpoint
SOLANA_DEPLOYER_KEY      # Deployer private key (mainnet)
DISCORD_WEBHOOK          # Discord notifications
```

**Optional Secrets:**
```
PINATA_API_KEY           # IPFS storage
PINATA_SECRET            # IPFS secret
CODECOV_TOKEN            # Code coverage
```

### 3. Enable GitHub Actions

Go to: **Actions > General**

- [x] Allow all actions and reusable workflows
- [x] Allow GitHub Actions to create pull requests

### 4. Configure Pages (Optional)

Go to: **Settings > Pages**

- Source: Deploy from a branch
- Branch: `gh-pages` (if you create one for docs)

### 5. Enable Discussions

Go to: **Settings > Features**

- [x] Discussions (for community Q&A)
- [x] Issues
- [x] Wiki (optional)

---

## 📝 Update Repository Information

### Edit Repository Details

Go to: **⚙️ Settings**

**About Section:**
- Description: `Web3 Discount Marketplace - NFT Coupons on Solana (MonkeDAO Grant - Cypherpunk Hackathon)`
- Website: `https://dealchain.app` (or your deployment URL)
- Topics: `solana`, `web3`, `nft`, `blockchain`, `rust`, `anchor`, `nextjs`, `typescript`, `hackathon`, `monkedao`

**Social Preview:**
Upload a banner image (1200x630px) showing DealChain logo

---

## 🏷️ Create First Release

### Tag Your Initial Release

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Initial release - 100% secure smart contract

- Complete Solana smart contract (10/10 security)
- Next.js 14 frontend foundation
- CI/CD pipelines configured
- Comprehensive documentation
- Ready for Cypherpunk Hackathon submission"

# Push tag
git push origin v1.0.0
```

### Create GitHub Release

1. Go to **Releases > Create a new release**
2. Choose tag: `v1.0.0`
3. Release title: `v1.0.0 - Initial Release`
4. Description: Copy from tag message
5. Attach binaries (if any):
   - Smart contract `.so` file
   - IDL JSON file
6. Click **Publish release**

---

## 🎨 Add Repository Badges

Add these to the top of your `README.md`:

```markdown
![License](https://img.shields.io/github/license/YOUR_USERNAME/dealchain)
![Version](https://img.shields.io/github/v/release/YOUR_USERNAME/dealchain)
![Build](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/dealchain/ci.yml?branch=master)
![Security](https://img.shields.io/badge/security-10%2F10-brightgreen)
![Solana](https://img.shields.io/badge/Solana-v1.18-blueviolet)
![Anchor](https://img.shields.io/badge/Anchor-0.29.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
```

Commit and push:

```bash
git add README.md
git commit -m "docs: add repository badges"
git push
```

---

## 🔔 Setup Notifications

### Discord Integration

1. Create Discord webhook in your server
2. Add webhook URL to repository secrets as `DISCORD_WEBHOOK`
3. GitHub Actions will now send notifications

### Email Notifications

Go to: **Watch > Custom > Configure**

- [x] Issues
- [x] Pull requests
- [x] Releases
- [x] Discussions

---

## 📊 Enable Insights

Go to: **Insights**

View:
- **Pulse** - Activity summary
- **Contributors** - Contributor stats
- **Traffic** - Visitor stats
- **Commits** - Commit history

---

## ✅ Verification Checklist

After pushing, verify:

- [ ] All 29 files are on GitHub
- [ ] README displays correctly
- [ ] License shows as MIT
- [ ] CI workflow badge shows (may take a minute)
- [ ] Issues tab is accessible
- [ ] Pull requests tab is accessible
- [ ] Actions tab shows workflows
- [ ] Security tab shows policies

---

## 🎉 Share Your Repository

### Social Media Post Template

```
🚀 Excited to share DealChain - Web3 Discount Marketplace!

Built for @MonkeDAO Grant at Cypherpunk Hackathon

✨ Features:
- 100% Secure Solana Smart Contract (10/10 audit score)
- NFT Coupons with real-world utility
- User-owned, tradeable discounts
- Modern Next.js 14 frontend

🔒 Security: MAXIMUM level - all vulnerabilities fixed
⚡ Tech: Solana + Anchor + Next.js + TypeScript

Check it out: https://github.com/YOUR_USERNAME/dealchain

#Solana #Web3 #NFT #BuildOnSolana #MonkeDAO
```

### Submit to Hackathon

1. **Superteam Earn**: Submit your GitHub URL
2. **MonkeDAO Discord**: Share in appropriate channel
3. **Twitter**: Tag @MonkeDAO and @Solana

---

## 🆘 Troubleshooting

### Error: Permission Denied

```bash
# Use HTTPS instead of SSH if you haven't set up SSH keys
git remote set-url origin https://github.com/YOUR_USERNAME/dealchain.git
```

### Error: Large Files

```bash
# If you get "file too large" errors
git lfs install  # Install Git LFS
git lfs track "*.so"  # Track large files
```

### Error: Authentication Failed

```bash
# Generate GitHub Personal Access Token
# Go to: Settings > Developer settings > Personal access tokens
# Create token with 'repo' scope
# Use token as password when pushing
```

---

## 📚 Additional Resources

- **GitHub Docs**: https://docs.github.com
- **GitHub CLI**: https://cli.github.com/manual
- **Git Guides**: https://github.com/git-guides

---

## 🎯 Next Steps After Pushing

1. ✅ Push code to GitHub
2. ✅ Configure branch protection
3. ✅ Add repository secrets
4. ✅ Create first release (v1.0.0)
5. ✅ Add repository badges
6. ✅ Share on social media
7. ✅ Submit to hackathon
8. ✅ Start building UI/UX

---

**Need Help?**

If you encounter any issues:
1. Check GitHub Status: https://www.githubstatus.com
2. Review GitHub Docs: https://docs.github.com
3. Ask in Discord: (your server link)

---

Good luck with your push! 🚀

Repository Preview: `https://github.com/YOUR_USERNAME/dealchain`
