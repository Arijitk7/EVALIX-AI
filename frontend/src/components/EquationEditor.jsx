import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

/**
 * EquationEditor — Wraps MathLive's <math-field> web component as a React component.
 * Returns LaTeX string via onChange.
 */
const EquationEditor = forwardRef(function EquationEditor({ value = '', onChange, placeholder = 'Type or click to enter equation...' }, ref) {
  const mathRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getLatex: () => mathRef.current?.value || '',
    clear: () => { if (mathRef.current) mathRef.current.value = ''; },
  }));

  useEffect(() => {
    // Lazy-load mathlive
    import('mathlive').then(() => {
      if (mathRef.current) {
        mathRef.current.value = value || '';
        
        const handleInput = () => {
          if (onChange) onChange(mathRef.current.value);
        };

        mathRef.current.addEventListener('input', handleInput);
        return () => mathRef.current?.removeEventListener('input', handleInput);
      }
    }).catch(err => {
      console.warn('[EquationEditor] MathLive not available:', err.message);
    });
  }, []);

  return (
    <div className="w-full">
      <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
        <span>∑</span> Equation Editor (LaTeX)
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: '1px solid rgba(96, 165, 250, 0.3)',
          background: 'rgba(15, 32, 64, 0.8)',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <math-field
          ref={mathRef}
          style={{
            width: '100%',
            minHeight: '60px',
            fontSize: '20px',
            padding: '12px 16px',
            background: 'transparent',
            color: '#e2e8f0',
            outline: 'none',
            border: 'none',
          }}
          virtual-keyboard-mode="manual"
        />
      </div>
      {value && (
        <div className="mt-2 text-xs text-slate-500">
          LaTeX: <code className="text-blue-400">{value}</code>
        </div>
      )}
    </div>
  );
});

export default EquationEditor;