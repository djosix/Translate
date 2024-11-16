function getTextSelection() {
    // Current page scroll offset
    const offset = {
        x: window.scrollX,
        y: window.scrollY,
    };

    // Check if user is selecting text in an input field
    const activeElement = document.activeElement;
    if (
        (activeElement.tagName === "TEXTAREA") ||
        (activeElement.tagName === "INPUT" &&
            /^(text|password|search|tel|url|email)$/.test(
                activeElement.type,
            )) ||
        (activeElement.hasAttribute("contenteditable") &&
            activeElement.getAttribute("contenteditable") === "true")
    ) {
        return {
            text: activeElement.value.substring(
                activeElement.selectionStart,
                activeElement.selectionEnd,
            ),
            rect: activeElement.getBoundingClientRect(),
            offset,
        };
    }

    // User is selecting text in the page
    const selection = window.getSelection();
    return {
        text: selection.toString().trim(),
        rect: selection.rangeCount > 0
            ? selection.getRangeAt(0).getBoundingClientRect()
            : null,
        offset,
    };
}

function setupTooltip(translateFn) {
    // Constants
    const fontFamily = "Arial, sans-serif";

    // States
    let currentButton = null;
    let currentSelection = null;
    let currentTooltip = null;

    // Create a shadow DOM container to isolate page styles
    const container = function () {
        const container = document.createElement("div");
        container.style.width = "0";
        container.style.height = "0";
        container.style.visibility = "hidden";
        return container;
    }();
    const shadow = container.attachShadow({ mode: "open" });
    shadow.appendChild(function () {
        // Reset all styles that the shadow DOM might inherit to their initial values
        const shadowCss = [
            ["font-family", "initial"],
            ["font-size", "initial"],
            ["font-style", "initial"],
            ["font-variant", "initial"],
            ["font-weight", "initial"],
            ["letter-spacing", "initial"],
            ["word-spacing", "initial"],
            ["line-height", "initial"],
            ["color", "initial"],
            ["text-align", "initial"],
            ["text-indent", "initial"],
            ["text-transform", "initial"],
            ["white-space", "initial"],
            ["direction", "initial"],
            ["unicode-bidi", "initial"],
            ["list-style", "initial"],
            ["list-style-image", "initial"],
            ["list-style-position", "initial"],
            ["list-style-type", "initial"],
            ["border-collapse", "initial"],
            ["border-spacing", "initial"],
            ["caption-side", "initial"],
            ["empty-cells", "initial"],
            ["quotes", "initial"],
        ];
        const style = document.createElement("style");
        style.innerHTML = ":host{" + shadowCss.map(([key, value]) =>
            `${key}:${value};`
        ).join("") + "}";
        return style;
    }());
    document.body.appendChild(container);

    function showButton(placement) {
        removeButton();

        const { x, y, upwards } = placement;
        const width = 26, height = 26;
        const buttonX = x - width / 2;
        const buttonY = upwards ? y - height : y;
        const defaultBoxShadow = "0px 2px 4px rgba(0, 0, 0, 0.2)";

        currentButton = document.createElement("button");
        currentButton.type = "button";
        currentButton.innerText = "Tr";
        currentButton.style.width = `${width}px`;
        currentButton.style.height = `${height}px`;
        currentButton.style.borderRadius = "5px";
        currentButton.style.backgroundColor = "#fafafa";
        currentButton.style.position = "fixed";
        currentButton.style.left = `${buttonX}px`;
        currentButton.style.top = `${buttonY}px`;
        currentButton.style.boxShadow = defaultBoxShadow;
        currentButton.style.color = "#888";
        currentButton.style.fontSize = "12px";
        currentButton.style.cursor = "pointer";
        currentButton.style.textAlign = "center";
        currentButton.style.lineHeight = `${height}px`;
        currentButton.style.zIndex = "2147483647";
        currentButton.style.boxSizing = "border-box";
        currentButton.style.fontFamily = fontFamily;
        currentButton.style.padding = "0";
        currentButton.style.border = "0";
        currentButton.style.visibility = "visible";

        currentButton.addEventListener("mouseenter", () => {
            currentButton.style.boxShadow = "0px 3px 6px rgba(0, 0, 0, 0.2)";
            currentButton.style.backgroundColor = "#fefefe";
        });

        currentButton.addEventListener("mouseleave", () => {
            currentButton.style.boxShadow = defaultBoxShadow;
            currentButton.style.backgroundColor = "#fafafa";
        });

        currentButton.addEventListener("click", (e) => {
            handleButtonClick(currentButton, e);
        });

        shadow.appendChild(currentButton);
    }

    function removeButton() {
        if (!currentButton) {
            return;
        }
        currentButton.remove();
        currentButton = null;
    }

    async function handleButtonClick(button, e) {
        setButtonLoading(button);
        try {
            const result = await translateFn(currentSelection.text);
            let tooltipX = e.pageX,
                tooltipY = e.pageY,
                tooltipUpwards = false;
            if (currentSelection.rect !== null) {
                const s = currentSelection;
                tooltipUpwards = Math.abs(e.pageY - (s.rect.top + s.offset.y)) <
                    Math.abs(e.pageY - (s.rect.bottom + s.offset.y));
                tooltipX = (s.rect.left + s.rect.right) / 2 + s.offset.x;
                tooltipY = (tooltipUpwards ? s.rect.top : s.rect.bottom) +
                    s.offset.y;
            }
            showTooltip({
                x: tooltipX,
                y: tooltipY,
                upwards: tooltipUpwards,
            }, result);
        } catch (error) {
            alert("Failed to translate the selected text.\n" + error);
        } finally {
            removeButton();
        }
    }

    function setButtonLoading(button) {
        const loader = document.createElement("div");
        loader.style.border = "3px solid #f0f0f0";
        loader.style.borderRadius = "50%";
        loader.style.borderTop = "3px solid #3498db";
        loader.style.width = "16px";
        loader.style.height = "16px";
        loader.style.boxSizing = "border-box";
        loader.style.margin = "auto";
        loader.style.padding = "0";
        loader.style.animation = "spin 0.5s linear infinite";
        const styleSheet = document.createElement("style");
        styleSheet.innerText =
            `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        loader.appendChild(styleSheet);
        button.innerHTML = "";
        button.appendChild(loader);
        button.setAttribute("disabled", "disabled");
    }

    function showTooltip(placement, result) {
        removeTooltip();
        const { x, y, upwards } = placement;
        currentTooltip = document.createElement("div");
        currentTooltip.style.width = "auto";
        currentTooltip.style.maxWidth = "60vw";
        currentTooltip.style.position = "absolute";
        currentTooltip.style.backgroundColor = "white";
        currentTooltip.style.color = "black";
        currentTooltip.style.padding = "10px 14px";
        currentTooltip.style.borderRadius = "6px";
        currentTooltip.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.4)";
        currentTooltip.style.zIndex = "2147483647";
        currentTooltip.style.transition = "opacity 0.5s ease";
        currentTooltip.style.fontSize = "14px";
        currentTooltip.style.fontFamily = "Arial, sans-serif";
        currentTooltip.style.opacity = "0"; // Hide initially
        currentTooltip.style.visibility = "visible";
        currentTooltip.appendChild(function () {
            let div = document.createElement("div");
            div.style.fontSize = "12px";
            div.style.fontFamily = fontFamily;
            div.style.color = "#888";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.userSelect = "none";
            div.style.marginBottom = "8px";
            const textDiv = document.createElement("div");
            textDiv.innerText = "Translate";
            textDiv.style.fontSize = "12px";
            textDiv.style.marginRight = "16px";
            textDiv.style.fontFamily = fontFamily;
            div.appendChild(textDiv);
            const closeDiv = document.createElement("div");
            closeDiv.innerHTML = "&times;";
            closeDiv.style.marginLeft = "auto";
            closeDiv.style.cursor = "pointer";
            closeDiv.style.fontSize = "12px";
            closeDiv.style.width = "12px";
            closeDiv.style.height = "12px";
            closeDiv.style.borderRadius = "10%";
            closeDiv.style.justifyContent = "center";
            closeDiv.style.alignItems = "center";
            closeDiv.style.textAlign = "center";
            closeDiv.addEventListener("mouseover", () => {
                closeDiv.style.backgroundColor = "#dedede";
            });
            closeDiv.addEventListener("mouseleave", () => {
                closeDiv.style.backgroundColor = "inherit";
            });
            closeDiv.addEventListener("mousedown", () => {
                closeDiv.style.backgroundColor = "#c0c0c0";
            });
            closeDiv.addEventListener("mouseup", () => {
                closeDiv.style.backgroundColor = "#dedede";
            });
            closeDiv.addEventListener("click", () => {
                removeTooltip();
            });
            div.appendChild(closeDiv);
            return div;
        }());
        currentTooltip.appendChild(function () {
            let div = document.createElement("div");
            div.style.fontSize = "14px";
            div.style.fontFamily = fontFamily;
            div.style.overflow = "scroll";
            div.style.maxHeight = "50vh";
            div.innerText = result;
            return div;
        }());
        // Calculate page dimensions to place the tooltip within the page
        const maxLeft = 0 + 4,
            maxRight = document.documentElement.scrollWidth - 4,
            maxTop = 0 + 4,
            maxBottom = document.documentElement.scrollHeight - 4;
        // Add the tooltip to the page, this may change page dimensions
        shadow.appendChild(currentTooltip);
        // Adjust the tooltip aspect ratio
        {
            const rect = currentTooltip.getBoundingClientRect();
            const aspectRatio = 2;
            const newWidth = Math.sqrt(rect.width * rect.height / aspectRatio) *
                aspectRatio;
            currentTooltip.style.maxWidth = `${newWidth}px`;
        }
        // Calculate the tooltip position and avoid overflowing the page
        {
            const rect = currentTooltip.getBoundingClientRect();
            let tooltipX = x - rect.width / 2;
            let tooltipY = upwards ? y - rect.height - 2 : y + 2;
            tooltipX = Math.max(maxLeft, tooltipX);
            tooltipX = Math.min(maxRight - rect.width, tooltipX);
            tooltipY = Math.max(maxTop, tooltipY);
            tooltipY = Math.min(maxBottom - rect.height, tooltipY);
            currentTooltip.style.left = `${tooltipX}px`;
            currentTooltip.style.top = `${tooltipY}px`;
        }
        // Show the tooltip
        currentTooltip.style.opacity = "1";
    }

    function removeTooltip() {
        if (!currentTooltip) {
            return;
        }
        currentTooltip.remove();
        currentTooltip = null;
    }

    function isInsideShadow(e) {
        return e.composedPath().some((node) => node.shadowRoot === shadow);
    }

    let lastShowButtonTime = 0;

    async function documentMouseUpHandler(e) {
        if (isInsideShadow(e)) {
            return;
        }
        if (Date.now() - lastShowButtonTime < 100) {
            return;
        }
        if (currentButton) {
            if (currentButton.contains(e.target)) {
                return;
            }
            removeButton();
        }
        if (currentTooltip) {
            if (currentTooltip.contains(e.target)) {
                return;
            }
            removeTooltip();
        }

        // Wait for the selection to be updated
        await new Promise((resolve) => setTimeout(resolve, 1));

        currentSelection = getTextSelection();
        if (currentSelection.text.length === 0) {
            return;
        }

        let buttonY = e.pageY,
            buttonUpwards = false;
        if (currentSelection.rect !== null) {
            const s = currentSelection;
            buttonUpwards = Math.abs(e.pageY - s.rect.top - s.offset.y) <
                Math.abs(e.pageY - s.rect.bottom - s.offset.y);
            buttonY = buttonUpwards ? s.rect.top - 1 : s.rect.bottom + 1;
        }
        showButton({
            x: e.pageX,
            y: buttonY,
            upwards: buttonUpwards,
        });

        lastShowButtonTime = Date.now();
    }

    function documentMouseDownHandler(e) {
        if (isInsideShadow(e)) {
            return;
        }
        if (currentButton && !currentButton.contains(e.target)) {
            currentButton.remove();
            currentButton = null;
        }
    }

    document.addEventListener("mouseup", documentMouseUpHandler);
    document.addEventListener("mousedown", documentMouseDownHandler);

    function hide() {
        removeButton();
        removeTooltip();
    }

    function cleanup() {
        document.removeEventListener("mouseup", documentMouseUpHandler);
        document.removeEventListener("mousedown", documentMouseDownHandler);
        removeButton();
        removeTooltip();
        container.remove();
    }

    return { hide, cleanup };
}

function background(request) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(request, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(response);
        });
    });
}

const translate = async (text) => {
    const response = await background({ action: "translate", text });
    if (response.error) {
        throw response.error;
    }
    return response.result;
};

let tooltip = null;

function enableTooltip() {
    if (!tooltip) {
        tooltip = setupTooltip(translate);
    }
}

function disableTooltip() {
    if (tooltip) {
        tooltip.cleanup();
        tooltip = null;
    }
}

function hideTooltip() {
    if (tooltip) {
        tooltip.hide();
    }
}

background({ action: "settings" }).then((response) => {
    if (response.settings.enableTooltip) {
        enableTooltip();
    }
});

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        switch (request.action) {
            case "selection":
                const text = window.getSelection().toString().trim();
                sendResponse({ text });
                return true;
            case "tooltip":
                if (request.enable) {
                    enableTooltip();
                } else {
                    disableTooltip();
                }
                return false;
            case "popup":
                hideTooltip();
                return false;
            default:
                return false;
        }
    },
);
