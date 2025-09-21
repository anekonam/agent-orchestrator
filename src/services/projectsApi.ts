import { API_URLS } from '../config/api';
import { Project, ProjectStatus } from '../types/project';
import { BackendErrorParser } from './errorParser';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  initial_query?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
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

class ProjectsAPIService {

  async listProjects(options: ListProjectsOptions = {}): Promise<Project[]> {
    const searchParams = new URLSearchParams();

    if (options.status) {
      searchParams.append('status', options.status);
    }
    if (options.limit) {
      searchParams.append('limit', options.limit.toString());
    }
    if (options.offset) {
      searchParams.append('offset', options.offset.toString());
    }

    const url = `${API_URLS.PROJECTS}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        const parsedError = BackendErrorParser.parseError(new Error(errorText), response);
        throw new Error(JSON.stringify(parsedError));
      }

      const projects = await response.json();
      // Sort projects by latest updated first
      const sortedProjects = [...projects].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      return sortedProjects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProject(projectId: string): Promise<Project> {
    try {
      const response = await fetch(API_URLS.getProjectUrl(projectId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        const errorText = await response.text();
        const parsedError = BackendErrorParser.parseError(new Error(errorText), response);
        throw new Error(JSON.stringify(parsedError));
      }

      const project = await response.json();
      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    try {
      const response = await fetch(API_URLS.PROJECTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const parsedError = BackendErrorParser.parseError(new Error(errorText), response);
        throw new Error(JSON.stringify(parsedError));
      }

      const project = await response.json();
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, request: UpdateProjectRequest): Promise<Project> {
    try {
      const response = await fetch(API_URLS.getProjectUrl(projectId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        const errorText = await response.text();
        const parsedError = BackendErrorParser.parseError(new Error(errorText), response);
        throw new Error(JSON.stringify(parsedError));
      }

      const project = await response.json();
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string, hardDelete = false): Promise<void> {
    const searchParams = new URLSearchParams();
    if (hardDelete) {
      searchParams.append('hard_delete', 'true');
    }

    const url = `${API_URLS.getProjectUrl(projectId)}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        const errorText = await response.text();
        const parsedError = BackendErrorParser.parseError(new Error(errorText), response);
        throw new Error(JSON.stringify(parsedError));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async getProjectHistory(projectId: string, limit = 100, offset = 0) {
    const searchParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const url = `${API_URLS.getProjectHistoryUrl(projectId)}?${searchParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        const errorText = await response.text();
        const parsedError = BackendErrorParser.parseError(new Error(errorText), response);
        throw new Error(JSON.stringify(parsedError));
      }

      const history = await response.json();
      return history;
    } catch (error) {
      console.error('Error fetching project history:', error);
      throw error;
    }
  }
}

export const projectsAPI = new ProjectsAPIService();