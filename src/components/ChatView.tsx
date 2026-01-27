import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMessages, useSendMessage, useMarkAsRead, useTypingIndicator } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useIsUserOnline } from '@/hooks/useOnlineStatus';
import { MessageStatus } from '@/components/chat/MessageStatus';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatViewProps {
  matchId: string;
  matchName: string;
  matchPhoto: string | null;
  matchUserId?: string;
  onBack: () => void;
}

const ChatView = ({ matchId, matchName, matchPhoto, matchUserId, onBack }: ChatViewProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(matchId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const { isOtherUserTyping, setTyping } = useTypingIndicator(matchId);
  const { data: isOnline } = useIsUserOnline(matchUserId || null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherUserTyping]);

  // Mark messages as read
  useEffect(() => {
    if (matchId && messages.some(m => m.sender_id !== user?.id && !m.read_at)) {
      markAsRead.mutate(matchId);
    }
  }, [matchId, messages, user?.id]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({ matchId, content: message.trim() });
      setMessage('');
      setTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'h:mm a');
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.created_at), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border bg-card safe-area-top">
        <button onClick={onBack} className="p-1 -ml-1 active:opacity-70">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        
        <div className="relative">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary">
            {matchPhoto ? (
              <img src={matchPhoto} alt={matchName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold">
                {matchName.charAt(0)}
              </div>
            )}
          </div>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground text-sm truncate">{matchName}</h2>
          {isOtherUserTyping ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-primary"
            >
              typing...
            </motion.p>
          ) : isOnline ? (
            <p className="text-xs text-success">Online</p>
          ) : null}
        </div>

        <button className="p-1.5 rounded-full hover:bg-secondary">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Send className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">Say hello!</h3>
            <p className="text-xs text-muted-foreground">
              Start the conversation with {matchName}
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex justify-center my-3">
                <span className="text-[10px] text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                  {formatDateHeader(dateMessages[0].created_at)}
                </span>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex mb-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 ${
                        isOwn
                          ? 'gradient-primary text-primary-foreground rounded-2xl rounded-br-md'
                          : 'bg-secondary text-foreground rounded-2xl rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-0.5 ${
                        isOwn ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className={`text-[10px] ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatMessageTime(msg.created_at)}
                        </span>
                        {isOwn && (
                          <MessageStatus 
                            status={(msg as any).status} 
                            readAt={msg.read_at}
                            className={isOwn ? 'text-primary-foreground' : 'text-muted-foreground'} 
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isOtherUserTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start mb-1.5"
            >
              <div className="bg-secondary px-3 py-2.5 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <motion.div
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-2.5 safe-area-bottom">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-10 rounded-full bg-secondary border-0 text-sm px-4"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
            size="icon"
            className="w-10 h-10 rounded-full gradient-primary flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;