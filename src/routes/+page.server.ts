import type District from "$lib/District";
import User from "$lib/InfiniteCampus";
import type { Term, Course } from "$lib/InfiniteCampus";
import { v4 as uuid } from "uuid";

async function fetchDistricts() {
    const url = `https://mobile.infinitecampus.com/api/district/searchDistrict?query=county&state=GA`;
    const res = await fetch(url, {
        mode: "no-cors",
    });
    const json = await res.json();
    return json.data;
}

type Load = {
    districts: District[];
    courses: Term[];
};

const db: Map<string, Term[]> = new Map();

export async function load({ cookies }): Promise<Load> {
    // TODO: log user in
    // await user.login("Fulton County", "GA", "userid", "password");

    return {
        districts: await fetchDistricts(),
        courses: db.get(cookies.get("sessionid")),
    };
}

export const actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const sessionid = uuid();
        cookies.set("sessionid", sessionid, { path: "/" });

        const user = new User();
        await user.login(data.get("district"), "GA", data.get("username"), data.get("password"));
        const courses = await user.getCourses(0);

        db.set(sessionid, courses);

        return courses;
    },
};
