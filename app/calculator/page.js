'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Menu, Delete } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
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

  if (loading || !user) return <div className="flex h-screen items-center justify-center bg-slate-50"></div>;

  const handleInput = (val) => {
    setExpression((prev) => prev + val);
    // Real-time evaluation
    try {
      const res = math.evaluate(expression + val);
      if (res !== undefined && !isNaN(res)) {
        setResult(res.toString());
      } else {
        setResult('');
      }
    } catch {
      setResult('');
    }
  };

  const calculate = () => {
    try {
      if (!expression) return;
      const res = math.evaluate(expression);
      if (res !== undefined) {
        setHistory(prev => [{ eq: expression, res: res.toString() }, ...prev].slice(0, 5));
        setExpression(res.toString());
        setResult('');
      }
    } catch (err) {
      setResult('Error');
    }
  };

  const clear = () => {
    setExpression('');
    setResult('');
  };

  const backspace = () => {
    setExpression(prev => prev.slice(0, -1));
    try {
      const sliced = expression.slice(0, -1);
      if(!sliced) {
         setResult(''); return;
      }
      const res = math.evaluate(sliced);
      if (res !== undefined && !isNaN(res)) setResult(res.toString());
      else setResult('');
    } catch {
      setResult('');
    }
  };

  const buttons = [
    { label: 'sin(', val: 'sin(' }, { label: 'cos(', val: 'cos(' }, { label: 'tan(', val: 'tan(' }, { label: 'π', val: 'pi' }, { label: 'e', val: 'e' },
    { label: 'log(', val: 'log10(' }, { label: 'ln(', val: 'log(' }, { label: '√', val: 'sqrt(' }, { label: '^', val: '^' }, { label: '!', val: '!' },
    { label: '(', val: '(' }, { label: ')', val: ')' }, { label: '%', val: '%' }, { label: 'AC', val: 'AC', action: clear, type: 'danger' }, { label: 'DEL', val: 'DEL', action: backspace, type: 'danger' },
    { label: '7', val: '7' }, { label: '8', val: '8' }, { label: '9', val: '9' }, { label: '/', val: '/' }, { label: '*', val: '*' },
    { label: '4', val: '4' }, { label: '5', val: '5' }, { label: '6', val: '6' }, { label: '-', val: '-' }, { label: 'x10^', val: '*10^' },
    { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' }, { label: '+', val: '+' }, { label: 'mod', val: ' mod ' },
    { label: '0', val: '0', wide: true }, { label: '.', val: '.' }, { label: '=', val: '=', action: calculate, type: 'primary', wide: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar activePath="/calculator" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shadow-sm z-10 sticky top-0 md:hidden">
           <div className="flex items-center gap-2 text-indigo-600">
             <Menu className="w-6 h-6 text-slate-600 cursor-pointer" />
            <ShieldCheck className="w-6 h-6 ml-2" />
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div className="max-w-4xl mx-auto">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3">
                 {/* Calculator Body */}
                 <div className="md:col-span-2 p-6 sm:p-8 bg-slate-900 text-white flex flex-col relative overflow-hidden">
                    {/* Decorative */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                    {/* Display */}
                    <div className="relative z-10 w-full mb-8 pt-4">
                       <input 
                         ref={inputRef}
                         type="text" 
                         value={expression} 
                         onChange={(e) => {
                           setExpression(e.target.value);
                           try {
                             const res = math.evaluate(e.target.value);
                             if (res !== undefined && !isNaN(res)) setResult(res.toString());
                           } catch { setResult(''); }
                         }}
                         className="w-full bg-transparent text-right text-3xl sm:text-4xl font-mono tracking-wider outline-none text-slate-100 placeholder-slate-600"
                         placeholder="0"
                       />
                       <div className="text-right text-indigo-400 font-mono text-xl sm:text-2xl mt-2 min-h-8">
                         {result ? '= ' + result : ''}
                       </div>
                    </div>

                    {/* Keypad Grid */}
                    <div className="relative z-10 grid grid-cols-5 gap-2 sm:gap-3">
                       {buttons.map((btn, idx) => (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={idx}
                            onClick={() => btn.action ? btn.action() : handleInput(btn.val)}
                            className={`
                               font-medium text-sm sm:text-base py-3 sm:py-4 rounded-xl transition-colors shadow-sm backdrop-blur-md font-mono
                               ${btn.wide && btn.label === '0' ? 'col-span-2' : ''}
                               ${btn.wide && btn.label === '=' ? 'col-span-2' : ''}
                               ${btn.type === 'primary' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' : 
                                 btn.type === 'danger' ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 
                                 /^([0-9.])$/.test(btn.label) ? 'bg-white/10 hover:bg-white/20 text-white' : 
                                 'bg-slate-800/80 hover:bg-slate-700 text-indigo-300'
                               }
                            `}
                          >
                            {btn.label === 'DEL' ? <Delete className="w-5 h-5 mx-auto" /> : btn.label}
                          </motion.button>
                       ))}
                    </div>
                 </div>

                 {/* History Sidebar */}
                 <div className="p-6 sm:p-8 border-l border-slate-100 flex flex-col bg-slate-50">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-6">Recent Calculations</h3>
                    <div className="flex-1 space-y-4">
                       <AnimatePresence>
                         {history.length === 0 ? (
                           <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-slate-400 text-sm italic">No history yet</motion.p>
                         ) : (
                           history.map((h, i) => (
                             <motion.div 
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               key={i} 
                               className="p-3 bg-white rounded-lg shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-300 transition-colors"
                               onClick={() => setExpression(h.eq)}
                             >
                               <div className="text-sm font-mono text-slate-500 truncate mb-1">{h.eq}</div>
                               <div className="text-lg font-mono font-bold text-slate-800 truncate">= {h.res}</div>
                             </motion.div>
                           ))
                         )}
                       </AnimatePresence>
                    </div>
                    {history.length > 0 && (
                      <button 
                        onClick={() => setHistory([])}
                        className="mt-6 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors uppercase"
                      >
                        Clear History
                      </button>
                    )}
                 </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
