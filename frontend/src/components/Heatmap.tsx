import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const featureGroups = [
  { name: 'Income & Employment', features: ['income', 'savings', 'credit', 'bankServices', 'debt', 'employabilityReadiness',
    'stableIncome', 'identification']},
  { name: 'Health & Environment', features: ['environment', 'garbage', 'water', 'healthServices', 'mentalHealthServices', 'nutritiousDiet',
    'foodAccess', 'physicalActivity', 'addiction', 'householdViolence', 'hygiene', 'sexualHealth', 'healthyTeeth', 'healthyVision',
  'vaccines', 'insurance']},  
  { name: 'Housing & Infrastructure', features: ['stableHousing', 'safeHouse', 'enoughSpace', 'kitchen', 'bathroom', 'appliances',
    'phone', 'clothing', 'safety', 'secutityOfProperty', 'electricity', 'transportation']},
  { name: 'Education and Culture', features: ['schooling', 'literacy', 'incarceration', 'generateIncome', 'internet', 'entertainment',
    'discrimination', 'community']},
  { name: 'O & P', features: ['closeRelationships', 'civicEngagement', 'resolveProblems'] },
  { name: 'Interiority & Motivation', features: ['selfEfficacy', 'selfConfidence', 'emotionalWellBeing', 'emotionalIntelligence',
    'spiritualWellBeing', 'agency', 'continuousLearning']},
];

export function Heatmap({
  onFeatureClick,
  onHover,
  familyCode,
}: {
  onFeatureClick?: (featureName: string) => void;
  onHover?: (key: string | null) => void;
  familyCode?: string | null;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { featureMatrix, featureNames, keys, selectedIndices, selectedKeys, selectedFeature, 
            setSelectedFeature, colorMap, tooltipData} = useStore();

  const cellSize = 20;
  const gap = 2;
  const labelHeight = 180;
  const labelWidth = 400;
  const groupLabelHeight = 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || featureMatrix.length === 0 || featureNames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const selectedRows = selectedIndices.length > 0
    ? selectedIndices
        .map(i => featureMatrix[i])
        .filter((row): row is number[] => !!row)
    : familyCode
      ? [featureMatrix[keys.indexOf(familyCode)]]
      : featureMatrix;

    const rows = selectedRows.length;
    const cols = featureNames.length;
    const width = cols * cellSize + labelWidth;
    const height = rows * cellSize + labelHeight;

    canvas.width = width;
    canvas.height = height;

    // Draw heatmap cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = selectedRows[i][j];
        const color = colorMap[value] || '#bdbdbd';  
        ctx.fillStyle = color;
        ctx.fillRect(j * cellSize + gap + labelWidth / 2, i * cellSize + labelHeight + gap / 2, cellSize - gap, cellSize - gap);
      }
    }

    // Indicator labels
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let j = 0; j < cols; j++) {
      const label = featureNames[j];
      const x = j * cellSize + cellSize + (labelWidth - 20) / 2;
      const y = -35;
      
      ctx.save();
      ctx.translate(x, y);      
      ctx.rotate(-Math.PI / 2); // Rotate 90° counter-clockwise
      ctx.fillStyle = 'black';
      ctx.font = '13px sans-serif';
      ctx.fillText(label, -labelHeight, 0);

      //Strike text if selected
      if (label === selectedFeature) {
        const textWidth = ctx.measureText(label).width;
        const offsetX = -labelHeight; 
        const offsetY = 25;    

        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY - 25);
        ctx.lineTo(offsetX + textWidth, offsetY - 25);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'black';
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw group labels and boxes
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';

    for (const group of featureGroups) {
      // Find the indices of features in this group
      const groupFeatureIndices = group.features
        .map(f => featureNames.indexOf(f))
        .filter(i => i !== -1);
      
      if (groupFeatureIndices.length === 0) continue;

      const firstCol = Math.min(...groupFeatureIndices);
      const lastCol = Math.max(...groupFeatureIndices);
      
      const groupWidth = (lastCol - firstCol + 1) * cellSize;
      const groupX = firstCol * cellSize + labelWidth / 2;
      
      // Draw group box
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        groupX,
        labelHeight - groupLabelHeight,
        groupWidth,
        groupLabelHeight - 5
      );
      
      // Draw group name
      ctx.fillText(
        group.name,
        groupX + groupWidth / 2,
        labelHeight - groupLabelHeight + 5
      );
    }

    // Cater for brushing over a family on the scatter plot
    const selectedRowKeys = selectedKeys.length > 0 ? selectedKeys : familyCode ? [familyCode] : keys;

    // family code labels
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < rows; i++) {;
      const label = selectedRowKeys[i];
      const x = labelWidth / 2;
      const y = i * cellSize + labelHeight + cellSize / 2;
      ctx.fillStyle = 'black';
      ctx.fillText(label, x, y);
    }
    
    //Overlay symbols
    Object.keys(tooltipData.familyCode).forEach((index: string) => {
      const tooltip = tooltipData.tooltip[Number(index)];
      const family = tooltipData.familyCode[Number(index)];
  
      if (!tooltip || !family) return;
      tooltip.split('>>').map((text) => {
        const tooltipText = text.split('|');
        const symbolValue = Number(tooltipText[0]?.trim());
        const feature = tooltipText[1]?.split(':')[1]?.split('$$')[1]?.trim();
        const rowIndex = selectedRowKeys.indexOf(family);
        const colIndex = featureNames.indexOf(feature);

        const row = selectedIndices.length > 0
          ? featureMatrix[selectedIndices[rowIndex]]
          : featureMatrix[keys.indexOf(family)];

        if (row && rowIndex !== -1 && colIndex !== -1) {
          const x = colIndex * cellSize + gap + labelWidth / 2 + cellSize / 2;
          const y = rowIndex * cellSize + labelHeight + gap / 2 + cellSize / 2;
        
          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'black';
          ctx.lineWidth = 2;

          switch (symbolValue) {
            case 1: // Circle
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI);
              ctx.stroke();
              break;

            case 3: // Square
              ctx.beginPath();
              ctx.rect(x - 5, y - 5, 10, 10);
              ctx.stroke();
              break;

            case 2: // Triangle
              ctx.beginPath();
              ctx.moveTo(x, y - 6);
              ctx.lineTo(x + 6, y + 6);
              ctx.lineTo(x - 6, y + 6);
              ctx.closePath();
              ctx.stroke();
              break;

            default:
              ctx.beginPath();
              ctx.moveTo(x - 6, y);
              ctx.lineTo(x + 6, y);
              ctx.stroke();
          }
        }
      });
    });
  }, [selectedKeys, selectedFeature, familyCode, selectedIndices]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - labelWidth / 2; 
      const my = e.clientY - rect.top - labelHeight;

      const row = Math.floor(my / cellSize);
      const col = Math.floor(mx / cellSize);

      const rows = selectedKeys.length > 0 ? selectedKeys.length : featureMatrix.length;
      const cols = featureNames.length;

      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        const familyCode = selectedKeys.length > 0 ? selectedKeys[row] : keys[row];
        onHover?.(familyCode);
      } else {
        onHover?.(null);
      }
    };
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || featureNames.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const adjustedClickX: number = clickX - labelWidth / 2; // Adjust for label width
    const adjustedClickY: number = clickY - 40;

    // Check if click is within label area
    if (clickY > labelHeight - 40) return;

    for (let j = 0; j < featureNames.length; j++) {
      const x = j * cellSize + cellSize / 2;
      const rotatedBox = {
        x: x - 10,
        y: 0,
        width: 20,
        height: labelHeight,
      };

      // Approximate bounding box for rotated label
      if (
        adjustedClickX >= rotatedBox.x &&
        adjustedClickX <= rotatedBox.x + rotatedBox.width &&
        adjustedClickY >= rotatedBox.y &&
        adjustedClickY <= rotatedBox.y + rotatedBox.height
      ) {
        const featureName = featureNames[j];
        if (onFeatureClick) onFeatureClick(featureName);
        setSelectedFeature(featureName);
        break;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{ marginTop: 16 }}
    />
  );
}
