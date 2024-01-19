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

function isWeighted(name: string): boolean {
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
            console.log(subjects);
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
