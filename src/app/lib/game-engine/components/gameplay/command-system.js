// src/app/lib/game-engine/components/gameplay/command-system.js
import { registry } from '../../component-registry';
import { characterManager } from '../../character-manager';

/**
 * Command System Component
 * 
 * Implements a text command interface that allows players to enter
 * commands to control the game, including character swapping.
 * Updated to support cycling through characters in a round-robin fashion.
 */
const commandSystemComponent = {
  name: 'commandSystem',
  priority: 2, // Run before most components
  dependencies: ['base', 'characterManager'],
  modifiesAnimation: false,
  
  generate: (config = {}) => {
    const setupCode = `
// Command System Setup
// Creates a command input interface for the game

// Create command input UI
const commandContainer = document.createElement('div');
commandContainer.style.position = 'absolute';
commandContainer.style.bottom = '20px';
commandContainer.style.left = '20px';
commandContainer.style.width = '100%';
commandContainer.style.maxWidth = '500px';
commandContainer.style.display = 'flex';
commandContainer.style.zIndex = '1000';

const commandInput = document.createElement('input');
commandInput.type = 'text';
commandInput.placeholder = 'Enter command (e.g., "swap plane" or "next")';
commandInput.style.flex = '1';
commandInput.style.padding = '8px 12px';
commandInput.style.border = '2px solid #333';
commandInput.style.borderRadius = '4px';
commandInput.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
commandInput.style.color = 'white';
commandInput.style.fontFamily = 'monospace';

const commandButton = document.createElement('button');
commandButton.textContent = '▶';
commandButton.style.marginLeft = '8px';
commandButton.style.padding = '8px 16px';
commandButton.style.border = '2px solid #333';
commandButton.style.borderRadius = '4px';
commandButton.style.backgroundColor = '#444';
commandButton.style.color = 'white';
commandButton.style.cursor = 'pointer';

commandContainer.appendChild(commandInput);
commandContainer.appendChild(commandButton);
document.body.appendChild(commandContainer);

// Add next/previous character buttons
const navContainer = document.createElement('div');
navContainer.style.position = 'absolute';
navContainer.style.bottom = '20px';
navContainer.style.right = '20px';
navContainer.style.display = 'flex';
navContainer.style.zIndex = '1000';

const prevButton = document.createElement('button');
prevButton.textContent = '◀ Prev';
prevButton.style.padding = '8px 16px';
prevButton.style.border = '2px solid #333';
prevButton.style.borderTopLeftRadius = '4px';
prevButton.style.borderBottomLeftRadius = '4px';
prevButton.style.backgroundColor = '#444';
prevButton.style.color = 'white';
prevButton.style.cursor = 'pointer';

const nextButton = document.createElement('button');
nextButton.textContent = 'Next ▶';
nextButton.style.padding = '8px 16px';
nextButton.style.border = '2px solid #333';
nextButton.style.borderTopRightRadius = '4px';
nextButton.style.borderBottomRightRadius = '4px';
nextButton.style.backgroundColor = '#444';
nextButton.style.color = 'white';
nextButton.style.cursor = 'pointer';

// Current character indicator
const currentCharLabel = document.createElement('div');
currentCharLabel.textContent = 'Current: Player';
currentCharLabel.style.padding = '8px 16px';
currentCharLabel.style.border = '2px solid #333';
currentCharLabel.style.backgroundColor = '#333';
currentCharLabel.style.color = 'white';
currentCharLabel.style.fontFamily = 'monospace';

navContainer.appendChild(prevButton);
navContainer.appendChild(currentCharLabel);
navContainer.appendChild(nextButton);
document.body.appendChild(navContainer);

// Command feedback UI
const feedbackContainer = document.createElement('div');
feedbackContainer.style.position = 'absolute';
feedbackContainer.style.bottom = '70px';
feedbackContainer.style.left = '20px';
feedbackContainer.style.maxWidth = '500px';
feedbackContainer.style.padding = '8px 12px';
feedbackContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
feedbackContainer.style.color = 'white';
feedbackContainer.style.fontFamily = 'monospace';
feedbackContainer.style.borderRadius = '4px';
feedbackContainer.style.transition = 'opacity 0.5s';
feedbackContainer.style.opacity = '0';
feedbackContainer.style.zIndex = '1000';
document.body.appendChild(feedbackContainer);

// Show feedback message with auto-hide
function showFeedback(message, isError = false) {
  feedbackContainer.textContent = message;
  feedbackContainer.style.backgroundColor = isError ? 'rgba(180, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)';
  feedbackContainer.style.opacity = '1';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    feedbackContainer.style.opacity = '0';
  }, 3000);
}

// Update the current character label
function updateCharacterLabel(type) {
  let displayName = 'Unknown';
  
  switch(type) {
    case 'player':
      displayName = 'Player';
      break;
    case 'vehicle':
    case 'car':
      displayName = 'Vehicle';
      break;
    case 'airplane':
      displayName = 'Airplane';
      break;
    case 'stylizedAirplane':
    case 'stylizedPlane':
    case 'cssPlane':
      displayName = 'Stylized Plane';
      break;
  }
  
  currentCharLabel.textContent = \`Current: \${displayName}\`;
}

// Process command input
function processCommand(input) {
  const command = input.trim().toLowerCase();
  
  // Parse command and arguments
  const parts = command.split(/\\s+/);
  const action = parts[0];
  const target = parts[1];
  
  // Character swap commands
  if (action === 'swap' || action === 'use' || action === 'change') {
    if (!target) {
      showFeedback('Please specify what character type to swap to', true);
      return;
    }
    
    // Handle different character types
    if (target === 'player' || target === 'human' || target === 'character') {
      window.swapCharacter('player');
      showFeedback('✓ Swapped to player character');
      updateCharacterLabel('player');
    }
    else if (target === 'car' || target === 'vehicle' || target === 'auto') {
      window.swapCharacter('vehicle');
      showFeedback('✓ Swapped to vehicle');
      updateCharacterLabel('vehicle');
    }
    else if (target === 'plane' || target === 'airplane' || target === 'jet' || 
             target === 'aircraft' || target === 'fighter') {
      window.swapCharacter('airplane');
      showFeedback('✓ Swapped to airplane');
      updateCharacterLabel('airplane');
    }
    else if (target === 'stylized' || target === 'css' || target === 'css3d' || 
             target === 'stylizedplane' || target === 'stylizedairplane' || target === 'cuboid') {
      window.swapCharacter('stylizedAirplane');
      showFeedback('✓ Swapped to stylized CSS airplane');
      updateCharacterLabel('stylizedAirplane');
    }
    else {
      showFeedback(\`Unknown character type: \${target}\`, true);
    }
  }
  // Next/previous character commands
  else if (action === 'next') {
    const nextType = window.nextCharacter();
    showFeedback(\`✓ Swapped to next character\`);
    updateCharacterLabel(window.gameState.activeCharacterType);
  }
  else if (action === 'prev' || action === 'previous') {
    const prevType = window.prevCharacter();
    showFeedback(\`✓ Swapped to previous character\`);
    updateCharacterLabel(window.gameState.activeCharacterType);
  }
  // Help command
  else if (action === 'help') {
    showFeedback('Commands: swap [player/car/plane/stylized], next, prev, help');
  }
  // Unknown command
  else {
    showFeedback(\`Unknown command: \${action}\`, true);
  }
}

// Set up command input handlers
function handleCommandSubmit() {
  const command = commandInput.value;
  if (command.trim()) {
    processCommand(command);
    commandInput.value = '';
  }
}

commandButton.addEventListener('click', handleCommandSubmit);
commandInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleCommandSubmit();
  }
});

// Set up next/prev button handlers
nextButton.addEventListener('click', () => {
  window.nextCharacter();
  updateCharacterLabel(window.gameState.activeCharacterType);
  showFeedback('✓ Swapped to next character');
});

prevButton.addEventListener('click', () => {
  window.prevCharacter();
  updateCharacterLabel(window.gameState.activeCharacterType);
  showFeedback('✓ Swapped to previous character');
});

// Show initial help message
setTimeout(() => {
  showFeedback('Press Tab to cycle through characters');
}, 1000);

// Add hotkeys help text
const hotkeyHelp = document.createElement('div');
hotkeyHelp.style.position = 'absolute';
hotkeyHelp.style.top = '20px';
hotkeyHelp.style.right = '20px';
hotkeyHelp.style.padding = '8px 12px';
hotkeyHelp.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
hotkeyHelp.style.color = 'white';
hotkeyHelp.style.fontFamily = 'monospace';
hotkeyHelp.style.borderRadius = '4px';
hotkeyHelp.style.zIndex = '1000';
hotkeyHelp.innerHTML = \`
  <div style="margin-bottom: 5px; text-decoration: underline;">Hotkeys:</div>
  <div>Tab: Cycle to Next Character</div>
  <div>Shift+Tab: Cycle to Previous Character</div>
  <div>WASD/Arrows: Move</div>
\`;
document.body.appendChild(hotkeyHelp);

// Initialize the character label
updateCharacterLabel(window.gameState.activeCharacterType || 'player');
`;

    // We don't need animation code for this component
    return {
      code: setupCode,
      animationCode: ''
    };
  }
};

// Register the command system component
registry.register('commandSystem', commandSystemComponent);

export default commandSystemComponent;