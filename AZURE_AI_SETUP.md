# Azure AI Foundry Setup Guide

This guide will walk you through setting up Azure AI Foundry to work with the FAB Agents Dashboard application.

## 📋 Prerequisites

- Azure subscription with appropriate permissions
- Azure AI Foundry access
- Basic understanding of Azure services

## 🚀 Step 1: Create Azure AI Foundry Resource

### 1.1 Access Azure AI Foundry
1. Go to [Azure AI Foundry](https://ai.azure.com/)
2. Sign in with your Azure account
3. Create a new project or use an existing one

### 1.2 Create AI Resource
1. In Azure AI Foundry, navigate to **"Management"** → **"Resources"**
2. Click **"Create new resource"**
3. Choose your subscription and resource group
4. Select a region (recommended: East US, West Europe, or your closest region)
5. Choose pricing tier based on your needs

## 🔧 Step 2: Deploy AI Models

### 2.1 Deploy GPT-4 Model
1. Navigate to **"Deployments"** in Azure AI Foundry
2. Click **"Create new deployment"**
3. Select **GPT-4** or **GPT-4 Turbo** model
4. Configure deployment settings:
   - **Deployment name**: gpt-4 (or your preferred name)
   - **Model version**: Latest available
   - **Capacity**: Based on your expected usage
5. Click **"Deploy"**

### 2.2 Note Deployment Details
After deployment, note down:
- **Deployment name** (e.g., gpt-4)
- **Endpoint URL** (e.g., https://your-resource.openai.azure.com)
- **API version** (e.g., 2024-02-15-preview)

## 🔑 Step 3: Get API Credentials

### 3.1 Retrieve API Key
1. In Azure AI Foundry, go to **"Management"** → **"Keys and Endpoint"**
2. Copy **Key 1** or **Key 2**
3. Store this securely - you'll need it for the application

### 3.2 Get Endpoint Information
1. Copy the **Endpoint URL** from the same page
2. Note the **Location/Region** of your resource

## ⚙️ Step 4: Configure the Application

### 4.1 Environment Setup
1. In your project root, copy the environment template:
   `ash
   cp .env.example .env
   `

2. Edit .env with your Azure AI Foundry details:
   `env
   # Azure AI Foundry Configuration
   REACT_APP_AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com
   REACT_APP_AZURE_AI_API_KEY=your-api-key-here
   REACT_APP_AZURE_AI_DEPLOYMENT_NAME=gpt-4
   REACT_APP_AZURE_AI_API_VERSION=2024-02-15-preview
   
   # Optional Configuration
   REACT_APP_AZURE_AI_MAX_TOKENS=4000
   REACT_APP_AZURE_AI_TEMPERATURE=0.7
   REACT_APP_AZURE_AI_TIMEOUT=30000
   
   # Application Settings
   REACT_APP_USE_AZURE_AI=true
   REACT_APP_ENABLE_DEBUG=false
   REACT_APP_ENV=development
   `

##  Step 5: Test the Configuration

### 5.1 Start the Application
`ash
npm install
npm start
`

### 5.2 Test AI Integration
1. Open the application in your browser
2. Create a new project
3. Enter a test query like "Analyze the current market trends"
4. Verify that the AI responds appropriately

##  Troubleshooting

### Common Issues

#### 1. Authentication Errors (401)
- **Cause**: Invalid API key or endpoint
- **Solution**: Double-check your API key and endpoint URL in .env

#### 2. Model Not Found (404)
- **Cause**: Incorrect deployment name
- **Solution**: Verify the deployment name matches exactly

#### 3. Rate Limiting (429)
- **Cause**: Too many requests or insufficient quota
- **Solution**: Check your Azure AI Foundry usage and quotas

#### 4. Timeout Errors
- **Cause**: Network issues or long processing times
- **Solution**: Increase REACT_APP_AZURE_AI_TIMEOUT value

##  Security Best Practices

### 1. API Key Management
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Use Azure Key Vault for production deployments

### 2. Network Security
- Configure Azure AI Foundry network access rules
- Use private endpoints for production
- Implement proper CORS policies

##  Production Deployment

### Environment Variables for Production
`env
REACT_APP_AZURE_AI_ENDPOINT=https://your-prod-resource.openai.azure.com
REACT_APP_AZURE_AI_API_KEY=your-production-api-key
REACT_APP_AZURE_AI_DEPLOYMENT_NAME=gpt-4-prod
REACT_APP_USE_AZURE_AI=true
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENV=production
`

##  Support

### Azure AI Foundry Support
- [Azure AI Foundry Documentation](https://docs.microsoft.com/azure/ai-services/)
- [Azure Support Portal](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)

### Application Support
- Check the main [README.md](./README.md) for general application help
- Review browser console for error messages
- Verify all environment variables are correctly set
