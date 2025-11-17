Inventory needs to be below shop

Dice UI was changed - it looks like either the dice were made smaller or the pips were given less spacing/padding, and I think the dice were perfect as they were before

Basically get rid of "Round" terminology in UI, can keep in game engine
Make "Round Points: #" into "Pot: #"
Denotes that the points are still up for grabs

"Roll 0 Dice" for new levels
Maybe new rounds too?

Hmmm the dice display still looks wildly different, can you go back and see how it was before commit e881290? 

Now comes the tricky part: Basically I want to make this middle button, the one currently handling "Score selected dice" into the main button that handles both Rolling and Scoring, while the button to the right continues to manage Banking, and the button to the left only manages Rerolling (rather than rolling and rerolling). This will take a lot of caution to get right, so please please triple check everything and let me know when you've given this a shot. 
To break it down a little further: the left button should be grayed out and display "Reroll" when rerolling is not available, and it should display "Reroll # Dice" when a reroll is available. The middle button should display "Roll 6 Dice" (or however many are in full set) at the start of a new level/round, and after scoring. For example, when I first start a new game, the middle button should show "Roll # Dice", and then while I have zero dice selected it should be grayed out and show "Score 0 Dice". Once I select at least 1 die, it should change to "Score 1 Die" or however many I have selected - however, we should only un-gray-out the button if the selection is valid, i.e. valid partitioning of combination(s). Once the player has clicked "Score # Dice", we should then display "Roll # Dice" again. For the Bank button, I don't think very much needs to change. Banking is available if there are nonzero points in the pot (round points) and the player has just scored before deciding to roll again. 
For formatting changes, let's make the Bank button a nice green color background with a black border and a white shadow around that border, with white text. Let's make the Reroll button blue background, with the same black border / white shadow / white text. Let's make the Roll button red when rolling is available, and Yellow/orange when Scoring is available - this is indicating that rolling the dice is a risk, while scoring the dice is associated with this but is a step towards safety. 
For the "Pot:" header at the top of the game board, I want to keep it red text when unbanked, and then I basically want to make it green and add a "+" after banking. So the text would be red while the player is actively selecting/scoring dice, and then the Pot text would be the same yellow/orange at the same time that the "Bank" button is available i.e. after scoring, and then after pressing bank it would turn green, and then once the player clicks "Roll" again, it would go back to red. 

I also want to move the hot dice counter to be right above the Roll/Score button, centered. 
