export type NoteType = 'flash' | 'literature' | 'permanent';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  projectId?: string;
  tags: string[];
  links: string[]; // IDs of related notes
  createdAt: number;
  updatedAt: number;
  distilledLevel: number; // 0, 1, 2, 3 (Increasing distillation)
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'someday';
  color: string;
}

export interface SparringResponse {
  logicalHoles: string[];
  counterPoints: string[];
  crossLinks: string[];
  socraticQuestion: string;
}
