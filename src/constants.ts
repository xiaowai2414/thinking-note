import { Note, Project } from "./types";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '知识操作系统战略',
    description: '构建极致的思维加速系统。',
    status: 'active',
    color: '#34d399'
  },
  {
    id: 'p2',
    name: 'AI哲学',
    description: '探索人类认知与机器学习的交叉点。',
    status: 'active',
    color: '#60a5fa'
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    title: '进攻型笔记法',
    content: '不要为了记忆而记录。要为了建设和创造而记录。笔记是未来建筑的预制模块。',
    type: 'permanent',
    projectId: 'p1',
    tags: ['战略', '哲学'],
    links: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    distilledLevel: 2
  },
  {
    id: 'n2',
    title: 'AI代理困境',
    content: '让AI帮你总结就像雇人替你举重。总结的过程正是突触连接发生的地方。',
    type: 'literature',
    projectId: 'p2',
    tags: ['ai', '理论'],
    links: ['n1'],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    distilledLevel: 1
  }
];
