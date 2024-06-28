import { browser } from "$app/environment";
import type { Writable } from "svelte/store";
import { writable, derived, get } from "svelte/store";
import { v4 as uuid } from "uuid";

import { settings } from "./settings";

export let currentSemester = writable(1);

export interface Subject {
    // Each subject is given an id, so that subjects with the same name can be differentiated
    id: string;
    // When weighted is true, 7 points are added during the weighted gpa calculation
    // Otherwise, nothing is added
    // This is used in Advanced, AP, IB, and Honors coures
    weighted: boolean;
    // The subject name
    name: string;
    // The current unweighted grade percent (without +7 points)
    // The 7 honors points are calculated after the fact
    grade: number;
    // A term can either be a semester (so 1 and 2)
    semester: number;
}

export interface InitialSubject {
    name: string;
    grade: number;
    semester: number;
}

// This extends the functionality of the writable store provided by svelte so we can use it to add and remove subjects
export interface SubjectStore extends Writable<Subject[][]> {
    add: (name: string, grade: number, semester: number) => void;
    remove: (subjectId: string) => void;
    clear: () => void;
}

// Given a subject name this method returns whether or not the subject
// should be given weighted points
export function isWeighted(name: string): boolean {
    // Subjects are marked as weighted whenever they contain the words
    // advanced, ap, honors, or ib
    // the "/i" at the end of the regular expression
    // makes the comparison case insensitive
    const advancedIndicators = new RegExp(/advanced|ap|honors|ib/i);

    // In addition, we check if the letter H is present at the end of
    // the subject name, as that is often used to indicate that a course
    // is weighted
    return advancedIndicators.test(name) || name.endsWith(" H") || name.endsWith(" h");
}

export function createSubjectList(initialSubjects: InitialSubject[]): SubjectStore {
    const subjects: Subject[][] = [[], []];

    initialSubjects.forEach((subject) => {
        subjects[subject.semester - 1].push({
            ...subject,
            weighted: isWeighted(subject.name),
            id: uuid(),
        });
    });

    const { subscribe, update, set } = writable<Subject[][]>(subjects);

    // The subscribe method on a store allows us to listen for when the subjects are updated
    subscribe((currentSubjects) => {
        // First we make sure we are in the browser, and that autosave is enabled
        // If we are, then convert the user's current subjects to a string
        // Then we save this to a variable called subjects in the localStorage

        if (browser && get(settings).autosave) {
            localStorage.setItem("subjects", JSON.stringify(currentSubjects));
            // TODO: create a dialog that shows that the subjects were autosaved
        }
    });

    return {
        subscribe,
        set,
        update,
        add: (name: string, grade: number = 90, semester: number = 1) => {
            const subject = {
                id: uuid(),
                name,
                grade,
                weighted: isWeighted(name),
                semester,
            };
            update(($subjects) => {
                if (semester == 1) {
                    return [[...$subjects[0], subject], $subjects[1]];
                } else {
                    return [$subjects[0], [...$subjects[1], subject]];
                }
            });
        },
        remove: (subjectId: string) => {
            update(($subjects) =>
                $subjects.map((subjects) => subjects.filter((subject) => subject.id !== subjectId)),
            );
        },
        clear: () => {
            if (get(currentSemester) == 3) {
                update(($s) => [[], []]);
            } else if (get(currentSemester) == 2) {
                update(($s) => [$s[0], []]);
            } else {
                update(($s) => [[], $s[1]]);
            }
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
    { name: "AP Precalculus", grade: 91, semester: 1 },
    { name: "Spanish 3", grade: 79, semester: 1 },
    { name: "AP Computer Science A", grade: 92, semester: 1 },
    { name: "World Lit/Comp", grade: 80, semester: 1 },
    { name: "Chemistry H", grade: 89, semester: 1 },

    { name: "AP Precalculus", grade: 80, semester: 2 },
    { name: "Spanish 3", grade: 54, semester: 2 },
    { name: "AP Computer Science A", grade: 88, semester: 2 },
    { name: "World Lit/Comp", grade: 83, semester: 2 },
    { name: "Chemistry H", grade: 75, semester: 2 },
];

// attempts to load subjects from the browser's local storage
// if it doesn't exist, then we load an example list of subjects
export const subjects = createSubjectList(/* load() || */ defaultSubjects);

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

// This creates a derived store, so that whenever the list of subjects changes,
// The gpa is recalculated
export let weightedGPA = derived([currentSemester, subjects], ([$currentSemester, $subjects]) => {
    let currentSubjects;
    if ($currentSemester == 3) currentSubjects = [...$subjects[0], ...$subjects[1]];
    else currentSubjects = $subjects[$currentSemester - 1];
    // If there are no subjects, we early return with 0
    if (currentSubjects.length === 0) return 0;

    let totalGrade = 0;

    for (const subject of currentSubjects) {
        // Here we add the grade to the total
        // If it doesn't exist (maybe the user didn't enter anything),
        // Then we replace the grade with 0
        totalGrade += subject.grade || 0;

        // Here we add 7 honors points if the subject is weighted
        // That is, an AP, IB, advanced, or honors course
        if (subject.weighted) {
            totalGrade += 7;
        }
    }

    // Then we return the average by dividing the total by the length
    return totalGrade / currentSubjects.length;
});

export const unweightedGPA = derived(
    [currentSemester, subjects],
    ([$currentSemester, $subjects]) => {
        let currentSubjects;
        if ($currentSemester == 3) currentSubjects = [...$subjects[0], ...$subjects[1]];
        else currentSubjects = $subjects[$currentSemester - 1];
        if (currentSubjects.length === 0) return 0;

        let totalGrade = 0;
        for (const subject of currentSubjects) {
            totalGrade += subject.grade || 0;
        }

        return totalGrade / currentSubjects.length;
    },
);

export const lowestGrade = derived([currentSemester, subjects], ([$currentSemester, $subjects]) => {
    let currentSubjects;
    if ($currentSemester == 3) currentSubjects = [...$subjects[0], ...$subjects[1]];
    else currentSubjects = $subjects[$currentSemester - 1];
    if ($subjects.length === 0) {
        return {
            grade: 0,
            name: "None",
        };
    }
    let min = currentSubjects[0].grade;
    let className = currentSubjects[0].name;

    for (const { name, grade } of currentSubjects) {
        if (grade < min) {
            min = grade;
            className = name;
        }
    }

    return {
        grade: min || 0,
        name: className,
    };
});

export const highestGrade = derived(
    [currentSemester, subjects],
    ([$currentSemester, $subjects]) => {
        let currentSubjects;
        if ($currentSemester == 3) currentSubjects = [...$subjects[0], ...$subjects[1]];
        else currentSubjects = $subjects[$currentSemester - 1];
        if (currentSubjects.length === 0) {
            return {
                grade: 0,
                name: "None",
            };
        }

        let max = currentSubjects[0].grade;
        let className = currentSubjects[0].name;

        for (const { name, grade } of currentSubjects) {
            if (grade > max) {
                max = grade;
                className = name;
            }
        }

        return {
            grade: max || 102,
            name: className,
        };
    },
);
