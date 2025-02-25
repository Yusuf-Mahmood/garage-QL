export const displayUserInfo = (userData) => {
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
        <h2>Profile - ${user.firstName} ${user.lastName}</h2>
        <div class="firstSec">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Username:</strong> ${user.login}</p>
        </div>
        <div class="lines">----------------------------------------------------------------</div>
        <div class="secondSec">
        <p><strong>Audit Ratio:</strong> ${Number(user.auditRatio.toFixed(1))}</p>
            <p><strong>Module Level:</strong> ${moduleLevel}</p>
        </div>
    `;
}

export const displaySVGCharts = (userData) => {
    if (!userData.data || !userData.data.user) {
        console.error("Invalid user data structure", userData);
        return;
    }

    document.getElementById('graphContainer').style.display = 'flex';
    document.getElementById('skillsGraphContainer').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'block';

    const user = userData.data.user[0]; 
    const totalUp = (user.totalUp) || 0;
    const totalDown = (user.totalDown) || 0; 
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
            height: 200, 
            width: 600,
            type: 'bar',
            zoom: { enabled: false },
        },
        dataLabels: { 
            enabled: true,
            formatter: function (val) {
                const mbValue = val / (1000 * 1000); 
                return mbValue >= 1 ? parseFloat(mbValue.toPrecision(3)).toString() + ' MB' : parseFloat(mbValue.toPrecision(3)).toString() + ' KB'; 
            },
            style: { colors: ['white'] } 
        },
        plotOptions: { 
            bar: { 
                horizontal: true, 
                borderRadius: 5,
                borderRadiusApplication: 'end',
                colors: {
                    ranges: [{ from: 0, to: 100, color: '#007bff' }], // Blue bars
                    backgroundBarColors: ['rgba(255, 255, 255, 0.2)'] // Slightly visible background bars
                }
            } 
        },
        stroke: { width: [3], curve: 'smooth' },
        title: {
            text: 'Audit Ratio',
            align: 'left',
            style: { color: 'white', letterSpacing: '2px' } 
        },
        grid: { 
            borderColor: 'rgba(255, 255, 255, 0.3)', 
            row: { colors: ['rgba(0, 0, 0, 0.3)'], opacity: 0.3 } 
        },
        xaxis: {
            categories: auditRatioData.map(data => data.x),
            labels: { 
                style: { colors: 'white', letterSpacing: '2px' },
                formatter: function (val) {
                    const mbValue = val / (1000 * 1000);
                    return mbValue >= 1 ? mbValue.toFixed(1) + " MB" :  mbValue.toFixed(1) + " KB"; 
                }
            } 
        },
        yaxis: { labels: { style: { colors: 'white', letterSpacing: '2px' } } } 
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
            height: 500, 
            width: 600,
            type: 'bar',
            zoom: { enabled: false },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '100%',
                distributed: false,
                borderRadius: 5,
                borderRadiusApplication: 'end',
                colors: {
                    ranges: skillLevels.map((_, index) => ({
                        color: '#007bff' // Blue bars
                    })),
                    backgroundBarColors: skillLevels.map((_, index) => 
                        `rgba(${index * 25}, ${index * 25}, ${index * 25}, 0.3)`
                    )
                }
            }
        },
        dataLabels: { enabled: false },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.3)', 
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
}