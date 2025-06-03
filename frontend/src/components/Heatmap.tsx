import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function Heatmap(
  { onFeatureClick }: { onFeatureClick?: (featureName: string) => void } = {}
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { featureMatrix, featureNames, keys, selectedKeys, selectedFeature, setSelectedFeature, colorMap} = useStore();

  const cellSize = 20;
  const gap = 2;
  const labelHeight = 130;
  const labelWidth = 210;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || featureMatrix.length === 0 || featureNames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  const selectedRows = selectedKeys.length > 0
      ? selectedKeys
          .map(key => {
            const index = keys.indexOf(key);
            return featureMatrix[index];
          })
          .filter((row): row is number[] => !!row)
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
      const y = 0;
      
      ctx.save();
      ctx.translate(x, y);      
      ctx.rotate(-Math.PI / 2); // Rotate 90° counter-clockwise
      ctx.fillStyle = 'black';
      ctx.font = label === selectedFeature ? 'bold 13px sans-serif' : '13px sans-serif';
      ctx.fillText(label, -130, 0);
      ctx.restore();
    }

    // family code labels
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < rows; i++) {
      const label = selectedKeys.length > 0 ? selectedKeys[i] : keys[i];
      const x = 105;
      const y = i * cellSize + labelHeight + cellSize / 2;
      ctx.fillStyle = 'black';
      ctx.fillText(label, x, y);
    }
  }, [featureMatrix, featureNames, keys, selectedKeys, selectedFeature]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || featureNames.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const adjustedClickX: number = clickX - 105; // Adjust for label width
    // Check if click is within label area
    if (clickY > labelHeight) return;

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
        clickY >= rotatedBox.y &&
        clickY <= rotatedBox.y + rotatedBox.height
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
      style={{ marginTop: 16 }}
    />
  );
}
