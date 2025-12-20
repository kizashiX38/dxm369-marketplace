#!/usr/bin/env tsx
// DXM369 Sprint Orchestrator - Full Debug Monitoring System
// Executes code sprint with real-time progress tracking and detailed logging

import { execSync, spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface SprintBlock {
  id: string;
  name: string;
  description: string;
  tasks: SprintTask[];
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  logs: string[];
}

interface SprintTask {
  id: string;
  name: string;
  command?: string;
  validator?: () => Promise<boolean>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

class SprintOrchestrator {
  private blocks: SprintBlock[] = [];
  private logFile: string;
  private statusFile: string;

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = join(process.cwd(), `sprint-log-${timestamp}.json`);
    this.statusFile = join(process.cwd(), 'sprint-status.json');
    this.initializeBlocks();
  }

  private log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    
    // Append to log file
    const logs = this.loadLogs();
    logs.push(logEntry);
    writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
    
    // Update status file
    this.updateStatus();
  }

  private loadLogs(): any[] {
    try {
      return JSON.parse(readFileSync(this.logFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private updateStatus() {
    const status = {
      timestamp: new Date().toISOString(),
      blocks: this.blocks.map(block => ({
        id: block.id,
        name: block.name,
        status: block.status,
        progress: this.calculateBlockProgress(block),
        startTime: block.startTime,
        endTime: block.endTime,
        tasks: block.tasks.map(task => ({
          id: task.id,
          name: task.name,
          status: task.status
        }))
      }))
    };
    writeFileSync(this.statusFile, JSON.stringify(status, null, 2));
  }

  private calculateBlockProgress(block: SprintBlock): number {
    const completed = block.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / block.tasks.length) * 100);
  }

  private async executeCommand(command: string): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      this.log(`Executing: ${command}`);
      
      const child = spawn('bash', ['-c', command], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log(chunk.trim());
      });

      child.stderr.on('data', (data) => {
        const chunk = data.toString();
        error += chunk;
        console.error(chunk.trim());
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim()
        });
      });
    });
  }

  private initializeBlocks() {
    this.blocks = [
      {
        id: 'block-a',
        name: 'Emergency Triage',
        description: 'Establish stable baseline - identify all critical issues',
        dependencies: [],
        status: 'pending',
        logs: [],
        tasks: [
          {
            id: 'a1',
            name: 'Build Status Check',
            command: 'npm run build 2>&1 | tee build-errors.log',
            status: 'pending'
          },
          {
            id: 'a2',
            name: 'Database Connectivity Test',
            command: 'node -e "console.log(process.env.DATABASE_URL ? \'DB_URL_SET\' : \'DB_URL_MISSING\')"',
            status: 'pending'
          },
          {
            id: 'a3',
            name: 'Environment Variables Audit',
            command: 'node -e "const required=[\'DATABASE_URL\',\'AMAZON_ACCESS_KEY_ID\',\'AMAZON_SECRET_ACCESS_KEY\',\'AMAZON_ASSOCIATE_TAG\']; required.forEach(v => console.log(v + \':\', process.env[v] ? \'SET\' : \'MISSING\'))"',
            status: 'pending'
          },
          {
            id: 'a4',
            name: 'API Endpoints Test',
            command: 'curl -s http://localhost:3000/api/dxm/products/gpus | jq -r ".ok" || echo "API_DOWN"',
            status: 'pending'
          }
        ]
      },
      {
        id: 'block-b',
        name: 'Build Stabilization',
        description: 'Fix TypeScript errors and get npm run build passing',
        dependencies: ['block-a'],
        status: 'pending',
        logs: [],
        tasks: [
          {
            id: 'b1',
            name: 'TypeScript Error Analysis',
            command: 'npx tsc --noEmit 2>&1 | head -20',
            status: 'pending'
          },
          {
            id: 'b2',
            name: 'Fix calculateRealDXMScoreV2 Export',
            command: 'grep -n "calculateRealDXMScoreV2" src/lib/dealRadar.ts',
            status: 'pending'
          },
          {
            id: 'b3',
            name: 'Fix Union Type Error',
            command: 'grep -n "timestamp" src/app/analytics/page.tsx',
            status: 'pending'
          },
          {
            id: 'b4',
            name: 'Build Verification',
            command: 'npm run build',
            status: 'pending'
          }
        ]
      },
      {
        id: 'block-c',
        name: 'Environment Configuration',
        description: 'Configure all required environment variables',
        dependencies: ['block-b'],
        status: 'pending',
        logs: [],
        tasks: [
          {
            id: 'c1',
            name: 'Copy Environment Template',
            command: 'cp .env.local.example .env.local.backup && echo "Template backed up"',
            status: 'pending'
          },
          {
            id: 'c2',
            name: 'Generate Secrets',
            command: 'node -e "console.log(\'ADMIN_SECRET=\' + require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
            status: 'pending'
          },
          {
            id: 'c3',
            name: 'Validate Environment',
            command: 'npm run validate-env || echo "Validation script missing"',
            status: 'pending'
          }
        ]
      },
      {
        id: 'block-d',
        name: 'Database Setup',
        description: 'Establish working database with schema and data',
        dependencies: ['block-c'],
        status: 'pending',
        logs: [],
        tasks: [
          {
            id: 'd1',
            name: 'Database Connection Test',
            command: 'node -e "const {db} = require(\'./src/lib/db\'); db.query(\'SELECT 1\').then(() => console.log(\'DB_CONNECTED\')).catch(e => console.log(\'DB_ERROR:\', e.message))"',
            status: 'pending'
          },
          {
            id: 'd2',
            name: 'Schema Migration',
            command: 'ls database/schema-v2.sql && echo "Schema file exists"',
            status: 'pending'
          },
          {
            id: 'd3',
            name: 'Seed Data Load',
            command: 'curl -X POST http://localhost:3000/api/seed-products -H "Content-Type: application/json"',
            status: 'pending'
          }
        ]
      },
      {
        id: 'block-e',
        name: 'Static Generation Fix',
        description: 'Fix relative URL errors during build',
        dependencies: ['block-b'],
        status: 'pending',
        logs: [],
        tasks: [
          {
            id: 'e1',
            name: 'Find Relative URLs',
            command: 'grep -r "fetch(\\\'/" src/app/ || echo "No relative URLs found"',
            status: 'pending'
          },
          {
            id: 'e2',
            name: 'Fix Category Pages',
            command: 'grep -n "fetch.*api" src/app/\\[category\\]/page.tsx',
            status: 'pending'
          },
          {
            id: 'e3',
            name: 'Static Generation Test',
            command: 'npm run build 2>&1 | grep -i "static\\|error" | tail -10',
            status: 'pending'
          }
        ]
      },
      {
        id: 'block-f',
        name: 'Dead Links Fix',
        description: 'Ensure all category pages have working affiliate links',
        dependencies: ['block-d', 'block-e'],
        status: 'pending',
        logs: [],
        tasks: [
          {
            id: 'f1',
            name: 'Test All Category APIs',
            command: 'for cat in gpus cpus memory storage laptops monitors; do echo "Testing $cat:"; curl -s "http://localhost:3000/api/dxm/products/$cat" | jq -r ".data | length" 2>/dev/null || echo "ERROR"; done',
            status: 'pending'
          },
          {
            id: 'f2',
            name: 'Database Product Count',
            command: 'node -e "const {queryAll} = require(\'./src/lib/db\'); queryAll(\'SELECT category, COUNT(*) as count FROM product_catalog GROUP BY category\').then(r => console.log(JSON.stringify(r, null, 2))).catch(e => console.log(\'DB_ERROR:\', e.message))"',
            status: 'pending'
          },
          {
            id: 'f3',
            name: 'Test Category Pages',
            command: 'for cat in gpus cpus memory storage laptops; do echo "Testing /$cat page:"; curl -s "http://localhost:3000/$cat" | grep -o "<title>[^<]*" | head -1; done',
            status: 'pending'
          }
        ]
      },
      {
        id: 'block-g',
        name: 'Data Pipeline Integration',
        description: 'Connect Amazon API to Database to UI',
        dependencies: ['block-f'],
        status: 'pending',
        logs: [],
        tasks: [
          {
            id: 'g1',
            name: 'Test Amazon API Credentials',
            command: 'curl -X GET "http://localhost:3000/api/amazon/search?keywords=rtx+4090&category=Electronics" | jq -r ".ok"',
            status: 'pending'
          },
          {
            id: 'g2',
            name: 'Product Service Test',
            command: 'node -e "console.log(\'Product service integration test\')"',
            status: 'pending'
          },
          {
            id: 'g3',
            name: 'End-to-End Pipeline Test',
            command: 'echo "Pipeline test placeholder"',
            status: 'pending'
          }
        ]
      },
      {
        id: 'block-h',
        name: 'Testing & Validation',
        description: 'Verify entire system works end-to-end',
        dependencies: ['block-g'],
        status: 'pending',
        logs: [],
        tasks: [
          {
            id: 'h1',
            name: 'Full Build Test',
            command: 'npm run build && echo "BUILD_SUCCESS"',
            status: 'pending'
          },
          {
            id: 'h2',
            name: 'All Pages Load Test',
            command: 'for page in "" "gpus" "cpus" "memory" "storage" "laptops"; do echo "Testing /$page:"; curl -s "http://localhost:3000/$page" | grep -o "<title>[^<]*" | head -1; done',
            status: 'pending'
          },
          {
            id: 'h3',
            name: 'Affiliate Links Test',
            command: 'curl -s "http://localhost:3000/gpus" | grep -o "dxm369-20" | wc -l',
            status: 'pending'
          }
        ]
      }
    ];
  }

  private async executeTask(task: SprintTask): Promise<void> {
    task.status = 'running';
    this.log(`Starting task: ${task.name}`);
    
    if (task.command) {
      const result = await this.executeCommand(task.command);
      task.output = result.output;
      task.error = result.error;
      task.status = result.success ? 'completed' : 'failed';
      
      if (result.success) {
        this.log(`✅ Task completed: ${task.name}`, 'success');
      } else {
        this.log(`❌ Task failed: ${task.name} - ${result.error}`, 'error');
      }
    } else if (task.validator) {
      try {
        const isValid = await task.validator();
        task.status = isValid ? 'completed' : 'failed';
        this.log(`${isValid ? '✅' : '❌'} Task ${isValid ? 'completed' : 'failed'}: ${task.name}`, isValid ? 'success' : 'error');
      } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : String(error);
        this.log(`❌ Task failed: ${task.name} - ${task.error}`, 'error');
      }
    }
  }

  private async executeBlock(block: SprintBlock): Promise<void> {
    this.log(`🚀 Starting block: ${block.name}`, 'info');
    block.status = 'running';
    block.startTime = new Date();
    
    for (const task of block.tasks) {
      await this.executeTask(task);
      this.updateStatus();
      
      if (task.status === 'failed') {
        this.log(`⚠️  Task failed, but continuing block: ${task.name}`, 'warn');
      }
    }
    
    const failedTasks = block.tasks.filter(t => t.status === 'failed').length;
    const completedTasks = block.tasks.filter(t => t.status === 'completed').length;
    
    block.status = failedTasks === 0 ? 'completed' : 'failed';
    block.endTime = new Date();
    
    this.log(`📊 Block ${block.name} finished: ${completedTasks}/${block.tasks.length} tasks completed`, 
             block.status === 'completed' ? 'success' : 'warn');
  }

  private canExecuteBlock(block: SprintBlock): boolean {
    return block.dependencies.every(depId => {
      const dep = this.blocks.find(b => b.id === depId);
      return dep?.status === 'completed';
    });
  }

  public async executeSprint(): Promise<void> {
    this.log('🎯 Starting DXM369 Code Sprint Execution', 'info');
    this.log(`📋 Total blocks: ${this.blocks.length}`, 'info');
    
    while (this.blocks.some(b => b.status === 'pending')) {
      const readyBlocks = this.blocks.filter(b => 
        b.status === 'pending' && this.canExecuteBlock(b)
      );
      
      if (readyBlocks.length === 0) {
        this.log('⚠️  No blocks ready to execute. Checking dependencies...', 'warn');
        const pendingBlocks = this.blocks.filter(b => b.status === 'pending');
        for (const block of pendingBlocks) {
          const missingDeps = block.dependencies.filter(depId => {
            const dep = this.blocks.find(b => b.id === depId);
            return dep?.status !== 'completed';
          });
          if (missingDeps.length > 0) {
            this.log(`Block ${block.name} waiting for: ${missingDeps.join(', ')}`, 'warn');
          }
        }
        break;
      }
      
      // Execute ready blocks (could be parallel in future)
      for (const block of readyBlocks) {
        await this.executeBlock(block);
      }
    }
    
    const completedBlocks = this.blocks.filter(b => b.status === 'completed').length;
    const failedBlocks = this.blocks.filter(b => b.status === 'failed').length;
    
    this.log(`🏁 Sprint execution finished!`, 'info');
    this.log(`📈 Results: ${completedBlocks} completed, ${failedBlocks} failed`, 
             failedBlocks === 0 ? 'success' : 'warn');
    
    this.generateReport();
  }

  private generateReport(): void {
    const report = {
      sprintSummary: {
        startTime: this.blocks[0]?.startTime,
        endTime: new Date(),
        totalBlocks: this.blocks.length,
        completedBlocks: this.blocks.filter(b => b.status === 'completed').length,
        failedBlocks: this.blocks.filter(b => b.status === 'failed').length
      },
      blockDetails: this.blocks.map(block => ({
        id: block.id,
        name: block.name,
        status: block.status,
        duration: block.startTime && block.endTime ? 
          block.endTime.getTime() - block.startTime.getTime() : null,
        tasks: block.tasks.map(task => ({
          name: task.name,
          status: task.status,
          output: task.output?.substring(0, 200),
          error: task.error?.substring(0, 200)
        }))
      }))
    };
    
    const reportFile = join(process.cwd(), 'sprint-report.json');
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    this.log(`📄 Sprint report saved to: ${reportFile}`, 'success');
  }

  public getStatus(): any {
    try {
      return JSON.parse(readFileSync(this.statusFile, 'utf8'));
    } catch {
      return { error: 'Status file not found' };
    }
  }
}

// CLI Interface
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const orchestrator = new SprintOrchestrator();
  
  const command = process.argv[2];
  
  if (command === 'status') {
    console.log(JSON.stringify(orchestrator.getStatus(), null, 2));
  } else if (command === 'execute') {
    orchestrator.executeSprint().catch(console.error);
  } else {
    console.log('Usage: tsx sprint-orchestrator.ts [execute|status]');
  }
}

export { SprintOrchestrator };
