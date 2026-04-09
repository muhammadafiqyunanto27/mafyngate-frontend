'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  History, 
  Trash2, 
  Delete, 
  ChevronRight,
  Maximize2,
  Trash
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import * as math from 'mathjs';

export default function CalculatorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  
  const inputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const handleInput = (val) => {
    setExpression((prev) => prev + val);
    try {
      const res = math.evaluate(expression + val);
      if (res !== undefined && !isNaN(res)) setResult(res.toString());
      else setResult('');
    } catch { setResult(''); }
  };

  const calculate = () => {
    try {
      if (!expression) return;
      const res = math.evaluate(expression);
      if (res !== undefined) {
        setHistory(prev => [{ eq: expression, res: res.toString() }, ...prev].slice(0, 10));
        setExpression(res.toString());
        setResult('');
      }
    } catch (err) { setResult('Error'); }
  };

  const clear = () => {
    setExpression('');
    setResult('');
  };

  const backspace = () => {
    const sliced = expression.slice(0, -1);
    setExpression(sliced);
    if(!sliced) { setResult(''); return; }
    try {
      const res = math.evaluate(sliced);
      if (res !== undefined && !isNaN(res)) setResult(res.toString());
      else setResult('');
    } catch { setResult(''); }
  };

  const buttons = [
    // Scientific Row 1 (Mobile) / Left half Row 1 (Desktop)
    { label: 'sin', val: 'sin(' }, { label: 'cos', val: 'cos(' }, { label: 'tan', val: 'tan(' }, { label: 'π', val: 'pi' }, 
    // Scientific Row 2 (Mobile) / Right half Row 1 (Desktop)
    { label: 'e', val: 'e' }, { label: 'log', val: 'log10(' }, { label: 'ln', val: 'log(' }, { label: '√', val: 'sqrt(' },
    
    // Tools Row 3 (Mobile) / Left half Row 2 (Desktop)
    { label: '(', val: '(' }, { label: ')', val: ')' }, { label: '^', val: '^' }, { label: '%', val: '%' },
    // Tools Row 4 (Mobile) / Right half Row 2 (Desktop)
    { label: '!', val: '!' }, { label: 'AC', action: clear, type: 'danger' }, { label: 'DEL', action: backspace, type: 'danger' }, { label: '÷', val: '/' },
    
    // Numpad Row 5 (Mobile) / Left half Row 3 (Desktop)
    { label: '7', val: '7' }, { label: '8', val: '8' }, { label: '9', val: '9' }, { label: '×', val: '*' },
    // Numpad Row 6 (Mobile) / Right half Row 3 (Desktop)
    { label: '4', val: '4' }, { label: '5', val: '5' }, { label: '6', val: '6' }, { label: '−', val: '-' },
    
    // Numpad Row 7 (Mobile) / Left half Row 4 (Desktop)
    { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' }, { label: '+', val: '+' },
    // Numpad Row 8 (Mobile) / Right half Row 4 (Desktop)
    { label: 'mod', val: ' mod ' }, { label: '0', val: '0' }, { label: '.', val: '.' }, { label: '=', action: calculate, type: 'primary' },
  ];

  return (
    <DashboardLayout pageTitle="Advanced Calculator" fullWidth>
      <div className="h-[calc(100vh-4rem)] bg-card flex flex-col md:flex-row overflow-y-auto md:overflow-hidden custom-scrollbar">
        
        {/* History Area - Mobile (Bottom), Desktop (Left 1/4) */}
        {/* We use 'order-2 md:order-1' to put it at bottom on mobile, left on desktop */}
        <div className="w-full md:w-1/4 border-t md:border-t-0 md:border-r border-border flex flex-col bg-muted/10 min-w-[250px] order-2 md:order-1 shrink-0">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">History</h2>
              <button 
                onClick={() => setHistory([])}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto md:max-h-none max-h-[300px] px-4 pb-12 md:pb-6 space-y-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {history.length === 0 ? (
                <div className="text-center py-10 md:py-20 opacity-30">
                   <p className="text-[10px] font-black uppercase tracking-widest">Empty</p>
                </div>
              ) : (
                history.map((h, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => { setExpression(h.eq); setResult(h.res); }}
                    className="w-full text-left p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="text-[10px] font-mono text-muted-foreground truncate opacity-60 mb-1">{h.eq}</div>
                    <div className="text-base font-mono font-black text-foreground truncate">= {h.res}</div>
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Calculator Main Section - 3/4 Width, Full Bleed, order-1 (Top on mobile) */}
        <div className="flex-1 md:w-3/4 flex flex-col bg-card order-1 md:order-2">
          
          {/* 1. Display Area (Top) */}
          <div className="h-[150px] md:h-[20%] bg-muted/10 flex flex-col items-end justify-center px-6 md:px-10 py-4 border-b border-border shrink-0">
             <div className="w-full text-right text-muted-foreground font-mono text-base md:text-xl opacity-50 overflow-x-auto whitespace-nowrap scrollbar-hide mb-1">
                {expression || ' '}
             </div>
             <div className="w-full text-right text-foreground font-mono text-4xl md:text-6xl font-black tracking-tighter truncate selection:bg-primary/20">
                {result ? `= ${result}` : expression ? '' : '0'}
             </div>
          </div>

          {/* 2. Keypad Area (Bottom) - Adjust grid for mobile */}
          <div className="flex-1 grid grid-cols-4 md:grid-cols-8 gap-1 md:gap-2 px-2 py-4 md:p-6 bg-card min-h-[400px] md:min-h-0">
              {buttons.map((btn, i) => {
                const isOperator = !/[0-9.]/.test(btn.label) || btn.label === 'log';
                const isPrimary = btn.type === 'primary';
                const isDanger = btn.type === 'danger';

                return (
                  <button
                    key={i}
                    onClick={() => btn.action ? btn.action() : handleInput(btn.val)}
                    className={`
                      relative group flex items-center justify-center font-mono text-sm md:text-lg font-bold rounded-xl md:rounded-2xl transition-all active:scale-95
                      col-span-1
                      ${isPrimary 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90' 
                        : isDanger
                        ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                        : isOperator
                        ? 'bg-muted/30 text-primary hover:bg-muted/50'
                        : 'bg-muted/10 text-foreground hover:bg-muted/30 border border-border/50'
                      }
                    `}
                  >
                    {btn.label === 'DEL' ? <Delete className="w-5 h-5 md:w-6 md:h-6" /> : btn.label}
                    <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-white/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
                  </button>
                );
              })}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
