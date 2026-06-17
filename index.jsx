import { useState } from "react";

const initialData = [
  {
    id: "1",
    title: "議事録要約",
    tags: ["要約", "Claude"],
    versions: [
      { version: 1, body: "以下の議事録を箇条書きで要約してください。\n\n{{議事録}}", note: "初版", createdAt: "2026-06-01" },
      { version: 2, body: "以下の議事録を「決定事項」「TODO」「議論中」の3つのセクションに分けて要約してください。\n\n{{議事録}}", note: "セクション分けを追加", createdAt: "2026-06-10" },
    ],
  },
  {
    id: "2",
    title: "メール返信ドラフト",
    tags: ["ライティング", "Gemini"],
    versions: [
      { version: 1, body: "以下のメールへの返信を丁寧なビジネス文体で書いてください。\n\n{{メール本文}}", note: "初版", createdAt: "2026-06-05" },
    ],
  },
];

const TAG_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

function tagColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) % TAG_COLORS.length;
  return TAG_COLORS[h];
}

function formatDate(str) {
  const d = new Date(str);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,15,25,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-base">{title}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── New Prompt Form ──────────────────────────────────────────────────────────
function NewPromptForm({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");

  function handleSave() {
    if (!title.trim() || !body.trim()) return;
    const tags = tagInput.split(/[,、\s]+/).map(t => t.trim()).filter(Boolean);
    onSave({ title: title.trim(), tags, body: body.trim(), note: note.trim() });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">タイトル</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="例：議事録要約" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">タグ（カンマ区切り）</label>
        <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="例：要約, Claude" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">プロンプト本文</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="プロンプトを入力..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">メモ（任意）</label>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="初版、など" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={!title.trim() || !body.trim()} className="flex-1 bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">保存</button>
        <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 rounded-lg py-2 text-sm font-medium hover:bg-slate-200 transition-colors">キャンセル</button>
      </div>
    </div>
  );
}

// ─── Add Version Form ─────────────────────────────────────────────────────────
function AddVersionForm({ prompt, onSave, onClose }) {
  const latest = prompt.versions[prompt.versions.length - 1];
  const [body, setBody] = useState(latest.body);
  const [note, setNote] = useState("");

  function handleSave() {
    if (!body.trim()) return;
    onSave(body.trim(), note.trim());
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        <span className="font-medium text-slate-600">v{latest.version}</span> をベースに編集してください
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">プロンプト本文</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">変更メモ</label>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="何を変えたか、改善ポイントなど" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={!body.trim()} className="flex-1 bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">v{latest.version + 1} を保存</button>
        <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 rounded-lg py-2 text-sm font-medium hover:bg-slate-200 transition-colors">キャンセル</button>
      </div>
    </div>
  );
}

// ─── Detail View ──────────────────────────────────────────────────────────────
function DetailView({ prompt, onAddVersion, onClose }) {
  const [copied, setCopied] = useState(null);

  function copy(text, key) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <Modal title={prompt.title} onClose={onClose}>
      <div className="flex flex-wrap gap-1 mb-5">
        {prompt.tags.map(t => (
          <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(t)}`}>{t}</span>
        ))}
      </div>
      <div className="space-y-3">
        {[...prompt.versions].reverse().map(v => (
          <div key={v.version} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">v{v.version}</span>
                {v.note && <span className="text-xs text-slate-500">{v.note}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{formatDate(v.createdAt)}</span>
                <button onClick={() => copy(v.body, v.version)} className="text-xs text-slate-400 hover:text-indigo-600 transition-colors px-2 py-0.5 rounded hover:bg-indigo-50">
                  {copied === v.version ? "✓ コピー済" : "コピー"}
                </button>
              </div>
            </div>
            <pre className="px-4 py-3 text-xs text-slate-700 font-mono whitespace-pre-wrap break-all leading-relaxed bg-white">{v.body}</pre>
          </div>
        ))}
      </div>
      <button onClick={onAddVersion} className="mt-4 w-full border-2 border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:text-indigo-700 rounded-xl py-3 text-sm font-medium transition-colors">
        + 新しいバージョンを追加
      </button>
    </Modal>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [prompts, setPrompts] = useState(initialData);
  const [view, setView] = useState(null); // null | { type: "detail"|"new"|"addVersion", id? }
  const [filterTag, setFilterTag] = useState(null);

  const allTags = [...new Set(prompts.flatMap(p => p.tags))];
  const filtered = filterTag ? prompts.filter(p => p.tags.includes(filterTag)) : prompts;

  function saveNewPrompt({ title, tags, body, note }) {
    const id = String(Date.now());
    setPrompts(prev => [...prev, {
      id, title, tags,
      versions: [{ version: 1, body, note: note || "初版", createdAt: new Date().toISOString().slice(0, 10) }]
    }]);
    setView(null);
  }

  function addVersion(id, body, note) {
    setPrompts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nextV = p.versions[p.versions.length - 1].version + 1;
      return { ...p, versions: [...p.versions, { version: nextV, body, note: note || `v${nextV}`, createdAt: new Date().toISOString().slice(0, 10) }] };
    }));
    setView({ type: "detail", id });
  }

  const selectedPrompt = view?.id ? prompts.find(p => p.id === view.id) : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">Prompt Vault</h1>
          <p className="text-xs text-slate-400 mt-0.5">{prompts.length} 件のプロンプト</p>
        </div>
        <button onClick={() => setView({ type: "new" })} className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          + 新規作成
        </button>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto">
          <button onClick={() => setFilterTag(null)} className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${!filterTag ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
            すべて
          </button>
          {allTags.map(t => (
            <button key={t} onClick={() => setFilterTag(t === filterTag ? null : t)} className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${filterTag === t ? "bg-indigo-600 text-white" : `${tagColor(t)} hover:opacity-80`}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="px-4 py-2 space-y-2 pb-8">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            <div className="text-3xl mb-2">📭</div>
            プロンプトがまだありません
          </div>
        )}
        {filtered.map(p => {
          const latest = p.versions[p.versions.length - 1];
          return (
            <button key={p.id} onClick={() => setView({ type: "detail", id: p.id })} className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-slate-800 text-sm leading-snug">{p.title}</span>
                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">v{latest.version}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.tags.map(t => (
                  <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(t)}`}>{t}</span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-1">{latest.body}</p>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      {view?.type === "new" && (
        <Modal title="新規プロンプト" onClose={() => setView(null)}>
          <NewPromptForm onSave={saveNewPrompt} onClose={() => setView(null)} />
        </Modal>
      )}
      {view?.type === "detail" && selectedPrompt && (
        <DetailView
          prompt={selectedPrompt}
          onClose={() => setView(null)}
          onAddVersion={() => setView({ type: "addVersion", id: selectedPrompt.id })}
        />
      )}
      {view?.type === "addVersion" && selectedPrompt && (
        <Modal title={`新バージョン追加 — ${selectedPrompt.title}`} onClose={() => setView({ type: "detail", id: selectedPrompt.id })}>
          <AddVersionForm
            prompt={selectedPrompt}
            onSave={(body, note) => addVersion(selectedPrompt.id, body, note)}
            onClose={() => setView({ type: "detail", id: selectedPrompt.id })}
          />
        </Modal>
      )}
    </div>
  );
}
