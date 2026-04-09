import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Check, Trash2, Plus, GripVertical, ListTodo, Edit2, Copy, Layers, Save, X } from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todo');
      setTodos(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await api.post('/todo', { title });
      setTodos([res.data.data, ...todos]);
      setTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
      await api.put(`/todo/${id}`, { completed: !currentStatus });
    } catch (err) {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: currentStatus } : t));
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      setTodos(todos.filter(t => t.id !== id));
      await api.delete(`/todo/${id}`);
    } catch (err) {
      fetchTodos();
      console.error(err);
    }
  };

  const handleDuplicate = async (todo) => {
    try {
      const res = await api.post('/todo', { title: `${todo.title} (Copy)` });
      setTodos([res.data.data, ...todos]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditValue(todo.title);
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) return setEditingId(null);
    try {
      setTodos(todos.map(t => t.id === id ? { ...t, title: editValue } : t));
      await api.put(`/todo/${id}`, { title: editValue });
      setEditingId(null);
    } catch (err) {
      fetchTodos();
      setEditingId(null);
    }
  };

  const handleClearAll = async () => {
    if (todos.length === 0) return;
    if (!confirm('Hapus semua tugas?')) return;
    try {
      setTodos([]);
      await api.delete('/todo/clear-all');
    } catch (err) {
      fetchTodos();
      console.error(err);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
    </div>
  );

  return (
    <div className="bg-card rounded-none md:rounded-[2.5rem] overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border bg-muted/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Daily Sprint</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">Workspace / Personal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handleClearAll}
             className="p-2.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all group"
             title="Hapus Semua"
           >
             <Trash2 className="w-5 h-5" />
           </button>
           <div className="font-black text-[10px] uppercase bg-primary text-white px-3 py-1.5 rounded-lg shadow-lg shadow-primary/20">
             {todos.filter(t => !t.completed).length}
           </div>
        </div>
      </div>
      
      <div className="px-5 md:px-12 py-8 space-y-8">
        <form onSubmit={addTodo} className="relative group">
          <input 
            type="text" 
            placeholder="Ada tugas apa hari ini?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 bg-muted border border-border rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm pr-16"
          />
          <button 
            type="submit" 
            disabled={!title.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:bg-primary-600 disabled:opacity-30 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5 mx-auto" />
          </button>
        </form>

        <div 
          className="max-h-[550px] overflow-y-auto pr-2 custom-scrollbar" 
          style={{ scrollbarGutter: 'stable' }}
        >
          <Reorder.Group 
            axis="y" 
            values={todos} 
            onReorder={setTodos} 
            className="flex flex-col gap-4"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {todos.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-center py-12 px-6 bg-muted/10 rounded-3xl border border-dashed border-border"
                >
                  <p className="text-sm font-bold text-muted-foreground opacity-50 uppercase tracking-widest">Chill Day! No tasks found.</p>
                </motion.div>
              ) : (
                todos.map(todo => <TodoItem key={todo.id} todo={todo} todos={todos} setTodos={setTodos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} handleDuplicate={handleDuplicate} handleCopy={handleCopy} startEditing={startEditing} editingId={editingId} setEditingId={setEditingId} editValue={editValue} setEditValue={setEditValue} saveEdit={saveEdit} />)
              )}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo, todos, setTodos, toggleTodo, deleteTodo, handleDuplicate, handleCopy, startEditing, editingId, setEditingId, editValue, setEditValue, saveEdit }) {
  const controls = useDragControls();
  const [showActions, setShowActions] = useState(false);
  const timerRef = useState(null);

  const handleStart = (e) => {
    if (e.pointerType === 'mouse') return;
    const timer = setTimeout(() => {
      setShowActions(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
    timerRef[1](timer);
  };

  const handleEnd = () => {
    if (timerRef[0]) clearTimeout(timerRef[0]);
  };

  return (
    <Reorder.Item 
      value={todo}
      dragListener={false}
      dragControls={controls}
      layout
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      whileDrag={{ 
        scale: 1.02,
        zIndex: 50,
        boxShadow: "0 30px 60px -12px rgb(0 0 0 / 0.4)"
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 1
      }}
      className={`relative group flex items-center gap-4 p-4 md:p-5 rounded-2xl border transition-colors select-none cursor-default ${
        todo.completed 
          ? 'bg-muted/10 border-transparent opacity-60' 
          : 'bg-card border-border shadow-md hover:border-primary/40'
      }`}
      onContextMenu={(e) => {
        if (window.innerWidth < 768) {
          e.preventDefault();
          setShowActions(true);
        }
      }}
    >
      <div 
        className="flex flex-row items-center gap-4 shrink-0 max-[450px]:flex-col max-[450px]:gap-3"
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
      >
        <div 
          onPointerDown={(e) => {
            e.stopPropagation();
            controls.start(e);
          }}
          style={{ touchAction: 'none' }}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-all p-2 bg-muted/50 rounded-lg shrink-0"
        >
          <GripVertical className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleTodo(todo.id, todo.completed);
          }}
          className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
            todo.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-border bg-background hover:border-primary'
          }`}
        >
          {todo.completed && <Check className="w-4 h-4 stroke-[4]" />}
        </button>
      </div>
      
      <div className="flex-1 min-w-0"
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
      >
        {editingId === todo.id ? (
          <input 
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => saveEdit(todo.id)}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
            className="w-full bg-background border border-primary/30 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        ) : (
          <span className={`block text-sm md:text-base font-bold transition-all break-words leading-relaxed ${
            todo.completed ? 'text-muted-foreground/60 line-through decoration-emerald-500/50' : 'text-foreground'
          }`}>
            {todo.title}
          </span>
        )}
      </div>

      <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionButton icon={Copy} label="Copy" onClick={() => handleCopy(todo.title)} />
        <ActionButton icon={Layers} label="Duplicate" onClick={() => handleDuplicate(todo)} />
        <ActionButton icon={Edit2} label="Edit" onClick={() => startEditing(todo)} />
        <ActionButton icon={Trash2} label="Delete" color="hover:text-rose-500 hover:bg-rose-500/10" onClick={() => deleteTodo(todo.id)} />
      </div>

      {/* Mobile Actions Overlay - Simplified and Smaller */}
      <AnimatePresence>
        {showActions && (
          <div className="contents md:hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
              className="fixed inset-0 z-[100] bg-black/40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-4 right-4 bottom-10 z-[110] flex items-center justify-between gap-2 bg-card border border-border p-3 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-2">
                <MobileAction icon={Copy} label="Copy" onClick={() => handleCopy(todo.title)} onClose={() => setShowActions(false)} />
                <MobileAction icon={Layers} label="Dupe" onClick={() => handleDuplicate(todo)} onClose={() => setShowActions(false)} />
                <MobileAction icon={Edit2} label="Edit" onClick={() => startEditing(todo)} onClose={() => setShowActions(false)} />
                <MobileAction icon={Trash2} label="Del" color="text-rose-500" onClick={() => deleteTodo(todo.id)} onClose={() => setShowActions(false)} />
              </div>
              <div className="w-px h-8 bg-border mx-1 shrink-0" />
              <button onClick={() => setShowActions(false)} className="p-2.5 bg-muted rounded-xl transition-active:scale-90"><X className="w-5 h-5" /></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

function ActionButton({ icon: Icon, onClick, color = "hover:text-primary hover:bg-primary/5" }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={`p-2 text-muted-foreground rounded-lg transition-all ${color}`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}

function MobileAction({ icon: Icon, label, onClick, onClose, color = "text-muted-foreground" }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); onClose(); }} className="flex flex-col items-center gap-1">
      <div className={`p-2.5 bg-muted rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-tight opacity-50">{label}</span>
    </button>
  );
}
