import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'model'
  parts: { text: string }[]
}

interface Model {
  id: string
  name: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState<Record<string, Model>>({})
  const [currentModel, setCurrentModel] = useState('gemini-3-pro-preview')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => setModels(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      parts: [{ text: input }]
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentModel,
          messages: newMessages
        })
      })

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMessages([...newMessages, {
        role: 'model',
        parts: [{ text: data.text }]
      }])
    } catch (error: any) {
      alert('Error: ' + error.message)
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        background: '#4285f4',
        borderRadius: '8px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '20px' }}>Gemini AI Chat</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={currentModel}
            onChange={(e) => {
              setCurrentModel(e.target.value)
              clearChat()
            }}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: 'none'
            }}
          >
            {Object.entries(models).map(([key, model]) => (
              <option key={key} value={model.id}>{model.name}</option>
            ))}
          </select>
          <button
            onClick={clearChat}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center' }}>
            Start a conversation with Gemini AI
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '15px',
              padding: '12px',
              borderRadius: '8px',
              background: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
              marginLeft: msg.role === 'user' ? '40px' : '0',
              marginRight: msg.role === 'model' ? '40px' : '0'
            }}
          >
            <strong style={{ color: msg.role === 'user' ? '#1976d2' : '#666' }}>
              {msg.role === 'user' ? 'You' : 'Gemini'}:
            </strong>
            <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
              {msg.parts[0].text}
            </p>
          </div>
        ))}
        {loading && (
          <div style={{ padding: '12px', color: '#999' }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#4285f4',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default App
