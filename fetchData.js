import {  updateStartingPositions } from "./3Dbackground.js";
import { displaySVGCharts, displayUserInfo } from "./displaySVGs.js";
import { graphqlQuery } from "./query.js";

export const fetchProfileData = async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    console.error("No JWT token found! Please log in.");
    return;
  }

  try {
    const response = await fetch(
      "https://learn.reboot01.com/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(graphqlQuery),
      }
    );

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
