import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store/useStore';

export function ScatterPlot({ onHover, searchValue, heatmapHovered }: { 
  onHover?: (key: { familyCode: string; surveyNumber: string } | null) => void; 
  searchValue: string; 
  heatmapHovered: { familyCode: string; surveyNumber: string } | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    data,
    featureNames,
    selectedIndicator,
    selectedIndices,
    selectedKeys,
    setSelectedIndices,
    setSelectedKeys,
    setBrushBox,
    brushBox,
    colorMap,
    selectedFeature,
  } = useStore();

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMovingBrush, setIsMovingBrush] = useState(false);
  const [moveStart, setMoveStart] = useState<[number, number] | null>(null);
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPan, setLastPan] = useState<[number, number] | null>(null);

  const canvasWidth = 600;
  const canvasHeight = 450;
  const margin = 40;

  const xExtent = [
    Math.min(...data.map((d) => d.embedding[0])) - 0.1,
    Math.max(...data.map((d) => d.embedding[0])) + 0.1,
  ];
  const yExtent = [
    Math.min(...data.map((d) => d.embedding[1])) - 0.1,
    Math.max(...data.map((d) => d.embedding[1])) + 0.1,
  ];

  const scaleX = (x: number) =>
    ((x - xExtent[0]) / (xExtent[1] - xExtent[0])) * (canvasWidth - 2 * margin) * scale + offset[0] + margin;
  const scaleY = (y: number) =>
    canvasHeight - (((y - yExtent[0]) / (yExtent[1] - yExtent[0])) * (canvasHeight - 2 * margin) * scale + offset[1] + margin);

  const inverseScale = (px: number, py: number): [number, number] => {
    const x = ((px - margin - offset[0]) / ((canvasWidth - 2 * margin) * scale)) * (xExtent[1] - xExtent[0]) + xExtent[0];
    const y = ((canvasHeight - py - margin - offset[1]) / ((canvasHeight - 2 * margin) * scale)) * (yExtent[1] - yExtent[0]) + yExtent[0];
    return [x, y];
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const newSelectedIndices: number[] = [];
    const newSelectedKeys: { familyCode: string; surveyNumber: string }[] = [];

    data.forEach((row, i) => {
      const keywords = searchValue
      .split(',')
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0);

      const tooltipMatches = keywords.length === 0 || keywords.some(keyword => 
      row.tooltip.toLowerCase().includes(keyword)
    );

      const [x, y] = row.embedding;
      const cx = scaleX(x);
      const cy = scaleY(y);
      const val = row.features[selectedFeature || 'income'];
      const indicatorMatch = selectedIndicator === -1 || val === selectedIndicator;

      let inBrush = true;
      if (brushBox) {
        const [bx1, by1, bx2, by2] = brushBox;
        inBrush = x >= Math.min(bx1, bx2) && x <= Math.max(bx1, bx2)
               && y >= Math.min(by1, by2) && y <= Math.max(by1, by2);
      }

      if (indicatorMatch && inBrush) {
        newSelectedIndices.push(i);
        newSelectedKeys.push({ familyCode: row.familyCode, surveyNumber: row.surveyNumber });
      }

      let color = colorMap[val] || '#bdbdbd';

      const isHovered = heatmapHovered?.familyCode === row.familyCode;
      if (isHovered) return


      let opacity = indicatorMatch ? (tooltipMatches ? 1 : 0.1) : 0.1;

      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Refactor
    data.forEach((row, i) => {
      const [x, y] = row.embedding;
      const cx = scaleX(x);
      const cy = scaleY(y);
      const val = row.features[selectedFeature || 'income'];

      let color = colorMap[val] || '#bdbdbd';
      const isHovered = heatmapHovered?.familyCode === row.familyCode;
      if (!isHovered) return

      ctx.fillStyle = color;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black'; 
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    if (
      JSON.stringify(newSelectedIndices) !== JSON.stringify(selectedIndices)
    ) {
      setSelectedIndices(newSelectedIndices);
      setSelectedKeys(newSelectedKeys);
    }

    if (brushBox) {
      const [x1, y1, x2, y2] = brushBox;
      const px1 = scaleX(x1);
      const py1 = scaleY(y1);
      const px2 = scaleX(x2);
      const py2 = scaleY(y2);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(Math.min(px1, px2), Math.min(py1, py2), Math.abs(px2 - px1), Math.abs(py2 - py1));
    }
  }, [data, featureNames, brushBox, selectedIndicator, scale, offset, colorMap, selectedIndices, selectedKeys, searchValue, selectedFeature, heatmapHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    draw();
  }, [draw]);

  const handleMouseDown = (e: MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const [lx, ly] = inverseScale(mx, my);

    if (e.shiftKey) {
      setIsPanning(true);
      setLastPan([e.clientX, e.clientY]);
    } else if (brushBox) {
      const [x1, y1, x2, y2] = brushBox;
      const inside = lx >= Math.min(x1, x2) && lx <= Math.max(x1, x2) && ly >= Math.min(y1, y2) && ly <= Math.max(y1, y2);
      if (inside) {
        setIsMovingBrush(true);
        setMoveStart([lx, ly]);
      } else {
        setIsDragging(true);
        setStart([lx, ly]);
        setEnd(null);
      }
    } else {
      setIsDragging(true);
      setStart([lx, ly]);
      setEnd(null);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const [lx, ly] = inverseScale(mx, my);

    if (isPanning && lastPan) {
      const dx = e.clientX - lastPan[0];
      const dy = e.clientY - lastPan[1];
      setOffset(([ox, oy]) => [ox + dx, oy + dy]);
      setLastPan([e.clientX, e.clientY]);
      return;
    }

    if (isMovingBrush && moveStart && brushBox) {
      const dx = lx - moveStart[0];
      const dy = ly - moveStart[1];
      const [x1, y1, x2, y2] = brushBox;
      setBrushBox([x1 + dx, y1 + dy, x2 + dx, y2 + dy]);
      setMoveStart([lx, ly]);
      return;
    }

    if (isDragging && start) {
      setEnd([lx, ly]);
    }

    let foundKey: { familyCode: string; surveyNumber: string } | null = null;
    data.forEach(row => {
      const [x, y] = row.embedding;
      const cx = scaleX(x);
      const cy = scaleY(y);
      const dist = Math.hypot(mx - cx, my - cy);
      const indicator = row.features['income'];
      const isActive = selectedIndicator === -1 || indicator === selectedIndicator;
      if (dist < 6 && isActive) {
        foundKey = { familyCode: row.familyCode, surveyNumber: row.surveyNumber };
      }
    });

    canvasRef.current!.style.cursor = foundKey ? 'pointer' : 'crosshair';
    if (!isDragging && !isMovingBrush) onHover?.(foundKey);
  };

  const handleMouseUp = () => {
    if (isDragging && start && end) {
      const [x1, y1] = start;
      const [x2, y2] = end;
      if (Math.abs(x2 - x1) < 1e-5 && Math.abs(y2 - y1) < 1e-5) {
        setBrushBox(null);
      } else {
        setBrushBox([Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)]);
      }
    }
    setIsDragging(false);
    setIsMovingBrush(false);
    setMoveStart(null);
    setIsPanning(false);
    setLastPan(null);
    setStart(null);
    setEnd(null);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    const newScale = Math.max(1, Math.min(5, scale * (direction > 0 ? zoomFactor : 1 / zoomFactor)));

    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const dx = cx - offset[0];
    const dy = cy - offset[1];

    setOffset([offset[0] - dx * (newScale / scale - 1), offset[1] - dy * (newScale / scale - 1)]);
    setScale(newScale);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBrushBox(null);
        setSelectedKeys([]);
        setSelectedIndices([]);
        draw();
      } else if (e.key === 'r' || e.key === 'R') {
        setScale(1);
        setOffset([0, 0]);
        draw();
      }
    };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px solid #ccc',
        width: canvasWidth,
        height: canvasHeight,
        cursor: isPanning ? 'grabbing' : (isDragging || isMovingBrush) ? 'crosshair' : 'default',
      }}
    />
  );
}
