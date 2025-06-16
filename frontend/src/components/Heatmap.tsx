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

export function Heatmap({ onFeatureClick, onHover, family, searchValue }: {
  onFeatureClick?: (featureName: string) => void;
  onHover?: (family: { familyCode: string; surveyNumber: string } | null) => void;
  family?: { familyCode: string; surveyNumber: string } | null;
  searchValue: string;
}) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data, featureNames, selectedIndices, selectedKeys, selectedFeature, setSelectedFeature, colorMap } = useStore();

  const cellSize = 20;
  const gap = 2;
  const labelHeight = 180;
  const labelWidth = 400;
  const groupLabelHeight = 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || featureNames.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const selectedRows = (
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

    const rows = selectedRows.length;
    const cols = featureNames.length;
    const width = cols * cellSize + labelWidth;
    const height = rows * cellSize + labelHeight;

    canvas.width = width;
    canvas.height = height;

    // Draw heatmap cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = selectedRows[i].features[featureNames[j]];
        const color = colorMap[value] || '#bdbdbd';
        ctx.fillStyle = color;
        ctx.fillRect(j * cellSize + gap + labelWidth / 2, i * cellSize + labelHeight + gap / 2, cellSize - gap, cellSize - gap);
      }
    }

    // Draw indicator labels
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let j = 0; j < cols; j++) {
      const label = featureNames[j];
      const x = j * cellSize + cellSize + (labelWidth - 20) / 2;
      const y = -35;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 2);
      ctx.font = (label === selectedFeature) ? 'bold 13px sans-serif' : '13px sans-serif';
      ctx.fillStyle = 'black';
      ctx.fillText(label, -labelHeight, 0);
      ctx.restore();
    }

    // Group boxes
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';

    for (const group of featureGroups) {
      const groupFeatureIndices = group.features.map(f => featureNames.indexOf(f)).filter(i => i !== -1);
      if (groupFeatureIndices.length === 0) continue;

      const firstCol = Math.min(...groupFeatureIndices);
      const lastCol = Math.max(...groupFeatureIndices);
      const groupWidth = (lastCol - firstCol + 1) * cellSize;
      const groupX = firstCol * cellSize + labelWidth / 2;

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.strokeRect(groupX, labelHeight - groupLabelHeight, groupWidth, groupLabelHeight - 5);
      ctx.fillText(group.name, groupX + groupWidth / 2, labelHeight - groupLabelHeight + 5);
    }

    // Family code labels
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < rows; i++) {
      const label = selectedRows[i].familyCode;
      const x = labelWidth / 2;
      const y = i * cellSize + labelHeight + cellSize / 2;
      ctx.fillStyle = 'black';
      ctx.fillText(label, x, y);
    }

    // Draw symbols from tooltip
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
        const y = i * cellSize + labelHeight + gap / 2 + cellSize / 2;

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

  }, [data, selectedKeys, selectedFeature, family, selectedIndices, featureNames, searchValue]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const rawX = e.clientX - rect.left;
  const rawY = e.clientY - rect.top;

  const mx = rawX - labelWidth / 2;
  const my = rawY - labelHeight;

  if (mx < 0 || my < 0) {
    onHover?.(null);
    return;
  }

  const selectedRows = (
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

  const row = Math.floor(my / cellSize);
  const col = Math.floor(mx / cellSize);

  if (row >= 0 && row < selectedRows.length) {
    const hoveredRow = selectedRows[row];
    onHover?.({ familyCode: hoveredRow.familyCode, surveyNumber: hoveredRow.surveyNumber });
  } else {
    onHover?.(null);
  }
};
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const adjustedClickX = clickX - labelWidth / 2;
    const adjustedClickY = clickY - 40;

    if (clickY > labelHeight - 40) return;

    for (let j = 0; j < featureNames.length; j++) {
      const x = j * cellSize + cellSize / 2;
      const rotatedBox = { x: x - 10, y: 0, width: 20, height: labelHeight };

      if (
        adjustedClickX >= rotatedBox.x &&
        adjustedClickX <= rotatedBox.x + rotatedBox.width &&
        adjustedClickY >= rotatedBox.y &&
        adjustedClickY <= rotatedBox.y + rotatedBox.height
      ) {
        const featureName = featureNames[j];
        onFeatureClick?.(featureName);
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
