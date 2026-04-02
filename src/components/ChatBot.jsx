import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from 'lucide-react'
import { chatbotAPI } from '../lib/api'

const generateSessionId = () => {
  const stored = localStorage.getItem('chatbot_session')
  if (stored) return stored
  const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('chatbot_session', id)
  return id
}

// Local fallback responses when Gemini API is down
const localFallback = (msg) => {
  const m = msg.toLowerCase().trim()

  // Greetings
  if (/^(hi|hello|hey|yo|wassup|watsup|sup|hola|salam|assalam)/i.test(m))
    return `Hey there! 👋 Welcome to Grand Azure Pakistan! I'm Azure, your AI concierge. How can I help you today?\n\n🏨 Room booking\n🛎️ Hotel services\n💳 Billing queries\n🔧 Report an issue`

  if (/^(how are you|how r u|how's it going|what's up)/i.test(m))
    return `I'm doing great, thanks for asking! 😊 Ready to help you with anything hotel-related. What do you need?`

  // Booking
  if (/book|reserv|room/i.test(m))
    return `Great choice! 🏨 To book a room:\n\n1. Browse our rooms at the **Rooms** page\n2. Select your dates and room type\n3. Click **Book Now**\n\nWe have Standard, Deluxe, Suite, and Presidential rooms. Would you like to know more about any particular type?`

  // Prices
  if (/price|cost|rate|how much|tariff/i.test(m))
    return `Here are our room rates (per night):\n\n🛏️ Standard: Rs. 8,000 - 12,000\n🛏️ Deluxe: Rs. 15,000 - 22,000\n👑 Suite: Rs. 30,000 - 45,000\n🏰 Presidential: Rs. 60,000+\n\nRates vary by season. Check the Rooms page for current availability!`

  // Check-in/out
  if (/check.?in|check.?out|time/i.test(m))
    return `⏰ Our timing:\n\n🟢 Check-in: 2:00 PM onwards\n🔴 Check-out: 12:00 PM\n\nEarly check-in or late check-out can be arranged at the front desk (subject to availability).`

  // Services
  if (/service|amenity|amenities|spa|gym|pool|restaurant|wifi/i.test(m))
    return `We offer premium services! ✨\n\n🍽️ Fine dining restaurant\n💆 Luxury spa & wellness\n🏊 Rooftop infinity pool\n🏋️ 24/7 fitness center\n📶 High-speed WiFi\n🚗 Valet parking\n👔 Laundry & dry cleaning\n🛎️ 24/7 room service\n\nAnything specific you'd like to know about?`

  // Contact
  if (/contact|phone|call|email|address|location|where/i.test(m))
    return `📍 Grand Azure Pakistan\n📞 +92 (42) 111-222-333\n📧 info@grandazure.pk\n📍 Lahore, Pakistan\n\nOur front desk is available 24/7!`

  // Help
  if (/help|support|assist/i.test(m))
    return `I'm here to help! 🤝 I can assist with:\n\n🏨 Room bookings & availability\n💰 Pricing information\n🛎️ Hotel services & amenities\n⏰ Check-in/check-out times\n📞 Contact information\n🔧 Reporting issues\n\nJust ask away!`

  // Cancel
  if (/cancel/i.test(m))
    return `To cancel a booking:\n\n1. Go to **My Bookings** page\n2. Find your booking\n3. Click the **Cancel** button\n\nFree cancellation is available up to 24 hours before check-in. Contact front desk for special cases.`

  // Invoice / payment
  if (/invoice|bill|payment|pay/i.test(m))
    return `💳 For billing queries:\n\n1. Go to **My Invoices** page to view all invoices\n2. Download PDF receipts anytime\n3. We accept Cash, Credit Card, Bank Transfer\n\nNeed help with a specific invoice? Contact our front desk!`

  // Code / non-hotel
  if (/code|html|css|javascript|python|programming|hack/i.test(m))
    return `I appreciate your curiosity! 😊 But I'm your hotel concierge — I can only help with hotel-related queries like bookings, services, and amenities. For technical queries, you'd need a different assistant!\n\nAnything hotel-related I can help with?`

  // Thank you
  if (/thank|thanks|thx|appreciate/i.test(m))
    return `You're welcome! 😊 It was my pleasure to help. If you need anything else during your stay, don't hesitate to ask! 🏨✨`

  // Bye
  if (/bye|goodbye|see ya|later/i.test(m))
    return `Goodbye! 👋 Thank you for choosing Grand Azure Pakistan. We hope to see you soon! Have a wonderful day! 🌟`

  // Default
  return `I'd love to help! 😊 I'm your hotel concierge and can assist with:\n\n🏨 Room bookings & availability\n💰 Pricing\n🛎️ Services & amenities\n⏰ Check-in/out times\n📞 Contact info\n\nCould you rephrase your question or pick one of the topics above?`
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey there! 👋 I'm Azure, your AI concierge at Grand Azure Pakistan. I can help you with:\n\n🏨 Room availability & booking\n🛎️ Hotel services & amenities\n💳 Invoice & payment queries\n🔧 Maintenance requests\n📋 Hotel policies\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(generateSessionId)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await chatbotAPI.getHistory(sessionId)
        if (data.data?.length > 0) {
          setMessages([messages[0], ...data.data.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))])
        }
      } catch (err) { /* fresh session */ }
    }
    loadHistory()
  }, [])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || isLoading) return

    const userMessage = { role: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const { data } = await chatbotAPI.sendMessage(msg, sessionId)
      const reply = data.data?.reply || data.reply
      if (reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
      } else {
        throw new Error('No reply')
      }
    } catch (error) {
      // Use local fallback instead of showing error
      const fallbackReply = localFallback(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackReply, timestamp: new Date() }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <>
      {/* Chat Toggle Button — GOLD theme */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 group" aria-label="Open AI Chatbot">
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(201,168,76,0.25)' }} />
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A67C32)', boxShadow: '0 4px 20px rgba(201,168,76,0.35)' }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
            style={{ background: '#111', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
            Chat with Azure AI 🤖
          </div>
        </button>
      )}

      {/* Chat Window — BLACK + GOLD theme */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: '#0A0A0A', border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(201,168,76,0.1)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(166,124,50,0.1))', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <Bot className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400" style={{ border: '2px solid #0A0A0A' }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#F8F4EF' }}>Azure AI Concierge</h3>
                <p className="text-[11px]" style={{ color: '#C9A84C' }}>Online • Grand Azure Pakistan</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(248,244,239,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,244,239,0.5)'}>
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(248,244,239,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,244,239,0.5)'}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={msg.role === 'user'
                      ? { background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.3)' }
                      : { background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }
                    }>
                    {msg.role === 'user'
                      ? <User className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
                      : <Bot className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
                    }
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={msg.role === 'user'
                      ? { background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)', color: '#F8F4EF', borderBottomRightRadius: '4px' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,244,239,0.85)', borderBottomLeftRadius: '4px' }
                    }>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <span className="block text-[10px] mt-1.5" style={{ color: msg.role === 'user' ? 'rgba(201,168,76,0.6)' : 'rgba(248,244,239,0.3)' }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
                </div>
                <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#C9A84C', animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#C9A84C', animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#C9A84C', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3" style={{ background: '#111111', borderTop: '1px solid rgba(201,168,76,0.12)' }}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about rooms, services..."
                rows={1}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  color: '#F8F4EF',
                  maxHeight: '100px',
                  caretColor: '#C9A84C'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A67C32)', boxShadow: '0 2px 10px rgba(201,168,76,0.3)' }}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(201,168,76,0.35)' }}>
              Powered by AI • Hotel queries only
            </p>
          </div>
        </div>
      )}
    </>
  )
}
