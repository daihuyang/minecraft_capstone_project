export function clearHoverState(button: HTMLElement) {
    button.classList.remove('hover');
    button.classList.remove('active');
    button.classList.remove('focus');
}

export function setupMCButtonEvents(button: HTMLElement) {
    // We use this function in several cases:
    //  - Fixes focus persistence issues when clicking buttons, especially titlebar buttons. 
    //      - Eg. Clicking Maximize would expand the window, but focus will still remain on the maximize button.
    //  - Hover states freak out when a context menu is opened, so manually implement default/hover/active so we can force clear it on context click.
    
    button.addEventListener('mouseover', (event: MouseEvent) => {
        button.classList.add('hover');
    });
    button.addEventListener('mouseleave', (event: MouseEvent) => {
        clearHoverState(button);
    });
    button.addEventListener('mousedown', (event: MouseEvent) => {
        // Depress button for left clicks only
        if (event.button == 0) {
            button.classList.add('active');
        }
    });
    button.addEventListener('mouseup', (event: MouseEvent) => {
        button.classList.remove('active');
    });
    button.addEventListener('focus', (event: Event) => {
        button.classList.add('focus');
    });
    button.addEventListener('blur', (event: Event) => {
        button.classList.remove('focus');
    });
}