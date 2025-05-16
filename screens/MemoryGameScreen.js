import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const IP_ADDRESS = Constants?.expoConfig?.extra?.IP_ADDRESS || '192.168.1.13';

const MemoryGameScreen = ({ navigation }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const symbols = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D']; // 4 pairs
    const shuffled = symbols.sort(() => Math.random() - 0.5).map((symbol, index) => ({
      id: index,
      symbol,
      flipped: false,
    }));
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedCards([]);
    setScore(0);
    setMoves(0);
    setGameOver(false);
  };

  const handleCardPress = (card) => {
    if (flippedCards.length < 2 && !flippedCards.includes(card) && !matchedCards.includes(card.id)) {
      setFlippedCards([...flippedCards, card]);
      setCards(cards.map(c => (c.id === card.id ? { ...c, flipped: true } : c)));

      if (flippedCards.length === 1) {
        setMoves(moves + 1);
        const firstCard = flippedCards[0];
        if (firstCard.symbol === card.symbol) {
          setMatchedCards([...matchedCards, firstCard.id, card.id]);
          setScore(score + 20); // Reward for match
          setFlippedCards([]);
        } else {
          setTimeout(() => {
            setCards(cards.map(c =>
              c.id === firstCard.id || c.id === card.id ? { ...c, flipped: false } : c
            ));
            setFlippedCards([]);
            setScore(Math.max(0, score - 5)); // Penalty for mismatch
          }, 1000);
        }
      }

      if (matchedCards.length + 2 === cards.length) {
        setGameOver(true);
        setScore(score + 20 + (20 - moves) * 2); // Bonus for fewer moves
      }
    }
  };

  const saveScore = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Not authorized, please log in');
        return;
      }
      console.log('Sending to backend:', { score, moves }); // Debug log
      const response = await axios.post(`http://${IP_ADDRESS}:5000/api/scores/save`, { score, moves }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Score and moves saved!');
      console.log('Save score response:', response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error('Error saving score:', errorMessage);
      Alert.alert('Error', `Failed to save score: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeScores = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Not authorized, please log in');
        return;
      }
      const response = await axios.get(`http://${IP_ADDRESS}:5000/api/scores/analyze`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestions(response.data.suggestions);
      setModalVisible(true);
      console.log('Analyze scores response:', response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error('Error analyzing scores:', errorMessage);
      Alert.alert('Error', `Failed to analyze scores: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Memory Game</Text>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.moves}>Moves: {moves}</Text>
        <View style={styles.grid}>
          {cards.map(card => (
            <TouchableOpacity
              key={card.id}
              style={[styles.card, card.flipped || matchedCards.includes(card.id) ? styles.flipped : {}]}
              onPress={() => handleCardPress(card)}
              disabled={gameOver || isLoading}
            >
              <Text style={styles.cardText}>
                {card.flipped || matchedCards.includes(card.id) ? card.symbol : '?'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {gameOver && (
          <View style={styles.gameOver}>
            <Text style={styles.gameOverText}>Game Over! Score: {score}, Moves: {moves}</Text>
            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={saveScore} disabled={isLoading}>
              <Text style={styles.buttonText}>Save Score</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={analyzeScores} disabled={isLoading}>
              <Text style={styles.buttonText}>Test Scores</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={resetGame} disabled={isLoading}>
              <Text style={styles.buttonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        )}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Cognitive Health Suggestions</Text>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalText}>{suggestions || 'No suggestions available.'}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  content: { flex: 1, alignItems: 'center' },
  title: { fontSize: 24, color: '#333', fontWeight: '600', marginBottom: 10 },
  score: { fontSize: 18, color: '#333', marginBottom: 5 },
  moves: { fontSize: 18, color: '#333', marginBottom: 10 },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center',
    width: '100%',
    maxWidth: 240, // Fits 4 cards per row (50px card + 5px margin)
  },
  card: {
    width: 50,
    height: 50,
    backgroundColor: '#00796B',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    elevation: 2,
  },
  flipped: { backgroundColor: '#fff' },
  cardText: { fontSize: 20, color: '#333' },
  gameOver: { marginTop: 20, alignItems: 'center' },
  gameOverText: { fontSize: 20, color: '#333', marginBottom: 10 },
  button: {
    backgroundColor: '#00796B',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    width: 180,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 10, 
    width: '90%', 
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, color: '#333', fontWeight: '600', marginBottom: 10 },
  modalScroll: { maxHeight: 300, width: '100%' },
  modalText: { fontSize: 16, color: '#333', textAlign: 'center' },
  closeButton: { alignSelf: 'flex-end', padding: 5 },
});

export default MemoryGameScreen;