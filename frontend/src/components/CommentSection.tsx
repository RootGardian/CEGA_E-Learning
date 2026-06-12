import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Trash2, User, MessageSquare } from 'lucide-react';
import socket from '../utils/socket';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorId: string;
  authorType: string;
  createdAt?: string;
  created_at?: string;
  replies?: Comment[];
}

interface UserMention {
  id: string;
  firstName?: string;
  lastName?: string;
  nom?: string;
  prenom?: string;
  department?: string;
  type: string;
  name: string;
}

const CommentSection: React.FC<{ moduleId: number; courseId: number; currentUser: any }> = ({ moduleId, courseId, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mentions, setMentions] = useState<UserMention[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [courseUsers, setCourseUsers] = useState<UserMention[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Fetch comments
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/api/comments/module/${moduleId}`, { withCredentials: true });
        setComments(res.data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };
    fetchComments();

    // Join room
    socket.emit('join_module', moduleId);

    const handleNewComment = (comment: Comment) => {
      setComments(prev => [comment, ...prev]);
    };

    const handleDeleteComment = (commentId: string) => {
      setComments(prev => prev.filter(c => c.id.toString() !== commentId.toString()));
    };

    socket.on('new_comment', handleNewComment);
    socket.on('delete_comment', handleDeleteComment);

    return () => {
      socket.emit('leave_module', moduleId);
      socket.off('new_comment', handleNewComment);
      socket.off('delete_comment', handleDeleteComment);
    };
  }, [moduleId]);

  useEffect(() => {
    // Fetch users for mentions (students in course + teacher)
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`/api/courses/${courseId}/users`, { withCredentials: true });
        setCourseUsers(res.data);
      } catch (err) {
        console.error('Error fetching course users:', err);
      }
    };
    fetchUsers();
  }, [courseId]);

  // Handle typing to detect @
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbolIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbolIndex + 1);
      // If there's no space after the @, we are typing a mention
      if (!textAfterAt.includes(' ')) {
        setShowMentionDropdown(true);
        setMentionFilter(textAfterAt.toLowerCase());
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleSelectMention = (user: UserMention) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = inputValue.substring(0, cursorPosition);
    const textAfterCursor = inputValue.substring(cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
    
    const newTextBefore = textBeforeCursor.substring(0, lastAtSymbolIndex) + `@${user.name} `;
    
    setInputValue(newTextBefore + textAfterCursor);
    setShowMentionDropdown(false);
    
    // Add to mentions list if not already there
    if (!mentions.find(m => m.id === user.id)) {
      setMentions([...mentions, user]);
    }

    // Set cursor focus back
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = newTextBefore.length;
        inputRef.current.selectionEnd = newTextBefore.length;
      }
    }, 0);
  };

  const filteredUsers = courseUsers.filter(u => u.name?.toLowerCase().includes(mentionFilter));

  const handlePost = async () => {
    if (!inputValue.trim()) return;

    try {
      // Match mentioned users in text to send only valid mentions
      const validMentions = mentions.filter(m => inputValue.includes(`@${m.name}`));

      await axios.post(`/api/comments/module/${moduleId}`, {
        content: inputValue,
        mentions: validMentions
      }, { withCredentials: true });
      
      setInputValue('');
      setMentions([]);
      setShowMentionDropdown(false);
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/comments/${id}`, { withCredentials: true });
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ marginTop: '4rem', padding: '3rem', borderRadius: '12px', border: '1px solid rgba(var(--accent-primary-rgb), 0.1)', backgroundColor: 'var(--bg-secondary)', fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.08)', padding: '0.5rem', borderRadius: '8px', color: 'var(--accent-primary)', display: 'flex' }}>
          <MessageSquare size={20} />
        </div>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>Espace de Discussion</h3>
      </div>
      
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Posez une question, partagez une idée ou mentionnez quelqu'un avec @..."
          style={{ 
            resize: 'vertical', 
            width: '100%', 
            padding: '1.5rem', 
            backgroundColor: 'var(--bg-primary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontFamily: "inherit",
            lineHeight: 1.6,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            outline: 'none',
            minHeight: '120px'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(var(--accent-primary-rgb), 0.4)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--accent-primary-rgb), 0.05)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          rows={3}
        />
        
        {showMentionDropdown && (
          <div className="glass-panel" style={{
            position: 'absolute', top: 'calc(100% - 10px)', left: '1rem', right: '1rem', 
            backgroundColor: 'var(--bg-primary)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)', 
            zIndex: 10, maxHeight: '200px', overflowY: 'auto',
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <div 
                  key={`${u.type}-${u.id}`}
                  onClick={() => handleSelectMention(u)}
                  style={{ padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background-color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--accent-primary-rgb), 0.15)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div translate="no" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600 }}>{u.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.type}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Aucun utilisateur trouvé</div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            onClick={handlePost}
            style={{ 
              padding: '0.6rem 1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              width: 'auto',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '0.9rem',
              backgroundColor: 'var(--accent-primary)',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Send size={16} /> Publier le message
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2.5rem' }}>
        {comments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>Soyez le premier à lancer la discussion !</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="animate-fade-in" style={{ display: 'flex', gap: '1.25rem', padding: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', transition: 'box-shadow 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>
              <div translate="no" style={{ width: '40px', height: '40px', borderRadius: '50%', background: comment.authorType === 'enseignant' || comment.authorType === 'admin' || comment.authorType === 'directeur_formation' ? 'var(--accent-primary)' : 'var(--bg-secondary)', border: comment.authorType === 'etudiant' ? '1px solid var(--border-color)' : 'none', color: comment.authorType === 'etudiant' ? 'var(--text-primary)' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem', fontWeight: 600 }}>
                {comment.authorName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{comment.authorName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {comment.authorType.replace('_', ' ')} • {new Date(comment.createdAt || comment.created_at || new Date()).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {(currentUser.role === 'admin' || currentUser.role === 'directeur_formation' || currentUser.id.toString() === comment.authorId.toString()) && (
                    <button 
                      onClick={() => handleDelete(comment.id)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      title="Supprimer ce message"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
