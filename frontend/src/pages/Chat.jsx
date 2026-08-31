import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Send, Search, ArrowLeft, ExternalLink } from 'lucide-react';
import { fetchApi, getMediaUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

function formatMessageTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function participantAvatar(participant) {
  if (!participant) return 'https://ui-avatars.com/api/?name=User&background=333&color=fff';
  if (participant.avatarUrl) return getMediaUrl(participant.avatarUrl);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name || 'User')}&background=random&color=fff`;
}

const Chat = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [query, setQuery] = useState('');

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [messageUsage, setMessageUsage] = useState(null);

  const feedRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetchApi('/conversations');
      setConversations(res.conversations || []);
      setListError(null);
    } catch (err) {
      setListError(err.message || 'Failed to load conversations.');
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (conversationId, { silent } = {}) => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setThreadError(null);
      return;
    }
    if (!silent) {
      setThreadLoading(true);
      setThreadError(null);
    }
    try {
      const [detailRes, messagesRes] = await Promise.all([
        fetchApi(`/conversations/${conversationId}`),
        fetchApi(`/conversations/${conversationId}/messages`),
      ]);
      setConversation(detailRes.conversation);
      setMessages(messagesRes.messages || []);
      setThreadError(null);
      // [Reason] Opening a thread marks messages read on the server; refresh inbox badges
      loadConversations();
    } catch (err) {
      setThreadError(err.message || 'Failed to load conversation.');
      if (err.status === 403 || err.status === 404) {
        setConversation(null);
        setMessages([]);
      }
    } finally {
      setThreadLoading(false);
    }
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (user?.role !== 'BUSINESS') return undefined;
    let cancelled = false;
    // [Reason] Brand composers need the monthly message cap before the send request fails
    fetchApi('/subscriptions/me')
      .then((res) => {
        if (!cancelled) setMessageUsage(res.usage || null);
      })
      .catch(() => {
        if (!cancelled) setMessageUsage(null);
      });
    return () => { cancelled = true; };
  }, [user?.role]);

  useEffect(() => {
    loadThread(activeId);
  }, [activeId, loadThread]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, threadLoading]);

  // [Reason] No realtime layer exists yet; poll so new messages appear without a refresh
  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;
      loadConversations();
      if (activeId) loadThread(activeId, { silent: true });
    };
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [activeId, loadConversations, loadThread]);

  const filteredConversations = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((item) => {
      const name = item.otherParticipant?.name?.toLowerCase() || '';
      const campaign = item.campaign?.title?.toLowerCase() || '';
      const preview = item.latestMessage?.message?.toLowerCase() || '';
      return name.includes(term) || campaign.includes(term) || preview.includes(term);
    });
  }, [conversations, query]);

  const openConversation = (conversationId) => {
    setSearchParams({ conversationId });
  };

  const closeConversation = () => {
    setSearchParams({});
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    if (conversation?.applicationStatus && conversation.applicationStatus !== 'ACCEPTED') {
      setSendError('Messaging is only available for accepted applications.');
      return;
    }
    if (
      messageUsage &&
      messageUsage.messagesThisMonth >= messageUsage.messageLimit
    ) {
      setSendError(
        `Your plan allows ${messageUsage.messageLimit} messages per month. Upgrade to send more.`
      );
      return;
    }

    setSending(true);
    setSendError(null);
    try {
      const res = await fetchApi(`/conversations/${activeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      setDraft('');
      setMessages((prev) => [...prev, res.message]);
      setMessageUsage((prev) =>
        prev
          ? { ...prev, messagesThisMonth: prev.messagesThisMonth + 1 }
          : prev
      );
      loadConversations();
    } catch (err) {
      setSendError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const other = conversation?.otherParticipant;
  const atMessageLimit = Boolean(
    messageUsage && messageUsage.messagesThisMonth >= messageUsage.messageLimit
  );
  const canSend = conversation?.applicationStatus === 'ACCEPTED' && !atMessageLimit;

  return (
    <div className={`animate-fade-in messages-page${activeId ? ' chat-open' : ''}`}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Messages</h1>

      <div className="apple-panel messages-shell">
        <div className="messages-sidebar">
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--apple-border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--apple-text-secondary)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.25rem', background: 'var(--apple-bg)', border: 'none', color: 'var(--apple-text-primary)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div className="messages-list">
            {listLoading && (
              <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading conversations...</div>
            )}
            {listError && (
              <div style={{ padding: '1.5rem', color: '#ff3b30', fontSize: '0.875rem' }}>{listError}</div>
            )}
            {!listLoading && !listError && filteredConversations.length === 0 && (
              <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No conversations yet. They appear when an application is accepted.
              </div>
            )}
            {filteredConversations.map((item) => {
              const unread = item.unreadCount || 0;
              const isActive = item.conversationId === activeId;
              return (
                <div
                  key={item.conversationId}
                  onClick={() => openConversation(item.conversationId)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--apple-border)',
                    display: 'flex',
                    gap: '1rem',
                    cursor: 'pointer',
                    background: isActive ? 'var(--apple-bg)' : 'transparent',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <img
                    src={participantAvatar(item.otherParticipant)}
                    alt={item.otherParticipant?.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.otherParticipant?.name || 'Participant'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', flexShrink: 0 }}>
                        {formatMessageTime(item.latestMessage?.createdAt || item.updatedAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.campaign?.title || 'Campaign'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: unread > 0 ? 'var(--apple-text-primary)' : 'var(--apple-text-secondary)', fontWeight: unread > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.latestMessage?.message || 'No messages yet'}
                    </div>
                  </div>
                  {unread > 0 && (
                    <div style={{ minWidth: '20px', height: '20px', padding: '0 0.35rem', background: 'var(--apple-accent)', color: '#fff', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, alignSelf: 'center' }}>
                      {unread}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="messages-thread">
          {!activeId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
              Select a conversation to start messaging.
            </div>
          ) : threadLoading && !conversation ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading conversation...
            </div>
          ) : threadError && !conversation ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3b30', padding: '2rem', textAlign: 'center' }}>
              {threadError}
            </div>
          ) : (
            <>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--apple-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <button className="messages-back" onClick={closeConversation} aria-label="Back to conversations">
                    <ArrowLeft size={20} />
                  </button>
                  <img
                    src={participantAvatar(other)}
                    alt={other?.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{other?.name || 'Participant'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conversation?.campaign?.title || 'Campaign'}
                    </div>
                  </div>
                </div>
                {conversation?.campaign?.id && (
                  <Link
                    to={`/dashboard/campaign/${conversation.campaign.id}`}
                    style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', textDecoration: 'none', flexShrink: 0 }}
                  >
                    <ExternalLink size={16} /> Campaign
                  </Link>
                )}
              </div>

              <div ref={feedRef} className="messages-feed">
                {threadLoading && messages.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading messages...</div>
                )}
                {!threadLoading && messages.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
                    No messages yet. Say hello and introduce yourself for this campaign.
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      style={{ display: 'flex', gap: '0.75rem', flexDirection: isMine ? 'row-reverse' : 'row' }}
                    >
                      {!isMine && (
                        <img
                          src={participantAvatar(other)}
                          alt=""
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      )}
                      <div
                        style={{
                          background: isMine ? 'var(--apple-accent)' : 'var(--apple-bg)',
                          color: isMine ? '#fff' : 'var(--apple-text-primary)',
                          padding: '0.85rem 1rem',
                          borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0',
                          maxWidth: '75%',
                        }}
                      >
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message}</p>
                        {msg.attachmentUrl && (
                          <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: isMine ? 'rgba(255,255,255,0.85)' : 'var(--apple-accent)', display: 'block', marginTop: '0.5rem' }}>
                            Attachment
                          </a>
                        )}
                        <span style={{ fontSize: '0.75rem', color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--apple-text-secondary)', display: 'block', marginTop: '0.5rem', textAlign: isMine ? 'right' : 'left' }}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className="messages-composer" onSubmit={handleSend}>
                {messageUsage && (
                  <div style={{ color: 'var(--apple-text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    {messageUsage.messagesThisMonth} / {messageUsage.messageLimit} messages this month
                  </div>
                )}
                {sendError && (
                  <div style={{ color: '#ff3b30', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{sendError}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--apple-bg)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
                  <input
                    type="text"
                    placeholder={
                      atMessageLimit
                        ? 'Monthly message limit reached. Upgrade to send more.'
                        : canSend
                          ? 'Type a message...'
                          : 'Messaging unavailable until the application is accepted'
                    }
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={!canSend || sending}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--apple-text-primary)', outline: 'none', fontSize: '0.875rem' }}
                  />
                  <button
                    type="submit"
                    disabled={!canSend || sending || !draft.trim()}
                    style={{ background: 'var(--apple-accent)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: !canSend || sending || !draft.trim() ? 'not-allowed' : 'pointer', display: 'flex', opacity: !canSend || sending || !draft.trim() ? 0.5 : 1 }}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
