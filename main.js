import { getPreferences, init, onPreferencesChanged, show } from "cookie-though";
import defaultOptions from "./defaultOptions";
import shadowStyles from "./shadow-styles.scss?inline";
import styles from "./styles.scss?inline";
import deepMerge from "deepmerge";

function cookiesEnabled(prefs, category) {
    var tmp = prefs.cookieOptions.find((x) => x.id === category);
    if (tmp && tmp.isEnabled) return "granted";
    else return "denied";
}

function configStyles(theme) {
    // General stylesheet to add to page
    var styleSheet = document.createElement("style");
    styleSheet.innerHTML = styles;
    document.head.appendChild(styleSheet);

    // Shadow stylesheet for cookie though
    var shadowStyleSheet = document.createElement("style");
    shadowStyleSheet.innerHTML = shadowStyles;

    // properties need to be outside of the DOMContentLoaded or it doesn't work
    document
        .querySelector(".cookie-though")
        .shadowRoot.querySelector(".ct-collapse")
        .setAttribute("data-lenis-prevent", "");

    document.querySelector(".cookie-though").shadowRoot.appendChild(shadowStyleSheet);
    document.documentElement.style.setProperty(
        "--elevens-ct-primary-button-color",
        theme.primaryButtonColor
    );
    document.documentElement.style.setProperty(
        "--elevens-ct-primary-button-hover-color",
        theme.primaryButtonHoverColor
    );
    document.documentElement.style.setProperty(
        "--elevens-ct-primary-button-bg-color",
        theme.primaryButtonBgColor
    );
    document.documentElement.style.setProperty(
        "--elevens-ct-primary-button-bg-hover-color",
        theme.primaryButtonBgHoverColor
    );

    document.documentElement.style.setProperty("--elevens-ct-text-color", theme.textColor);
    document.documentElement.style.setProperty("--elevens-ct-bg-color", theme.bgColor);
    document.documentElement.style.setProperty("--elevens-ct-border-radius", theme.borderRadius);
    document.documentElement.style.setProperty(
        "--elevens-ct-button-border-radius",
        theme.buttonBorderRadius
    );
    document.documentElement.style.setProperty("--elevens-ct-button-padding", theme.buttonPadding);
}

function updateConsent(prefs) {
    var marketingEnabled = cookiesEnabled(prefs, "marketing");
    var statisticsEnabled = cookiesEnabled(prefs, "statistics");
    var preferencesEnabled = cookiesEnabled(prefs, "preferences");

    var consent = {
        ad_storage: "granted",
        analytics_storage: statisticsEnabled,
        ad_user_data: marketingEnabled,
        ad_personalization: marketingEnabled,
        functionality_storage: preferencesEnabled,
        personalization_storage: preferencesEnabled,
        security_storage: "granted",
        extra_prop: "xxxx",
    };

    gtag("consent", "update", consent);
    dataLayer.push({ event: "cookie_consent_update" });
    console.log("Consent updated (2)", consent);
}

// ------------------------------------------------------------- GO
const opts = deepMerge(defaultOptions, window.elevensCookieThough || {});

// Custom merge with overwrite for policies
if (
    window.elevensCookieThough.config.policies &&
    window.elevensCookieThough.config.policies.length > 0
) {
    const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
    opts.config.policies = deepMerge(
        defaultOptions.config.policies,
        window.elevensCookieThough.config.policies || {},
        {
            arrayMerge: overwriteMerge,
        }
    );
}

window.elevensMergedCookieOpions = opts;

//console.log("Attach event listeneres foor Cookiethough");

function startup() {
    console.log("Trying to initialize CookieThough", opts.config);

    // Initialize cookiethough
    init(opts.config);

    // After init
    configStyles(opts.theme);

    onPreferencesChanged((prefs) => {
        updateConsent(prefs);
    });

    // Does the cookie exist?
    if (document.cookie.indexOf("cookie-preferences") !== -1) {
        // There already was consent configured. Trigger the custom event.
        var prefs = getPreferences();
        if (prefs) {
            updateConsent(prefs);
        }
    }

    const cookiePrefsButton = document.querySelector("[data-cookie-though]");
    if (cookiePrefsButton) {
        cookiePrefsButton.addEventListener("click", (e) => {
            e.preventDefault();

            show();
        });
    }
}

if (document.readyState === "loading") {
    // Loading hasn't finished yet
    console.log("Loading hasn't finished yet. Attach to DOMContentLoaded event.");
    document.addEventListener("DOMContentLoaded", startup);
} else {
    // `DOMContentLoaded` has already fired
    console.log("DOMContentLoaded has already fired. Run startup now.");
    startup();
}
