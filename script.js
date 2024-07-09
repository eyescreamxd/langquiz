document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const startButton = document.getElementById('start-button');
    const welcomeScreen = document.getElementById('welcome-screen');
    const typeScreen = document.getElementById('type-screen');
    const typeSelect = document.getElementById('type-select');
    const randomLettersButton = document.getElementById('random-letters-button');
    const startPracticeButton = document.getElementById('start-practice-button');
    const backToLanguageButton = document.getElementById('back-to-language-button');
    const backToTypeButton = document.getElementById('back-to-type-button');
    const backToStartButton = document.getElementById('back-to-start-button');
    const quizContainer = document.getElementById('quiz-container');
    const quiz = document.getElementById('quiz');
    const completionScreen = document.getElementById('completion-screen');
    const errorCount = document.getElementById('error-count');
    const problemLetters = document.getElementById('problem-letters');

    let errorTracker = {};
    let inputs = [];

    // Populate the language dropdown
    for (let language in languages) {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language.charAt(0).toUpperCase() + language.slice(1);
        languageSelect.appendChild(option);
    }

    // Function to generate the type selection options
    const generateTypeSelect = (language) => {
        typeSelect.innerHTML = ''; // Clear previous options
        const types = Object.keys(languages[language]);
        types.forEach(type => {
            const typeOption = document.createElement('div');
            typeOption.classList.add('type-option');
            typeOption.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeOption.dataset.type = type;
            typeSelect.appendChild(typeOption);

            typeOption.addEventListener('click', () => {
                typeOption.classList.toggle('selected');
            });
        });
    }

    // Function to generate the quiz grid
    const generateQuiz = (language, types) => {
        quiz.innerHTML = ''; // Clear previous quiz
        let characters = [];
        errorTracker = {};
        inputs = [];
        types.forEach(type => {
            characters = characters.concat(Object.keys(languages[language][type]).map(char => ({
                char,
                translits: languages[language][type][char]
            })));
        });
        
        // Shuffle characters
        characters = characters.sort(() => Math.random() - 0.5);

        characters.forEach(({ char, translits }, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <div class="char-container">
                    <div class="char">${char}</div>
                    <div class="help">
                        ?
                        <div class="tooltip">${translits.join(', ')}</div>
                    </div>
                </div>
                <input type="text" />
            `;
            quiz.appendChild(card);

            // Initialize error tracker for each character
            errorTracker[char] = { correct: false, mistakes: 0 };

            const input = card.querySelector('input');
            inputs.push(input);

            // Handle input validation
            input.addEventListener('input', () => {
                if (translits.includes(input.value)) {
                    card.classList.add('correct');
                    card.classList.remove('incorrect');
                    input.disabled = true;
                    errorTracker[char].correct = true;
                    checkCompletion();
                    // Move to the next input
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                } else {
                    card.classList.remove('correct');
                    card.classList.add('incorrect');
                    errorTracker[char].mistakes++;
                    setTimeout(() => {
                        card.classList.remove('incorrect');
                    }, 2000);
                }
            });
        });
        // Focus the first input initially
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }

    // Function to generate a quiz with random letters
    const generateRandomQuiz = (language) => {
        quiz.innerHTML = ''; // Clear previous quiz
        let characters = [];
        errorTracker = {};
        inputs = [];
        const types = Object.keys(languages[language]);
        types.forEach(type => {
            characters = characters.concat(Object.keys(languages[language][type]).map(char => ({
                char,
                translits: languages[language][type][char]
            })));
        });
        
        // Select 10 random characters
        characters = characters.sort(() => Math.random() - 0.5).slice(0, 10);

        characters.forEach(({ char, translits }, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <div class="char-container">
                    <div class="char">${char}</div>
                    <div class="help">
                        ?
                        <div class="tooltip">${translits.join(', ')}</div>
                    </div>
                </div>
                <input type="text" />
            `;
            quiz.appendChild(card);

            // Initialize error tracker for each character
            errorTracker[char] = { correct: false, mistakes: 0 };

            const input = card.querySelector('input');
            inputs.push(input);

            // Handle input validation
            input.addEventListener('input', () => {
                if (translits.includes(input.value)) {
                    card.classList.add('correct');
                    card.classList.remove('incorrect');
                    input.disabled = true;
                    errorTracker[char].correct = true;
                    checkCompletion();
                    // Move to the next input
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                } else {
                    card.classList.remove('correct');
                    card.classList.add('incorrect');
                    errorTracker[char].mistakes++;
                    setTimeout(() => {
                        card.classList.remove('incorrect');
                    }, 2000);
                }
            });
        });
        // Focus the first input initially
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }

    // Check if all characters are correctly answered
    const checkCompletion = () => {
        const allCorrect = Object.values(errorTracker).every(track => track.correct);
        if (allCorrect) {
            showCompletionScreen();
        }
    }

    // Show completion screen with error details
    const showCompletionScreen = () => {
        const errors = Object.entries(errorTracker)
            .filter(([char, track]) => track.mistakes > 0)
            .map(([char, track]) => `${char}: ${track.mistakes} errors`);

        errorCount.textContent = `Total Errors: ${errors.length}`;
        problemLetters.textContent = `Problematic Letters: ${errors.join(', ')}`;

        quizContainer.style.display = 'none';
        completionScreen.style.display = 'block';
    }

    // Event listener for language selection to generate type options
    languageSelect.addEventListener('change', (event) => {
        generateTypeSelect(event.target.value);
    });

    // Event listener for start button
    startButton.addEventListener('click', () => {
        const selectedLanguage = languageSelect.value;
        if (selectedLanguage) {
            welcomeScreen.style.display = 'none'; // Hide welcome screen
            typeScreen.style.display = 'block'; // Show type selection screen
            generateTypeSelect(selectedLanguage);
        } else {
            alert('Please select a language.');
        }
    });

    // Event listener for random letters button
    randomLettersButton.addEventListener('click', () => {
        const selectedLanguage = languageSelect.value;
        if (selectedLanguage) {
            typeScreen.style.display = 'none'; // Hide type selection screen
            quizContainer.style.display = 'block'; // Show quiz container
            generateRandomQuiz(selectedLanguage);
        } else {
            alert('Please select a language.');
        }
    });

    // Event listener for start practice button
    startPracticeButton.addEventListener('click', () => {
        const selectedLanguage = languageSelect.value;
        const selectedTypes = Array.from(typeSelect.querySelectorAll('.type-option.selected')).map(option => option.dataset.type);
        if (selectedTypes.length > 0) {
            typeScreen.style.display = 'none'; // Hide type selection screen
            quizContainer.style.display = 'block'; // Show quiz container
            generateQuiz(selectedLanguage, selectedTypes);
        } else {
            alert('Please select at least one type of letters to practice.');
        }
    });

    // Event listener for back to language button
    backToLanguageButton.addEventListener('click', () => {
        typeScreen.style.display = 'none'; // Hide type selection screen
        welcomeScreen.style.display = 'block'; // Show welcome screen
    });

    // Event listener for back to type button
    backToTypeButton.addEventListener('click', () => {
        quizContainer.style.display = 'none'; // Hide quiz container
        typeScreen.style.display = 'block'; // Show type selection screen
    });

    // Event listener for back to start button
    backToStartButton.addEventListener('click', () => {
        completionScreen.style.display = 'none'; // Hide completion screen
        welcomeScreen.style.display = 'block'; // Show welcome screen
    });

    // Generate an initial quiz (hidden by default)
    quizContainer.style.display = 'none';
    typeScreen.style.display = 'none';
    completionScreen.style.display = 'none';
});
