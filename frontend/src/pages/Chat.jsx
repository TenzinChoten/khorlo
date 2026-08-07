import React, { useState } from 'react';
import { Send, Paperclip, MoreVertical, Search } from 'lucide-react';

const Chat = () => {
  const [activeChat, setActiveChat] = useState(1);

  const chats = [
    { id: 1, name: 'TechNova', lastMessage: 'Great! Let\'s proceed with that timeline.', time: '10:42 AM', unread: 2 },
    { id: 2, name: 'GlowCosmetics', lastMessage: 'Can you send over the mood board?', time: 'Yesterday', unread: 0 },
    { id: 3, name: 'FitLife', lastMessage: 'Payment has been processed.', time: 'Monday', unread: 0 },
  ];

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Messages</h1>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '300px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.25rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '8px', outline: 'none', fontSize: '0.875rem' }}
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat.id)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid rgba(255,255,255,0.02)', 
                  display: 'flex', 
                  gap: '1rem', 
                  cursor: 'pointer',
                  background: activeChat === chat.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', flexShrink: 0 }}></div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{chat.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{chat.time}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: chat.unread > 0 ? 'white' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.lastMessage}
                  </div>
                </div>
                {chat.unread > 0 && (
                  <div style={{ width: '20px', height: '20px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, alignSelf: 'center' }}>
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src="https://ui-avatars.com/api/?name=TechNova&background=random&color=fff" alt="TechNova" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <div>
                <div style={{ fontWeight: 600 }}>TechNova</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Smart Home Hub Launch</div>
              </div>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', flexShrink: 0 }}></div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px 12px 12px 0', maxWidth: '70%' }}>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>Hi Alex! We loved your recent video and think you'd be a great fit for our Smart Home Hub launch.</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>10:30 AM</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row-reverse' }}>
              <div style={{ background: 'var(--accent)', padding: '1rem', borderRadius: '12px 12px 0 12px', maxWidth: '70%' }}>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>Thanks for reaching out! I've been eyeing that hub. The timeline in the brief works perfectly for me.</p>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '0.5rem', textAlign: 'right' }}>10:35 AM</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <img src="https://ui-avatars.com/api/?name=TechNova&background=random&color=fff" alt="TechNova" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px 12px 12px 0', maxWidth: '70%' }}>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>Great! Let's proceed with that timeline. I'll send over the contract shortly.</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>10:42 AM</span>
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                placeholder="Type a message..." 
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.875rem' }}
              />
              <button style={{ background: 'var(--accent)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
