'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Send, Lock, CreditCard, ChevronRight } from 'lucide-react';
import useAuthStore from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PremiumChatbot() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I am your AI Premium Assistant. How can I help you today?', sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  
  // Premium check logic
  const isPremium = user?.monetization?.aiProActive || user?.monetization?.plan === 'AI_PRO' || user?.monetization?.plan === 'FOUNDER';

  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight - scrollPosition < 250) {
        setIsVisible(false);
        if (!isOpen) setIsOpen(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "I'm currently configuring. Soon I will help you write proposals, review code, or match you with clients.", sender: 'ai' }
      ]);
    }, 1000);
  };

  if (!isAuthenticated) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="chat-window"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-[350px] sm:w-[380px] h-[520px] max-h-[80vh] flex flex-col bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden"
              >
                {/* Clean, integrated Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-primary/10 rounded-full text-primary">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                        Nainix AI Assistant <Sparkles className="h-3 w-3 text-accent" />
                      </h3>
                      <p className="text-xs text-muted-foreground">Premium Chat</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isPremium ? (
                  <>
                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                              msg.sender === 'user'
                                ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                                : 'bg-muted text-foreground border border-border/50 rounded-2xl rounded-tl-sm'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                      <div ref={endOfMessagesRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-card border-t border-border">
                      <form onSubmit={handleSendMessage} className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="w-full bg-muted border border-border rounded-full pl-4 pr-12 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                        <Button 
                          type="submit" 
                          size="icon"
                          variant="ghost"
                          disabled={!inputValue.trim()}
                          className="absolute right-1 h-8 w-8 rounded-full text-primary hover:bg-primary/10 disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-card to-muted/30">
                     <div className="mb-6 relative">
                       <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50" />
                       <div className="relative h-20 w-20 bg-muted rounded-full flex items-center justify-center border border-border shadow-sm">
                         <Lock className="h-8 w-8 text-muted-foreground" />
                         <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 border-2 border-card">
                           <Sparkles className="h-3 w-3 text-primary-foreground" />
                         </div>
                       </div>
                     </div>
                     <h4 className="font-semibold text-xl text-foreground mb-2 flex items-center gap-2">
                       AI Pro Required
                     </h4>
                     <p className="text-muted-foreground text-sm mb-8">
                       Upgrade to AI Pro to unlock your smart assistant. Get help building proposals, analyzing code, and communicating with clients.
                     </p>
                     <Button asChild className="w-full group">
                       <Link href="/pricing" onClick={() => setIsOpen(false)}>
                         <CreditCard className="mr-2 h-4 w-4" /> Unlock Access <ChevronRight className="ml-1 h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                       </Link>
                     </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.button
                key="chat-fab"
                onClick={() => setIsOpen(true)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-primary-foreground/10 outline-none"
              >
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-md group-hover:bg-primary/50 transition-colors" />
                <Bot className="h-6 w-6 relative z-10" />
                <Sparkles className="absolute right-2 top-2 h-2.5 w-2.5 text-primary-foreground animate-pulse z-10" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
