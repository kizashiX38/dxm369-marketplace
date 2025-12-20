#!/usr/bin/env tsx
// DXM369 Sprint Monitor - Real-time Dashboard
// Provides live monitoring of sprint execution with visual progress

import { readFileSync, existsSync, watchFile } from 'fs';
import { join } from 'path';

interface SprintStatus {
  timestamp: string;
  blocks: {
    id: string;
    name: string;
    status: string;
    progress: number;
    startTime?: string;
    endTime?: string;
    tasks: {
      id: string;
      name: string;
      status: string;
    }[];
  }[];
}

class SprintMonitor {
  private statusFile: string;
  private logFile: string;
  private isWatching = false;

  constructor() {
    this.statusFile = join(process.cwd(), 'sprint-status.json');
    this.logFile = join(process.cwd(), 'sprint-log-*.json');
  }

  private clearScreen() {
    console.clear();
    console.log('\x1b[H\x1b[2J');
  }

  private colorize(text: string, color: 'red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'magenta' | 'white' = 'white'): string {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      magenta: '\x1b[35m',
      white: '\x1b[37m'
    };
    return `${colors[color]}${text}\x1b[0m`;
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return this.colorize('✅', 'green');
      case 'running': return this.colorize('🔄', 'yellow');
      case 'failed': return this.colorize('❌', 'red');
      case 'pending': return this.colorize('⏳', 'cyan');
      default: return '❓';
    }
  }

  private getProgressBar(progress: number, width: number = 20): string {
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    let color: 'red' | 'yellow' | 'green' = 'red';
    if (progress >= 75) color = 'green';
    else if (progress >= 25) color = 'yellow';
    
    return this.colorize(bar, color) + ` ${progress}%`;
  }

  private formatDuration(startTime?: string, endTime?: string): string {
    if (!startTime) return 'Not started';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  }

  private loadStatus(): SprintStatus | null {
    try {
      if (!existsSync(this.statusFile)) return null;
      return JSON.parse(readFileSync(this.statusFile, 'utf8'));
    } catch (error) {
      return null;
    }
  }

  private renderDashboard(status: SprintStatus) {
    this.clearScreen();
    
    // Header
    console.log(this.colorize('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan'));
    console.log(this.colorize('║                        DXM369 SPRINT EXECUTION MONITOR                      ║', 'cyan'));
    console.log(this.colorize('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan'));
    console.log();
    
    // Overall Progress
    const totalBlocks = status.blocks.length;
    const completedBlocks = status.blocks.filter(b => b.status === 'completed').length;
    const runningBlocks = status.blocks.filter(b => b.status === 'running').length;
    const failedBlocks = status.blocks.filter(b => b.status === 'failed').length;
    const overallProgress = Math.round((completedBlocks / totalBlocks) * 100);
    
    console.log(this.colorize('📊 OVERALL PROGRESS', 'magenta'));
    console.log(`${this.getProgressBar(overallProgress, 40)} (${completedBlocks}/${totalBlocks} blocks)`);
    console.log();
    
    // Status Summary
    console.log(this.colorize('📈 STATUS SUMMARY', 'magenta'));
    console.log(`${this.colorize('✅ Completed:', 'green')} ${completedBlocks}`);
    console.log(`${this.colorize('🔄 Running:', 'yellow')} ${runningBlocks}`);
    console.log(`${this.colorize('❌ Failed:', 'red')} ${failedBlocks}`);
    console.log(`${this.colorize('⏳ Pending:', 'cyan')} ${totalBlocks - completedBlocks - runningBlocks - failedBlocks}`);
    console.log();
    
    // Block Details
    console.log(this.colorize('🔍 BLOCK DETAILS', 'magenta'));
    console.log('─'.repeat(80));
    
    for (const block of status.blocks) {
      const duration = this.formatDuration(block.startTime, block.endTime);
      const statusIcon = this.getStatusIcon(block.status);
      const progressBar = this.getProgressBar(block.progress, 15);
      
      console.log(`${statusIcon} ${this.colorize(block.name, 'white')} [${block.id}]`);
      console.log(`   Progress: ${progressBar} | Duration: ${duration}`);
      
      // Task breakdown
      const completedTasks = block.tasks.filter(t => t.status === 'completed').length;
      const runningTasks = block.tasks.filter(t => t.status === 'running').length;
      const failedTasks = block.tasks.filter(t => t.status === 'failed').length;
      
      console.log(`   Tasks: ${this.colorize(`${completedTasks} done`, 'green')}, ${this.colorize(`${runningTasks} running`, 'yellow')}, ${this.colorize(`${failedTasks} failed`, 'red')}`);
      
      // Show running/failed tasks
      const activeTasks = block.tasks.filter(t => t.status === 'running' || t.status === 'failed');
      for (const task of activeTasks.slice(0, 2)) { // Show max 2 active tasks
        const taskIcon = this.getStatusIcon(task.status);
        console.log(`     ${taskIcon} ${task.name}`);
      }
      
      console.log();
    }
    
    // Footer
    console.log('─'.repeat(80));
    console.log(`${this.colorize('Last Updated:', 'cyan')} ${new Date(status.timestamp).toLocaleTimeString()}`);
    console.log(`${this.colorize('Press Ctrl+C to exit', 'yellow')}`);
  }

  private renderSimpleStatus(status: SprintStatus) {
    console.log('\n🎯 DXM369 Sprint Status:');
    
    for (const block of status.blocks) {
      const icon = this.getStatusIcon(block.status);
      const progress = this.getProgressBar(block.progress, 10);
      console.log(`${icon} ${block.name}: ${progress}`);
    }
    
    console.log(`\nLast updated: ${new Date(status.timestamp).toLocaleTimeString()}\n`);
  }

  public startMonitoring(dashboard: boolean = true) {
    if (this.isWatching) return;
    this.isWatching = true;
    
    console.log(this.colorize('🚀 Starting Sprint Monitor...', 'green'));
    
    // Initial render
    const status = this.loadStatus();
    if (status) {
      if (dashboard) {
        this.renderDashboard(status);
      } else {
        this.renderSimpleStatus(status);
      }
    } else {
      console.log(this.colorize('⏳ Waiting for sprint to start...', 'yellow'));
    }
    
    // Watch for changes
    if (existsSync(this.statusFile)) {
      watchFile(this.statusFile, { interval: 1000 }, () => {
        const newStatus = this.loadStatus();
        if (newStatus) {
          if (dashboard) {
            this.renderDashboard(newStatus);
          } else {
            this.renderSimpleStatus(newStatus);
          }
        }
      });
    }
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(this.colorize('\n👋 Sprint monitor stopped', 'yellow'));
      process.exit(0);
    });
  }

  public showCurrentStatus() {
    const status = this.loadStatus();
    if (status) {
      this.renderSimpleStatus(status);
    } else {
      console.log(this.colorize('❌ No sprint status found', 'red'));
    }
  }
}

// CLI Interface
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const monitor = new SprintMonitor();
  const command = process.argv[2];
  
  if (command === 'watch') {
    monitor.startMonitoring(true);
  } else if (command === 'simple') {
    monitor.startMonitoring(false);
  } else if (command === 'status') {
    monitor.showCurrentStatus();
  } else {
    console.log('DXM369 Sprint Monitor');
    console.log('Usage:');
    console.log('  tsx sprint-monitor.ts watch   - Full dashboard monitoring');
    console.log('  tsx sprint-monitor.ts simple  - Simple status monitoring');
    console.log('  tsx sprint-monitor.ts status  - Show current status once');
  }
}

export { SprintMonitor };
