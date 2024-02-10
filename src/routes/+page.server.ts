import type District from "$lib/District";
import User from "$lib/InfiniteCampus";
import { fail } from "@sveltejs/kit";

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

        const district = data.get("district")?.toString();
        const username = data.get("username")?.toString();
        const password = data.get("password")?.toString();

        if (!district || !username || !password) {
            return fail(422, {
                district,
                username,
                missing: true,
            });
        }

        const user = new User();
        try {
            await user.login(district, "GA", username, password);
        } catch (err) {
            return fail(422, {
                district,
                username,
                invalid: true,
            });
        }

        const terms = await user.getTerms();

        return { success: true, data: terms };
    },
};
