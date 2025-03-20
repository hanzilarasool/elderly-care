// components/ChatAssistantModal.js
import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";

const IP = Constants.expoConfig.extra.IP;
const ChatAssistantModal = ({ visible, onClose }) => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to delete all chat history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setChatHistory([]);
            // Optional: Add AsyncStorage clearing if persisting chats
            // AsyncStorage.removeItem('chatHistory');
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newUserMessage = { type: 'user', content: input };
    setChatHistory(prev => [...prev, newUserMessage]);
    setInput('');

    try {
      const response = await fetch(`http://${IP}:5000/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: input })
      });
      
      const data = await response.json();
      setChatHistory(prev => [...prev, { type: 'ai', content: data.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: 'Sorry, I\'m having trouble connecting. Please try again later.'
      }]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClearChat} style={styles.iconButton}>
            <Ionicons name="trash-bin-outline" size={24} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Medical Assistant</Text>
          
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={28} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Chat History Section */}
        <ScrollView 
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.map((msg, index) => (
            <View 
              key={index} 
              style={[
                styles.messageBubble,
                msg.type === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.type === 'user' && styles.userMessageText
              ]}>
                {msg.content}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your medical query..."
            placeholderTextColor="#999"
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={input.trim() ? "white" : "#ccc"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 10,
  },
  iconButton: {
    padding: 8,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#00796B',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 150,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    backgroundColor: '#00796B',
    borderRadius: 25,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
});

export default ChatAssistantModal;