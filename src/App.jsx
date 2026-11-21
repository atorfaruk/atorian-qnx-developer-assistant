import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertCircle, AlertTriangle, ArrowDownToLine, ArrowRight, ArrowUpRight,
  Bot, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  Clock3, Code2, Command, Cpu, FileCode2, FileSearch, FileText, Folder,
  FolderOpen, FolderSearch, Gauge, GitBranch, HardDrive, Home, Info, LayoutDashboard,
  LifeBuoy, ListChecks, Menu, MessageSquare, MoreHorizontal, PanelLeftClose,
  Play, Plus, Search, Send, Settings, ShieldCheck, Sparkles, Terminal,
  Upload, X, Zap, SlidersHorizontal, ExternalLink, Copy, RefreshCw, Wrench
} from 'lucide-react'

const navGroups = [
  { label: 'WORKSPACE', items: [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, tag: 'AI' },
    { id: 'analyzer', label: 'Build Analyzer', icon: AlertTriangle },
    { id: 'inspector', label: 'Project Inspector', icon: FolderOpen },
  ]},
  { label: 'DEVELOPMENT', items: [
    { id: 'build', label: 'Build & Test', icon: Terminal },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
  ]},
  { label: 'PREFERENCES', items: [
    { id: 'settings', label: 'Settings', icon: Settings },
  ]}
]

const sampleFiles = [
  { name: 'src', type: 'folder', detail: 'Source directory' },
  { name: 'include', type: 'folder', detail: 'Header files' },
  { name: 'main.c', type: 'file', detail: 'C source · 2.4 KB', code: true },
  { name: 'buildfile', type: 'file', detail: 'QNX build configuration' },
  { name: 'README.md', type: 'file', detail: 'Project documentation' },
]

const docs = [
  { title: 'QNX SDP 8.0 Quick Start Guide', category: 'Getting started', desc: 'Set up your development environment and build your first application.', time: 'Getting started' },
  { title: 'Building QNX Applications', category: 'Build system', desc: 'Understand build workflows, toolchains and project configuration.', time: 'Build system' },
  { title: 'QNX Neutrino RTOS Concepts', category: 'Fundamentals', desc: 'Explore processes, threads, message passing and real-time concepts.', time: 'Fundamentals' },
  { title: 'Compiler and Linker Reference', category: 'Toolchain', desc: 'Reference material for compiler options and linking workflows.', time: 'Toolchain' },
]

function Logo() {
  return <div className="brand">
    <div className="brand-mark"><span>A</span><i /></div>
    <div><div className="brand-name">ATORIAN</div><div className="brand-sub">QNX DEVELOPER ASSISTANT</div></div>
  </div>
}

function Sidebar({ page, setPage, collapsed, setCollapsed, mobileOpen, setMobileOpen, backendStatus }) {
  return <>
    {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-top">
        <Logo />
        <button className="icon-btn collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Collapse sidebar"><PanelLeftClose size={17}/></button>
        <button className="icon-btn mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button>
      </div>
      <div className="workspace-switch">
        <div className="workspace-icon"><Code2 size={16}/></div>
        <div className="workspace-meta"><strong>My workspace</strong><span>Personal environment</span></div>
        <ChevronDown size={15} className="muted"/>
      </div>
      <nav className="side-nav">
        {navGroups.map(group => <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(item => {
            const Icon = item.icon
            return <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => {setPage(item.id); setMobileOpen(false)}}>
              <Icon size={17}/><span>{item.label}</span>{item.tag && <em>{item.tag}</em>}
            </button>
          })}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="qnx-status">
  <div className="status-head">
    <span className={`status-dot ${backendStatus === 'online' ? 'green' : 'amber'}`}></span>
    <strong>Local backend</strong>
  </div>
  <div className="status-copy">
    {backendStatus === 'checking'
      ? 'Checking connection...'
      : backendStatus === 'online'
        ? 'Backend connected'
        : 'Backend offline'}
  </div>
  <div className="status-foot">
    <span>API · Port 3001</span>
    <span className="pill pending">
      {backendStatus === 'online' ? 'Online' : backendStatus === 'checking' ? 'Checking' : 'Offline'}
    </span>
  </div>
</div>
        <button className="help-link" onClick={() => setPage('docs')}><LifeBuoy size={16}/> Help & resources</button>
        <div className="user-card">
          <div className="avatar">U</div><div className="user-meta"><strong>Developer</strong><span>Local prototype</span></div><MoreHorizontal size={17} className="muted"/>
        </div>
      </div>
    </aside>
  </>
}

function Topbar({ title, subtitle, setMobileOpen, page }) {
  return <header className="topbar">
    <div className="topbar-left">
      <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={19}/></button>
      <div><div className="breadcrumb">ATORIAN <ChevronRight size={13}/> <span>{title}</span></div><div className="top-subtitle">{subtitle}</div></div>
    </div>
    <div className="topbar-right">
      <div className="environment-chip"><span className="status-dot amber"></span> QNX not connected</div>
      <button className="icon-btn" title="Search" onClick={() => window.dispatchEvent(new Event('atorian-search'))}><Search size={18}/></button>
      <div className="top-avatar">U</div>
    </div>
  </header>
}

function PageHeading({ eyebrow, title, desc, action, actionLabel, onAction }) {
  return <div className="page-heading">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div>
    {action && <button className="btn btn-primary" onClick={onAction}>{action === 'plus' ? <Plus size={16}/> : <Play size={15}/>} {actionLabel}</button>}
  </div>
}

function StatCard({ label, value, note, icon: Icon, tone='blue' }) {
  return <div className="stat-card">
    <div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}><Icon size={17}/></div></div>
    <div className="stat-value">{value}</div><div className="stat-note">{note}</div>
  </div>
}

function StatusTag({ children, tone='neutral' }) { return <span className={`tag ${tone}`}><i/> {children}</span> }

function Overview({ setPage }) {
  const [showNotice, setShowNotice] = useState(true)
  return <div className="page-content">
    <PageHeading eyebrow="WORKSPACE OVERVIEW" title="Good to see you." desc="Your QNX development workspace at a glance." action="plus" actionLabel="New analysis" onAction={() => setPage('analyzer')}/>
    {showNotice && <div className="notice-banner"><div className="notice-icon"><Info size={18}/></div><div><strong>Prototype environment</strong><p>This interface is ready for development. QNX tools and AI services have not been connected yet.</p></div><button className="icon-btn" onClick={() => setShowNotice(false)}><X size={16}/></button></div>}
    <div className="stats-grid">
      <StatCard label="Projects inspected" value="—" note="Connect a project to begin" icon={FolderOpen}/>
      <StatCard label="Builds analyzed" value="—" note="No build logs yet" icon={Activity} tone="violet"/>
      <StatCard label="Issues identified" value="—" note="Awaiting diagnostic data" icon={AlertTriangle} tone="amber"/>
      <StatCard label="QNX environment" value="Not set up" note="SDP 8.0 connection pending" icon={Cpu} tone="green"/>
    </div>
    <div className="overview-grid">
      <section className="panel welcome-panel">
        <div className="panel-kicker"><Sparkles size={15}/> GET STARTED</div>
        <h2>Your development companion<br/>starts here.</h2>
        <p>Use AI-guided explanations and developer tools to understand QNX projects, investigate build issues and learn your way around QNX 8.0.</p>
        <div className="quick-actions">
          <button onClick={() => setPage('assistant')}><span className="quick-icon purple"><Bot size={18}/></span><span><b>Ask the AI assistant</b><small>Explore QNX development questions</small></span><ArrowRight size={16}/></button>
          <button onClick={() => setPage('analyzer')}><span className="quick-icon orange"><AlertTriangle size={18}/></span><span><b>Analyze a build error</b><small>Understand a compiler or build log</small></span><ArrowRight size={16}/></button>
          <button onClick={() => setPage('inspector')}><span className="quick-icon blue"><FolderSearch size={18}/></span><span><b>Inspect a project</b><small>Review files and configuration</small></span><ArrowRight size={16}/></button>
        </div>
      </section>
      <section className="panel activity-panel">
        <div className="panel-title"><div><h3>Development activity</h3><p>Your recent workspace activity</p></div><button className="text-btn">View all</button></div>
        <div className="empty-state"><div className="empty-graphic"><Activity size={24}/></div><strong>No activity yet</strong><p>When you start using ATORIAN, your recent analyses and project actions will appear here.</p></div>
      </section>
    </div>
    <section className="panel setup-panel">
      <div className="panel-title"><div><h3>Environment setup</h3><p>Prepare your workstation for QNX development.</p></div><StatusTag tone="warning">Not connected</StatusTag></div>
      <div className="setup-steps">
        <div className="setup-step"><span className="step-number">01</span><div><b>Create your myQNX account</b><small>Access QNX Everywhere and its non-commercial licence.</small></div><StatusTag>To do</StatusTag></div>
        <div className="setup-step"><span className="step-number">02</span><div><b>Install QNX SDP 8.0</b><small>Prepare the QNX development toolchain.</small></div><StatusTag>To do</StatusTag></div>
        <div className="setup-step"><span className="step-number">03</span><div><b>Configure a QEMU target</b><small>Prepare a virtual environment for testing.</small></div><StatusTag>To do</StatusTag></div>
      </div>
    </section>
  </div>
}

function Assistant({ addToast }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [mode, setMode] = useState('QNX Development')
  const send = () => {
    if (!input.trim()) return
    setMessages(m => [...m, {role:'user', text:input.trim()}])
    setInput('')
    addToast('Message saved in this prototype. Connect the AI backend to receive generated answers.')
  }
  return <div className="page-content assistant-page">
    <PageHeading eyebrow="AI WORKSPACE" title="QNX AI Assistant" desc="Your companion for understanding QNX development concepts and workflows."/>
    <div className="assistant-layout">
      <section className="panel chat-panel">
        <div className="chat-header"><div className="assistant-identity"><div className="assistant-orb"><Bot size={20}/></div><div><b>ATORIAN Assistant</b><span><i className="status-dot amber"/> AI service not connected</span></div></div><button className="icon-btn" onClick={() => setMessages([])} title="Clear conversation"><RefreshCw size={16}/></button></div>
        <div className="chat-body">
          {messages.length === 0 ? <div className="chat-welcome"><div className="large-orb"><Sparkles size={27}/></div><h2>What are you working on?</h2><p>Ask a question about QNX concepts, development workflows or troubleshooting. AI responses will be available after backend integration.</p>
            <div className="prompt-grid">
              {['Explain QNX Neutrino architecture','How do I build a QNX application?','What is a QNX buildfile?','Help me understand compiler errors'].map(p => <button key={p} onClick={() => setInput(p)}>{p}<ArrowUpRight size={14}/></button>)}
            </div>
          </div> : <div className="message-list">{messages.map((m,i)=><div className={`message ${m.role}`} key={i}><div className="message-avatar">{m.role==='user'?'U':<Bot size={15}/>}</div><div><span className="message-role">{m.role==='user'?'YOU':'ATORIAN'}</span><p>{m.text}</p></div></div>)}</div>}
        </div>
        <div className="chat-composer"><div className="composer-tools"><select value={mode} onChange={e=>setMode(e.target.value)}><option>QNX Development</option><option>Build Troubleshooting</option><option>Learning Mode</option></select><span className="composer-note">Prototype · No AI connection</span></div><div className="composer-input"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask ATORIAN about QNX development..." rows="2"/><button className="send-btn" onClick={send} disabled={!input.trim()}><Send size={17}/></button></div></div>
      </section>
      <aside className="assistant-side">
        <div className="panel side-card"><div className="panel-title"><h3>Suggested topics</h3></div>{['QNX Neutrino RTOS','Processes and threads','Message passing','Buildfiles and make','QNX SDP toolchain'].map((x,i)=><button className="topic-row" key={x} onClick={()=>setInput(`Explain ${x} in QNX 8.0`)}><span>{x}</span><ChevronRight size={15}/></button>)}</div>
        <div className="panel side-card"><div className="side-card-icon"><BookOpen size={18}/></div><h3>Grounded answers</h3><p>When connected, ATORIAN will retrieve relevant official QNX documentation and include source references with technical explanations.</p><StatusTag tone="warning">Not connected</StatusTag></div>
        <div className="privacy-note"><ShieldCheck size={16}/><span>Developer-controlled workflow. Suggestions are not executed automatically.</span></div>
      </aside>
    </div>
  </div>
}


function Analyzer({ addToast }) {
  const [log, setLog] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('paste')

  const run = async () => {
    if (!log.trim()) {
      addToast('Paste a build log or select a file first.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('http://127.0.0.1:3001/api/analyze-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis request failed.')
      }

      setResult(data)
      addToast('Build log parsed successfully.')
    } catch (err) {
      setError(err.message || 'Could not reach the Analyzer backend.')
      addToast('Build log analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="page-content">
    <PageHeading
      eyebrow="DIAGNOSTICS"
      title="Build Error Analyzer"
      desc="Parse actual compiler output and inspect detected diagnostics."
    />

    <div className="analyzer-grid">
      <section className="panel analyzer-input-panel">
        <div className="panel-title">
          <div>
            <h3>Build output</h3>
            <p>Paste actual compiler output or upload a log file.</p>
          </div>
          <StatusTag tone="success">Local parser</StatusTag>
        </div>

        <div className="tabs">
          <button className={tab === 'paste' ? 'selected' : ''} onClick={() => setTab('paste')}>Paste log</button>
          <button className={tab === 'upload' ? 'selected' : ''} onClick={() => setTab('upload')}>Upload file</button>
        </div>

        {tab === 'paste' ? (
          <>
            <div className="code-label">
              <span><Terminal size={14}/> BUILD OUTPUT</span>
            </div>
            <textarea
              className="log-editor"
              value={log}
              onChange={e => {
                setLog(e.target.value)
                setResult(null)
                setError('')
              }}
              placeholder="Paste your actual QNX compiler or build output here..."
              spellCheck="false"
            />
          </>
        ) : (
          <label className="upload-zone">
            <Upload size={24}/>
            <b>{fileName || 'Choose a build log'}</b>
            <span>Supported formats: .txt, .log, .out, .err</span>
            <input
              type="file"
              accept=".txt,.log,.out,.err"
              onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return

                setFileName(file.name)
                setResult(null)
                setError('')

                const reader = new FileReader()
                reader.onload = () => setLog(String(reader.result || ''))
                reader.onerror = () => setError('Could not read the selected file.')
                reader.readAsText(file)
              }}
            />
          </label>
        )}

        <div className="input-footer">
          <span><ShieldCheck size={14}/> Log text is sent only to your local backend.</span>
          <button className="btn btn-primary" onClick={run} disabled={loading}>
            <Sparkles size={15}/>
            {loading ? 'Analysing...' : 'Analyse output'}
          </button>
        </div>
      </section>

      <section className="panel result-panel">
        <div className="panel-title">
          <div>
            <h3>Analysis results</h3>
            <p>Diagnostics extracted from your supplied log.</p>
          </div>
          <FileSearch size={18} className="muted"/>
        </div>

        {error ? (
          <div className="empty-state">
            <AlertCircle size={24}/>
            <strong>Analysis failed</strong>
            <p>{error}</p>
          </div>
        ) : !result ? (
          <div className="empty-state result-empty">
            <div className="empty-graphic orange">
              <AlertTriangle size={23}/>
            </div>
            <strong>Ready for analysis</strong>
            <p>Submit a real compiler log to extract its diagnostics.</p>
          </div>
        ) : (
          <div className="result-content">
            <div className="demo-warning">
              <Info size={15}/>
              Parsed by {result.parser}. No AI diagnosis or build execution was performed.
            </div>

            <div className="issue-heading">
              <span className="issue-icon"><AlertCircle size={18}/></span>
              <div>
                <b>Diagnostic summary</b>
                <small>{result.summary.total} recognised diagnostic lines</small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '16px 0' }}>
              <StatusTag tone="danger">Errors: {result.summary.errors}</StatusTag>
              <StatusTag tone="warning">Warnings: {result.summary.warnings}</StatusTag>
              <StatusTag tone="info">Notes: {result.summary.notes}</StatusTag>
            </div>

            {result.diagnostics.length === 0 ? (
              <div className="result-block">
                <strong>No recognised diagnostics found.</strong>
                <p>The parser did not find lines matching its supported compiler diagnostic format. This does not prove that the build is error-free.</p>
              </div>
            ) : (
              result.diagnostics.map((item, index) => (
                <div className="result-block" key={index}>
                  <label>{item.severity.toUpperCase()}</label>
                  <code>{item.message}</code>
                <p>
  {item.file ? (
    <>
      File: {item.file} · Line: {item.line ?? 'N/A'} · Column: {item.column ?? 'N/A'}
    </>
  ) : (
    'Location unavailable (linker/build diagnostic)'
  )}
</p>
                </div>
              ))
            )}

            {result.suggestions.length > 0 && (
              <div className="result-block">
                <label>GENERAL TROUBLESHOOTING SUGGESTIONS</label>
                {result.suggestions.map((item, index) => (
                  <div key={index} style={{ marginBottom: 14 }}>
                    <code>{item.diagnostic}</code>
                    <p>{item.suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="info-strip">
              <Info size={15}/>
              <span>{result.limitation}</span>
            </div>
          </div>
        )}
      </section>
    </div>

    <div className="info-strip">
      <ShieldCheck size={16}/>
      <span>This version performs real local log parsing. AI explanations, automatic fixes and QNX build execution are not yet implemented.</span>
    </div>
  </div>
}

function Inspector({ addToast }) {
 const [selected, setSelected] = useState('')
const [folder, setFolder] = useState('')
const [files, setFiles] = useState([])
const [uploadName, setUploadName] = useState('')
const [environment, setEnvironment] = useState(null)
const [scanning, setScanning] = useState(false)
const [scanError, setScanError] = useState('')

const [projectFiles, setProjectFiles] = useState([])
const [projectResult, setProjectResult] = useState(null)
const [projectError, setProjectError] = useState('')
const [projectScanning, setProjectScanning] = useState(false)

  const scanEnvironment = async () => {
    setScanning(true)
    setScanError('')
    setEnvironment(null)

    try {
      const response = await fetch('http://127.0.0.1:3001/api/environment')
      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Environment inspection failed')
      }

      setEnvironment(data)
      addToast('QNX environment inspection completed.')
    } catch (error) {
      setScanError(error.message || 'Could not reach the local backend.')
      addToast('QNX environment inspection failed.')
    } finally {
      setScanning(false)
    }
  }

  const runProjectInspection = async () => {
    if (!projectFiles.length) {
      setProjectError('Select a project folder first.');
      return;
    }

    setProjectScanning(true);
    setProjectError('');
    setProjectResult(null);

    try {
      const response = await fetch(
        'http://127.0.0.1:3001/api/project/inspect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            files: projectFiles
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Project inspection failed.');
      }

      setProjectResult(data);
      addToast('Project inspection completed successfully.');
    } catch (error) {
      setProjectError(
        error.message || 'Could not connect to the inspection backend.'
      );
      addToast('Project inspection failed.');
    } finally {
      setProjectScanning(false);
    }
  };


  const environmentItems = environment ? [
    { label: 'QNX SDP installation', item: environment.installation },
    { label: 'QNX compiler (qcc.exe)', item: environment.compiler },
    { label: 'QNX target directory', item: environment.target },
    { label: 'Environment script', item: environment.environmentScript }
  ] : []

  return <div className="page-content">
    <PageHeading
      eyebrow="PROJECT WORKSPACE"
      title="Project Inspector"
      desc="Explore project files and inspect your actual QNX development environment."
      action="plus"
      actionLabel="Select project"
      onAction={() => document.getElementById('project-upload').click()}
    />

    <input
      id="project-upload"
      type="file"
      webkitdirectory="true"
      directory=""
      multiple
      hidden

onChange={async e => {
  const selectedFiles = Array.from(e.target.files || []);
  if (!selectedFiles.length) return;

  setProjectResult(null);
  setProjectError('');
  setProjectFiles([]);
  setFiles([]);
  setSelected('');

  const rootName = selectedFiles[0].webkitRelativePath.split('/')[0];

  setUploadName(rootName);
  setFolder(rootName);
  setProjectScanning(true);

  try {

const supportedExtensions = [
  '.c', '.h', '.cc', '.cpp', '.hpp',
  '.cxx', '.hxx', '.mk'
];

const ignoredDirectories = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.venv',
  'vendor',
  '.next'
]);

const supportedFiles = selectedFiles.filter(file => {
  const relativePath = file.webkitRelativePath
    .split('/')
    .slice(1);

  const name = relativePath[relativePath.length - 1].toLowerCase();

  if (relativePath.some(part => ignoredDirectories.has(part.toLowerCase()))) {
    return false;
  }

  return (
    ['makefile', 'gnumakefile', 'buildfile'].includes(name) ||
    name.endsWith('.build') ||
    supportedExtensions.some(ext => name.endsWith(ext))
  );
});


    if (supportedFiles.length > 80) {
      throw new Error('Maximum 80 supported files can be inspected at once.');
    }

    const readableFiles = supportedFiles.filter(
      file => file.size <= 256 * 1024
    );

    let totalSize = 0;

    const contents = await Promise.all(
      readableFiles.map(async file => {
        totalSize += file.size;

        if (totalSize > 2 * 1024 * 1024) {
          throw new Error('Project content exceeds the 2 MB inspection limit.');
        }

        return {
          path: file.webkitRelativePath.split('/').slice(1).join('/'),
          content: await file.text()
        };
      })
    );

    if (!contents.length) {
      throw new Error('No supported, readable project files were found.');
    }

    setProjectFiles(contents);

    setFiles(readableFiles.map(file => ({
      name: file.webkitRelativePath.split('/').slice(1).join('/'),
      type: 'file',
      detail: `${(file.size / 1024).toFixed(1)} KB`
    })));

    setSelected(contents[0].path);

    addToast(`${contents.length} project files loaded for inspection.`);
  } catch (error) {
    setProjectError(error.message || 'Could not read project files.');
    addToast('Project file loading failed.');
  } finally {
    setProjectScanning(false);
  }
}}

    />


    <section className="panel" style={{ padding: 18, marginBottom: 18 }}>
      <div className="panel-title">
        <div>
          <h3>Project source inspection</h3>
          <p>Inspect actual source files and build configuration.</p>
        </div>
        <StatusTag tone={projectResult ? 'success' : 'warning'}>
          {projectResult ? 'Inspection completed' : 'Awaiting inspection'}
        </StatusTag>
      </div>

      <p>
        {projectFiles.length} supported files loaded
        {uploadName ? ` from ${uploadName}` : ''}
      </p>

      <button
        className="btn btn-primary"
        onClick={runProjectInspection}
        disabled={!projectFiles.length || projectScanning}
      >
        <FolderSearch size={16} />
        {projectScanning ? 'Inspecting project...' : 'Inspect project'}
      </button>

      {projectError && (
        <div className="info-strip" style={{ marginTop: 14 }}>
          <AlertCircle size={16} />
          <span>{projectError}</span>
        </div>
      )}

      {projectResult && (
        <div style={{ marginTop: 22 }}>
          <h3>Inspection summary</h3>

          <div className="stats-grid">
            <StatCard label="Files inspected" value={projectResult.summary.inspectedFiles} note="Supported project files" icon={FolderOpen} />
            <StatCard label="Source files" value={projectResult.summary.sourceFiles} note="C/C++ source files" icon={Code2} />
            <StatCard label="Headers" value={projectResult.summary.headerFiles} note="Header files" icon={FileCode2} />
            <StatCard label="Entry points" value={projectResult.summary.possibleMainEntryPoints} note="Possible main() functions" icon={Activity} />
          </div>

          <h3 style={{ marginTop: 20 }}>Detected includes</h3>
          {projectResult.includes.length ? (
            <ul>
              {projectResult.includes.map((item, index) => (
                <li key={index}><code>{item}</code></li>
              ))}
            </ul>
          ) : (
            <p>No include directives detected.</p>
          )}

          <h3 style={{ marginTop: 20 }}>Inspection findings</h3>
          {projectResult.findings.length ? (
            projectResult.findings.map((item, index) => (
              <div className="result-block" key={index}>
                <StatusTag tone={item.severity === 'warning' ? 'warning' : 'info'}>
                  {item.severity.toUpperCase()}
                </StatusTag>
                <p>{item.message}</p>
                <small>
                  {item.file || 'Project'}
                  {item.line ? ` · Line ${item.line}` : ''}
                </small>
              </div>
            ))
          ) : (
            <p>No findings were detected.</p>
          )}

          <div className="info-strip" style={{ marginTop: 16 }}>
            <Info size={16} />
            <span>{projectResult.limitations.join(' ')}</span>
          </div>
        </div>
      )}
    </section>

    <section className="panel" style={{ padding: 18, marginBottom: 18 }}>
      <div className="panel-title">
        <div>
          <h3>QNX Environment Inspector</h3>
          <p>Check the actual QNX installation files on this computer.</p>
        </div>
        <StatusTag tone={environment ? 'success' : 'warning'}>
          {environment ? 'Inspection completed' : 'Not inspected'}
        </StatusTag>
      </div>

      <button
        className="btn btn-primary"
        onClick={scanEnvironment}
        disabled={scanning}
      >
        <RefreshCw size={15} />
        {scanning ? 'Scanning environment...' : 'Scan QNX Environment'}
      </button>

      {scanError && (
        <div className="info-strip" style={{ marginTop: 14 }}>
          <AlertCircle size={16} />
          <span>{scanError}</span>
        </div>
      )}

      {environment && (
        <div style={{ marginTop: 18 }}>
          <div className="file-panel-head">
            <span>LIVE INSPECTION RESULTS</span>
            <StatusTag tone="success">API response received</StatusTag>
          </div>

          {environmentItems.map(({ label, item }) => (
            <div
              key={label}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid var(--line)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                <strong>{label}</strong>
                <StatusTag tone={item.detected ? 'success' : 'warning'}>
                  {item.detected ? 'Detected' : 'Not found'}
                </StatusTag>
              </div>

              <div style={{
                fontSize: 12,
                opacity: 0.75,
                marginTop: 6,
                overflowWrap: 'anywhere'
              }}>
                {item.path}
              </div>
            </div>
          ))}

          <div className="info-strip" style={{ marginTop: 14 }}>
            <Info size={16} />
            <span>{environment.note}</span>
          </div>
        </div>
      )}
    </section>


    <div className="project-toolbar">
      <div className="project-path">
        <Folder size={16}/>
        <b>{folder}</b>
        <ChevronRight size={14}/>
        <span>Project root</span>
      </div>
      <div className="toolbar-right">
        <StatusTag tone="warning">Local file listing</StatusTag>
        <button className="icon-btn" onClick={() => addToast('Project refresh is not implemented yet.')}>
          <RefreshCw size={16}/>
        </button>
      </div>
    </div>

    <div className="inspector-grid">
      <section className="panel file-panel">
        <div className="file-panel-head">
          <span>EXPLORER</span>
          <MoreHorizontal size={16}/>
        </div>
        <div className="file-tree">
          {files.map((f, i) => (
            <button
              key={i}
              className={`file-row ${selected === f.name ? 'selected' : ''}`}
              onClick={() => {
                setSelected(f.name)
                if (f.type === 'folder') {
                  addToast('Folder expansion is not implemented yet.')
                }
              }}
            >
              <span className="file-indent">
                {f.type === 'folder' ? <Folder size={15}/> : <FileCode2 size={15}/>}
              </span>
              <span>{f.name}</span>
            </button>
          ))}
        </div>
        <div className="file-panel-foot">
          <span>{files.length} visible entries</span>
          <span>Local listing</span>
        </div>
      </section>

      <section className="panel file-preview">
        <div className="preview-head">
          <div>
            <FileCode2 size={16}/>
            <b>{selected}</b>
            <span className="preview-language">C / project file</span>
          </div>
          <button
            className="text-btn"
            onClick={() => addToast('Source code analysis is not implemented yet.')}
          >
            Analyze file <ArrowUpRight size={14}/>
          </button>
        </div>

<div className="preview-placeholder">
  {(() => {
    const activeFile = projectFiles.find(
      file => file.path === selected
    );

    if (!activeFile) {
      return (
        <>
          <div className="empty-graphic">
            <Code2 size={24} />
          </div>
          <strong>Project preview</strong>
          <p>Select a supported source file to preview its contents.</p>
        </>
      );
    }

    return (
      <div style={{ width: '100%', textAlign: 'left' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 14
        }}>
          <strong>{activeFile.path}</strong>
          <span className="demo-warning">
            Read-only source preview
          </span>
        </div>

        <pre style={{
          maxHeight: 500,
          overflow: 'auto',
          padding: 16,
          borderRadius: 10,
          background: 'var(--surface)',
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: 'pre',
          overflowWrap: 'normal'
        }}>
          <code>{activeFile.content}</code>
        </pre>
      </div>
    );
  })()}
</div>
</section>
</div>


    <div className="info-strip">
      <ShieldCheck size={16}/>
      <span>QNX environment results come from the local backend. Project file listing is a separate browser-side feature.</span>
    </div>
  </div>
}

function Build({ addToast }) {
  const [target, setTarget] = useState('QEMU virtual target')
  const [command, setCommand] = useState('make')
  const [approved, setApproved] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  return <div className="page-content">
    <PageHeading eyebrow="DEVELOPMENT WORKFLOW" title="Build & Test" desc="Prepare and review QNX build and test operations."/>
    <div className="build-grid">
      <section className="panel build-config">
        <div className="panel-title"><div><h3>Build configuration</h3><p>Configure a development operation.</p></div><Wrench size={18} className="muted"/></div>
        <label className="field-label">TARGET ENVIRONMENT</label><select className="field-select" value={target} onChange={e=>setTarget(e.target.value)}><option>QEMU virtual target</option><option>Raspberry Pi 5</option><option>Other supported target</option></select>
        <label className="field-label">BUILD COMMAND</label><input className="field-input mono" value={command} onChange={e=>setCommand(e.target.value)}/>
        <div className="command-preview"><span>COMMAND PREVIEW</span><code>{command || 'Enter a command'}</code></div>
        <div className="approval-box"><ShieldCheck size={17}/><div><b>Developer approval required</b><p>Commands will only run after explicit review and approval in the connected application.</p></div></div>
        <button className="btn btn-primary full" onClick={()=>{setApproved(true);addToast('Review state prepared. No command was executed.')}}><Check size={15}/> Review build operation</button>
      </section>
      <section className="panel terminal-panel">
        <div className="terminal-head"><div><span className="terminal-dot red"/><span className="terminal-dot yellow"/><span className="terminal-dot green"/></div><span>ATORIAN TERMINAL</span><span className="terminal-id">SESSION — LOCAL PREVIEW</span></div>
        <div className="terminal-body">
          {!approved && !showOutput ? <div className="terminal-empty"><Terminal size={24}/><p>Build output will appear here.</p><small>No QNX toolchain connected.</small></div> : <div className="terminal-message"><span className="term-prompt">$</span> {command}<br/><br/><span className="term-muted">[Prototype] Command review prepared for {target}.</span><br/><span className="term-muted">No process was started. Connect QNX SDP 8.0 to execute builds.</span></div>}
        </div>
        {approved && <div className="approval-actions"><span><AlertTriangle size={14}/> Preview only — execution unavailable</span><button className="btn btn-secondary btn-sm" onClick={()=>{setApproved(false);setShowOutput(false)}}>Dismiss</button></div>}
      </section>
    </div>
    <section className="panel test-panel"><div className="panel-title"><div><h3>Test results</h3><p>QEMU and target test status.</p></div><StatusTag tone="warning">Not connected</StatusTag></div><div className="test-empty"><div className="empty-graphic"><ListChecks size={22}/></div><div><b>No test runs yet</b><p>Connect a QNX target and run a verified test to see results here.</p></div></div></section>
  </div>
}

function Docs({ addToast }) {
  const [query, setQuery] = useState('')
  const filtered = docs.filter(d => (d.title+d.desc+d.category).toLowerCase().includes(query.toLowerCase()))
  return <div className="page-content">
    <PageHeading eyebrow="KNOWLEDGE BASE" title="Documentation Intelligence" desc="Find and understand technical resources for QNX development."/>
    <section className="docs-hero"><div className="docs-orb"><BookOpen size={24}/></div><h2>Find the guidance you need.</h2><p>Search technical topics and documentation. Official QNX source retrieval will be connected in a later development stage.</p><div className="docs-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search QNX topics, guides and references..."/><kbd>⌘ K</kbd></div></section>
    <div className="docs-toolbar"><div><h3>Suggested resources</h3><p>Starter topics for your QNX learning journey.</p></div><StatusTag tone="warning">Sample index</StatusTag></div>
    <div className="docs-grid">{filtered.map(d=><button className="doc-card" key={d.title} onClick={()=>addToast('This is a suggested resource entry. Official document linking will be added after source verification.')}><div className="doc-icon"><FileText size={19}/></div><span className="doc-category">{d.category}</span><b>{d.title}</b><p>{d.desc}</p><span className="doc-open">Open resource <ArrowUpRight size={14}/></span></button>)}</div>
    <div className="info-strip"><Info size={16}/><span>These are suggested topic placeholders, not live QNX documentation. We will connect and verify official QNX sources before enabling documentation answers.</span></div>
  </div>
}

function SettingsPage({ addToast }) {
  const [model, setModel] = useState('Gemini (planned)')
  const [theme, setTheme] = useState('Dark')
  const [safe, setSafe] = useState(true)
  return <div className="page-content">
    <PageHeading eyebrow="PREFERENCES" title="Settings" desc="Configure your ATORIAN workspace and development preferences."/>
    <div className="settings-layout">
      <section className="panel settings-panel"><div className="panel-title"><div><h3>AI configuration</h3><p>Choose the planned AI provider for future backend integration.</p></div><Bot size={18} className="muted"/></div><label className="field-label">AI PROVIDER</label><select className="field-select" value={model} onChange={e=>setModel(e.target.value)}><option>Gemini (planned)</option><option>Other provider (future)</option></select><div className="settings-note"><Info size={15}/> No API key is stored or used in this frontend prototype.</div><button className="btn btn-secondary" onClick={()=>addToast('Provider preference is a prototype-only setting.')}>Save preference</button></section>
      <section className="panel settings-panel"><div className="panel-title"><div><h3>Developer safety</h3><p>Control how the assistant handles suggested actions.</p></div><ShieldCheck size={18} className="muted"/></div><div className="setting-row"><div><b>Require human approval</b><p>Review commands before execution.</p></div><button className={`toggle ${safe?'on':''}`} onClick={()=>setSafe(!safe)}><i/></button></div><div className="settings-note"><ShieldCheck size={15}/> Recommended for development involving embedded and real-time systems.</div></section>
      <section className="panel settings-panel"><div className="panel-title"><div><h3>Appearance</h3><p>Customize your workspace display.</p></div><SlidersHorizontal size={18} className="muted"/></div><label className="field-label">THEME</label><select className="field-select" value={theme} onChange={e=>setTheme(e.target.value)}><option>Dark</option><option>System (planned)</option><option>Light (planned)</option></select><div className="settings-note"><Info size={15}/> Dark theme is the active prototype design.</div></section>
      <section className="panel settings-panel"><div className="panel-title"><div><h3>Environment</h3><p>QNX toolchain connection details.</p></div><Cpu size={18} className="muted"/></div><div className="env-row"><span>QNX SDP version</span><b>8.0 · Not detected</b></div><div className="env-row"><span>Target</span><b>Not configured</b></div><div className="env-row"><span>QEMU</span><b>Not detected</b></div><StatusTag tone="warning">Setup pending</StatusTag></section>
    </div>
  </div>
}

function Toast({ message, onClose }) {
  if (!message) return null
  return <div className="toast"><Info size={16}/><span>{message}</span><button onClick={onClose}><X size={15}/></button></div>
}

export default function App() {
  const [page, setPage] = useState('overview')
  const [backendStatus, setBackendStatus] = useState('checking')

useEffect(() => {
  const checkBackend = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/health')
      const data = await response.json()

      setBackendStatus(
        response.ok && data.status === 'online' ? 'online' : 'offline'
      )
    } catch {
      setBackendStatus('offline')
    }
  }

  checkBackend()
  const interval = setInterval(checkBackend, 5000)

  return () => clearInterval(interval)
}, [])
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const addToast = (msg) => { setToast(msg); window.clearTimeout(window.__atorianToast); window.__atorianToast = window.setTimeout(()=>setToast(''), 4200) }
  const pageInfo = {
    overview: ['Overview','Workspace overview'],
    assistant: ['AI Assistant','Ask questions and explore QNX development'],
    analyzer: ['Build Analyzer','Compiler and build diagnostics'],
    inspector: ['Project Inspector','Project files and configuration'],
    build: ['Build & Test','QNX development operations'],
    docs: ['Documentation','Technical knowledge and references'],
    settings: ['Settings','Workspace preferences']
  }[page]
  const Page = {
    overview: <Overview setPage={setPage}/>,
    assistant: <Assistant addToast={addToast}/>,
    analyzer: <Analyzer addToast={addToast}/>,
    inspector: <Inspector addToast={addToast}/>,
    build: <Build addToast={addToast}/>,
    docs: <Docs addToast={addToast}/>,
    settings: <SettingsPage addToast={addToast}/>
  }[page]
  return <div className="app-shell">
   <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} backendStatus={backendStatus}/>
    <main className={`main-area ${collapsed?'sidebar-collapsed':''}`}>
      <Topbar title={pageInfo[0]} subtitle={pageInfo[1]} setMobileOpen={setMobileOpen} page={page}/>
      {Page}
      <footer className="app-footer"><span>ATORIAN QNX DEVELOPER ASSISTANT <i>·</i> FRONTEND PROTOTYPE</span><span>Built for QNX Global Hackathon 2026</span></footer>
    </main>
    <Toast message={toast} onClose={()=>setToast('')}/>
  </div>
}
