import { TidalApi } from "@luna/lib";

export const API_V2 = "https://api.tidal.com/v2";

export const request = async (url: string) => {
	const res = await fetch(url, {
		cache: "no-store",
		headers: await TidalApi.getAuthHeaders(),
	});
	if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${url})`);
	return res;
};

export const imageUrl = (uuid: string | null, size: number | "origin") => {
	if (!uuid) return null;
	const file = size === "origin" ? "origin" : `${size}x${size}`;
	return `https://resources.tidal.com/images/${uuid.replaceAll("-", "/")}/${file}.jpg`;
};
