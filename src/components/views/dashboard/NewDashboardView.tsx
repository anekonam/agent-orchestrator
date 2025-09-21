import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExampleCard from '../../cards/ExampleCard';
import SendMessageInput from '../../ui/SendMessageInput';
import InvalidFileDialog from '../../modals/InvalidFileDialog';
import { Project } from '../../../types/project';

interface NewDashboardViewProps {
  project?: Project;
  isCreating: boolean;
  onBack: () => void;
  onSave?: (project: Partial<Project>) => void;
  onCreateWithQuestion?: (question: string, attachedFiles: File[]) => Promise<void>;
}

const NewDashboardView: React.FC<NewDashboardViewProps> = ({ project, isCreating, onBack, onSave, onCreateWithQuestion }) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showInvalidFileDialog, setShowInvalidFileDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const exampleQuestions = [
    {
      icon: '/fab-illustrations/illustration_light_bulb_270.svg',
      title: "How could FAB stablecoin capture market share?"
    },
    {
      icon: '/fab-illustrations/illustration_investigating_270.svg',
      title: "Can UK expansion unlock SME banking opportunities for Fab?"
    },
    {
      icon: '/fab-illustrations/illustration_investment_270.svg',
      title: "What's the ROI potential for entering sustainable finance products?"
    }
  ];

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
    const invalidFiles = files.filter(file => !isValidFile(file));
    
    // Show invalid file dialog if there are invalid files
    if (invalidFiles.length > 0) {
      setShowInvalidFileDialog(true);
      return; // Don't add any files if there are invalid ones
    }
    
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
    
    const duplicateCount = validFiles.length - newFiles.length;
    
    if (duplicateCount > 0) {
      console.warn(`${duplicateCount} duplicate file(s) were skipped.`);
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

  const handleQuestionSubmit = async () => {
    if (question.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        if (isCreating && onCreateWithQuestion) {
          // For new projects, create the project with the initial question
          await onCreateWithQuestion(question, attachedFiles);
        } else if (project) {
          // Navigate to chat view for existing project
          navigate(`/dashboard/project/${project.project_id}`, { 
            state: { 
              initialQuestion: question, 
              initialAttachments: attachedFiles 
            } 
          });
        }
      } catch (error) {
        console.error('Error creating project:', error);
        // Handle error - could show a toast notification or error message
      } finally {
        setIsSubmitting(false);
      }
    }
  };


  return (
    <main className="dashboard-content">
      <header className="dashboard-header">
        <div className="header-top">
          <div className="breadcrumb">
            <h1 className="main-title">
              {isCreating ? 'Create New Project' : (project?.name || 'Project')}
            </h1>
          </div>
        </div>
      </header>

      <section className="project-hero-section">
        <div className="hero-content">
          <div 
            className={`drag-drop-area ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
          >
            <h2 className="hero-title">What's your focus today?</h2>
            <p className="hero-subtitle">Ask any question to get real-time strategic insights</p>
            
            <SendMessageInput
              value={question}
              onChange={setQuestion}
              onSubmit={handleQuestionSubmit}
              placeholder='Type a strategic question to get started'
              attachedFiles={attachedFiles}
              onFileSelect={handleFileSelect}
              onFileRemove={removeFile}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onPaste={handlePaste}
              isDragOver={isDragOver}
              variant="default"
              disabled={isSubmitting}
            />
          </div>

          <div className="examples-section">
            <h3 className="examples-title">PROJECT EXAMPLES</h3>
            <div className="examples-grid">
              {exampleQuestions.map((example, index) => (
                <ExampleCard
                  key={index}
                  icon={example.icon}
                  title={example.title}
                  onClick={() => setQuestion(example.title)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Invalid File Dialog */}
      <InvalidFileDialog 
        isOpen={showInvalidFileDialog}
        onClose={() => setShowInvalidFileDialog(false)}
      />
    </main>
  );
};

export default NewDashboardView;