import { browser } from "$app/environment";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

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
    let advancedIndicators = new RegExp(/advanced|ap|honors/i);
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
