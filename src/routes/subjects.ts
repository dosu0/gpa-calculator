import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

export interface Subject {
    name: string;
    grade: number;
}

export interface SubjectStore extends Writable<Subject[]> {
    add: (name: string, grade: number) => void;
    remove: (subject: Subject) => void;
}

export function createSubjectList(subjects: Subject[]): SubjectStore {
    const { subscribe, update, set } = writable(subjects);

    return {
        subscribe,
        set,
        update,
        add: (name: string, grade: number = 90) => {
            const subject = {
                name,
                grade,
            };

            update(($subjects) => [...$subjects, subject]);
        },
        remove: (subject: Subject) => {
            update(($subjects) => $subjects.filter((t) => t !== subject));
        },
    };
}
