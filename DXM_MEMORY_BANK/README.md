# DXM Memory Bank

External cortex for the DXM-C.O.P. (Claude Optimization Protocol) system.

## Purpose

Long-term memory lives here, not in LLM context windows.
- GPT and Claude never carry history
- All durable state externalized to structured files
- Just-in-time cognition: models get only what they need right now

## Structure

```
DXM_MEMORY_BANK/
  profiles/           # Global identity, presets, rituals
  projects/           # Per-project specs, logs, configs
  sessions/           # Transcripts, decisions, diffs
```

## Usage

### Before Claude Task
1. Load relevant context from Memory Bank
2. Compress with GPT if needed
3. Send atomic task to Claude

### After Claude Task
1. Capture decisions in session log
2. Update specs if architecture changed
3. Archive snapshots for rollback

## Key Files

- `profiles/claude_cop_preset.txt` - Paste before Claude tasks
- `profiles/gpt_orchestrator_preset.txt` - GPT strategy mode
- `profiles/dxm-cop-playbook.html` - Visual playbook (open in browser)
- `projects/<id>/project-meta.yaml` - Project configuration

## Rule

> If it may be needed again in 3 days, it belongs here, not in scrollback.
