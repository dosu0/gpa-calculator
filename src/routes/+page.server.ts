import type District from "./District";
import User from "$lib/InfiniteCampus";

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
    const user = new User();

    user.on("ready", async (user) => {
        console.log("ready");
        const terms = await user.getCourses();
    });

    // TODO: log user in
    // await user.login("Fulton County", "GA", "userid", "password");

    return {
        districts: await fetchDistricts(),
    };
}
