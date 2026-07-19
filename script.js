"use strict";

const IMAGE_FOLDER = "images";
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

// DOM ELEMENTS
const welcomeScreen = document.getElementById("welcomeScreen");
const revealScreen = document.getElementById("revealScreen");
const thankYouScreen = document.getElementById("thankYouScreen");
const sarcasticConfirmScreen = document.getElementById("sarcasticConfirmScreen");

const lookupForm = document.getElementById("lookupForm");
const emailInput = document.getElementById("emailInput");
const lookupButton = document.getElementById("lookupButton");
const errorMessage = document.getElementById("errorMessage");

const caricatureImage = document.getElementById("caricatureImage");
const imageLoadingState = document.getElementById("imageLoadingState");
const imageEmailLabel = document.getElementById("imageEmailLabel");
const downloadButton = document.getElementById("downloadButton");
const downloadFeedback = document.getElementById("downloadFeedback");
const toast = document.getElementById("toast");

const closeSiteButton = document.getElementById("closeSiteButton");
const sarcasticViewOthersButton = document.getElementById("sarcasticViewOthersButton");
const sarcasticCloseButton = document.getElementById("sarcasticCloseButton");
const sarcasticGoHomeButton = document.getElementById("sarcasticGoHomeButton");

// STATE MANAGEMENT
let currentImageUrl = null;
let currentUserKey = null;
let toastTimeout = null;
let lookupRequestId = 0;
let gratitudeTimerId = null;

document.addEventListener("DOMContentLoaded", initializeApplication);

function initializeApplication() {
    if (lookupForm) lookupForm.addEventListener("submit", handleLookupSubmit);
    if (downloadButton) downloadButton.addEventListener("click", downloadCurrentImage);
    if (emailInput) emailInput.addEventListener("input", hideError);

    if (closeSiteButton) closeSiteButton.addEventListener("click", terminateExperience);
    if (sarcasticCloseButton) sarcasticCloseButton.addEventListener("click", terminateExperience);

    if (sarcasticViewOthersButton) {
        sarcasticViewOthersButton.addEventListener("click", () => {
            clearTimeout(gratitudeTimerId);
            showScreen(sarcasticConfirmScreen);
        });
    }

    if (sarcasticGoHomeButton) {
        sarcasticGoHomeButton.addEventListener("click", () => {
            showScreen(welcomeScreen);
            resetLookup();
        });
    }
}

async function handleLookupSubmit(event) {
    event.preventDefault();
    if (!emailInput) return;

    const rawInput = emailInput.value.trim();
    if (!rawInput) {
        showError("Please enter your email address.");
        emailInput.focus();
        return;
    }

    const normalizedInput = rawInput.toLowerCase();
    const userKey = extractUserKey(normalizedInput);

    if (!userKey) {
        showError("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    const requestId = ++lookupRequestId;
    setLoadingState(true);
    hideError();

    try {
        const imageUrl = await findMatchingImage(userKey);
        if (requestId !== lookupRequestId) return;

        if (!imageUrl) {
            showError("We couldn't find a caricature associated with that email.");
            return;
        }

        currentUserKey = userKey;
        currentImageUrl = imageUrl;
        await revealImage(imageUrl, rawInput, requestId);
    } catch (error) {
        console.error("Image lookup failed:", error);
        if (requestId === lookupRequestId) {
            showError("Something went wrong while finding your image. Please try again.");
        }
    } finally {
        setLoadingState(false);
    }
}

function extractUserKey(email) {
    const atIndex = email.indexOf("@");
    return atIndex === -1 ? "" : email.substring(0, atIndex).trim().toLowerCase();
}

async function findMatchingImage(userKey) {
    for (const extension of IMAGE_EXTENSIONS) {
        const imageUrl = `${IMAGE_FOLDER}/${userKey}${extension}`;
        const exists = await checkImageExists(imageUrl);
        if (exists) return imageUrl;
    }
    return null;
}

function checkImageExists(imageUrl) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = imageUrl;
    });
}

function revealImage(imageUrl, email, requestId) {
    return new Promise((resolve, reject) => {
        if (!caricatureImage) return reject(new Error("caricatureImage element not found."));
        if (requestId !== lookupRequestId) return resolve();

        showScreen(revealScreen);
        showImageLoading();
        caricatureImage.classList.remove("is-visible");

        caricatureImage.onload = () => {
            if (requestId !== lookupRequestId) return;
            hideImageLoading();
            caricatureImage.classList.add("is-visible");
            if (imageEmailLabel) imageEmailLabel.textContent = email.toLowerCase();
            resolve();
        };

        caricatureImage.onerror = () => {
            if (requestId !== lookupRequestId) return;
            hideImageLoading();
            showScreen(welcomeScreen);
            showError("Image data failed to transform properly.");
            reject(new Error("Image failed to load."));
        };

        caricatureImage.src = imageUrl;
    });
}

async function downloadCurrentImage() {
    if (!currentImageUrl) {
        showToast("No image is currently available.");
        return;
    }

    try {
        downloadButton.disabled = true;
        const response = await fetch(currentImageUrl);
        if (!response.ok) throw new Error("Image download failed.");

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${currentUserKey || "my-matchday-moment"}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);

        executePostDownloadTransition();
    } catch (error) {
        const link = document.createElement("a");
        link.href = currentImageUrl;
        link.download = currentUserKey || "my-matchday-moment";
        link.target = "_blank";
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();

        executePostDownloadTransition();
    } finally {
        downloadButton.disabled = false;
    }
}

function executePostDownloadTransition() {
    if (downloadFeedback) {
        downloadFeedback.hidden = false;
        downloadFeedback.textContent = "IMAGE DOWNLOADED";
    }
    showToast("Your image has been downloaded.");

    setTimeout(() => {
        showScreen(thankYouScreen);
        gratitudeTimerId = setTimeout(() => {
            showScreen(revealScreen);
        }, 5000);
    }, 900);
}

function terminateExperience() {
    window.close();
    showToast("Press Ctrl+W (or Cmd+W) to close this tab.");
}

function showScreen(targetScreen) {
    const screens = [welcomeScreen, revealScreen, thankYouScreen, sarcasticConfirmScreen];
    screens.forEach((screen) => {
        if (!screen) return;
        screen.hidden = screen !== targetScreen;
    });
}

function setLoadingState(isLoading) {
    if (!lookupButton) return;
    const text = lookupButton.querySelector("span");
    
    lookupButton.disabled = isLoading;
    if (emailInput) emailInput.disabled = isLoading;

    if (isLoading) {
        lookupButton.classList.add("is-loading");
        if (text) text.textContent = "FINDING YOUR MOMENT...";
    } else {
        lookupButton.classList.remove("is-loading");
        if (text) text.textContent = "REVEAL MY MOMENT";
    }
}

function showImageLoading() { if (imageLoadingState) imageLoadingState.classList.remove("is-hidden"); }
function hideImageLoading() { if (imageLoadingState) imageLoadingState.classList.add("is-hidden"); }
function showError(msg) { if (errorMessage) { errorMessage.querySelector("p").textContent = msg; errorMessage.hidden = false; } }
function hideError() { if (errorMessage) errorMessage.hidden = true; }

function resetLookup() {
    hideError();
    if (emailInput) { emailInput.disabled = false; emailInput.value = ""; emailInput.focus(); }
    if (caricatureImage) { caricatureImage.onload = null; caricatureImage.onerror = null; caricatureImage.src = ""; caricatureImage.classList.remove("is-visible"); }
    if (imageEmailLabel) imageEmailLabel.textContent = "";
    if (downloadFeedback) downloadFeedback.hidden = true;
    hideImageLoading();
    currentImageUrl = null;
    currentUserKey = null;
}

function showToast(message) {
    if (!toast) return;
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.hidden = false;
    toastTimeout = setTimeout(() => { toast.hidden = true; }, 3500);
}
