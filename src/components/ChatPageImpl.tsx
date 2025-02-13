import React, { useEffect } from 'react';
import {
  useChatSession,
  useChatMessages,
  useChatInteract,
  useChatData,
} from '@chainlit/react-client';

export default function ChatPageImpl() {
  const { connect, disconnect } = useChatSession();
  const { messages } = useChatMessages();
  const { connected } = useChatData();
  const { sendMessage } = useChatInteract();

  useEffect(() => {
    // Connect to the WebSocket server
    connect({
      userEnv: {},
      accessToken: 'Bearer YOUR_ACCESS_TOKEN', // if you need authentication
    });
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    // Log the connection status whenever it changes
    console.log("Socket connected:", connected);
  }, [connected]);

  useEffect(() => {
    // Log the messages array whenever it updates
    console.log("Messages received:", messages);
  }, [messages]);

  const handleSend = () => {
    // Send a message (casting as any to bypass the type error temporarily)
    sendMessage({ content: 'Hello from Next.js!' } as any);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Chat with Chainlit</h1>
      <div>
        {messages.map((msg) => (
          // Casting msg as any to access the "content" property per docs
          <div key={msg.id}>{(msg as any).content}</div>
        ))}
      </div>
      <button onClick={handleSend}>Send message</button>
    </div>
  );
}
