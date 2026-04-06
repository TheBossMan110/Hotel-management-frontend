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
  if (/^(hi|hello|hey|yo|wassup|watsup|sup|hola|salam|assalam|good morning|good evening|good afternoon)/i.test(m))
    return `Heyyy! 👋 Welcome to Grand Azure Pakistan! I'm Azure, your AI concierge and I'm SO happy you're here! 😊\n\nHow can I make your day better? I can help with:\n\n🏨 Room booking & availability\n🛎️ Hotel services & amenities\n💳 Billing & invoices\n🔧 Report an issue\n\nJust ask me anything! 🌟`

  // How are you / small talk
  if (/how are you|how r u|how's it going|what's up|how do you do|how u doing/i.test(m))
    return `I'm doing amazing, thank you for asking! 😊✨ It always makes my day when someone checks in on me haha!\n\nI'm ready to help you with whatever you need. What's on your mind? 🏨`

  // Who are you
  if (/who are you|what are you|what's your name|your name/i.test(m))
    return `I'm Azure! 🤖✨ Your friendly AI concierge at Grand Azure Pakistan. Think of me as your personal hotel assistant — I know everything about our rooms, services, dining, and more!\n\nWhat can I help you with today?`

  // Compliments
  if (/you('re| are) (great|amazing|awesome|cool|nice|helpful|good|the best)/i.test(m))
    return `Aww, you're making me blush! 😊💛 Thank you so much! I try my best to be helpful. You're pretty awesome yourself!\n\nAnything else I can help you with? 🌟`

  // Jokes / fun
  if (/tell me a joke|joke|funny|make me laugh/i.test(m))
    return `Haha okay here's one! 😄\n\nWhy did the hotel guest bring a ladder? Because they wanted a room with a VIEW! 🏔️😂\n\n*ba dum tss* 🥁\n\nOkay okay, I know my jokes need work 😅 But you know what doesn't? Our rooms and services! Need help with anything? 🏨`

  // Booking
  if (/book|reserv|room/i.test(m))
    return `Great choice! 🏨✨ Booking is super easy:\n\n1. Head to the **Rooms** page and browse our collection\n2. Pick your dates and room type\n3. Click **Book Now** — done! 🎉\n\nWe have Standard, Deluxe, Suite, and Presidential rooms. Each one is gorgeous! Would you like to know more about any particular type? 💫`

  // Prices
  if (/price|cost|rate|how much|tariff|expensive|cheap|budget/i.test(m))
    return `Here are our room rates (per night) 💰:\n\n🛏️ Standard: PKR 8,000 - 12,000\n🛏️ Deluxe: PKR 15,000 - 22,000\n👑 Suite: PKR 30,000 - 45,000\n🏰 Presidential: PKR 60,000+\n\nRates vary by season and availability. Check the **Rooms** page for the latest prices! The best deal? Book directly — no middleman fees! 😉`

  // Check-in/out
  if (/check.?in|check.?out|time/i.test(m))
    return `⏰ Here's our timing:\n\n🟢 Check-in: 2:00 PM onwards\n🔴 Check-out: 12:00 PM\n\nNeed early check-in or late check-out? No worries! Just ask the front desk and we'll try our best to accommodate you 😊`

  // Services
  if (/service|amenity|amenities|spa|gym|pool|restaurant|wifi|swim|food|dine|dining/i.test(m))
    return `Oh you're gonna love this! We offer premium services! ✨\n\n🍽️ Fine dining restaurant (the food is *chef's kiss* 👨‍🍳)\n💆 Luxury spa & wellness center\n🏊 Rooftop infinity pool\n🏋️ 24/7 fitness center\n📶 High-speed WiFi everywhere\n🚗 Valet parking\n👔 Laundry & dry cleaning\n🛎️ 24/7 room service\n\nAnything specific you'd like to know more about? 😊`

  // Contact
  if (/contact|phone|call|email|address|location|where/i.test(m))
    return `Here's how to reach us! 📱\n\n📍 Grand Azure Pakistan\n📞 +92 (42) 111-222-333\n📧 info@grandazure.pk\n📍 Lahore, Pakistan\n\nOur front desk team is available 24/7 and they're amazing! Don't hesitate to call anytime 😊`

  // Help
  if (/help|support|assist/i.test(m))
    return `Of course, I'm here for you! 🤝💛\n\nI can help with:\n\n🏨 Room bookings & availability\n💰 Pricing information\n🛎️ Hotel services & amenities\n⏰ Check-in/check-out times\n📞 Contact information\n🔧 Reporting issues\n📋 Your booking details\n\nJust ask away — no question is too small! 😊`

  // Cancel
  if (/cancel/i.test(m))
    return `No worries, cancellations happen! Here's how:\n\n1. Go to **My Bookings** page\n2. Find your booking\n3. Click the **Cancel** button\n\n✅ Free cancellation up to 24 hours before check-in\n⚠️ Late cancellations may have a fee\n\nNeed help with something specific? I'm here! 😊`

  // Invoice / payment
  if (/invoice|bill|payment|pay|receipt/i.test(m))
    return `Got it! 💳 For billing stuff:\n\n1. Go to **My Invoices** page to see all your invoices\n2. Download PDF receipts anytime you need them\n3. We accept Cash, Credit Card, and Bank Transfer\n\nNeed help with a specific invoice? Just reach out to our front desk and they'll sort it out! 😊`

  // Code / non-hotel / tech
  if (/code|html|css|javascript|python|programming|hack|program|develop|software/i.test(m))
    return `Haha nice try! 😄 I'm flattered you think I'm that smart, but I'm your hotel concierge — not a developer! 💻➡️🏨\n\nBUT I CAN help you book an amazing room, find the best spa treatment, or order some incredible room service! What sounds good? 🌟`

  // Weather
  if (/weather|rain|hot|cold|temperature/i.test(m))
    return `Great question! ☀️ I don't have live weather data, but I can tell you our hotel is comfy year-round! We've got great AC in summer and cozy heating in winter 😊\n\nFor current weather, check a weather app — but no matter what it says outside, it's always perfect inside Grand Azure! 🏨✨`

  // Thank you
  if (/thank|thanks|thx|appreciate|shukriya|shukria/i.test(m))
    return `You're so welcome! 😊💛 It's genuinely my pleasure to help. That's what I'm here for!\n\nIf you need anything else — literally anything — just pop back and say hi. I'm always here! 🏨✨\n\nHave an amazing day! 🌟`

  // Bye
  if (/bye|goodbye|see ya|later|good night|gn|take care/i.test(m))
    return `Aww, bye bye! 👋😊 It was lovely chatting with you! Thank you for choosing Grand Azure Pakistan.\n\nCome back anytime — I'll be right here waiting! Have a wonderful day/night! 🌟✨\n\nTake care! 💛`

  // Feelings / emotional
  if (/sad|bored|tired|lonely|stressed|happy|excited/i.test(m))
    return `Aww, I hear you! 😊 You know what always helps? A little luxury and pampering! \n\nHow about:\n🍽️ Some amazing room service comfort food?\n💆 A relaxing spa session?\n🏊 A dip in our infinity pool?\n\nSometimes all you need is a little treat-yourself moment! What sounds good? 🌟`

  // Non-hotel / random
  if (/politics|religion|personal|dating|relationship/i.test(m))
    return `Haha, that's a bit outside my expertise! 😅 I'm all about making your hotel stay absolutely perfect.\n\nBut hey, need help with rooms, dining, spa, or anything hotel-related? I'm your person! 🏨💛`

  // Default — friendly and inviting
  return `Hmm, that's an interesting one! 😊 I might not have the perfect answer for that, but I'm great with hotel stuff!\n\nHere's what I can definitely help you with:\n\n🏨 Room bookings & availability\n💰 Pricing & packages\n🛎️ Services & amenities\n⏰ Check-in/out info\n📞 Contact details\n\nTry asking about any of these — I promise I'll give you an amazing answer! 😄✨`
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
