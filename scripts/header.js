"use strict";

/**
 * Loads the navbar into the current page
 * @returns {Promise<void>}
 */
export function LoadHeader() {
    console.log("[INFO] LoadHeader called...");

    return fetch("./views/components/header.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector("header").innerHTML = data;
            updateActiveNavLink();
            CheckLogin();
        })
        .catch(error => {
            console.error("[ERROR] Unable to load header");
        })
}

export function updateActiveNavLink() {
    console.log("[INFO] updateActiveNavLink called...");

    // Get the current path
    const currentPath = location.hash.slice(1) || "/";
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').replace("#", "");
        if (currentPath === linkPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function handleLogout(event){
    event.preventDefault();
    sessionStorage.removeItem("user");
    console.log("[INFO] user logged out");

    LoadHeader().then(() => {
        location.hash = "/";
    });
}

function CheckLogin(){
    console.log("[INFO] Checking user login status")

    const loginNav = document.getElementById("login");

    if(!loginNav){
        console.warn("[WARN] loginNav element no found. Skipping CheckLogin().")
        return;
    }

    const userSession = sessionStorage.getItem("user")
    if(userSession){
        loginNav.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`
        loginNav.href = "#";
        loginNav.removeEventListener("click", handleLogout);
        loginNav.addEventListener("click", handleLogout);
    } else {
        loginNav.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`
        loginNav.removeEventListener("click", handleLogout);
        loginNav.addEventListener("click", () => location.hash = "/login");
    }
}
