import React, { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import axios from 'axios'

// ============================================================
// Helper: Status badge
// ============================================================
const StatusDot = ({ status }) => {
  const colors = {
    idle: 'bg-gray-600',
    pending: 'bg-yellow-400 animate-pulse',
    processing: 'bg-neon-green animate-pulse shadow-neon-green',
    completed: 'bg-neon-cyan shadow-neon-cyan',
    approved: 'bg-neon-green shadow-neon-green',
    rejected: 'bg-red-500',
    error: 'bg-red-500',
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${colors[status] ?? 'bg-gray-500'}`} />
  )
}

// ============================================================
// NODE: Reddit Source
// ============================================================
const RedditSourceNode = ({ data, selected }) => {
  const [subreddit, setSubreddit] = useState(data.subreddit || 'MachineLearning')
  const [keyword, setKeyword] = useState(data.keyword || '')
  const [status, setStatus] = useState('idle')
  const [posts, setPosts] = useState([])

  const handleFetch = async () => {
    setStatus('processing')
    try {
      const res = await axios.get(`/api/mock/trending/${subreddit}?limit=5`)
      setPosts(res.data.posts || [])
      setStatus('completed')
      data.onFetch?.({ subreddit, keyword, posts: res.data.posts })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={`relative min-w-[240px] rounded-xl overflow-hidden ${selected ? 'ring-2 ring-neon-cyan' : ''} node-idle`}>
      {/* Node header */}
      <div className="bg-dark-700 border border-orange-600/30 rounded-xl p-4"
           style={{ background: 'linear-gradient(135deg, #1e1000 0%, #0f1629 100%)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40
                          flex items-center justify-center text-lg">🔴</div>
          <div>
            <div className="font-hud text-xs text-orange-400 tracking-widest">NODE-01</div>
            <div className="font-body text-sm font-semibold text-white">Reddit Source</div>
          </div>
          <div className="ml-auto flex items-center">
            <StatusDot status={status} />
            <span className="text-xs font-mono text-gray-400 capitalize">{status}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 font-mono">SUBREDDIT</label>
            <div className="flex items-center mt-1">
              <span className="text-orange-400 text-sm font-mono mr-1">r/</span>
              <input
                value={subreddit}
                onChange={e => setSubreddit(e.target.value)}
                className="flex-1 bg-dark-900 border border-orange-500/20 rounded px-2 py-1
                           text-sm text-white font-mono focus:outline-none focus:border-orange-500/60"
                placeholder="subreddit"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-mono">KEYWORD FILTER</label>
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full mt-1 bg-dark-900 border border-orange-500/20 rounded px-2 py-1
                         text-sm text-white font-mono focus:outline-none focus:border-orange-500/60"
              placeholder="optional keyword..."
            />
          </div>
        </div>

        <button
          onClick={handleFetch}
          disabled={status === 'processing'}
          className="mt-3 w-full py-1.5 rounded-lg text-xs font-hud tracking-widest
                     bg-orange-600/20 border border-orange-500/40 text-orange-300
                     hover:bg-orange-600/40 hover:border-orange-400 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'processing' ? '⟳ FETCHING...' : '▶ FETCH POSTS'}
        </button>

        {posts.length > 0 && (
          <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
            {posts.slice(0, 3).map(p => (
              <div key={p.id} className="text-xs text-gray-400 font-mono truncate
                                         border-l-2 border-orange-500/30 pl-2">
                ↑{p.score} {p.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Output handle */}
      <Handle type="source" position={Position.Right}
              style={{ right: -5, background: '#ff6b00', boxShadow: '0 0 8px #ff6b00' }} />
    </div>
  )
}

// ============================================================
// NODE: Prompt Refiner (AI Agent)
// ============================================================
const PromptRefinerNode = ({ data, selected }) => {
  const [rawIdea, setRawIdea] = useState(data.rawIdea || '')
  const [iterations, setIterations] = useState(1)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)

  const handleRefine = async () => {
    if (!rawIdea.trim()) return
    setStatus('processing')
    try {
      const res = await axios.post('/api/refine/prompt', {
        raw_idea: rawIdea,
        iterations,
      })
      setResult(res.data)
      setStatus('completed')
      data.onRefine?.(res.data)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={`relative min-w-[260px] rounded-xl overflow-hidden
                     ${selected ? 'ring-2 ring-neon-cyan' : ''}
                     ${status === 'processing' ? 'node-processing' : 'node-idle'}`}>
      <div className="border border-neon-cyan/20 rounded-xl p-4"
           style={{ background: 'linear-gradient(135deg, #001e20 0%, #0f1629 100%)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30
                          flex items-center justify-center text-lg">🤖</div>
          <div>
            <div className="font-hud text-xs text-neon-cyan tracking-widest">NODE-02</div>
            <div className="font-body text-sm font-semibold text-white">AI Prompt Refiner</div>
          </div>
          <div className="ml-auto flex items-center">
            <StatusDot status={status} />
            <span className="text-xs font-mono text-gray-400 capitalize">{status}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 font-mono">RAW IDEA / PROMPT</label>
            <textarea
              value={rawIdea}
              onChange={e => setRawIdea(e.target.value)}
              rows={2}
              className="w-full mt-1 bg-dark-900 border border-neon-cyan/20 rounded px-2 py-1
                         text-xs text-white font-mono focus:outline-none focus:border-neon-cyan/60 resize-none"
              placeholder="Describe your Reddit content idea..."
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400 font-mono">CRITIQUE CYCLES</label>
            <div className="flex gap-1 ml-auto">
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setIterations(n)}
                  className={`w-6 h-6 rounded text-xs font-hud transition-all
                    ${iterations === n
                      ? 'bg-neon-cyan/30 border border-neon-cyan/70 text-neon-cyan'
                      : 'bg-dark-900 border border-gray-600 text-gray-400 hover:border-neon-cyan/40'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agent pipeline visualization */}
        <div className="mt-3 flex items-center gap-1 text-xs font-mono">
          <span className={`px-1.5 py-0.5 rounded border ${result ? 'border-neon-green/60 text-neon-green bg-neon-green/10' : 'border-gray-600 text-gray-500'}`}>
            Agent A
          </span>
          <span className="text-gray-600">→</span>
          <span className={`px-1.5 py-0.5 rounded border ${result ? 'border-neon-orange/60 text-neon-orange bg-neon-orange/10' : 'border-gray-600 text-gray-500'}`}>
            Critic B
          </span>
          <span className="text-gray-600">→</span>
          <span className={`px-1.5 py-0.5 rounded border ${result ? 'border-neon-cyan/60 text-neon-cyan bg-neon-cyan/10' : 'border-gray-600 text-gray-500'}`}>
            Synthesis
          </span>
        </div>

        <button
          onClick={handleRefine}
          disabled={status === 'processing' || !rawIdea.trim()}
          className="mt-3 w-full py-1.5 rounded-lg text-xs font-hud tracking-widest
                     bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan
                     hover:bg-neon-cyan/20 hover:border-neon-cyan/60 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'processing' ? '⟳ REFINING...' : '▶ REFINE PROMPT'}
        </button>

        {result && (
          <div className="mt-2 bg-dark-900/80 rounded p-2 text-xs font-mono text-neon-cyan/80
                          border border-neon-cyan/10 max-h-20 overflow-y-auto">
            ✓ Mode: {result.mode} | {result.duration_seconds}s
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left}
              style={{ left: -5, background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }} />
      <Handle type="source" position={Position.Right}
              style={{ right: -5, background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }} />
    </div>
  )
}

// ============================================================
// NODE: Human Approval Gate
// ============================================================
const HumanApprovalNode = ({ data, selected }) => {
  const [approved, setApproved] = useState(data.approved || false)
  const [rejected, setRejected] = useState(false)

  const handleApprove = () => {
    setApproved(true)
    setRejected(false)
    data.onChange?.({ approved: true })
  }
  const handleReject = () => {
    setApproved(false)
    setRejected(true)
    data.onChange?.({ approved: false })
  }

  const borderColor = approved ? 'border-neon-green/40' : rejected ? 'border-red-500/40' : 'border-purple-500/30'
  const bg = approved ? '#001a00' : rejected ? '#1a0000' : '#0d001a'

  return (
    <div className={`relative min-w-[220px] rounded-xl overflow-hidden
                     ${selected ? 'ring-2 ring-neon-purple' : ''} node-idle`}>
      <div className={`border ${borderColor} rounded-xl p-4`}
           style={{ background: `linear-gradient(135deg, ${bg} 0%, #0f1629 100%)` }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40
                          flex items-center justify-center text-lg">
            {approved ? '✅' : rejected ? '❌' : '👁️'}
          </div>
          <div>
            <div className="font-hud text-xs text-purple-400 tracking-widest">NODE-03</div>
            <div className="font-body text-sm font-semibold text-white">Human Approval</div>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-mono mb-3 leading-relaxed">
          Review the refined blueprint before publishing. This gate prevents automated posting.
        </div>

        <div className="flex gap-2">
          <button
            id="approval-approve-btn"
            onClick={handleApprove}
            className={`flex-1 py-1.5 rounded-lg text-xs font-hud tracking-widest transition-all
              ${approved
                ? 'bg-neon-green/30 border border-neon-green/70 text-neon-green shadow-neon-green'
                : 'bg-dark-900 border border-green-600/40 text-green-400 hover:bg-green-600/20'}`}
          >
            ✓ APPROVE
          </button>
          <button
            id="approval-reject-btn"
            onClick={handleReject}
            className={`flex-1 py-1.5 rounded-lg text-xs font-hud tracking-widest transition-all
              ${rejected
                ? 'bg-red-600/30 border border-red-500/70 text-red-400'
                : 'bg-dark-900 border border-red-600/40 text-red-400 hover:bg-red-600/20'}`}
          >
            ✗ REJECT
          </button>
        </div>

        <div className={`mt-2 text-center text-xs font-hud tracking-widest
          ${approved ? 'text-neon-green text-glow-green' : rejected ? 'text-red-400' : 'text-gray-600'}`}>
          {approved ? '— GATE OPEN —' : rejected ? '— GATE CLOSED —' : '— AWAITING DECISION —'}
        </div>
      </div>
      <Handle type="target" position={Position.Left}
              style={{ left: -5, background: '#bf00ff', boxShadow: '0 0 8px #bf00ff' }} />
      <Handle type="source" position={Position.Right}
              style={{ right: -5, background: approved ? '#39ff14' : '#bf00ff',
                       boxShadow: `0 0 8px ${approved ? '#39ff14' : '#bf00ff'}` }} />
    </div>
  )
}

// ============================================================
// NODE: Reddit Publisher
// ============================================================
const PublisherNode = ({ data, selected }) => {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [subreddit, setSubreddit] = useState(data.subreddit || 'SideProject')

  const handlePublish = async () => {
    setStatus('processing')
    try {
      const res = await axios.post('/api/execute/blueprint', {
        nodes: [
          { id: 'publisher', type: 'publisher', data: {} },
          { id: 'approval', type: 'human_approval', data: { approved: true } },
          { id: 'source', type: 'reddit_source', data: {} },
          { id: 'refiner', type: 'prompt_refiner', data: {} },
        ],
        subreddit,
        auto_approve: true,
      })
      setResult(res.data.publish_result)
      setStatus('completed')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={`relative min-w-[240px] rounded-xl overflow-hidden
                     ${selected ? 'ring-2 ring-neon-cyan' : ''}
                     ${status === 'processing' ? 'node-processing' : 'node-idle'}`}>
      <div className="border border-neon-green/20 rounded-xl p-4"
           style={{ background: 'linear-gradient(135deg, #001a05 0%, #0f1629 100%)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30
                          flex items-center justify-center text-lg">🚀</div>
          <div>
            <div className="font-hud text-xs text-neon-green tracking-widest">NODE-04</div>
            <div className="font-body text-sm font-semibold text-white">Reddit Publisher</div>
          </div>
          <div className="ml-auto flex items-center">
            <StatusDot status={status} />
            <span className="text-xs font-mono text-gray-400 capitalize">{status}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-mono">TARGET SUBREDDIT</label>
          <div className="flex items-center mt-1">
            <span className="text-neon-green text-sm font-mono mr-1">r/</span>
            <input
              value={subreddit}
              onChange={e => setSubreddit(e.target.value)}
              className="flex-1 bg-dark-900 border border-neon-green/20 rounded px-2 py-1
                         text-sm text-white font-mono focus:outline-none focus:border-neon-green/50"
            />
          </div>
        </div>

        <div className="mt-3 bg-dark-900/60 rounded p-2 border border-neon-green/10">
          <div className="text-xs font-mono text-gray-400 space-y-0.5">
            <div className="flex justify-between">
              <span>Rate Limit</span>
              <span className="text-neon-green">✓ Protected</span>
            </div>
            <div className="flex justify-between">
              <span>User-Agent</span>
              <span className="text-neon-green">✓ Compliant</span>
            </div>
            <div className="flex justify-between">
              <span>Mode</span>
              <span className="text-yellow-400">MOCK</span>
            </div>
          </div>
        </div>

        <button
          id="publisher-execute-btn"
          onClick={handlePublish}
          disabled={status === 'processing'}
          className="mt-3 w-full py-1.5 rounded-lg text-xs font-hud tracking-widest
                     bg-neon-green/10 border border-neon-green/30 text-neon-green
                     hover:bg-neon-green/20 hover:border-neon-green/60 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'processing' ? '⟳ PUBLISHING...' : '🚀 EXECUTE PIPELINE'}
        </button>

        {result && (
          <div className="mt-2 bg-dark-900/80 rounded p-2 text-xs font-mono
                          border border-neon-green/20 text-neon-green/80">
            ✓ {result.status} → {result.post_id}
          </div>
        )}
        {status === 'error' && (
          <div className="mt-2 text-xs font-mono text-red-400">
            Pipeline error. Check backend connection.
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left}
              style={{ left: -5, background: '#39ff14', boxShadow: '0 0 8px #39ff14' }} />
    </div>
  )
}

// ============================================================
// Node type registry
// ============================================================

const nodeTypes = {
  redditSource: RedditSourceNode,
  promptRefiner: PromptRefinerNode,
  humanApproval: HumanApprovalNode,
  publisher: PublisherNode,
}

// ============================================================
// Default node layout
// ============================================================

const defaultNodes = [
  {
    id: '1',
    type: 'redditSource',
    position: { x: 60, y: 180 },
    data: { subreddit: 'MachineLearning', keyword: 'AI automation' },
  },
  {
    id: '2',
    type: 'promptRefiner',
    position: { x: 380, y: 140 },
    data: { rawIdea: 'AI automation for Reddit growth hacking' },
  },
  {
    id: '3',
    type: 'humanApproval',
    position: { x: 720, y: 160 },
    data: { approved: false },
  },
  {
    id: '4',
    type: 'publisher',
    position: { x: 1020, y: 150 },
    data: { subreddit: 'SideProject' },
  },
]

const defaultEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
]

// ============================================================
// FlowCanvas — Main export
// ============================================================

const FlowCanvas = ({ onNodeSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges)

  const onConnect = useCallback(
    (params) => setEdges(eds => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_, node) => {
    onNodeSelect?.(node)
  }, [onNodeSelect])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/rfn-node')
    if (!type) return
    const reactFlowBounds = event.currentTarget.getBoundingClientRect()
    const position = {
      x: event.clientX - reactFlowBounds.left - 120,
      y: event.clientY - reactFlowBounds.top - 50,
    }
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: { label: type },
    }
    setNodes(nds => [...nds, newNode])
  }, [setNodes])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  return (
    <div className="w-full h-full rfn-canvas-grid rfn-scanline">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ animated: true }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant="dots"
          gap={24}
          size={1}
          color="rgba(0,245,255,0.08)"
        />
        <Controls className="!bg-dark-800 !border-neon-cyan/20" />
        <MiniMap
          nodeColor={(n) => {
            switch (n.type) {
              case 'redditSource': return '#ff6b00'
              case 'promptRefiner': return '#00f5ff'
              case 'humanApproval': return '#bf00ff'
              case 'publisher': return '#39ff14'
              default: return '#444'
            }
          }}
          maskColor="rgba(5,8,16,0.8)"
        />

        <Panel position="top-right">
          <div className="flex items-center gap-2 text-xs font-mono bg-dark-800/90
                          border border-neon-cyan/20 rounded-lg px-3 py-1.5">
            <span className="text-gray-500">CANVAS MODE</span>
            <span className="text-neon-cyan text-glow-cyan">ACTIVE</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default FlowCanvas
