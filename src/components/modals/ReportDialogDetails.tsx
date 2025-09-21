import React from 'react';
import Modal from '../ui/Modal';
import ChartVisualization from '../charts/ChartVisualization';
import SourcesList from '../ui/SourcesList';
import './ReportDialogDetails.css';

interface ReportDialogDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  graphData: any;
  sourceImages: string[];
}

const ReportDialogDetails: React.FC<ReportDialogDetailsProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  graphData,
  sourceImages,
}) => {

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      closeOnOverlayClick={true}
      maxWidth="800px"
      className="report-dialog-modal"
    >
      <div className="report-dialog-details">
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          {subtitle && <p className="dialog-subtitle">{subtitle}</p>}
        </div>

        <div className="dialog-chart">
          <ChartVisualization chart={graphData} />
        </div>

        <div className="dialog-sources">
          <SourcesList
            sources={sourceImages}
            maxVisible={5}
            imageSize="medium"
          />
        </div>

        <div className="dialog-insights">
          <div className="insight-section">
            <h3 className="insight-title">Insights</h3>
            <p className="insight-content">{graphData.insights}</p>
            <br />
            <div className="impact-container">
              <h3 className="insight-title">Impact</h3>
              <p className="insight-content">{graphData.impact}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportDialogDetails;