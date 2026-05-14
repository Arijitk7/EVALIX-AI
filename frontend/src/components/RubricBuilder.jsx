import { useState } from 'react';

/**
 * RubricBuilder — Teacher defines marking criteria (concept + marks + weightage)
 */
export default function RubricBuilder({ rubricItems, onChange }) {
  const addItem = () => {
    onChange([...rubricItems, { concept: '', marks: 1, weightage: 10 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = rubricItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const removeItem = (index) => {
    onChange(rubricItems.filter((_, i) => i !== index));
  };

  const totalMarks = rubricItems.reduce((s, r) => s + Number(r.marks || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-300">Rubric Criteria</span>
        <span className="badge badge-blue">Total: {totalMarks} marks</span>
      </div>

      {rubricItems.length === 0 && (
        <div className="text-sm text-slate-500 italic py-2">No rubric items yet. Add criteria below.</div>
      )}

      {rubricItems.map((item, i) => (
        <div key={i} className="glass-card-sm p-3 flex gap-3 items-center">
          <input
            type="text"
            placeholder="Concept (e.g. TCP Handshake)"
            value={item.concept}
            onChange={e => updateItem(i, 'concept', e.target.value)}
            className="input-field flex-1 py-2 text-sm"
          />
          <div className="flex flex-col items-center w-20">
            <span className="text-xs text-slate-500 mb-1">Marks</span>
            <input
              type="number"
              min="0"
              max="100"
              value={item.marks}
              onChange={e => updateItem(i, 'marks', Number(e.target.value))}
              className="input-field py-2 text-sm text-center w-full"
            />
          </div>
          <div className="flex flex-col items-center w-20">
            <span className="text-xs text-slate-500 mb-1">Weight %</span>
            <input
              type="number"
              min="0"
              max="100"
              value={item.weightage}
              onChange={e => updateItem(i, 'weightage', Number(e.target.value))}
              className="input-field py-2 text-sm text-center w-full"
            />
          </div>
          <button
            onClick={() => removeItem(i)}
            className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
            title="Remove"
          >
            ✕
          </button>
        </div>
      ))}

      <button onClick={addItem} className="btn-secondary text-sm py-2 w-full justify-center">
        + Add Criterion
      </button>
    </div>
  );
}