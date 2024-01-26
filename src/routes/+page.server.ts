import type District from "$lib/District";
import User from "$lib/InfiniteCampus";
import { json } from "@sveltejs/kit";

const user = new User();

user.on("ready", async (user: User) => {
    console.log(`successfully logged in user ${user}`);
});

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
};

export async function load(): Promise<Load> {
    // TODO: log user in
    // await user.login("Fulton County", "GA", "userid", "password");

    return {
        districts: await fetchDistricts(),
    };
}

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();

        await user.login(data.get("district"), "GA", data.get("username"), data.get("password"));
        const courses = await user.getCourses(0);

        return courses;
    },
};
