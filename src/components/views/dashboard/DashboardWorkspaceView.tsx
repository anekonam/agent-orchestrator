import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatPanel from '../../ui/ChatPanel';
import WorkspaceContent from '../../workspace/WorkspaceContent';
import SpinningLoader from '../../ui/SpinningLoader';
import Toast from '../../ui/Toast';
import { Project, ConversationEntry } from '../../../types/project';
import { ChatMessage } from '../../../types/chat';
import { API_URLS } from '../../../config/api';
import { streamingAPI, StreamingQueryResponse, StreamingAPIService, QueryStep } from '../../../services/azureStreamingApi';
import { BackendErrorParser } from '../../../services/errorParser';
import { parseErrorFromString } from '../../ErrorDisplay';
import { ParsedError } from '../../../types/errors';

interface DashboardWorkspaceViewProps {
  project: Project;
  initialQuestion?: string;
  initialAttachments?: File[];
}


const DashboardWorkspaceView: React.FC<DashboardWorkspaceViewProps> = ({
  project,
  initialQuestion = '',
  initialAttachments = []
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false); // New state for chat panel loading only
  const [streamingResponse, setStreamingResponse] = useState<StreamingQueryResponse | undefined>();
  const [latestStreamResult, setLatestStreamResult] = useState<StreamingQueryResponse | undefined>();
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [initialConversations, setInitialConversations] = useState<ConversationEntry[]>([]);
  const [isCurrentQueryFollowUp, setIsCurrentQueryFollowUp] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('error');
  const [isUploadingFiles, setIsUploadingFiles] = useState(false); // Track file upload state
  const [uploadingMessageId, setUploadingMessageId] = useState<string | null>(null); // Track which message is uploading
  const [uploadProgress, setUploadProgress] = useState<number>(0); // Track upload progress percentage
  const [hasUserApproved, setHasUserApproved] = useState(false); // Track if user has approved execution plan
  const [isSyncing, setIsSyncing] = useState(false); // Track if sync is in progress
  const [syncProgress, setSyncProgress] = useState<number>(0); // Track sync progress percentage separately
  const hasInitialized = useRef(false);
  const currentEventSource = useRef<EventSource | null>(null);
  const currentStreamingResponse = useRef<StreamingQueryResponse | undefined>();
  // Guard to prevent multiple fetchQueryFullResult calls
  const fullResultFetchedRef = useRef(false);

  // Helper function to format structured response into readable sentences
  const formatCompletedMessage = (data: StreamingQueryResponse): string => {
    const structured = data.structured_response;

    if (!structured) {
      return data.result || '';
    }

    let message = '';

    // Add executive summary
    if (structured.executive_summary) {
      message += structured.executive_summary + '\n\n';
    }

    // Add key areas summary with fallback
    // Primary: Check direct areas property (new structure)
    // Fallback: Check structured_response.areas (legacy structure)
    const areas = data.areas || structured.areas || {};
    if (Object.keys(areas).length > 0) {
      const areaCount = Object.keys(areas).length;
      message += `The analysis covers ${areaCount} key area${areaCount > 1 ? 's' : ''}: `;
      message += Object.keys(areas).join(', ') + '.\n\n';
    }


    // Fallback if no structured content
    if (!message.trim()) {
      message = 'Analysis completed. Please check the detailed report in the workspace panel for comprehensive insights.';
    }

    return message.trim();
  };

  // Helper function to prevent duplicate messages from being added
  const addMessageWithoutDuplicates = (newMessage: ChatMessage | ChatMessage[]) => {
    setMessages(prev => {
      const messagesToAdd = Array.isArray(newMessage) ? newMessage : [newMessage];
      const updatedMessages = [...prev];

      messagesToAdd.forEach(msg => {
        // Check if message with same ID already exists
        const existingIndex = updatedMessages.findIndex(m => m.id === msg.id);
        if (existingIndex === -1) {
          // Message doesn't exist, add it
          updatedMessages.push(msg);
        } else {
          // Message exists, update it if content has changed
          if (updatedMessages[existingIndex].content !== msg.content ||
            JSON.stringify(updatedMessages[existingIndex].metadata) !== JSON.stringify(msg.metadata)) {
            updatedMessages[existingIndex] = msg;
          }
        }
      });

      return updatedMessages;
    });
  };

  // Helper function to merge streaming responses, preserving existing data
  const mergeStreamingResponse = (current: StreamingQueryResponse | undefined, newData: StreamingQueryResponse): StreamingQueryResponse => {
    if (!current) return newData;

    const merged = { ...current, ...newData };

    // Merge areas at root level (new structure)
    if (current.areas && newData.areas) {
      merged.areas = {
        ...current.areas,
        ...newData.areas
      };
    } else if (newData.areas) {
      merged.areas = newData.areas;
    }

    // Merge structured_response if both exist
    if (current.structured_response && newData.structured_response) {
      merged.structured_response = {
        ...current.structured_response,
        ...newData.structured_response
      };

      // Merge areas specifically in structured_response (legacy structure)
      if (current.structured_response.areas && newData.structured_response.areas) {
        merged.structured_response.areas = {
          ...current.structured_response.areas,
          ...newData.structured_response.areas
        };
      } else if (newData.structured_response.areas) {
        merged.structured_response.areas = newData.structured_response.areas;
      }

      // Merge arrays by combining unique items
      if (current.structured_response.recommendations && newData.structured_response.recommendations) {
        merged.structured_response.recommendations = [
          ...current.structured_response.recommendations,
          ...newData.structured_response.recommendations.filter(
            (newRec: any) => !current.structured_response!.recommendations!.includes(newRec)
          )
        ];
      }


      if (current.structured_response.next_steps && newData.structured_response.next_steps) {
        merged.structured_response.next_steps = [
          ...current.structured_response.next_steps,
          ...newData.structured_response.next_steps.filter(
            (newStep: any) => !current.structured_response!.next_steps!.includes(newStep)
          )
        ];
      }
    }

    // Merge steps array, keeping all unique steps
    if (current.steps && newData.steps) {
      const existingStepIds = new Set(current.steps.map(step => step.stepId));
      const newSteps = newData.steps.filter(step => !existingStepIds.has(step.stepId));
      merged.steps = [...current.steps, ...newSteps];
    }

    return merged;
  };

  // Initialize conversations from project
  useEffect(() => {
    if (project.conversation_history && project.conversation_history.length > 0) {
      setConversations(project.conversation_history);
      // Convert and set messages
      const convertedMessages = convertConversationToMessages(project.conversation_history);
      addMessageWithoutDuplicates(convertedMessages);
      setIsLoadingConversation(false);
    } else {
      setConversations([]);
      setIsLoadingConversation(false);
    }
  }, [project.conversation_history]);

  // Update messages when conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      const convertedMessages = convertConversationToMessages(conversations);
      addMessageWithoutDuplicates(convertedMessages);
    }
  }, [conversations]);

  // Convert ConversationEntry to ChatMessage for display
  const convertConversationToMessages = (entries: ConversationEntry[]): ChatMessage[] => {
    const messages: ChatMessage[] = [];

    // Check if project has files and add them as the first file message if they exist
    if (project.files && project.files.length > 0) {
      // Group files by upload time or add them all in one message
      const fileMessage: ChatMessage = {
        id: 'project-files',
        role: 'file',
        content: '',
        timestamp: project.files[0].uploaded_at || project.created_at,
        metadata: {
          files: project.files.map(file => ({
            name: file.filename,  // Changed from file.name
            size: file.file_size,  // Changed from file.size
            type: file.content_type,  // Changed from file.type
            uploaded_at: file.uploaded_at
          }))
        }
      };
      messages.push(fileMessage);
    }

    entries.forEach(entry => {
      // Always add the original query/result messages first
      // Add user message
      messages.push({
        id: entry.query.query_id,
        role: 'user',
        content: entry.query.query,
        timestamp: entry.timestamp
      });

      // Additionally, add any chat_messages if they exist
      if (entry.chat_messages && entry.chat_messages.length > 0) {
        entry.chat_messages.forEach((chatMsg, index) => {
          // Skip if this is the same as the original query message
          if (chatMsg.content === entry.query.query && chatMsg.message_type === 'user') {
            return; // Skip duplicate
          }

          // Map message_type to role
          let role: 'user' | 'assistant' | 'system' | 'file' = 'user';
          if (chatMsg.message_type === 'user') {
            role = 'user';
          } else if (chatMsg.message_type === 'system' || chatMsg.message_type === 'assistant') {
            role = 'assistant';
          } else if (chatMsg.message_type === 'processing' || chatMsg.message_type === 'execution_plan') {
            role = 'system';
          }

          // Check if this is a file message based on metadata
          if (chatMsg.metadata?.files) {
            messages.push({
              id: `${entry.entry_id}-chat-${index}`,
              role: 'file',
              content: '',
              timestamp: chatMsg.timestamp || new Date().toISOString(),
              metadata: chatMsg.metadata
            });
          } else if (chatMsg.message_type === 'execution_plan' && chatMsg?.metadata?.executionPlan) {
            messages.push({
              id: `plan-${Date.now()}`,
              content: 'EXECUTION_PLAN',
              role: 'assistant',
              timestamp: chatMsg.timestamp || new Date().toISOString(),
              metadata: {
                type: 'execution_plan',
                executionPlan: typeof chatMsg?.metadata?.executionPlan === 'string'
                  ? JSON.parse(chatMsg?.metadata?.executionPlan)
                  : chatMsg?.metadata?.executionPlan,
                queryId: chatMsg?.metadata?.queryId
              }
            });

          } else {
            messages.push({
              id: `${entry.entry_id}-chat-${index}`,
              role: role,
              content: chatMsg.content,
              timestamp: chatMsg.timestamp || new Date().toISOString(),
              metadata: chatMsg.metadata
            });
          }
        });
      }
    });

    return messages;
  };


  // Define handleSendMessage with useCallback to avoid dependency issues
  const handleSendMessage = useCallback(async (message: string, files: File[], metadata?: any) => {
    // Create array of messages to add
    const newMessages: ChatMessage[] = [];

    let queryId: string;
    let eventSource: EventSource | null;

    // If there are files, add file message FIRST (before user message)
    if (files.length > 0) {
      const fileMessage: ChatMessage = {
        id: `${Date.now()}-files`,
        content: '',
        role: 'file',
        timestamp: new Date().toISOString(),
        metadata: {
          files: files.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            uploaded_at: new Date().toISOString()
          }))
        }
      };
      newMessages.push(fileMessage);
    }

    // Add user message AFTER file message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date().toISOString(),
      metadata: metadata  // Include metadata if provided
    };

    if (!metadata?.hasConversation) {
      newMessages.push(userMessage);
    }
    addMessageWithoutDuplicates(newMessages);
    setAttachedFiles([]);

    // Set uploading state if there are files
    if (files.length > 0) {
      setIsUploadingFiles(true);
      setUploadingMessageId(userMessage.id);
      setUploadProgress(0); // Reset progress to 0
    }


    // Check if we're currently in a pending_approval state
    const lastMessage = messages[messages.length - 1];
    const isRespondingToExecutionPlan = lastMessage?.metadata?.type === 'execution_plan';
    const currentQueryId = lastMessage?.metadata?.queryId || streamingResponse?.query_id || '';

    // Check if this is an approval from the Proceed button (has special metadata)
    const isButtonApproval = userMessage.metadata?.source === 'approval_button';

    // If there's a pending execution plan and user sends a new message (not button approval)
    // we need to stop the current stream and start a new one
    if (isRespondingToExecutionPlan && currentQueryId && streamingResponse?.status === 'pending_approval' && !isButtonApproval) {
      // Close the existing event source if it's still open
      if (currentEventSource.current) {
        currentEventSource.current.close();
        currentEventSource.current = null;
      }

      // Clear the streaming response and reset streaming state
      setStreamingResponse(undefined);
      setIsStreaming(false);
      setHasUserApproved(false); // Reset approval state for new query
      currentStreamingResponse.current = undefined;
      eventSource = null;
    }

    // Only process approval if it's from the button (has special metadata)
    if (isButtonApproval && isRespondingToExecutionPlan && streamingResponse?.status === 'pending_approval') {

      // Use the queryId from the button metadata for accuracy
      const approvalQueryId = userMessage.metadata?.queryId || currentQueryId;

      if (approvalQueryId) {
        try {
          await streamingAPI.submitApprovalFeedback(approvalQueryId, message);
          // Set approval state and show workspace when user approves/proceeds
          setHasUserApproved(true);
          setShowWorkspace(true);
        } catch (error) {
          console.error('Failed to submit approval feedback:', error);
          // Return to Projects list on error
          navigate('/dashboard');
        }
        return;
      } else {
        console.error('No queryId found for approval');
      }
    }

    // Check if there's at least one conversation with results (for follow-up queries)
    const hasConversationWithResults = conversations.some(conv => conv.result !== null && conv.result !== undefined);

    // Find the latest query_id from conversations with results (for follow-up)
    let latestQueryId: string | undefined;
    let parentEntryId: string | undefined;

    if (hasConversationWithResults) {
      // Find the latest conversation entry with results
      const conversationsWithResults = conversations.filter(conv => conv.result !== null && conv.result !== undefined);
      if (conversationsWithResults.length > 0) {
        const latestConversation = conversationsWithResults[conversationsWithResults.length - 1];
        latestQueryId = latestConversation.query_id;
        parentEntryId = latestConversation.entry_id;
      }
    }

    try {
      // If there is at least one conversation with results, use follow-up endpoints
      if ((hasConversationWithResults && latestQueryId) || initialConversations.length > 0) {
        // Mark this as a follow-up query
        setIsCurrentQueryFollowUp(true);

        // Set chat loading to true to show loading dots in chat panel only
        setIsChatLoading(true);
        // Don't set isStreaming here to avoid workspace content blinking
        // Clear any existing streaming response to ensure dots show
        setStreamingResponse(undefined);

        const queryIdValue = latestQueryId || initialConversations[0].query_id;

        // Use follow-up query endpoints
        let result: { queryId: string; eventSource: EventSource; failedFiles?: string[]; };
        if (files && files.length > 0) {
          try {
            result = await streamingAPI.submitFollowupQueryWithFiles(
              project.project_id,
              queryIdValue,
              message,
              files,
              true, // includeProjectFiles
              {}, // additionalContext
              (progress) => setUploadProgress(progress) // Progress callback
            );

            // Check if any files failed to upload
            if (result.failedFiles && result.failedFiles.length > 0) {
              const failedFilesList = result.failedFiles.join(', ');
              setToastMessage(`Failed to upload: ${failedFilesList}. Query will continue with successfully uploaded files.`);
              setToastType('warning');
              setToastVisible(true);
            }
          } finally {
            // Clear upload state after upload completes (success or failure)
            setIsUploadingFiles(false);
            setUploadingMessageId(null);
            setUploadProgress(0); // Reset progress
          }
        } else {
          result = await streamingAPI.submitFollowupQuery(
            queryIdValue,
            message,
            true, // includeProjectFiles
            {} // additionalContext
          );
        }
        queryId = result.queryId;
        eventSource = result.eventSource;

        // Save the follow-up user message to backend
        if (parentEntryId) {
          streamingAPI.addChatMessage(project.project_id, {
            entry_id: parentEntryId,
            message_type: 'user',
            content: message,
            query_id: queryId,
            metadata: {
              is_followup: true,
              files: files.length > 0 ? files.map(f => ({ name: f.name, size: f.size, type: f.type })) : undefined
            }
          }).catch(error => {
            console.error('Failed to save follow-up user message:', error);
          });
        }

        // For follow-up queries, skip the streaming UI and just wait for the final result
        if (eventSource) {

          eventSource.addEventListener('update', async (event) => {
            try {
              const data: StreamingQueryResponse = JSON.parse(event.data);

              // Check if this is a completion event (done: true)
              if (data.done === true && (data.status === 'completed' && data.progress === 100)) {
                console.log('Follow-up query completed, fetching full result...', data);

                try {
                  // Stop showing loading dots
                  setIsChatLoading(false);

                  // Fetch the full result
                  const fullResult = await streamingAPI.fetchQueryFullResult(queryId);

                  // Handle failed queries to prevent infinite loops
                  if (fullResult.status === 'failed') {
                    console.log('Skipping failed query in follow-up:', queryId);
                    return;
                  }

                  if (fullResult.result) {
                    const messageId = `response-${queryId}`;

                    // Check if message with this ID already exists and add if not
                    const existingMessage = messages.find(msg => msg.id === messageId);

                    if (!existingMessage) {
                      // Add new message
                      const responseMessage: ChatMessage = {
                        id: messageId,
                        content: fullResult.result,
                        role: 'assistant',
                        timestamp: new Date().toISOString()
                      };
                      setMessages(prev => {
                        // Double-check inside setState to prevent race conditions
                        const alreadyExists = prev.find(msg => msg.id === messageId);
                        if (alreadyExists) {
                          return prev;
                        }
                        return [...prev, responseMessage];
                      });

                      // Save to backend only if message didn't exist
                      if (parentEntryId) {
                        streamingAPI.addChatMessage(project.project_id, {
                          entry_id: parentEntryId,
                          message_type: 'system',
                          content: fullResult.result,
                          query_id: queryId,
                          metadata: {
                            is_followup_response: true,
                          }
                        }).catch(error => {
                          console.error('Failed to save follow-up result:', error);
                        });
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error fetching follow-up result:', error);
                  setIsChatLoading(false);
                  setIsStreaming(false);

                  const errorMessage: ChatMessage = {
                    id: `error-${Date.now()}`,
                    content: 'Failed to process your follow-up query. Please try again.',
                    role: 'assistant',
                    timestamp: new Date().toISOString()
                  };
                  addMessageWithoutDuplicates(errorMessage);
                } finally {
                  result.eventSource?.close();
                  currentEventSource.current = null;
                }
                return;
              }

              // Check if status is rejected
              if (data.status === 'rejected') {
                // Set streamingResponse status to rejected
                setStreamingResponse(prev => ({ ...prev, status: 'rejected' } as StreamingQueryResponse));

                // Close the stream
                result.eventSource?.close();
                currentEventSource.current = null;
                const content = data?.rejection_reason || data?.result || "Oh, that's a curveball! I don't have the answer for that, but I can definitely help you with any business strategy questions you have."

                // Add rejection message to chat
                const rejectionMessage: ChatMessage = {
                  id: `rejection-sync-${Date.now()}`,
                  content,
                  role: 'assistant',
                  timestamp: new Date().toISOString()
                };

                addMessageWithoutDuplicates(rejectionMessage);
                setIsChatLoading(false);
                setIsStreaming(false);

                // Save rejection message to backend
                if (parentEntryId) {
                  streamingAPI.addChatMessage(project.project_id, {
                    entry_id: parentEntryId,
                    message_type: 'system',
                    content: content,
                    query_id: queryId,
                    metadata: { rejection: true }
                  }).catch(error => {
                    console.error('Failed to save rejection message:', error);
                  });
                }
                return;
              }

            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          });
          eventSource.addEventListener('done', async (event) => {
            try {
              // Stop showing loading dots
              setIsChatLoading(false);

              // Fetch the full result
              const fullResult = await streamingAPI.fetchQueryFullResult(queryId);

              // Handle failed queries to prevent infinite loops
              if (fullResult.status === 'failed') {
                console.log('Skipping failed query in done event:', queryId);
                return;
              }

              if (fullResult.result) {
                const messageId = `response-${queryId}`;

                // Check if message with this ID already exists and add if not
                const existingMessage = messages.find(msg => msg.id === messageId);

                if (!existingMessage) {
                  // Add new message
                  const responseMessage: ChatMessage = {
                    id: messageId,
                    content: fullResult.result,
                    role: 'assistant',
                    timestamp: new Date().toISOString()
                  };
                  setMessages(prev => {
                    // Double-check inside setState to prevent race conditions
                    const alreadyExists = prev.find(msg => msg.id === messageId);
                    if (alreadyExists) {
                      return prev;
                    }
                    return [...prev, responseMessage];
                  });

                  // Save to backend only if message didn't exist
                  if (parentEntryId) {
                    streamingAPI.addChatMessage(project.project_id, {
                      entry_id: parentEntryId,
                      message_type: 'system',
                      content: fullResult.result,
                      query_id: queryId,
                      metadata: {
                        is_followup_response: true,
                      }
                    }).catch(error => {
                      console.error('Failed to save follow-up result:', error);
                    });
                  }
                }
              }


            } catch (error) {
              console.error('Error fetching follow-up result:', error);
              setIsChatLoading(false);
              setIsStreaming(false);

              const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                content: 'Failed to process your follow-up query. Please try again.',
                role: 'assistant',
                timestamp: new Date().toISOString()
              };
              addMessageWithoutDuplicates(errorMessage);
            } finally {
              eventSource?.close();
              currentEventSource.current = null;
            }
          });

          eventSource.addEventListener('error', () => {
            setIsChatLoading(false);
            setIsStreaming(false);
            console.error('Streaming error in follow-up query');

            // // Show error toast
            // setToastMessage('An error occurred processing your query. Please try sending your message again.');
            // setToastType('error');
            // setToastVisible(true);

            eventSource?.close();
            currentEventSource.current = null;
          });

          return; // Exit early for follow-up queries
        }
      } else {
        // Mark this as not a follow-up query
        setIsCurrentQueryFollowUp(false);
        // Use normal submitProjectQuery endpoints for initial queries
        let result;
        if (files && files.length > 0) {
          try {
            result = await streamingAPI.submitProjectQueryWithFiles(
              project.project_id,
              message,
              files,
              parentEntryId,
              true, // includeProjectFiles
              {}, // additionalContext
              (progress) => setUploadProgress(progress) // Progress callback
            );

            // Check if any files failed to upload
            if (result.failedFiles && result.failedFiles.length > 0) {
              const failedFilesList = result.failedFiles.join(', ');
              setToastMessage(`Failed to upload: ${failedFilesList}. Query will continue with successfully uploaded files.`);
              setToastType('warning');
              setToastVisible(true);
            }
          } finally {
            // Clear upload state after upload completes (success or failure)
            setIsUploadingFiles(false);
            setUploadingMessageId(null);
            setUploadProgress(0); // Reset progress
          }
        } else {
          result = await streamingAPI.submitProjectQuery(
            project.project_id,
            message,
            parentEntryId
          );
        }

        queryId = result.queryId;
        eventSource = result.eventSource;
        parentEntryId = result.entryId;

        if (!eventSource) return;
        // Only set streaming state after successful submission (including file upload if applicable)
        setIsStreaming(true);
        // For follow-up queries, don't clear the streaming response to avoid blinking
        if (!(hasConversationWithResults && latestQueryId)) {
          setStreamingResponse(undefined);
        }
        currentStreamingResponse.current = undefined;

        currentEventSource.current = eventSource;

        // Set up event listeners for streaming updates
        eventSource.addEventListener('update', async (event) => {
          const data: StreamingQueryResponse = JSON.parse(event.data);

          // Check if this is a completion event (done: true)
          if ((data.done === true || (data.status === 'completed' && data.progress === 100)) && !fullResultFetchedRef.current) {
            console.log('Query completed, fetching full result...', data);

            try {
              // Prevent multiple fetches
              fullResultFetchedRef.current = true;

              // Fetch the full result from the new endpoint
              const fullResult = await streamingAPI.fetchQueryFullResult(queryId);

              // Handle failed queries to prevent infinite loops
              if (fullResult.status === 'failed') {
                console.log('Skipping failed query in update event:', queryId);
                return;
              }

              // Use the full result instead of merging streamed data
              const finalData = { ...fullResult, done: true };

              setStreamingResponse(finalData);
              setLatestStreamResult(finalData);

              if (!initialConversations.length) {
                // Create initial conversation from finalData for new projects
                const conversationEntry: ConversationEntry = {
                  entry_id: `entry-${Date.now()}`,
                  project_id: project.project_id,
                  timestamp: new Date().toISOString(),
                  is_followup: false,
                  parent_entry_id: null,
                  query: {
                    query_id: finalData.query_id || finalData.queryId || queryId,
                    query: message,
                    context: {
                      project_id: project.project_id,
                      is_followup: false,
                      query_type: "new_analysis",
                      parent_entry_id: null,
                      include_project_files: true,
                      require_approval: false,
                      run_full_analysis: true
                    },
                    focus_areas: [],
                    timeframe: null,
                    user_id: null,
                    session_id: project.project_id,
                    debug: false
                  },
                  query_id: finalData.query_id || finalData.queryId || queryId,
                  result: finalData.structured_response ? {
                    query_id: finalData.query_id || finalData.queryId || queryId,
                    status: "completed",
                    summary: finalData.result || null,
                    sections: {
                      executive_summary: finalData.structured_response.executive_summary || "",
                      areas: finalData.areas || finalData.structured_response.areas || {},
                      recommendations: finalData.structured_response.recommendations || [],
                      next_steps: finalData.structured_response.next_steps || [],
                      agent_responses: finalData.structured_response.agent_responses || {},
                      metrics: finalData.structured_response.metrics || [],
                      key_insights: finalData.structured_response.key_insights || null,
                      swot_analysis: finalData.structured_response.swot_analysis || {
                        strengths: [],
                        weaknesses: [],
                        opportunities: [],
                        threats: []
                      }
                    },
                    visualizations: finalData.visualizations || [],
                    sources: finalData.sources || [],
                    confidence_score: finalData.confidence_score || null,
                    execution_time_ms: finalData.execution_time_ms || null,
                    errors: finalData.errors || []
                  } : null
                };

                setInitialConversations([conversationEntry]);
              }

              setIsStreaming(false);
              setShowWorkspace(true);
            } catch (error) {
              console.error('Error fetching full result:', error);
              // Fallback to merged data if fetch fails
              const mergedFinalData = currentStreamingResponse.current ?
                mergeStreamingResponse(currentStreamingResponse.current, { ...data, done: true }) :
                { ...data, done: true };

              setStreamingResponse(mergedFinalData);
              setLatestStreamResult(mergedFinalData);

              if (mergedFinalData.structured_response?.executive_summary) {
                const summaryMessage: ChatMessage = {
                  id: `summary-${Date.now()}`,
                  content: mergedFinalData.structured_response.executive_summary,
                  role: 'assistant',
                  timestamp: new Date().toISOString()
                };
                addMessageWithoutDuplicates(summaryMessage);
              }

              setIsStreaming(false);
              setShowWorkspace(true);
            } finally {
              eventSource?.close();
              currentEventSource.current = null;
            }
            return;
          }

          // Check if status is rejected
          if (data.status === 'rejected') {
            // Set streamingResponse status to rejected
            setStreamingResponse(prev => ({ ...prev, status: 'rejected' } as StreamingQueryResponse));

            // Close the stream
            eventSource?.close();
            currentEventSource.current = null;
            const content = data?.rejection_reason || data?.result || "Oh, that's a curveball! I don't have the answer for that, but I can definitely help you with any business strategy questions you have."

            // Add rejection message to chat
            const rejectionMessage: ChatMessage = {
              id: `rejection-${Date.now()}`,
              content,
              role: 'assistant',
              timestamp: new Date().toISOString()
            };

            addMessageWithoutDuplicates(rejectionMessage);
            setIsStreaming(false);
            setHasUserApproved(false); // Reset approval on rejection

            // Save rejection message to backend
            if (parentEntryId) {
              streamingAPI.addChatMessage(project.project_id, {
                entry_id: parentEntryId,
                message_type: 'system',
                content: content,
                query_id: queryId,
                metadata: { rejection: true }
              }).catch(error => {
                console.error('Failed to save rejection message:', error);
              });
            }
            return;
          }

          // Check if we just entered pending_approval status
          if (data.status === 'pending_approval' && data.executionPlan) {
            const planMessageId = `plan-${data.queryId}`;

            // Check if execution plan message already exists
            const existingPlan = messages.find(msg => msg.id === planMessageId);

            if (!existingPlan) {
              // Create an AI message with the execution plan
              const planMessage: ChatMessage = {
                id: planMessageId,
                content: 'EXECUTION_PLAN',
                role: 'assistant',
                timestamp: new Date().toISOString(),
                metadata: {
                  type: 'execution_plan',
                  executionPlan: data.executionPlan,
                  queryId: data.queryId
                }
              };

              setMessages(prev => {
                // Double-check inside setState to prevent race conditions
                const alreadyExists = prev.find(msg => msg.id === planMessageId);
                if (alreadyExists) {
                  return prev;
                }

                // Message will be added, so schedule the API call
                // Use setTimeout to ensure setState has completed
                setTimeout(() => {
                  if (parentEntryId) {
                    streamingAPI.addChatMessage(project.project_id, {
                      entry_id: parentEntryId as string,
                      message_type: 'execution_plan',
                      content: 'EXECUTION_PLAN',
                      query_id: queryId,
                      metadata: {
                        type: 'execution_plan',
                        executionPlan: JSON.stringify(data.executionPlan),
                        queryId: data.queryId
                      }
                    }).catch(error => {
                      console.error('Failed to save execution plan:', error);
                    });
                  }
                }, 1000);

                return [...prev, planMessage];
              });
            }
          }

          const mergedData = mergeStreamingResponse(currentStreamingResponse.current, data);
          currentStreamingResponse.current = mergedData;
          setStreamingResponse(mergedData);
        });

        eventSource.addEventListener('done', async (event) => {
          const rawFinalData: StreamingQueryResponse = JSON.parse(event.data);

          try {
            // Fetch the full result from the new endpoint
            const fullResult = await streamingAPI.fetchQueryFullResult(queryId);

            // Handle failed queries to prevent infinite loops
            if (fullResult.status === 'failed') {
              console.log('Skipping failed query in main done event:', queryId);
              return;
            }

            // Use the full result instead of merging streamed data
            const finalData = { ...fullResult, done: true };

            setStreamingResponse(finalData);
            setLatestStreamResult(finalData);

            if (!initialConversations.length) {
              // Create initial conversation from finalData for new projects
              const conversationEntry: ConversationEntry = {
                entry_id: `entry-${Date.now()}`,
                project_id: project.project_id,
                timestamp: new Date().toISOString(),
                query: {
                  query_id: finalData.query_id || finalData.queryId || queryId,
                  query: message,
                  context: {
                    project_id: project.project_id,
                    is_followup: false,
                    query_type: "new_analysis",
                    parent_entry_id: null,
                    include_project_files: true,
                    require_approval: false,
                    run_full_analysis: true
                  },
                  focus_areas: [],
                  timeframe: null,
                  user_id: null,
                  session_id: project.project_id,
                  debug: false
                },
                query_id: finalData.query_id || finalData.queryId || queryId,
                result: finalData.structured_response ? {
                  query_id: finalData.query_id || finalData.queryId || queryId,
                  status: "completed",
                  summary: finalData.result || null,
                  sections: {
                    executive_summary: finalData.structured_response.executive_summary || "",
                    areas: finalData.areas || finalData.structured_response.areas || {},
                    recommendations: finalData.structured_response.recommendations || [],
                    next_steps: finalData.structured_response.next_steps || [],
                    agent_responses: finalData.structured_response.agent_responses || {},
                    metrics: finalData.structured_response.metrics || [],
                    key_insights: finalData.structured_response.key_insights || null,
                    swot_analysis: finalData.structured_response.swot_analysis || {
                      strengths: [],
                      weaknesses: [],
                      opportunities: [],
                      threats: []
                    }
                  },
                  visualizations: finalData.visualizations || [],
                  sources: finalData.sources || [],
                  confidence_score: finalData.confidence_score ?? null,
                  execution_time_ms: finalData.execution_time_ms ?? null,
                  errors: finalData.errors || []
                } : null,
                is_followup: false,
                parent_entry_id: null
              };

              // Also update initial conversations for consistency
              setInitialConversations([conversationEntry]);
            }


            // Add executive summary as AI response for follow-up queries
            if (hasConversationWithResults && latestQueryId && finalData.structured_response?.executive_summary) {
              const summaryMessage: ChatMessage = {
                id: `summary-${Date.now()}`,
                content: finalData.structured_response.executive_summary,
                role: 'assistant',
                timestamp: new Date().toISOString()
              };
              addMessageWithoutDuplicates([summaryMessage]);
            }

            setIsStreaming(false);
            setShowWorkspace(true); // Show workspace panel when complete
          } catch (error) {
            console.error('Error fetching full result:', error);
            // Fallback to merged data if fetch fails
            const mergedFinalData = currentStreamingResponse.current ?
              mergeStreamingResponse(currentStreamingResponse.current, { ...rawFinalData, done: true }) :
              { ...rawFinalData, done: true };

            setStreamingResponse(mergedFinalData);
            setLatestStreamResult(mergedFinalData);

            if (hasConversationWithResults && latestQueryId && mergedFinalData.structured_response?.executive_summary) {
              const summaryMessage: ChatMessage = {
                id: `summary-${Date.now()}`,
                content: mergedFinalData.structured_response.executive_summary,
                role: 'assistant',
                timestamp: new Date().toISOString()
              };
              addMessageWithoutDuplicates([summaryMessage]);
            }

            setIsStreaming(false);
            setShowWorkspace(true);
          } finally {
            eventSource?.close();
            currentEventSource.current = null;
          }
        });

        eventSource.addEventListener('error', (event) => {
          console.error('Streaming error:', event);

          // // Show error toast
          // setToastMessage('An error occurred while processing your query. Please try sending your message again.');
          // setToastType('error');
          // setToastVisible(true);

          // Add a helpful message in the chat
          // const errorMessage: ChatMessage = {
          //   id: (Date.now() + 2).toString(),
          //   content: 'Something went wrong while processing your request. Please try sending your message again.',
          //   role: 'assistant',
          //   timestamp: new Date().toISOString()
          // };
          // setMessages(prev => [...prev, errorMessage]);

          setIsStreaming(false);
          setIsChatLoading(false);
          eventSource?.close();
          currentEventSource.current = null;
        });
      }

    } catch (error) {
      console.error('Error submitting query:', error);

      // Reset both loading states
      setIsChatLoading(false);
      setIsStreaming(false);

      // Parse the error using our unified error parser
      let parsedError: ParsedError | null = null;
      let errorContent = 'Failed to submit query. Please try again.';
      let toastContent = 'Failed to submit your query. Please try again.';

      if (error instanceof Error) {
        // Try to parse structured error from JSON string
        parsedError = parseErrorFromString(error.message);

        if (parsedError) {
          // Use structured error information
          errorContent = parsedError.userMessage;
          toastContent = parsedError.userMessage;

          // Add suggestions for validation errors
          if (parsedError.type === 'validation') {
            const suggestions = BackendErrorParser.getValidationSuggestions(parsedError.code);
            if (suggestions.length > 0) {
              errorContent += '\n\n**Try asking about:**\n' + suggestions.map(s => `• ${s}`).join('\n');
            }
          }
        } else {
          // Fallback to legacy error handling
          if (error.message.includes('Failed to upload files')) {
            errorContent = 'Failed to upload files. Please check the file format and size, then try again.';
            toastContent = 'Failed to upload files. Check file format and size.';
          } else if (error.message.includes('422')) {
            errorContent = 'The uploaded files could not be processed. Please ensure they are in a supported format.';
            toastContent = 'Files could not be processed. Check the format.';
          }
        }
      }

      // Show error toast
      setToastMessage(toastContent);
      setToastType('error');
      setToastVisible(true);

      // Create error message with retry option
      const errorMessage: ChatMessage = {
        id: (Date.now() + 3).toString(),
        content: errorContent,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        metadata: {
          isError: true,
          errorType: parsedError?.type || 'unknown',
          originalQuery: parsedError?.originalQuery || message,
          canRetry: parsedError?.retryable || false
        }
      };

      addMessageWithoutDuplicates(errorMessage);
    }
  }, [project, setMessages, setAttachedFiles, setIsStreaming, setStreamingResponse, setLatestStreamResult, setShowWorkspace, streamingResponse]);

  // Handle sync project - re-run the initial query
  const handleSyncProject = useCallback(async () => {
    // Check if project has an initial query
    if (!project.initial_query) {
      console.warn('No initial query to sync');
      return;
    }

    // Check if already processing
    if (isStreaming) {
      console.warn('A query is already being processed');
      return;
    }

    const startTime = new Date().toISOString();

    try {
      // Add sync message to chat

      setIsSyncing(true); // Set syncing state to true
      setSyncProgress(0); // Reset sync progress to 0
      currentStreamingResponse.current = undefined;

      // Submit sync query using the new method with proper format
      // Re-run the initial query for syncing
      // Convert attached files to the expected format
      const uploadedFiles = attachedFiles.map(file => ({
        file_id: file.name,
        filename: file.name,
        file_type: file.type || 'document'
      }));

      const result = await streamingAPI.submitSyncQuery(
        project.project_id,
        latestStreamResult?.query || project.initial_query,
        project.name || 'Untitled Project',
        uploadedFiles
      );

      if (result.eventSource) {
        currentEventSource.current = result.eventSource;

        // Set up event listeners for streaming updates with execution plan handling
        result.eventSource.addEventListener('update', async (event) => {
          try {
            const data: StreamingQueryResponse = JSON.parse(event.data);
            console.log('Sync update received:', data);

            // Update sync progress if available (only increase, never decrease)
            if (data.progress !== undefined && data.progress !== null) {
              setSyncProgress(prevProgress => Math.max(prevProgress, (data.progress || 0)));
            }

            // Check if this is a completion event (done: true)
            if (data.done === true || (data.status === 'completed' && data.progress === 100)) {
              console.log('Sync query completed, fetching full result...', data);

              try {
                if (!latestStreamResult?.queryId) {
                  // Add page re-load here
                  window.location.reload();
                }
                else {
                  // Fetch the full result from the new endpoint
                  const fullResult = await streamingAPI.fetchQueryFullResult(latestStreamResult?.queryId);

                  // Handle failed queries to prevent infinite loops
                  if (fullResult.status === 'failed') {
                    console.log('Skipping failed query in sync update:', latestStreamResult?.queryId);
                    return;
                  }

                  // Use the full result instead of merging streamed data
                  const finalData = { ...fullResult, done: true, startTime, endTime: new Date().toISOString() };

                  setStreamingResponse(finalData);
                  setLatestStreamResult(finalData);
                  setIsSyncing(false); // Reset syncing state on completion
                  setSyncProgress(0); // Reset sync progress
                  setShowWorkspace(true); // Show workspace panel when complete
                }

              } catch (error) {
                console.error('Error fetching full result:', error);
                // Fallback to merged data if fetch fails
                const mergedFinalData = currentStreamingResponse.current ?
                  mergeStreamingResponse(currentStreamingResponse.current, { ...data, done: true }) :
                  { ...data, done: true };

                setStreamingResponse(mergedFinalData);
                setLatestStreamResult(mergedFinalData);

                if (mergedFinalData.structured_response?.executive_summary) {
                  const summaryMessage: ChatMessage = {
                    id: `summary-${Date.now()}`,
                    content: mergedFinalData.structured_response.executive_summary,
                    role: 'assistant',
                    timestamp: new Date().toISOString()
                  };
                  addMessageWithoutDuplicates(summaryMessage);
                }

                setIsStreaming(false);
                setIsSyncing(false); // Reset syncing state on error
                setSyncProgress(0); // Reset sync progress
                setShowWorkspace(true);
              } finally {
                result.eventSource?.close();
                currentEventSource.current = null;
              }
              return;
            }

            // Check if status is rejected
            if (data.status === 'rejected') {
              // Set streamingResponse status to rejected
              setStreamingResponse(prev => ({ ...prev, status: 'rejected' } as StreamingQueryResponse));

              setIsSyncing(false); // Reset syncing state on rejection
              setSyncProgress(0); // Reset sync progress

              const content = data?.rejection_reason || data?.result || "Oh, that's a curveball! I don't have the answer for that, but I can definitely help you with any business strategy questions you have."

              // Add rejection message to chat
              const rejectionMessage: ChatMessage = {
                id: `rejection-sync-${Date.now()}`,
                content,
                role: 'assistant',
                timestamp: new Date().toISOString()
              };

              addMessageWithoutDuplicates(rejectionMessage);
              setIsStreaming(false);
              setIsChatLoading(false);

              // Close the stream
              result.eventSource?.close();
              currentEventSource.current = null;

              return;
            }

          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        });

        result.eventSource.addEventListener('done', async (event) => {
          const rawFinalData: StreamingQueryResponse = JSON.parse(event.data);
          console.log('Sync done received:', rawFinalData);

          try {
            if (!latestStreamResult?.queryId) {
              // Add page re-load here
              window.location.reload();
            }
            else {
              // Fetch the full result from the new endpoint
              const fullResult = await streamingAPI.fetchQueryFullResult(latestStreamResult?.queryId);

              // Handle failed queries to prevent infinite loops
              if (fullResult.status === 'failed') {
                console.log('Skipping failed query in sync done:', latestStreamResult?.queryId);
                return;
              }

              // Use the full result instead of merging streamed data
              const finalData = { ...fullResult, done: true, startTime, endTime: new Date().toISOString() };

              setStreamingResponse(finalData);
              setLatestStreamResult(finalData);
              setIsSyncing(false); // Reset syncing state on completion
              setSyncProgress(0); // Reset sync progress
              setShowWorkspace(true); // Show workspace panel when complete
            }
          } catch (error) {
            console.error('Error fetching full result:', error);
            // Fallback to merged data if fetch fails
            const mergedFinalData = currentStreamingResponse.current ?
              mergeStreamingResponse(currentStreamingResponse.current, { ...rawFinalData, done: true }) :
              { ...rawFinalData, done: true };

            setStreamingResponse(mergedFinalData);
            setLatestStreamResult(mergedFinalData);

            if (mergedFinalData.structured_response?.executive_summary) {
              const summaryMessage: ChatMessage = {
                id: `summary-${Date.now()}`,
                content: mergedFinalData.structured_response.executive_summary,
                role: 'assistant',
                timestamp: new Date().toISOString()
              };
              addMessageWithoutDuplicates([summaryMessage]);
            }

            setIsStreaming(false);
            setIsSyncing(false); // Reset syncing state on error
            setSyncProgress(0); // Reset sync progress
            setShowWorkspace(true);
          } finally {
            result.eventSource?.close();
            currentEventSource.current = null;
          }
        });

        result.eventSource.onerror = (error: Event) => {
          const eventSource = error.target as EventSource;

          // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
          switch (eventSource.readyState) {
            case EventSource.CONNECTING:
              console.error('SSE failed to connect. Possible causes: CORS, network, or server unavailable');
              console.error('URL:', eventSource.url);
              setIsStreaming(false);
              setIsChatLoading(false);
              setIsSyncing(false); // Reset syncing state on connection error
              setSyncProgress(0); // Reset sync progress
              break;

            case EventSource.OPEN:
              console.error('SSE error while connected:', error);
              setIsStreaming(false);
              setIsChatLoading(false);
              setIsSyncing(false); // Reset syncing state on error
              setSyncProgress(0); // Reset sync progress
              break;

            case EventSource.CLOSED:
              // Check if we already received the done signal
              if (currentStreamingResponse.current?.done) {
                // This is expected - connection closed after successful completion
              } else {
                // This is an actual error - connection closed before completion
                console.error('SSE connection closed unexpectedly');
                setIsStreaming(false);
                setIsChatLoading(false);
                setIsSyncing(false); // Reset syncing state on unexpected close
                setSyncProgress(0); // Reset sync progress
              }
              break;
          }

          // Clean up
          currentEventSource.current = null;
          if (eventSource.readyState !== EventSource.CLOSED) {
            eventSource.close();
          }
        };
      }
    } catch (error) {
      console.error('Failed to sync project:', error);
      setIsStreaming(false);
      setIsChatLoading(false);
      setIsSyncing(false); // Reset syncing state on error
      setSyncProgress(0); // Reset sync progress
    }
  }, [project.initial_query, project.name, project.project_id, project.files, isStreaming, setIsStreaming, setMessages, setStreamingResponse, setLatestStreamResult, setShowWorkspace, mergeStreamingResponse, streamingAPI, latestStreamResult, attachedFiles]);

  // Helper function to add a message to the chat
  const handleAddMessage = useCallback((message: ChatMessage) => {
    addMessageWithoutDuplicates(message);
  }, []);

  // Handle initial question and attachments from navigation state
  useEffect(() => {
    if (!project || hasInitialized.current) return; // Don't proceed if project is not available or already initialized

    const loadConversationData = async () => {
      const state = location.state as any;

      // If there's an initial question (from new project creation), add it as a new message
      if (state?.initialQuestion && state?.autoSubmitQuery && !hasInitialized.current) {
        // Only process auto-submit if we haven't initialized yet
        setIsLoadingConversation(false);
        hasInitialized.current = true;

        // For auto-submit queries, let handleSendMessage add the message and process it
        // Set a small delay to ensure the component is fully rendered
        setTimeout(() => {
          console.log("Conversation History onload", project.conversation_history);
          handleSendMessage(state.initialQuestion, state.initialAttachments || [], { hasConversation: project.conversation_history && project.conversation_history.length > 0 });
          // Clear the navigation state to prevent duplicate submissions on refresh
          window.history.replaceState({}, document.title);
        }, 100);
      } else {
        // For existing projects, load conversation history from conversations state
        // add missing convo for dummy prohects
        const shouldLoadHardcoded =
          project?.initial_query?.toLowerCase().includes('fab stablecoin') ||
          project?.initial_query?.toLowerCase().includes('uk market') ||
          project?.initial_query?.toLowerCase().includes('uk expansion');

        if (shouldLoadHardcoded && !project?.conversation_history?.length) {
          const conversation = {
            "entry_id": "e0c1d060-d0b2-407b-930a-81eaf8728bcd",
            "project_id": "ccb43748-4142-4611-bfdc-a9eaec5d1737",
            "timestamp": "2025-09-14T13:16:42.203748+04:00",
            "query": {
              "query_id": "84ace9a5-8823-48f9-a0be-597e1e9338bc",
              "query": project?.initial_query || "",
              "context": {
                "project_id": "ccb43748-4142-4611-bfdc-a9eaec5d1737",
                "is_followup": false,
                "query_type": "new_analysis",
                "partnership_focus": false,
                "include_project_files": true,
                "require_approval": true,
                "parent_entry_id": null,
                "run_full_analysis": true
              },
              "focus_areas": [],
              "timeframe": null,
              "user_id": null,
              "session_id": "ccb43748-4142-4611-bfdc-a9eaec5d1737",
              "debug": false
            },
            "query_id": "f4bf2b25-1b7f-4798-bc5f-d4fabcf45d13",
            "result": null,
            "is_followup": false,
            "parent_entry_id": null,
            "chat_messages": [
              {
                "entry_id": "e0c1d060-d0b2-407b-930a-81eaf8728bcd",
                "timestamp": "2025-09-14T13:17:16.924510+04:00",
                "message_type": "execution_plan" as const,
                "content": "EXECUTION_PLAN",
                "query_id": "f4bf2b25-1b7f-4798-bc5f-d4fabcf45d13",
                "metadata": {
                  "type": "execution_plan",
                  "executionPlan": "{\"summary\":[\"Market – market size, dynamics, competitive landscape, and growth opportunities\",\"Risk Analysis – comprehensive risk assessment covering regulatory compliance, operational risks, and risk mitigation strategies\",\"Competitors – competitive positioning, regulatory landscape, and compliance requirements\",\"Overview – comprehensive financial assessment synthesizing performance, profitability, and strategic insights\",\"Customer Insights – customer segments, behaviors, preferences, and sentiment analysis\",\"Technology – digital capabilities, innovation readiness, AI adoption, and emerging tech infrastructure\"],\"agents\":[\"Market Intelligence Analyst\",\"Risk Analyst\",\"Compliance Analyst\",\"Financial Analyst\",\"Customer Insights Analyst\",\"Technology Analyst\"],\"estimatedTime\":\"10-15 minutes\",\"requiresApproval\":true}",
                  "queryId": "f4bf2b25-1b7f-4798-bc5f-d4fabcf45d13"
                }
              },
            ]
          };
          project.conversation_history.push(conversation);
        }

        if (project.conversation_history && project.conversation_history.length > 0) {
          const chatMessages = convertConversationToMessages(project.conversation_history);
          addMessageWithoutDuplicates(chatMessages);

          // Get the last entry in conversation history
          let lastEntryWithResult: ConversationEntry | null = null;

          for (let i = project.conversation_history.length - 1; i >= 0; i--) {
            const entry = project.conversation_history[i];
            if (entry.result && entry.result.sections) {
              lastEntryWithResult = entry;
              break;
            }
          }

          if (!lastEntryWithResult) {
            lastEntryWithResult = project.conversation_history[project.conversation_history.length - 1];
          }

          // Check if last entry has a result, if not find the last entry with result
          let targetEntry: ConversationEntry | null = null;

          if (lastEntryWithResult || shouldLoadHardcoded) {
            // Check if the last entry has result, if not try to fetch it
            try {
              // Fetch the full result using the query_id
              const fullResult = await streamingAPI.fetchQueryFullResult(lastEntryWithResult.query_id,  project?.initial_query || "");

              // For completed queries, set hasUserApproved to true since they must have been approved
              if (fullResult.status === 'completed' && fullResult.executionPlan) {
                setHasUserApproved(true);
              }

              // Reset status for loading of previous messages pending_approval triggers showing of "Proceed" button
              if (fullResult.status === 'pending_approval') {
                fullResult.status = 'rejected';
              }

              // Set the fetched result
              setLatestStreamResult(fullResult);
              setStreamingResponse(fullResult);
              if (fullResult?.structured_response) {
                setShowWorkspace(true);
              }
              targetEntry = null; // We've handled it, no need to process further


              // Convert the result to StreamingQueryResponse format for the workspace
              const result = fullResult;
              const entryQueryId = lastEntryWithResult.query_id; // Store in local variable


              // Generate steps from agent_responses
              const steps: QueryStep[] = [];
              if (result.structured_response?.agent_responses) {
                Object.entries(result.structured_response.agent_responses).forEach(([agentName, agentResponse]: [string, any]) => {
                  steps.push({
                    stepId: `${entryQueryId}-${agentName}`,
                    agent: agentName,
                    status: agentResponse.status === 'completed' ? 'completed' :
                      agentResponse.status === 'failed' ? 'failed' :
                        agentResponse.status === 'processing' ? 'processing' : 'pending',
                    action: agentResponse.analysis ?
                      `Analyzed: ${agentResponse.analysis.substring(0, 100)}...` :
                      `${agentName} analysis completed`,
                    reasoning: agentResponse.result?.analysis || agentResponse.analysis,
                    result: agentResponse.result || agentResponse
                  });
                });
              }

              const assistantContent = formatCompletedMessage(result);

              if (!assistantContent) return;

              const aiResponseId = `${entryQueryId}-response`;
              const aiResponse: ChatMessage = {
                id: aiResponseId,
                role: 'assistant' as const,
                content: assistantContent,
                timestamp: fullResult?.endTime || new Date().toISOString(),
                metadata: { is_result: true }
              };

              // Only add if there is no other message with the same id
              setMessages(prev => {
                const existingMessage = prev.find(msg => msg.id === aiResponseId);
                if (existingMessage) {
                  return prev; // Message already exists, don't add duplicate
                }
                return [...prev, aiResponse];
              });





            } catch (error) {
              console.error('Failed to fetch full result for last entry:', error);
            }
          }
        }
        setIsLoadingConversation(false);
        hasInitialized.current = true;
      }
    };

    loadConversationData();
  }, [location.state, project]);


  const allowedFileTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.csv', '.xls', '.xlsx', '.json'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json'
  ];

  const isValidFile = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedFileTypes.includes(fileExtension) || allowedMimeTypes.includes(file.type);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(isValidFile);
    const newFiles = validFiles.filter(file =>
      !attachedFiles.some(existingFile =>
        existingFile.name === file.name &&
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified
      )
    );

    if (newFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }

    const invalidCount = files.length - validFiles.length;
    const duplicateCount = validFiles.length - newFiles.length;

    if (invalidCount > 0 || duplicateCount > 0) {
      let message = '';
      if (invalidCount > 0) {
        message += `${invalidCount} file(s) were not added. Only PDF, DOC, DOCX, PPT, PPTX, CSV, XLS, XLSX, and JSON files are allowed.`;
      }
      if (duplicateCount > 0) {
        if (message) message += ' ';
        message += `${duplicateCount} duplicate file(s) were skipped.`;
      }
      console.warn(message);
    }
  };


  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.csv,.xls,.xlsx,.json';

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      addFiles(files);
    };

    input.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files = items
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length > 0) {
      addFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };


  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (currentEventSource.current) {
        currentEventSource.current.close();
      }
    };
  }, []);


  if (isLoadingConversation) {
    return (
      <main className="dashboard-workspace-view">
        <div className="projects-loading">
          <SpinningLoader size="large" text="Loading conversation..." />
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-workspace-view">
      {/* Left Chat Panel */}
      <ChatPanel
        key={project.project_id} // Force re-render when project changes
        messages={messages}
        onSendMessage={handleSendMessage}
        onFileSelect={handleFileSelect}
        onFileRemove={removeFile}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        isDragOver={isDragOver}
        attachedFiles={attachedFiles}
        className={!showWorkspace ? 'full-width' : ''}
        isStreaming={isStreaming}
        isChatLoading={isChatLoading}
        streamingResponse={streamingResponse}
        showWorkspace={showWorkspace}
        isFollowUpQuery={isCurrentQueryFollowUp}
        projectName={project.name}
        isUploadingFiles={isUploadingFiles}
        uploadingMessageId={uploadingMessageId}
        uploadProgress={uploadProgress}
        hasUserApproved={hasUserApproved}
      />

      {/* Right Content Panel */}
      {showWorkspace && (
        <WorkspaceContent
          project={project}
          streamResult={isStreaming ? streamingResponse : latestStreamResult}
          isStreaming={isStreaming}
          isFollowUpQuery={isCurrentQueryFollowUp}
          onSyncProject={handleSyncProject}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
        />
      )}

      {/* Error Toast */}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
        duration={6000}
      />
    </main>
  );
};

export default DashboardWorkspaceView;