import { isDoorOpen, moveToBoard, jumpscare } from './3Dbackground.js';
import { displaySVGCharts, displayUserInfo } from './displaySVGs.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); 

            if (!isDoorOpen) {
                return;
            }

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                console.warn("Username or password is empty!");
                return;
            }

            const encodedCredentials = btoa(`${username}:${password}`);

            try {
                const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${encodedCredentials}`
                    },
                    body: JSON.stringify({ username, password })
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
                    alert("Login failed! Invalid Token.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("WHYYYY!!!");
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
            transactions_aggregate: transaction_aggregate(where: {type: {_eq: "xp"}}) {
                aggregate {
                    avg {
                        amount
                    }
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
        console.log("GraphQL Response:", result);

        if (result) {
            displaySVGCharts(result);
            displayUserInfo(result);
        } else {
            console.error("Error fetching data:", result.errors);
        }

    } catch (error) {
        console.error("Error fetching profile data:", error);
    }
};

