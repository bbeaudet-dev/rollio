import { useState, useCallback, useRef } from 'react';
import { WebGameManager, WebGameState } from '../services/WebGameManager';

export function useGameState() {
  const [webState, setWebState] = useState<WebGameState | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const gameManagerRef = useRef<WebGameManager | null>(null);

  // Add a message to the display
  const addMessage = useCallback((message: string) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Initialize a new game
  const startNewGame = useCallback(async (diceSetIndex?: number, selectedCharms?: number[], selectedConsumables?: number[]) => {
    setIsLoading(true);
    try {
      gameManagerRef.current = new WebGameManager(addMessage);
      const initialState = await gameManagerRef.current.initializeGame(diceSetIndex, selectedCharms, selectedConsumables);
      setWebState(initialState);
      setMessages([]);
    } catch (error) {
      console.error('Failed to start game:', error);
      addMessage('Failed to start game');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  // Handle dice selection
  const handleDiceSelect = useCallback((index: number) => {
    if (!webState || !gameManagerRef.current) return;
    
    const currentSelected = webState.selectedDice;
    const newSelected = currentSelected.includes(index) 
      ? currentSelected.filter(i => i !== index)
      : [...currentSelected, index];
    
    const newState = gameManagerRef.current.updateDiceSelection(webState, newSelected);
    setWebState(newState);
  }, [webState]);

  // Unified roll/reroll action
  const handleRollDice = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    if (webState.canRoll) {
      // Starting a new round
      const newState = gameManagerRef.current.startRound(webState);
      setWebState(newState);
    } else if (webState.canReroll) {
      // Rerolling within current round
      const newState = gameManagerRef.current.rerollDice(webState);
      setWebState(newState);
    }
  }, [webState]);

  const scoreSelectedDice = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    const newState = gameManagerRef.current.scoreSelectedDice(webState);
    setWebState(newState);
  }, [webState]);

  const handleBank = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    const newState = gameManagerRef.current.bankPoints(webState);
    setWebState(newState);
  }, [webState]);

  const handleConsumableUse = useCallback((index: number) => {
    if (!webState || !gameManagerRef.current || !webState.gameState) return;
    
    // TODO: Implement consumable logic in game engine
    // For now, just show a message that it's not implemented
    addMessage('Consumable system not yet implemented in game engine');
  }, [webState, addMessage]);

  return {
    // Core game state (properly organized)
    gameState: webState?.gameState || null,
    roundState: webState?.roundState || null,
    
    // UI state
    isLoading,
    messages,
    
    // Actions (logical groups)
    rollActions: {
    handleDiceSelect,
    handleRollDice,
      scoreSelectedDice,
    },
    
    gameActions: {
    handleBank,
      startNewGame,
    },
    
    inventoryActions: {
    handleConsumableUse,
    },
    
    // Game board data (from round state)
    board: {
      dice: webState?.roundState?.diceHand || [],
      selectedDice: webState?.selectedDice || [],
      previewScoring: webState?.previewScoring || null,
    canRoll: webState?.canRoll || false,
    canBank: webState?.canBank || false,
    canReroll: webState?.canReroll || false,
      canSelectDice: webState?.roundState ? 
        webState.roundState.diceHand.length > 0 && !(webState.canBank && webState.canReroll) && !webState.justBanked && !webState.justFlopped : 
        false,
      justBanked: webState?.justBanked || false,
      justFlopped: webState?.justFlopped || false,
    },
    

    

    
    // Inventory (from game state)
    inventory: {
      charms: webState?.gameState?.charms || [],
      consumables: webState?.gameState?.consumables || [],
      materialLogs: webState?.materialLogs || [],
      charmLogs: webState?.charmLogs || [],
    },
  };
} 