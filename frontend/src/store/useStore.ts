import { create } from 'zustand';

interface State {
  umapEmbedding: number[][];
  featureMatrix: number[][];
  featureNames: string[];
  selectedIndices: number[];
  selectedFeature: string;
  keys: string[];
  selectedKeys: string[];
  colorMap: Record<number, string>;
  selectedLevel: string | null;
  setSelectedLevel: (l: string | null) => void;
  setEmbedding: (e: number[][]) => void;
  setFeatureMatrix: (f: number[][]) => void;
  setSelectedIndices: (s: number[]) => void;
  setFeatureNames: (n: string[]) => void;
  setSelectedKeys: (k: string[]) => void;
  setKeys: (k: string[]) => void;
  setSelectedFeature: (f: string) => void;
}

export const useStore = create<State>((set) => ({
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
  selectedLevel: null,
  setSelectedLevel: (l) => set({ selectedLevel: l }),
  setKeys: (k) => set({ keys: k }),
  setSelectedKeys: (k) => set({ selectedKeys: k }),
  setEmbedding: (e) => set({ umapEmbedding: e }),
  setFeatureMatrix: (f) => set({ featureMatrix: f }),
  setSelectedIndices: (s) => set({ selectedIndices: s }),
  setSelectedFeature: (f) => set({ selectedFeature: f }),
  setFeatureNames: (n) => set({ featureNames: n }),
}));
