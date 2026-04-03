import React, { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';

function App() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-950 font-sans text-white overflow-hidden">
      {/* HUD Header */}
      <header className="h-14 bg-dark-900 border-b border-neon-cyan/30 flex items-center px-6 shrink-0 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,245,255,0.3)]">
            <span className="font-hud text-neon-cyan text-lg">⌬</span>
          </div>
          <div>
             <h1 className="text-sm font-hud font-bold tracking-[0.2em] text-glow-cyan text-neon-cyan">RFN: CORE</h1>
             <p className="text-[10px] font-mono text-gray-500 uppercase">Reddit Flow Node v2.0</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="px-3 py-1 rounded bg-dark-800 border border-yellow-500/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[10px] font-mono text-yellow-400 tracking-wider">MOCK MODE ACTIVE</span>
          </div>
          <div className="w-px h-6 bg-gray-800" />
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-500">SYS_STATUS:</span>
            <span className="text-neon-green text-glow-green">ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 relative border-l border-r border-transparent">
           <FlowCanvas onNodeSelect={setSelectedNode} />
        </main>

        {/* Right Inspector Panel */}
        {selectedNode && (
          <aside className="w-72 bg-dark-900 border-l border-neon-cyan/20 p-4 flex flex-col shrink-0 relative transition-all">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xs font-hud text-neon-cyan tracking-widest text-glow-cyan">INSPECTOR</h2>
               <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
             </div>
             <div className="h-px bg-gradient-to-r from-neon-cyan/50 to-transparent mb-4" />
             
             <div className="space-y-4 font-mono text-xs text-gray-300">
               <div>
                 <label className="text-[10px] text-gray-500 block mb-1">NODE ID</label>
                 <div className="bg-dark-950 border border-gray-800 p-2 rounded">{selectedNode.id}</div>
               </div>
               <div>
                 <label className="text-[10px] text-gray-500 block mb-1">NODE TYPE</label>
                 <div className="bg-dark-950 border border-gray-800 p-2 rounded text-neon-cyan">{selectedNode.type}</div>
               </div>
               <div>
                 <label className="text-[10px] text-gray-500 block mb-1">DATA PAYLOAD</label>
                 <pre className="bg-dark-950 border border-gray-800 p-2 rounded overflow-x-auto text-[10px] text-green-400">
                   {JSON.stringify(selectedNode.data, null, 2)}
                 </pre>
               </div>
             </div>
          </aside>
        )}
      </div>
      
      {/* HUD Footer */}
      <footer className="h-6 bg-dark-950 border-t border-neon-cyan/20 flex items-center px-4 justify-between shrink-0 text-[10px] font-mono text-gray-600">
        <div>SECURE CONNECTION ESTABLISHED</div>
        <div className="flex gap-4">
           <span>LATENCY: 12ms</span>
           <span>CPU: 4%</span>
           <span>MEM: 128MB</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
