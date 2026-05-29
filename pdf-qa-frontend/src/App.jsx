import { useState, useRef, useEffect } from "react";

const API_BASE = "https://pdf-qa-1-sek0.onrender.com";


export default function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      setUploadDone(true);
      setUploadInfo(data);
      setMessages([{
        role: "system",
        text: `"${file.name}" uploaded — ${data.chunks_stored} chunks indexed. Ask me anything about it.`
      }]);
    } catch {
      alert("Upload failed. Make sure your FastAPI server is running on port 8000.");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || asking) return;
    const q = question.trim();
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setAsking(true);
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Error: Could not reach the server." }]);
    } finally {
      setAsking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  const handleReset = () => {
    setFile(null); setUploadDone(false); setUploadInfo(null);
    setMessages([]); setQuestion("");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <span className="logo-text">DocMind</span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">Document</p>
          {!uploadDone ? (
            <>
              <div
                className={`drop-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={e => setFile(e.target.files[0])}
                />
                {file ? (
                  <div className="file-selected">
                    <div className="file-icon">PDF</div>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                ) : (
                  <div className="drop-hint">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p>Drop PDF here<br /><span>or click to browse</span></p>
                  </div>
                )}
              </div>
              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <span className="spinner-row"><span className="spinner" />Indexing…</span>
                ) : "Upload & Index"}
              </button>
            </>
          ) : (
            <div className="uploaded-card">
              <div className="uploaded-header">
                <div className="check-icon">✓</div>
                <div>
                  <p className="uploaded-name">{file.name}</p>
                  <p className="uploaded-meta">{uploadInfo?.chunks_stored} chunks indexed</p>
                </div>
              </div>
              <button className="reset-btn" onClick={handleReset}>Upload new PDF</button>
            </div>
          )}
        </div>

        <div className="sidebar-section how-it-works">
          <p className="sidebar-label">How it works</p>
          <div className="steps">
            {[
              { n: "1", t: "Upload PDF", d: "Text is extracted & split into chunks" },
              { n: "2", t: "Embeddings", d: "Each chunk is converted to a vector" },
              { n: "3", t: "Ask questions", d: "Top chunks are retrieved & sent to LLM" },
            ].map(s => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div>
                  <p className="step-title">{s.t}</p>
                  <p className="step-desc">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="chat-panel">
        <div className="chat-header">
          <h1>Ask your document</h1>
          {uploadDone && <span className="status-badge">● Ready</span>}
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p>Upload a PDF to get started.<br />Then ask anything about its contents.</p>
              <div className="example-questions">
                {["What is this document about?", "Summarize the key points", "What are the main conclusions?"].map(q => (
                  <button key={q} className="example-q" onClick={() => { setQuestion(q); }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message message-${msg.role}`}>
              {msg.role === "assistant" && (
                <div className="avatar ai-avatar">AI</div>
              )}
              {msg.role === "user" && (
                <div className="avatar user-avatar">You</div>
              )}
              <div className={`bubble bubble-${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {asking && (
            <div className="message message-assistant">
              <div className="avatar ai-avatar">AI</div>
              <div className="bubble bubble-assistant typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          <textarea
            className="question-input"
            placeholder={uploadDone ? "Ask a question about your document…" : "Upload a PDF first to start asking questions"}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!uploadDone || asking}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={handleAsk}
            disabled={!uploadDone || !question.trim() || asking}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}