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
    <div className="bg-card rounded-[2.5rem] overflow-hidden">
      <div className="p-8 border-b border-border bg-muted/20 flex justify-between items-center">
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
             {todos.filter(t => !t.completed).length} Tasks Left
           </div>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        <form onSubmit={addTodo} className="relative group">
          <input 
            type="text" 
            placeholder="Ada tugas apa hari ini?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm pr-16"
          />
          <button 
            type="submit" 
            disabled={!title.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:bg-primary-600 disabled:opacity-30 transition-all active:scale-90"
          >
            <Plus className="w-5 h-5 mx-auto" />
          </button>
        </form>

        <div className="max-h-[460px] overflow-y-auto px-6 pb-6 custom-scrollbar">
          <Reorder.Group 
            axis="y" 
            values={todos} 
            onReorder={setTodos} 
            className="flex flex-col gap-4"
          >
            <AnimatePresence mode="popLayout">
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

  return (
    <Reorder.Item 
      value={todo}
      dragListener={false}
      dragControls={controls}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileDrag={{ 
        scale: 1.02,
        zIndex: 50,
        boxShadow: "0 20px 40px -10px rgb(0 0 0 / 0.2)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 30,
        mass: 0.5
      }}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-colors cursor-default ${
        todo.completed 
          ? 'bg-muted/30 border-transparent opacity-60' 
          : 'bg-card border-border shadow-md hover:border-primary/50'
      }`}
    >
      <div 
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors p-1"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <button 
        onClick={() => toggleTodo(todo.id, todo.completed)}
        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
          todo.completed 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'border-border bg-background hover:border-primary'
        }`}
      >
        {todo.completed && <Check className="w-4 h-4 stroke-[4]" />}
      </button>
      
      {editingId === todo.id ? (
        <div className="flex-1 flex items-center gap-2">
          <input 
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => saveEdit(todo.id)}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
            className="flex-1 bg-background border border-primary/30 rounded-lg px-3 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button onClick={() => saveEdit(todo.id)} className="text-emerald-500 hover:scale-110 transition-transform"><Save className="w-4 h-4" /></button>
          <button onClick={() => setEditingId(null)} className="text-rose-500 hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <span className={`flex-1 text-sm font-bold transition-all break-all whitespace-pre-wrap ${
          todo.completed ? 'text-muted-foreground line-through decoration-emerald-500/50' : 'text-foreground'
        }`}>
          {todo.title}
        </span>
      )}
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => handleCopy(todo.title)}
          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          title="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDuplicate(todo)}
          className="p-2 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
          title="Duplicate"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button 
          onClick={() => startEditing(todo)}
          className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => deleteTodo(todo.id)}
          className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}
