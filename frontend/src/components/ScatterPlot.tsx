import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store/useStore';

export function ScatterPlot() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { umapEmbedding, setSelectedIndices, keys, setSelectedKeys, selectedKeys, selectedIndices, colorMap, featureMatrix, featureNames } = useStore();

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);

  const [isDragging, setIsDragging] = useState(false);
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPan, setLastPan] = useState<[number, number] | null>(null);
  const [brushBox, setBrushBox] = useState<[number, number, number, number] | null>(null);
  const [isMovingBrush, setIsMovingBrush] = useState(false);
  const [moveStart, setMoveStart] = useState<[number, number] | null>(null);
  const index = featureNames.indexOf('income'); // Color dots by income

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || umapEmbedding.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const margin = 40;

    const xExtent = [
      Math.min(...umapEmbedding.map(d => d[0])) - 0.1,
      Math.max(...umapEmbedding.map(d => d[0])) + 0.1,
    ];
    const yExtent = [
      Math.min(...umapEmbedding.map(d => d[1])) - 0.1,
      Math.max(...umapEmbedding.map(d => d[1])) + 0.1,
    ];

    const scaleX = (x: number) =>
      ((x - xExtent[0]) / (xExtent[1] - xExtent[0])) * (width - 2 * margin) * scale + offset[0] + margin;
    const scaleY = (y: number) =>
      height - (((y - yExtent[0]) / (yExtent[1] - yExtent[0])) * (height - 2 * margin) * scale + offset[1] + margin);

    ctx.clearRect(0, 0, width, height);

    let newSelectedIndices: number[] = [];
    let newSelectedKeys: string[] = [];

    umapEmbedding.forEach(([x, y], i) => {
      const cx = scaleX(x);
      const cy = scaleY(y);

      const isInside = brushBox
        ? cx >= Math.min(brushBox[0], brushBox[2]) &&
          cx <= Math.max(brushBox[0], brushBox[2]) &&
          cy >= Math.min(brushBox[1], brushBox[3]) &&
          cy <= Math.max(brushBox[1], brushBox[3])
        : false;

      if (isInside) {
        newSelectedIndices.push(i);
        if (keys[i]) newSelectedKeys.push(keys[i]);
      }

      //ctx.fillStyle = isInside ? 'red' : 'steelblue';
      let color = '#3b3b3b'; // default
      if (index !== -1 && featureMatrix[i]) {
        const val = featureMatrix[i][index];
        color = colorMap[val] || '#999999';
      }
      ctx.fillStyle = color;
      
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    if (
      JSON.stringify(newSelectedIndices) !== JSON.stringify(selectedIndices) ||
      JSON.stringify(newSelectedKeys) !== JSON.stringify(selectedKeys)
    ) {
      setSelectedIndices(newSelectedIndices);
      setSelectedKeys(newSelectedKeys);
    }

    if (brushBox) {
      const [x1, y1, x2, y2] = brushBox;
      ctx.strokeStyle = 'black';
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
  }, [umapEmbedding, scale, offset, brushBox, keys, selectedIndices, selectedKeys, setSelectedIndices, setSelectedKeys]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (e.shiftKey) {
        setIsPanning(true);
        setLastPan([e.clientX, e.clientY]);
      } else if (brushBox && mx >= brushBox[0] && mx <= brushBox[2] && my >= brushBox[1] && my <= brushBox[3]) {
        setIsMovingBrush(true);
        setMoveStart([mx, my]);
      } else {
        setIsDragging(true);
        setStart([mx, my]);
        setEnd(null);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (isPanning && lastPan) {
        const dx = e.clientX - lastPan[0];
        const dy = e.clientY - lastPan[1];
        setOffset(([ox, oy]) => [ox + dx, oy + dy]);
        setLastPan([e.clientX, e.clientY]);
        draw();
      }

      if (isMovingBrush && moveStart && brushBox) {
        const dx = mx - moveStart[0];
        const dy = my - moveStart[1];
        const [x1, y1, x2, y2] = brushBox;
        setBrushBox([x1 + dx, y1 + dy, x2 + dx, y2 + dy]);
        setMoveStart([mx, my]);
        draw();
      }

      if (isDragging && start) {
        setEnd([mx, my]);
        draw();
      }
    };

    const handleMouseUp = () => {
      if (isDragging && start && end) {
        const [x1, y1] = start;
        const [x2, y2] = end;
        if (Math.abs(x2 - x1) < 3 && Math.abs(y2 - y1) < 3) {
          setBrushBox(null);
          setSelectedKeys([]);
          setSelectedIndices([]);
        } else {
          setBrushBox([Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)]);
        }
        draw();
      }

      setIsDragging(false);
      setIsPanning(false);
      setIsMovingBrush(false);
      setLastPan(null);
      setMoveStart(null);
      setStart(null);
      setEnd(null);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.05;
      const direction = e.deltaY < 0 ? 1 : -1;
      const newScale = Math.max(1, Math.min(5, scale * (direction > 0 ? zoomFactor : 1 / zoomFactor)));

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const dx = mx - offset[0];
      const dy = my - offset[1];

      setOffset([offset[0] - dx * (newScale / scale - 1), offset[1] - dy * (newScale / scale - 1)]);
      setScale(newScale);
      draw();
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
  }, [
    brushBox,
    start,
    end,
    isDragging,
    isPanning,
    lastPan,
    isMovingBrush,
    moveStart,
    offset,
    scale,
    keys,
    selectedIndices,
    selectedKeys,
    setSelectedIndices,
    setSelectedKeys,
    draw
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px solid #ccc',
        width: 800,
        height: 600,
        cursor: isPanning ? 'grabbing' : isDragging || isMovingBrush ? 'crosshair' : 'default'
      }}
    />
  );
}
