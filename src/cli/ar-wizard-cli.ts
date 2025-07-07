#!/usr/bin/env deno run --allow-all

/**
 * AR Wizard CLI
 * Command-line interface for AR Wizard agentic platform
 */

import { ARWizardPlatform, ARWizardPlatformConfig } from '../ar-wizard-platform.js';
import { Logger } from '../core/logger.js';

const logger = new Logger(
  { level: 'info', format: 'text', destination: 'console' },
  { component: 'ARWizardCLI' }
);

// Default configuration
const defaultConfig: ARWizardPlatformConfig = {
  swarm: {
    name: 'AR Wizard Development Swarm',
    description: 'Agentic platform for AR Wizard development',
    mode: 'parallel',
    strategy: 'development',
    maxAgents: 8
  },
  databases: [
    {
      name: 'Viewpoint_KLS',
      connectionString: 'Server=localhost;Database=Viewpoint_KLS;Integrated Security=true',
      type: 'kls',
      permissions: ['read', 'write'],
      timeout: 30000,
      poolSize: 10
    },
    {
      name: 'Viewpoint_GBI',
      connectionString: 'Server=localhost;Database=Viewpoint_GBI;Integrated Security=true',
      type: 'gbi',
      permissions: ['read', 'write'],
      timeout: 30000,
      poolSize: 10
    }
  ],
  expertSystems: [
    {
      name: 'Viewpoint SQL Expert',
      endpoint: 'http://localhost:8000/api/viewpoint-sql',
      apiKey: 'your-api-key',
      capabilities: ['sql-generation', 'schema-analysis'],
      timeout: 30000,
      retryAttempts: 3
    },
    {
      name: 'JC Revenue Expert',
      endpoint: 'http://localhost:8001/api/jc-revenue',
      apiKey: 'your-api-key',
      capabilities: ['revenue-recognition', 'gl-reconciliation'],
      timeout: 30000,
      retryAttempts: 3
    }
  ],
  platform: {
    name: 'AR Wizard Platform',
    version: '1.0.0',
    environment: 'development',
    logLevel: 'info',
    monitoring: {
      enabled: true,
      metricsInterval: 30000,
      healthCheckInterval: 60000
    }
  }
};

class ARWizardCLI {
  private platform?: ARWizardPlatform;

  async run(args: string[]): Promise<void> {
    const command = args[0];
    
    try {
      switch (command) {
        case 'init':
          await this.initPlatform();
          break;
        case 'start':
          await this.startPlatform();
          break;
        case 'stop':
          await this.stopPlatform();
          break;
        case 'status':
          await this.showStatus();
          break;
        case 'develop':
          await this.developComponent(args.slice(1).join(' '));
          break;
        case 'test':
          await this.testComponent(args.slice(1).join(' '));
          break;
        case 'deploy':
          await this.deployComponent(args.slice(1).join(' '));
          break;
        case 'metrics':
          await this.showMetrics();
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      logger.error('CLI command failed', { command, error: error.message });
      console.error(`Error: ${error.message}`);
      Deno.exit(1);
    }
  }

  private async initPlatform(): Promise<void> {
    console.log('🚀 Initializing AR Wizard Platform...');
    
    this.platform = new ARWizardPlatform(defaultConfig);
    
    // Setup event handlers
    this.platform.on('platform:initialized', () => {
      console.log('✅ Platform initialized successfully');
    });

    this.platform.on('platform:error', (error) => {
      console.error('❌ Platform error:', error.message);
    });

    this.platform.on('workflow:started', (data) => {
      console.log(`🔄 Workflow started: ${data.type} - ${data.description}`);
    });

    this.platform.on('workflow:completed', (data) => {
      console.log(`✅ Workflow completed: ${data.swarmId}`);
    });

    await this.platform.initialize();
  }

  private async startPlatform(): Promise<void> {
    if (!this.platform) {
      await this.initPlatform();
      return;
    }

    if (this.platform.isRunning()) {
      console.log('ℹ️  Platform is already running');
      return;
    }

    console.log('▶️  Starting AR Wizard Platform...');
    await this.platform.resume();
    console.log('✅ Platform started');
  }

  private async stopPlatform(): Promise<void> {
    if (!this.platform) {
      console.log('ℹ️  Platform is not initialized');
      return;
    }

    console.log('⏹️  Stopping AR Wizard Platform...');
    await this.platform.shutdown();
    console.log('✅ Platform stopped');
  }

  private async showStatus(): Promise<void> {
    if (!this.platform) {
      console.log('❌ Platform is not initialized');
      return;
    }

    const status = this.platform.getStatus();
    
    console.log('\n📊 AR Wizard Platform Status');
    console.log('================================');
    console.log(`Status: ${this.getStatusEmoji(status.status)} ${status.status}`);
    console.log(`Uptime: ${this.formatUptime(status.uptime)}`);
    console.log(`\n🤖 Swarm Status:`);
    console.log(`  Status: ${status.swarm.status}`);
    console.log(`  Agents: ${status.swarm.agents}`);
    console.log(`  Objectives: ${status.swarm.objectives}`);
    console.log(`  Tasks: ${status.swarm.tasks.completed}/${status.swarm.tasks.total} completed`);
    
    console.log(`\n🔗 Integration Status:`);
    console.log(`  Databases:`);
    status.integration.databases.forEach(db => {
      console.log(`    ${db.connected ? '✅' : '❌'} ${db.name}`);
    });
    console.log(`  Expert Systems:`);
    status.integration.expertSystems.forEach(es => {
      console.log(`    ${es.connected ? '✅' : '❌'} ${es.name}`);
    });

    console.log(`\n💾 Memory Status:`);
    console.log(`  Namespaces: ${status.memory.namespaces.length}`);
    console.log(`  Total Items: ${status.memory.totalItems}`);
  }

  private async developComponent(description: string): Promise<void> {
    if (!description) {
      console.error('❌ Please provide a description for the component to develop');
      return;
    }

    if (!this.platform || !this.platform.isRunning()) {
      console.error('❌ Platform is not running. Please start the platform first.');
      return;
    }

    console.log(`🔨 Starting development workflow: ${description}`);
    
    try {
      const objectiveId = await this.platform.developARWizardComponent(description);
      console.log(`✅ Development workflow started with objective ID: ${objectiveId}`);
    } catch (error) {
      console.error(`❌ Development workflow failed: ${error.message}`);
    }
  }

  private async testComponent(description: string): Promise<void> {
    if (!description) {
      console.error('❌ Please provide a description for the component to test');
      return;
    }

    if (!this.platform || !this.platform.isRunning()) {
      console.error('❌ Platform is not running. Please start the platform first.');
      return;
    }

    console.log(`🧪 Starting testing workflow: ${description}`);
    
    try {
      const objectiveIds = await this.platform.testARWizardComponent(description);
      console.log(`✅ Testing workflow started with objective IDs: ${objectiveIds.join(', ')}`);
    } catch (error) {
      console.error(`❌ Testing workflow failed: ${error.message}`);
    }
  }

  private async deployComponent(description: string): Promise<void> {
    if (!description) {
      console.error('❌ Please provide a description for the component to deploy');
      return;
    }

    if (!this.platform || !this.platform.isRunning()) {
      console.error('❌ Platform is not running. Please start the platform first.');
      return;
    }

    console.log(`🚀 Starting deployment workflow: ${description}`);
    
    try {
      const objectiveId = await this.platform.deployARWizardComponent(description);
      console.log(`✅ Deployment workflow started with objective ID: ${objectiveId}`);
    } catch (error) {
      console.error(`❌ Deployment workflow failed: ${error.message}`);
    }
  }

  private async showMetrics(): Promise<void> {
    if (!this.platform) {
      console.log('❌ Platform is not initialized');
      return;
    }

    const metrics = this.platform.getMetrics();
    
    console.log('\n📈 AR Wizard Platform Metrics');
    console.log('===============================');
    console.log(`Platform Uptime: ${this.formatUptime(metrics.platform.uptime)}`);
    console.log(`Environment: ${metrics.platform.environment}`);
    
    if (metrics.swarm.arWizardSpecific) {
      console.log(`\n🤖 Agent Utilization:`);
      console.log(`  Viewpoint Experts: ${(metrics.swarm.arWizardSpecific.viewpointExpertUtilization * 100).toFixed(1)}%`);
      console.log(`  Database Analysts: ${(metrics.swarm.arWizardSpecific.databaseAnalystUtilization * 100).toFixed(1)}%`);
      console.log(`  ML Developers: ${(metrics.swarm.arWizardSpecific.mlDeveloperUtilization * 100).toFixed(1)}%`);
      console.log(`  Integration Specialists: ${(metrics.swarm.arWizardSpecific.integrationSpecialistUtilization * 100).toFixed(1)}%`);
    }
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'running': return '🟢';
      case 'paused': return '🟡';
      case 'stopped': return '🔴';
      case 'error': return '❌';
      case 'initializing': return '🔄';
      default: return '⚪';
    }
  }

  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private showHelp(): void {
    console.log(`
🧙‍♂️ AR Wizard CLI - Agentic Platform for Viewpoint ERP Development

Usage: ar-wizard <command> [options]

Commands:
  init                    Initialize the AR Wizard platform
  start                   Start the platform
  stop                    Stop the platform
  status                  Show platform status
  develop <description>   Start a development workflow
  test <description>      Start a testing workflow
  deploy <description>    Start a deployment workflow
  metrics                 Show platform metrics
  help                    Show this help message

Examples:
  ar-wizard init
  ar-wizard start
  ar-wizard develop "Create predictive billing engine for job billing automation"
  ar-wizard test "Validate billing predictions against historical data"
  ar-wizard deploy "Deploy AR Wizard to development environment"
  ar-wizard status
  ar-wizard metrics

For more information, visit: https://github.com/your-repo/ar-wizard-platform
    `);
  }
}

// Main execution
if (import.meta.main) {
  const cli = new ARWizardCLI();
  const args = Deno.args;
  
  await cli.run(args);
}
