const API_URL = process.env.NEXT_PUBLIC_API_URL;

// -------------------- GENERATE CONTENT --------------------
export const generateContent = async (toolType, input) => {
  try {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toolType, input }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Generate API Error:', error);
    return { success: false, error: 'Failed to fetch' };
  }
};

// -------------------- AI CHAT --------------------
export const chatWithAI = async (message) => {
  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Chat API Error:', error);
    return { success: false, error: 'Failed to fetch' };
  }
};

// -------------------- GET TOOLS --------------------
export const getTools = async () => {
  try {
    const res = await fetch(`${API_URL}/api/tools`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Tools API Error:', error);
    return { success: false, error: 'Failed to fetch' };
  }
};
