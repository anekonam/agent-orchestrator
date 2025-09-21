// Azure AI-powered Projects API Service
// Replaces backend API calls with local storage and Azure AI integration
import { Project, ProjectStatus, ConversationEntry } from '../types/project';
import { azureAIService } from './azureAIService';
import { API_CONFIG } from '../config/api';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  initial_query?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface ListProjectsOptions {
  status?: ProjectStatus;
  limit?: number;
  offset?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  metadata?: Record<string, any>;
}

export interface ListProjectsOptions {
  status?: ProjectStatus;
  limit?: number;
  offset?: number;
}

class AzureProjectsAPIService {
  private readonly STORAGE_KEY = 'fab_projects';
  private readonly CONVERSATION_KEY = 'fab_conversations';

  // Get all projects from local storage
  async getProjects(options?: ListProjectsOptions): Promise<Project[]> {
    try {
      const projectsJson = localStorage.getItem(this.STORAGE_KEY);
      let projects: Project[] = projectsJson ? JSON.parse(projectsJson) : [];

      // Filter by status if specified
      if (options?.status) {
        projects = projects.filter(p => p.status === options.status);
      }

      // Sort by latest updated first
      projects.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      // Apply pagination
      if (options?.offset || options?.limit) {
        const start = options.offset || 0;
        const end = options.limit ? start + options.limit : undefined;
        projects = projects.slice(start, end);
      }

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  // Get a specific project by ID
  async getProject(projectId: string): Promise<Project> {
    try {
      const projects = await this.getProjects();
      const project = projects.find(p => p.project_id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create a new project
  async createProject(request: CreateProjectRequest): Promise<Project> {
    try {
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const newProject: Project = {
        project_id: projectId,
        name: request.name,
        description: request.description || null,
        created_at: now,
        updated_at: now,
        status: 'active' as ProjectStatus,
        initial_query: request.initial_query || null,
        conversation_history: [],
        conversation_count: 0,
        files_count: 0,
        files: [],
        metadata: request.metadata || {},
        has_result: false,
      };

      // If there's an initial query, process it with Azure AI
      if (request.initial_query) {
        try {
          const queryResponse = await azureAIService.submitProjectQuery({
            query: request.initial_query,
            projectId: projectId,
            includeProjectFiles: false,
            additionalContext: { isInitialQuery: true },
          });

          // Create initial conversation entry
          const conversationEntry: ConversationEntry = {
            entry_id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            project_id: projectId,
            timestamp: now,
            query: {
              query_id: queryResponse.queryId,
              query: request.initial_query,
              context: {},
              focus_areas: [],
              timeframe: null,
              user_id: null,
              session_id: `session_${Date.now()}`,
              debug: false,
            },
            query_id: queryResponse.queryId,
            result: {
              query_id: queryResponse.queryId,
              status: 'completed',
              summary: queryResponse.response,
              sections: {
                executive_summary: queryResponse.response,
                areas: {},
                recommendations: [],
                next_steps: [],
                agent_responses: {},
                metrics: [],
                key_insights: {},
                swot_analysis: {
                  strengths: [],
                  weaknesses: [],
                  opportunities: [],
                  threats: [],
                },
              },
              visualizations: [],
              sources: [],
              confidence_score: 0.8,
              execution_time_ms: queryResponse.executionTime,
              errors: [],
            },
            is_followup: false,
            parent_entry_id: null,
          };

          newProject.conversation_history = [conversationEntry];
          newProject.conversation_count = 1;
          newProject.has_result = true;
        } catch (error) {
          console.error('Error processing initial query:', error);
          // Continue with project creation even if initial query fails
        }
      }

      // Save to local storage
      const projects = await this.getProjects();
      projects.push(newProject);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update a project
  async updateProject(projectId: string, request: UpdateProjectRequest): Promise<Project> {
    try {
      const projects = await this.getProjects();
      const projectIndex = projects.findIndex(p => p.project_id === projectId);

      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const updatedProject = {
        ...projects[projectIndex],
        ...request,
        updated_at: new Date().toISOString(),
      };

      projects[projectIndex] = updatedProject;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete a project
  async deleteProject(projectId: string, hardDelete = false): Promise<void> {
    try {
      const projects = await this.getProjects();
      
      if (hardDelete) {
        // Permanently remove from storage
        const filteredProjects = projects.filter(p => p.project_id !== projectId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));
      } else {
        // Mark as deleted
        const projectIndex = projects.findIndex(p => p.project_id === projectId);
        if (projectIndex !== -1) {
          projects[projectIndex].status = 'deleted' as ProjectStatus;
          projects[projectIndex].updated_at = new Date().toISOString();
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        }
      }

      // Also clean up conversation history
      const conversationsJson = localStorage.getItem(this.CONVERSATION_KEY);
      if (conversationsJson) {
        const conversations = JSON.parse(conversationsJson);
        const filteredConversations = conversations.filter((c: any) => c.project_id !== projectId);
        localStorage.setItem(this.CONVERSATION_KEY, JSON.stringify(filteredConversations));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Get project conversation history
  async getProjectHistory(projectId: string, options?: { limit?: number; offset?: number }): Promise<ConversationEntry[]> {
    try {
      const project = await this.getProject(projectId);
      let history = project.conversation_history || [];

      // Sort by timestamp (newest first)
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      if (options?.offset || options?.limit) {
        const start = options.offset || 0;
        const end = options.limit ? start + options.limit : undefined;
        history = history.slice(start, end);
      }

      return history;
    } catch (error) {
      console.error('Error fetching project history:', error);
      throw error;
    }
  }

  // Check if we should use Azure AI or fallback to legacy backend
  private shouldUseAzureAI(): boolean {
    return API_CONFIG.USE_AZURE_AI;
  }

  // List all projects (compatibility method)
  async listProjects(options: ListProjectsOptions = {}): Promise<Project[]> {
    return this.getProjects(options);
  }
}

// Export singleton instance
export const projectsAPI = new AzureProjectsAPIService();
