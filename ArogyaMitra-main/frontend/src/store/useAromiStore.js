import { create } from 'zustand';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const useAromiStore = create((set, get) => ({
    messages: [],
    isOpen: false,
    isTyping: false,
    hasLoadedHistory: false,
    lastUpdateTimestamp: null, // Track when global data needs refresh

    toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

    setOpen: (status) => set({ isOpen: status }),

    triggerGlobalRefresh: () => set({ lastUpdateTimestamp: Date.now() }),

    loadHistory: async () => {
        if (get().hasLoadedHistory) return;
        try {
            const res = await apiClient.get('/ai/history');
            if (res.data && res.data.messages) {
                set({ messages: res.data.messages, hasLoadedHistory: true });
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    },

    sendMessage: async (content) => {
        if (!content.trim()) return;

        // Optimistic UI update
        const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };
        set((state) => ({
            messages: [...state.messages, userMsg],
            isTyping: true
        }));

        try {
            const res = await apiClient.post('/ai/chat', { message: content });
            const aiMsg = {
                role: 'assistant',
                content: res.data.reply,
                timestamp: new Date().toISOString()
            };

            set((state) => ({
                messages: [...state.messages, aiMsg],
                isTyping: false
            }));

            // If the AI confirms generation or tool usage, trigger a global refresh
            if (aiMsg.content.toLowerCase().includes("generated") || aiMsg.content.toLowerCase().includes("saved")) {
                get().triggerGlobalRefresh();
            }
        } catch (error) {
            set({ isTyping: false });
            toast.error('AROMI is currently unavailable.');
            // Remove failed optimistic message
            set((state) => ({
                messages: state.messages.filter(m => m !== userMsg)
            }));
        }
    },

    clearChatLocally: () => set({ messages: [], hasLoadedHistory: false })
}));

export default useAromiStore;
