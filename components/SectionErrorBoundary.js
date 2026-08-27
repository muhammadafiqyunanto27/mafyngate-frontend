'use client';

import { Component } from 'react';

export class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[Section:${this.props.name || 'unknown'}] Error:`, error.message, errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
            {this.props.fallbackText || 'Section failed to load'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <p className="text-[10px] text-rose-400 mt-2 font-mono break-all">{this.state.error.message}</p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
