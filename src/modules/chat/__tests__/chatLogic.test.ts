import { describe, it, expect } from 'vitest';

describe('Chat Module - Logic', () => {
  it('should identify unread messages', () => {
    const messages = [
      { id: 1, text: 'Hello', read: true },
      { id: 2, text: 'Are you there?', read: false }
    ];
    
    const unreadCount = messages.filter(m => !m.read).length;
    expect(unreadCount).toBe(1);
  });
});
