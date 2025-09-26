'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import {
  type AgentState,
  type ReceivedChatMessage,
  useRoomContext,
  useVoiceAssistant,
  useTranscriptions,
} from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { ChatMessageView } from '@/components/livekit/chat/chat-message-view';
import { MediaTiles } from '@/components/livekit/media-tiles';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
import { useDebugMode } from '@/hooks/useDebug';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

interface SessionViewProps {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
}

export const SessionView = ({
  appConfig,
  disabled,
  sessionStarted,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const { state: agentState } = useVoiceAssistant();
  const [chatOpen, setChatOpen] = useState(false);
  const { messages, send } = useChatAndTranscription();
  const transcriptions = useTranscriptions();
  const room = useRoomContext();

  useDebugMode();

  async function handleSendMessage(message: string) {
    await send(message);
  }

  useEffect(() => {
    if (sessionStarted) {
      const timeout = setTimeout(() => {
        if (!isAgentAvailable(agentState)) {
          const reason =
            agentState === 'connecting'
              ? 'Agent did not join the room. '
              : 'Agent connected but did not complete initializing. ';

          console.error('Agent timeout:', { agentState, reason });

          toastAlert({
            title: 'Session ended',
            description: (
              <p className="w-full">
                {reason}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.livekit.io/agents/start/voice-ai/"
                  className="whitespace-nowrap underline"
                >
                  See quickstart guide
                </a>
                .
              </p>
            ),
          });
          room.disconnect();
        }
      }, 30_000); // Increased timeout to 30 seconds

      return () => clearTimeout(timeout);
    }
  }, [agentState, sessionStarted, room]);

  const { supportsChatInput, supportsVideoInput, supportsScreenShare } = appConfig;
  const capabilities = {
    supportsChatInput,
    supportsVideoInput,
    supportsScreenShare,
  };

  return (
    <main
      ref={ref}
      inert={disabled}
      className={cn(
        'bg-white dark:bg-black min-h-screen',
        !chatOpen && 'max-h-svh overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <Image 
                src="/rise_icon.png" 
                alt="Rise AI Logo" 
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-black dark:text-white">Rise AI Support</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Transcription Overlay */}
      {transcriptions.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60]">
          <div className="bg-black/80 dark:bg-white/80 text-white dark:text-black px-6 py-3 rounded-xl text-sm font-medium backdrop-blur-md border border-gray-300 dark:border-gray-700 shadow-lg">
            {transcriptions[transcriptions.length - 1].text}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ChatMessageView
        className={cn(
          'mx-auto min-h-svh w-full max-w-2xl px-4 pt-24 pb-32 transition-[opacity,translate] duration-300 ease-out',
          chatOpen ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-20 opacity-0'
        )}
      >
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message: ReceivedChatMessage) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ChatEntry hideName key={message.id} entry={message} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ChatMessageView>

      {/* Video Area */}
      <div className="pt-16 pb-24">
        <MediaTiles chatOpen={chatOpen} />
      </div>

      {/* Control Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 px-4 pb-12">
        <motion.div
          key="control-bar"
          initial={{ opacity: 0, translateY: '100%' }}
          animate={{
            opacity: sessionStarted ? 1 : 0,
            translateY: sessionStarted ? '0%' : '100%',
          }}
          transition={{ duration: 0.3, delay: sessionStarted ? 0.5 : 0, ease: 'easeOut' }}
        >
          <div className="relative z-10 mx-auto w-full max-w-2xl">
            {appConfig.isPreConnectBufferEnabled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: sessionStarted && messages.length === 0 ? 1 : 0,
                  transition: {
                    ease: 'easeIn',
                    delay: messages.length > 0 ? 0 : 0.8,
                    duration: messages.length > 0 ? 0.2 : 0.5,
                  },
                }}
                aria-hidden={messages.length > 0}
                className={cn(
                  'absolute inset-x-0 -top-12 text-center',
                  sessionStarted && messages.length === 0 && 'pointer-events-none'
                )}
              >
                <div className="inline-flex items-center space-x-2 bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Assistant is listening
                  </p>
                </div>
              </motion.div>
            )}

            <div className="bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              <AgentControlBar
                capabilities={capabilities}
                onChatOpenChange={setChatOpen}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};
