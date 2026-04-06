'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Check, Trash2, Plus, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

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
      // Optimistic update
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
      await api.put(`/todo/${id}`, { completed: !currentStatus });
    } catch (err) {
      // Revert on error
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

  if (loading) return <div className="text-sm text-slate-500 animate-pulse p-4">Loading your tasks...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Your Tasks</h2>
        <div className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
          {todos.filter(t => !t.completed).length} pending
        </div>
      </div>
      
      <div className="p-5">
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-sm px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700"
          />
          <button 
            type="submit" 
            disabled={!title.trim()}
            className="p-2 aspect-square bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5 mx-auto" />
          </button>
        </form>

        <div className="space-y-2">
          <AnimatePresence>
            {todos.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-8 text-slate-400 text-sm"
              >
                No tasks yet. You're all caught up!
              </motion.div>
            ) : (
              todos.map(todo => (
                <motion.div 
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    todo.completed 
                      ? 'bg-slate-50 border-transparent' 
                      : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                  
                  <button 
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      todo.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 bg-white hover:border-indigo-500'
                    }`}
                  >
                    {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  
                  <span className={`flex-1 text-sm font-medium transition-colors ${
                    todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}>
                    {todo.title}
                  </span>
                  
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
