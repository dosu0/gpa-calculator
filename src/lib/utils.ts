export function gradeColor(grade: number): string {
    if (grade >= 90) {
        return "green";
    } else if (grade >= 80) {
        return "yellowgreen";
    } else if (grade >= 70) {
        return "orange";
    } else {
        return "red";
    }
}
