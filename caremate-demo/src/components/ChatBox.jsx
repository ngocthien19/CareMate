// src/components/ChatBox.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ChatBox({ nurseName, nurseAvatar }) {
  const { t } = useTranslation();

  const [messages, setMessages] = useState([
    {
      from: 'nurse',
      text: t('chat.nurseGreeting', { name: nurseName }),
      time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [
      ...m,
      { from: 'me', text: input.trim(), time: new Date().toISOString() },
    ]);
    setInput('');

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: 'nurse',
          text: t('chat.nurseAutoReply'),
          time: new Date().toISOString(),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 pb-3 border-b">
        <img
          src={nurseAvatar}
          alt={nurseName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-gray-800">{nurseName}</p>
          <p className="text-xs text-teal-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            {t('chat.online')}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-[200px] max-h-[300px]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                m.from === 'me'
                  ? 'bg-teal-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {m.text}
              <p
                className={`text-[10px] mt-1 ${
                  m.from === 'me' ? 'text-teal-100' : 'text-gray-400'
                }`}
              >
                {new Date(m.time).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={t('chat.inputPlaceholder')}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <button
          onClick={send}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 rounded-lg font-semibold transition"
        >
          {t('chat.send')}
        </button>
      </div>
    </div>
  );
}