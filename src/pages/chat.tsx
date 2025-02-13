// pages/chat.tsx
import dynamic from 'next/dynamic';
import ChatPageImpl from '../components/ChatPageImpl';
// const ChatPageImpl = dynamic(() => import('../components/ChatPageImpl'), {
//   ssr: false, // Important: disable SSR
// });

export default function ChatPage() {
  return <ChatPageImpl />;
}
