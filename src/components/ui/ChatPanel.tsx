import React, { useState, useEffect, useRef } from 'react';
import FileIcon from '../icons/FileIcon';
import JsonIcon from '../icons/JsonIcon';
import CsvIcon from '../icons/CsvIcon';
import ExcelIcon from '../icons/ExcelIcon';
import PdfIcon from '../icons/PdfIcon';
import PptIcon from '../icons/PptIcon';
import DoubleCheckIcon from '../icons/DoubleCheckIcon';
import SendMessageInput from './SendMessageInput';
import SpinningLoader from './SpinningLoader';
import { ChatMessage } from '../../types/chat';
import { StreamingQueryResponse, QueryStep } from '../../services/streamingApi';
import './ChatPanel.css';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, attachments: File[], metadata?: any) => void;
  onFileSelect: () => void;
  onFileRemove: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  isDragOver: boolean;
  attachedFiles: File[];
  className?: string;
  isStreaming?: boolean;
  isChatLoading?: boolean;
  streamingResponse?: StreamingQueryResponse;
  showWorkspace?: boolean;
  isFollowUpQuery?: boolean;
  projectName?: string;
  isUploadingFiles?: boolean;
  uploadingMessageId?: string | null;
  uploadProgress?: number;
  hasUserApproved?: boolean;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'json':
      return JsonIcon;
    case 'csv':
      return CsvIcon;
    case 'xls':
    case 'xlsx':
      return ExcelIcon;
    case 'pdf':
      return PdfIcon;
    case 'ppt':
    case 'pptx':
      return PptIcon;
    default:
      return FileIcon;
  }
};

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onFileSelect,
  onFileRemove,
  onDragOver,
  onDragLeave,
  onDrop,
  onPaste,
  isDragOver,
  attachedFiles,
  className,
  isStreaming = false,
  isChatLoading = false,
  streamingResponse,
  showWorkspace,
  isFollowUpQuery = false,
  projectName,
  isUploadingFiles = false,
  uploadingMessageId = null,
  uploadProgress = 0,
  hasUserApproved = false
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isOrchestrationExpanded, setIsOrchestrationExpanded] = useState(true);
  const [hasAddedCompletionMessage, setHasAddedCompletionMessage] = useState(false);
  const [isProceedClicked, setIsProceedClicked] = useState(false);

  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const [delayedCurrentAgent, setDelayedCurrentAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const transformAgentName = (name: string): string => {
    // Replace while preserving case
    return name.replace(/analyst/gi, (match) => {
      // Check if first letter is uppercase
      if (match[0] === match[0].toUpperCase()) {
        return 'Agent';
      }
      return 'agent';
    });
  };

  // Sort all messages by timestamp to ensure proper chronological order
  const sortedMessages = React.useMemo(() => {
    const messagesCopy = [...messages];
    messagesCopy.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });
    return messagesCopy;
  }, [messages]);

  const scrollToBottom = (smooth: boolean = true) => {
    // Multiple approaches to ensure reliable scrolling
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }

    // Also try scrolling the messages container directly
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom immediately when component mounts (page load)
  useEffect(() => {
    // Use setTimeout to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      scrollToBottom(false); // No smooth animation on initial load
    }, 100);

    return () => clearTimeout(timer);
  }, []);


  // Scroll to bottom when streaming response updates
  useEffect(() => {
    if (streamingResponse) {
      // Small delay to ensure DOM updates are complete
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [streamingResponse, streamingResponse?.steps]);



  // Reset proceed button state when streaming status changes
  useEffect(() => {
    if (streamingResponse?.status === 'pending_approval') {
      setIsProceedClicked(false);
    }
    else {
      setIsProceedClicked(true);
    }
  }, [streamingResponse?.status]);

  // Track when to show completion message (only for non-follow-up queries)
  useEffect(() => {
    if (!isStreaming &&
      streamingResponse?.status === 'completed' &&
      !hasAddedCompletionMessage &&
      !isFollowUpQuery) {

      // Small delay to ensure orchestration is fully rendered
      const timer = setTimeout(() => {
        setHasAddedCompletionMessage(true);
        // Scroll to bottom when completion message is added
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isStreaming, streamingResponse?.status, hasAddedCompletionMessage, isFollowUpQuery]);

  // Reset completion message flag when new query starts
  useEffect(() => {
    if (isStreaming) {
      setHasAddedCompletionMessage(false);
    }
  }, [isStreaming]);

  // Scroll to bottom when workspace is shown/hidden
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Slightly longer delay for layout changes

    return () => clearTimeout(timer);
  }, [showWorkspace]);

  // Extract execution plan agents from messages or streamingResponse
  const executionPlanAgents = React.useMemo<string[]>(() => {
    // Find the most recent execution plan message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].metadata?.type === 'execution_plan') {
        const executionPlan = messages[i].metadata?.executionPlan;
        if (executionPlan?.agents && Array.isArray(executionPlan.agents)) {
          return (executionPlan.agents as string[]).map(agent => transformAgentName(agent));
        }
        break;
      }
    }

    // check streaming response as fallback
    if (streamingResponse?.executionPlan?.agents && Array.isArray(streamingResponse.executionPlan.agents)) {
      return (streamingResponse.executionPlan.agents as string[]).map(agent => transformAgentName(agent));
    }

    return [];
  }, [messages, streamingResponse?.executionPlan]);

  // Reset completed agents when a new execution plan is shown
  React.useEffect(() => {
    // Find if there's a new execution plan message
    const hasExecutionPlan = messages.some(msg => msg.metadata?.type === 'execution_plan');
    if (hasExecutionPlan && completedAgents.size > 0 && !isStreaming) {
      // Reset when we have an execution plan but not streaming yet
      setCompletedAgents(new Set());
      setDelayedCurrentAgent(null);
    }
  }, [messages.length]); // Only trigger when message count changes

  // Delay the current agent transition by 2 seconds
  React.useEffect(() => {
    if (!streamingResponse || !isStreaming) {
      setDelayedCurrentAgent(null);
      return;
    }

    const currentAgentName = streamingResponse?.currentAgent || streamingResponse?.activeAgent;
    if (currentAgentName) {
      const transformedAgentName = transformAgentName(currentAgentName);
      const currentAgentKey = transformedAgentName.toLowerCase().trim().replace(/\s+/g, ' ');

      // Only update if it's different from the delayed current agent
      if (currentAgentKey !== delayedCurrentAgent) {
        const timer = setTimeout(() => {
          // When transitioning to a new agent, mark the previous one as completed
          if (delayedCurrentAgent && !delayedCurrentAgent.includes('strategy')) {
            setCompletedAgents(prev => {
              if (!prev.has(delayedCurrentAgent)) {
                const updated = new Set(prev);
                updated.add(delayedCurrentAgent);
                return updated;
              }
              return prev;
            });
          }

          setDelayedCurrentAgent(currentAgentKey);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [streamingResponse?.currentAgent, streamingResponse?.activeAgent, isStreaming, delayedCurrentAgent]);

  // Update completed agents when we detect new completions or based on current agent position
  React.useEffect(() => {
    // Skip if not streaming
    if (!isStreaming && !streamingResponse) return;

    const newCompletedAgents = new Set(completedAgents);
    let hasChanges = false;

    // Add completed agents from steps with 2 second delay
    if (streamingResponse?.steps && Array.isArray(streamingResponse.steps)) {
      streamingResponse.steps.forEach((step: any) => {
        if (step.status === 'completed') {
          const agentKey = transformAgentName(step.agent).toLowerCase().trim().replace(/\s+/g, ' ');
          if (!completedAgents.has(agentKey) && !newCompletedAgents.has(agentKey)) {
            // Add with 2 second delay
            setTimeout(() => {
              setCompletedAgents(prev => {
                // Check again if not already completed (could have been added during the delay)
                if (!prev.has(agentKey)) {
                  const updated = new Set(prev);
                  updated.add(agentKey);
                  return updated;
                }
                return prev; // No change if already completed
              });
            }, 2000);
          }
        }
      });
    }

    // Add inferred completed agents based on current agent position
    if (streamingResponse?.status === 'processing') {
      // Use currentAgent or activeAgent from the response
      const currentAgentName = streamingResponse?.currentAgent || streamingResponse?.activeAgent;
      if (currentAgentName) {
        const transformedAgentName = transformAgentName(currentAgentName);
        const currentAgentKey = transformedAgentName.toLowerCase().trim().replace(/\s+/g, ' ');

        // For non-Strategy agents, find their position in the plan
        if (!currentAgentKey.includes('strategy')) {
          const currentAgentIndex = executionPlanAgents.findIndex(agent =>
            agent.toLowerCase().trim().replace(/\s+/g, ' ') === currentAgentKey
          );

          if (currentAgentIndex > 0) {
            // Mark all agents before the current one as completed with 2 second delay
            executionPlanAgents.slice(0, currentAgentIndex).forEach(agent => {
              const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');
              if (!completedAgents.has(agentKey) && !newCompletedAgents.has(agentKey)) {
                // Add with 2 second delay
                setTimeout(() => {
                  setCompletedAgents(prev => {
                    // Check again if not already completed (could have been added during the delay)
                    if (!prev.has(agentKey)) {
                      const updated = new Set(prev);
                      updated.add(agentKey);
                      return updated;
                    }
                    return prev; // No change if already completed
                  });
                }, 2000);
              }
            });
          }
        }
        // Note: For Strategy Agent, we don't make assumptions about other agents being completed
        // since it runs both before (planning) and after (synthesis)
      }
    }

    // Note: State updates now happen via setTimeout, not immediately
  }, [streamingResponse?.steps, streamingResponse?.status, streamingResponse?.currentAgent, streamingResponse?.activeAgent, executionPlanAgents, isStreaming]);

  // Prepopulate orchestration steps from executionPlan.agents
  const orchestrationSteps = React.useMemo<QueryStep[]>(() => {
    const steps: QueryStep[] = [];
    const agentStatusMap = new Map<string, string>();

    // First, initialize all agents from execution plan as pending
    executionPlanAgents.forEach(agent => {
      const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');
      // Check if this agent is already completed (from persistent state)
      if (completedAgents.has(agentKey)) {
        agentStatusMap.set(agentKey, 'completed');
      } else {
        agentStatusMap.set(agentKey, 'pending');
      }
    });

    // Process steps from streaming response - these are COMPLETED agents only
    if (streamingResponse?.steps && Array.isArray(streamingResponse.steps)) {
      streamingResponse.steps.forEach((step: any) => {
        const agentName = transformAgentName(step.agent);
        // Normalize agent key - remove extra spaces and convert to lowercase
        const agentKey = agentName.toLowerCase().trim().replace(/\s+/g, ' ');

        // Skip Strategy Agent as it's handled separately as the final step
        if (agentKey.includes('strategy') && !step?.result?.executive_summary) {
          return;
        }


        // Steps array only contains completed agents
        agentStatusMap.set(agentKey, 'completed');
      });
    }

    // WORKAROUND: Infer completed agents based on the order of agents and current agent
    // Special handling based on streaming status
    if (streamingResponse?.status === 'completed') {
      // When completed, mark all agents as completed unless they were explicitly marked as failed/skipped/completed
      executionPlanAgents.forEach(agent => {
        const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');
        const currentStatus = agentStatusMap.get(agentKey);
        if (currentStatus !== 'failed' && currentStatus !== 'skipped' && currentStatus !== 'completed') {
          agentStatusMap.set(agentKey, 'completed');
        }
      });
    } else if (streamingResponse?.status === 'processing') {
      // Use the delayed current agent instead of the actual current agent
      const currentAgentKey = delayedCurrentAgent;

      if (currentAgentKey) {
        // Find the index of current agent in the execution plan (if it's in the plan)
        const currentAgentIndex = executionPlanAgents.findIndex(agent =>
          agent.toLowerCase().trim().replace(/\s+/g, ' ') === currentAgentKey
        );


        if (currentAgentIndex > -1) {
          // Current agent is in the execution plan
          // Mark all agents before current agent as completed (using persistent state)
          executionPlanAgents.slice(0, currentAgentIndex).forEach(agent => {
            const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');
            // Mark as completed (persistent state handles this in useEffect)
            agentStatusMap.set(agentKey, 'completed');
          });

          // Ensure current agent is marked as processing (unless already completed)
          if (!completedAgents.has(currentAgentKey)) {
            agentStatusMap.set(currentAgentKey, 'processing');
          } else {
            agentStatusMap.set(currentAgentKey, 'completed');
          }

          // Mark all agents after current as pending (unless failed/skipped/completed)
          executionPlanAgents.slice(currentAgentIndex + 1).forEach(agent => {
            const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');
            if (!completedAgents.has(agentKey)) {
              const currentStatus = agentStatusMap.get(agentKey);
              if (currentStatus !== 'failed' && currentStatus !== 'skipped') {
                agentStatusMap.set(agentKey, 'pending');
              }
            } else {
              agentStatusMap.set(agentKey, 'completed');
            }
          });
        } else if (currentAgentKey.includes('strategy')) {
          // Strategy Agent is not in the execution plan but is processing
          // This could be either the initial planning phase or final synthesis
          // Check if all execution plan agents are completed in the steps array
          const completedAgentKeys = new Set<string>();
          if (streamingResponse?.steps) {
            streamingResponse.steps.forEach((step: any) => {
              const agentKey = step.agent.toLowerCase().trim().replace(/\s+/g, ' ');
              completedAgentKeys.add(agentKey);
            });
          }

          // Check if all execution plan agents are completed
          const allExecutionAgentsCompleted = executionPlanAgents.every(agent => {
            const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');
            return completedAgentKeys.has(agentKey) || completedAgents.has(agentKey);
          });

          if (allExecutionAgentsCompleted) {
            // This is the final synthesis phase - all agents should be marked as completed

            // Add 2 second delay before marking all as completed
            setTimeout(() => {
              setCompletedAgents(prev => {
                const updated = new Set(prev);
                let addedAny = false;
                executionPlanAgents.forEach(agent => {
                  const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');
                  // Check if not already completed before adding
                  if (!updated.has(agentKey)) {
                    updated.add(agentKey);
                    addedAny = true;
                  }
                });
                if (addedAny) {
                }
                return updated;
              });
            }, 2000);

            // Still set them in the map for immediate display logic
            executionPlanAgents.forEach(agent => {
              const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');
              agentStatusMap.set(agentKey, 'completed');
            });
          } else {
            // This is the planning phase - don't mark agents as completed yet
          }
        }
      }
    }


    // Build display steps - one per unique agent
    const uniqueAgents = new Set<string>();

    // Add agents from execution plan first
    if (executionPlanAgents.length > 0) {
      executionPlanAgents.forEach((agent: string) => {
        uniqueAgents.add(agent);
      });
    }

    // Add any agents from streaming that aren't in the plan
    if (streamingResponse?.steps) {
      streamingResponse.steps.forEach((step: any) => {
        const agentName = transformAgentName(step.agent);
        const agentKey = agentName.toLowerCase().trim().replace(/\s+/g, ' ');

        // Skip Strategy Agent that are not the last one as it's handled separately at the end
        if (agentKey.includes('strategy') && !step?.result?.executive_summary) {
          return;
        }

        // Check if this agent is already in our list (case insensitive)
        const exists = Array.from(uniqueAgents).some(a =>
          a.toLowerCase() === agentName.toLowerCase()
        );
        if (!exists) {
          uniqueAgents.add(agentName);
        }
      });
    }

    // Create steps for each unique agent
    Array.from(uniqueAgents).forEach((agent, index) => {
      // Normalize agent key the same way we did for the map
      const agentKey = agent.toLowerCase().trim().replace(/\s+/g, ' ');

      // Get status from our map
      let status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped' =
        (agentStatusMap.get(agentKey) as any) || 'pending';


      let action = '';

      // Check if this agent is currently active (override status if so)
      // Use currentAgent/activeAgent from response
      const normalizedCurrentAgent = streamingResponse?.currentAgent ? transformAgentName(streamingResponse.currentAgent).toLowerCase().trim().replace(/\s+/g, ' ') : undefined;
      const normalizedActiveAgent = streamingResponse?.activeAgent ? transformAgentName(streamingResponse.activeAgent).toLowerCase().trim().replace(/\s+/g, ' ') : undefined;

      const isCurrentAgent = (normalizedCurrentAgent === agentKey ||
        normalizedActiveAgent === agentKey) &&
        streamingResponse?.status === 'processing';

      if (isCurrentAgent) {
        status = 'processing';
        action = streamingResponse.currentStep || 'Gathering insights...';
      } else if (status === 'completed') {
        action = `Analysis complete`;
      } else if (status === 'processing') {
        action = 'Processing...';
      } else if (status === 'failed') {
        action = 'Failed to process';
      } else if (status === 'skipped') {
        action = 'Skipped';
      }

      steps.push({
        stepId: `agent-${index}`,
        agent: transformAgentName(agent),
        status: status,
        action: action,
        reasoning: undefined
      });
    });

    // Add Strategy Agent as final step if not already present
    const hasStrategyAgent = steps.some(step =>
      step.agent.toLowerCase().includes('strategy')
    );

    if (!hasStrategyAgent && streamingResponse?.status !== 'completed') {
      // Check if Strategy Agent should be processing (use currentAgent/activeAgent)
      const normalizedCurrentAgent = (streamingResponse?.currentAgent || streamingResponse?.activeAgent) ? transformAgentName(streamingResponse?.currentAgent || streamingResponse?.activeAgent || '').toLowerCase().trim().replace(/\s+/g, ' ') : undefined;
      const isStrategyProcessing = normalizedCurrentAgent?.includes('strategy') && streamingResponse?.status === 'processing';

      steps.push({
        stepId: 'strategy-final',
        agent: 'Strategy Agent',
        status: isStrategyProcessing ? 'processing' : 'pending',
        action: isStrategyProcessing ? (streamingResponse?.currentStep || 'Synthesizing results...') : '',
        reasoning: undefined
      });
    }

    return steps;
  }, [executionPlanAgents, streamingResponse?.steps, streamingResponse?.status, streamingResponse?.currentAgent, streamingResponse?.activeAgent, streamingResponse?.currentStep, isStreaming, completedAgents, delayedCurrentAgent]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Check if the last message is an execution plan
    const lastMessage = messages[messages.length - 1];
    const isWaitingForApproval = lastMessage?.metadata?.type === 'execution_plan';

    if (isStreaming && !isWaitingForApproval) return;

    onSendMessage(currentMessage, attachedFiles, undefined);
    setCurrentMessage('');
  };


  // Render animated dots for processing
  const renderProcessingDots = () => {
    return (
      <div className="message ai-message">
        <div className="message-content">
          <div className="loading-dots-container">
            {/* Only show text when isStreaming is true and isChatLoading is false */}
            {isStreaming && !isChatLoading && (
              <p className="loading-text">Identifying Relevant Agents</p>
            )}
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
        <div className="message-timestamp">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
      </div>
    );
  };

  // Render orchestration (streaming response + completion message)
  const renderOrchestration = () => {
    return (
      <>
        {renderStreamingResponse()}
        {/* Show completion message after orchestration */}
        {hasAddedCompletionMessage && streamingResponse?.status === 'completed' && (
          <div className="message ai-message">
            <div className="message-content">
              <p>Your results are ready!</p>
            </div>
            <div className="message-timestamp">
              {streamingResponse.endTime ? new Date(streamingResponse.endTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </>
    );
  };

  // Render streaming response (orchestration)
  const renderStreamingResponse = () => {
    // Return null if not streaming and no response
    if (!streamingResponse) return null;

    // Only show orchestration after user has actually approved the execution plan
    // But always show it if status is completed (even after streaming ends)
    // Keep showing orchestration for follow-up queries as well
    if (!hasUserApproved && streamingResponse.status !== 'completed') {
      return null;
    }

    return (
      <div className="message ai-message streaming-message">
        <div className="message-content">
          <div className="orchestration-section">
            <div
              className="orchestration-header"
              onClick={() => setIsOrchestrationExpanded(!isOrchestrationExpanded)}
            >
              <svg
                className={`orchestration-header-icon ${isOrchestrationExpanded ? '' : 'collapsed'}`}
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.4697 6.96967C11.7626 6.67678 12.2374 6.67678 12.5303 6.96967L20.0303 14.4697C20.3232 14.7626 20.3232 15.2374 20.0303 15.5303C19.7374 15.8232 19.2626 15.8232 18.9697 15.5303L12 8.56066L5.03033 15.5303C4.73744 15.8232 4.26256 15.8232 3.96967 15.5303C3.67678 15.2374 3.67678 14.7626 3.96967 14.4697L11.4697 6.96967Z" fill="#222325" />
              </svg>
              <h3 className="orchestration-header-title">
                {isStreaming ? 'Orchestration Process' : 'Orchestration Complete'}
              </h3>
            </div>

            {isOrchestrationExpanded && (orchestrationSteps.length > 0 || executionPlanAgents.length > 0) && (
              <>
                <div className="orchestration-steps">
                  {/* Strategy Intelligence Director - Always first */}
                  <div className="orchestration-item orchestration-item-first">
                    <div className="orchestration-item-content">
                      <div className="orchestration-avatar-wrapper">
                        <div className="orchestration-avatar">
                          <img
                            src="/fab-illustrations/illustration_binoculas_270.svg"
                            alt="Strategy Intelligence Director"
                            className="orchestration-icon"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextSibling = e.currentTarget.nextSibling as HTMLElement;
                              if (nextSibling) {
                                nextSibling.style.display = 'inline';
                              }
                            }}
                          />
                          <span className="orchestration-icon-fallback">🔍</span>
                        </div>
                      </div>
                      <div className="orchestration-content">
                        <div className="orchestration-title gradient-text">
                          Strategy Agent
                        </div>
                        <div className="orchestration-strategy-description">
                          Orchestration Initiated
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic steps from prepopulated orchestrationSteps */}
                  {orchestrationSteps.map((step, index) => {
                    // Determine the visual state based on step status
                    const getStepStatusClass = () => {
                      switch (step.status) {
                        case 'completed': return 'completed';
                        case 'processing': return 'processing';
                        case 'failed': return 'failed';
                        case 'skipped': return 'skipped';
                        case 'pending':
                        default: return 'pending';
                      }
                    };

                    const statusClass = getStepStatusClass();

                    const isLastItem = index === orchestrationSteps.length - 1;

                    return (
                      <div key={step.stepId} className={`orchestration-item ${isLastItem ? 'orchestration-item-last' : ''}`}>
                        <div className="orchestration-item-content">
                          <div className="orchestration-avatar-wrapper">
                            <div className={`orchestration-avatar ${statusClass}`}>
                              {step.status === 'completed' ? (
                                <svg className="orchestration-success-icon" viewBox="0 0 16 16" fill="none">
                                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : step.status === 'processing' ? (
                                <div className="orchestration-status-indicator"></div>
                              ) : step.status === 'failed' ? (
                                <svg className="orchestration-error-icon" viewBox="0 0 16 16" fill="none">
                                  <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : step.status === 'skipped' ? (
                                <svg className="orchestration-skip-icon" viewBox="0 0 16 16" fill="none">
                                  <path d="M4 8H12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ) : (
                                <div className="orchestration-pending-indicator">
                                  <svg viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="orchestration-content">
                            <div className={`orchestration-title ${step.status === 'pending' ? 'orchestration-pending' : ''}`}>
                              {step.agent}
                            </div>
                            <div className={`orchestration-description ${step.status === 'pending' ? 'orchestration-pending' : ''}`}>
                              {step.status === 'processing' ?
                                (step.action || 'Gathering insights...') :
                                (step.action || step.reasoning || '')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Final Report - Show when completed or failed regardless of streaming status */}
                  {((streamingResponse.status === 'completed' || streamingResponse.status === 'failed') || (!isStreaming && streamingResponse.done)) && (
                    <div className="orchestration-item orchestration-item-final">
                      <div className="orchestration-item-content">
                        <div className="orchestration-avatar-wrapper">
                          <div className={`orchestration-avatar ${streamingResponse.status === 'failed' ? 'failed' : 'completed'}`}>
                            {streamingResponse.status === 'failed' ? (
                              <svg className="orchestration-error-icon" viewBox="0 0 16 16" fill="none">
                                <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg className="orchestration-success-icon" viewBox="0 0 16 16" fill="none">
                                <path d="M13.5 4.5L6 12L2.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="orchestration-content">
                          <div className="orchestration-title">
                            Finalise Results
                          </div>
                          <div className="orchestration-description">
                            Strategy Validation Report <span className="orchestration-report-status" style={streamingResponse.status === 'failed' ? { color: 'red' } : {}}>{streamingResponse.status === 'failed' ? 'Failed' : 'Complete'}</span>
                            <br />
                            <span className="orchestration-report-output">
                              Report Output: {projectName || (streamingResponse.result ? 'Available' : 'Processing...')}
                            </span>
                            <span className="orchestration-completion-details">
                              Completed: {streamingResponse.endTime ? new Date(streamingResponse.endTime).toLocaleString() : new Date().toLocaleString()}
                              <br />
                              Duration: {(() => {
                                // Get duration in milliseconds
                                let durationMs = 0;

                                // Use execution_time_ms if available
                                if (streamingResponse.execution_time_ms) {
                                  durationMs = streamingResponse.execution_time_ms;
                                }
                                // Calculate from startTime and endTime if available
                                else if (streamingResponse.startTime) {
                                  const startTime = new Date(streamingResponse.startTime).getTime();
                                  // Use endTime from response if available, otherwise use current time
                                  const endTime = streamingResponse.endTime
                                    ? new Date(streamingResponse.endTime).getTime()
                                    : Date.now();
                                  durationMs = endTime - startTime;
                                }

                                // Format the duration based on simple thresholds
                                if (durationMs > 0) {
                                  const totalSeconds = Math.floor(durationMs / 1000);

                                  // More than 60 minutes (1 hour) - show hours and minutes
                                  if (totalSeconds >= 3600) {
                                    const hours = Math.floor(totalSeconds / 3600);
                                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                                    return `${hours}h ${minutes}m`;
                                  }
                                  // Between 60 seconds and 60 minutes - show only minutes
                                  else if (totalSeconds >= 60) {
                                    const minutes = Math.round(totalSeconds / 60);
                                    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
                                  }
                                  // Less than 60 seconds - show only seconds
                                  else {
                                    return `${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
                                  }
                                }
                                // Fallback to progress-based estimate
                                return `${streamingResponse.progress ? Math.round(streamingResponse.progress * 0.3) : 0} seconds`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="orchestration-footer">
                  <img
                    src="/images/k2-columbus.svg"
                    alt="K2 by columbus"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="message-timestamp">
          {streamingResponse.endTime ? new Date(streamingResponse.endTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-panel ${className || ''}`}>
      <div className="chat-messages" ref={chatMessagesRef}>
        <div className="messages-container">
          {(() => {
            const shownExecutionPlanIds = new Set<string>();

            return sortedMessages.map((message, messageIndex) => {
              // Check if this is an execution plan message
              if (message.metadata?.type === 'execution_plan' && message.metadata.executionPlan) {
                // Use queryId from metadata, or fallback to message.id
                const executionPlanId = message.metadata.queryId || message.id;

                // Skip if we've already shown an execution plan with this ID
                if (shownExecutionPlanIds.has(executionPlanId)) {
                  return null;
                }
                shownExecutionPlanIds.add(executionPlanId);

                // Check if this is the last unique execution plan message
                // We need to find the last execution plan that has a unique ID
                let lastExecutionPlanIndex = -1;
                const seenPlanIds = new Set<string>();
                for (let i = sortedMessages.length - 1; i >= 0; i--) {
                  if (sortedMessages[i].metadata?.type === 'execution_plan') {
                    const planId = sortedMessages[i].metadata?.queryId || sortedMessages[i].id;
                    // Only consider this as the last if we haven't seen this ID before
                    if (!seenPlanIds.has(planId)) {
                      lastExecutionPlanIndex = i;
                      break;
                    }
                    seenPlanIds.add(planId);
                  }
                }
                const isLastMessage = messageIndex === lastExecutionPlanIndex;
                const executionPlan = message.metadata.executionPlan;
                return (
                  <React.Fragment key={message.id}>
                    <div className={`message ai-message`}>
                      <div className="message-content">
                        <div className="execution-plan-section">
                          <h4 className="execution-plan-title">
                            Execution Plan
                          </h4>

                          {/* Agents List */}
                          {executionPlan.agents && executionPlan.agents.length > 0 && (
                            <div className="execution-plan-agents">
                              <h5 className="execution-plan-agents-title">
                                Your query has been processed. The following specialised agents will be engaged:
                              </h5>
                              <ul className="execution-plan-agents-list">
                                <li className="execution-plan-agent-item">
                                  Strategy Agent
                                </li>
                                {executionPlan.agents.map((agent: string, index: number) => (
                                  <li key={index} className="execution-plan-agent-item">
                                    {transformAgentName(agent)}
                                  </li>
                                ))}
                              </ul>
                              <br />
                              <h5 className="execution-plan-agents-title">
                                They will collaborate to produce a comprehensive analysis covering:
                              </h5>
                              <ul className="execution-plan-agents-list">
                                {executionPlan.summary && Array.isArray(executionPlan.summary) ? (
                                  executionPlan.summary.map((item: string, index: number) => {
                                    // Parse the summary item to extract title and description
                                    // Handle multiple separators: "–" (en dash), "-" (hyphen), or ":"
                                    let title = item;
                                    let description = '';

                                    // Try different separators
                                    if (item.includes('–')) {
                                      const parts = item.split('–');
                                      title = parts[0]?.trim() || item;
                                      description = parts.slice(1).join('–').trim();
                                    } else if (item.includes(':')) {
                                      const parts = item.split(':');
                                      title = parts[0]?.trim() || item;
                                      description = parts.slice(1).join(':').trim();
                                    } else if (item.includes('-')) {
                                      const parts = item.split('-');
                                      title = parts[0]?.trim() || item;
                                      description = parts.slice(1).join('-').trim();
                                    }

                                    return (
                                      <li key={index} className="execution-plan-agent-item">
                                        <strong>{title}</strong>
                                        {description && ` – ${description}`}
                                      </li>
                                    );
                                  })
                                ) : (
                                  // Fallback to default items if summary is not available
                                  <>
                                    <li className="execution-plan-agent-item">
                                      <strong>Market Intelligence</strong> – size, dynamics, and opportunities
                                    </li>
                                    <li className="execution-plan-agent-item">
                                      <strong>Customer Insights</strong> – segments, behaviours, and sentiment
                                    </li>
                                    <li className="execution-plan-agent-item">
                                      <strong>Trends</strong> – global, regional, and sectoral signals
                                    </li>
                                    <li className="execution-plan-agent-item">
                                      <strong>Technology</strong> – innovation, AI adoption, infrastructure, and emerging capabilities
                                    </li>
                                  </>
                                )}</ul>
                            </div>
                          )}
                          <br />
                          <div>
                            <p className="execution-plan-question">
                              Please indicate if you prefer balanced coverage across all dimensions, or if specific areas should be prioritised for deeper analysis.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="message-timestamp">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {/* Show Proceed button only if this execution plan is the last message */}
                    {isLastMessage && streamingResponse?.status === 'pending_approval' && streamingResponse?.executionPlan && (
                      <div key={`${message.id}-proceed`} className={`message ai-message`}>
                        <div
                          className={`message-content action-message ${isProceedClicked ? 'disabled' : ''}`}
                          onClick={() => {
                            // Prevent double-clicking
                            if (isProceedClicked) return;

                            setIsProceedClicked(true);
                            // Send Proceed with preserved attachments
                            onSendMessage('Proceed', [], {
                              source: 'approval_button',
                              queryId: message.metadata?.queryId || executionPlanId,
                              timestamp: new Date().toISOString(),
                              is_result: true,
                            });
                          }}
                          style={{
                            pointerEvents: (isProceedClicked ) ? 'none' : 'auto',
                            opacity: isProceedClicked ? 0.5 : 1
                          }}
                        >
                         Proceed
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              }

              // Handle file messages with special rendering
              if (message.role === 'file') {
                return (
                  <div key={message.id} className="message file-message">
                    <div className="file-message-list">
                      {message.metadata?.files?.map((file, index) => {
                        const IconComponent = getFileIcon(file.name || '');
                        return (
                          <div key={index} className="file-item">
                            <div className="file-item-info">
                              <IconComponent className="file-item-icon" size={20} />
                              <div className="file-item-details">
                                <span className="file-item-name">{file.name || 'Unnamed File'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Regular message rendering (without inline attachments)
              return (
                <React.Fragment key={message.id}>
                  <div className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'} ${message.metadata?.isError ? 'error-message' : ''}`}>
                    <div className="message-content">
                      {/* Show retry button for error messages inline with the text */}
                      {message.metadata?.isError && message.metadata?.canRetry ? (
                        <div className="error-message-with-retry">
                          <span className="error-message-text">{message.content}</span>
                          <button
                            onClick={() => {
                              if (message.metadata?.originalQuery) {
                                onSendMessage(message.metadata.originalQuery, []);
                              }
                            }}
                            className="error-retry-button"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                    <div className="message-status">
                      {/* Show upload spinner for user messages that are currently uploading files */}
                      {message.role === 'user' && isUploadingFiles && uploadingMessageId === message.id && (
                        <>
                          <SpinningLoader size="small" />
                          <span className="status-text">Uploading files... ({uploadProgress}%)</span>
                        </>
                      )}
                      <div className="message-timestamp">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {/* Show success icon for user messages */}
                      {message.role === 'user' && (
                        <DoubleCheckIcon
                          className={`message-success-icon ${(!isUploadingFiles) ? 'sent' : ''}`}
                          size={12}
                        />
                      )}
                    </div>
                  </div>
                  {/* Show orchestration under messages with is_result metadata */}
                  {message.metadata?.is_result && renderOrchestration()}
                </React.Fragment>
              );
            });
          })()}

          {/* Show processing dots after the last message */}
          {(() => {
            // Show processing dots if we're still streaming and either processing or pending approval (before plan is shown)
            const lastMessage = sortedMessages[sortedMessages.length - 1];
            const lastMessageIsExecutionPlan = lastMessage?.metadata?.type === 'execution_plan';

            if ((isStreaming && streamingResponse && (streamingResponse.status === 'processing' || streamingResponse.status === 'pending_approval') && !hasUserApproved && !lastMessageIsExecutionPlan) || isChatLoading) {
              return renderProcessingDots();
            }
            return null;
          })()}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-area">
        <SendMessageInput
          value={currentMessage}
          onChange={setCurrentMessage}
          onSubmit={handleSendMessage}
          attachedFiles={attachedFiles}
          onFileSelect={onFileSelect}
          onFileRemove={onFileRemove}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onPaste={onPaste}
          isDragOver={isDragOver}
          variant="chat"
          disabled={(() => {
            const lastMessage = sortedMessages[sortedMessages.length - 1];
            const isWaitingForApproval = lastMessage?.metadata?.type === 'execution_plan';
            return isStreaming && !isWaitingForApproval;
          })()}
        />
      </div>
    </div>
  );
};

export default ChatPanel;