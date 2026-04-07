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
    { label: 'sin', val: 'sin(' }, { label: 'cos', val: 'cos(' }, { label: 'tan', val: 'tan(' }, { label: 'π', val: 'pi' }, { label: 'e', val: 'e' },
    { label: 'log', val: 'log10(' }, { label: 'ln', val: 'log(' }, { label: '√', val: 'sqrt(' }, { label: '^', val: '^' }, { label: '!', val: '!' },
    { label: '(', val: '(' }, { label: ')', val: ')' }, { label: '%', val: '%' }, { label: 'AC', action: clear, type: 'danger' }, { label: 'DEL', action: backspace, type: 'danger' },
    { label: '7', val: '7' }, { label: '8', val: '8' }, { label: '9', val: '9' }, { label: '÷', val: '/' }, { label: '×', val: '*' },
    { label: '4', val: '4' }, { label: '5', val: '5' }, { label: '6', val: '6' }, { label: '−', val: '-' }, { label: 'x10^y', val: '*10^' },
    { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' }, { label: '+', val: '+' }, { label: 'mod', val: ' mod ' },
    { label: '0', val: '0', wide: true }, { label: '.', val: '.' }, { label: '=', action: calculate, type: 'primary', wide: true },
  ];

  return (
    <DashboardLayout pageTitle="Advanced Calculator">
      <div className="flex flex-col xl:flex-row gap-8 items-start justify-center max-w-6xl mx-auto py-4">
        
        {/* Main Calculator Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[500px] bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden shadow-primary/5"
        >
          {/* Display Head */}
          <div className="p-8 pb-4 space-y-4 bg-muted/20">
             <div className="flex items-center justify-between text-muted-foreground">
                <Maximize2 className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded">Radian Mode</span>
             </div>
             <div className="flex flex-col items-end min-h-[120px] justify-end">
                <div className="w-full text-right text-muted-foreground font-mono text-lg overflow-x-auto whitespace-nowrap scrollbar-hide pb-2">
                   {expression || ' '}
                </div>
                <div className="w-full text-right text-foreground font-mono text-5xl font-bold tracking-tighter truncate">
                   {result ? `= ${result}` : expression ? '' : '0'}
                </div>
             </div>
          </div>

          {/* Keypad */}
          <div className="p-4 grid grid-cols-5 gap-2 bg-card">
              {buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => btn.action ? btn.action() : handleInput(btn.val)}
                  className={`
                    relative group flex items-center justify-center font-mono text-sm sm:text-base font-semibold h-14 sm:h-16 rounded-2xl transition-all active:scale-95
                    ${btn.wide ? 'col-span-2' : ''}
                    ${btn.type === 'primary' 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary-600' 
                      : btn.type === 'danger'
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                      : /[0-9.]/.test(btn.label) && btn.label !== 'log'
                      ? 'bg-muted/50 text-foreground hover:bg-muted'
                      : 'bg-muted/30 text-primary hover:bg-muted/60'
                    }
                  `}
                >
                  {btn.label === 'DEL' ? <Delete className="w-5 h-5" /> : btn.label}
                  <span className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></span>
                </button>
              ))}
          </div>
        </motion.div>

        {/* History Area */}
        <div className="w-full xl:w-80 space-y-6">
           <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-foreground flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    History
                 </h3>
                 {history.length > 0 && (
                   <button 
                    onClick={() => setHistory([])}
                    className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 <AnimatePresence initial={false}>
                    {history.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 opacity-50">
                          <History className="w-8 h-8 text-muted-foreground" />
                          <p className="text-xs font-medium italic">No recent history</p>
                       </div>
                    ) : (
                       history.map((h, i) => (
                         <motion.div
                           key={i}
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           onClick={() => setExpression(h.eq)}
                           className="group p-4 bg-muted/40 hover:bg-muted/70 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
                         >
                            <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            <div className="text-xs font-mono text-muted-foreground truncate group-hover:text-primary transition-colors">{h.eq}</div>
                            <div className="text-lg font-mono font-bold text-foreground truncate mt-1">= {h.res}</div>
                         </motion.div>
                       ))
                    )}
                 </AnimatePresence>
              </div>
           </div>

           <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20">
              <h4 className="font-bold text-primary text-sm flex items-center gap-2">
                 <Trash className="w-4 h-4" />
                 Cleanup Logic
              </h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                 Calculations are processed locally using math.js with extreme precision. History is kept per session.
              </p>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
