/* =========================================================
   FIFA CELEBRATION CARICATURE EXPERIENCE
   Static GitHub Pages Implementation

   IMAGE MATCHING LOGIC:

   User enters:
   Gokulnath@company.com

   The application converts it to lowercase:
   gokulnath@company.com

   Takes the substring before @:
   gokulnath

   Then searches the available image filenames:
   images/gokulnath.png

   The email domain is completely ignored.
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    /*
        Your image folder.

        Example:

        your-repository/
        ├── index.html
        ├── style.css
        ├── script.js
        └── images/
            ├── gokulnath.png
            ├── arun.png
            └── priya.png
    */

    imageDirectory: "images",

    /*
        Your image format.

        Change this if your files are .jpg or .webp.
    */

    imageExtension: ".png",

    /*
        Name given to the downloaded image.
    */

    downloadFilename: "my-caricature.png",

    /*
        Maximum time allowed for image loading.
    */

    imageLoadTimeout: 10000,

    /*
        Used for the intervention screen.
    */

    sessionStorageKey:
        "fifaCelebrationReturnVisit",


    /*
        =====================================================
        IMAGE NAMES

        IMPORTANT:

        Add image filenames here WITHOUT the extension.

        Everything must be lowercase.

        If the file is:

        images/gokulnath.png

        Add:

        "gokulnath"

        =====================================================
    */

    availableImages: [

        "gokulnath",

        "arun",

        "priya",

        "participant01",

        "participant02"

        /*
            Add more names here:

            "john",
            "rahul",
            "suresh",
            "karthik"
        */
    ]
};


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    currentScreen:
        "welcome",

    currentEmail:
        "",

    currentUsername:
        "",

    currentImagePath:
        "",

    isLoading:
        false,

    isReturningFromIntervention:
        false,

    hasVisitedIntervention:
        false
};


/* =========================================================
   DOM REFERENCES
========================================================= */

const elements = {


    /* -------------------------
       Screens
    ------------------------- */

    screens: {

        welcome:
            document.getElementById(
                "welcomeScreen"
            ),

        reveal:
            document.getElementById(
                "revealScreen"
            ),

        intervention:
            document.getElementById(
                "interventionScreen"
            ),

        thankYou:
            document.getElementById(
                "thankYouScreen"
            )
    },


    /* -------------------------
       Welcome Screen
    ------------------------- */

    welcome: {

        eyebrow:
            document.getElementById(
                "welcomeEyebrow"
            ),

        message:
            document.getElementById(
                "welcomeMessage"
            ),

        form:
            document.getElementById(
                "lookupForm"
            ),

        emailInput:
            document.getElementById(
                "emailInput"
            ),

        claimButton:
            document.getElementById(
                "claimButton"
            ),

        errorMessage:
            document.getElementById(
                "errorMessage"
            ),

        errorTitle:
            document.getElementById(
                "errorTitle"
            ),

        errorText:
            document.getElementById(
                "errorText"
            )
    },


    /* -------------------------
       Reveal Screen
    ------------------------- */

    reveal: {

        image:
            document.getElementById(
                "caricatureImage"
            ),

        imageLoadingState:
            document.querySelector(
                ".image-loading-state"
            ),

        imageEmailLabel:
            document.getElementById(
                "imageEmailLabel"
            ),

        downloadButton:
            document.getElementById(
                "downloadButton"
            ),

        closeButton:
            document.getElementById(
                "closeRevealButton"
            ),

        downloadMoreButton:
            document.getElementById(
                "downloadMoreButton"
            ),

        downloadFeedback:
            document.getElementById(
                "downloadFeedback"
            )
    },


    /* -------------------------
       Intervention Screen
    ------------------------- */

    intervention: {

        reallyCloseButton:
            document.getElementById(
                "reallyCloseButton"
            ),

        proceedButton:
            document.getElementById(
                "proceedButton"
            )
    },


    /* -------------------------
       Thank You Screen
    ------------------------- */

    thankYou: {

        returnHomeButton:
            document.getElementById(
                "returnHomeButton"
            )
    },


    /* -------------------------
       Global Elements
    ------------------------- */

    brandHome:
        document.getElementById(
            "brandHome"
        ),

    toast:
        document.getElementById(
            "toast"
        )
};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


function initializeApplication() {

    loadReturnVisitState();

    bindEventListeners();

    updateWelcomeState();

    showScreen(
        "welcome"
    );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function bindEventListeners() {


    /*
        Email lookup form
    */

    elements.welcome.form.addEventListener(
        "submit",
        handleLookupSubmit
    );


    /*
        Download current caricature
    */

    elements.reveal.downloadButton.addEventListener(
        "click",
        handleDownload
    );


    /*
        Close request from reveal screen
    */

    elements.reveal.closeButton.addEventListener(
        "click",
        handleCloseRequest
    );


    /*
        User wants to see someone else's caricature
    */

    elements.reveal.downloadMoreButton.addEventListener(
        "click",
        handleDownloadMore
    );


    /*
        Close request from intervention screen
    */

    elements.intervention.reallyCloseButton.addEventListener(
        "click",
        handleCloseRequest
    );


    /*
        Continue to another lookup
    */

    elements.intervention.proceedButton.addEventListener(
        "click",
        handleProceedToAnother
    );


    /*
        Return to welcome screen
    */

    elements.thankYou.returnHomeButton.addEventListener(
        "click",
        handleReturnHome
    );


    /*
        Logo / brand click
    */

    elements.brandHome.addEventListener(
        "click",
        handleBrandHomeClick
    );


    /*
        Remove error as soon as user starts typing
    */

    elements.welcome.emailInput.addEventListener(
        "input",
        handleInputChange
    );
}


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function showScreen(
    screenName
) {

    const screenMap = {

        welcome:
            elements.screens.welcome,

        reveal:
            elements.screens.reveal,

        intervention:
            elements.screens.intervention,

        thankYou:
            elements.screens.thankYou
    };


    Object.entries(
        screenMap
    ).forEach(
        (
            [
                name,
                screen
            ]
        ) => {

            const isActive =
                name === screenName;


            screen.hidden =
                !isActive;


            screen.classList.toggle(
                "is-active",
                isActive
            );
        }
    );


    state.currentScreen =
        screenName;


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"
    });


    /*
        Automatically focus the input
        when returning to the welcome screen.
    */

    if (
        screenName === "welcome"
    ) {

        setTimeout(

            () => {

                elements.welcome.emailInput.focus();

            },

            350
        );
    }
}


/* =========================================================
   WELCOME SCREEN CONTENT
========================================================= */

function updateWelcomeState() {


    if (
        state.isReturningFromIntervention
    ) {

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
   MAIN LOOKUP FUNCTION
========================================================= */

async function handleLookupSubmit(
    event
) {

    event.preventDefault();


    /*
        Prevent duplicate submissions
        while an image is loading.
    */

    if (
        state.isLoading
    ) {

        return;
    }


    clearError();


    /*
        Get the exact text entered
        by the user.
    */

    const rawInput =
        elements.welcome.emailInput.value;


    /*
        Convert everything to lowercase.

        Example:

        Gokulnath@Company.COM

        becomes:

        gokulnath@company.com
    */

    const input =
        rawInput
            .trim()
            .toLowerCase();


    /*
        Basic empty input check.
    */

    if (
        !input
    ) {

        showError(

            "EMAIL REQUIRED",

            "Please enter your email address."
        );


        elements.welcome.emailInput.focus();


        return;
    }


    /*
        =====================================================
        IMPORTANT PART

        Take only the substring before @.

        Example:

        gokulnath@company.com

        becomes:

        gokulnath
        =====================================================
    */

    const username =
        input.split("@")[0];


    /*
        Make sure the user actually
        entered something before @.
    */

    if (
        !username
    ) {

        showError(

            "INVALID INPUT",

            "Please enter a valid email address."
        );


        return;
    }


    /*
        =====================================================
        FIND MATCHING IMAGE

        Example:

        User enters:

        GOKULNATH@COMPANY.COM

        Converted:

        gokulnath@company.com

        Username:

        gokulnath

        Available images:

        [
            "gokulnath",
            "arun",
            "priya"
        ]

        Match:

        "gokulnath"
        =====================================================
    */

    const matchingImage =
        CONFIG.availableImages.find(

            imageName =>

                imageName
                    .toLowerCase()
                    .trim() === username
        );


    /*
        No matching image found.
    */

    if (
        !matchingImage
    ) {

        showError(

            "WE COULDN'T FIND THAT CARICATURE",

            "Please check the email address and try again. If you believe this is an error, please contact the event team."
        );


        return;
    }


    /*
        Start loading state.
    */

    state.isLoading =
        true;


    setLookupLoadingState(
        true
    );


    try {


        /*
            Build the image path.

            Example:

            matchingImage:

            gokulnath

            Final path:

            images/gokulnath.png
        */

        const imagePath =

            `${CONFIG.imageDirectory}/${matchingImage}${CONFIG.imageExtension}`;


        /*
            Verify that the image
            actually exists.
        */

        await verifyImageExists(
            imagePath
        );


        /*
            Save current lookup data.
        */

        state.currentEmail =
            input;


        state.currentUsername =
            username;


        state.currentImagePath =
            imagePath;


        /*
            Show the caricature.
        */

        showRevealScreen();


    } catch (
        error
    ) {

        console.error(
            error
        );


        showError(

            "WE COULDN'T LOAD THAT CARICATURE",

            "The caricature file could not be loaded. Please contact the event team."
        );


    } finally {


        state.isLoading =
            false;


        setLookupLoadingState(
            false
        );
    }
}


/* =========================================================
   IMAGE VERIFICATION
========================================================= */

function verifyImageExists(
    imagePath
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {


            const image =
                new Image();


            let isSettled =
                false;


            const timeout =

                setTimeout(

                    () => {


                        if (
                            isSettled
                        ) {

                            return;
                        }


                        isSettled =
                            true;


                        reject(

                            new Error(

                                "Image loading timed out."
                            )
                        );

                    },

                    CONFIG.imageLoadTimeout
                );


            image.onload =

                () => {


                    if (
                        isSettled
                    ) {

                        return;
                    }


                    isSettled =
                        true;


                    clearTimeout(
                        timeout
                    );


                    resolve(
                        imagePath
                    );
                };


            image.onerror =

                () => {


                    if (
                        isSettled
                    ) {

                        return;
                    }


                    isSettled =
                        true;


                    clearTimeout(
                        timeout
                    );


                    reject(

                        new Error(

                            "Caricature image not found."
                        )
                    );
                };


            image.src =
                imagePath;
        }
    );
}


/* =========================================================
   LOOKUP LOADING STATE
========================================================= */

function setLookupLoadingState(
    isLoading
) {

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

function showError(

    title,

    message
) {

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

    if (
        !elements.welcome.errorMessage.hidden
    ) {

        clearError();
    }
}


/* =========================================================
   REVEAL SCREEN
========================================================= */

function showRevealScreen() {

    const image =
        elements.reveal.image;


    /*
        Reset image animation.
    */

    image.classList.remove(
        "is-visible"
    );


    /*
        Show loading indicator.
    */

    elements.reveal.imageLoadingState.classList.remove(
        "is-hidden"
    );


    /*
        Set image source.
    */

    image.src =
        state.currentImagePath;


    /*
        Accessibility description.
    */

    image.alt =

        `Personal celebration caricature for ${state.currentUsername}`;


    /*
        Show a masked email.
    */

    elements.reveal.imageEmailLabel.textContent =

        maskEmailForDisplay(
            state.currentEmail
        );


    /*
        Reset download feedback.
    */

    elements.reveal.downloadFeedback.hidden =
        true;


    /*
        Display reveal screen.
    */

    showScreen(
        "reveal"
    );


    /*
        Wait until image is fully loaded.
    */

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
   MASK EMAIL FOR DISPLAY
========================================================= */

function maskEmailForDisplay(
    email
) {

    const parts =
        email.split("@");


    if (
        parts.length !== 2
    ) {

        return email;
    }


    const username =
        parts[0];


    const domain =
        parts[1];


    if (
        username.length <= 2
    ) {

        return `${username[0]}***@${domain}`;
    }


    const firstCharacter =
        username.charAt(
            0
        );


    const lastCharacter =
        username.charAt(

            username.length - 1
        );


    return

        `${firstCharacter}***${lastCharacter}@${domain}`;
}


/* =========================================================
   DOWNLOAD IMAGE
========================================================= */

async function handleDownload() {


    if (
        !state.currentImagePath
    ) {

        return;
    }


    const button =
        elements.reveal.downloadButton;


    button.classList.add(
        "is-loading"
    );


    try {


        /*
            Fetch the image file.
        */

        const response =

            await fetch(

                state.currentImagePath
            );


        if (
            !response.ok
        ) {

            throw new Error(

                "Unable to download image."
            );
        }


        /*
            Convert image to Blob.
        */

        const blob =
            await response.blob();


        /*
            Create temporary download URL.
        */

        const blobUrl =
            URL.createObjectURL(
                blob
            );


        /*
            Create temporary link.
        */

        const downloadLink =
            document.createElement(
                "a"
            );


        downloadLink.href =
            blobUrl;


        downloadLink.download =
            CONFIG.downloadFilename;


        document.body.appendChild(
            downloadLink
        );


        /*
            Start download.
        */

        downloadLink.click();


        /*
            Clean up.
        */

        downloadLink.remove();


        URL.revokeObjectURL(
            blobUrl
        );


        showDownloadFeedback();


    } catch (
        error
    ) {


        console.error(
            error
        );


        /*
            Fallback method.
        */

        const fallbackLink =
            document.createElement(
                "a"
            );


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
        Browsers normally block window.close()
        unless the page was opened using JavaScript.

        We attempt it first.
    */

    try {

        window.close();

    } catch (
        error
    ) {

        console.warn(
            "Browser blocked window.close().",
            error
        );
    }


    /*
        Show fallback screen.

        This ensures the user never gets stuck.
    */

    setTimeout(

        () => {

            showScreen(
                "thankYou"
            );

        },

        500
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


    state.currentUsername =
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


function handleBrandHomeClick(
    event
) {

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
   TOAST NOTIFICATION
========================================================= */

let toastTimeout;


function showToast(
    message
) {


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

    (
        event
    ) => {


        /*
            Escape from reveal screen.
        */

        if (

            event.key === "Escape" &&

            state.currentScreen === "reveal"

        ) {

            handleCloseRequest();
        }
    }
);
