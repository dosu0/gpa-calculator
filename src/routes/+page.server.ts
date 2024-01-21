async function fetchDistricts() {
    const url = `https://mobile.infinitecampus.com/api/district/searchDistrict?query=county&state=GA`;
    const res = await fetch(url, {
        mode: "no-cors",
    });
    const json = await res.json();
    return json.data;
}

export async function load() {
    return {
        districts: await fetchDistricts(),
    };
}
