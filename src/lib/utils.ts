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

export const states = [
    "AL", "AK", "AZ", "AR", "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY"];
