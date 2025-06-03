import { create } from 'zustand';

interface State {
  umapEmbedding: number[][];
  featureMatrix: number[][];
  featureNames: string[];
  selectedIndices: number[];
  selectedFeature: string;
  keys: string[];
  selectedKeys: string[];
  setEmbedding: (e: number[][]) => void;
  setFeatureMatrix: (f: number[][]) => void;
  setSelectedIndices: (s: number[]) => void;
  setFeatureNames: (n: string[]) => void;
  setSelectedKeys: (k: string[]) => void;
  setKeys: (k: string[]) => void;
  setSelectedFeature: (f: string) => void;
}

export const useStore = create<State>((set, get) => ({
  umapEmbedding: [],
  featureMatrix: [],
  featureNames: [],
  selectedIndices: [],
  keys: [],
  selectedKeys: [],
  selectedFeature: '',
  setKeys: (k) => set({ keys: k }),
  setSelectedKeys: (k) => set({ selectedKeys: k }),
  setEmbedding: (e) => set({ umapEmbedding: e }),
  setFeatureMatrix: (f) => set({ featureMatrix: f }),
  setSelectedIndices: (s) => set({ selectedIndices: s }),
  setSelectedFeature: (f) => set({ selectedFeature: f }),
  setFeatureNames: (n) => set({ featureNames: n }),
}));
