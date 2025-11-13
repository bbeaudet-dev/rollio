import { GameInterface } from '../interfaces';
import { TutorialStateManager } from './tutorialState';
import { CLIDisplayFormatter } from '../display/cliDisplay';
import { validateDiceSelection } from '../../game/utils/effectUtils';
import { getAllPartitionings } from '../../game/logic/scoring';

export class InteractiveTutorial {
  private gameInterface: GameInterface;
  private stateManager: TutorialStateManager;

  constructor(gameInterface: GameInterface) {
    this.gameInterface = gameInterface;
    this.stateManager = new TutorialStateManager();
  }

  async runInteractiveTutorial(): Promise<void> {
    await this.gameInterface.log('\n🎓 INTERACTIVE TUTORIAL');
    await this.gameInterface.log('Learn by doing! This tutorial will guide you through the basics.');
    await this.gameInterface.log('');

    const lessons = [
      { id: 'dice-rolling', name: 'Dice Rolling & Selection', description: 'Learn how to roll dice and select them for scoring' },
      { id: 'scoring', name: 'Scoring Combinations', description: 'Understand how to score points with different combinations' },
      { id: 'banking', name: 'Banking Points', description: 'Learn when and how to bank your points' },
      { id: 'flops', name: 'Handling Flops', description: 'What happens when you can\'t score any dice' },
      { id: 'hot-dice', name: 'Hot Dice', description: 'Experience the excitement of hot dice!' }
    ];

    await this.gameInterface.log('Available lessons:');
    for (let index = 0; index < lessons.length; index++) {
      const lesson = lessons[index];
      const status = this.stateManager.isLessonCompleted(lesson.id) ? '✅' : '⭕';
      await this.gameInterface.log(`${index + 1}. ${status} ${lesson.name} - ${lesson.description}`);
    }
    await this.gameInterface.log('');

    // Start with the first lesson automatically
    await this.runLesson(lessons[0].id);
  }

  private async runLesson(lessonId: string): Promise<void> {
    this.stateManager.setLesson(lessonId);
    this.stateManager.resetForNewLesson();

    switch (lessonId) {
      case 'dice-rolling':
        await this.lessonDiceRolling();
        break;
      case 'scoring':
        await this.lessonScoring();
        break;
      case 'banking':
        await this.lessonBanking();
        break;
      case 'flops':
        await this.lessonFlops();
        break;
      case 'hot-dice':
        await this.lessonHotDice();
        break;
    }

    this.stateManager.completeLesson(lessonId);
    await this.gameInterface.log('\n🎉 Lesson completed!');
    await this.continueToNextLesson();
  }

  private async lessonDiceRolling(): Promise<void> {
    const state = this.stateManager.getState();
    
    await this.gameInterface.log('\n🎲 LESSON 1: DICE ROLLING & SELECTION');
    await this.gameInterface.log('Let\'s start by rolling some dice!');
    await this.gameInterface.log('');

    // Roll the dice
    state.roundState.diceHand = state.gameState.diceSet.map((die: any) => ({ ...die }));
    for (const die of state.roundState.diceHand) {
      die.rolledValue = die.allowedValues[Math.floor(Math.random() * die.allowedValues.length)];
    }

    await this.gameInterface.displayRoll(1, state.roundState.diceHand);
    await this.gameInterface.log('');

    await this.gameInterface.log('Now you need to select dice to score. Type the dice values you want to select.');
    await this.gameInterface.log('For example, if you see dice showing 1, 2, 5, type "125"');
    await this.gameInterface.log('');

    const input = await this.gameInterface.ask('Select dice to score: ');
    const selectedIndices = validateDiceSelection(input, state.roundState.diceHand.map((die: any) => die.rolledValue!) as any);
    
    if (selectedIndices.length > 0) {
      await this.gameInterface.log('✅ Great! You selected: ' + selectedIndices.map((i: number) => state.roundState.diceHand[i].rolledValue).join(', '));
      await this.gameInterface.log('This would score some points!');
    } else {
      await this.gameInterface.log('❌ Invalid selection. Try again with valid dice values.');
    }
  }

  private async lessonScoring(): Promise<void> {
    const state = this.stateManager.getState();
    
    await this.gameInterface.log('\n🎯 LESSON 2: SCORING COMBINATIONS');
    await this.gameInterface.log('Let\'s learn about scoring combinations!');
    await this.gameInterface.log('');

    // Set up a specific roll for teaching
    state.roundState.diceHand = [
      { ...state.gameState.diceSet[0], rolledValue: 1 },
      { ...state.gameState.diceSet[1], rolledValue: 1 },
      { ...state.gameState.diceSet[2], rolledValue: 1 },
      { ...state.gameState.diceSet[3], rolledValue: 2 },
      { ...state.gameState.diceSet[4], rolledValue: 3 },
      { ...state.gameState.diceSet[5], rolledValue: 4 }
    ];

    await this.gameInterface.displayRoll(1, state.roundState.diceHand);
    await this.gameInterface.log('');

    await this.gameInterface.log('Look at this roll! You have:');
    await this.gameInterface.log('• Three 1s (Three of a Kind)');
    await this.gameInterface.log('• 2, 3, 4 (Straight)');
    await this.gameInterface.log('');

    await this.gameInterface.log('Let\'s see all possible combinations:');
    const combinations = CLIDisplayFormatter.formatCombinationsDisplay(state.roundState.diceHand, state.gameState);
    for (const line of combinations) {
      await this.gameInterface.log(line);
    }
    await this.gameInterface.log('');

    await this.gameInterface.log('Try selecting "111" for the three of a kind:');
    const input = await this.gameInterface.ask('Select dice to score: ');
    const selectedIndices = validateDiceSelection(input, state.roundState.diceHand.map((die: any) => die.rolledValue!) as any);

    if (selectedIndices.length === 3) {
      await this.gameInterface.log('✅ Perfect! You scored 300 points with Three of a Kind!');
      await this.gameInterface.log('(1s are worth 100 points each in Three of a Kind)');
    } else {
      await this.gameInterface.log('❌ Try selecting exactly three 1s by typing "111"');
    }
  }

  private async lessonBanking(): Promise<void> {
    const state = this.stateManager.getState();
    
    await this.gameInterface.log('\n💰 LESSON 3: BANKING POINTS');
    await this.gameInterface.log('Banking is crucial! Let\'s practice when to bank your points.');
    await this.gameInterface.log('');

    // Give them some points to work with
    state.roundState.roundPoints = 450;

    await this.gameInterface.log(`You currently have ${state.roundState.roundPoints} points in this round.`);
    await this.gameInterface.log('You can either:');
    await this.gameInterface.log('• Bank these points (type "b")');
    await this.gameInterface.log('• Continue rolling for more points (type "r")');
    await this.gameInterface.log('');

    const choice = await this.gameInterface.ask('What would you like to do? (b/r): ');
    
    if (choice.trim().toLowerCase() === 'b') {
      await this.gameInterface.log('✅ Smart choice! You banked 450 points.');
      await this.gameInterface.log('Banking early is often the safest strategy.');
    } else if (choice.trim().toLowerCase() === 'r') {
      await this.gameInterface.log('🎲 Risk taker! Let\'s see what happens...');
      
            // Simulate a risky roll
      const newRoll = [2, 3, 4, 5, 6, 6];
      state.roundState.diceHand = state.gameState.diceSet.map((die: any, i: number) => ({
        ...die,
        rolledValue: newRoll[i]
      }));
      
      await this.gameInterface.displayRoll(2, state.roundState.diceHand);
      await this.gameInterface.log('');

      await this.gameInterface.log('You rolled a straight (2,3,4,5,6) + a 6!');
      await this.gameInterface.log('This would score 100 points for the straight.');
      await this.gameInterface.log('Your round total would be 550 points!');
      await this.gameInterface.log('');
      await this.gameInterface.log('Sometimes taking risks pays off!');
    } else {
      await this.gameInterface.log('❌ Invalid choice. Try "b" for bank or "r" for reroll.');
    }
  }

  private async lessonFlops(): Promise<void> {
    const state = this.stateManager.getState();
    
    await this.gameInterface.log('\n💥 LESSON 4: HANDLING FLOPS');
    await this.gameInterface.log('Flopping happens to everyone. Let\'s learn how to handle it.');
    await this.gameInterface.log('');

    // Set up a flop scenario
    state.roundState.diceHand = [
      { ...state.gameState.diceSet[0], rolledValue: 2 },
      { ...state.gameState.diceSet[1], rolledValue: 2 },
      { ...state.gameState.diceSet[2], rolledValue: 3 },
      { ...state.gameState.diceSet[3], rolledValue: 4 },
      { ...state.gameState.diceSet[4], rolledValue: 6 },
      { ...state.gameState.diceSet[5], rolledValue: 6 }
    ];

    state.roundState.roundPoints = 300; // Give them some points to lose

    await this.gameInterface.displayRoll(1, state.roundState.diceHand);
    await this.gameInterface.log('');

    await this.gameInterface.log('Oh no! This roll has no valid scoring combinations.');
    await this.gameInterface.log('You have 300 points at risk. What happens when you flop?');
    await this.gameInterface.log('');

    const input = await this.gameInterface.ask('Try to select dice to score (or press ENTER to see the flop): ');
    
    if (input.trim() === '') {
      await this.gameInterface.log('🎯 COMBINATIONS: No valid scoring combinations found, you flopped!');
      await this.gameInterface.log('');
      
      const endOfRoundLines = CLIDisplayFormatter.formatEndOfRoundSummary(
        300, // round points
        1, // round number
        false, // isFlop
        0, // consecutiveFlops
        3 // banksRemaining
      );
      for (const line of endOfRoundLines) {
        await this.gameInterface.log(line);
      }
      
      await this.gameInterface.log('');
      await this.gameInterface.log('💡 TIP: When you see a bad roll coming, consider banking early!');
    } else {
      const selectedIndices = validateDiceSelection(input, state.roundState.diceHand.map(die => die.rolledValue!) as any);
      if (selectedIndices.length === 0) {
        await this.gameInterface.log('❌ That\'s right - there are no valid combinations here.');
        await this.gameInterface.log('This is a flop! You lose your 300 round points.');
      } else {
        await this.gameInterface.log('❌ Actually, that combination isn\'t valid. This is a flop!');
      }
    }
  }

  private async lessonHotDice(): Promise<void> {
    const state = this.stateManager.getState();
    
    await this.gameInterface.log('\n🔥 LESSON 5: HOT DICE');
    await this.gameInterface.log('Hot dice are the most exciting part of Rollio!');
    await this.gameInterface.log('');

    // Set up a hot dice scenario
    state.roundState.diceHand = [
      { ...state.gameState.diceSet[0], rolledValue: 1 },
      { ...state.gameState.diceSet[1], rolledValue: 1 },
      { ...state.gameState.diceSet[2], rolledValue: 1 },
      { ...state.gameState.diceSet[3], rolledValue: 5 },
      { ...state.gameState.diceSet[4], rolledValue: 5 },
      { ...state.gameState.diceSet[5], rolledValue: 5 }
    ];

    await this.gameInterface.displayRoll(1, state.roundState.diceHand);
    await this.gameInterface.log('');

    await this.gameInterface.log('Look at this amazing roll! You have:');
    await this.gameInterface.log('• Three 1s (300 points)');
    await this.gameInterface.log('• Three 5s (150 points)');
    await this.gameInterface.log('');

    await this.gameInterface.log('If you score ALL the dice, you trigger HOT DICE!');
    await this.gameInterface.log('Hot dice let you reroll ALL dice!');
    await this.gameInterface.log('');

    await this.gameInterface.log('Try selecting all dice by typing "111555":');
    const input = await this.gameInterface.ask('Select dice to score: ');
    
    if (input.trim() === '111555' || input.trim() === '555111') {
      await this.gameInterface.log('🎯 COMBINATIONS: Highest points: 450');
      await this.gameInterface.log('  Combinations: Three of a Kind 1, 1, 1 (1, 2, 3); Three of a Kind 5, 5, 5 (4, 5, 6)');
      await this.gameInterface.log('');
      await this.gameInterface.log('🔥 HOT DICE! 🔥');
      await this.gameInterface.log('');
      await this.gameInterface.log('🎲 ROLL SUMMARY');
      await this.gameInterface.log('  Roll points: +450');
      await this.gameInterface.log('  Round points: 450');
      await this.gameInterface.log('Bank points (b) or reroll 6 dice (r): ');
      await this.gameInterface.log('');
      await this.gameInterface.log('✅ Congratulations! You triggered Hot Dice!');
      await this.gameInterface.log('Now you can reroll all 6 dice!');
    } else {
      await this.gameInterface.log('❌ Try selecting ALL the dice by typing "111555"');
      await this.gameInterface.log('You need to score every die to trigger Hot Dice!');
    }
  }

  private async continueToNextLesson(): Promise<void> {
    const lessons = [
      { id: 'dice-rolling', name: 'Dice Rolling & Selection', description: 'Learn how to roll dice and select them for scoring' },
      { id: 'scoring', name: 'Scoring Combinations', description: 'Understand how to score points with different combinations' },
      { id: 'banking', name: 'Banking Points', description: 'Learn when and how to bank your points' },
      { id: 'flops', name: 'Handling Flops', description: 'What happens when you can\'t score any dice' },
      { id: 'hot-dice', name: 'Hot Dice', description: 'Experience the excitement of hot dice!' }
    ];

    // Find the next uncompleted lesson
    let nextLessonIndex = -1;
    for (let i = 0; i < lessons.length; i++) {
      if (!this.stateManager.isLessonCompleted(lessons[i].id)) {
        nextLessonIndex = i;
        break;
      }
    }

    if (nextLessonIndex >= 0) {
      await this.gameInterface.log('\n📚 Available lessons:');
      for (let index = 0; index < lessons.length; index++) {
        const lesson = lessons[index];
        const status = this.stateManager.isLessonCompleted(lesson.id) ? '✅' : '⭕';
        await this.gameInterface.log(`${index + 1}. ${status} ${lesson.name} - ${lesson.description}`);
      }
      await this.gameInterface.log('');

      // Continue to next lesson automatically
      await this.runLesson(lessons[nextLessonIndex].id);
    } else {
      await this.gameInterface.log('\n🎓 Congratulations! You\'ve completed all interactive lessons!');
      await this.gameInterface.log('You\'re ready to play the full game.');
      await this.gameInterface.log('');
      await this.gameInterface.log('Press ENTER to return to main menu: ');
      await this.gameInterface.ask('');
    }
  }
} 