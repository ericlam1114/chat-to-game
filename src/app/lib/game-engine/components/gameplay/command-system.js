// src/app/lib/game-engine/components/gameplay/command-system.js
import { registry } from '../../component-registry';
import { characterManager } from '../../character-manager';

/**
 * Command System Component
 * 
 * Implements a text command interface that allows players to enter
 * commands to control the game, including character swapping.
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
commandInput.placeholder = 'Enter command (e.g., "swap plane" or "use car")';
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
    }
    else if (target === 'car' || target === 'vehicle' || target === 'auto') {
      window.swapCharacter('vehicle');
      showFeedback('✓ Swapped to vehicle');
    }
    else if (target === 'plane' || target === 'airplane' || target === 'jet' || 
             target === 'aircraft' || target === 'fighter') {
      window.swapCharacter('airplane');
      showFeedback('✓ Swapped to airplane');
    }
    else {
      showFeedback(\`Unknown character type: \${target}\`, true);
    }
  }
  // Help command
  else if (action === 'help') {
    showFeedback('Available commands: swap [player/car/plane], help');
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

// Show initial help message
setTimeout(() => {
  showFeedback('Type "help" for available commands');
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
  <div>1: Switch to Player</div>
  <div>2: Switch to Car</div>
  <div>3: Switch to Airplane</div>
  <div>WASD/Arrows: Move</div>
\`;
document.body.appendChild(hotkeyHelp);
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