import { isDoorOpen, moveToBoard, updateStartingPositions, jumpscare } from './3Dbackground.js';
import { displaySVGCharts, displayUserInfo } from './displaySVGs.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); 

            if (!isDoorOpen) {
                return;
            }

            const usernamemail = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!usernamemail || !password) {
                console.warn("Username or password is empty!");
                return;
            }
            let onceJumpScare = sessionStorage.getItem('jumpScareTriggered') === 'true';

            if (!onceJumpScare) {
                if (usernamemail === 'aaljamal') {
                    onceJumpScare = true;
                    sessionStorage.setItem('jumpScareTriggered', 'true');
                    humanoid.style.display = 'flex';
                    document.getElementById('errorMessage').innerText = "I am sorry Ahmed lol";
                    jumpscare();
                    return;
                }
            }

            const isEmail = usernamemail.includes('@');
            const encodedCredentials = btoa(`${usernamemail.trim()}:${password.trim()}`);
            const bodyData = isEmail 
            ? { email: usernamemail, password } 
            : { username: usernamemail, password };

            try {
                const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${encodedCredentials}`
                    },
                    body: JSON.stringify(bodyData)
                });
            
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            
                const data = await response.json();
            
                if (data) {
                    localStorage.setItem('jwtToken', data);
                    await moveToBoard();
                    fetchProfileData();
                } else {
                    document.getElementById('errorMessage').innerText = "Invalid Token";
                }
            } catch (error) {
                console.error("Error:", error);
                document.getElementById('errorMessage').innerText = "Invalid Credentials";
                // jumpscare();
                return;
            }            
        });
    });

const fetchProfileData = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        console.error("No JWT token found! Please log in.");
        return;
    }

    const graphqlQuery = {
        query: `
        {
            user {
                id
                auditRatio
                email
                firstName
                lastName
                login
                totalDown
                totalUp
                login
                transactions {
                    type
                    amount
                    createdAt
                }
                TransactionsFiltered2: transactions(where: {type: {_eq: "level"},  path: { _like: "%bh-module%", _nregex: "^.*(piscine-js/|piscine-rust/|piscine-ui/|piscine-ux/).*$" }}, order_by: {amount: desc}, limit: 1) {
                    amount
                    type
                    path
                }
            }
        }`
    };

    try {
        const response = await fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(graphqlQuery)
        });

        const result = await response.json();

        if (result) {
            updateStartingPositions();
            displaySVGCharts(result);
            displayUserInfo(result);
        } else {
            console.error("Error fetching data:", result.errors);
        }

    } catch (error) {
        console.error("Error fetching profile data:", error);
    }
};
