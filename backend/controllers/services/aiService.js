// services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI("AIzaSyCnwX_uqmi4BnkFPUBj4EtscU9IaaNH5NI");

const medical_chatbot = async (userInput) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Add context management if needed
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
module.exports = { medical_chatbot };