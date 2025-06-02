// script.js
document.addEventListener('DOMContentLoaded', () => {
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');
    const showSignupButton = document.getElementById('show-signup');
    const showLoginButton = document.getElementById('show-login');
    const backToLoginButton = document.getElementById('back-to-login');

    // Gemini Feature Elements
    const getRecommendationsBtn = document.getElementById('get-recommendations-btn');
    const recommendationsModal = document.getElementById('recommendations-modal');
    const modalBodyContent = document.getElementById('modal-body-content');
    const modalCloseBtn = document.getElementById('modal-close');
    const geminiBtnText = getRecommendationsBtn ? getRecommendationsBtn.querySelector('.gemini-btn-text') : null;
    const loadingSpinner = getRecommendationsBtn ? getRecommendationsBtn.querySelector('.loading-spinner') : null;


    // --- Navigation ---
    if (showSignupButton) {
        showSignupButton.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormContainer.classList.add('hidden');
            signupFormContainer.classList.remove('hidden');
            // Ensure display flex is correctly applied if it was removed
            signupFormContainer.style.display = 'block'; // Or 'flex' if that's your layout
        });
    }

    if (showLoginButton) {
        showLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            signupFormContainer.classList.add('hidden');
            signupFormContainer.style.display = 'none';
            loginFormContainer.classList.remove('hidden');
            loginFormContainer.style.display = 'block'; // Or 'flex'
        });
    }

    if (backToLoginButton) {
        backToLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            signupFormContainer.classList.add('hidden');
            signupFormContainer.style.display = 'none';
            loginFormContainer.classList.remove('hidden');
            loginFormContainer.style.display = 'block'; // Or 'flex'
        });
    }

    // --- Form Submissions (Basic Placeholder) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Login form submitted');
            displayMessage('Login successful (mock)!', 'success', loginFormContainer);
            loginForm.reset();
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Signup form submitted');
            displayMessage('Registration successful (mock)! Please log in.', 'success', signupFormContainer);
            signupForm.reset();
        });
    }

    // --- Gemini API Feature ---
    if (getRecommendationsBtn) {
        getRecommendationsBtn.addEventListener('click', async () => {
            const ageInput = document.getElementById('age');
            const genderInput = document.querySelector('input[name="gender"]:checked');

            if (!ageInput || !ageInput.value) {
                displayMessage('Please enter your age to get recommendations.', 'error', signupFormContainer);
                return;
            }
            if (!genderInput || !genderInput.value) {
                displayMessage('Please select your gender to get recommendations.', 'error', signupFormContainer);
                return;
            }

            const age = ageInput.value;
            const gender = genderInput.value;

            // Show loading state
            if (geminiBtnText) geminiBtnText.classList.add('hidden');
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            getRecommendationsBtn.disabled = true;
            
            modalBodyContent.textContent = 'Loading suggestions...';
            recommendationsModal.classList.add('active');

            try {
                const prompt = `Based on a person who is ${age} years old and identifies as ${gender}, suggest 3 types of sport accessories they might be interested in. For each suggestion, provide a short, compelling reason (1-2 sentences). Format the response as a list.`;
                
                let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
                const payload = { contents: chatHistory };
                const apiKey = ""; // Canvas will provide this
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Gemini API Error:', errorData);
                    throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    modalBodyContent.textContent = text;
                } else {
                    console.error('Unexpected API response structure:', result);
                    modalBodyContent.textContent = 'Could not retrieve recommendations at this time. The response from the AI was not in the expected format.';
                }

            } catch (error) {
                console.error('Error fetching recommendations:', error);
                modalBodyContent.textContent = `Failed to get recommendations. ${error.message}. Please try again later.`;
            } finally {
                // Hide loading state
                if (geminiBtnText) geminiBtnText.classList.remove('hidden');
                if (loadingSpinner) loadingSpinner.classList.add('hidden');
                getRecommendationsBtn.disabled = false;
            }
        });
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            recommendationsModal.classList.remove('active');
        });
    }
    // Close modal if overlay is clicked
    if (recommendationsModal) {
        recommendationsModal.addEventListener('click', (event) => {
            if (event.target === recommendationsModal) { // Clicked on overlay itself
                 recommendationsModal.classList.remove('active');
            }
        });
    }

});

// --- Utility Functions ---
function togglePasswordVisibility(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const iconContainer = passwordField.nextElementSibling; // The span containing the icon
    if (!iconContainer) return;
    const icon = iconContainer.querySelector('svg');
    if (!icon) return;

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L12 12" />`;
    } else {
        passwordField.type = 'password';
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />`;
    }
}

function displayMessage(message, type = 'info', container) {
    const existingMessage = container.querySelector('.custom-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'custom-message p-3 rounded-md text-sm my-4'; // Added my-4 for spacing
    let bgColor, textColor, borderColor;

    switch (type) {
        case 'success': bgColor = 'bg-green-100'; textColor = 'text-green-700'; borderColor = 'border-green-400'; break;
        case 'error': bgColor = 'bg-red-100'; textColor = 'text-red-700'; borderColor = 'border-red-400'; break;
        default: bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; borderColor = 'border-blue-400'; break;
    }
    messageDiv.classList.add(bgColor, textColor, borderColor, 'border');
    messageDiv.textContent = message;

    // Insert message before the form itself or at the top of the container
    const formElement = container.querySelector('form');
    if (formElement) {
         container.insertBefore(messageDiv, formElement);
    } else {
        // Fallback if no form, insert before first child or append
        if (container.firstChild) {
            container.insertBefore(messageDiv, container.firstChild);
        } else {
            container.appendChild(messageDiv);
        }
    }

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}
