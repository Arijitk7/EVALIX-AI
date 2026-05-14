import { useCallback, useRef, useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Lazy-load tldraw to avoid heavy bundle at initial load
const Tldraw = lazy(() => import('@tldraw/tldraw').then(m => ({ default: m.Tldraw })));

/**
 * CanvasAnswerBlock — tldraw-based drawing canvas with autosave + export
 * Props:
 *   assignmentId: string
 *   questionId: string
 *   onExport: (pngUrl, canvasJson) => void
 */
export default function CanvasAnswerBlock({ assignmentId, questionId, onExport }) {
  const editorRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autosaveTimer = useRef(null);

  const exportCanvas = useCallback(async (editor) => {
    if (!editor) return;
    setIsSaving(true);
    
    try {
      // Get canvas snapshot (JSON)
      const snapshot = editor.getSnapshot();
      
      // Export as PNG via tldraw's built-in export
      let pngUrl = null;
      try {
        const shapeIds = editor.getCurrentPageShapeIds();
        if (shapeIds.size > 0) {
          const { exportToBlob } = await import('@tldraw/tldraw');
          const blob = await exportToBlob({
            editor,
            ids: [...shapeIds],
            format: 'png',
            opts: { background: true, scale: 1.5 },
          });
          
          // Upload PNG to Supabase Storage
          const fileName = `canvas/${assignmentId}/${questionId}-${Date.now()}.png`;
          const { data, error } = await supabase.storage
            .from('exam-uploads')
            .upload(fileName, blob, { contentType: 'image/png', upsert: true });
          
          if (!error) {
            const { data: urlData } = supabase.storage.from('exam-uploads').getPublicUrl(fileName);
            pngUrl = urlData?.publicUrl;
          }
        }
      } catch (exportErr) {
        console.warn('[Canvas] PNG export failed (non-critical):', exportErr.message);
      }

      setLastSaved(new Date());
      if (onExport) onExport(pngUrl, snapshot);
      toast.success('Canvas saved!', { duration: 1500 });
    } catch (err) {
      console.error('[Canvas] Export error:', err);
      toast.error('Could not save canvas');
    } finally {
      setIsSaving(false);
    }
  }, [assignmentId, questionId, onExport]);

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    
    // Autosave every 30 seconds
    autosaveTimer.current = setInterval(() => {
      exportCanvas(editor);
    }, 30000);
  }, [exportCanvas]);

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    };
  }, []);

  return (
    <div className="w-full space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="badge badge-blue">🎨 Drawing Canvas</span>
          <span className="text-xs text-slate-500">
            Draw diagrams, flowcharts, circuit diagrams
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-slate-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => exportCanvas(editorRef.current)}
            disabled={isSaving}
            className="btn-primary text-xs py-2 px-4"
          >
            {isSaving ? '💾 Saving...' : '💾 Save Canvas'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        className="w-full rounded-xl overflow-hidden"
        style={{ 
          height: '400px', 
          border: '1px solid rgba(96, 165, 250, 0.2)',
          background: '#1a1a2e',
        }}
      >
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
        }>
          <Tldraw onMount={handleMount} hideUi={false} />
        </Suspense>
      </div>

      <div className="text-xs text-slate-600">
        💡 Use the toolbar to draw shapes, arrows, text. Canvas auto-saves every 30 seconds.
      </div>
    </div>
  );
}