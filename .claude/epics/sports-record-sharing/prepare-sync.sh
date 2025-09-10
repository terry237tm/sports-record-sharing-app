#!/bin/bash

# 🚀 Sports Record Sharing Epic - Pre-Sync Preparation Script
# This script prepares the epic for GitHub sync and generates issue templates

set -e

EPIC_NAME="sports-record-sharing"
EPIC_DIR=".claude/epics/${EPIC_NAME}"
TEMP_DIR="/tmp/epic-sync-${EPIC_NAME}"

echo "🚀 Preparing ${EPIC_NAME} epic for GitHub sync..."

# Create temp directory
mkdir -p "$TEMP_DIR"

# Function to extract task info
extract_task_info() {
    local task_file="$1"
    local task_num=$(basename "$task_file" .md)
    
    # Extract frontmatter fields
    local name=$(grep '^name:' "$task_file" | sed 's/^name: *//')
    local status=$(grep '^status:' "$task_file" | sed 's/^status: *//')
    local parallel=$(grep '^parallel:' "$task_file" | sed 's/^parallel: *//')
    local depends_on=$(grep '^depends_on:' "$task_file" | sed 's/^depends_on: *//')
    
    # Extract task body (without frontmatter)
    local body=$(sed '1,/^---$/d; 1,/^---$/d' "$task_file")
    
    echo "Task: $task_num"
    echo "Name: $name"
    echo "Status: $status"
    echo "Parallel: $parallel"
    echo "Depends on: $depends_on"
    echo "---"
    echo "$body"
}

# Function to determine phase from task number
determine_phase() {
    local task_num="$1"
    local num=$(echo "$task_num" | sed 's/^0*//')
    
    if [ "$num" -le 5 ]; then
        echo "1"
    elif [ "$num" -le 10 ]; then
        echo "2"
    elif [ "$num" -le 15 ]; then
        echo "3"
    elif [ "$num" -le 20 ]; then
        echo "4"
    elif [ "$num" -le 25 ]; then
        echo "5"
    else
        echo "6"
    fi
}

# Function to get phase name
get_phase_name() {
    local phase="$1"
    case "$phase" in
        1) echo "基础架构" ;;
        2) echo "核心功能" ;;
        3) echo "分享功能" ;;
        4) echo "历史管理" ;;
        5) echo "集成优化" ;;
        6) echo "测试发布" ;;
        *) echo "Unknown" ;;
    esac
}

# Extract epic information
echo "📋 Extracting epic information..."
EPIC_FILE="${EPIC_DIR}/epic.md"
EPIC_TITLE=$(grep '^name:' "$EPIC_FILE" | head -1 | sed 's/^name: *//' || echo "运动记录分享小程序")
EPIC_DESCRIPTION=$(sed '1,/^---$/d; 1,/^---$/d' "$EPIC_FILE" | head -n 50)

# Create epic issue template
echo "📝 Creating epic issue template..."
cat > "$TEMP_DIR/epic-issue.md" << EOF
# Epic: ${EPIC_TITLE}

${EPIC_DESCRIPTION}

## 📊 Project Stats
- **Total Tasks**: 30
- **Parallel Tasks**: 25 (83% can be developed concurrently)
- **Sequential Tasks**: 5 (testing/release phase)
- **Estimated Effort**: 444-572 hours (≈ 11-14 weeks)

## 🎯 Implementation Phases

### Phase 1: 基础架构 (Week 1)
Foundation setup with project initialization, TypeScript configuration, Redux setup, cloud functions, and testing framework.

### Phase 2: 核心功能 (Week 2-3)
Core functionality including sport record creation, image upload, location services, form validation, and data storage.

### Phase 3: 分享功能 (Week 4)
Sharing features with Canvas image generation, template design, export functionality, WeChat integration, and analytics.

### Phase 4: 历史管理 (Week 5)
History management with record listing, pagination optimization, detail pages, image preview, and local caching.

### Phase 5: 集成优化 (Week 6)
Integration and optimization including page navigation, performance tuning, cross-platform adaptation, UX optimization, and security hardening.

### Phase 6: 测试发布 (Week 7-9)
Testing and release with functional testing, performance testing, compatibility testing, launch preparation, and deployment monitoring.

## 🚀 Technology Stack
- **Frontend**: Taro 3.x + React Hooks + TypeScript
- **Backend**: CloudBase MCP Tools + MongoDB
- **Platforms**: WeChat Mini Program + H5
- **State Management**: Redux Toolkit
- **Build Tools**: Webpack 5

## 📋 Next Steps
1. Sync tasks to GitHub issues
2. Set up development worktree
3. Begin parallel development
4. Monitor progress and update status

---
*This epic is ready for implementation. Use \`/pm:epic-start ${EPIC_NAME}\` to begin development.*
EOF

# Create task issue templates
echo "📝 Creating task issue templates..."
mkdir -p "$TEMP_DIR/tasks"

# Process each task file
for task_file in ${EPIC_DIR}/[0-9][0-9][0-9].md; do
    [ -f "$task_file" ] || continue
    
    task_num=$(basename "$task_file" .md)
    phase=$(determine_phase "$task_num")
    phase_name=$(get_phase_name "$phase")
    
    echo "Processing task $task_num (Phase $phase: $phase_name)..."
    
    # Extract task info
    task_info=$(extract_task_info "$task_file")
    task_name=$(echo "$task_info" | grep "^Name:" | sed 's/^Name: *//')
    task_body=$(echo "$task_info" | sed '1,/^---$/d')
    
    # Determine labels
    parallel=$(echo "$task_info" | grep "^Parallel:" | sed 's/^Parallel: *//')
    if [ "$parallel" = "true" ]; then
        parallel_label=",parallel"
    else
        parallel_label=""
    fi
    
    # Create task issue template
    cat > "$TEMP_DIR/tasks/${task_num}.md" << EOF
# Task: ${task_name}

**Phase**: ${phase_name} (Phase ${phase})  
**Task Number**: ${task_num}  
**Epic**: Sports Record Sharing Mini Program  

${task_body}

---

## 📋 Implementation Notes
- This task is part of the sports record sharing epic
- Follow the technical specifications in the main epic
- Use Taro + TypeScript + CloudBase MCP Tools
- Ensure cross-platform compatibility (WeChat + H5)
- Follow Chinese documentation requirements

## 🔄 Dependencies
See task file for specific dependency information.

## ✅ Definition of Done
- [ ] Code implemented and tested
- [ ] Documentation updated (Chinese)
- [ ] Code review completed
- [ ] Performance requirements met
- [ ] Cross-platform testing completed
EOF
    
    # Create GitHub CLI command
    cat > "$TEMP_DIR/tasks/${task_num}-command.sh" << EOF
#!/bin/bash
# Command to create issue for task ${task_num}

gh issue create \
  --title "Task ${task_num}: ${task_name}" \
  --body-file "$(pwd)/$TEMP_DIR/tasks/${task_num}.md" \
  --label "task,epic:${EPIC_NAME},phase-${phase}${parallel_label}"
EOF
    
    chmod +x "$TEMP_DIR/tasks/${task_num}-command.sh"
done

# Create batch creation script
echo "📝 Creating batch creation script..."
cat > "$TEMP_DIR/create-all-issues.sh" << 'EOF'
#!/bin/bash

# Batch creation script for sports-record-sharing epic
# Run this after creating the epic issue

EPIC_NUMBER="${1:-}"
if [ -z "$EPIC_NUMBER" ]; then
    echo "Usage: $0 <epic_issue_number>"
    echo "Please provide the epic issue number created in GitHub"
    exit 1
fi

echo "🚀 Creating task issues for epic #$EPIC_NUMBER..."

# Check if gh-sub-issue is available
if gh extension list | grep -q "yahsan2/gh-sub-issue"; then
    echo "✅ Using gh-sub-issue for sub-issues"
    use_subissues=true
else
    echo "⚠️ Creating regular issues (install gh-sub-issue for sub-issues)"
    use_subissues=false
fi

# Create issues in phases to avoid rate limiting
echo "📊 Phase 1: Foundation tasks (001-005)"
for task in 001 002 003 004 005; do
    if [ "$use_subissues" = true ]; then
        gh sub-issue create \
          --parent "$EPIC_NUMBER" \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-1,parallel"
    else
        gh issue create \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-1,parallel"
    fi
    sleep 2  # Rate limiting
done

echo "📊 Phase 2: Core functionality (006-010)"
for task in 006 007 008 009 010; do
    if [ "$use_subissues" = true ]; then
        gh sub-issue create \
          --parent "$EPIC_NUMBER" \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-2,parallel"
    else
        gh issue create \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-2,parallel"
    fi
    sleep 2
done

echo "📊 Phase 3: Sharing features (011-015)"
for task in 011 012 013 014 015; do
    parallel_label="parallel"
    if [ "$task" = "012" ]; then
        parallel_label="sequential"  # Template design depends on Canvas
    fi
    
    if [ "$use_subissues" = true ]; then
        gh sub-issue create \
          --parent "$EPIC_NUMBER" \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-3,$parallel_label"
    else
        gh issue create \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-3,$parallel_label"
    fi
    sleep 2
done

echo "📊 Phase 4: History management (016-020)"
for task in 016 017 018 019 020; do
    if [ "$use_subissues" = true ]; then
        gh sub-issue create \
          --parent "$EPIC_NUMBER" \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-4,parallel"
    else
        gh issue create \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-4,parallel"
    fi
    sleep 2
done

echo "📊 Phase 5: Integration & optimization (021-025)"
for task in 021 022 023 024 025; do
    parallel_label="parallel"
    if [ "$task" = "025" ]; then
        parallel_label="sequential"  # Security hardening
    fi
    
    if [ "$use_subissues" = true ]; then
        gh sub-issue create \
          --parent "$EPIC_NUMBER" \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-5,$parallel_label"
    else
        gh issue create \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-5,$parallel_label"
    fi
    sleep 2
done

echo "📊 Phase 6: Testing & release (026-030)"
for task in 026 027 028 029 030; do
    if [ "$use_subissues" = true ]; then
        gh sub-issue create \
          --parent "$EPIC_NUMBER" \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-6,sequential"
    else
        gh issue create \
          --title "Task ${task}: $(grep '^name:' "tasks/${task}.md" | sed 's/^name: *//')" \
          --body-file "tasks/${task}.md" \
          --label "task,epic:sports-record-sharing,phase-6,sequential"
    fi
    sleep 2
done

echo "✅ All task issues created for epic #$EPIC_NUMBER!"
echo ""
echo "Next steps:"
echo "1. Update local files with issue numbers: /pm:epic-sync ${EPIC_NAME}"
echo "2. Start development: /pm:epic-start ${EPIC_NAME}"
echo "3. Monitor progress: /pm:epic-status ${EPIC_NAME}"
EOF

chmod +x "$TEMP_DIR/create-all-issues.sh"

# Create mapping template
echo "📝 Creating mapping template..."
cat > "$TEMP_DIR/github-mapping-template.md" << EOF
# GitHub Issue Mapping - ${EPIC_NAME}

Epic: #EPIC_NUMBER - https://github.com/USERNAME/REPO/issues/EPIC_NUMBER

## Task Mapping

### Phase 1: 基础架构 (Week 1)
- Task 001: #ISSUE_001 - https://github.com/USERNAME/REPO/issues/ISSUE_001
- Task 002: #ISSUE_002 - https://github.com/USERNAME/REPO/issues/ISSUE_002
- Task 003: #ISSUE_003 - https://github.com/USERNAME/REPO/issues/ISSUE_003
- Task 004: #ISSUE_004 - https://github.com/USERNAME/REPO/issues/ISSUE_004
- Task 005: #ISSUE_005 - https://github.com/USERNAME/REPO/issues/ISSUE_005

### Phase 2: 核心功能 (Week 2-3)
- Task 006: #ISSUE_006 - https://github.com/USERNAME/REPO/issues/ISSUE_006
- Task 007: #ISSUE_007 - https://github.com/USERNAME/REPO/issues/ISSUE_007
- Task 008: #ISSUE_008 - https://github.com/USERNAME/REPO/issues/ISSUE_008
- Task 009: #ISSUE_009 - https://github.com/USERNAME/REPO/issues/ISSUE_009
- Task 010: #ISSUE_010 - https://github.com/USERNAME/REPO/issues/ISSUE_010

### Phase 3: 分享功能 (Week 4)
- Task 011: #ISSUE_011 - https://github.com/USERNAME/REPO/issues/ISSUE_011
- Task 012: #ISSUE_012 - https://github.com/USERNAME/REPO/issues/ISSUE_012
- Task 013: #ISSUE_013 - https://github.com/USERNAME/REPO/issues/ISSUE_013
- Task 014: #ISSUE_014 - https://github.com/USERNAME/REPO/issues/ISSUE_014
- Task 015: #ISSUE_015 - https://github.com/USERNAME/REPO/issues/ISSUE_015

### Phase 4: 历史管理 (Week 5)
- Task 016: #ISSUE_016 - https://github.com/USERNAME/REPO/issues/ISSUE_016
- Task 017: #ISSUE_017 - https://github.com/USERNAME/REPO/issues/ISSUE_017
- Task 018: #ISSUE_018 - https://github.com/USERNAME/REPO/issues/ISSUE_018
- Task 019: #ISSUE_019 - https://github.com/USERNAME/REPO/issues/ISSUE_019
- Task 020: #ISSUE_020 - https://github.com/USERNAME/REPO/issues/ISSUE_020

### Phase 5: 集成优化 (Week 6)
- Task 021: #ISSUE_021 - https://github.com/USERNAME/REPO/issues/ISSUE_021
- Task 022: #ISSUE_022 - https://github.com/USERNAME/REPO/issues/ISSUE_022
- Task 023: #ISSUE_023 - https://github.com/USERNAME/REPO/issues/ISSUE_023
- Task 024: #ISSUE_024 - https://github.com/USERNAME/REPO/issues/ISSUE_024
- Task 025: #ISSUE_025 - https://github.com/USERNAME/REPO/issues/ISSUE_025

### Phase 6: 测试发布 (Week 7-9)
- Task 026: #ISSUE_026 - https://github.com/USERNAME/REPO/issues/ISSUE_026
- Task 027: #ISSUE_027 - https://github.com/USERNAME/REPO/issues/ISSUE_027
- Task 028: #ISSUE_028 - https://github.com/USERNAME/REPO/issues/ISSUE_028
- Task 029: #ISSUE_029 - https://github.com/USERNAME/REPO/issues/ISSUE_029
- Task 030: #ISSUE_030 - https://github.com/USERNAME/REPO/issues/ISSUE_030

---

**Instructions:**
1. Replace USERNAME/REPO with your actual GitHub username and repository
2. Replace EPIC_NUMBER and ISSUE_XXX with actual issue numbers after creation
3. Update this file after running the sync process
4. Use this mapping for development coordination

**Synced**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

echo "✅ Preparation complete!"
echo ""
echo "📁 Generated files in: $TEMP_DIR"
echo ""
echo "🚀 Next steps:"
echo "1. Create GitHub repository (if not exists)"
echo "2. Authenticate: gh auth login"
echo "3. Create epic issue using: $TEMP_DIR/epic-issue.md"
echo "4. Run batch creation: $TEMP_DIR/create-all-issues.sh EPIC_NUMBER"
echo "5. Complete sync: /pm:epic-sync ${EPIC_NAME}"
echo ""
echo "📋 Manual commands are ready in:"
echo "  - Epic issue template: $TEMP_DIR/epic-issue.md"
echo "  - Task issue templates: $TEMP_DIR/tasks/"
echo "  - Batch creation script: $TEMP_DIR/create-all-issues.sh"
echo "  - Mapping template: $TEMP_DIR/github-mapping-template.md"