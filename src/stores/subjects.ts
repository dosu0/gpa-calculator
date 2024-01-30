import { browser } from "$app/environment";
import type { Writable } from "svelte/store";
import { writable, derived } from "svelte/store";

export interface Subject {
    id: number;
    weighted: boolean;
    name: string;
    grade: number;
}

export interface InitialSubject {
    name: string;
    grade: number;
}

// This extends the functionality of the writable store provided by svelte so we can use it to add and remove subjects
export interface SubjectStore extends Writable<Subject[]> {
    add: (name: string, grade: number) => void;
    remove: (subject: Subject) => void;
    clear: () => void;
}

export function isWeighted(name: string): boolean {
    const advancedIndicators = new RegExp(/advanced|ap|honors|ib/i);
    return advancedIndicators.test(name) || name.endsWith(" H") || name.endsWith(" h");
}

export function createSubjectList(initialSubjects: InitialSubject[]): SubjectStore {
    let id = 0;

    const subjects = initialSubjects.map((subject) => ({
        ...subject,
        weighted: isWeighted(subject.name),
        id: id++,
    }));

    const { subscribe, update, set } = writable(subjects);

    return {
        subscribe,
        set,
        update,
        add: (name: string, grade: number = 90) => {
            const subject = {
                id: id++,
                name,
                grade,
                weighted: isWeighted(name),
            };
            update(($subjects) => [...$subjects, subject]);
        },
        remove: (subject: Subject) => {
            update(($subjects) => $subjects.filter((s) => s !== subject));
        },
        clear: () => {
            update(() => []);
        },
    };
}

// loads subjects from local storage
function load() {
    // svelte renders pages on the server first which doesn't have a local storage
    // so we have to check if we're in the browser before we access it
    const subjectsString = browser && localStorage.getItem("subjects");

    // if subjects aren't stored in local storage or if they are empty
    // we return null
    if (!subjectsString || subjectsString === "[]") return null;

    return JSON.parse(subjectsString);
}

const defaultSubjects = [
    { name: "AP Calculus", grade: 98 },
    { name: "Spanish 3", grade: 98 },
    { name: "AP Computer Science A", grade: 100 },
    { name: "10th Lit", grade: 94 },
    { name: "AP Lang", grade: 80 },
];

// attempts to load subjects from the browser's local storage
// if it doesn't exist, then we load an example list of subjects
export const subjects = createSubjectList(load() || defaultSubjects);

// implement auto-save
// TODO: make a settings menu where you can toggle this feature
// the subscribe method on a store allows us to listen for when the subjects are updated
subjects.subscribe((value) => {
    // again svelte uses server side rendering, so we must make sure we are in the browser
    if (browser) localStorage.setItem("subjects", JSON.stringify(value));
});

// list of subjects for the dropdown menu
// from: https://www.fultonschools.org/site/handlers/filedownload.ashx?moduleinstanceid=58907&dataid=127455&FileName=Course%20Catalog%20for%20School%20Year%202023-2024.pdf
export const subjectList = [
    // ELA
    "9th Grade Lit/Comp",
    "9th Grade Lit/Comp Honors",
    "World Lit/Comp",
    "World Lit/Comp Honors",
    "AP Seminar",
    "11th American Lit/Comp",
    "11th American Lit/Comp Honors",
    "AP Language",
    "IB Language and Literature A",
    "British (English) Lit/Comp",
    "Advanced Composition Honors",
    "AP Literature & Composition",

    // Math
    "Algebra I",
    "Algebra I Honors",
    "Geometry",
    "Geometry Honors",
    "Algebra II",
    "Algebra II Honors",
    "Precalculus",
    "Precalculus Honors",
    "AP Calculus AB",
    "AP Calculus BC",
    "AP Statistics",
    "IB Math",

    // Science
    "Biology",
    "Biology Honors",
    "Earth Systems",
    "Physical Science",
    "Chemistry",
    "Chemistry Honors",
    "Physics",
    "Environmental Science",
    "AP Biology",
    "AP Environmental Science",
    "AP Chemistry",
    "AP Physics 1",
    "AP Physics 2",
    "AP Physics C",
    "IB Chemistry",
    "IB Physics",

    // Social Studies
    "American Government/Civics",
    "AP Government/Politics U.S.",
    "World History",
    "AP World History",
    "US History",
    "AP US History",
    "AP Macroeconomics",
    "AP Microeconomics",
    "AP Psychology",
    "AP Human Geography",

    // World Languages
    "Chinese 1",
    "Chinese 2",
    "Chinese 2 Honors",
    "Chinese 3",
    "Chinese 3 Honors",
    "Chinese 4 Honors",
    "AP Chinese",

    "French 1",
    "French 2",
    "French 2 Honors",
    "French 3",
    "French 3 Honors",
    "IB French",
    "AP French Language",

    "Spanish 1",
    "Spanish 2",
    "Spanish 2 Honors",
    "Spanish 3",
    "Spanish 3 Honors",
    "Spanish 4",
    "Spanish 5",
    "IB Spanish",
    "AP Spanish Language",

    // Electives / other
    "Health",
    "Personal Fitness",
    "Intro to Art",
    "Ceramics 1",
    "Ceramics 2",
    "Graphic Design 1",
    "Graphic Design 2",
    "Photography 1",
    "Photography 2",
    "Photography 3",
    "Photography 4",
    "AP Art History",
    "AP Computer Science Principles",
    "AP Computer Science A",
    "Essentials of Healthcare",
];

// whenever the subject list changes we compute the weighted and unweighted GPAs

export let weightedGPA = derived(subjects, ($subjects) => {
    if ($subjects.length === 0) return 0;

    let totalGrade = 0;
    for (let subject of $subjects) {
        totalGrade += subject.grade;
        if (subject.weighted) {
            totalGrade += 7;
        }
    }

    return totalGrade / $subjects.length;
});

export const unweightedGPA = derived(subjects, ($subjects) => {
    if ($subjects.length === 0) return 0;

    let totalGrade = 0;
    for (let subject of $subjects) {
        totalGrade += subject.grade;
    }

    return totalGrade / $subjects.length;
});

export const lowestGrade = derived(subjects, ($subjects) => {
    if ($subjects.length === 0) {
        return {
            grade: 0,
            name: "None",
        };
    }

    let min = $subjects[0].grade;
    let className = $subjects[0].name;

    for (let { name, grade } of $subjects) {
        if (grade < min) {
            min = grade;
            className = name;
        }
    }

    return {
        grade: min,
        name: className,
    };
});

export const highestGrade = derived(subjects, ($subjects) => {
    if ($subjects.length === 0) {
        return {
            grade: 0,
            name: "None",
        };
    }

    let max = $subjects[0].grade;
    let className = $subjects[0].name;

    for (let { name, grade } of $subjects) {
        if (grade > max) {
            max = grade;
            className = name;
        }
    }

    return {
        grade: max,
        name: className,
    };
});
