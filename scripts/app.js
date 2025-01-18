"use strict";

//IIFE - Immediately Invoke Functional Expression
(function () {

    function DisplayHomePage(){
        console.log("Calling DisplayHomePage...");

        let aboutUsButton = document.getElementById("AboutUsBtn");
        aboutUsButton.addEventListener("click", function(){
            location.href="about.html";
        })

        // Get the html main tag
        let MainContent = document.getElementsByTagName("main")[0];
        let MainParagraph = document.createElement("p");

        MainParagraph.setAttribute("id", "MainParagraph");
        MainParagraph.setAttribute("class", "mt-3");
        MainParagraph.textContent = "This is my first main paragraph";

        MainContent.appendChild(MainParagraph);

        let FirstString = "This is";
        // string literal
        // ${} gets replaced by the string variable inside of it
        let SecondString = `${FirstString} my second string`;
        MainParagraph.textContent = SecondString;

        MainContent.appendChild(MainParagraph);

        let DocumentBody = document.getElementsByTagName("body")[0];

        let Article = document.createElement("article");
        let ArticleParagraph = `<p id="ArticleParagraph" class="mt-3">This is my first article paragraph</p>`;
        Article.setAttribute("class", "container");
        Article.innerHTML = ArticleParagraph;
        DocumentBody.appendChild(Article);
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
    }

    function Start() {
        console.log("Starting App...");

        switch (document.title) {
            case "Home":
                DisplayHomePage();
                break;
            case "Products":
                DisplayProductsPage();
                break;
            case "Services":
                DisplayServicesPage();
                break;
            case "About":
                DisplayAboutPage();
                break;
            case "Contacts":
                DisplayContactsPage();
                break;
        }
    }

    window.addEventListener("load", Start);
})()