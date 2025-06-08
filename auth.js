import { isDoorOpen, jumpscare, moveToBoard } from "./3Dbackground.js";
import { fetchProfileData } from "./fetchData.js";

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isDoorOpen) {
        return;
    }

    const usernamemail = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!usernamemail || !password) {
        console.warn("Username or password is empty!");
        return;
    }
    let onceJumpScare = sessionStorage.getItem("jumpScareTriggered") === "true";

    if (!onceJumpScare) {
        if (usernamemail === "aaljamal") {
            onceJumpScare = true;
            sessionStorage.setItem("jumpScareTriggered", "true");
            humanoid.style.display = "flex";
            document.getElementById("errorMessage").innerText =
                "I am sorry Ahmed lol";
            jumpscare();
            return;
        }
    }

    const isEmail = usernamemail.includes("@");
    const encodedCredentials = btoa(
        `${usernamemail.trim()}:${password.trim()}`
    );
    const bodyData = isEmail
        ? { email: usernamemail, password }
        : { username: usernamemail, password };

    try {
        const response = await fetch(
            "https://learn.reboot01.com/api/auth/signin",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${encodedCredentials}`,
                },
                body: JSON.stringify(bodyData),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data) {
            localStorage.setItem("jwtToken", data);
            await moveToBoard();
            fetchProfileData();
        } else {
            document.getElementById("errorMessage").innerText = "Invalid Token";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("errorMessage").innerText = "Invalid Credentials";
        // jumpscare();
        return;
    }
});
