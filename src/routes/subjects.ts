import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

export interface Subject {
    id: number;
    weighted: boolean;
    name: string;
    grade: number;
}

export interface SubjectStore extends Writable<Subject[]> {
    add: (name: string, grade: number) => void;
    remove: (subject: Subject) => void;
}

export function createSubjectList(initialSubjects: Subject[]): SubjectStore {
    let id = 0;

    const subjects = initialSubjects.map((subject) => ({
        ...subject,
        id: id++,
    }));

    const { subscribe, update, set } = writable(subjects);

    return {
        subscribe,
        set,
        update,
        add: (name: string, grade: number = 90, weighted: boolean = false) => {
            const subject = {
                id: id++,
                name,
                grade,
                weighted
            };
            console.log(subjects);
            update(($subjects) => [...$subjects, subject]);
        },
        remove: (subject: Subject) => {
            update(($subjects) => $subjects.filter((s) => s !== subject));
        },
    };
}
