import { create } from 'zustand';

interface State {
  umapEmbedding: number[][];
  featureMatrix: number[][];
  featureNames: string[];
  selectedIndices: number[];
  selectedIndicator: number;
  selectedFeature: string;
  keys: string[];
  selectedKeys: string[];
  colorMap: Record<number, string>;
  legendItems: { label: string; color: string; value: number }[];
  isLoading: boolean;
  tooltipData: Record<string, string>;
  setSelectedIndicator: (i: number) => void;
  setEmbedding: (e: number[][]) => void;
  setFeatureMatrix: (f: number[][]) => void;
  setSelectedIndices: (s: number[]) => void;
  setFeatureNames: (n: string[]) => void;
  setSelectedKeys: (k: string[]) => void;
  setKeys: (k: string[]) => void;
  setSelectedFeature: (f: string) => void;
  setIsLoading: (loading: boolean) => void;
  setTooltipData: (data: Record<string, string>) => void;
}

export const useStore = create<State>((set) => ({
  isLoading: true,
  umapEmbedding: [],
  featureMatrix: [],
  featureNames: [],
  selectedIndices: [],
  keys: [],
  selectedKeys: [],
  selectedFeature: '',
  colorMap: {
    1: '#984ea3',
    2: '#dbdb1d',
    3: '#4daf4a',
  },
  legendItems: [
    { label: 'Not recorded', color: '#bdbdbd', value: 0 },
    { label: 'Good', color: '#4daf4a', value: 3 },
    { label: 'Needs Improvement', color: '#dbdb1d', value: 2 },
    { label: 'Bad', color: '#984ea3', value: 1 },
  ],
  tooltipData: {},
  selectedIndicator: -1,
  setSelectedIndicator: (i) => set({ selectedIndicator: i }),
  setTooltipData: (data) => set({ tooltipData: data }),
  setKeys: (k) => set({ keys: k }),
  setSelectedKeys: (k) => set({ selectedKeys: k }),
  setEmbedding: (e) => set({ umapEmbedding: e }),
  setFeatureMatrix: (f) => set({ featureMatrix: f }),
  setSelectedIndices: (s) => set({ selectedIndices: s }),
  setSelectedFeature: (f) => set({ selectedFeature: f }),
  setFeatureNames: (n) => set({ featureNames: n }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
