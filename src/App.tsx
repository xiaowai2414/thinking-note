import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Zap, 
  BookOpen, 
  Target, 
  Cpu, 
  Send, 
  ArrowRight, 
  Layers,
  ChevronRight,
  Hash,
  Link as LinkIcon,
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, Project, NoteType, SparringResponse } from './types';
import { INITIAL_NOTES, INITIAL_PROJECTS } from './constants';
import { getSocraticFeedback } from './services/geminiService';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(INITIAL_NOTES[0].id);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSparring, setIsSparring] = useState(false);
  const [sparringResult, setSparringResult] = useState<SparringResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [globalInsight, setGlobalInsight] = useState<string | null>(null);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId) || null
  , [notes, activeNoteId]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (activeProjectId) {
      result = result.filter(n => n.projectId === activeProjectId);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, activeProjectId, searchQuery]);

  const handleCreateNote = (type: NoteType = 'flash') => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: '新灵感',
      content: '',
      type,
      projectId: activeProjectId || undefined,
      tags: [],
      links: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      distilledLevel: 0
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleForgeInsights = async () => {
    setIsForging(true);
    setGlobalInsight(null);
    try {
      const permanentNotes = notes.filter(n => n.type === 'permanent');
      const context = permanentNotes.map(n => n.content).join('\n');
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `分析以下笔记，提炼出一条跨越所有内容的“宏观洞见”。必须深刻、有建设性，且使用简体中文。
      内容：
      ${context}`;
      
      const result = await model.generateContent(prompt);
      setGlobalInsight(result.response.text());
    } catch (err) {
      setGlobalInsight("锻造失败：需要更多高价值的永久笔记作为原材料。");
    } finally {
      setIsForging(false);
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    ));
    // Clear sparring if content changes significantly
    if (updates.content) setSparringResult(null);
  };

  const startSparring = async () => {
    if (!activeNote || !activeNote.content) return;
    setIsSparring(true);
    setSparringResult(null);
    try {
      const context = notes
        .filter(n => n.id !== activeNote.id && n.projectId === activeNote.projectId)
        .map(n => `${n.title}: ${n.content}`)
        .join('\n');
      
      const result = await getSocraticFeedback(activeNote.content, context);
      setSparringResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSparring(false);
    }
  };

  return (
    <div className="flex h-screen bg-brand-white text-brand-black font-sans selection:bg-brand-orange selection:text-white">
      {/* Sidebar: Projects & PARA Navigation */}
      <aside className="w-64 border-r border-brand-black bg-white flex flex-col">
        <div className="p-6 border-b border-brand-black">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-4 h-4 bg-brand-orange rounded-full" />
            <h1 className="font-black text-xl tracking-tighter uppercase text-brand-black">Thought.OS</h1>
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => setActiveProjectId(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${!activeProjectId ? 'bg-brand-black text-white' : 'text-gray-500 hover:text-brand-orange'}`}
            >
              <Zap size={14} /> 收件箱
            </button>
            <button 
              onClick={() => setShowManual(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-brand-orange transition-colors"
            >
              <BookOpen size={14} /> 操作手册
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-8">
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">项目使命</span>
              <button className="text-gray-400 hover:text-black transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map(project => (
                <button 
                  key={project.id}
                  onClick={() => setActiveProjectId(project.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${activeProjectId === project.id ? 'bg-brand-orange text-white' : 'text-gray-600 hover:text-brand-black'}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
             <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2 block">系统</span>
             <div className="space-y-1">
               <button 
                 onClick={() => {
                   const ids = notes.map(n => `Ref: ${n.id}`).join(' -> ');
                   alert(`思想网络 (简略版): \n${ids}\n\n未来将支持可视化拓扑图。`);
                 }}
                 className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-brand-black transition-colors"
               >
                 <LinkIcon size={16} /> 关系图谱
               </button>
               <button 
                 onClick={handleForgeInsights}
                 className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-brand-black transition-colors"
               >
                 <Sparkles size={16} className={isForging ? "animate-pulse text-brand-orange" : ""} /> 洞见锻造
               </button>
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-brand-black bg-brand-white">
           <button 
            onClick={() => handleCreateNote()}
            className="w-full h-10 flex items-center justify-center gap-2 border border-brand-black text-brand-black text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-brand-black hover:text-white transition-all active:scale-95"
           >
             <Plus size={16} /> 新增捕获
           </button>
        </div>
      </aside>

      {/* Note List: The Archive */}
      <div className="w-80 border-r border-brand-black bg-white flex flex-col">
        <div className="p-4 border-b border-brand-black">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="搜索档案库..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-brand-beige border border-transparent focus:border-brand-black rounded-full text-[10px] font-bold tracking-widest outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full p-6 border-b border-gray-100 text-left transition-all relative ${activeNoteId === note.id ? 'bg-brand-beige' : 'hover:bg-brand-white'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border ${
                  note.type === 'permanent' ? 'border-brand-black bg-brand-black text-white' : 
                  'border-brand-black bg-transparent text-brand-black'
                }`}>
                  {note.type}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className={`font-black text-sm mb-1 uppercase tracking-tight ${activeNoteId === note.id ? 'text-brand-orange' : 'text-brand-black'}`}>
                {note.title || '无标题记录'}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-serif italic">
                {note.content || '等待转译...'}
              </p>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <BookOpen className="mx-auto mb-3 opacity-20" size={32} />
              <p className="text-[10px] font-bold uppercase tracking-widest">No thoughts matched.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Stage: The Forge */}
      <main className="flex-1 bg-white flex flex-col relative min-w-0">
        <AnimatePresence mode="wait">
          {activeNote ? (
            <motion.div 
              key={activeNote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              <header className="p-10 flex items-end justify-between border-b border-brand-black bg-white">
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-[11px] font-black text-brand-orange uppercase tracking-[0.3em] mb-4">// {projects.find(p => p.id === activeNote.projectId)?.name || '未分类收件箱'}</p>
                  <input 
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                    className="w-full text-6xl font-black tracking-tighter uppercase border-none p-0 outline-none focus:ring-0 placeholder-gray-100 leading-none"
                    placeholder="输入标题"
                  />
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button 
                    onClick={startSparring}
                    disabled={isSparring || !activeNote.content}
                    className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                      isSparring 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-brand-orange text-white hover:scale-110 shadow-xl shadow-brand-orange/20 active:scale-95'
                    }`}
                  >
                    {isSparring ? <Cpu className="animate-spin" size={24} /> : <Zap size={24} />}
                  </button>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-black">苏格拉底对垒</span>
                </div>
              </header>

              <div className="flex-1 flex flex-col overflow-hidden px-10 py-12 bg-brand-white">
                <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
                  <textarea 
                    value={activeNote.content}
                    onChange={(e) => handleUpdateNote(activeNote.id, { content: e.target.value })}
                    className="flex-1 text-2xl leading-relaxed text-brand-black border-none outline-none focus:ring-0 resize-none font-serif font-light placeholder-gray-200 bg-transparent"
                    placeholder="思考留痕不是目的，“进攻型” 动机才是驱动力。用你自己的话翻译外部世界..."
                  />
                </div>
                
                <div className="py-8 flex flex-wrap gap-4 items-center border-t border-brand-black mt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-orange rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest">认知权重</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">蒸馏层级: </span>
                     <div className="flex gap-1">
                        {[1, 2, 3].map(lvl => (
                          <div key={lvl} className={`w-3 h-1 rounded-full ${activeNote.distilledLevel >= lvl ? 'bg-brand-black' : 'bg-gray-100'}`} />
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
               {globalInsight ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="max-w-xl p-12 bg-brand-beige border border-brand-black text-center relative"
                 >
                   <div className="absolute top-4 left-4 text-xs font-black uppercase tracking-widest text-brand-orange">// 系统宏观洞见</div>
                   <p className="text-3xl font-serif leading-relaxed text-brand-black underline decoration-brand-orange decoration-4 underline-offset-8">
                     {globalInsight}
                   </p>
                   <button 
                    onClick={() => setGlobalInsight(null)}
                    className="mt-12 text-[10px] font-black uppercase tracking-widest py-2 px-6 border border-brand-black rounded-full hover:bg-brand-black hover:text-white transition-all"
                   >
                     明白，继续探索
                   </button>
                 </motion.div>
               ) : (
                 <>
                  <Target size={48} className="mb-4 opacity-10" />
                  <p className="text-sm font-medium">从档案库中选择思想，或点击“新增捕获”记录灵感。</p>
                 </>
               )}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Right Sidebar: The Sparring Deck */}
      <aside className="w-[400px] border-l border-brand-black bg-brand-beige overflow-y-auto">
        <div className="p-8 border-b border-brand-black bg-white">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-between">
            <span>工程化分析</span>
            <span className="text-brand-orange">苏格拉底模式</span>
          </h2>
        </div>

        <div className="p-8">
          {!sparringResult && !isSparring && (
            <div className="space-y-12">
               <section>
                 <span className="text-[40px] font-serif font-black mr-4 leading-none text-brand-black">01.</span>
                 <h4 className="font-black text-xl mb-2 uppercase tracking-tight">逻辑完整性</h4>
                 <p className="text-sm text-gray-500 leading-relaxed italic font-serif">系统已就绪，等待输入以进行漏洞探测...</p>
               </section>
               <section>
                 <span className="text-[40px] font-serif font-black mr-4 leading-none text-brand-black">02.</span>
                 <h4 className="font-black text-xl mb-2 uppercase tracking-tight">反向论证</h4>
                 <p className="text-sm text-gray-500 leading-relaxed italic font-serif">我们将构建“钢铁侠”式的反面论证，以增强你的认知韧性。</p>
               </section>
            </div>
          )}

          {isSparring && (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-24 bg-white border border-brand-black opacity-50 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {sparringResult && (
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-2 mb-6">
                   <span className="bg-brand-orange text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest">探测到逻辑漏洞</span>
                </div>
                <div className="space-y-4">
                  {sparringResult.logicalHoles.map((hole, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="p-6 bg-white border border-brand-black text-sm text-brand-black leading-relaxed font-serif shadow-[4px_4px_0px_#1A1A1A]"
                    >
                      {hole}
                    </motion.div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">// 对立观点 (反面证论)</h3>
                <div className="space-y-4">
                  {sparringResult.counterPoints.map((point, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      key={i} 
                      className="p-6 bg-brand-black text-white text-sm leading-relaxed font-serif italic"
                    >
                      {point}
                    </motion.div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">// 跨学科联想</h3>
                <div className="flex flex-wrap gap-2">
                  {sparringResult.crossLinks.map((link, i) => (
                    <span key={i} className="text-[10px] font-bold py-2 px-3 bg-white text-brand-black border border-brand-black rounded-lg uppercase tracking-tight">
                      {link}
                    </span>
                  ))}
                </div>
              </section>

              <section className="pt-10 border-t border-brand-black">
                <div className="relative p-8 bg-brand-orange text-white overflow-hidden text-center">
                   <div className="absolute top-4 right-4 text-6xl font-serif opacity-30 leading-none">“</div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 border-b border-white/30 pb-2">苏格拉底之问</h3>
                   <p className="text-2xl font-serif font-black leading-tight">
                     {sparringResult.socraticQuestion}
                   </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>

      {/* Manual Overlay */}
      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-black/90 z-50 flex items-center justify-center p-10 cursor-pointer"
            onClick={() => setShowManual(false)}
          >
             <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-brand-white w-full max-w-4xl p-12 overflow-y-auto max-h-[80vh] relative cursor-default"
                onClick={e => e.stopPropagation()}
             >
                <button 
                  onClick={() => setShowManual(false)}
                  className="absolute top-6 right-6 text-brand-black hover:text-brand-orange transition-colors"
                >
                  <Plus className="rotate-45" size={32} />
                </button>

                <div className="flex items-center gap-4 mb-12">
                   <div className="w-6 h-6 bg-brand-orange rounded-full" />
                   <h2 className="text-4xl font-black uppercase tracking-tighter">ThoughtLab 操作指南</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-4">Core Philosophy / 核心哲学</h3>
                    <p className="text-sm leading-relaxed font-serif italic text-gray-600 mb-6">
                      “不要为了记忆而记录，要为了创造而记录。”
                    </p>
                    <ul className="space-y-4 text-sm font-medium">
                       <li className="flex gap-3">
                         <span className="text-brand-orange">01.</span>
                         <div>
                            <span className="font-bold">认知外包：</span>
                            让大脑负责处理，让系统负责存储。
                         </div>
                       </li>
                       <li className="flex gap-3">
                         <span className="text-brand-orange">02.</span>
                         <div>
                            <span className="font-bold">知识复利：</span>
                            笔记是预制件，通过链接实现指数级增长。
                         </div>
                       </li>
                       <li className="flex gap-3">
                         <span className="text-brand-orange">03.</span>
                         <div>
                            <span className="font-bold">翻译即内化：</span>
                            禁止搬运原文。用自己的话转述。
                         </div>
                       </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-4">System Workflow / 工作流</h3>
                    <div className="space-y-6">
                      <div className="p-4 bg-brand-beige border-l-4 border-brand-black shadow-sm">
                        <h4 className="font-bold text-xs uppercase mb-1">C.O.D.E 流程</h4>
                        <p className="text-[11px] text-gray-500">Capture (捕获), Organize (组织), Distill (蒸馏), Express (表达)。</p>
                      </div>
                      <div className="p-4 bg-brand-beige border-l-4 border-brand-black shadow-sm">
                        <h4 className="font-bold text-xs uppercase mb-1">AI 协同</h4>
                        <p className="text-[11px] text-gray-500">点击橙色 ZAP 按钮，AI 会对当前笔记进行逻辑审计、提供对立观点、建立跨学科链接并提出苏格拉底之问。</p>
                      </div>
                      <div className="p-4 bg-brand-beige border-l-4 border-brand-black shadow-sm">
                        <h4 className="font-bold text-xs uppercase mb-1">笔记类型</h4>
                        <p className="text-[11px] text-gray-500"><span className="font-bold">Flash:</span> 瞬时灵感；<span className="font-bold">Literature:</span> 读书笔记；<span className="font-bold">Permanent:</span> 深度内化后的永久思想。</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-12 p-6 border border-brand-black text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest leading-loose">
                    进攻性记录 / 拒绝知识囤积 / 2024 THOUGHTLAB v1.0
                  </p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
