const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ======================
// AI GENERATE
// ======================
export const generateContent = async (toolType, input) => {
  try {
    const res = await fetch(`${API_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toolType, input }),
    });

    return await res.json();
  } catch (error) {
    console.error('Generate Error:', error);
    return { success: false, error: 'Failed to fetch' };
  }
};

// ======================
// AI CHAT
// ======================
export const chatWithAI = async (message) => {
  try {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    return await res.json();
  } catch (error) {
    console.error('Chat Error:', error);
    return { success: false, error: 'Failed to fetch' };
  }
};

// ======================
// GET TOOLS
// ======================
export const getTools = async () => {
  try {
    const res = await fetch(`${API_URL}/api/ai/tools`);
    return await res.json();
  } catch (error) {
    console.error('Tools Error:', error);
    return { success: false, error: 'Failed to fetch' };
  }
};
