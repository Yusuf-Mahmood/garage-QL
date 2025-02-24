import { isDoorOpen, moveToBoard, jumpscare } from './3Dbackground.js';

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

const displayUserInfo = (userData) => {
    if (!userData.data || !userData.data.user) {
        console.error("Invalid user data structure", userData);
        return;
    }

    const user = userData.data.user[0];
    const moduleLevel = user.TransactionsFiltered2.length > 0 ? user.TransactionsFiltered2[0].amount : 'N/A';
    const userInfo = document.getElementById("userInfo");
    if (!userInfo) {
        console.error("User info container not found!");
        return;
    }

    userInfo.innerHTML = `
        <div style="display: flex; justify-content: center;">
        <h2 style="letter-spacing: 2px;">Profile</h2>
        <p style="letter-spacing: 2px;"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
        <p style=" letter-spacing: 2px;"><strong>Email:</strong> ${user.email}</p>
        <p style=" letter-spacing: 2px;"><strong>Username:</strong> ${user.login}</p>
        <p style=" letter-spacing: 2px;"><strong>Audit Ratio:</strong> ${Number(user.auditRatio.toFixed(1))}</p>
        <p style=" letter-spacing: 2px;"><strong>Module Level:</strong> ${moduleLevel}</p>
    `;
}

const displaySVGCharts = (userData) => {
    if (!userData.data || !userData.data.user) {
        console.error("Invalid user data structure", userData);
        return;
    }

    const user = userData.data.user[0]; 
    const totalUp = (user.totalUp / 1000) || 0;
    const totalDown = (user.totalDown / 1000) || 0;
    const transactions = user.transactions || [];

    const auditRatioData = [
        { x: 'Done', y: totalUp },
        { x: 'Received', y: totalDown }
    ];

    const options = {
        series: [{
            name: "Audit Ratio",
            data: auditRatioData
        }],
        chart: {
            height: 200, // Reduced height by half
            width: 600,
            type: 'bar',
            zoom: { enabled: false },
            background: 'transparent' // Remove white background
        },
        dataLabels: { enabled: true },
        plotOptions: { bar: { horizontal: true } },
        stroke: { width: [3], curve: 'smooth' },
        title: {
            text: 'Audit Ratio',
            align: 'left',
            style: { color: 'white', letterSpacing: '2px' } // Horror theme
        },
        grid: { row: { colors: ['#000000', 'transparent'], opacity: 0.5 } }, // Dark grid
        xaxis: {
            categories: auditRatioData.map(data => data.x),
            labels: { style: { colors: 'white', letterSpacing: '2px' } } // Horror theme
        },
        yaxis: { labels: { style: { colors: 'white', letterSpacing: '2px' } } } // Horror theme
    };

    const graphContainer = document.getElementById("graphContainer");
    if (!graphContainer) {
        console.error("Graph container not found!");
        return;
    }
    graphContainer.innerHTML = "";
    const chartDiv = document.createElement("div");
    chartDiv.id = "chart";
    graphContainer.appendChild(chartDiv);
    const chart = new ApexCharts(chartDiv, options);
    chart.render();

    const skills = [
        'skill_git', 'skill_algo', 'skill_tcp', 'skill_unix', 'skill_ai', 'skill_stats',
        'skill_go', 'skill_c', 'skill_sql', 'skill_html', 'skill_docker', 'skill_back-end',
        'skill_front-end', 'skill_sys-admin', 'skill_c-pp', 'skill_js', 'skill_game'
    ];

    const skillAmounts = skills.reduce((acc, skill) => {
        acc[skill] = 0;
        return acc;
    }, {});

    transactions.forEach(tx => {
        if (skills.includes(tx.type)) {
            skillAmounts[tx.type] += tx.amount;
        }
    });

    const skillNames = skills.map(skill => skill.replace('skill_', '').toUpperCase());
    const skillLevels = skills.map(skill => skillAmounts[skill]);

    const skillsOptions = {
        series: [{
            name: 'Skill Level',
            data: skillLevels
        }],
        chart: {
            height: 500, // Increased height for skills chart
            width: 600,
            type: 'bar',
            zoom: { enabled: false },
            background: 'transparent' // Remove white background
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '100%',
                distributed: true,
                borderRadiusTopRIght: 10
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: skillNames,
            labels: { style: { colors: 'white', letterSpacing: '2px' } } 
        },
        yaxis: { labels: { style: { colors: 'white', letterSpacing: '2px' } } },
        title: {
            text: 'Skills Levels',
            align: 'left',
            style: { color: 'white', letterSpacing: '2px' } 
        },
        fill: { opacity: 1 },
        legend: { show: false } 
    };

    const skillsGraphContainer = document.getElementById("skillsGraphContainer");
    if (!skillsGraphContainer) {
        console.error("Skills graph container not found!");
        return;
    }
    skillsGraphContainer.innerHTML = "";
    const skillsChartDiv = document.createElement("div");
    skillsChartDiv.id = "skillsChart";
    skillsGraphContainer.appendChild(skillsChartDiv);
    const skillsChart = new ApexCharts(skillsChartDiv, skillsOptions);
    skillsChart.render();
};

