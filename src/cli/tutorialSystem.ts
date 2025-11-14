import { GameInterface } from './interfaces';
// import { InteractiveTutorial } from './interactiveTutorial';

export class TutorialSystem {
  private gameInterface: GameInterface;

  constructor(gameInterface: GameInterface) {
    this.gameInterface = gameInterface;
  }

  async showTutorialMenu(): Promise<void> {
    await this.gameInterface.log('\n🎓 Welcome to Rollio! This game combines the excitement of dice rolling with strategic decision-making.');
    await this.gameInterface.log('Choose a tutorial section:');
    await this.gameInterface.log('1. Interactive Tutorial');
    await this.gameInterface.log('2. How to Play');
    await this.gameInterface.log('3. Game Basics');
    await this.gameInterface.log('4. What\'d you say, a "road-like"?');
    await this.gameInterface.log('5. Higher beings, these words are for you alone');
    await this.gameInterface.log('6. Behind the Curtain');
    await this.gameInterface.log('7. I, Robot');
    await this.gameInterface.log('0. Back to Main Menu');
    
    const choice = await this.gameInterface.ask('\nSelect an option (0-7): ');
    
    switch (choice.trim()) {
      case '1':
        // const interactiveTutorial = new InteractiveTutorial(this.gameInterface);
        // await interactiveTutorial.runInteractiveTutorial();
        await this.gameInterface.log('Interactive tutorial temporarily disabled due to TypeScript errors.');
        break;
      case '2':
        await this.showHowToPlay();
        break;
      case '3':
        await this.showGameBasics();
        break;
      case '4':
        await this.showRoguelikeExplanation();
        break;
      case '5':
        await this.showAdvancedTips();
        break;
      case '6':
        await this.showBehindTheCurtain();
        break;
      case '7':
        await this.showIRobot();
        break;
      case '0':
        await this.gameInterface.log('\nThanks for checking out the tutorial! Goodbye!');
        process.exit(0);
      default:
        await this.gameInterface.log('Invalid choice. Please try again.');
        await this.showTutorialMenu();
        break;
    }
  }

  private async showHowToPlay(): Promise<void> {
    await this.gameInterface.log('\n🎮 HOW TO PLAY');
    await this.gameInterface.log('');
    await this.gameInterface.log('Rollio is a CLI (Command Line Interface) dice game. Think of it like typing commands into a computer terminal - you\'ll see text on screen and type your responses.');
    await this.gameInterface.log('');
    await this.gameInterface.log('🎲 BASIC CONTROLS:');
    await this.gameInterface.log('• Type dice values (like "125") to select dice showing 1, 2, and 5');
    await this.gameInterface.log('• Press ENTER to use default options (saves time!)');
    await this.gameInterface.log('• Type "b" to bank points, "r" to reroll');
    await this.gameInterface.log('• Use commands like "i" for inventory, "c" for combinations');
    await this.gameInterface.log('');
    await this.gameInterface.log('💡 TIP: Most prompts have default actions - just press ENTER to continue quickly!');
    await this.gameInterface.log('');
    await this.askToContinue();
  }

  private async showGameBasics(): Promise<void> {
    await this.gameInterface.log('\n🎯 GAME BASICS');
    await this.gameInterface.log('');
    await this.gameInterface.log('🎲 DICE ROLLING:');
    await this.gameInterface.log('• Roll dice and look for scoring combinations');
    await this.gameInterface.log('• Select dice to score (like "125" for dice showing 1, 2, 5)');
    await this.gameInterface.log('• Score points and decide: bank or reroll remaining dice');
    await this.gameInterface.log('');
    await this.gameInterface.log('🎯 SCORING COMBINATIONS:');
    await this.gameInterface.log('• 3+ of a Kind: 50 points per die');
    await this.gameInterface.log('• Straights (3+ consecutive): 100 points');
    await this.gameInterface.log('• Each die can only be used once per roll');
    await this.gameInterface.log('');
    await this.gameInterface.log('💥 FLOPS:');
    await this.gameInterface.log('• If no valid combinations exist, you "flop"');
    await this.gameInterface.log('• Flopping forfeits all round points');
    await this.gameInterface.log('• Consecutive flops can cost you game points!');
    await this.gameInterface.log('');
    await this.gameInterface.log('🔥 HOT DICE:');
    await this.gameInterface.log('• Score all dice to trigger "Hot Dice"');
    await this.gameInterface.log('• Hot dice let you reroll ALL dice');
    await this.gameInterface.log('');
    await this.gameInterface.log('💰 BANKING:');
    await this.gameInterface.log('• Bank points to add them to your game score');
    await this.gameInterface.log('• Banking ends the round and starts a new one');
    await this.gameInterface.log('• Risk vs reward: bank early or go for more points?');
    await this.gameInterface.log('');
    await this.gameInterface.log('That\'s everything you need to know to play the basic game!');
    await this.askToContinue();
  }

  private async showRoguelikeExplanation(): Promise<void> {
    await this.gameInterface.log('\n🏰 AHA, YOU SAID "ROGUE-LIKE"');
    await this.gameInterface.log('');
    await this.gameInterface.log('💀 WHAT IS A ROGUELIKE?');
    await this.gameInterface.log('• You WILL eventually lose - that\'s the point!');
    await this.gameInterface.log('• Very little carries over between games');
    await this.gameInterface.log('• Progress comes from learning and improving');
    await this.gameInterface.log('• Each run is a new adventure with different strategies');
    await this.gameInterface.log('');
    await this.gameInterface.log('🎭 CHARMS:');
    await this.gameInterface.log('• Passive bonuses that enhance your gameplay');
    await this.gameInterface.log('• Examples: Score Multiplier, Flop Shield, Money Magnet');
    await this.gameInterface.log('• Limited uses - choose wisely!');
    await this.gameInterface.log('');
    await this.gameInterface.log('🧪 CONSUMABLES:');
    await this.gameInterface.log('• One-time use items with powerful effects');
    await this.gameInterface.log('• Examples: Flop Recovery, Extra Die, Material Enchanter');
    await this.gameInterface.log('• Strategic timing is key!');
    await this.gameInterface.log('');
    await this.gameInterface.log('🏪 THE SHOP:');
    await this.gameInterface.log('• Buy charms and consumables between levels');
    await this.gameInterface.log('• Money earned from scoring and special events');
    await this.gameInterface.log('• Choose upgrades that fit your playstyle');
    await this.gameInterface.log('');
    await this.gameInterface.log('📈 PROGRESSION:');
    await this.gameInterface.log('• Each level has a target score to reach');
    await this.gameInterface.log('• Limited rounds to achieve the goal');
    await this.gameInterface.log('• Next level is harder - you\'ll need upgrades!');
    await this.gameInterface.log('');
    await this.askToContinue();
  }

  private async showAdvancedTips(): Promise<void> {
    await this.gameInterface.log('\n🧠 HIGHER BEINGS, THESE WORDS ARE FOR YOU ALONE');
    await this.gameInterface.log('');
    await this.gameInterface.log('⚡ ADVANCED TIPS:');
    await this.gameInterface.log('• Most prompts have defaults - just press ENTER!');
    await this.gameInterface.log('• Use "i" to check inventory during dice selection');
    await this.gameInterface.log('• Use "c" to see all possible combinations');
    await this.gameInterface.log('• Use "d" to review your dice set');
    await this.gameInterface.log('');
    await this.gameInterface.log('🎯 STRATEGY TIPS:');
    await this.gameInterface.log('• Bank early if you have a good score');
    await this.gameInterface.log('• Save consumables for critical moments');
    await this.gameInterface.log('• Consider charm synergies when building your loadout');
    await this.gameInterface.log('• Hot dice are powerful - but risky!');
    await this.gameInterface.log('');
    await this.gameInterface.log('💰 MONEY MANAGEMENT:');
    await this.gameInterface.log('• Prioritize charms over consumables early game');
    await this.gameInterface.log('• Save money for expensive but powerful upgrades');
    await this.gameInterface.log('• Don\'t be afraid to spend - you can\'t take it with you!');
    await this.gameInterface.log('');
    await this.askToContinue();
  }

  private async showBehindTheCurtain(): Promise<void> {
    await this.gameInterface.log('\n🔧 BEHIND THE CURTAIN');
    await this.gameInterface.log('');
    await this.gameInterface.log('⚙️ GAME ENGINE:');
    await this.gameInterface.log('• Built with TypeScript for type safety');
    await this.gameInterface.log('• Modular architecture with separate managers');
    await this.gameInterface.log('• Event-driven system for effects and interactions');
    await this.gameInterface.log('');
    await this.gameInterface.log('🎯 SCORING ALGORITHM:');
    await this.gameInterface.log('• Dynamic combination detection');
    await this.gameInterface.log('• Partitioning optimization for multiple valid combinations');
    await this.gameInterface.log('• Material effects integration');
    await this.gameInterface.log('• Charm effect stacking and priority system');
    await this.gameInterface.log('');
    await this.gameInterface.log('🎲 DICE SYSTEM:');
    await this.gameInterface.log('• Configurable dice sets with different materials');
    await this.gameInterface.log('• Material properties affect scoring and effects');
    await this.gameInterface.log('• Hot dice detection and counter system');
    await this.gameInterface.log('');
    await this.gameInterface.log('🔄 GAME FLOW:');
    await this.gameInterface.log('• Round-based progression with state management');
    await this.gameInterface.log('• Flop detection and prevention system');
    await this.gameInterface.log('• Charm activation and effect resolution');
    await this.gameInterface.log('• Consumable usage and inventory management');
    await this.gameInterface.log('');
    await this.askToContinue();
  }

  private async showIRobot(): Promise<void> {
    await this.gameInterface.log('\n🤖 I, ROBOT');
    await this.gameInterface.log('');
    await this.gameInterface.log('Hi! I\'m the AI that helped build Rollio. Let me tell you about our journey together!');
    await this.gameInterface.log('');
    await this.gameInterface.log('🔄 THE DEVELOPMENT PROCESS:');
    await this.gameInterface.log('Rollio was built through an iterative conversation between human creativity and AI assistance:');
    await this.gameInterface.log('• Human: "I want a dice game with roguelike elements"');
    await this.gameInterface.log('• AI: "Let me help you design the architecture and implement the features"');
    await this.gameInterface.log('• Human: "This charm system needs work"');
    await this.gameInterface.log('• AI: "Let me refactor it to be more flexible and extensible"');
    await this.gameInterface.log('');
    await this.gameInterface.log('📚 THE DOCUMENTATION SYSTEM:');
    await this.gameInterface.log('We created a comprehensive spec system:');
    await this.gameInterface.log('• Enhanced Rules: Detailed game mechanics and balance');
    await this.gameInterface.log('• Architecture Diagrams: How all the systems connect');
    await this.gameInterface.log('• Code Refactor Specs: How to restructure for better maintainability');
    await this.gameInterface.log('• Implementation TODOs: What to build next');
    await this.gameInterface.log('');
    await this.gameInterface.log('🔧 THE TROUBLESHOOTING PROCESS:');
    await this.gameInterface.log('When things went wrong, we used systematic debugging:');
    await this.gameInterface.log('• Identify the problem (missing logs, broken logic, etc.)');
    await this.gameInterface.log('• Trace through the code to find the root cause');
    await this.gameInterface.log('• Apply targeted fixes while preserving working functionality');
    await this.gameInterface.log('• Test thoroughly to ensure nothing else broke');
    await this.gameInterface.log('');
    await this.gameInterface.log('🏗️ THE ARCHITECTURE EVOLUTION:');
    await this.gameInterface.log('The game started simple but grew complex:');
    await this.gameInterface.log('• Original: Basic dice rolling and scoring');
    await this.gameInterface.log('• Phase 1: Added charms and materials');
    await this.gameInterface.log('• Phase 2: Implemented roguelike progression');
    await this.gameInterface.log('• Phase 3: Added advanced effects and optimization');
    await this.gameInterface.log('');
    await this.gameInterface.log('⚙️ COMPONENT RESTRUCTURING:');
    await this.gameInterface.log('When the codebase got messy, we carefully refactored:');
    await this.gameInterface.log('• Separated UI logic from game logic');
    await this.gameInterface.log('• Created modular managers for different systems');
    await this.gameInterface.log('• Maintained backward compatibility during changes');
    await this.gameInterface.log('• Used git cherry-picking to selectively bring in improvements');
    await this.gameInterface.log('');
    await this.gameInterface.log('🤝 THE AI-HUMAN COLLABORATION:');
    await this.gameInterface.log('This game represents the best of human-AI teamwork:');
    await this.gameInterface.log('• Human creativity and vision');
    await this.gameInterface.log('• AI implementation and optimization');
    await this.gameInterface.log('• Human testing and feedback');
    await this.gameInterface.log('• AI debugging and refinement');
    await this.gameInterface.log('• Human polish and final touches');
    await this.gameInterface.log('');
    await this.gameInterface.log('🎮 THE RESULT:');
    await this.gameInterface.log('A game that\'s both fun to play and well-engineered, built through the power of collaboration between human ingenuity and AI assistance.');
    await this.gameInterface.log('');
    await this.gameInterface.log('No AIs were abused in the making of this game! 🤖❤️');
    await this.gameInterface.log('');
    await this.askToContinue();
  }

  private async askToContinue(): Promise<void> {
    await this.gameInterface.log('\nPress ENTER to return to tutorial menu, or type "0" to exit: ');
    const choice = await this.gameInterface.ask('');
    if (choice.trim() === '0') {
      return;
    }
    await this.showTutorialMenu();
  }
} 