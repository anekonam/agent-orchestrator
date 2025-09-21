# FAB Agents Dashboard - Azure AI Foundry Edition

A modern React dashboard application that provides intelligent business analysis through Azure AI Foundry agents. This application has been completely rewired to use Azure AI Foundry for all backend communication while maintaining the original UI/UX experience.

## 🚀 Features

- **Azure AI Foundry Integration**: Complete backend powered by Azure AI agents
- **Project Management**: Create and manage business analysis projects
- **Intelligent Chat**: Interactive chat interface with AI agents
- **Data Visualization**: Rich charts and analytics powered by Recharts
- **Modern UI**: Built with React 18, Material-UI, and responsive design
- **Real-time Updates**: Simulated streaming interface for seamless user experience

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **Chart.js** for additional charting capabilities

### Backend Integration
- **Azure AI Foundry** agents for all AI processing
- **Local Storage** for project persistence
- **HTTP API calls** replacing traditional streaming
- **Mock EventSource** for UI compatibility

## 📋 Prerequisites

- Node.js 16+ and npm
- Azure AI Foundry account and API access
- Modern web browser

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anekonam/agent-orchestrator.git
   cd agent-orchestrator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Azure AI Foundry**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Azure AI Foundry credentials:
   ```env
   REACT_APP_AZURE_AI_ENDPOINT=https://your-azure-ai-endpoint.openai.azure.com
   REACT_APP_AZURE_AI_API_KEY=your-azure-ai-api-key-here
   REACT_APP_AZURE_AI_DEPLOYMENT_NAME=gpt-4
   REACT_APP_USE_AZURE_AI=true
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

##  Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_AZURE_AI_ENDPOINT` | Azure AI Foundry endpoint URL | Yes | - |
| `REACT_APP_AZURE_AI_API_KEY` | Azure AI API key | Yes | - |
| `REACT_APP_AZURE_AI_DEPLOYMENT_NAME` | AI model deployment name | Yes | gpt-4 |
| `REACT_APP_AZURE_AI_API_VERSION` | Azure AI API version | No | 2024-02-15-preview |
| `REACT_APP_AZURE_AI_MAX_TOKENS` | Maximum tokens per request | No | 4000 |
| `REACT_APP_AZURE_AI_TEMPERATURE` | AI response creativity (0-1) | No | 0.7 |
| `REACT_APP_AZURE_AI_TIMEOUT` | Request timeout in milliseconds | No | 30000 |
| `REACT_APP_USE_AZURE_AI` | Enable Azure AI integration | No | true |
| `REACT_APP_ENABLE_DEBUG` | Enable debug logging | No | false |

### Azure AI Foundry Setup

See [AZURE_AI_SETUP.md](./AZURE_AI_SETUP.md) for detailed Azure AI Foundry configuration instructions.

##  Project Structure

```
src/
 components/          # React components
    charts/         # Chart visualizations
    modals/         # Modal dialogs
    ui/             # UI components
    views/          # Page views
 config/             # Configuration files
    azureAI.ts      # Azure AI configuration
 services/           # API services
    azureAIService.ts      # Core Azure AI service
    azureProjectsApi.ts    # Project management
    azureStreamingApi.ts   # Streaming replacement
 store/              # Redux store
 types/              # TypeScript definitions
 utils/              # Utility functions
```

##  Usage

### Creating a New Project
1. Click "New Project" on the dashboard
2. Enter project name and description
3. Add an initial query for AI analysis
4. The Azure AI agent will process your request

### Chat Interface
- Use the chat panel to interact with AI agents
- Ask follow-up questions about your projects
- Get real-time responses from Azure AI Foundry

### Data Visualization
- View generated charts and analytics
- Export data in various formats (when enabled)
- Interactive dashboards with drill-down capabilities

##  Migration from Backend Services

This application has been completely rewired from traditional backend services to Azure AI Foundry:

-  **Project Creation**: Now uses Azure AI agents
-  **Chat Interface**: Connected to Azure AI Foundry
-  **Data Processing**: Handled by AI agents
-  **Export Services**: Temporarily disabled (PDF/PPT)
-  **Streaming**: Replaced with simple HTTP calls

##  Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

##  Building and Deployment

```bash
# Build for production
npm run build

# Serve built application
npx serve -s build

# Build with version bump
npm run build:prod
```

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

##  License

This project is proprietary software. All rights reserved.

##  Support

For support and questions:
- Check the [Azure AI Setup Guide](./AZURE_AI_SETUP.md)
- Review environment configuration
- Ensure Azure AI Foundry credentials are correct

##  Roadmap

- [ ] Re-enable export services with new providers
- [ ] Enhanced AI agent capabilities
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Mobile responsive improvements
