document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const startButton = document.getElementById('start-button');
    const welcomeScreen = document.getElementById('welcome-screen');
    const typeScreen = document.getElementById('type-screen');
    const typeSelect = document.getElementById('type-select');
    const startPracticeButton = document.getElementById('start-practice-button');
    const quizContainer = document.getElementById('quiz-container');
    const quiz = document.getElementById('quiz');
    
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
        types.forEach(type => {
            characters = characters.concat(Object.keys(languages[language][type]).map(char => ({
                char,
                translit: languages[language][type][char]
            })));
        });
        
        // Shuffle characters
        characters = characters.sort(() => Math.random() - 0.5);

        characters.forEach(({ char, translit }) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `<div class="char">${char}</div><input type="text" />`;
            quiz.appendChild(card);

            // Handle input validation
            const input = card.querySelector('input');
            input.addEventListener('input', () => {
                if (input.value === translit) {
                    card.classList.add('correct');
                    card.classList.remove('incorrect');
                } else {
                    card.classList.remove('correct');
                    card.classList.add('incorrect');
                    setTimeout(() => {
                        card.classList.remove('incorrect');
                    }, 2000);
                }
            });
        });
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

    // Generate an initial quiz (hidden by default)
    quizContainer.style.display = 'none';
    typeScreen.style.display = 'none';
});
