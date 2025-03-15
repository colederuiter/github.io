"use strict";

import {LoadHeader} from "./header.js";
import {Router} from "./router.js";
import {LoadFooter} from "./footer.js";
import {AuthGuard} from "./authguard.js";

const pageTitles = {
    "/": "Home",
    "/home": "Home",
    "/about": "About us",
    "/contact-list": "Contact List",
    "/contacts": "Contacts",
    "/edit": "Edit Contact",
    "/login": "Login",
    "/products": "Products",
    "/register": "Register",
    "/services": "Services",
    "/404": "404"
};

const routes = {
    "/": "views/pages/home.html",
    "/home": "views/pages/home.html",
    "/about": "views/pages/about.html",
    "/contact-list": "views/pages/contact-list.html",
    "/contacts": "views/pages/contacts.html",
    "/edit": "views/pages/edit.html",
    "/login": "views/pages/login.html",
    "/products": "views/pages/products.html",
    "/register": "views/pages/register.html",
    "/services": "views/pages/services.html",
    "/404": "views/pages/404.html"
};

const router = new Router(routes);

(function () {

    function DisplayLoginPage(){
        console.log("[INFO] DisplayLoginPage called...");

        if (sessionStorage.getItem("user")) {
            router.navigate("/contact-list");
            return;
        }

        const messageArea = document.getElementById("messageArea");
        const loginButton = document.getElementById("loginButton");
        const cancelButton = document.getElementById("cancelButton");

        // hide message area initially
        messageArea.style.display = "none";

        if(!loginButton){
            console.error("[ERROR] loginButton not found in DOM");
            return;
        }

        loginButton.addEventListener("click", async (event) => {

            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            try{

                const response = await fetch("data/users.json");
                if(!response.ok){
                    throw new Error(`[ERROR] HTTP error!. Status: ${response.status}`);
                }

                const jsonData = await response.json();
                //console.log("[DEBUG] Fetched JSON data", jsonData);

                const users = jsonData.users;

                if(!Array.isArray(users)){
                    throw new Error("[ERROR] JSON data does not contain a valid array.");
                }

                let success = false;
                let authenticatedUser = null;

                for (const user of users){
                    if(user.Username === username && user.Password === password){
                        success = true;
                        authenticatedUser = user;
                        break;
                    }
                }

                if(success){
                    sessionStorage.setItem("user", JSON.stringify({
                        DisplayName : authenticatedUser.DisplayName,
                        EmailAddress : authenticatedUser.EmailAddress,
                        Username : authenticatedUser.Username
                    }));

                    messageArea.style.display = "none";
                    messageArea.classList.remove("alert", "alert-danger")

                    LoadHeader().then(() => {
                        router.navigate("/contact-list");
                    })
                } else {
                    messageArea.style.display = "block";
                    messageArea.classList.add("alert", "alert-danger")
                    messageArea.textContent = "Invalid username or password. Please try again";

                    document.getElementById("username").focus();
                    document.getElementById("username").select();
                }

            }catch(error){
                console.error("[ERROR] Login failed", error);
            }
        });

        cancelButton.addEventListener("click", (event) => {
            document.getElementById("loginForm").reset();
            router.navigate("/");
        });
    }

    function DisplayRegisterPage(){
        console.log("[INFO] DisplayRegisterPage called...");
    }

    /**
     * Redirects user back to the contact-list page
     */
    function handleCancelClick() {
        router.navigate("/contact-list");
    }

    /**
     * Handles the process o editing an existing contact
     * @param event
     * @param contact - contact to update
     * @param page - unique contact identifier
     */
    function handleEditClick(event, contact, page) {
        // prevent default form submission behaviour
        event.preventDefault();

        if(!validateForm()) {
            alert("invalid data! Please check your input");
            return;
        }

        const fullName = document.getElementById("fullName").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const emailAddress = document.getElementById("emailAddress").value;

        // update the contact object with the new values
        contact.fullName = fullName;
        contact.contactNumber = contactNumber;
        contact.emailAddress = emailAddress;

        // save the updated contact (in localStorage) with the updated csv
        localStorage.setItem(page, contact.serialize());

        //redirect upon success
        router.navigate("/contact-list");
    }

    /**
     * Handles the process of adding a new contact
     * @param event - the event object to prevent defailt form submission
     */
    function handleAddClick(event){
        // prevent default form submission behaviour
        event.preventDefault();

        if(!validateForm()) {
            alert("Form contains errors. Please correct them before submitting");
            return;
        }

        const fullName = document.getElementById("fullName").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const emailAddress = document.getElementById("emailAddress").value;

        //create the contact in localStorage
        AddContact(fullName, contactNumber, emailAddress);

        // redirection
        router.navigate("/contact-list");
    }

    /**
     * Validate the entire form by checking the validity of each input
     * @returns {boolean}
     */
    function validateForm() {
        return(
            validateInput("fullName") &&
            validateInput("contactNumber") &&
            validateInput("emailAddress")
        );
    }

    /**
     * Attaches validation event listeners to form input fields dynamically
     * @param elementId
     * @param event
     * @param handler
     */
    function addEventListenerOnce(elementId, event, handler) {

        // retrieve element from DOM
        const element = document.getElementById(elementId);

        if(element){
            // Remove any existing event listeners of the same type
            element.removeEventListener(event, handler);

            // attach the new (latest) event for that element
            element.addEventListener(event, handler);
        } else {
            console.warn(`[WARN] Element with ID '${elementId}' not found`);
        }
    }

    function attachValidationListeners() {
        console.log("[INFO] Attaching validation listeners...");

        Object.keys(VALIDATION_RULES).forEach((fieldId)=> {
            const field = document.getElementById(fieldId);

            if (!field) {
                console.warn(`[WARN] field ${fieldId} not found. Skipping listener`);
                return;
            }

            // Attach event listener using a centralized validation method
            addEventListenerOnce(fieldId, "input", () => validateInput(fieldId));

        });

    }


    /**
     * Validates an input based on a predefinded validation rule
     * @param fieldId
     * @returns {boolean} - returns true if valid, false otherwise
     */
    function validateInput(fieldId) {
        const field= document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        const rule = VALIDATION_RULES[fieldId];

        if(!field || !errorElement || !rule) {
            console.warn(`[WARN] Validation rules are not found for: ${fieldId}`);
            return false;
        }

        // Check if the input is empty
        if(field.value.trim() === "") {
            errorElement.textContent = "This field is required";
            errorElement.style.display = "block";
            return false;
        }

        // check field against regular expression
        if(!rule.regex.test(field.value)) {
            errorElement.textContent = rule.errorMessage;
            errorElement.style.display = "block";
            return false;
        }

        errorElement.textContent = "";
        errorElement.style.display = "none";
        return true;
    }

    /**
     *
     * @type {{fullName: {regex: RegExp, errorMessage: string}, contactNumber: {regex: RegExp, errorMessage: string}, emailAddress: {regex: RegExp, errorMessage: string}}}
     */
    const VALIDATION_RULES = {
        fullName: {
            regex: /^[A-Za-z\s]+$/,  // Allows for only letters, and spaces
            errorMessage: "Full Name must contain only letter and spaces"
        },
        contactNumber: {
            regex: /^\d{3}-\d{3}-\d{4}$/,
            errorMessage: "Contact number must be in format ###-###-####"
        },
        emailAddress: {
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: "Invalid email address"
        }
    }

    function AddContact(fullName, contactNumber, emailAddress)
    {
        console.log("[DEBUG] AddContact() triggered...")

        if(!validateForm()) {
            alert("Form contains errors. Please check them before submitting");
            return;
        }

        let contact = new core.Contact(fullName, contactNumber, emailAddress);
            if(contact.serialize()){
                console.log(contact.serialize());
                let key = `contact_${Date.now()}`;
                localStorage.setItem(key, contact.serialize());
                console.log(`[INFO] Contact added: ${key}`);
            } else {
                console.error("[ERROR] Contact serialization failed")
            }

            //redirection
            router.navigate("/contact-list");
    }


    function DisplayEditPage() {
        console.log("Called DisplayEditPage() ...");

        const page = location.hash.split("#")[2];
        const editButton = document.getElementById("editButton");

        addEventListenerOnce("cancelButton", "click", handleCancelClick);

        switch (page)
        {
            case "add":
            {
                document.title = "Add Contact";
                document.querySelector("main>h1").textContent = "Add Contact";

                if (editButton) {
                    editButton.innerHTML = `<i class=\"fa-solid fa-user-plus\"></i> Add Contact`;
                    editButton.classList.remove("btn-primary");
                    editButton.classList.add("btn-success");
                }

                addEventListenerOnce("editButton", "click", handleAddClick)

                break;
            }
            default:
            {
                // edit an existing contact
                const contact = new core.Contact();
                const contactData = localStorage.getItem(page);

                if(contactData) {
                    contact.deserialize(contactData);
                }

                //Prepopulate the form with current values
                document.getElementById("fullName").value = contact.fullName;
                document.getElementById("contactNumber").value = contact.contactNumber;
                document.getElementById("emailAddress").value = contact.emailAddress;

                if(editButton) {
                    editButton.innerHTML = `<i class=\"fa-solid fa-user-plus\"></i> Edit Contact`;
                    editButton.classList.remove("btn-success");
                    editButton.classList.add("btn-primary");
                }

                // attach event listeners
                addEventListenerOnce("editButton", "click",
                    (event) => handleEditClick(event, contact, page));

                break;
            }
        }

    }

    async function DisplayWeather() {

        const apikey = "0dd9a3f626c4d90f698315d85ebac9b5";
        const city = "Oshawa";
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch weather data")
            }

            const data = await response.json();
            console.log(data);

            const weatherDataElement = document.getElementById('weather-data');

            weatherDataElement.innerHTML = `<strong>City: </strong> ${data.name}<br>
                                            <strong>Temp: </strong> ${data.main.temp} <br>
                                            <strong>Weather: </strong> ${data.weather[0].description} <br>`;

        } catch (error) {
            console.error("Error calling openweathermap for Weather");
            document.getElementById("weather-data").textContent = "Unable to get weather data at this time";
        }
    }

    function DisplayHomePage(){
        console.log("Calling DisplayHomePage...");

        let aboutUsButton = document.getElementById("AboutUsBtn");
        aboutUsButton.addEventListener("click", () => {
            router.navigate("/about");
        })

        DisplayWeather();

    }

    function DisplayProductsPage(){
        console.log("Calling DisplayProductsPage...");
    }

    function DisplayServicesPage(){
        console.log("Calling DisplayServicesPage...");
    }

    function DisplayAboutPage(){
        console.log("Calling DisplayAboutPage...");
    }

    function DisplayContactsPage(){
        console.log("Calling DisplayContactsPage...");

        let sendButton = document.getElementById("sendButton");
        let subscribeCheckbox = document.getElementById("subscribeCheckBox");

        sendButton.addEventListener("click", function(){
            if(subscribeCheckbox.checked){
                    AddContact(
                        document.getElementById("fullName").value,
                        document.getElementById("contactNumber").value,
                        document.getElementById("emailAddress").value
                    );
            }
            alert("Form successfully submitted!");
        });

        const contactListButton = document.getElementById("showContactList");
        if(contactListButton){
            contactListButton.addEventListener("click", function(event){
                event.preventDefault();
                router.navigate("/contact-list");
            });
        }
    }

    function DisplayContactListPage(){
        console.log("Calling DisplayContactListPage...");

        if(localStorage.length > 0){

            let contactList = document.getElementById("contactList");
            let data = "";
            let index = 1;

            let keys = Object.keys(localStorage);

            for(const key of keys) {
                if (key.startsWith("contact_")) {
                    let contactData = localStorage.getItem(key);
                    try {
                        let contact = new core.Contact();

                        contact.deserialize(contactData);
                        data += `<tr>
                                <th scope="row" class="text-center">${index}</th>
                                <td>${contact.fullName}</td>
                                <td>${contact.contactNumber}</td>
                                <td>${contact.emailAddress}</td>
                                <td class="text-center">
                                    <button value="${key}" class="btn btn-warning btn-sm edit">
                                        <i class="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                </td> 
                                <td class="text-center">
                                    <button value="${key}" class="btn btn-danger btn-sm delete">
                                        <i class="fa-solid fa-trash"></i> Delete
                                    </button>
                                </td>
                             </tr>`
                        index++;

                    } catch (error) {
                        console.error("Error deserializing data");
                    }
                } else {
                    console.warn(`Skipping non-contact key ${key}`);
                }
            }
                contactList.innerHTML = data;
            }

            const addButton = document.getElementById("addButton");
            addButton.addEventListener("click", () => {
                router.navigate("/edit#add");
            });

            const deleteButtons = document.querySelectorAll("button.delete");
            deleteButtons.forEach(button => {

                button.addEventListener("click", function() {

                    const contactKey = this.value;
                    console.log(`[DEBUG] Deleting contact: ${contactKey}`);

                    if(!contactKey.startsWith("contact_")){
                        console.error("[ERROR] Invalid contact key format");
                        return;
                    }

                    if(confirm("Delete contact, please confirm")){
                        localStorage.removeItem(this.value);
                        DisplayContactListPage();
                    }
                });

            });

            const editButtons = document.querySelectorAll("button.edit");
            editButtons.forEach((button) => {
               button.addEventListener("click", function() {
                   router.navigate(`/edit#${this.value}`);
               });
            });
    }

    // Listen for route changes update nav links and call the respective Display function
    document.addEventListener("routeLoaded", (event) => {
        const newPath = event.detail;
        console.log(`[INFO] New Route Loaded: ${newPath}`);

        LoadHeader().then( () => {
            handlePageLogic(newPath);
        });
    });

    window.addEventListener("sessionExpired", (event) => {
        console.warn("[SESSION] Redirecting the user due to inactivity.");
        router.navigate("/login");
    });

    function handlePageLogic(path) {

        document.title = pageTitles[path] || "Untitled Page";

        const protectedRoutes = ['/contact-list', '/edit'];
        if(protectedRoutes.includes(path)) {
            AuthGuard();
        }

        switch (path) {
            case "/home":
                DisplayHomePage();
                break;
            case "/":
                DisplayHomePage();
                break;
            case "/products":
                DisplayProductsPage();
                break;
            case "/services":
                DisplayServicesPage();
                break;
            case "/about":
                DisplayAboutPage();
                break;
            case "/contacts":
                attachValidationListeners();
                DisplayContactsPage();
                break;
            case "/contact-list":
                DisplayContactListPage();
                break;
            case "/edit":
                attachValidationListeners();
                DisplayEditPage();
                break;
            case "/login":
                DisplayLoginPage();
                break;
            case "/register":
                DisplayRegisterPage();
                break;
            default:
                console.error(`No matching case for route ${path}`);
        }
    }
    // This function prints "App Started!" when called
    async function Start() {
        console.log("App Starting...");

        // Load Header first, then run CheckLogin after its injected
        await LoadHeader();
        await LoadFooter();
        AuthGuard();

        const currentPath = location.hash.slice(1) || "/";
        router.loadRoute(currentPath);

        handlePageLogic(currentPath);
    }

    window.addEventListener("DOMContentLoaded", () => {
        console.log("DOM Fully loaded and parsed");
        Start();
    });
})()