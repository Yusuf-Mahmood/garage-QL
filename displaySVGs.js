export const displayUserInfo = (userData) => {
  if (!userData.data || !userData.data.user) {
    console.error("Invalid user data structure", userData);
    return;
  }

  const user = userData.data.user[0];
  const moduleLevel =
    user.TransactionsFiltered2.length > 0
      ? user.TransactionsFiltered2[0].amount
      : "N/A";
  const totalXP = user.totalXP.reduce((acc, tx) => acc + tx.amount, 0);

  function formatBytes(val) {
    if (typeof val !== "number" || isNaN(val)) return val;
    if (val >= 1000 * 1000 * 1000)
      return (val / (1000 * 1000 * 1000)).toFixed(2) + " GB";
    if (val >= 1000 * 1000)
      return (val / (1000 * 1000)).toFixed(2) + " MB";
    if (val >= 1000)
      return (val / 1000).toFixed(2) + " KB";
    return val + " B";
  }
  const formattedTotalXP = formatBytes(totalXP);

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
          <p><strong>Total XP:</strong> ${formattedTotalXP}</p>
          </p>
              <p><strong>Module Level:</strong> ${moduleLevel}</p>
          </div>
      `;
};

export const displaySVGCharts = (userData) => {
  if (!userData.data || !userData.data.user) {
    console.error("Invalid user data structure", userData);
    return;
  }

  document.getElementById("graphContainer").style.display = "flex";
  document.getElementById("skillsGraphContainer").style.display = "flex";
  document.getElementById("userInfo").style.display = "block";
  document.getElementById("exitBtn").style.display = "flex";
  document.getElementById("filter").style.display = "none";

  const user = userData.data.user[0];
  const totalUp = user.totalUp || 0;
  const totalDown = user.totalDown || 0;

  const auditRatioData = [
    { x: "Done", y: totalUp },
    { x: "Received", y: totalDown },
  ];
  const options = {
    series: [
      {
        name: "Audit Ratio",
        data: auditRatioData,
      },
    ],
    chart: {
      height: 200,
      width: 600,
      type: "bar",
      zoom: { enabled: false },
      toolbar: { show: false },
      events: {
        mouseMove: () => false,
        dataPointMouseEnter: () => false,
        dataPointMouseLeave: () => false,
      },
    },
    tooltip: { enabled: false },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        const mbValue = val / (1000 * 1000);
        return mbValue >= 1
          ? parseFloat(mbValue.toPrecision(3)).toString() + " MB"
          : parseFloat(mbValue.toPrecision(3)).toString() + " KB";
      },
      style: { colors: ["white"] },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        colors: {
          ranges: [{ from: 0, to: 100, color: "#007bff" }],
          backgroundBarColors: ["rgba(255, 255, 255, 0.2)"],
        },
      },
    },
    stroke: { width: [3], curve: "smooth" },
    title: {
      text: `Audit Ratio - ${Number(user.auditRatio.toFixed(1))}`,
      align: "left",
      style: { color: "white" },
    },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.3)",
      row: { colors: ["rgba(0, 0, 0, 0.3)"], opacity: 0.3 },
    },
    xaxis: {
      categories: auditRatioData.map((data) => data.x),
      labels: {
        style: { colors: "white", letterSpacing: "2px" },
        formatter: function (val) {
          const mbValue = val / (1000 * 1000);
          return mbValue >= 1
            ? mbValue.toFixed(1) + " MB"
            : mbValue.toFixed(1) + " KB";
        },
      },
    },
    yaxis: { labels: { style: { colors: "white", letterSpacing: "2px" } } },
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
    "skill_git",
    "skill_algo",
    "skill_rust",
    "skill_unix",
    "skill_shell",
    "skill_php",
    "skill_go",
    "skill_c",
    "skill_sql",
    "skill_html",
    "skill_docker",
    "skill_python",
    "skill_ruby",
    "skill_graphql",
    "skill_c-pp",
    "skill_js",
    "skill_ruby-on-rails",
    "skill_laravel",
    "skill_django",
    "skill_electron",
  ];

  const skillTxMap = {};

  user.SkillsFiltered.forEach((tx) => {
    if (!skills.includes(tx.type)) return;

    if (
      !skillTxMap[tx.type] ||
      new Date(tx.createdAt) > new Date(skillTxMap[tx.type].createdAt)
    ) {
      skillTxMap[tx.type] = tx;
    }
  });

  const skillData = skills
    .map((skill) => {
      const tx = skillTxMap[skill];
      return {
        name: skill.replace("skill_", "").toUpperCase(),
        amount: tx ? tx.amount : 0,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const skillNames = skillData.map((item) => item.name);
  const skillLevels = skillData.map((item) => item.amount);

  const skillsOptions = {
    series: [
      {
        name: "Skill Level",
        data: skillLevels,
      },
    ],
    chart: {
      height: 500,
      width: 600,
      type: "bar",
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "85%",
        distributed: false,
        borderRadius: 5,
        borderRadiusApplication: "end",
        barGap: 5,
        colors: {
          ranges: skillLevels.map(() => ({
            color: "#007bff",
          })),
          backgroundBarColors: [],
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val}%`;
      },
      style: { colors: ["white"] },
    },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.3)",
      padding: {
        top: 10,
        bottom: 10,
      },
      row: {
        colors: ["transparent"],
        opacity: 0,
      },
    },
    xaxis: {
      categories: skillNames,
      labels: {
        style: { colors: "white", letterSpacing: "2px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "white", letterSpacing: "2px" },
      },
    },
    title: {
      text: "Technologies Skills Levels",
      align: "left",
      style: { color: "white", letterSpacing: "2px" },
    },
    tooltip: { enabled: false },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    fill: { opacity: 1 },
    legend: { show: false },
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
