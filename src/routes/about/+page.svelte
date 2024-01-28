<h1>About</h1>

<h2>How it Works</h2>
<ul>
    <li>The app stores all of the users subjects in an array</li>
    <li>It finds the average of the user's unweighted and weighted grades</li>
    <li>Then it rounds these values to two decimal places and displays them out to the screen</li>
    <li style="color: green;">The GPA changes whenever...</li>
    <ul>
        <li>A grade is changed</li>
        <li>A new subject is entered</li>
        <li>A new subject is deleted</li>
    </ul>
</ul>

<h2>Storage</h2>

<ul>
    <li>All grades are stored on the user's browser</li>
    <li>When the app starts, it first checks if there are any grades in the browser storage</li>
    <li>If there are, then it loads them, otherwise it loads and example list of subjects</li>
</ul>

<h2>Tools Used</h2>
<ul>
    <li>
        Svelte: Svelte is a framework that allows us to write javscript that dynamically updates the
        HTML
    </li>
</ul>
