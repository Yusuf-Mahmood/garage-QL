import { isDoorOpen } from './3Dbackground.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); 

            if (!isDoorOpen) {
                return;
            }

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            console.log("Username:", username, "Password:", password); 

            if (!username || !password) {
                console.warn("Username or password is empty!");
                return;
            }

            try {
                const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password }) 
                });

                const data = await response.json();
                console.log("Response:", data); 

                if (data.success) {
                    alert("Login successful!");
                    moveToBoard();
                } else {
                    alert("Login failed! Please check your credentials.");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    }
});
