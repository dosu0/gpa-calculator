<div class="page-container">
    <div class="wrap-content">
        <h1>GPA Calculator</h1>
        <nav>
            <a href="/">home</a>
            <a href="/about">about</a>
            <a href="/help">help</a>
            <a href="/settings">settings</a>
        </nav>

        <!-- The slot tag is where the rest of the page is inserted -->
        <slot />

        <footer>By Samuel and Robbie 2023-2024</footer>
    </div>
</div>

<style>
    h1 {
        font-size: 48px;
        line-height: 120%;
        text-align: center;
    }

    nav {
        text-align: center;
    }

    .page-container {
        position: relative;
        min-height: 100vh;
    }

    /* Set the the size of the footer */
    .wrap-content {
        padding-bottom: 3.5rem;
    }

    /* place the footer at the bottom of the page */
    footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 3.5rem;
    }
</style>
