# 🚨 URGENT: Kaggle API Token Security

**Date:** 2025-12-10  
**Priority:** 🔴 **CRITICAL**

## ⚠️ Token Exposure Incident

A Kaggle API token was exposed in chat logs. **This token is now compromised and must be revoked immediately.**

## Immediate Actions Required

### Step 1: Revoke Exposed Token (5 minutes)

1. **Go to Kaggle Account Settings:**
   - Visit: https://www.kaggle.com/settings
   - Navigate to **API** section

2. **Revoke Current Token:**
   - Find the token that was exposed
   - Click **Revoke** or **Delete**
   - Confirm revocation

3. **Verify Revocation:**
   - Any scripts using the old token should immediately fail
   - This prevents unauthorized access

### Step 2: Generate New Token (2 minutes)

1. **Create New API Token:**
   - Still in Kaggle Settings → API
   - Click **Create New Token**
   - Download the `kaggle.json` file

2. **Secure Storage:**
   - **DO NOT** paste token in chat, code, or documentation
   - Store in `.env.local` or system keyring only
   - Never commit to git

### Step 3: Configure New Token (3 minutes)

```bash
# Create Kaggle config directory
mkdir -p ~/.config/kaggle

# Copy your NEW kaggle.json to config location
cp ~/Downloads/kaggle.json ~/.config/kaggle/kaggle.json

# Set secure permissions (CRITICAL)
chmod 600 ~/.config/kaggle/kaggle.json

# Verify it works
kaggle datasets list -s "electronics" | head -5
```

### Step 4: Update Environment (Optional)

If you want to use token in scripts (not recommended), add to `.env.local`:

```bash
# .env.local (NEVER commit this file)
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_new_key_here
```

**Better approach:** Use `~/.config/kaggle/kaggle.json` (Kaggle CLI reads this automatically)

## Security Best Practices

### ✅ DO:
- Store tokens in `~/.config/kaggle/kaggle.json` with `chmod 600`
- Use environment variables if needed (never commit)
- Rotate tokens periodically (every 90 days)
- Use separate tokens for different projects if possible

### ❌ DON'T:
- Paste tokens in chat, code, or documentation
- Commit tokens to git (even in private repos)
- Share tokens with others
- Use tokens in public scripts or notebooks
- Store tokens in plain text files in project directories

## Verification Checklist

- [ ] Old token revoked in Kaggle dashboard
- [ ] New token generated and downloaded
- [ ] Token stored in `~/.config/kaggle/kaggle.json` with `chmod 600`
- [ ] Kaggle CLI tested and working
- [ ] Old token removed from any scripts or `.env` files
- [ ] Git history checked (if token was committed, rotate again)

## If Token Was Committed to Git

If the exposed token was ever committed to git:

1. **Rotate token immediately** (already done above)
2. **Remove from git history:**
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   # This is advanced - consider if repo is public
   ```
3. **Force push** (only if private repo, coordinate with team)
4. **Consider token burned** - assume it's been scraped

## Next Steps

After securing the token:
1. Proceed with DXM ASIN Sourcing Engine setup
2. Use Kaggle CLI with the new token
3. Never expose tokens again

---

**Status:** 🔴 **ACTION REQUIRED** - Complete steps 1-3 before proceeding with dataset downloads.

