/* =========================================================
   FIFA CELEBRATION CARICATURE EXPERIENCE
   Static frontend implementation
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {
    imageDirectory: "images",

    imageExtension: ".png",

    downloadFilename: "my-caricature.png",

    imageLoadTimeout: 10000,

    sessionStorageKey: "fifaCelebrationReturnVisit"
};


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {
    currentScreen: "welcome",

    currentEmail: "",

    currentImagePath: "",

    isLoading: false,

    isReturningFromIntervention: false,

    hasVisitedIntervention: false
};


/* =========================================================
   DOM REFERENCES
========================================================= */

const elements = {

    screens: {
        welcome: document.getElementById("welcomeScreen"),
        reveal: document.getElementById("revealScreen"),
        intervention: document.getElementById("interventionScreen"),
        thankYou: document.getElementById("thankYouScreen")
    },

    welcome: {
        eyebrow: document.getElementById("welcomeEyebrow"),
        message: document.getElementById("welcomeMessage"),
        form: document.getElementById("lookupForm"),
        emailInput: document.getElementById("emailInput"),
        claimButton: document.getElementById("claimButton"),
        errorMessage: document.getElementById("errorMessage"),
        errorTitle: document.getElementById("errorTitle"),
        errorText: document.getElementById("errorText")
    },

    reveal: {
        image: document.getElementById("caricatureImage"),
        imageLoadingState: document.querySelector(".image-loading-state"),
        imageEmailLabel: document.getElementById("imageEmailLabel"),
        downloadButton: document.getElementById("downloadButton"),
        closeButton: document.getElementById("closeRevealButton"),
        downloadMoreButton: document.getElementById("downloadMoreButton"),
        downloadFeedback: document.getElementById("downloadFeedback")
    },

    intervention: {
        reallyCloseButton: document.getElementById("reallyCloseButton"),
        proceedButton: document.getElementById("proceedButton")
    },

    thankYou: {
        returnHomeButton: document.getElementById("returnHomeButton")
    },

    brandHome: document.getElementById("brandHome"),

    toast: document.getElementById("toast")
};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", initializeApplication);


function initializeApplication() {

    loadReturnVisitState();

    bindEventListeners();

    updateWelcomeState();

    showScreen("welcome");
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function bindEventListeners() {

    elements.welcome.form.addEventListener(
        "submit",
        handleLookupSubmit
    );

    elements.reveal.downloadButton.addEventListener(
        "click",
        handleDownload
    );

    elements.reveal.closeButton.addEventListener(
        "click",
        handleCloseRequest
    );

    elements.reveal.downloadMoreButton.addEventListener(
        "click",
        handleDownloadMore
    );

    elements.intervention.reallyCloseButton.addEventListener(
        "click",
        handleCloseRequest
    );

    elements.intervention.proceedButton.addEventListener(
        "click",
        handleProceedToAnother
    );

    elements.thankYou.returnHomeButton.addEventListener(
        "click",
        handleReturnHome
    );

    elements.brandHome.addEventListener(
        "click",
        handleBrandHomeClick
    );

    elements.welcome.emailInput.addEventListener(
        "input",
        handleInputChange
    );
}


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function showScreen(screenName) {

    const screenMap = {
        welcome: elements.screens.welcome,
        reveal: elements.screens.reveal,
        intervention: elements.screens.intervention,
        thankYou: elements.screens.thankYou
    };

    Object.entries(screenMap).forEach(
        ([name, screen]) => {

            const isActive = name === screenName;

            screen.hidden = !isActive;

            screen.classList.toggle(
                "is-active",
                isActive
            );
        }
    );

    state.currentScreen = screenName;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (screenName === "welcome") {
        setTimeout(
            () => elements.welcome.emailInput.focus(),
            350
        );
    }
}


/* =========================================================
   WELCOME STATE
========================================================= */

function updateWelcomeState() {

    if (state.isReturningFromIntervention) {

        elements.welcome.eyebrow.textContent =
            "WELCOME BACK... AGAIN.";

        elements.welcome.message.textContent =
            "We admire the curiosity. Enter another email below if you absolutely must continue your investigation.";

        return;
    }

    elements.welcome.eyebrow.textContent =
        "A SPECIAL GIFT FROM THE CELEBRATION";

    elements.welcome.message.textContent =
        "Thank you for making our FIFA celebration unforgettable. You brought the energy, the spirit, and the confidence that made the event special.";
}


/* =========================================================
   EMAIL LOOKUP
========================================================= */

async function handleLookupSubmit(event) {

    event.preventDefault();

    if (state.isLoading) {
        return;
    }

    clearError();

    const rawEmail =
        elements.welcome.emailInput.value;

    const email =
        normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {

        showError(
            "INVALID EMAIL ADDRESS",
            "Please enter a valid email address."
        );

        elements.welcome.emailInput.focus();

        return;
    }

    state.isLoading = true;

    setLookupLoadingState(true);

    try {

        const imagePath =
            buildImagePath(email);

        await verifyImageExists(imagePath);

        state.currentEmail = email;

        state.currentImagePath = imagePath;

        showRevealScreen();

    } catch (error) {

        showError(
            "WE COULDN'T FIND THAT CARICATURE",
            "Please check the email address and try again. If you believe this is an error, please contact the event team."
        );

    } finally {

        state.isLoading = false;

        setLookupLoadingState(false);
    }
}


/* =========================================================
   EMAIL HELPERS
========================================================= */

function normalizeEmail(value) {

    return value
        .trim()
        .toLowerCase();
}


function isValidEmail(email) {

    /*
        This intentionally validates common email formats
        without attempting to implement the entire RFC.
    */

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}


function buildImagePath(email) {

    /*
        encodeURIComponent prevents special characters
        from breaking the image URL.

        Example:

        user@example.com

        becomes:

        images/user%40example.com.png

        Browsers correctly resolve this to the actual
        file named:

        user@example.com.png
    */

    const encodedEmail =
        encodeURIComponent(email);

    return `${CONFIG.imageDirectory}/${encodedEmail}${CONFIG.imageExtension}`;
}


/* =========================================================
   IMAGE VERIFICATION
========================================================= */

function verifyImageExists(imagePath) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();

            let isSettled = false;

            const timeout =
                setTimeout(
                    () => {

                        if (isSettled) {
                            return;
                        }

                        isSettled = true;

                        reject(
                            new Error(
                                "Image loading timed out."
                            )
                        );

                    },
                    CONFIG.imageLoadTimeout
                );


            image.onload = () => {

                if (isSettled) {
                    return;
                }

                isSettled = true;

                clearTimeout(timeout);

                resolve(imagePath);
            };


            image.onerror = () => {

                if (isSettled) {
                    return;
                }

                isSettled = true;

                clearTimeout(timeout);

                reject(
                    new Error(
                        "Caricature image not found."
                    )
                );
            };


            image.src = imagePath;
        }
    );
}


/* =========================================================
   LOOKUP UI STATE
========================================================= */

function setLookupLoadingState(isLoading) {

    const button =
        elements.welcome.claimButton;

    button.classList.toggle(
        "is-loading",
        isLoading
    );

    elements.welcome.emailInput.disabled =
        isLoading;
}


/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(title, message) {

    elements.welcome.errorTitle.textContent =
        title;

    elements.welcome.errorText.textContent =
        message;

    elements.welcome.errorMessage.hidden =
        false;
}


function clearError() {

    elements.welcome.errorMessage.hidden =
        true;
}


function handleInputChange() {

    if (!elements.welcome.errorMessage.hidden) {
        clearError();
    }
}


/* =========================================================
   REVEAL SCREEN
========================================================= */

function showRevealScreen() {

    const image =
        elements.reveal.image;

    image.classList.remove(
        "is-visible"
    );

    elements.reveal.imageLoadingState.classList.remove(
        "is-hidden"
    );

    image.src =
        state.currentImagePath;

    image.alt =
        `Personal celebration caricature for ${state.currentEmail}`;

    elements.reveal.imageEmailLabel.textContent =
        maskEmailForDisplay(
            state.currentEmail
        );

    elements.reveal.downloadFeedback.hidden =
        true;

    showScreen("reveal");

    image.onload =
        () => {

            elements.reveal.imageLoadingState.classList.add(
                "is-hidden"
            );

            requestAnimationFrame(
                () => {

                    image.classList.add(
                        "is-visible"
                    );
                }
            );
        };
}


/* =========================================================
   EMAIL DISPLAY
========================================================= */

function maskEmailForDisplay(email) {

    const parts =
        email.split("@");

    if (parts.length !== 2) {
        return email;
    }

    const username =
        parts[0];

    const domain =
        parts[1];

    if (username.length <= 2) {
        return `${username[0]}***@${domain}`;
    }

    const firstCharacter =
        username.charAt(0);

    const lastCharacter =
        username.charAt(
            username.length - 1
        );

    return `${firstCharacter}***${lastCharacter}@${domain}`;
}


/* =========================================================
   DOWNLOAD
========================================================= */

async function handleDownload() {

    if (!state.currentImagePath) {
        return;
    }

    const button =
        elements.reveal.downloadButton;

    button.classList.add(
        "is-loading"
    );

    try {

        /*
            Fetch the image as a Blob first.

            This makes the download more reliable
            on GitHub Pages than simply using:

            <a href="...">

            The same-origin image is downloaded
            with the desired filename.
        */

        const response =
            await fetch(
                state.currentImagePath
            );

        if (!response.ok) {
            throw new Error(
                "Unable to download image."
            );
        }

        const blob =
            await response.blob();

        const blobUrl =
            URL.createObjectURL(blob);

        const downloadLink =
            document.createElement("a");

        downloadLink.href =
            blobUrl;

        downloadLink.download =
            CONFIG.downloadFilename;

        document.body.appendChild(
            downloadLink
        );

        downloadLink.click();

        downloadLink.remove();

        URL.revokeObjectURL(
            blobUrl
        );

        showDownloadFeedback();

    } catch (error) {

        /*
            Fallback for environments where
            fetch/blob download is blocked.
        */

        const fallbackLink =
            document.createElement("a");

        fallbackLink.href =
            state.currentImagePath;

        fallbackLink.download =
            CONFIG.downloadFilename;

        fallbackLink.target =
            "_blank";

        fallbackLink.rel =
            "noopener";

        document.body.appendChild(
            fallbackLink
        );

        fallbackLink.click();

        fallbackLink.remove();

        showToast(
            "DOWNLOAD STARTED"
        );

    } finally {

        button.classList.remove(
            "is-loading"
        );
    }
}


function showDownloadFeedback() {

    elements.reveal.downloadFeedback.hidden =
        false;

    showToast(
        "YOUR CARICATURE HAS BEEN DOWNLOADED"
    );
}


/* =========================================================
   INTERVENTION FLOW
========================================================= */

function handleDownloadMore() {

    state.hasVisitedIntervention =
        true;

    sessionStorage.setItem(
        CONFIG.sessionStorageKey,
        "true"
    );

    showScreen(
        "intervention"
    );
}


function handleProceedToAnother() {

    state.isReturningFromIntervention =
        true;

    updateWelcomeState();

    clearError();

    elements.welcome.emailInput.value =
        "";

    showScreen(
        "welcome"
    );
}


/* =========================================================
   CLOSE FLOW
========================================================= */

function handleCloseRequest() {

    /*
        Browsers generally block window.close()
        unless the tab was opened by JavaScript.

        We attempt it first, then provide a
        graceful thank-you fallback.
    */

    let closeAttempted =
        false;

    try {

        window.close();

        closeAttempted =
            true;

    } catch (error) {

        closeAttempted =
            false;
    }


    /*
        Even if window.close() was called,
        browsers may silently block it.

        Showing the thank-you state ensures
        the user never gets stuck.
    */

    setTimeout(
        () => {

            showScreen(
                "thankYou"
            );

        },
        closeAttempted
            ? 500
            : 0
    );
}


/* =========================================================
   RETURN HOME
========================================================= */

function handleReturnHome() {

    state.isReturningFromIntervention =
        false;

    state.currentEmail =
        "";

    state.currentImagePath =
        "";

    elements.welcome.emailInput.value =
        "";

    updateWelcomeState();

    clearError();

    showScreen(
        "welcome"
    );
}


function handleBrandHomeClick(event) {

    event.preventDefault();

    handleReturnHome();
}


/* =========================================================
   SESSION STATE
========================================================= */

function loadReturnVisitState() {

    const hasVisited =
        sessionStorage.getItem(
            CONFIG.sessionStorageKey
        );

    state.hasVisitedIntervention =
        hasVisited === "true";
}


/* =========================================================
   TOAST
========================================================= */

let toastTimeout;


function showToast(message) {

    const toast =
        elements.toast;

    toast.textContent =
        message;

    toast.hidden =
        false;

    clearTimeout(
        toastTimeout
    );

    toastTimeout =
        setTimeout(
            () => {

                toast.hidden =
                    true;

            },
            3500
        );
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        /*
            Escape returns from the reveal screen
            to the welcome screen.

            This is useful for keyboard users.
        */

        if (
            event.key === "Escape" &&
            state.currentScreen === "reveal"
        ) {

            handleCloseRequest();
        }
    }
);
