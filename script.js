class WordGame {
    constructor() {
        this.initDOMElements();
        this.initGameState();
        this.addEventListeners();
        this.startGame();
    }

    // Initialize and cache DOM elements
    initDOMElements() {
        this.lettersElement = document.getElementById('letters');
        this.wordInput = document.getElementById('wordInput');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.guessedWordsContainer = document.querySelector('.guessed-words-container');
        this.messageElement = document.getElementById('message');
        this.modalElement = document.getElementById('modal');
        this.modalMessage = document.getElementById('modalMessage');
        this.closeModalButton = document.getElementById('closeModal');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.playAgainContainer = document.getElementById('playAgainContainer');
        this.highScoreElement = document.getElementById('highScore');
    }

    // Initialize game state variables
    initGameState() {
        this.letters = [];
        this.score = 0;
        this.timeLeft = 30;
        this.submittedWords = new Set();
        this.nineLetterWord = '';
        this.timerInterval = null;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;

        // Predefined array of nine-letter words
        this.nineLetterWords = [
            'aardvarks', 'abandoned', 'abilities', 'absurdity', 'academic', 'activate',
            'admirable', 'adventure', 'affection', 'algorithm', 'alligator', 'amazement',
            'ambitions', 'apartment', 'apologize', 'architect', 'assistant', 'attention',
            'available', 'backwards', 'beautiful', 'benchmark', 'blackjack', 'brilliant',
            'buildings', 'butterfly', 'calculate', 'candidate', 'celebrate', 'challenge',
            'chocolate', 'classroom', 'colleague', 'community', 'creature', 'crescendo',
            'dangerous', 'dedicated', 'delicious', 'diligence', 'direction', 'disappear',
            'education', 'effective', 'elephants', 'emotional', 'equipment', 'everybody',
            'fantastic', 'financial', 'fireplace', 'formation', 'framework', 'friendship',
            'gathering', 'gentleman', 'governors', 'happiness', 'historian', 'homeowner',
            'hospitals', 'ignorance', 'important', 'incentive', 'invisible', 'knowledge',
            'leadership', 'lifestyle', 'limestone', 'literally', 'mainframe', 'marketing',
            'medieval', 'migration', 'miserable', 'moonlight', 'mountains', 'necessary',
            'neighbors', 'nightmare', 'objective', 'organized', 'passenger', 'peaceful',
            'peninsula', 'perceived', 'pharmacy', 'political', 'pollution', 'portfolio',
            'powerless', 'practical', 'precision', 'president', 'principal', 'procedure',
            'processor', 'prominent', 'prototype', 'questions', 'reasoning', 'reception',
            'reduction', 'reference', 'relations', 'relevant', 'reliable', 'religious',
            'remainder', 'reporting', 'republics', 'resistant', 'resources', 'restaurant',
            'retreated', 'revelation', 'satisfied', 'scenarios', 'scientist', 'secondary',
            'selection', 'separate', 'situated', 'sometimes', 'specialty', 'spectrum',
            'structure', 'suffering', 'sunflower', 'surprised', 'syndrome', 'technical',
            'temporary', 'tolerance', 'tournament', 'translate', 'transport', 'treatment',
            'triangle', 'typically', 'uncertain', 'underline', 'undertake', 'universal',
            'vacation', 'variation', 'vegetable', 'violently', 'violation', 'visionary',
            'volunteer', 'wilderness', 'wonderful', 'workplace', 'workshops', 'worthless',
            'wrestling', 'yearbooks', 'yesterday', 'yourselves'
        ];
    }

    // Add necessary event listeners
    addEventListeners() {
        this.wordInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.submitWord();
            }
        });

        this.closeModalButton.onclick = () => {
            this.modalElement.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === this.modalElement) {
                this.modalElement.style.display = 'none';
            }
        };

        this.playAgainButton.addEventListener('click', () => {
            this.resetGame();
        });
    }

    // Start the game by generating letters and starting the timer
    startGame() {
        this.selectNineLetterWord();
        this.generateLetters();
        this.startTimer();
        this.wordInput.focus();
        this.highScoreElement.textContent = this.highScore;
    }

    // Reset the game state
    resetGame() {
        this.initGameState();
        this.wordInput.disabled = false;
        this.playAgainContainer.style.display = 'none';
        this.guessedWordsContainer.innerHTML = '';
        this.messageElement.textContent = '';
        this.timerElement.classList.remove('timer-warning', 'timer-critical'); // Reset timer colors
        this.startGame();
    }

    // Select a random nine-letter word
    selectNineLetterWord() {
        const randomIndex = Math.floor(Math.random() * this.nineLetterWords.length);
        this.nineLetterWord = this.nineLetterWords[randomIndex];
    }

    // Generate shuffled letters from the nine-letter word
    generateLetters() {
        this.letters = this.shuffleArray([...this.nineLetterWord]);
        this.renderLetters();
    }

    // Shuffle an array using the Fisher-Yates algorithm
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Render the letters as tiles
    renderLetters() {
        this.lettersElement.innerHTML = '';
        this.letters.forEach(letter => {
            const letterTile = document.createElement('div');
            letterTile.textContent = letter.toUpperCase();
            letterTile.className = 'letter-tile';
            this.lettersElement.appendChild(letterTile);
        });
    }

    // Start the countdown timer
    startTimer() {
        this.timerElement.textContent = this.timeLeft;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;

            // Change timer color based on remaining time
            if (this.timeLeft <= 10 && this.timeLeft > 5) {
                this.timerElement.classList.add('timer-warning');
                this.timerElement.classList.remove('timer-critical');
            } else if (this.timeLeft <= 5) {
                this.timerElement.classList.add('timer-critical');
                this.timerElement.classList.remove('timer-warning');
            } else {
                this.timerElement.classList.remove('timer-warning', 'timer-critical');
            }

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.endGame();
            }
        }, 1000);
    }

    // Submit a word and update the game state
    async submitWord() {
        const rawInput = this.wordInput.value.trim().toLowerCase();
        const word = this.sanitizeInput(rawInput);

        if (this.submittedWords.has(word)) {
            this.showMessage(`You've already submitted "${word.toUpperCase()}". Try a new word.`);
            this.wordInput.value = '';
            return;
        }

        if (!word) {
            this.showMessage('Please enter a word.');
            return;
        }

        if (word.length < 2) {
            this.showMessage('Words must be at least 2 letters long.');
            this.wordInput.value = '';
            return;
        }

        if (this.canFormWordFromLetters(word)) {
            const isValid = await this.validateWord(word);
            if (isValid) {
                const wordScore = this.getWordScore(word);
                this.score += wordScore;
                this.submittedWords.add(word);
                this.scoreElement.textContent = this.score;
                this.updateGuessedWords(word);
                this.wordInput.value = '';
                this.addTime(word.length);
            } else {
                this.showMessage(`"${word.toUpperCase()}" is not an acceptable word.`);
                this.wordInput.value = '';
            }
        } else {
            this.showMessage(`"${word.toUpperCase()}" cannot be formed from the given letters.`);
            this.wordInput.value = '';
        }
    }

    // Sanitize user input to remove non-letter characters
    sanitizeInput(input) {
        return input.replace(/[^a-zA-Z]/g, '');
    }

    // Validate a word using a dictionary API
    async validateWord(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            return response.ok;
        } catch {
            return false;
        }
    }

    // Calculate the score for a given word
    getWordScore(word) {
        return word.length > 2 ? word.length * (word.length - 2) : 1;
    }

    // Update the guessed words list
    updateGuessedWords(word) {
        const wordElement = document.createElement('div');
        wordElement.className = 'guessed-word';
        wordElement.textContent = word.toUpperCase();
        this.guessedWordsContainer.prepend(wordElement);

        // Add flash animation
        wordElement.classList.add('flash');
        setTimeout(() => wordElement.classList.remove('flash'), 500);
    }

    // Check if a word can be formed from the given letters
    canFormWordFromLetters(word) {
        const lettersCount = this.letters.reduce((count, letter) => {
            const lowerLetter = letter.toLowerCase();
            count[lowerLetter] = (count[lowerLetter] || 0) + 1;
            return count;
        }, {});

        for (let char of word) {
            if (!lettersCount[char]) return false;
            lettersCount[char]--;
        }
        return true;
    }

    // Add time for correctly guessed words
    addTime(seconds) {
        this.timeLeft += seconds;
        this.timerElement.textContent = this.timeLeft;
    }

    // End the game
    endGame() {
        clearInterval(this.timerInterval);
        this.wordInput.disabled = true;
        if (!this.submittedWords.has(this.nineLetterWord)) {
            this.showMessage(`The nine-letter word was "${this.nineLetterWord.toUpperCase()}".`);
        }
        // Check and update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.showMessage(`New High Score: ${this.highScore}!`);
    }

    // Update the high score display
    this.highScoreElement.textContent = this.highScore;

        
        this.playAgainContainer.style.display = 'flex';
    }

    // Display a message to the user
    showMessage(message) {
        this.messageElement.textContent = message;
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordGame();
});