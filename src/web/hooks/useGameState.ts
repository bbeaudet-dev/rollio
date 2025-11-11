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
    
    // Check if this is the first roll of a round
    const hasRolledDice = !!(webState.roundState?.rollHistory && webState.roundState.rollHistory.length > 0);
    
    if (!hasRolledDice && webState.roundState) {
      // Roll dice 
      const newState = gameManagerRef.current.rollDice(webState);
      setWebState(newState);
    } else if (webState.canRoll && !webState.roundState) {
      // Starting a new round (no round state exists)
      const newState = gameManagerRef.current.startRound(webState);
      setWebState(newState);
    } else if (webState.canReroll) {
      // After scoring - rolling remaining dice
      // Resolve bank or reroll prompt
      const resolvedState = gameManagerRef.current.resolvePendingAction(webState, 'r');
      setWebState(resolvedState);
      // Then trigger roll 
      if (gameManagerRef.current) {
        const rollState = gameManagerRef.current.rollDice(resolvedState);
        setWebState(rollState);
      }
    }
  }, [webState]);

  // Handle reroll selection (BEFORE scoring - selecting dice to reroll)
  const handleRerollSelection = useCallback((selectedIndices: number[]) => {
    if (!webState || !gameManagerRef.current) return;
    
    if (webState.pendingAction.type === 'reroll') {
      const newState = gameManagerRef.current.handleRerollSelection(webState, selectedIndices);
      setWebState(newState);
    }
  }, [webState]);

  const scoreSelectedDice = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    // If there's a pending diceSelection action, resolve it first
    if (webState.pendingAction.type === 'diceSelection') {
      // Convert selected dice indices to string format (e.g., "123" for dice 1, 2, 3)
      const diceSelection = webState.selectedDice.map(i => i + 1).join('');
      const resolvedState = gameManagerRef.current.resolvePendingAction(webState, diceSelection);
      setWebState(resolvedState);
      // Then score
      if (gameManagerRef.current) {
        const scoredState = gameManagerRef.current.scoreSelectedDice(resolvedState);
        setWebState(scoredState);
      }
    } else {
      const newState = gameManagerRef.current.scoreSelectedDice(webState);
      setWebState(newState);
    }
  }, [webState]);

  const handleBank = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    // If there's a pending bankOrReroll action, resolve it first
    if (webState.pendingAction.type === 'bankOrReroll') {
      const resolvedState = gameManagerRef.current.resolvePendingAction(webState, 'b');
      setWebState(resolvedState);
      // Then bank
      if (gameManagerRef.current) {
        const bankedState = gameManagerRef.current.bankPoints(resolvedState);
        setWebState(bankedState);
      }
    } else {
      const newState = gameManagerRef.current.bankPoints(webState);
      setWebState(newState);
    }
  }, [webState]);

  const handleConsumableUse = useCallback(async (index: number) => {
    if (!webState || !gameManagerRef.current || !webState.gameState) return;
    
    const newState = await gameManagerRef.current.useConsumable(webState, index);
    setWebState(newState);
  }, [webState]);

  const handleFlopContinue = useCallback(() => {
    if (!webState || !gameManagerRef.current) return;
    
    const newState = gameManagerRef.current.handleFlopContinue(webState);
    setWebState(newState);
  }, [webState]);

  const handleFlopShieldChoice = useCallback((useShield: boolean) => {
    if (!webState || !gameManagerRef.current) return;
    
    const newState = gameManagerRef.current.handleFlopShieldChoice(webState, useShield);
    setWebState(newState);
  }, [webState]);

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
      handleRerollSelection,
    },
    
    gameActions: {
      handleBank,
      startNewGame,
      handleFlopContinue,
      handleFlopShieldChoice,
    },
    
    inventoryActions: {
    handleConsumableUse,
    },
    
    // Shop actions
    shopActions: {
      handlePurchaseCharm: useCallback((index: number) => {
        if (!webState || !gameManagerRef.current) return;
        const newState = gameManagerRef.current.purchaseCharm(webState, index);
        setWebState(newState);
      }, [webState]),
      
      handlePurchaseConsumable: useCallback((index: number) => {
        if (!webState || !gameManagerRef.current) return;
        const newState = gameManagerRef.current.purchaseConsumable(webState, index);
        setWebState(newState);
      }, [webState]),
      
      handlePurchaseBlessing: useCallback((index: number) => {
        if (!webState || !gameManagerRef.current) return;
        const newState = gameManagerRef.current.purchaseBlessing(webState, index);
        setWebState(newState);
      }, [webState]),
      
      handleExitShop: useCallback(() => {
        if (!webState || !gameManagerRef.current) return;
        const newState = gameManagerRef.current.exitShop(webState);
        setWebState(newState);
      }, [webState]),
    },
    
    // Game board data (from round state)
    board: {
      dice: webState?.roundState?.diceHand || [],
      selectedDice: webState?.selectedDice || [],
      previewScoring: webState?.previewScoring || null,
      canRoll: webState?.canRoll || false,
      canBank: webState?.canBank || false,
      canReroll: webState?.canReroll || false, // After scoring - can roll remaining dice
      canSelectDice: webState?.roundState ? 
        webState.roundState.diceHand.length > 0 && !(webState.canBank && webState.canReroll) && !webState.justBanked && !webState.justFlopped : 
        false,
      isWaitingForReroll: webState?.isWaitingForReroll || false, // Before scoring - can reroll any dice
      canRerollSelected: webState?.canRerollSelected || false, // Before scoring - can reroll selected dice
      canContinueFlop: webState?.canContinueFlop || false, // After flop - can continue
      canChooseFlopShield: webState?.canChooseFlopShield || false, // Can choose whether to use flop shield
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
    
    // Shop state
    isInShop: webState?.isInShop || false,
    shopState: webState?.shopState || null,
    levelRewards: webState?.levelRewards || null,
  };
} 