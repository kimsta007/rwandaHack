import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';

const featureGroups = [
  { name: 'Income & Employment', features: ['income', 'savings', 'credit', 'bankServices', 'debt', 'budget', 'employabilityReadiness',
    'stableIncome', 'identification']},
  { name: 'Health & Environment', features: ['environment', 'garbage', 'water', 'healthServices', 'mentalHealthServices', 'nutritiousDiet',
    'foodAccess', 'physicalActivity', 'addiction', 'householdViolence', 'hygiene', 'sexualHealth', 'healthyTeeth', 'healthyVision',
  'vaccines', 'insurance']},  
  { name: 'Housing & Infrastructure', features: ['stableHousing', 'safeHouse', 'enoughSpace', 'kitchen', 'bathroom', 'appliances',
    'phone', 'clothing', 'safety', 'securityOfProperty', 'electricity', 'transportation']},
  { name: 'Education and Culture', features: ['schooling', 'literacy', 'incarceration', 'generateIncome', 'internet', 'entertainment',
    'discrimination', 'community']},
  { name: 'O & P', features: ['closeRelationships', 'civicEngagement', 'resolveProblems'] },
  { name: 'Interiority & Motivation', features: ['selfEfficacy', 'selfConfidence', 'emotionalWellBeing', 'emotionalIntelligence',
    'spiritualWellBeing', 'agency', 'continuousLearning']},
];

export function Heatmap({ onGroupFeatureClick, onHover, family, searchValue }: {
  onGroupFeatureClick?: (groupName: string[]) => void;
  onHover?: (family: { familyCode: string; surveyNumber: string } | null) => void;
  family?: { familyCode: string; surveyNumber: string } | null;
  searchValue: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data, featureNames, selectedIndices, selectedFeature, 
    setSelectedFeature, colorMap, setIsLoading, selectedGroup, setSelectedGroup } = useStore();
  
  const cellSize = 20;
  const gap = 2;
  const labelHeight = 180;
  const labelWidth = 400;
  const groupLabelHeight = 30;
  const dateLabelWidth = 100;

  const selectedRows = useMemo(() => {
    return (
      family 
        ? data.filter(row => row.familyCode === family.familyCode)
        : selectedIndices.length > 0 
          ? selectedIndices.map(i => data[i])
          : data
    ).filter(row => {
      if (!searchValue) return true;
      const keywords = searchValue
        .split(',')
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean); 
      return keywords.some((keyword) =>
        row.tooltip.toLowerCase().includes(keyword)
      );
    });
  }, [data, family, selectedIndices, searchValue]);

  const groupBoxes = useMemo(() => {
    return featureGroups
      .map(group => {
        const groupFeatureIndices = group.features
          .map(f => featureNames.indexOf(f))
          .filter(i => i !== -1);
        
        if (groupFeatureIndices.length === 0) return null;

        const firstCol = Math.min(...groupFeatureIndices);
        const lastCol = Math.max(...groupFeatureIndices);
        const groupWidth = (lastCol - firstCol + 1) * cellSize;
        const groupX = firstCol * cellSize + labelWidth / 2;
        const groupY = labelHeight - groupLabelHeight;
        
        return {
          label: group.name,
          features: group.features,
          x: groupX,
          y: groupY,
          width: groupWidth,
          height: groupLabelHeight,
        };
      })
      .filter(Boolean) as {
        label: string;
        features: string[];
        x: number;
        y: number;
        width: number;
        height: number;
      }[];
  }, [featureNames, selectedGroup]);

  const groupBoxesRef = useRef(groupBoxes);
  useEffect(() => {
    groupBoxesRef.current = groupBoxes;
  }, [groupBoxes]);

  useEffect(() => {
    const rows = selectedRows.length;
    const cols = featureNames.length;
    const bodyWidth = cols * cellSize + labelWidth + dateLabelWidth;
    const bodyHeight = rows * cellSize;
    const headerWidth = bodyWidth;

    const headerCanvas = headerCanvasRef.current;
    if (!headerCanvas) return;
    const headerCtx = headerCanvas.getContext('2d');
    if (!headerCtx) return;

    headerCanvas.width = headerWidth;
    headerCanvas.height = labelHeight;
    headerCtx.clearRect(0, 0, headerCanvas.width, headerCanvas.height);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = bodyWidth;
    canvas.height = bodyHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap cells 
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = selectedRows[i].features[featureNames[j]];
        const color = colorMap[value] || '#bdbdbd';
        ctx.fillStyle = color;
        ctx.fillRect(
          j * cellSize + gap + labelWidth / 2,
          i * cellSize + gap / 2, 
          cellSize - gap, 
          cellSize - gap
        );
      }
    }

    // Draw indicator labels 
    headerCtx.font = '13px sans-serif';
    headerCtx.textAlign = 'left';
    headerCtx.textBaseline = 'middle';

    for (let j = 0; j < cols; j++) {
      const label = featureNames[j];
      const x = j * cellSize + cellSize + (labelWidth - 20) / 2;
      const y = -35;
      
      headerCtx.save();
      headerCtx.translate(x, y);
      headerCtx.rotate(-Math.PI / 2);
      headerCtx.font = (label === selectedFeature) ? 'bold 13px sans-serif' : '13px sans-serif';
      headerCtx.fillStyle = 'black';
      headerCtx.fillText(label, -labelHeight, 0);
      headerCtx.restore();
    }

    // Group boxes
    headerCtx.font = 'bold 12px sans-serif';
    headerCtx.textAlign = 'center';
    headerCtx.textBaseline = 'top';
    headerCtx.fillStyle = 'black';
    for (const box of groupBoxes) {
      if (selectedGroup === box.label) {
        headerCtx.fillStyle = 'black'; 
        headerCtx.fillRect(box.x, box.y, box.width, box.height - 5);
        headerCtx.fillStyle = 'white';
      }

      headerCtx.lineWidth = 1;
      headerCtx.strokeRect(box.x, box.y, box.width, box.height - 5);
      headerCtx.fillText(box.label, box.x + box.width / 2, box.y + 5);
      headerCtx.fillStyle = 'black';
    }

    // Family code labels 
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < rows; i++) {
      const label = selectedRows[i].familyCode;
      const x = labelWidth / 2;
      const y = i * cellSize + cellSize / 2;
      ctx.fillStyle = 'black';
      ctx.fillText(label, x, y);
    }

    // Draw surveyDate
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < rows; i++) {
      const label = selectedRows[i].surveyDate;
      const x = labelWidth / 2 + cols * cellSize + 10; 
      const y = i * cellSize + cellSize / 2;
      ctx.fillStyle = 'black';
      ctx.fillText(label, x, y);
    }

    // Draw symbols 
    for (let i = 0; i < rows; i++) {
      const row = selectedRows[i];
      if (!row.tooltip) continue;

      row.tooltip.split('>>').forEach(item => {
        const parts = item.split('|');
        const symbolValue = Number(parts[0]?.trim());
        const indicatorParts = parts[1]?.split(':')[1]?.split('$$');
        if (!indicatorParts || indicatorParts.length < 2) return;

        const feature = indicatorParts[1].trim();
        const colIndex = featureNames.indexOf(feature);
        if (colIndex === -1) return;

        const heatmapValue = row.features[feature];
        if (heatmapValue !== symbolValue) return;

        const x = colIndex * cellSize + gap + labelWidth / 2 + cellSize / 2;
        const y = i * cellSize + gap / 2 + cellSize / 2;

        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';
        ctx.lineWidth = 2;

        switch (symbolValue) {
          case 1: ctx.beginPath(); ctx.arc(x, y, 6, 0, 2 * Math.PI); ctx.stroke(); break;
          case 3: ctx.beginPath(); ctx.rect(x - 5, y - 5, 10, 10); ctx.stroke(); break;
          case 2:
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
      });
    }
  }, [selectedRows, featureNames, selectedFeature, colorMap, selectedGroup, groupBoxes, selectedIndices]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    
    const rawX = e.clientX - containerRect.left;
    const rawY = e.clientY - containerRect.top + scrollTop;

    const mx = rawX - labelWidth / 2;
    const my = rawY;

    if (mx < 0 || my < 0) {
      onHover?.(null);
      return;
    }

    const row = Math.floor(my / cellSize);

    if (row >= 0 && row < selectedRows.length) {
      const hoveredRow = selectedRows[row];
      onHover?.({ familyCode: hoveredRow.familyCode, surveyNumber: hoveredRow.surveyNumber });
    } else {
      onHover?.(null);
    }
  }, [selectedRows, onHover]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const headerCanvas = headerCanvasRef.current;
    if (!headerCanvas) return;

    const headerRect = headerCanvas.getBoundingClientRect();
    const clickX = e.clientX - headerRect.left;
    const clickY = e.clientY - headerRect.top;

    // Check selected dimension
    for (const box of groupBoxesRef.current) {
      if (
        clickX >= box.x &&
        clickX <= box.x + box.width &&
        clickY >= box.y &&
        clickY <= box.y + box.height
      ) {
        onGroupFeatureClick?.(box.features);
        setSelectedGroup(box.label);
        setIsLoading(true);
        setSelectedFeature(box.features[0]);
        return;
      }
    }

    //Check selected feature
    if (clickY > labelHeight - 40) return;

    for (let j = 0; j < featureNames.length; j++) {
      const x = j * cellSize + cellSize + (labelWidth - 20) / 2;
      const rotatedBox = { x: x - 10, y: 0, width: 20, height: labelHeight };

      if (
        clickX >= rotatedBox.x &&
        clickX <= rotatedBox.x + rotatedBox.width &&
        clickY >= rotatedBox.y &&
        clickY <= rotatedBox.y + rotatedBox.height
      ) {
        const featureName = featureNames[j];
        const selectedGroupBox = groupBoxesRef.current.find(box => box.label === selectedGroup);
        if (selectedGroup && selectedGroupBox && !selectedGroupBox.features.includes(featureName)) {
          return;
        }
        setSelectedFeature(featureName);
        break;
      }
    }
  }, [featureNames, selectedGroup, onGroupFeatureClick, setIsLoading, setSelectedFeature]);

  return (
    <div style={{ 
      position: 'relative', 
      marginTop: 5,
      width: '100%',
      overflowX: 'auto'
    }}>
      {/* Fix header */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          left: 0,
          zIndex: 2,
          backgroundColor: 'white',
          pointerEvents: 'auto',
          width: 'fit-content'
        }}
        onClick={handleClick}
      >
        <canvas
          ref={headerCanvasRef}
          style={{ display: 'block' }}
        />
      </div>
      
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
          overflowY: 'auto',
          height: '74vh',
          position: 'relative',
          zIndex: 1,
          width: 'fit-content'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}

export default React.memo(Heatmap);