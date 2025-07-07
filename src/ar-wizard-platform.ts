/**
 * AR Wizard Agentic Platform
 * Main orchestrator for AR Wizard development, testing, and deployment
 */

import { ARWizardSwarmCoordinator, ARWizardSwarmConfig } from './swarm/ar-wizard-coordinator.js';
import { ARWizardMemoryManager } from './memory/ar-wizard-memory.js';
import { ARWizardIntegrationFramework, ViewpointDatabaseConfig, ExpertSystemConfig } from './integration/ar-wizard-integration.js';
import { DistributedMemorySystem } from './memory/distributed-memory.js';
import { Logger } from './core/logger.js';
import { EventEmitter } from 'node:events';

export interface ARWizardPlatformConfig {
  swarm: Partial<ARWizardSwarmConfig>;
  databases: ViewpointDatabaseConfig[];
  expertSystems: ExpertSystemConfig[];
  platform: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    monitoring: {
      enabled: boolean;
      metricsInterval: number;
      healthCheckInterval: number;
    };
  };
}

export interface PlatformStatus {
  status: 'initializing' | 'running' | 'paused' | 'stopped' | 'error';
  swarm: {
    status: string;
    agents: number;
    objectives: number;
    tasks: { completed: number; failed: number; total: number };
  };
  integration: {
    databases: { name: string; connected: boolean }[];
    expertSystems: { name: string; connected: boolean }[];
  };
  memory: {
    namespaces: string[];
    totalItems: number;
  };
  uptime: number;
  lastHealthCheck: Date;
}

export class ARWizardPlatform extends EventEmitter {
  private config: ARWizardPlatformConfig;
  private logger: Logger;
  private swarmCoordinator: ARWizardSwarmCoordinator;
  private memoryManager: ARWizardMemoryManager;
  private integrationFramework: ARWizardIntegrationFramework;
  private distributedMemory: DistributedMemorySystem;
  
  private status: PlatformStatus['status'] = 'initializing';
  private startTime?: Date;
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;

  constructor(config: ARWizardPlatformConfig) {
    super();
    
    this.config = config;
    this.logger = new Logger(
      { 
        level: config.platform.logLevel, 
        format: 'text', 
        destination: 'console' 
      },
      { component: 'ARWizardPlatform' }
    );

    // Initialize core components
    this.distributedMemory = new DistributedMemorySystem({
      namespace: 'ar-wizard',
      persistent: true,
      distributed: true
    });
    
    this.memoryManager = new ARWizardMemoryManager(this.distributedMemory);
    this.integrationFramework = new ARWizardIntegrationFramework(this.memoryManager);
    this.swarmCoordinator = new ARWizardSwarmCoordinator(config.swarm);

    this.setupEventHandlers();
  }

  // ===== PLATFORM LIFECYCLE =====

  async initialize(): Promise<void> {
    this.logger.info('Initializing AR Wizard Platform...', {
      version: this.config.platform.version,
      environment: this.config.platform.environment
    });

    try {
      this.status = 'initializing';
      this.startTime = new Date();

      // Step 1: Initialize memory system
      await this.initializeMemorySystem();

      // Step 2: Connect to databases
      await this.connectToDatabases();

      // Step 3: Connect to expert systems
      await this.connectToExpertSystems();

      // Step 4: Initialize swarm coordinator
      await this.initializeSwarmCoordinator();

      // Step 5: Start monitoring
      this.startMonitoring();

      this.status = 'running';
      this.emit('platform:initialized');
      
      this.logger.info('AR Wizard Platform initialized successfully');
      
    } catch (error) {
      this.status = 'error';
      this.logger.error('Failed to initialize AR Wizard Platform', { error });
      this.emit('platform:error', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down AR Wizard Platform...');

    try {
      this.status = 'stopped';

      // Stop monitoring
      this.stopMonitoring();

      // Shutdown swarm coordinator
      await this.swarmCoordinator.shutdown();

      // Disconnect from all systems
      await this.integrationFramework.disconnect();

      // Perform memory cleanup
      await this.memoryManager.performMaintenance();

      this.emit('platform:shutdown');
      this.logger.info('AR Wizard Platform shut down successfully');
      
    } catch (error) {
      this.logger.error('Error during platform shutdown', { error });
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (this.status !== 'running') {
      return;
    }

    this.logger.info('Pausing AR Wizard Platform...');
    this.status = 'paused';
    
    await this.swarmCoordinator.pause();
    this.emit('platform:paused');
  }

  async resume(): Promise<void> {
    if (this.status !== 'paused') {
      return;
    }

    this.logger.info('Resuming AR Wizard Platform...');
    this.status = 'running';
    
    await this.swarmCoordinator.resume();
    this.emit('platform:resumed');
  }

  // ===== AR WIZARD WORKFLOWS =====

  async developARWizardComponent(description: string): Promise<string> {
    this.logger.info('Starting AR Wizard component development', { description });

    if (this.status !== 'running') {
      throw new Error('Platform is not running');
    }

    try {
      const objectiveId = await this.swarmCoordinator.executeARWizardDevelopmentWorkflow(description);
      
      this.emit('workflow:started', {
        type: 'development',
        objectiveId,
        description
      });

      return objectiveId;
    } catch (error) {
      this.logger.error('AR Wizard development workflow failed', { error, description });
      throw error;
    }
  }

  async testARWizardComponent(
    description: string,
    databases: ('kls' | 'gbi' | 'taft' | 'ideal')[] = ['kls']
  ): Promise<string[]> {
    this.logger.info('Starting AR Wizard component testing', { description, databases });

    if (this.status !== 'running') {
      throw new Error('Platform is not running');
    }

    try {
      const objectiveIds = await this.swarmCoordinator.executeARWizardTestingWorkflow(description, databases);
      
      this.emit('workflow:started', {
        type: 'testing',
        objectiveIds,
        description,
        databases
      });

      return objectiveIds;
    } catch (error) {
      this.logger.error('AR Wizard testing workflow failed', { error, description });
      throw error;
    }
  }

  async deployARWizardComponent(
    description: string,
    environment: 'development' | 'staging' | 'production' = 'development'
  ): Promise<string> {
    this.logger.info('Starting AR Wizard component deployment', { description, environment });

    if (this.status !== 'running') {
      throw new Error('Platform is not running');
    }

    try {
      const objectiveId = await this.swarmCoordinator.executeARWizardDeploymentWorkflow(description, environment);
      
      this.emit('workflow:started', {
        type: 'deployment',
        objectiveId,
        description,
        environment
      });

      return objectiveId;
    } catch (error) {
      this.logger.error('AR Wizard deployment workflow failed', { error, description });
      throw error;
    }
  }

  // ===== PLATFORM STATUS AND MONITORING =====

  getStatus(): PlatformStatus {
    const swarmStatus = this.swarmCoordinator.getSwarmStatus();
    const connectionStatus = this.integrationFramework.getConnectionStatus();
    
    return {
      status: this.status,
      swarm: {
        status: swarmStatus.status,
        agents: swarmStatus.agents.total,
        objectives: swarmStatus.objectives,
        tasks: swarmStatus.tasks
      },
      integration: {
        databases: connectionStatus.databases || [],
        expertSystems: connectionStatus.expertSystems || []
      },
      memory: {
        namespaces: ['ar-wizard:viewpoint-expertise', 'ar-wizard:knowledge', 'ar-wizard:database-analysis', 'ar-wizard:predictive-models'],
        totalItems: 0 // Would be calculated from actual memory system
      },
      uptime: this.getUptime(),
      lastHealthCheck: new Date()
    };
  }

  getMetrics() {
    const swarmMetrics = this.swarmCoordinator.getARWizardMetrics();
    const platformStatus = this.getStatus();
    
    return {
      platform: {
        uptime: this.getUptime(),
        status: this.status,
        environment: this.config.platform.environment
      },
      swarm: swarmMetrics,
      integration: platformStatus.integration,
      memory: platformStatus.memory
    };
  }

  // ===== PRIVATE METHODS =====

  private async initializeMemorySystem(): Promise<void> {
    this.logger.info('Initializing memory system...');
    
    // Initialize distributed memory
    await this.distributedMemory.initialize();
    
    // Integrate existing expert systems
    await this.memoryManager.integrateExistingExpertSystems();
    
    this.logger.info('Memory system initialized');
  }

  private async connectToDatabases(): Promise<void> {
    this.logger.info('Connecting to Viewpoint databases...');
    
    for (const dbConfig of this.config.databases) {
      await this.integrationFramework.connectToViewpointDatabase(dbConfig);
    }
    
    this.logger.info('Database connections established');
  }

  private async connectToExpertSystems(): Promise<void> {
    this.logger.info('Connecting to expert systems...');
    
    for (const expertConfig of this.config.expertSystems) {
      await this.integrationFramework.connectToExpertSystem(expertConfig);
    }
    
    this.logger.info('Expert system connections established');
  }

  private async initializeSwarmCoordinator(): Promise<void> {
    this.logger.info('Initializing swarm coordinator...');
    
    await this.swarmCoordinator.initializeARWizardSwarm();
    
    this.logger.info('Swarm coordinator initialized');
  }

  private startMonitoring(): void {
    if (!this.config.platform.monitoring.enabled) {
      return;
    }

    this.logger.info('Starting platform monitoring...');

    // Health check timer
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.platform.monitoring.healthCheckInterval);

    // Metrics collection timer
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.platform.monitoring.metricsInterval);
  }

  private stopMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
  }

  private performHealthCheck(): void {
    try {
      const status = this.getStatus();
      this.emit('platform:health-check', status);
      
      // Check for any critical issues
      const criticalIssues = this.identifyCriticalIssues(status);
      if (criticalIssues.length > 0) {
        this.emit('platform:critical-issues', criticalIssues);
      }
    } catch (error) {
      this.logger.error('Health check failed', { error });
    }
  }

  private collectMetrics(): void {
    try {
      const metrics = this.getMetrics();
      this.emit('platform:metrics', metrics);
    } catch (error) {
      this.logger.error('Metrics collection failed', { error });
    }
  }

  private identifyCriticalIssues(status: PlatformStatus): string[] {
    const issues: string[] = [];
    
    // Check database connections
    const disconnectedDbs = status.integration.databases.filter(db => !db.connected);
    if (disconnectedDbs.length > 0) {
      issues.push(`Disconnected databases: ${disconnectedDbs.map(db => db.name).join(', ')}`);
    }

    // Check expert system connections
    const disconnectedExperts = status.integration.expertSystems.filter(es => !es.connected);
    if (disconnectedExperts.length > 0) {
      issues.push(`Disconnected expert systems: ${disconnectedExperts.map(es => es.name).join(', ')}`);
    }

    // Check swarm status
    if (status.swarm.status === 'failed' || status.swarm.status === 'error') {
      issues.push('Swarm coordinator in error state');
    }

    return issues;
  }

  private setupEventHandlers(): void {
    // Handle swarm events
    this.swarmCoordinator.on('swarm.completed', (data) => {
      this.emit('workflow:completed', data);
    });

    this.swarmCoordinator.on('swarm.failed', (data) => {
      this.emit('workflow:failed', data);
    });

    // Handle platform events
    this.on('platform:critical-issues', (issues) => {
      this.logger.warn('Critical platform issues detected', { issues });
    });
  }

  private getUptime(): number {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime.getTime();
  }

  // ===== PUBLIC API =====

  isRunning(): boolean {
    return this.status === 'running';
  }

  getConfig(): ARWizardPlatformConfig {
    return { ...this.config };
  }

  async updateConfig(updates: Partial<ARWizardPlatformConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    this.logger.info('Platform configuration updated');
    this.emit('platform:config-updated', updates);
  }
}
