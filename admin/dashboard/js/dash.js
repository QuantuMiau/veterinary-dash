const nav = document.querySelector('nav');
    const toggleButton = document.querySelector('.arrow');
    const icon = document.querySelector('.icon');

    toggleButton.addEventListener('click', () => {
        nav.classList.toggle('collapse-nav');
    });

    icon.addEventListener('click', () => {
        if (nav.classList.contains('collapse-nav')) {
            nav.classList.remove('collapse-nav');
        }
    });

