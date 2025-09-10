# 🚀 Sports Record Sharing Epic - GitHub Sync Guide

## 📋 Epic Summary

**Epic**: `sports-record-sharing` - 运动记录分享小程序  
**Status**: Ready for GitHub sync  
**Total Tasks**: 30 (complete)  
**Estimated Effort**: 444-572 hours (≈ 11-14 weeks)  

### Phase Breakdown
- ✅ **Phase 1**: 基础架构 (Week 1) - 5 tasks
- ✅ **Phase 2**: 核心功能 (Week 2-3) - 5 tasks  
- ✅ **Phase 3**: 分享功能 (Week 4) - 5 tasks
- ✅ **Phase 4**: 历史管理 (Week 5) - 5 tasks
- ✅ **Phase 5**: 集成优化 (Week 6) - 5 tasks
- ✅ **Phase 6**: 测试发布 (Week 7-9) - 5 tasks

## 🔧 Pre-Sync Requirements

### 1. GitHub Repository Setup
```bash
# Create new repository on GitHub (or use existing)
# Recommended name: taro-sports-record-sharing
# Make it public or private based on your needs
```

### 2. GitHub CLI Authentication
```bash
# Authenticate with GitHub
gh auth login

# Verify authentication
gh auth status
```

### 3. Repository Configuration
```bash
# Set up remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push initial commit
git push -u origin main
```

## 🎯 Sync Process

### Step 1: Create Epic Issue
**File**: `.claude/epics/sports-record-sharing/epic.md`

**Command**:
```bash
# Create epic issue
grep -A 1000 "## 🏗️ 架构决策" .claude/epics/sports-record-sharing/epic.md | \
  sed '1,/^---$/d; 1,/^---$/d' | \
  head -n 400 > /tmp/epic-body.md

ghtitle="Epic: 运动记录分享小程序 - Taro + CloudBase + MCPM"
ghtype="feature"

ghepic=$(gh issue create \
  --title "$ghtitle" \
  --body-file /tmp/epic-body.md \
  --label "epic,epic:sports-record-sharing,$ghtype" \
  --json number -q .number)

echo "Epic created: #$ghepic"
```

### Step 2: Check GitHub CLI Extensions
```bash
# Check if gh-sub-issue is available
if gh extension list | grep -q "yahsan2/gh-sub-issue"; then
  echo "✅ gh-sub-issue available - can create sub-issues"
  use_subissues=true
else
  echo "⚠️ gh-sub-issue not available - will create regular issues"
  use_subissues=false
fi
```

### Step 3: Install gh-sub-issue (Optional but Recommended)
```bash
# Install gh-sub-issue extension for better issue hierarchy
gh extension install yahsan2/gh-sub-issue
```

## 📋 Task Creation Matrix

| Phase | Tasks | Priority | Dependencies | Parallel |
|-------|--------|----------|--------------|----------|
| **Phase 1** | 001-005 | High | Foundation | ✅ |
| **Phase 2** | 006-010 | High | Phase 1 | ✅ |
| **Phase 3** | 011-015 | Medium | Phase 2 | Mixed |
| **Phase 4** | 016-020 | Medium | Phase 2-3 | ✅ |
| **Phase 5** | 021-025 | Medium | Most previous | Mixed |
| **Phase 6** | 026-030 | High | All previous | ❌ |

## 🚀 Automated Sync Commands

### Option A: Full Automated Sync (Recommended)
```bash
# This will handle everything automatically
/pm:epic-sync sports-record-sharing
```

### Option B: Manual Step-by-Step

#### Create Epic Issue
```bash
# Extract and prepare epic content
sed '1,/^---$/d; 1,/^---$/d' .claude/epics/sports-record-sharing/epic.md | \
  awk '/^## Tasks Created/{exit} {print}' > /tmp/epic-content.md

gh issue create \
  --title "Epic: 运动记录分享小程序 - 技术实施" \
  --body-file /tmp/epic-content.md \
  --label "epic,epic:sports-record-sharing,feature"
```

#### Create Task Issues (Batch 1: Phase 1)
```bash
# Phase 1 tasks (001-005) - can be created in parallel
for task in 001 002 003 004 005; do
  task_file=".claude/epics/sports-record-sharing/${task}.md"
  task_name=$(grep '^name:' "$task_file" | sed 's/^name: *//')
  
  # Strip frontmatter
  sed '1,/^---$/d; 1,/^---$/d' "$task_file" > /tmp/task-${task}.md
  
  # Create issue
  gh issue create \
    --title "$task_name" \
    --body-file /tmp/task-${task}.md \
    --label "task,epic:sports-record-sharing,phase-1"
done
```

#### Create Task Issues (Batch 2: Phase 2)
```bash
# Phase 2 tasks (006-010)
for task in 006 007 008 009 010; do
  task_file=".claude/epics/sports-record-sharing/${task}.md"
  task_name=$(grep '^name:' "$task_file" | sed 's/^name: *//')
  
  sed '1,/^---$/d; 1,/^---$/d' "$task_file" > /tmp/task-${task}.md
  
  gh issue create \
    --title "$task_name" \
    --body-file /tmp/task-${task}.md \
    --label "task,epic:sports-record-sharing,phase-2"
done
```

Continue similarly for Phases 3-6...

## 📊 Issue Labeling Strategy

### Epic Labels
- `epic` - Main epic identifier
- `epic:sports-record-sharing` - Epic-specific label
- `feature` - Issue type
- `taro` - Technology stack
- `wechat-miniprogram` - Platform

### Task Labels
- `task` - Task identifier
- `epic:sports-record-sharing` - Epic association
- `phase-{1-6}` - Implementation phase
- `priority-{high|medium|low}` - Priority level
- `parallel` - Can be worked on concurrently

## 🔄 Post-Sync Actions

### 1. Update Local Files
After creating GitHub issues, update local task files with GitHub URLs:

```bash
# This will be done automatically by the sync process
# But you can manually update if needed:
# - Update github: field in frontmatter
# - Update depends_on references to use GitHub issue numbers
# - Rename files from 001.md to #{issue_number}.md
```

### 2. Create GitHub Mapping File
```bash
# This will be created automatically as:
# .claude/epics/sports-record-sharing/github-mapping.md
```

### 3. Update Epic with Real Issue Numbers
```bash
# Epic file will be updated with actual GitHub issue numbers
# Instead of 001.md, 002.md, etc., it will show #123, #124, etc.
```

## 🎯 Next Steps After Sync

1. **Start Development**: `/pm:epic-start sports-record-sharing`
2. **Monitor Progress**: `/pm:epic-status sports-record-sharing`
3. **Work on Issues**: `/pm:issue-start {issue_number}`
4. **Sync Updates**: `/pm:issue-sync {issue_number}`

## ⚠️ Important Notes

- **Authentication Required**: You must run `gh auth login` first
- **Repository Access**: Ensure you have write access to the target repository
- **Issue Limits**: GitHub has rate limits - the automated process handles this
- **File References**: All task dependencies will be updated to use real GitHub issue numbers
- **Worktree Creation**: A development worktree will be created at `../epic-sports-record-sharing`

## 🆘 Troubleshooting

### GitHub CLI Not Working
```bash
# Reinstall GitHub CLI
brew reinstall gh
gh auth login
```

### Rate Limiting
```bash
# Check rate limit status
gh api rate_limit
```

### Permission Issues
```bash
# Check repository permissions
gh repo view YOUR_USERNAME/YOUR_REPO --json viewerPermission
```

## 📞 Support

If you encounter issues:
1. Check GitHub CLI documentation: https://cli.github.com/manual/
2. Verify repository settings and permissions
3. Run individual commands step-by-step to isolate issues
4. Check the generated mapping file for sync status

---

**Ready to sync?** Run: `/pm:epic-sync sports-record-sharing`