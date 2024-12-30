// Constants and Configuration
const SCRYFALL_API = {
  AUTOCOMPLETE: 'https://api.scryfall.com/cards/autocomplete?q=',
  NAMED: 'https://api.scryfall.com/cards/named?exact='
};

const VALIDATION_RULES = {
  cardName: { maxLength: 100 },
  cardText: { maxLength: 250 }
};

// Mapping objects for database compatibility
const COLOR_IDENTITY_MAP = {
  '': 'Colorless',
  'W': 'Mono White',
  'U': 'Mono Blue',
  'B': 'Mono Black',
  'R': 'Mono Red',
  'G': 'Mono Green',
  'WU': 'Azorius',
  'WB': 'Orzhov',
  'UB': 'Dimir',
  'UR': 'Izzet',
  'BR': 'Rakdos',
  'BG': 'Golgari',
  'RG': 'Gruul',
  'RW': 'Boros',
  'GW': 'Selesnya',
  'GU': 'Simic',
  'WUB': 'Esper',
  'UBR': 'Grixis',
  'BRG': 'Jund',
  'RGW': 'Naya',
  'GWU': 'Bant',
  'WBG': 'Abzan',
  'URW': 'Jeskai',
  'BGU': 'Sultai',
  'RWB': 'Mardu',
  'GUR': 'Temur',
  'WUBRG': 'Five Color'
};

const COMBAT_ABILITIES = [
  'n/a',
  'Deathtouch',
  'Defender',
  'Double Strike',
  'First Strike',
  'Flying',
  'Haste',
  'Hexproof',
  'Indestructible',
  'Lifelink',
  'Menace',
  'Protection',
  'Reach',
  'Shroud',
  'Trample',
  'Vigilance',
  'Ward'
];

const MANA_COLORS = [
  'n/a',
  'Black',
  'Blue',
  'Green',
  'Red',
  'White',
  'Colorless'
];

// DOM Elements
const elements = {
  searchInput: document.getElementById('search-input'),
  searchResults: document.getElementById('search-results'),
  cardPreview: document.querySelector('.card-preview'),
  cardImage: document.querySelector('.card-image'),
  formContainer: document.querySelector('.form-container'),
  cardForm: document.getElementById('card-form'),
  errorContainer: document.querySelector('.error-container'),
  processedCards: document.querySelector('.processed-cards'),
  sqlOutput: document.getElementById('sql-output'),
  copyButton: document.getElementById('copy-sql')
};

// State Management
let state = {
  processedCards: [],
  currentCard: null
};

// Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem('mtgHelperState');
  if (savedState) {
      state = JSON.parse(savedState);
      renderProcessedCards();
      updateSqlOutput();
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('mtgHelperState', JSON.stringify(state));
}

// Error Handling
function showError(message) {
  elements.errorContainer.textContent = message;
  elements.errorContainer.style.display = 'block';
  setTimeout(() => {
      elements.errorContainer.style.display = 'none';
  }, 5000);
}

// API Calls
async function fetchAutocomplete(query) {
  try {
      const response = await fetch(`${SCRYFALL_API.AUTOCOMPLETE}${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      return data.data || [];
  } catch (error) {
      showError(`Autocomplete error: ${error.message}`);
      return [];
  }
}

async function fetchCardDetails(cardName) {
  try {
      const response = await fetch(`${SCRYFALL_API.NAMED}${encodeURIComponent(cardName)}`);
      if (!response.ok) throw new Error('Failed to fetch card details');
      return await response.json();
  } catch (error) {
      showError(`Card detail error: ${error.message}`);
      return null;
  }
}

// UI Rendering
function renderSearchResults(results) {
  elements.searchResults.innerHTML = '';
  results.forEach(result => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.textContent = result;
      div.onclick = () => selectCard(result);
      elements.searchResults.appendChild(div);
  });
  elements.searchResults.style.display = results.length ? 'block' : 'none';
}

function renderProcessedCards() {
  elements.processedCards.innerHTML = state.processedCards
      .map((card, index) => `
          <div class="card-list-item">
              <span>${card.name}</span>
              <button class="remove-card" onclick="removeCard(${index})">×</button>
          </div>
      `)
      .join('');
}

// Card Data Processing
function parseColorIdentity(colors) {
  if (!colors || colors.length === 0) return 'Colorless';
  const colorString = colors.sort().join('');
  return COLOR_IDENTITY_MAP[colorString] || 'Colorless';
}

function parseManaSymbols(manaCost) {
  if (!manaCost) return { generic: 0, pips: [] };
  const generic = parseInt(manaCost.match(/\{(\d+)\}/)?.[1] || 0);
  const pips = Array.from(manaCost.matchAll(/\{([WUBRG])\}/g))
      .map(match => match[1])
      .map(symbol => {
          switch(symbol) {
              case 'W': return 'White';
              case 'U': return 'Blue';
              case 'B': return 'Black';
              case 'R': return 'Red';
              case 'G': return 'Green';
              default: return 'n/a';
          }
      });
  return { generic, pips };
}

// Form Handling
function populateForm(cardData) {
  const form = elements.cardForm;
  const manaInfo = parseManaSymbols(cardData.mana_cost);
  
  // Basic card information
  form.querySelector('#card-name').value = cardData.name;
  form.querySelector('#rarity').value = cardData.rarity.charAt(0).toUpperCase() + cardData.rarity.slice(1);
  form.querySelector('#type').value = cardData.type_line.split('—')[0].trim().split(' ').pop();
  form.querySelector('#identity').value = parseColorIdentity(cardData.color_identity);
  
  // Mana costs
  form.querySelector('#converted-cost').value = cardData.cmc;
  form.querySelector('#generic-mana').value = manaInfo.generic;
  form.querySelector('#pip-count').value = manaInfo.pips.length;
  
  // Pips
  for (let i = 0; i < 5; i++) {
      form.querySelector(`#pip${i + 1}`).value = manaInfo.pips[i] || 'n/a';
  }
  
  // Card text
  form.querySelector('#card-text').value = cardData.oracle_text;
  
  // Supertype
  const supertypes = ['Legendary', 'Basic', 'Snow', 'World'];
  const cardSupertype = supertypes.find(type => cardData.type_line.includes(type)) || 'n/a';
  form.querySelector('#supertype').value = cardSupertype;
  
  // Subtypes
  const subtypes = cardData.type_line.split('—')[1]?.trim().split(' ') || [];
  for (let i = 0; i < 3; i++) {
      form.querySelector(`#subtype${i + 1}`).value = subtypes[i] || '';
  }
  
  // Keywords/Abilities
  cardData.keywords.forEach((keyword, index) => {
      if (index < 5 && COMBAT_ABILITIES.includes(keyword)) {
          form.querySelector(`#ability${index + 1}`).value = keyword;
      }
  });
}

// Event Handlers
async function selectCard(cardName) {
  elements.searchResults.style.display = 'none';
  const cardData = await fetchCardDetails(cardName);
  if (cardData) {
      state.currentCard = cardData;
      elements.cardImage.src = cardData.image_uris?.normal || '';
      elements.cardPreview.style.display = 'flex';
      populateForm(cardData);
  }
}

function generateSqlCall(formData) {
  return `CALL SP_Insert_Card('${formData.cardName}', '${formData.rarity}', '${formData.type}', '${formData.identity}', '${formData.supertype}', '${formData.subtype1}', '${formData.subtype2}', '${formData.subtype3}', '${formData.ability1}', '${formData.ability2}', '${formData.ability3}', '${formData.ability4}', '${formData.ability5}', ${formData.convertedCost}, ${formData.genericMana}, ${formData.pipCount}, '${formData.pip1}', '${formData.pip2}', '${formData.pip3}', '${formData.pip4}', '${formData.pip5}', '${formData.cardText.replace(/'/g, "''")}');`;
}

function updateSqlOutput() {
  elements.sqlOutput.value = state.processedCards
      .map(card => generateSqlCall(card))
      .join('\n');
}

function removeCard(index) {
  state.processedCards.splice(index, 1);
  renderProcessedCards();
  updateSqlOutput();
  saveState();
}

// Event Listeners
elements.searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (query.length >= 3) {
      const suggestions = await fetchAutocomplete(query);
      renderSearchResults(suggestions);
  } else {
      elements.searchResults.style.display = 'none';
  }
});

document.getElementById('cancel-card').addEventListener('click', () => {
  // Clear the form
  elements.cardForm.reset();
  
  // Hide the card preview
  elements.cardPreview.style.display = 'none';
  
  // Clear the search input
  elements.searchInput.value = '';
  
  // Hide search results if they're showing
  elements.searchResults.style.display = 'none';
});

elements.cardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = {
      name: elements.cardForm.querySelector('#card-name').value,
      cardName: elements.cardForm.querySelector('#card-name').value,
      rarity: elements.cardForm.querySelector('#rarity').value,
      type: elements.cardForm.querySelector('#type').value,
      identity: elements.cardForm.querySelector('#identity').value,
      supertype: elements.cardForm.querySelector('#supertype').value,
      subtype1: elements.cardForm.querySelector('#subtype1').value || 'n/a',
      subtype2: elements.cardForm.querySelector('#subtype2').value || 'n/a',
      subtype3: elements.cardForm.querySelector('#subtype3').value || 'n/a',
      ability1: elements.cardForm.querySelector('#ability1').value || 'n/a',
      ability2: elements.cardForm.querySelector('#ability2').value || 'n/a',
      ability3: elements.cardForm.querySelector('#ability3').value || 'n/a',
      ability4: elements.cardForm.querySelector('#ability4').value || 'n/a',
      ability5: elements.cardForm.querySelector('#ability5').value || 'n/a',
      convertedCost: parseInt(elements.cardForm.querySelector('#converted-cost').value),
      genericMana: parseInt(elements.cardForm.querySelector('#generic-mana').value),
      pipCount: parseInt(elements.cardForm.querySelector('#pip-count').value),
      pip1: elements.cardForm.querySelector('#pip1').value,
      pip2: elements.cardForm.querySelector('#pip2').value,
      pip3: elements.cardForm.querySelector('#pip3').value,
      pip4: elements.cardForm.querySelector('#pip4').value,
      pip5: elements.cardForm.querySelector('#pip5').value,
      cardText: elements.cardForm.querySelector('#card-text').value
  };

  state.processedCards.push(formData);
  renderProcessedCards();
  updateSqlOutput();
  saveState();
  
  // Reset form and preview
  elements.cardForm.reset();
  elements.cardPreview.style.display = 'none';
});

elements.copyButton.addEventListener('click', () => {
  elements.sqlOutput.select();
  document.execCommand('copy');
  // Optional: Show feedback
  elements.copyButton.textContent = 'Copied!';
  setTimeout(() => {
      elements.copyButton.textContent = 'Copy All SQL';
  }, 2000);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Populate ability dropdowns
  const abilitySelects = ['ability1', 'ability2', 'ability3', 'ability4', 'ability5'];
  abilitySelects.forEach(id => {
      const select = document.getElementById(id);
      COMBAT_ABILITIES.forEach(ability => {
          const option = document.createElement('option');
          option.value = ability;
          option.textContent = ability;
          select.appendChild(option);
      });
  });

  // Populate color identity dropdown
const identitySelect = document.getElementById('identity');
Object.values(COLOR_IDENTITY_MAP).forEach(identity => {
    const option = document.createElement('option');
    option.value = identity;
    option.textContent = identity;
    identitySelect.appendChild(option);
});

  // Populate pip dropdowns
  const pipSelects = ['pip1', 'pip2', 'pip3', 'pip4', 'pip5'];
  pipSelects.forEach(id => {
      const select = document.getElementById(id);
      MANA_COLORS.forEach(color => {
          const option = document.createElement('option');
          option.value = color;
          option.textContent = color;
          select.appendChild(option);
      });
  });

  // Load saved state
  loadState();
});