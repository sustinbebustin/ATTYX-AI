import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { NavigationDock } from '../components/NavigationDock';
import { TasksView } from '../components/views/TasksView';
import { PipelineView } from '../components/views/PipelineView';
import { ReportingView } from '../components/views/ReportingView';
import { useAppStore } from '../stores/appStore';
import Login from '../components/auth/Login';
import Head from 'next/head';
import { Session } from '@supabase/supabase-js';

const API_ENDPOINT = 'http://localhost:8001/api/attyx-ai-agent';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface Message {
  id: string;
  content: string;
  type: 'human' | 'ai' | 'error' | 'system';
  timestamp: string;
}

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new) {
            const newMessage = payload.new.message;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, []);


  // Global state
  const { 
    activeApp,
    chatWidth,
    isChatOpen,
    taskInput,
    setTaskInput,
    setChatWidth,
    toggleChat 
  } = useAppStore();

  // Local state
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [sessionId] = React.useState(uuidv4());
  const [isResizing, setIsResizing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const windowWidth = window.innerWidth;
    const minWidth = windowWidth * 0.15;
    const maxWidth = windowWidth * 0.50;
    const newWidth = windowWidth - e.clientX;
    
    setChatWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
  }, [isResizing, setChatWidth]);

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add and remove event listeners for resize
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Message submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || isLoading) return;

    setIsLoading(true);
    const newMessage: Message = {
      id: uuidv4(),
      content: taskInput,
      type: 'human',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: taskInput,
          user_id: session?.user?.id || 'NA',
          request_id: uuidv4(),
          session_id: sessionId,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: `Error: ${errorMessage}`,
        type: 'error',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      setTaskInput('');
    }
  }, [taskInput, sessionId, activeApp, isLoading, setTaskInput, session]);

  // Render active view
  const renderActiveView = () => {
    switch (activeApp) {
      case 'tasks':
        return <TasksView />;
      case 'pipeline':
        return <PipelineView />;
      case 'reporting':
        return <ReportingView />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-4xl w-full px-8">
              <h1 className="text-6xl font-bold tracking-tight text-gray-900 animate-slide-up text-center">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  Attyx AI
                </span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 animate-slide-up text-center" style={{ animationDelay: '200ms' }}>
                Your intelligent CRM assistant powered by advanced AI. Manage deals, analyze customer relationships, and get actionable insights.
              </p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <>
        <Head>
          <title>Attyx AI - Login</title>
          <meta name="description" content="Attyx AI Login" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Login />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content area */}
      <div 
        className={`flex-1 ${
          isChatOpen ? `w-[calc(100%-${chatWidth}px)]` : 'w-full'
        } transition-all duration-200`}
      >
        <div className="h-full flex flex-col">
          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            {renderActiveView()}
          </main>
          
          {/* Navigation */}
          <NavigationDock />
        </div>
      </div>

      {/* Chat Interface */}
      {isChatOpen && (
<div
  className={`relative flex flex-col bg-white border-l border-gray-200 ${isResizing ? 'resizing' : ''}`}
  style={{ width: `${chatWidth}px` }}
>
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
    <h2 className="text-lg font-semibold text-gray-900">Attyx AI Assistant</h2>
  </div>
          {/* Tab-style Resize Handle */}
          <div
            className={`resize-tab ${isResizing ? 'active' : ''}`}
            onMouseDown={() => setIsResizing(true)}
            title="Drag to resize"
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg className="w-1.5 h-6 text-gray-400" fill="currentColor" viewBox="0 0 4 24">
                <path d="M2 0a1 1 0 011 1v2a1 1 0 11-2 0V1a1 1 0 011-1zm0 8a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1zm0 8a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" />
              </svg>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl p-4 ${
                  message.type === 'human'
                    ? 'bg-blue-600 text-white ml-12'
                    : message.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-100 text-gray-900 mr-12'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 min-h-[44px] max-h-32 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (taskInput.trim()) handleSubmit(e as any);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!taskInput.trim() || isLoading}
                className={`rounded-full p-2 text-white ${
                  taskInput.trim() && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed right-4 top-4 rounded-full p-2 bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
      >
        {isChatOpen ? (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
