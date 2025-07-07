/**
 * AR Wizard Specialized Agent Templates
 * Implements specialized agents for Viewpoint ERP development and AR Wizard automation
 */

import { AgentTemplate, AgentManagerConfig } from './agent-manager.js';
import { AgentType, AgentCapabilities, AgentConfig, AgentEnvironment } from '../swarm/types.js';

// ===== VIEWPOINT EXPERT AGENT =====

export const ViewpointExpertAgentTemplate: AgentTemplate = {
  name: "Viewpoint ERP Expert Agent",
  type: "viewpoint-expert" as AgentType,
  capabilities: {
    codeGeneration: true,
    codeReview: true,
    testing: true,
    documentation: true,
    research: true,
    analysis: true,
    webSearch: false,
    apiIntegration: true,
    fileSystem: true,
    terminalAccess: true,
    
    // Viewpoint-specific capabilities
    languages: ["sql", "tsql", "javascript", "typescript", "python"],
    frameworks: ["viewpoint", "sql-server", "deno", "node"],
    domains: [
      "viewpoint-erp", 
      "job-billing", 
      "job-costing", 
      "contract-management",
      "progress-billing",
      "change-orders",
      "wip-analysis"
    ],
    tools: [
      "viewpoint-sql-generator",
      "schema-analyzer",
      "business-rule-engine",
      "contract-parser",
      "billing-calculator",
      "wip-analyzer"
    ],
    
    maxConcurrentTasks: 5,
    maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
    maxExecutionTime: 1800000, // 30 minutes
    reliability: 0.95,
    speed: 0.8,
    quality: 0.95
  },
  config: {
    autonomyLevel: 0.8,
    learningEnabled: true,
    adaptationEnabled: true,
    maxTasksPerHour: 15,
    maxConcurrentTasks: 5,
    timeoutThreshold: 1800000,
    reportingInterval: 60000,
    heartbeatInterval: 15000,
    
    permissions: [
      "database-read",
      "database-write", 
      "file-read",
      "file-write",
      "expert-system-access",
      "schema-access"
    ],
    
    expertise: {
      viewpointSQL: 0.95,
      jobBilling: 0.95,
      jobCosting: 0.9,
      contractManagement: 0.85,
      changeOrders: 0.8,
      wipAnalysis: 0.85,
      businessLogic: 0.9
    },
    
    preferences: {
      sqlStyle: "viewpoint-standard",
      documentationLevel: "comprehensive",
      testingApproach: "thorough",
      codeReviewStyle: "detailed"
    }
  },
  environment: {
    runtime: "deno",
    version: "1.40.0",
    workingDirectory: "./agents/viewpoint-expert",
    tempDirectory: "./tmp/viewpoint-expert",
    logDirectory: "./logs/viewpoint-expert",
    
    apiEndpoints: {
      "viewpoint-sql-expert": "http://localhost:8000/api/viewpoint-sql",
      "jc-revenue-expert": "http://localhost:8001/api/jc-revenue",
      "asc606-expert": "http://localhost:8002/api/asc606"
    },
    
    credentials: {
      "viewpoint-databases": "integrated-auth",
      "expert-systems": "api-key-auth"
    },
    
    availableTools: [
      "viewpoint-sql-generator",
      "schema-analyzer",
      "business-rule-engine",
      "expert-system-connector"
    ],
    
    toolConfigs: {
      "viewpoint-sql-generator": {
        "defaultDatabase": "Viewpoint_KLS",
        "queryTimeout": 30000,
        "maxResultRows": 10000
      },
      "schema-analyzer": {
        "cacheEnabled": true,
        "cacheTtl": 3600000
      }
    }
  },
  startupScript: "./scripts/start-viewpoint-expert.ts",
  dependencies: ["viewpoint-sql-tools", "expert-system-sdk"]
};

// ===== DATABASE ANALYST AGENT =====

export const DatabaseAnalystAgentTemplate: AgentTemplate = {
  name: "Database Analysis Specialist",
  type: "database-analyst" as AgentType,
  capabilities: {
    codeGeneration: false,
    codeReview: true,
    testing: true,
    documentation: true,
    research: true,
    analysis: true,
    webSearch: false,
    apiIntegration: true,
    fileSystem: true,
    terminalAccess: true,
    
    languages: ["sql", "tsql", "python", "r"],
    frameworks: ["sql-server", "pandas", "numpy"],
    domains: [
      "data-analysis",
      "database-optimization", 
      "data-quality",
      "performance-tuning",
      "pattern-recognition"
    ],
    tools: [
      "data-profiler",
      "query-optimizer", 
      "pattern-detector",
      "validation-engine",
      "performance-monitor"
    ],
    
    maxConcurrentTasks: 4,
    maxMemoryUsage: 2048 * 1024 * 1024, // 2GB
    maxExecutionTime: 2400000, // 40 minutes
    reliability: 0.9,
    speed: 0.75,
    quality: 0.9
  },
  config: {
    autonomyLevel: 0.7,
    learningEnabled: true,
    adaptationEnabled: true,
    maxTasksPerHour: 12,
    maxConcurrentTasks: 4,
    
    permissions: [
      "database-read",
      "performance-monitoring",
      "schema-analysis",
      "data-profiling"
    ],
    
    expertise: {
      dataAnalysis: 0.95,
      performanceOptimization: 0.9,
      dataQuality: 0.95,
      patternRecognition: 0.85,
      queryOptimization: 0.9
    }
  },
  environment: {
    runtime: "deno",
    workingDirectory: "./agents/database-analyst",
    
    apiEndpoints: {
      "viewpoint-kls": "connection-string-kls",
      "viewpoint-gbi": "connection-string-gbi",
      "viewpoint-taft": "connection-string-taft", 
      "viewpoint-ideal": "connection-string-ideal"
    },
    
    availableTools: [
      "data-profiler",
      "query-analyzer",
      "pattern-detector",
      "performance-monitor"
    ]
  }
};

// ===== ML DEVELOPER AGENT =====

export const MLDeveloperAgentTemplate: AgentTemplate = {
  name: "Predictive Engine Developer",
  type: "ml-developer" as AgentType,
  capabilities: {
    codeGeneration: true,
    codeReview: true,
    testing: true,
    documentation: true,
    research: true,
    analysis: true,
    webSearch: false,
    apiIntegration: true,
    fileSystem: true,
    terminalAccess: true,
    
    languages: ["python", "typescript", "sql"],
    frameworks: ["tensorflow", "scikit-learn", "pandas", "deno"],
    domains: [
      "machine-learning",
      "predictive-modeling",
      "billing-prediction",
      "cost-analysis",
      "pattern-recognition"
    ],
    tools: [
      "ml-framework",
      "feature-extractor",
      "model-trainer",
      "prediction-validator",
      "data-preprocessor"
    ],
    
    maxConcurrentTasks: 3,
    maxMemoryUsage: 4096 * 1024 * 1024, // 4GB
    maxExecutionTime: 3600000, // 60 minutes
    reliability: 0.9,
    speed: 0.7,
    quality: 0.95
  },
  config: {
    autonomyLevel: 0.6,
    learningEnabled: true,
    adaptationEnabled: true,
    
    expertise: {
      modelDevelopment: 0.95,
      featureEngineering: 0.9,
      billingPrediction: 0.85,
      costAnalysis: 0.8,
      patternRecognition: 0.9
    },
    
    preferences: {
      modelType: "ensemble",
      validationApproach: "cross-validation",
      optimizationMethod: "grid-search"
    }
  },
  environment: {
    runtime: "deno",
    workingDirectory: "./agents/ml-developer",
    
    availableTools: [
      "ml-framework",
      "model-trainer",
      "prediction-validator",
      "data-preprocessor"
    ]
  }
};

// ===== INTEGRATION SPECIALIST AGENT =====

export const IntegrationSpecialistAgentTemplate: AgentTemplate = {
  name: "System Integration Specialist",
  type: "integration-specialist" as AgentType,
  capabilities: {
    codeGeneration: true,
    codeReview: true,
    testing: true,
    documentation: true,
    research: true,
    analysis: true,
    webSearch: false,
    apiIntegration: true,
    fileSystem: true,
    terminalAccess: true,
    
    languages: ["typescript", "javascript", "python", "sql"],
    frameworks: ["deno", "node", "express", "fastapi"],
    domains: [
      "api-development",
      "system-integration", 
      "data-mapping",
      "protocol-implementation"
    ],
    tools: [
      "api-generator",
      "integration-tester",
      "data-mapper",
      "protocol-validator"
    ],
    
    maxConcurrentTasks: 3,
    maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
    maxExecutionTime: 1800000, // 30 minutes
    reliability: 0.9,
    speed: 0.8,
    quality: 0.9
  },
  config: {
    autonomyLevel: 0.7,
    learningEnabled: true,
    adaptationEnabled: true,
    
    expertise: {
      apiDevelopment: 0.9,
      systemIntegration: 0.95,
      dataMapping: 0.85,
      protocolImplementation: 0.8
    }
  },
  environment: {
    runtime: "deno",
    workingDirectory: "./agents/integration-specialist"
  }
};

// ===== AGENT TEMPLATE REGISTRY =====

export const ARWizardAgentTemplates = {
  "viewpoint-expert": ViewpointExpertAgentTemplate,
  "database-analyst": DatabaseAnalystAgentTemplate,
  "ml-developer": MLDeveloperAgentTemplate,
  "integration-specialist": IntegrationSpecialistAgentTemplate
};

// ===== AGENT FACTORY FUNCTIONS =====

export function createViewpointExpertAgent(name: string, customConfig?: Partial<AgentConfig>): AgentTemplate {
  return {
    ...ViewpointExpertAgentTemplate,
    name,
    config: {
      ...ViewpointExpertAgentTemplate.config,
      ...customConfig
    }
  };
}

export function createDatabaseAnalystAgent(name: string, customConfig?: Partial<AgentConfig>): AgentTemplate {
  return {
    ...DatabaseAnalystAgentTemplate,
    name,
    config: {
      ...DatabaseAnalystAgentTemplate.config,
      ...customConfig
    }
  };
}

export function createMLDeveloperAgent(name: string, customConfig?: Partial<AgentConfig>): AgentTemplate {
  return {
    ...MLDeveloperAgentTemplate,
    name,
    config: {
      ...MLDeveloperAgentTemplate.config,
      ...customConfig
    }
  };
}

export function createIntegrationSpecialistAgent(name: string, customConfig?: Partial<AgentConfig>): AgentTemplate {
  return {
    ...IntegrationSpecialistAgentTemplate,
    name,
    config: {
      ...IntegrationSpecialistAgentTemplate.config,
      ...customConfig
    }
  };
}
