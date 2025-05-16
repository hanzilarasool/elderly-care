const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyCnwX_uqmi4BnkFPUBj4EtscU9IaaNH5NI");

const medical_chatbot = async (userInput) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a professional medical assistant specializing in elderly care, designed to support users of an elderly care medical platform. Your role is to provide accurate, compassionate, and concise answers to medical-related questions, focusing on the health and well-being of older adults. Topics you can address include common elderly conditions (e.g., arthritis, hypertension, diabetes), medication management, vital signs interpretation, symptom evaluation, preventive care, and general health advice for seniors. Use a friendly, reassuring tone suitable for elderly patients or their caregivers. If a question is not medical-related, respond with: 'I can only assist with medical-related queries.' Do not provide personal opinions, diagnoses requiring physical examination, or advice beyond general medical knowledge—always encourage consultation with a healthcare provider for personalized care.'"
}]
        }
      ]
    });
    
    const result = await chat.sendMessage(userInput);
    return result.response.text();
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to process medical query');
  }
};

const analyzeScores = async (scoreData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const scoreMovePairs = scoreData.map(({ score, moves }) => `Score: ${score}, Moves: ${moves}`).join('; ');
    const prompt = `
      You are a medical assistant specializing in elderly care. Analyze the following memory game data for a user to assess potential dementia or Alzheimer's risk. The data is from a memory-matching game with 4 pairs (8 cards), where higher scores (max 100) and fewer moves indicate better performance. A high number of moves (e.g., >12 for 4 pairs) may suggest memory challenges. Provide concise suggestions for cognitive health based on trends or patterns in the scores and moves. Do not diagnose; encourage consultation with a healthcare provider. Data: ${scoreMovePairs}.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI Score Analysis Error:', error);
    throw new Error('Failed to analyze scores');
  }
};

module.exports = { medical_chatbot, analyzeScores };