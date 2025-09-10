# 🚀 Manual GitHub Sync Guide - Sports Record Sharing Epic

## ⚠️ Current Status: Manual Sync Required

**Issue**: GitHub authentication not available in current environment  
**Solution**: Manual sync process with step-by-step instructions  
**Prepared**: All templates and scripts ready for execution  

## 📋 Pre-Sync Checklist

### ✅ Completed Preparation
- [x] All 30 tasks created and verified (001-030)
- [x] Epic documentation complete
- [x] Git repository initialized
- [x] GitHub CLI installed (gh v2.78.0)
- [x] Sync preparation scripts generated
- [x] Issue templates created

### ⏳ Manual Steps Required
- [ ] GitHub authentication setup
- [ ] GitHub repository creation/configuration
- [ ] Manual issue creation using templates
- [ ] Local file updates with issue numbers
- [ ] Worktree creation for development

## 🔧 Step 1: GitHub Setup

### 1.1 Authenticate with GitHub
```bash
# Run this in your terminal (interactive)
gh auth login

# Follow the prompts to authenticate
# Choose HTTPS or SSH authentication
# Complete the web browser flow
```

### 1.2 Create/Configure Repository
**Option A: Create New Repository**
```bash
# Create new repository on GitHub (or use web interface)
# Recommended name: taro-sports-record-sharing
# Make it public or private based on your needs
```

**Option B: Use Existing Repository**
```bash
# Set up remote for existing repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Verify remote
git remote -v
```

### 1.3 Verify Setup
```bash
# Test GitHub CLI connectivity
gh auth status
gh repo view YOUR_USERNAME/YOUR_REPO --json nameWithOwner
```

## 🎯 Step 2: Epic Issue Creation

### 2.1 Prepare Epic Content
```bash
# Extract epic content (strip frontmatter)
sed '1,/^---$/d; 1,/^---$/d' .claude/epics/sports-record-sharing/epic.md | \
  awk '/^## Tasks Created/{exit} {print}' > /tmp/epic-content.md
```

### 2.2 Create Epic Issue
**Manual Method (Recommended)**
```bash
# Create epic issue
ghtitle="Epic: 运动记录分享小程序 - Taro + CloudBase + MCPM"
ghepic=$(gh issue create \
  --title "$ghtitle" \
  --body-file /tmp/epic-content.md \
  --label "epic,epic:sports-record-sharing,feature" \
  --json number -q .number)

echo "Epic created: #$ghepic"
```

**Web Interface Method**
1. Go to your GitHub repository
2. Click "Issues" → "New issue"
3. Use title: `Epic: 运动记录分享小程序 - Taro + CloudBase + MCPM`
4. Use content from `/tmp/epic-content.md`
5. Add labels: `epic,epic:sports-record-sharing,feature`
6. Save the issue number for later

## 📊 Step 3: Task Issue Creation

### 3.1 Check GitHub CLI Extensions
```bash
# Check if gh-sub-issue is available
if gh extension list | grep -q "yahsan2/gh-sub-issue"; then
  echo "✅ gh-sub-issue available - can create sub-issues"
  use_subissues=true
else
  echo "⚠️ gh-sub-issue not available - creating regular issues"
  use_subissues=false
fi
```

### 3.2 Install gh-sub-issue (Optional but Recommended)
```bash
# Install gh-sub-issue extension for better issue hierarchy
gh extension install yahsan2/gh-sub-issue
```

### 3.3 Create Task Issues (Batch Process)

**Use the Generated Batch Script**
```bash
# Navigate to epic directory
cd .claude/epics/sports-record-sharing

# Run the prepared batch creation script
# Replace EPIC_NUMBER with your actual epic issue number
/tmp/epic-sync-sports-record-sharing/create-all-issues.sh EPIC_NUMBER
```

**Or Manual Phase-by-Phase Creation**

#### Phase 1: Foundation (001-005)
```bash
for task in 001 002 003 004 005; do
  task_file="${task}.md"
  task_name=$(grep '^name:' "$task_file" | sed 's/^name: *//')
  
  # Strip frontmatter
  sed '1,/^---$/d; 1,/^---$/d' "$task_file" > /tmp/task-${task}.md
  
  # Create issue
  if [ "$use_subissues" = true ]; then
    gh sub-issue create \
      --parent "$EPIC_NUMBER" \
      --title "Task ${task}: ${task_name}" \
      --body-file /tmp/task-${task}.md \
      --label "task,epic:sports-record-sharing,phase-1,parallel"
  else
    gh issue create \
      --title "Task ${task}: ${task_name}" \
      --body-file /tmp/task-${task}.md \
      --label "task,epic:sports-record-sharing,phase-1,parallel"
  fi
  sleep 2  # Rate limiting
done
```

Continue similarly for Phases 2-6...

## 🔄 Step 4: Complete Automated Sync

After creating all issues manually, run the automated sync to update local files:
```bash
# This will update local task files with GitHub issue numbers
/pm:epic-sync sports-record-sharing
```

**Note**: If the automated sync fails due to authentication, proceed to Step 5 for manual file updates.

## 📝 Step 5: Manual File Updates (If Automated Sync Fails)

### 5.1 Collect Issue Numbers
Manually collect all issue numbers and create a mapping:
```bash
# Create mapping file with actual issue numbers
cat > /tmp/manual-mapping.txt << EOF
001:123
002:124
003:125
# ... add all your actual issue numbers
EOF
```

### 5.2 Update Task Files
```bash
# Update task files with GitHub issue numbers
while IFS=: read -r old_num new_num; do
  # Rename file
  mv "${old_num}.md" "${new_num}.md"
  
  # Update frontmatter
  sed -i.bak "/^github:/c\github: https://github.com/YOUR_USERNAME/YOUR_REPO/issues/${new_num}" "${new_num}.md"
  sed -i.bak "/^updated:/c\updated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" "${new_num}.md"
  rm "${new_num}.md.bak"
done < /tmp/manual-mapping.txt
```

### 5.3 Update Dependencies
```bash
# Update depends_on references in all task files
for task_file in *.md; do
  # Update references using the mapping
  while IFS=: read -r old_num new_num; do
    sed -i.bak "s/\b${old_num}\b/${new_num}/g" "$task_file"
  done < /tmp/manual-mapping.txt
  rm "${task_file}.bak"
done
```

### 5.4 Update Epic File
```bash
# Update epic.md with real issue numbers
# This will be done automatically if you run the automated sync
```

## 🏗️ Step 6: Create Development Worktree

```bash
# Create worktree for epic development
git worktree add ../epic-sports-record-sharing -b epic/sports-record-sharing

echo "✅ Development worktree created at: ../epic-sports-record-sharing"
```

## 📊 Step 7: Verification and Next Steps

### 7.1 Verify Sync
```bash
# Check that all issues were created
gh issue list --label "epic:sports-record-sharing" --state all

# Should show 31 issues (1 epic + 30 tasks)
```

### 7.2 Create Mapping File
```bash
# This will be created automatically, but verify it exists
ls -la .claude/epics/sports-record-sharing/github-mapping.md
```

### 7.3 Ready for Development
```bash
# Start development on any issue
/pm:issue-start {issue_number}

# Or start the entire epic
/pm:epic-start sports-record-sharing
```

## 🆘 Troubleshooting

### Authentication Issues
```bash
# Re-authenticate
gh auth logout
gh auth login

# Check token validity
gh auth status
```

### Rate Limiting
```bash
# Check rate limit
gh api rate_limit

# Add delays between requests if needed
sleep 5  # Wait 5 seconds between API calls
```

### Repository Access Issues
```bash
# Check permissions
gh repo view YOUR_USERNAME/YOUR_REPO --json viewerPermission

# Verify repository exists
gh repo view YOUR_USERNAME/YOUR_REPO --json nameWithOwner
```

### Issue Creation Failures
- Check GitHub token permissions
- Verify repository settings
- Ensure labels exist or are created
- Check for duplicate issue titles

## 🎯 Alternative: Use Generated Scripts

**Use the prepared automation scripts**
```bash
# Navigate to epic directory
cd .claude/epics/sports-record-sharing

# Run preparation (already done, but can re-run)
./prepare-sync.sh

# Use generated batch script (after authentication)
/tmp/epic-sync-sports-record-sharing/create-all-issues.sh YOUR_EPIC_NUMBER

# Complete the sync process
/pm:epic-sync sports-record-sharing
```

## 📋 Summary Checklist

### Before You Start
- [ ] GitHub account with repository access
- [ ] GitHub CLI installed and authenticated
- [ ] Repository created or configured
- [ ] All 30 tasks verified locally

### During Sync
- [ ] Epic issue created with proper labels
- [ ] All 30 task issues created
- [ ] Issue numbers collected and mapped
- [ ] Local files updated with GitHub references
- [ ] Dependencies updated with real issue numbers

### After Sync
- [ ] Verification that all issues were created
- [ ] Mapping file created and updated
- [ ] Development worktree created
- [ ] Ready to start development

---

**🚀 Ready to proceed?** Follow the steps above and your epic will be fully synced to GitHub! If you encounter any issues, refer to the troubleshooting section or use the generated automation scripts for assistance.,